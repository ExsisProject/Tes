(function () {
    define([
            "jquery",
            "underscore",
            "app",
            "works/collections/works_events",
            "works/libs/util"
        ],
        function (
            $,
            _,
            GO,
            CalendarEvents,
            WorksUtil
        ) {
            var aslice = Array.prototype.slice;
            var SOLR_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSS";

            var CalendarEventsPool = (function () {
                var constructor = function () {
                    // API 파라미터
                    this.appletId = -1;
                    this.timeMin = null;
                    this.timeMax = null;
                    this.maxResult = 1000;
                    this.isCached = false;

                    // 컬렉션 풀(삭제하기 쉽도록 hash로 관리)
                    this.__collections__ = {};
                    this.isFetching = false;
                    this.fetching = $.Deferred();
                };

                constructor.prototype = {
                    /**
                     pool에 등록된 컬렉션 내역 반환

                     @method getCollections
                     @return {Object} 저장된 캘렉션
                     */
                    getCollections: function () {
                        return this.__collections__;
                    },

                    setAppletId: function (appletId) {
                        this.appletId = appletId;
                        return this;
                    },

                    setFields: function (fields) {
                        this.fields = fields;
                        return this;
                    },

                    setTimeMin: function (newTime) {
                        this.timeMin = moment.utc(newTime).format(SOLR_FORMAT) + "Z";
                        return this;
                    },

                    setTimeMax: function (newTime) {
                        this.timeMax = moment.utc(newTime).format(SOLR_FORMAT) + "Z";
                        return this;
                    },

                    /**
                     캘린더 시간 경계 조건 설정

                     @method setBoundaryTime
                     @param {Object} min 시간
                     @param {Object} max 시간
                     @chainable
                     */
                    setBoundaryTime: function (min, max) {
                        this.setTimeMin(min);
                        this.setTimeMax(max);
                        this.isCached = false;
                        return this;
                    },

                    /**
                     캘린더 이벤트 조회 최대 갯수 설정

                     @method setMaxResult
                     @param {Integer} 최대 갯수
                     @chainable
                     */
                    setMaxResult: function (max) {
                        this.maxResult = max;
                        return this;
                    },

                    /**
                     해당 period 가 pool 에 들어있는지 조회

                     @method contains
                     @param {Integer} period ID
                     @return {boolean} 포함여부
                     */
                    contains: function (periodId) {
                        return _.has(this.__collections__, periodId);
                    },

                    /**
                     특정 period 의 이벤트 검색

                     @method findEvent
                     @param {Integer} period ID
                     @param {Integer} event ID
                     @return {Backbone.Model} 모델
                     */
                    findEvent: function (periodId, eventId) {
                        if (!this.contains(periodId)) throw new Error("period 가 풀에 존재하지 않습니다.");
                        return this.__collections__[periodId].get(eventId);
                    },

                    /**
                     특정 캘린더에 이벤트 추가

                     @method addEvent
                     @param {Backbone.Model} 캘린더 모델
                     @chainable
                     */
                    addEvent: function (model) {
                        var events = this.__collections__[model.get('periodId')];
                        events.add(model);
                        return this;
                    },

                    /**
                     컬렉션 풀에 추가

                     @method add
                     @param {integer} period ID
                     @chainable
                     */
                    add: function (periodId) {
                        var newCollection = new CalendarEvents();
                        newCollection.setPeriodId(periodId);
                        this.__collections__[periodId] = newCollection;
                        return this;
                    },

                    /**
                     * 풀에서 지워 버렸기 때문에 토글시 다시 fetch 해야 했던 비효율적인 기존 방식을, 플래그만 바꿔서 처리한다.
                     *
                     * @method show
                     * @param calendarId
                     */
                    show: function (periodId) {
                        this.__collections__[periodId].isHide = false;
                        return this;
                    },

                    /**
                     * 풀에서 지워 버렸기 때문에 토글시 다시 fetch 해야 했던 비효율적인 기존 방식을, 플래그만 바꿔서 처리한다.
                     *
                     * @method hide
                     * @param calendarId
                     */
                    hide: function (periodId) {
                        this.__collections__[periodId].isHide = true;
                        return this;
                    },

                    /**
                     컬렉션 풀에서 삭제

                     @method remove
                     @param {Object} collection CalendarEvents 컬렉션 객체 혹은 period ID
                     @chainable
                     */
                    remove: function (obj) {
                        var periodId = obj;
                        if (this._isInstanceOf(obj)) periodId = obj.getPeriodId();
                        delete this.__collections__[periodId];
                        return this;
                    },

                    /**
                     컬렉션 풀 전체 삭제

                     @method clear
                     @chainable
                     */
                    clear: function () {
                        this.__collections__ = null;
                        this.__collections__ = {};
                        return this;
                    },

                    /**
                     특정 캘린더 속성 업데이트

                     @method updateCalendar
                     @param {Integer} periodId
                     @chainable
                     */
                    updateCalendar: function (periodId) {
                        var args = aslice.call(arguments, 1);
                        if (this.contains(periodId)) {
                            this.__collections__[periodId].map(function (model, i) {
                                model.set.apply(model, args);
                            });
                        }

                        return this;
                    },

                    /**
                     * 변경된 event 의 docId를 갖는 event 의 startTime(와 endTime) 업데이트
                     * @param eventId
                     */
                    updateEvents: function (eventId) {
                        var periodId = eventId.split('_')[0];
                        var docId = eventId.split('_')[1];
                        var args = aslice.call(arguments, 1);

                        var event = this.findEvent(periodId, eventId);
                        var startCid = event.get('startCid');
                        var endCid = event.get('endCid');

                        _.map(this.__collections__, function (period) {
                            _.map(period.models, function (model) {
                                if (docId == model.get('docId')) {
                                    var arg = {};
                                    if (startCid == model.get('startCid')) {
                                        _.extend(arg, {startTime: args[0].startTime});
                                    }
                                    if (!_.isUndefined(endCid) && endCid == model.get('endCid')) {
                                        _.extend(arg, {endTime: args[0].endTime});
                                    }
                                    if (!_.isEmpty(arg)) {
                                        if (_.isUndefined(model.get('endCid'))) {
                                            _.extend(arg, {endTime: args[0].startTime});
                                        }
                                        model.set.apply(model, Array(arg));
                                    }
                                }
                            });
                        });
                    },

                    removeEvents: function (periodId) {
                        this.__collections__[periodId] = [];
                    },
                    /**
                     데이터 fetch
                     - 풀내에 있는 캘린더별 컬렉션의 데이터를 서버로 요청한다.
                     - 캐싱 정책은 각 컬렉션이 알아서 한다.
                     - 모든 컬렉션이 패치가 완료되면 deferred 객체를 통해 완료되었음을 외부로 알린다.

                     @method fetch
                     @return {jQuery.Deferred} jQuery.Deferred 객체
                     */
                    fetch: function (queryString) {
                        var self = this;
                        self.fetching = $.Deferred();
                        this.isFetching = true;

                        var periodIds = _.keys(self.__collections__);
                        _.each(periodIds, function (periodId, index) {
                            if (periodId === "") {
                                periodIds.splice(index, 1)
                            }
                        });

                        if (periodIds.length == 0) {
                            self.isFetching = false;
                            self.fetching.resolveWith(self, [self]);
                            return self.fetching;
                        }
                        $.ajax(GO.config("contextRoot") + "api/works/applet/" + this.appletId + "/calendarview/event", {
                            type: 'GET',
                            data: {
                                "q": _.isUndefined(queryString) ? "" : queryString,
                                "timeMin": this.timeMin,
                                "timeMax": this.timeMax,
                                "maxResult": this.maxResult,
                                "periodIds": periodIds
                            },
                            beforeSend: function () {
                                self.fetching.notify();
                            }
                        }).done(function (resp) {
                            if (!resp['__go_checksum__']) {
                                self.fetching.reject();
                                throw new Error('잘못된 응답입니다');
                            }

                            if (resp['code'] === '200') {
                                _.each(self.__collections__, function (collection) {
                                    collection.reset();
                                });

                                _.each(resp.data, function (tevent) {
                                    var collection = this.__collections__[tevent.periodId];

                                    var titleField = self.fields.findByCid(tevent.titleCid);
                                    if (_.isUndefined(tevent.title) && !_.isUndefined(titleField)) {
                                        var displayValue = titleField.getDisplayValue(new Backbone.Model(tevent.appletDocModel));
                                        tevent.title = GO.util.htmlToText(displayValue);
                                    }

                                    collection.add(WorksUtil.parseEventModel(tevent), {merge: true});
                                }, self);
                            }
                            self.isCached = true;

                            self.isFetching = false;
                            self.fetching.resolveWith(self, [self]);
                        }).fail(function () {
                            self.isFetching = false;
                            self.fetching.rejectWith(self, [self]);
                        });
                        return self.fetching;
                    },

                    /**
                     캘린더별로 분산된 이벤트 객체들을 병합하여 단일 이벤트 컬렉션으로 반환

                     @method merge
                     @return {Array} CalendarEvent 모델 배열
                     */
                    merge: function () {
                        var tmodels = [];
                        _.each(this.__collections__, function (collection) {
                            var events = collection.isHide ? [] : collection.toJSON();
                            tmodels = _.union(tmodels, events);
                        });
                        return _.values(tmodels);
                    },

                    /**
                     컬렉션 객체가 CalendarEvents 인스턴스인지 반환

                     @method _isInstanceOf
                     @param {Backbone.Collection} collection CalendarEvents 컬렉션 객체
                     @return {boolean} CalendarEvents 인스턴스 여부
                     @chainable
                     */
                    _isInstanceOf: function (collection) {
                        return (collection instanceof CalendarEvents)
                    }
                }

                return constructor;
            })();
            return CalendarEventsPool;
        });

}).call(this);
(function () {
    define([
            "jquery",
            "underscore",
            "backbone",
            "works/collections/works_events_pool",
            "jquery.go-preloader"
        ],
        function (
            $,
            _,
            Backbone,
            CalendarEventsPool
        ) {
            var iEventsPool = new CalendarEventsPool();
            var beforePool = new CalendarEventsPool();
            var afterPool = new CalendarEventsPool();

            return Backbone.View.extend({ // CalendarView
                tagName: "div",
                id: "calendar-viewport",
                eventsPool: iEventsPool,
                beforePool: beforePool,
                afterPool: afterPool,

                initialize: function (options) {
                    this.options = options || {};
                    this.appletId = this.options.appletId;
                    this._setAppletIdToPools();
                    this._registCalViewRef();
                },

                _setAppletIdToPools: function () {
                    this.eventsPool.setAppletId(this.appletId);
                    this.beforePool.setAppletId(this.appletId);
                    this.afterPool.setAppletId(this.appletId);
                },

                _setFieldToPools: function (fields) {
                    this.eventsPool.setFields(fields);
                    this.beforePool.setFields(fields);
                    this.afterPool.setFields(fields);
                },

                /**
                 캘린더뷰 레퍼런스 등록
                 - 타입변경 후에도 객체가 남아서 이벤트 버블링이 발생하는 것을 방지하도록 단일 레퍼런스로 관리

                 @method _registCalViewRef
                 @private
                 @chainable
                 */
                _registCalViewRef: function () {
                    var _vn = "GO_ref_calendar_view";
                    if (!this.name) {
                        throw new Error("name 속성이 필요합니다.");
                    }
                    if (!window[_vn]) {
                        window[_vn] = this;
                    }

                    if (window[_vn].name !== this.name) {
                        window[_vn].release();
                        window[_vn] = this;
                    }
                },

                /**
                 캘린더뷰 객체 해제
                 - 타입변경 후에도 객체가 남아서 이벤트 버블링이 발생하는 것을 방지

                 @method release
                 @chainable
                 */
                release: function () {
                    this.undelegateEvents();
                    this.remove();
                },

                addPeriod: function (periodId) {
                    this.beforePool.add(periodId);
                    this.eventsPool.add(periodId);
                    this.afterPool.add(periodId);
                    return this;
                },

                clearPeriods: function () {
                    this.beforePool.clear();
                    this.eventsPool.clear();
                    this.afterPool.clear();
                    return this;
                },

                /**
                 show:period 이벤트 콜백 함수

                 @method showPeriod
                 @param {Array} periodIds
                 @private
                 */
                showPeriod: function (periodIds) {
                    var deferred = $.Deferred();
                    var tperiodIds = _.isArray(periodIds) ? periodIds : [periodIds];
                    var isDirty = false;

                    _.each(tperiodIds, function (periodId, i) {
                        if (!this.eventsPool.contains(periodId)) {
                            this.eventsPool.isCached = false; // period 가 추가되면 캐시를 깨줘야 한다.
                            this.eventsPool.add(periodId);
                            this.beforePool.add(periodId);
                            this.afterPool.add(periodId);
                            isDirty = true;
                        } else {
                            this.eventsPool.show(periodId);
                        }
                    }, this);

                    if (isDirty) {
                        deferred.notify();
                    }
                    deferred.resolve();
                    return deferred;
                },

                /**
                 hide:period 이벤트 콜백 함수

                 @method _hidePeriod
                 @param {Array} periodIds
                 @private
                 */
                hidePeriod: function (periodIds) {
                    var deferred = $.Deferred(),
                        tperiodIds = _.isArray(periodIds) ? periodIds : [periodIds],
                        isDirty = false;

                    _.each(tperiodIds, function (periodId, i) {
                        if (this.eventsPool.contains(periodId)) {
                            this.eventsPool.remove(periodId);
                            this.beforePool.remove(periodId);
                            this.afterPool.remove(periodId);
                            isDirty = true;
                        }
                    }, this);

                    if (isDirty) {
                        deferred.notify(this);
                    }
                    deferred.resolve(this);
                    return deferred;
                },

                /**
                 cacheable 캘린더 이벤트 패치
                 기본적으로 앞뒤 한달 데이터를 캐싱한다.
                 빠르게 이동하는 경우와 같이 캐싱된 데이터가 없는경우 캐시를 기다려 준다.

                 @method getCalendarEvents
                 @param {Boolean} force (Option) 강제 패치 여부
                 @return {Array} 이벤트 배열
                 @private
                 */
                getCalendarEvents: function (startDt, endDt, force, queryString) {
                    var isContained = this._isContained(startDt, endDt);
                    var boundaryDate = this._getBoundaryDate();
                    var deferred = $.Deferred();

                    this._setFieldToPools(this.fields);
                    if (isContained && this.eventsPool.isCached && !force) { // 바운더리 내에서 이동
                        deferred.resolve(this.eventsPool);
                    } else if (this.eventsPool.isCached && !force) { // 바운더리를 벗어났지만 캐싱되어있는 경우
                        var newPool = this._makeNewPool();
                        if (this._outOfBoundary(startDt, endDt)) { // 오늘로 이동, 날짜 찍어서 이동
                            this._renewalPools(startDt, endDt, queryString);
                        } else if (this._isMoveForward(startDt)) {
                            this.afterPool = this.eventsPool;
                            this.eventsPool = this.beforePool;
                            this.beforePool = newPool;
                            this.beforePool.setBoundaryTime(boundaryDate.beforeStartDate, boundaryDate.beforeEndDate);
                            this.beforePool.fetch(queryString);
                        } else {
                            this.beforePool = this.eventsPool;
                            this.eventsPool = this.afterPool;
                            this.afterPool = newPool;
                            this.afterPool.setBoundaryTime(boundaryDate.afterStartDate, boundaryDate.afterEndDate);
                            this.afterPool.fetch(queryString);
                        }
                        if (this.eventsPool.isFetching) { // 빠르게 이동하는경우 캐시를 보장해주자
                            GO.util.preloader(this.eventsPool.fetching);
                            this.eventsPool.fetching.done($.proxy(function () {
                                deferred.resolve(this.eventsPool);
                            }, this));
                        } else {
                            deferred.resolve(this.eventsPool);
                        }

                    } else { // 초기 로딩
                        this.beforePool.setBoundaryTime(boundaryDate.beforeStartDate, boundaryDate.beforeEndDate);
                        this.afterPool.setBoundaryTime(boundaryDate.afterStartDate, boundaryDate.afterEndDate);
                        this.eventsPool.setBoundaryTime(startDt, endDt);

                        deferred = this.eventsPool.fetch(queryString);
                        this.beforePool.fetch(queryString);
                        this.afterPool.fetch(queryString);

                        GO.util.preloader(deferred);
                    }

                    return deferred;
                },

                _makeNewPool: function () {
                    var newPool = new CalendarEventsPool();
                    newPool.setAppletId(this.appletId);
                    newPool.setFields(this.fields);
                    _.each(this.eventsPool.getCollections(), function (collection) {
                        newPool.add(collection.periodId);
                    });

                    return newPool;
                },

                _outOfBoundary: function (startDt, endDt) {
                    var timeMin = moment(this.beforePool.timeMin);
                    var timeMax = moment(this.afterPool.timeMax);
                    return startDt.isBefore(timeMin) || endDt.isAfter(timeMax);
                },

                _renewalPools: function (startDt, endDt, queryString) {
                    this.beforePool.setBoundaryTime(startDt.clone().add('months', -1), endDt.clone().add('months', -1));
                    this.eventsPool.setBoundaryTime(startDt, endDt);
                    this.afterPool.setBoundaryTime(startDt.clone().add('months', 1), endDt.clone().add('months', 1));
                    this.beforePool.fetch(queryString);
                    this.eventsPool.fetch(queryString);
                    this.afterPool.fetch(queryString);
                },

                _isMoveForward: function (startDt) {
                    var timeMin = moment(this.eventsPool.timeMin);
                    return startDt - timeMin <= 0;
                },

                _isContained: function (startDt, endDt) {
                    if (!this.eventsPool.timeMin || !this.eventsPool.timeMax) return false;

                    var timeMin = moment(this.eventsPool.timeMin);
                    var timeMax = moment(this.eventsPool.timeMax);

                    return startDt - timeMin >= 0 && endDt - timeMax <= 0;
                }
            });
        });
}).call(this);

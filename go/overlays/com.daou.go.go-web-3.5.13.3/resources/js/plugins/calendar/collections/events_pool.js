(function() {

    define([
        "jquery", 
        "underscore", 
        "app", 
        "calendar/collections/calendars", 
        "calendar/collections/events", 
        "calendar/libs/util"
    ], 

    function(
        $, 
        _, 
        GO, 
        Calendars, 
        CalendarEvents, 
        CalUtil
    ) {
        var aslice = Array.prototype.slice;
        var FORMAT_ISO8601 = "YYYY-MM-DDTHH:mm:ss.SSSZ";

        /**
        캘린더 이벤트 컬렉션 풀(deprecated)
            - 캘린더별 컬렉션 관리
            - EnhancedEventsPool을 이용하세요.

        @class CalendarEventsPool
        */ 
        var CalendarEventsPool = (function() {
            /**
            생성자

            @class CalendarEventsPool
            @constructor
            */
            var constructor = function() {
                // API 파라미터
                this.timeMin = null;
                this.timeMax = null;
                this.maxResult = 1000;
                this.isMyCalSelected = false;
                this.isCached = false;
                this.includingAttendees = true;

                // 컬렉션 풀(삭제하기 쉽도록 hash로 관리)
                this.__collections__ = {};
                this.__updateStatus__ = {};
                this.isFetching = false;
                this.fetching = $.Deferred();
            };

            constructor.prototype = {
                /**
                pool에 등록된 컬렉션 내역 반환

                @method getCollections
                @return {Object} 저장된 캘렉션
                */                
                getCollections: function() {
                    return this.__collections__;
                }, 

                /**
                캘린더 이벤트 조회 시작 일자 설정

                @method setTimeMin
                @param {Object} newTime 시간
                @chainable
                */
                setTimeMin: function(newTime) {
                    this.timeMin = GO.util.toMoment(newTime).format(FORMAT_ISO8601);
                    return this;
                }, 

                /**
                캘린더 이벤트 조회 종료 일자 설정

                @method setTimeMax
                @param {Object} newTime 시간
                @chainable
                */
                setTimeMax: function(newTime) {
                    this.timeMax = GO.util.toMoment(newTime).format(FORMAT_ISO8601);
                    return this;
                }, 

                /**
                캘린더 시간 경계 조건 설정

                @method setBoundaryTime
                @param {Object} min 시간
                @param {Object} max 시간
                @chainable
                */
                setBoundaryTime: function(min, max) {
                    this.setTimeMin(min);
                    this.setTimeMax(max);
                    this.isCached = false;
                    return this;
                },

                /**
                 캘린더 일정 목록 응답에 참석자 데이터 포함 여부 (성능상의 이유로 특별한 경우에만 사용함)

                 @method setIncludingAttendees
                 @param {Boolean} 참석자 함께 응답 받을지 여부
                 @chainable
                 */
                setIncludingAttendees: function(including) {
                    this.includingAttendees = including;
                },

                /**
                캘린더 이벤트 조회 최대 갯수 설정

                @method setMaxResult
                @param {Integer} 최대 갯수
                @chainable
                */
                setMaxResult: function(max) {
                    this.maxResult = max;
                    return this;
                }, 

                /**
                해당 캘린더가 pool에 들어있는지 조회

                @method contains
                @param {Integer} 캘린더 ID
                @return {boolean} 포함여부
                */
                contains: function(calendarId) {
                    return _.has(this.__collections__, calendarId);
                }, 
                
                /**
                특정 캘린더의 이벤트 검색

                @method findEvent
                @param {Integer} 캘린더 ID
                @param {Integer} 일정 ID
                @return {Backbone.Model} 모델
                */
                findEvent: function(calendarId, eventId) {
                    if(!this.contains(calendarId)) throw new Error("캘린더가 풀에 존재하지 않습니다.");
                    return this.__collections__[calendarId].get(eventId);
                }, 
                
                /**
                특정 캘린더에 이벤트 추가

                @method addEvent
                @param {Backbone.Model} 캘린더 모델
                @chainable
                */
                addEvent: function(model) {
                    var events = this.__collections__[model.get('calendarId')];
                    events.add(model);
                    return this;
                },

                /**
                컬렉션 풀에 추가

                @method add
                @param {Backbone.Collection or integer} collection CalendarEvents 컬렉션 객체 혹은 캘린더 ID
                @chainable
                */
                add: function(obj) {
                    if(this._isInstanceOf(obj)) {
                        this.__collections__[collection.getCalendarId()] = obj; // 여기 에러날텐데.. 절대 안타는듯?
                    } else {
                        var newCollection = new CalendarEvents();
                        newCollection.setCalendarId(obj);
                        this.__collections__[obj] = newCollection;
                    }
                    
                    return this;
                }, 
                
                /**
                 * 풀에서 지워 버렸기 때문에 토글시 다시 fetch 해야 했던 비효율적인 기존 방식을, 플래그만 바꿔서 처리한다.
                 * 
                 * @method show
                 * @param calendarId
                 */
                show: function(calendarId) {
                    this.__collections__[calendarId].isHide = false;
                	
                	return this;
                },
                
                /**
                 * 풀에서 지워 버렸기 때문에 토글시 다시 fetch 해야 했던 비효율적인 기존 방식을, 플래그만 바꿔서 처리한다.
                 * 
                 * @method hide
                 * @param calendarId
                 */
                hide: function(calendarId) {
                    this.__collections__[calendarId].isHide = true;
                    return this;
                },

                /**
                컬렉션 풀에서 삭제

                @method remove
                @param {Object} collection CalendarEvents 컬렉션 객체 혹은 캘린더 ID
                @chainable
                */
                remove: function(obj) {
                    var calendarId = obj;
                    if(this._isInstanceOf(obj)) calendarId = obj.getCalendarId();
                    delete this.__collections__[calendarId];
                    return this;
                }, 
                
                /**
                컬렉션 풀 전체 삭제

                @method clear
                @chainable
                */
                clear: function() {
                    this.__collections__ = null;
                    this.__collections__ = {};
                    return this;
                }, 
                
                /**
                특정 캘린더 속성 업데이트

                @method updateCalendar
                @param {Integer} calendarId 캘린더 ID
                @chainable
                */
                updateCalendar: function( calendarId ) {
                    var args = aslice.call(arguments, 1);
                    if(this.contains(calendarId)) {
                        this.__collections__[calendarId].map(function(model, i) {
                            model.set.apply(model, args);
                        });
                    }
                    
                    return this;
                }, 
                
                /**
                 * 캘린더에 상관없이 동일한 ID의 이벤트를 찾아서 속성 업데이트
                 * @param eventId
                 */
                updateEvents: function(eventId) {
                	var args = aslice.call(arguments, 1);
                	_.map(this.__collections__, function(calendar, calendarId) {
                		var tevent = calendar.get(eventId);
                		
                		if(tevent) {
                			tevent.set.apply(tevent, args);
                		}
                	});
                }, 

                /**
                데이터 fetch
                    - 풀내에 있는 캘린더별 컬렉션의 데이터를 서버로 요청한다.
                    - 캐싱 정책은 각 컬렉션이 알아서 한다.
                    - 모든 컬렉션이 패치가 완료되면 deferred 객체를 통해 완료되었음을 외부로 알린다.

                @method fetch
                @return {jQuery.Deferred} jQuery.Deferred 객체
                */
                fetch: function() {
                    var self = this;

                    self.fetching = $.Deferred();
                    this.isFetching = true;
                    var calendarIds = _.keys(self.__collections__);
                    _.each(calendarIds, function(calendarId, index){
                        if(calendarId === ""){
                            calendarIds.splice(index, 1)
                        }
                    });
                    $.ajax( GO.config("contextRoot") + "api/calendar/event", {
                        type: 'GET',
                        data: {
                            "timeMin": this.timeMin,
                            "timeMax": this.timeMax,
                            "includingAttendees" : this.includingAttendees,
                            "calendarIds": calendarIds
                        },
                        beforeSend: function() {
                            self.fetching.notify();
                        }
                    }).done(function(resp) {
                        if(!resp['__go_checksum__']) {
                            self.fetching.reject();
                            throw new Error( '잘못된 응답입니다' );
                        }
                        
                        if( resp['code'] === '200' ) {
                            _.each( resp.data, function(tevent) {
                                var collection;
                                if(!this.contains(tevent.calendarId)) {
                                    collection = new CalendarEvents();
                                    collection.setCalendarId(tevent.calendarId);
                                    this.add(collection);
                                }
                                
                                collection = this.__collections__[tevent.calendarId]; 
                                collection.add(CalUtil.parseEventModel(tevent, Calendars.isCalendarManager()), {merge: true});
                                
                            }, self);
                        }
                        
                        self.isCached = true;

                        self.isFetching = false;
                        self.fetching.resolveWith(self, [self]);
                    }).fail(function() {
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
                merge: function() {
                    var tevents = {}, tmodels = [], 
                    	myCals = Calendars.getMyCalendars();
                    
                    _.each(this.__collections__, function(collection, calendarId) {
                    	var events = collection.isHide ? [] : collection.toJSON();
                        tmodels = _.union(tmodels, events);
                    });

                    _.each(tmodels, function(model, i) {
                    	var tmodelId = model.id;
                    	
                        if(_.has(tevents, tmodelId)) {
                            var tevent = tevents[tmodelId], 
                            	__merged__ = tevent["__merged__"] || { include_me: false }, 
                            	searchMyCals = _.filter(myCals, function(myCalModel) {
                            		// 주의: 병합대상 일정의 calendarId로도 조회해야 한다.
                            		return myCalModel.id ===  model.calendarId || myCalModel.id ===  tevent.calendarId;
                            	}), 
                            	isMyCalSelected = searchMyCals.length > 0;
                            		
                            if(isMyCalSelected) {
                                _.extend(__merged__, { 
                                    "include_me": _.where(model.attendees, { "id": GO.session("id") }).length > 0, 
                                    "color": searchMyCals[0].get("color")
                                });
                                
                                if(model.calendarOwnerId === GO.session("id")) {
                                	tevents[tmodelId].calendarId = model.calendarId;
                                }
                            }
                            tevents[tmodelId]["__merged__"] = __merged__;
                        } else {
                            tevents[model.id] = model;
                        }
                    });

                    return _.values(tevents);
                }, 
                
                setMyCalSelected: function(bool) {
                    this.isMyCalSelected = bool;
                }, 

                /**
                컬렉션 패치 성공후 실행 로직

                @method _afterFetchSuccess
                @param {Backbone.Collection} collection CalendarEvents 컬렉션 객체
                @param {jQuery.Deferred} jQuery.Deferred 객체
                */ 
                _afterFetchSuccess: function(collection, deferred) {
                    this.__updateStatus__[collection.getCalendarId()] = true;
                    if(_.without(this.__updateStatus__, true).length === 0) {
                        this.__updateStatus__ = {};
                        deferred.resolveWith(this, [this]);
                    }
                    return this;
                }, 

                /**
                컬렉션 객체가 CalendarEvents 인스턴스인지 반환

                @method _isInstanceOf
                @param {Backbone.Collection} collection CalendarEvents 컬렉션 객체
                @return {boolean} CalendarEvents 인스턴스 여부
                @chainable
                */ 
                _isInstanceOf: function(collection) {
                    return (collection instanceof CalendarEvents)
                }
            }

            return constructor;
        })();

//        CalendarEventsPool.__instance__ = null;

        /**
        CalendarEventsPool 인스턴스 생성 및 반환(싱글톤)

        @method create
        @return {boolean} CalendarEventsPool 인스턴스
        @static
        */        
//        CalendarEventsPool.create = function() {
//            if(this.__instance__ === null) this.__instance__ = new CalendarEventsPool();
//            return this.__instance__;
//        }

        /**
        CalendarEventsPool 인스턴스 반환(싱글톤)

        @method getInstance
        @return {boolean} CalendarEventsPool 인스턴스
        @static
        */  
//        CalendarEventsPool.getInstance = function() {
//            return this.create();
//        }
        
        /**
        Event 모델 파싱
            - CalendarEvent 모델의 parse 함수를 통해 모델의 권한을 추가로 부여하는데, parse 함수는 fetch와 save 함수에서만 동작
            - 따라서, pool을 이용할 경우에는 별도로 해주어야 함
            - 리팩토링 필요

        @method getInstance
        @return {boolean} CalendarEventsPool 인스턴스
        @static
        */ 
        function parseCalendarEvent(tevent) {
            var userid = GO.session("id"), 
                hasAuth = false;
        
            if(tevent.type === 'company' || tevent.type === 'holiday') {
                hasAuth = false;
            } else if(tevent.creator.id === userid) {
                hasAuth = true;
            } else if(_.where(tevent.attendees, {id: userid}).length > 0) {
                hasAuth = true;
            }
            
            // XSS 보안취약점 대응
            tevent.summary = GO.util.XSSFilter( tevent.summary );
            tevent.location = GO.util.XSSFilter( tevent.location );
            tevent.description = GO.util.XSSFilter( tevent.description );
            tevent.htmlLink = GO.util.XSSFilter( tevent.htmlLink );
            
            tevent.auth = hasAuth;
            return tevent;
        }

        return CalendarEventsPool;
    });

}).call(this);
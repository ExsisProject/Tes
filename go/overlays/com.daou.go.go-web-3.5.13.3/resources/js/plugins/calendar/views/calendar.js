;(function() {
    define([
        "jquery", 
        "underscore", 
        "backbone", 
        "calendar/collections/events_pool",
        "calendar/libs/util", 
        "jquery.go-preloader"
    ], 
    function(
        $, 
        _, 
        Backbone, 
        CalendarEventsPool,
        CalUtil
    ) { 
        var iEventsPool = new CalendarEventsPool();
        var beforePool = new CalendarEventsPool();
        var afterPool = new CalendarEventsPool();

        var CalendarView = Backbone.View.extend({
            tagName: "div", 
            id: "calendar-viewport", 
            eventsPool: iEventsPool, 
            beforePool: beforePool,
            afterPool: afterPool,

            initialize: function() {
                this._registCalViewRef();
            }, 
            
            /**
            캘린더뷰 객체 해제
                - 타입변경 후에도 객체가 남아서 이벤트 버블링이 발생하는 것을 방지

            @method release
            @chainable
            */
            release: function() {
                this.undelegateEvents();
                this.remove();
            }, 
            
            /**
            표시 달력 추가

            @method addCalendar
            @param {integer...} calendarId 캘린더 ID...
            @chainable
            */
            addCalendar: function(calendarId) {
            	this.beforePool.add(calendarId);
            	this.eventsPool.add(calendarId);
                this.afterPool.add(calendarId);
                return this;
            }, 
            
            clearCalendars: function() {
            	this.beforePool.clear();
            	this.eventsPool.clear();
            	this.afterPool.clear();
            	return this;
            },

            /**
            remove calendar selected from org slide 조직도에서 선택한 사용자의 일정을 보다가 사이드 캘린더를 선택한 경우의 선처리.
            
            @method beforeSideSelect
            @private
             */
            beforeSideSelect: function() {
                // TODO: cookieName 만드는 부분은 utility화가 필요함. side.js에서도 사용됨!
                var storeCalIds = CalUtil.getSavedSelectedCalendar().split(',');
                
                _.each(_.keys(this.eventsPool.getCollections()), function(poolCalId) {
                    if (!_.contains(storeCalIds, poolCalId)) {
                        this.eventsPool.remove(poolCalId);
                    }
                }, this);
            },

            hasAuth: function() {
                return true;
            }, 
            
            /**
            일자 변경(interface)

            @method changeDate
            */
            changeDate: function(date) {}, 

            /**
            달력 높이 재지정(interface)

            @method resize
            @param {integer} height 캘린더 높이(px)
            */
            resize: function(height) {}, 

            /**
            뷰 타입 변경

            @method changeType
            */
            changeType: function(type) {
                return this;
            }, 
            
            /**
            캘린더뷰 레퍼런스 등록
                - 타입변경 후에도 객체가 남아서 이벤트 버블링이 발생하는 것을 방지하도록 단일 레퍼런스로 관리

            @method _registCalViewRef
            @private
            @chainable
            */
            _registCalViewRef: function() {
                var _vn = "GO_ref_calendar_view";
                if(!this.name) { throw new Error("name 속성이 필요합니다."); }
                if(!window[_vn]) { window[_vn] = this; }
                
                if(window[_vn].name !== this.name) {
                    window[_vn].release();
                    window[_vn] = this;
                }
            }, 
            
            /**
            show:calendar 이벤트 콜백 함수

            @method _showCalendar
            @param {Array} calendars 캘린더 정보 배열
            @private
            */
            showCalendar: function( calendars ) { 
                var deferred = $.Deferred(), 
                    tcals = _.isArray(calendars) ? calendars : [calendars], 
                    isDirty = false;
                
                _.each( tcals, function( calendar, i ) {
                    if(!this.eventsPool.contains(calendar.id)) {
                        this.beforeSideSelect();
                        this.eventsPool.isCached = false; // 캘린더가 추가되면 캐시를 깨줘야 한다.
                        this.eventsPool.add(calendar.id);
                        this.beforePool.add(calendar.id);
                        this.afterPool.add(calendar.id);
                        isDirty = true;
                    } else {
                    	this.eventsPool.show(calendar.id);
                    }
                }, this);
                
                if(isDirty) {
                    deferred.notify();
                }
                
                deferred.resolve();
                
                return deferred;
            },

            /**
            hide:calendar 이벤트 콜백 함수

            @method _hideCalendar
            @param {Array} calendars 캘린더 정보 배열
            @private
            */
            hideCalendar: function( calendars ) {
                var deferred = $.Deferred(), 
                    tcals = _.isArray(calendars) ? calendars : [calendars],     
                    isDirty = false;
                
                _.each( tcals, function( calendar, i ) {
                    if(this.eventsPool.contains(calendar.id)) {
                        this.eventsPool.remove(calendar.id);
                        this.beforePool.remove(calendar.id);
                        this.afterPool.remove(calendar.id);
                        isDirty = true;
                    }
                }, this);
                
                if(isDirty) {
                    deferred.notify(this);
                }
                
                deferred.resolve(this);
                
                return deferred;
            },
            
            /**
             * 기존 getCalendarEvents method
             * @method getCalendarEvent
             * @param {Boolean} attendeesIncluding (Option) 참석자 목록도 함께 fetch할지 여부
             * @return {Array} 이벤트 배열
             * @private
             */
            getCalendarEvent: function(startDt, endDt, attendeesIncluding) {
            	this.eventsPool.setBoundaryTime(startDt, endDt);
                this.eventsPool.setIncludingAttendees(true);
                var deferred = this.eventsPool.fetch();
                this.eventsPool.setIncludingAttendees(false);

            	var preloader = $.goPreloader();

                deferred.progress(function() {
            		preloader.render();
            	});

                deferred.always(function() {
            		preloader.release();
            	});
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
            getCalendarEvents: function(startDt, endDt, force) {
                var isContained = this._isContained(startDt, endDt);
                var boundaryDate = this._getBoundaryDate();
                var deferred = $.Deferred();

                if (isContained && this.eventsPool.isCached && !force) { // 바운더리 내에서 이동
                    deferred.resolve(this.eventsPool);
                } else if (this.eventsPool.isCached && !force) { // 바운더리를 벗어났지만 캐싱되어있는 경우
                    var newPool = this._makeNewPool();
                    if (this._outOfBoundary(startDt, endDt)) { // 오늘로 이동, 날짜 찍어서 이동
                        this._renewalPools(startDt, endDt);
                    } else if (this._isMoveForward(startDt)) {
                		this.afterPool = this.eventsPool;
                		this.eventsPool = this.beforePool;
                		this.beforePool = newPool;
                		this.beforePool.setBoundaryTime(boundaryDate.beforeStartDate, boundaryDate.beforeEndDate);
                		this.beforePool.fetch();
                	} else {
                		this.beforePool = this.eventsPool;
                		this.eventsPool = this.afterPool;
                		this.afterPool = newPool;
                		this.afterPool.setBoundaryTime(boundaryDate.afterStartDate, boundaryDate.afterEndDate);
                		this.afterPool.fetch();
                	}
                    if (this.eventsPool.isFetching) { // 빠르게 이동하는경우 캐시를 보장해주자
                        GO.util.preloader(this.eventsPool.fetching);
                        this.eventsPool.fetching.done($.proxy(function() {
                            deferred.resolve(this.eventsPool);
                        }, this));
                    } else {
                        deferred.resolve(this.eventsPool);
                    }

                } else { // 초기 로딩
                	this.beforePool.setBoundaryTime(boundaryDate.beforeStartDate, boundaryDate.beforeEndDate);
                	this.afterPool.setBoundaryTime(boundaryDate.afterStartDate, boundaryDate.afterEndDate);
                	this.eventsPool.setBoundaryTime(startDt, endDt);
                	
                	deferred = this.eventsPool.fetch();
	                this.beforePool.fetch();
	                this.afterPool.fetch();

                    GO.util.preloader(deferred);
                }
                
                return deferred;
            },
            
            _makeNewPool: function() {
            	var newPool = new CalendarEventsPool();
        		_.each(this.eventsPool.getCollections(), function(collection) {
        			newPool.add(collection.calendarId);
        		});
        		
        		return newPool;
            },

            _outOfBoundary: function(startDt, endDt) {
                var timeMin = moment(this.beforePool.timeMin);
                var timeMax = moment(this.afterPool.timeMax);

                //console.log(startDt.isBefore(timeMin));
                //console.log(endDt.isAfter(timeMax));

                return startDt.isBefore(timeMin) || endDt.isAfter(timeMax);
            },

            _renewalPools: function(startDt, endDt) {
                this.beforePool.setBoundaryTime(startDt.clone().add('months', -1), endDt.clone().add('months', -1));
                this.eventsPool.setBoundaryTime(startDt, endDt);
                this.afterPool.setBoundaryTime(startDt.clone().add('months', 1), endDt.clone().add('months', 1));
                this.beforePool.fetch();
                this.eventsPool.fetch();
                this.afterPool.fetch();
            },
            
            _isMoveForward: function(startDt) {
                var timeMin = moment(this.eventsPool.timeMin );

                return startDt - timeMin <= 0 ;
            },

            /**
             * @param {moment} startDt, endDt
             */
            _isContained: function(startDt, endDt) {
                if (!this.eventsPool.timeMin || !this.eventsPool.timeMax) return false;

                var timeMin = moment(this.eventsPool.timeMin );
                var timeMax = moment(this.eventsPool.timeMax );

            	return startDt - timeMin >= 0 && endDt - timeMax <= 0;
            }
        });

        return CalendarView;
    });
}).call(this);

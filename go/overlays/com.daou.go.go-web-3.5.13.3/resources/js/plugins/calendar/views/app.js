;(function() {
    define([
        "underscore", 
        "backbone", 
        "amplify", 
        "app", 
        "moment", 
        "calendar/models/calendar_feed",
        "calendar/collections/calendar_feeds", 
        "calendar/collections/calendars", 
        "calendar/views/calbean", 
        "calendar/views/agenda", 
        "calendar/libs/util", 
        "hgn!calendar/templates/calendar",
        "i18n!calendar/nls/calendar", 
        "i18n!nls/commons", 

        "jquery.ui", 
        "jquery.calbean", 
        "jquery.go-popup"
    ], 
    function(
        _, 
        Backbone, 
        amplify, 
        GO, 
        moment,
        CalendarFeed, 
        CalendarFeeds, 
        Calendars, 
        CalbeanView, 
        AgendaView, 
        CalUtil,
        CalendarTpl, 
        calLang, 
        commonLang
    ) {    
        var EVENT_CHANGE_CAL_TYPE = GO.constant("calendar", "EVENT_CHANGE_CAL_TYPE");
            
        var 
            now = moment().lang(GO.config('locale')), 
            _slice = Array.prototype.slice, 
            __super__ = Backbone.View.prototype, 
            tvars = {
                "timezone": "", 
                "tab_daily": calLang["일간"],
                "tab_weekly": calLang["주간"],
                "tab_monthly": calLang["월간"],
                "tab_agenda": calLang["목록"], 
                "date_str": now.format(calLang["YYYY년 MM월"]), 
                "today": calLang["오늘"], 
                "print": commonLang["인쇄"],
                "text_prev" : commonLang["이전"],
                "text_next" : commonLang["다음"]
            };

        var CalendarAppView = Backbone.View.extend({
            tagName: "div", 
            className: "content_page", 

            /**
            캘린더뷰 객체

            @property calendarView
            @type {Backbone.View}
            */
            calendarView: null, 

            // 경계 조건들
            conditions: {}, 

            /**
            캘린더뷰 높이
				- CalbeanView에서만 사용
            @property height
            @type {Integer}
            */
            height: 0, 

            events: {
                "click .tab_nav > li": "_changeCalendarType", 
                "click .current_date .prev-btn": "_goToPrev", 
                "click .current_date .next-btn": "_goToNext", 
                "click .current_date .datepicker-btn": "_goToDate", 
                "click .current_date .today-btn": "_goToToday", 
                "click .ic_print": "_printPage"
            },

            /**
            초기화 함수

            @method initialize
            */
            initialize: function(options) {
            	this.options = options || {};
            	
                this.height = 0;
                this.calendarView = null;
                this.datastore = initDatastore();
                
                this.options = _.defaults(this.options, {
                    type: this.datastore.viewtype, 
                    date: GO.util.toMoment(this.datastore.basedate).toDate()
                });
                
                
            	this.__calendarIds__ = {};
                this.conditions = { "date": this.options.date, "startday": 0, "type": this.options.type };
                
                if( this.datastore.viewtype !== this.conditions.type ) {
                    this._saveViewTypeToStore( this.conditions.type );
                }
                
                this.$el.empty().append(CalendarTpl(tvars));
                this.setDateIndicator();
                this._createCalendarView();
                this._initTab();
                
                $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
                this._initDatepicker();
            }, 

            /**
            render
            @param {Integer} calId 특정 캘린더만 렌더링 할 경우(optional)
            @method render
            */
            render: function(calId) {
                this.calendarView.render(calId, { height: this.getHeight() });
                this.$el.append(this.calendarView.el);
                
                return this.el;
            }, 

            /**
            Event Delegate

            @method delegateEvents
            @param {Array} events 이벤트 배열(Optional)
            */
            delegateEvents: function(events) {
                __super__.delegateEvents.call(this, events);
                this._bindTabEvent();
            }, 

            /**
            Event Undelegate

            @method undelegateEvents
            */
            undelegateEvents: function() {
                __super__.undelegateEvents.call(this);
                this.getTabElement().off(EVENT_CHANGE_CAL_TYPE);
            }, 

            /**
            resize 이벤트 콜백
                - 컨트롤러에서 resize 이벤트가 발생하면 이 함수가 작동.
                - CalbeanView만 해당

            @method resize
            */
            resize: function(height) {
                if(this._isAgendaView()) return;
                if(typeof height !== 'undefined') this.setHeight(height);
                this.$el.height(this.height);
                
                this.calendarView.resize(this.height);
            }, 
            
            setHeight: function(height) {
                var toolbarMargin = 24;
                this.height = height - this.getToolbarView().outerHeight() + toolbarMargin;
            }, 
            
            getHeight: function() {
                return this.height;
            }, 

            /**
            기준시간 표시부분 설정

            @method setDateIndicator
            @chainable
            */
            setDateIndicator: function() {
                var fYYYYMMDD = "YYYY.MM.DD", 
                    basedate = GO.util.toMoment(this.conditions.date), 
                    dateFormat = basedate.format(fYYYYMMDD), 
                    monthFormat = basedate.format("YYYY.MM"), 
                    startDateOfWeek = GO.util.toMoment(GO.util.getStartDateOfWeek(basedate, this.conditions.startday)), 
                    endDateOfWeek = GO.util.toMoment(GO.util.getEndDateOfWeek(basedate, this.conditions.startday));

                var datestr = {
                    "monthly": monthFormat, 
                    "weekly": [startDateOfWeek.format(fYYYYMMDD), endDateOfWeek.format(fYYYYMMDD)].join(" ~ "), 
                    "daily": dateFormat, 
                    "agenda": dateFormat
                }[this.getCalendarType()];
                this.getToolbarView().find("#date-indicator").empty().html(datestr);
                return this;
            }, 

            /**
            캘린더 타입 반환

            @method getCalendarType
            @return {String} 캘린더 반환
            */
            getCalendarType: function() {
                return this.conditions.type;
            },

            /**
            캘린더 타입 설정

            @method setCalendarType
            @chainable
            */
            setCalendarType: function(newType) {
            	console.log("[CalendarAppView#setCalendarType] loading...");
            	this.conditions.type = newType;
            	this._saveViewTypeToStore(newType);
            	this.resetCalendarView();
                return this;
            }, 

            /**
            캘린더 뷰 리셋

            @method resetCalendarView
            @chainable
            */
            resetCalendarView: function() {
            	if(this.calendarView.type !== this._getCalendarViewType()) {
            		this.calendarView.remove();
	        		this.calendarView = null;
	        		this._createCalendarView();
	        		this.render();
	        		this.resize();
            	} else {
            		this.calendarView.changeType(this.getCalendarType());
            	}
        		
        		return this;
            }, 

            /**
            캘린더 툴바 엘리먼트 반환

            @method getToolbarView
            @return {Object} 캘린더 툴바 엘리먼트
            */
            getToolbarView: function() {
                return this.$el.find('.tool_bar');
            }, 

            /**
            캘린더 탭 엘리먼트 반환

            @method getTabElement
            @return {Object} 캘린더 탭 엘리먼트
            */
            getTabElement: function() {
                return this.$el.find('.tab_nav');
            }, 

            /**
            캘린더 추가

            @method addCalendars
            @return {Integer...} 캘린더 ID
            @chainable
            */
            addCalendars: function() {
                var calendarIds = _slice.call(arguments);
                _.each(calendarIds, function(calendarId, i) {
                    this.calendarView.addCalendar(parseInt(calendarId));
                }, this);
                return this;
            }, 
            
            clearCalendars: function() {
            	this.calendarView.clearCalendars();
            },

            /**
            사용자 ID를 기준으로 캘린더 추가

            @method addCalendarsByUserId
            @params {Integer} userid 사용자 ID
            @return {Array} 사용자 캘린더 배열
            */
            addCalendarsByUserId: function(userid) {
                var self = this, 
                    calendars = new Calendars();
                                
                calendars.setUserId(userid).fetch({
                    async: false, 
                    success: function(collection) {
                        var mycal = collection.getMyCalendars()[0], 
                            feeds = CalendarFeeds.getInstance(), 
                            calendarId = mycal.id;
                        
                        if(feeds.isFollowing(calendarId) || !mycal.isPrivate()) {
                            self.addCalendars.apply(self, _.pluck(collection.getUserCalendars(), 'id'));
                        } else {
                            $.goPopup({
                                title : calLang["일정을 열람할 수 없습니다"], 
                                message : calLang["관심 캘린더가 되면 일정을 열람할 수 있습니다"],
                                buttons : [{
                                    'btext' : calLang["관심동료 신청"],
                                    'btype' : 'confirm',
                                    'callback' : function() {
                                        var url = GO.config("contextRoot") + "api/calendar/feed?calendarId=" + calendarId; 
                                        Backbone.ajax(url, {type: "POST"}).done(function(resp) {
                                            GO.router.navigate("calendar", {trigger: true, replace: true});
                                        }).fail(function() {
                                            GO.router.navigate("calendar", {trigger: true});
                                        });
                                    }
                                }, {
                                    'btext' : commonLang["취소"],
                                    'btype' : 'normal', 
                                    'callback': function() {
                                        GO.router.navigate("calendar", {trigger: true, pushState: true});
                                    }
                                }]
                            });
                        }
                    }
                });
                
                return calendars;
            }, 

            _showTagLayer: function() {
                var checkedEl = $( '#side input[name=calendar_id]:checked' ), 
                    tagLayer;
                
                tagLayer = createCalendarTagLayer( checkedEl );
                tagLayer.appendTo($('header.content_top'));
                tagLayer.show();
            }, 
            
            /**
            탭 초기화 함수

            @method _initTab
            @private
            */
            _initTab: function() {
                this.getTabElement().find('li[data-type="' + this.conditions.type + '"]').addClass("on");
                return this;
            }, 
            
            /**
            조건별 캘린더뷰 객체 생성
                - 목록형일 경우 AgendaView를 그외는 CalbeanView를 생성

            @method _createCalendarView
            @private
            */
            _createCalendarView: function() {
            	this.calendarView = this._isAgendaView() ? new AgendaView({"date": this.conditions.date}) : new CalbeanView(this.conditions);
            	return this;
            }, 

            /**
            캘린더 뷰 타입 반환

            @method _getCalendarViewType
            @return {String} 뷰타입
            */
            _getCalendarViewType: function() {
            	return (this._isAgendaView() ? "agenda" : "calbean");
            }, 

            /**
            현재뷰 타입이 agenda 뷰 인지 반환

            @method _isAgendaView
            @private
            @chainable
            */
            _isAgendaView: function() {
                return !!(this.conditions.type === 'agenda');
            }, 

            /**
            이전 기준 시간대로 변경

            @method _goToPrev
            @private
            @chainable
            */
            _goToPrev: function(e) {
                this._goToOffset(-1);
                return this;
            }, 

            /**
            다음 기준 시간대로 변경

            @method _goToNext
            @private
            @chainable            
            */
            _goToNext: function(e) {
                this._goToOffset(1);
                return this;
            }, 

            /**
            기준 시간 offset만큼 이동

            @method _goToOffset
            @private
            @chainable            
            */
            _goToOffset: function(offset) {
                var category = {"monthly": "months", "weekly": "weeks", "daily": "days", "agenda": "days"}[this.getCalendarType()], 
                    basedate = GO.util.toMoment(this.conditions.date).clone().add(category, offset);
                this._changeDate(basedate);
                return this;
            }, 
            
            _goToDate: function(e) {
            	this.$el.find("#calendarDatepicker").trigger("focus");
            },
            
            _initDatepicker : function() {
            	var self = this;
            	var datepicker = this.$el.find("#calendarDatepicker").datepicker({
            		changeMonth: true,
		            changeYear : true, 
		            yearSuffix: "",
            		onSelect : function(selected) {
            			self._changeDate(selected);
            		}
            	});
            	
            	this.$el.find("#calendarDatepicker").datepicker("setDate", this.conditions.date);
            },
            

            /**
            오늘 일자로 이동

            @method _goToToday
            @private
            @chainable            
            */
            _goToToday: function(e) {
                this._changeDate();
                return this;
            },

            /**
            특정 일자로 이동

            @method _goToToday
            @param {Date or String} 일자
            @private
            @chainable            
            */
            _changeDate: function(date) {
                var type = this.conditions.type, 
                    basedate = this.conditions.date = GO.util.toMoment(date || new Date()).toDate(), 
                    targetUrl = ["calendar", type, this._getDateForType(type)].join("/");
                
                GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
                
                this.calendarView.changeDate(basedate);
                this._saveBasedateToStore( basedate );
                this.setDateIndicator();
                
                // url을 변경한다
                GO.router.navigate( targetUrl, { trigger: false, pushState: true } );
                
                GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                return this;
            }, 

            /**
            탭 변경 이벤트 처리

            @method _bindTabEvent
            @private
            @chainable            
            */
            _bindTabEvent: function() {
                var tab = this.getTabElement();
                $(this.getTabElement()).find('li').each(function(i, me) {
                    $(tab).on(EVENT_CHANGE_CAL_TYPE, function(tab, type){
                        if($(me).attr('data-type') === type) {
                            $(me).addClass('on');
                        } else {
                            $(me).removeClass('on');
                        }
                    });
                });

            	return this;
            }, 

            /**
            캘린더 타입 변경
                - TODO: 리팩토링 필요        
            @method _changeCalendarType
            @private
            @chainable            
            */
            _changeCalendarType: function(e) {
                var $me = $(e.currentTarget).is('span') ? $(e.currentTarget).parent() : $(e.currentTarget), 
                    type = $me.attr('data-type') || 'monthly', 
                    navOpts = {trigger: true, pushState: true}, 
                    targetUrl = '';
                
                targetUrl = ["calendar", type, this._getDateForType(type)].join("/");
                
                if(this.conditions.type !== 'agenda' && type !== 'agenda') {
                    this.setCalendarType(type);
                    this.setDateIndicator();
                    this.getTabElement().trigger(EVENT_CHANGE_CAL_TYPE, [type]);
                    navOpts.trigger = false;
                }
                
                GO.router.navigate( targetUrl, navOpts );
                
                return this;
            }, 
            
            /**
            URL용 Date 문자열 만들기

            @method _getDateForType
            @private
            @return {String} 문자열            
            */
            _getDateForType: function( type ) {
                return CalUtil.getDateForUrl( type, this.conditions.date );
            }, 
            
            /**
            캘린더 타입을 저장

            @method _saveViewTypeToStore
            @private
            @chainable            
            */
            _saveViewTypeToStore: function( type ) {
                CalUtil.saveCalendarType( type );
            }, 
            
            /**
            캘린더 기본일자를 저장

            @method _saveBasedateToStore
            @private
            @chainable            
            */
            _saveBasedateToStore: function( basedate ) {
                CalUtil.saveBasedate( basedate );
            }, 
            
            /**
            페이지 프린트

            @method _printPage
            @private
            @chainable            
            */
            _printPage: function() {
                window.print();
            }
        });
        
        function initDatastore() {
            var storePrefix = GO.session("id") + '-calendar', 
                configs = {
                    "viewtype": { "storetype": "local", "default": "monthly" }, 
                    "basedate": { "storetype": "session", "default": GO.util.toMoment(new Date).format('YYYY-MM-DD') }
                }, result = {};
            
            _.each(configs, function(config, key) {
                var storeKey = storePrefix + '-' + key, 
                	store = GO.util.store, 
                    savedVal = store.get(storeKey);
                    
                if(!savedVal) {
                	store.set(storeKey, config['default'], {type: config.storetype});
                    result[key] = config['default'];
                } else {
                    result[key] = savedVal;
                }
            });
            
            return result;
        }

        return CalendarAppView;
    });
}).call(this);

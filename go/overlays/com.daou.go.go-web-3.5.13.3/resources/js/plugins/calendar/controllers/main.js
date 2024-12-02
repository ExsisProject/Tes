(function() {

    define([
        "underscore", 
        "app", 
        "calendar/libs/util", 
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar"
    ], 

    function(
        _, 
        GO, 
        CalUtil, 
        commonLang, 
        calLang
    ) {
        var CalendarController = (function() {
            // Constructor
            var Controller = function() {
            };

            Controller.prototype = {
                index: function() {
                    return renderCalendarApp();
                }, 
                
                list: function( type, year, month, day ) {
                    // IE8에서 Date 객체에 문자열형태의 일자를 이용할때 08/11/2012 13:00:00 포맷만 가능하다.
                    return renderCalendarApp({ 'type': type, 'date': new Date([month, day, year].join('/')) });
                }, 
                
                usercal: function(userid) {
                    return renderCalendarApp({ userid: userid });
                }, 
                
                daily: function(year, month, day) {
                    return this.list( 'daily', year, month, day );
                }, 
                
                weekly: function(year, month, day) {
                    return this.list( 'weekly', year, month, day );
                }, 
                
                monthly: function(year, month) {
                    var savedDate = CalUtil.getSavedBasedate(), 
                        inputDate = GO.util.toMoment(new Date(+year, (+month) - 1, 1)), 
                        day;
                    
                    if(!!savedDate) {
                        var mdate = GO.util.toMoment(savedDate), 
                            endMonth = inputDate.endOf('month');

                        day = '' + Math.min(mdate.date(), endMonth.date());
                    } else {
                        var now = GO.util.now();
                        
                        if(now.clone().startOf('month').valueOf() === inputDate.startOf('month').valueOf()) {
                            day = now.format('DD');
                        } else {
                            day = '01';
                        }
                    }
                    
                    return this.list( 'monthly', year, month, day );
                }, 
                
                agenda: function(year, month, day) {
                    return this.list( 'agenda', year, month, day );
                }, 

                regist: function(date) {
                    require([
                        "calendar/views/layouts/default", 
                        "calendar/views/regist"
                    ], 
                    function(
                        CalendarDefaultLayout, 
                        CalendarRegistView
                    ) {
                        var calDefaultLayout = CalendarDefaultLayout.create(),  
                            calendarRegistView = new CalendarRegistView(date ? {"startDate": date} : {});

                        calDefaultLayout.render().done(function(layout) {
                            var content = layout.getContentElement(); 
                            layout.setTitle(calLang["일정 등록"]);
                            layout.setContent( calendarRegistView );
                            calendarRegistView.render();
                        });
                    });
                }, 

                event: function(calendarId, eventId) {
                    require([
                        "calendar/views/layouts/default", 
                        "calendar/views/event_detail"
                    ], 
                    function(
                        CalendarDefaultLayout, 
                        EventDetailView
                    ) {
                        var calDefaultLayout = CalendarDefaultLayout.create(),  
                            eventDetailView = new EventDetailView({"calendarId": calendarId, "eventId": eventId});

                        calDefaultLayout.render().done(function(layout) {
                            var content = layout.getContentElement();
                            layout.setTitle(calLang["일정 상세"]);
                            layout.setContent( eventDetailView );
                            eventDetailView.render();
                        });
                    });
                },

                copy: function(calendarId, eventId) {
                    require([
                            "calendar/views/layouts/default",
                            "calendar/views/regist"
                        ],
                        function(
                            CalendarDefaultLayout,
                            CalendarRegistView
                        ) {
                            var calDefaultLayout = CalendarDefaultLayout.create(),
                                copiedEventRegistView = new CalendarRegistView({"calendarId": calendarId, "eventId": eventId, "isCopied": true});

                            calDefaultLayout.render().done(function(layout) {
                                layout.setTitle(calLang["일정 등록"]);
                                layout.setContent( copiedEventRegistView );
                                copiedEventRegistView.render();
                            });
                        });
                },

                preference: function(calendarId, tabtype) {
                    tabtype = tabtype || 'config';
                    
                    require([
                        "calendar/views/layouts/default", 
                        "calendar/views/preference"
                    ], 
                    function(
                        CalendarDefaultLayout, 
                        PreferenceView
                    ) {
                        var calDefaultLayout = CalendarDefaultLayout.create(),  
                            preferenceView;
                        
                        calDefaultLayout.render().done(function(layout) {
                            preferenceView = new PreferenceView({"calendars": layout.calendars, "feeds": layout.feeds, "type" : tabtype});
                            layout.setTitle(calLang["내 캘린더 관리"]);
                            layout.setContent( preferenceView );
                            
                            preferenceView.render();
                        });
                    });
                }, 
                
                follows: function(calendarId) {
                    return this.preference(calendarId, "follows");
                }, 

                search: function() {
                    require([
                        "calendar/views/layouts/default", 
                        "calendar/views/search_result"
                    ], 
                    function(
                        CalendarDefaultLayout, 
                        SearchResultView
                    ) {
                        var calDefaultLayout = CalendarDefaultLayout.create();

                        calDefaultLayout.render().done(function(layout) {
                            var content = layout.getContentElement(), 
                            	searchResultView = new SearchResultView();
                            layout.setTitle('<span class="txt">' + commonLang["검색결과"] + '</span><span class="num"></span>');
                            $(content).append(searchResultView.el);
                            searchResultView.fetchResult();
                        });
                    });
                }
            };
            
            function renderCalendarApp(options) {
                require([
                    "calendar/views/layouts/fixed_size",
                    "calendar/views/app"
                ], 
                function(
                    CalendarFixedSizeLayout,
                    CalendarAppView 
                ) {
                    options = options || {};
                    var fixedSizeLayout = CalendarFixedSizeLayout.create();
                    fixedSizeLayout.render().then(function(layout) {
                    	var calendarAppView = new CalendarAppView(options);
                        calendarAppView.clearCalendars.apply(calendarAppView);
                        layout.setContent( calendarAppView );
                        layout.resizeContentHeight();
                        
                        if( options.userid ) {
                            var userid = parseInt(options.userid), 
                                userCalendars = calendarAppView.addCalendarsByUserId(userid), 
                                defalutCalendar = userCalendars.getMyCalendars()[0], 
                                calendarName;
                            
                            // 내일정이면 캘린더 기본 화면으로 보낸다(히스토리는 대체함)
                            if( userid === GO.session("id") ) {
                                GO.router.navigate("calendar", {trigger: true, replace: true});
                                return;
                            }
                            
                            calendarName = defalutCalendar.getOwnerName();
                            
                            layout.sideView.uncheckAll();
                            layout.setCaledarTags({ "id": defalutCalendar.id, "type": "user", "name": calendarName, "userid": userid });
                        } else {
                            var selectedCal = CalUtil.getSavedSelectedCalendar(), 
                            checkedCalIds = !!selectedCal ? selectedCal.split(',') : layout.sideView.getCheckedCalendarIds();
                            calendarAppView.addCalendars.apply(calendarAppView, checkedCalIds);
                            layout.setCaledarTags();
                        }
                        
                        calendarAppView.setHeight(layout.getContentPageHeight());
                        calendarAppView.render();
                        layout.on("resize:content", function(newHeight) {
                            calendarAppView.resize(newHeight);
                        }); 
                    });
                });
                
            }
            
            return Controller;
        })();

        return new CalendarController;
    });
}).call(this);
(function() {
    define([
        "jquery", 
        "hogan", 
        "app", 
        "calendar/collections/calendars", 
        "calendar/collections/calendar_feeds", 
        "views/layouts/default", 
        "calendar/views/content_top", 
        "calendar/views/side", 
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar", 
        
        "jquery.go-popup"
    ], 

    function(
        $, 
        Hogan, 
        GO, 
        Calendars, 
        CalendarFeeds, 
        DefaultLayout, 
        CalendarTopView, 
        SideView, 
        commonLang, 
        calLang
    ) {
        var __super__ = DefaultLayout.prototype, 
        	userId = GO.session('id');

        /**
        캘린더 기본 레이아웃 뷰
        @class CalendarDefaultLayout
        @constructor
        @extends DefaultLayout
        */
        var CalendarDefaultLayout = DefaultLayout.extend({
            initialize: function() {            	
                console.log("CalendarDefaultLayout#initialize");
                __super__.initialize.apply(this, arguments);
            },
            
            /**
            캘린더 레이아웃 렌더링
            
            @method render
            @return {Object}
            @public
            */
            render: function() {
                var self = this, 
                    defer = $.Deferred();

                fetchCalendars(userId).then(function(calendars) {
                	self.calendars = calendars;
                	return fetchFeeds(userId);
                }).then(function(feeds) {
                	self.feeds = feeds;
                    self.appName = 'calendar';
                    return __super__.render.apply(self);
                }).then(function() {
                	this.contentTopView = new CalendarTopView();
                    // 구독목록 렌더링
                    self._renderSide();
                    // 타이틀 렌더링
                    self._renderContentTop(); 
                    defer.resolveWith(self, [self]);
                });

                return defer;
            },

            /**
            페이지 타이틀 설정
            @method setTitle
            @params {Object} 타이틀 문자열 혹은 HTML*Element 타입의 객체
            @return {Object} CalendarDefaultLayout 인스턴스 객체
            */
            setTitle: function(html) {
                if(this.contentTopView === null) throw new Error("contentTopView 객체가 필요합니다.");
                this.contentTopView.setTitle(html);
                return this;
            }, 
            
            /**
            캘린더 서비스의 컨텐츠 타이틀 영역 렌더링
            @method _renderContentTop
            @return {Object} CalendarDefaultLayout 인스턴스 객체
            @private
            */
            _renderContentTop: function() {
                this.contentTopView.render();
                this.getContentElement().empty().append(this.contentTopView.el);
                return this;
            }, 

            /**
            캘린더 서비스의 사이드 메뉴 렌더링
            @method _renderSide
            @return {Object} CalendarDefaultLayout 인스턴스 객체
            @private
            */
            _renderSide: function() {
                console.log("[CalendarDefaultLayout#_renderSide] called.");                
                this.sideView = new SideView({
                	"el": this.getSideElement(), 
                	"calendars": this.calendars, 
                	"feeds": this.feeds
            	});
                this.sideView.render();

                return this;
            }, 

            /**
            컨텐츠 영역 엘리먼트 반환

            @method getContentElement
            @return {Object} 컨텐츠 영역 엘리먼트
            */
            getContentElement: function() {
                return this.$el.find('.go_content');
            }, 

            /**
            컨텐츠 타이틀영역 엘리먼트 반화

            @method getContentElement
            @return {Object} 컨텐츠 영역 엘리먼트
            */
            getContentTopElement: function() {
                return this.contentTopView.$el;
            }, 

            /**
            컨텐츠 사이드영역 엘리먼트 반환

            @method getContentElement
            @return {Object} 컨텐츠 사이드영역 엘리먼트
            */
            getSideElement: function() {
               return this.$el.find('#side'); 
            }
        }, {
            /**
            CalendarDefaultLayout 싱글톤 객체
            (주의) 반드시 상속후에도 싱글톤 객체는 선언해주어야 한다. 그렇지 않으면 부모의 __instance__를 그대로 사용하게 됨.
            @attribute __instance__
            @type {Object} CalendarDefaultLayout 인스턴스 객체
            @required
            **/
            __instance__: null            
        });
        
        function fetchCalendars(userId) {
        	var defer = $.Deferred(), 
        		calendars;
        	
        	calendars = Calendars.create();
        	calendars.setUserId(userId);
        	calendars.fetch({
        		"success": defer.resolve, 
        		"error": defer.reject
        	});
        	
        	return defer;
        }
        
        function fetchFeeds(userId) {
        	var defer = $.Deferred(), 
        		feeds;
        	
        	feeds = CalendarFeeds.create();
        	feeds.setUserId(userId);
        	feeds.fetch({
        		"success": defer.resolve, 
        		"error": defer.reject
        	});
        	
        	return defer;
        }

        return CalendarDefaultLayout;
    });
}).call(this);
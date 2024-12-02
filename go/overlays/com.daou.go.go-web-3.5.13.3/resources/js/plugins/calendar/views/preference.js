(function() {
    define([
        "backbone", 
        "app", 
        "hgn!calendar/templates/preference",
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar", 
        "jquery.go-grid",
        "jquery.go-popup"
    ], 

    function(
        Backbone, 
        GO, 
        Template,
        commonLang,
        calLang
    ) {
        var // 상수
        	DEFAULT_TAB = 'calendar';
            

        var tvars = {
            "tab": {
                "my_cal": calLang["내 캘린더"], 
                "follow": calLang["관심 캘린더"]
            }, 
            "label": {
                "calendar_management": calLang["캘린더 관리"], 
                "basic_preference": calLang["기본 설정"], 
                "timezone": calLang["캘린더 시간대"], 
                "calendar_option": calLang["내 캘린더 열람옵션"], 
                "modify": calLang["변경하기"], 
                "public": calLang["열람 허용"],
                "private": calLang["수락후 허용"], 
                "save": commonLang["저장"], 
                "followings": calLang["내가 등록한 관심 캘린더"], 
                "followers": calLang["내 일정을 보고 있는 관심동료"], 
                "accept": calLang["수락"], 
                "delete": commonLang["삭제"], 
                "deny": calLang["거절"], 
                "member": calLang["멤버"], 
                "status": calLang["상태"], 
                "updated_at": calLang["설정일"], 
                "go_to_calendar": calLang["캘린더로 돌아가기"], 
                "calendar_name": calLang["캘린더 이름"], 
                "calendar": commonLang["캘린더"], 
                "add_calendar": commonLang["추가"], 
                "default_calendar": calLang["기본 캘린더"], 
                "visibility_state": calLang["공개 상태"], 
                "reorder": commonLang["순서바꾸기"]
            }, 
            "msg": {
                "visibility": calLang["내 일정을 누구나 열람 할 수 있습니다"], 
                "private1": calLang["신청과 수락을 통하여 상대방이 내 일정을 열람할 수 있습니다"], 
                "private2": calLang["비공개 일정은 위 옵션과 관계없이 일정 참석자만 열람할 수 있습니다"]
            }
        };

        
        var PreferenceView = Backbone.View.extend({
        	className: "content_page", 
        	
        	events: {
                "click #calendar-preference-tab > li": "_togglePane"
            }, 
            
        	initialize: function(options) {
        		options = options || {};
        		this.calendarType = options.type;
        		this.calendars = options.calendars;
        		this.feeds = options.feeds;
        	}, 
        	
        	render: function() {
        		this.$el.append(Template(tvars));
        		if (this.calendarType == "follows")
        			this.selectTab("follow", "follower");
        		else 
        			this.selectTab(DEFAULT_TAB, "");
        	}, 
        	
        	selectTab: function(calendarType, followType) {
        		var self = this, 
        			collection = {"calendar": self.calendars, "follow": self.feeds}[calendarType];
        		
        		if(!validateTabType(calendarType)) {
        			return;
        		}
        		
        		if(!$('#' + calendarType + '-config-pane').length) {
        			require(["calendar/views/preference/" + calendarType], function(PreferenceView) {
        				var subview = new PreferenceView({"collection": collection, "type" : followType});
        				self.$el.append(subview.el);
        				subview.render();
        				activateTab.call(self, calendarType);
        			});
        		} else {
        			activateTab.call(this, calendarType);
        		}
        	}, 
        	
        	_togglePane: function(e) {
        		var $el = $(e.currentTarget);
        		this.selectTab($el.data('type'), "");
        	}
        });
        
        function validateTabType(type) {
        	return _.indexOf(['calendar', 'follow'], type) > -1;
        }
        
        function activateTab(type) {        	
        	$('#calendar-preference-tab > li').each(function(i, el) {
        		if($(el).data('type') === type) {
        			$(el).addClass('active');
        		} else {
        			$(el).removeClass('active');
        		}
        	});     
        	activatePane.call(this, type);
        }
        
        function activatePane(type) {
        	this.$el.find('.calendar-config').each(function(i, el) {
        		if($(el).data('type') === type) {
        			$(el).show();
        		} else {
        			$(el).hide();
        		}
			});
        }
        
        return PreferenceView;
    }); 
}).call(this);
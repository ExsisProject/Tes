define('calendar/views/mobile/m_calendar_follows', function(require){

    var Backbone = require('backbone');
    var App = require("app");
    var MobilFollowsTpl = require("hgn!calendar/templates/mobile/m_calendar_follows");
    var HeaderToolbarView = require('views/mobile/header_toolbar');
    var commonLang = require("i18n!nls/commons");
    var calendarLang = require("i18n!calendar/nls/calendar");
    var when = require('when');
    var CalendarFollower = require("calendar/models/calendar_follow");

    var lang = {
        "승인" : calendarLang["수락"],
        "거절" : calendarLang["거절"],
        "신청 수락 메시지" : calendarLang["관심 캘린더 신청을 수락하시겠습니까?"],
        "정상 처리" : commonLang["정상 처리되었습니다."]
    };

    var MobileFollowsView = Backbone.View.extend({
        el : "#content",

        initialize : function(options){
            this.options = options;
            if(!this.followCalendar) {
                this.followCalendar = new CalendarFollower({
                    followId : this.options.followLinkId
                });
            }
            this.noMoreFollows = false;
            this.unbindEvent();
            this.bindEvent();
        },

        unbindEvent: function() {
            this.$el.off("click", "#approval");
            this.$el.off("click", "#refusal");
        },

        bindEvent: function() {
            this.$el.on("click", "#approval", $.proxy(this.followApproval, this));
            this.$el.on("click", "#refusal", $.proxy(this.followRefusal, this));
        },

        render : function(){
            if(!this.followCalendar){
                this.noMoreFollows = true;
            }else{
                if(this.followCalendar.toJSON().state != 'waiting'){
                    this.noMoreFollows = true;
                }

            }
            this._initRender();
            /*var titleToolbarOption = {
                name : calendarLang['관심 동료 개별 추가'],
                leftButton : false,
                isIscroll : false,
                isPrev : false
            };
            this.titleToolbarView = TitleToolbarView;
            this.titleToolbarView.render(titleToolbarOption);*/

            var headerToolbarOption = {
                title : calendarLang['관심 동료 개별 추가'],
                isClose : true
            };
            this.headerToolbarView = HeaderToolbarView;
            this.headerToolbarView.render(headerToolbarOption);

            return this;
        },

        _initRender : function () {
            this.$el.html(MobilFollowsTpl({
                lang : lang,
                calendarId : this.options.calendarId,
                followLinkId : this.options.followLinkId,
                noMoreFollows : this.noMoreFollows,
                text : this.getCalendarApplyAllowText()
            }));
        },

        getCalendarApplyAllowText : function(){
            var follower = this.followCalendar.toJSON();
            return App.i18n(calendarLang["{{arg1}} {{arg2}}님의<br>'{{arg3}}' 관심 캘린더 신청을<br>수락 하시겠습니까?"], {arg1 : follower.follower.name, arg2 : follower.follower.position, arg3 : follower.calendar.name});
        },

        followApproval : function(){
            if(confirm(calendarLang['관심 캘린더 신청을 수락하시겠습니까?'])){
                var self = this;

                var url = [GO.config("contextRoot") + "api/calendar/follower/", this.options.followLinkId, "/accept"].join("");
                $.ajax(url, {
                    type: "POST",
                    async: false
                }).then(function() {
                    self.noMoreFollows = true;
                    self.render();
                }, function() {
                    $.goAlert(commonLang['500 오류페이지 타이틀']);
                });
            }
        },

        followRefusal : function(){
            if(confirm(calendarLang['상대방이 신청한 관심 캘린더를 삭제하시겠습니까?'])){
                var self = this;

                $.ajax({
                    "url": GO.config('contextRoot') + "api/calendar/follower",
                    "type": "DELETE",
                    "data": JSON.stringify({"ids": [this.options.followLinkId]}),
                    "dataType": 'json',
                    "contentType": 'application/json'
                }).then(function() {
                    self.noMoreFollows = true;
                    self.render();
                }, function() {
                    $.goAlert(commonLang['500 오류페이지 타이틀']);
                });
            }
        },

        fetch : function(){
            return this.followCalendar.fetch();
        }
    });

    return MobileFollowsView;
});
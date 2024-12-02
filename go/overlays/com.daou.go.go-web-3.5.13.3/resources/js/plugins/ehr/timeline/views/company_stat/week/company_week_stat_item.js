
define("timeline/views/company_stat/week/company_week_stat_item", function (require) {

    var Backbone = require("backbone");
    var Tmpl= require("hgn!timeline/templates/company_stat/week/company_week_stat_item");
    var CompanyDayDetailItem = require("timeline/views/company_stat/week/company_day_detail_item");
    var ProfileView = require("views/profile_card");
    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");

	var WeekStatItem = Backbone.View.extend({
        tagName:'tr',

        events: {
            "click .member2": "showProfile"
        },

        initialize: function (model) {
            this.stat = model;
            this.$el.click(this.popupUserStat);
        },

        render: function () {

            this.$el.html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
                stat: this.stat.attributes,
                userName:this.stat.getUser().name,
                position: this.stat.getUser().position,
                deptName: this.stat.getUser().deptName,
                groupInfo: this.stat.getGroup().name,
                positionName : this.stat.getPositioinName(),
                totalWorkingTime:this.stat.getTotalWorkingTime(),
                normalWorkingTime:this.stat.getNormalWorkingTime(),
                extensionWorkingTime:this.stat.getExtensionWorkingTime(),
                nightWorkingTime:this.stat.getNightWorkingTime(),
                isOverTotalWorkingTime:this.stat.isOverTotalWorkingTime()
            }));

            for ( var i = 0, day ; day = this.stat.dailyList.models[i]; i++){
                var companyDetailItem = new CompanyDayDetailItem(day);
                this.$el.append(companyDetailItem.$el);
                companyDetailItem.render();
            }

            return this;
        },

        showProfile : function(e) {
            e.preventDefault();
            e.stopPropagation();
            var target = e.currentTarget;
            var userId = $(target).attr("data-id");
            if (!userId) return;
            var popupTarget = $(target).find('.photo');
            ProfileView.render(userId, popupTarget);
        },

        popupUserStat : function(e) {
            var target = e.currentTarget;
            var userId = $(target).find('.member2').attr('data-id');
            window.open("/app/ehr/timeline/userstat/"+userId, userId,"scrollbars=yes,resizable=yes,width=1280,height=640");
        }

    });

	return WeekStatItem;
	
});

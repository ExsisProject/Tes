
define("timeline/views/company_stat/month/company_month_stat_item", function (require) {

    var Backbone = require("backbone");
    var Tmpl= require("hgn!timeline/templates/company_stat/month/company_month_stat_item");
    var CompanyWeekDetailItem = require("timeline/views/company_stat/month/company_week_detail_item");
    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var ProfileView = require("views/profile_card");

	var MonthStatItem = Backbone.View.extend({
        tagName:'tr',
        className:'name',

        events: {
            "click .member2": "showProfile"
        },
        initialize: function (model) {
            this.stat = model;
            this.$el.click(this.popupUserStat);
        },

        render: function () {

            var selectiveType = this.stat.isSelectiveWorkingType();
            var normalType = !this.stat.isSelectiveWorkingType();

            this.$el.html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
                stat: this.stat.attributes,
                userName:this.stat.getUser().name,
                position: this.stat.getUser().position,
                deptName: this.stat.getUser().deptName,
                groupInfo: this.stat.getGroup().name,
                positionName:this.stat.getPositioinName(),
                selectiveType:selectiveType,
                normalType:normalType,
                selectiveNormalWorkingTime: this.stat.getSelectiveWorkingTime().normalWorkingTimeStr,
                selectiveNormalOverWorkingTime: this.stat.getSelectiveWorkingTime().normalOverWorkingTimeStr,
                selectiveExtensionWorkingTime: this.stat.getSelectiveWorkingTime().extensionWorkingTimeStr,

                remainingTotalWorkingTime :this.stat.getSelectiveWorkingTime().remainMaximumWorkingTimeStr,
                remainingExtensionWorkingTime :this.stat.getSelectiveWorkingTime().remainExtensionWorkingTimeStr,
                remainingMinimumWorkingTime :this.stat.getSelectiveWorkingTime().remainMinimumWorkingTimeStr,

                totalWorkingTime:this.stat.getTotalWorkingTime(),
                normalWorkingTime:this.stat.getNormalWorkingTime(),
                extensionWorkingTime:this.stat.getExtensionWorkingTime(),
                nightWorkingTime:this.stat.getNightWorkingTime()
            }));

            for ( var i =0 , week; week = this.stat.weeklyList.models[i]; i ++){
                var companyDetailItem = new CompanyWeekDetailItem(week);
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

	return MonthStatItem;
});

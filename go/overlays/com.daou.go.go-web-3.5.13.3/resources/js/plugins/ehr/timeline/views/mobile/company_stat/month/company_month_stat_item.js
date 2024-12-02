define("timeline/views/mobile/company_stat/month/company_month_stat_item", function (require) {
    var Backbone = require("backbone");
    
    var Tmpl= require("hgn!timeline/templates/mobile/company_stat/month/company_month_stat_item");

    var MonthView = require("timeline/views/mobile/user/month");

    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");

	var MonthStatItem = Backbone.View.extend({
        tagName:'li',

        events: {
            "click": "toggleUserStat"
        },

        initialize: function (model) {
            this.stat = model;
        },

        render: function () {

            var selectiveType = this.stat.isSelectiveWorkingType();
            var normalType = !this.stat.isSelectiveWorkingType();

            this.$el.html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
                stat: this.stat.attributes,
                name : this.stat.getName(),
                position : this.stat.getPosition(),
                deptName : this.stat.getDeptName(),
                totalWorkingTime:this.stat.getTotalWorkingTime(),

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

            return this;
        },

        toggleUserStat : function(e) {
            var target = $(e.currentTarget);
            if(target.closest('li').hasClass('active')){
                this.removeUserStat(target);
            }else{
                this.showUserStat(target);
            }
        },

        showUserStat: function (target) {
            target.closest('li').find("#monthLists").show();
            target.closest('li').addClass('active');
            var userId = target.find('#userStat').attr("data-id");
            var monthView = new MonthView({userId:userId});
            target.closest('li').find("#monthLists").append(monthView.$el);
            monthView.render(moment(this.stat.get("yyyymm")).format("YYYY-MM-DD"));

        },

        removeUserStat: function (target) {
            target.closest('li').removeClass('active');
            target.closest('li').find("#monthLists").hide();
            target.closest('li').find("#monthLists").empty();
        },

    });

	return MonthStatItem;
});

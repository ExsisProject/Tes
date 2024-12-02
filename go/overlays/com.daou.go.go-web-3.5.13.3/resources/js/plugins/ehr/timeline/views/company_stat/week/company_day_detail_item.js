
define("timeline/views/company_stat/week/company_day_detail_item", function (require) {

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/company_stat/week/company_day_detail_item");

    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var TimelineCompanyStatsDayItem = Backbone.View.extend({
        tagName: 'td',

        initialize: function (model) {
            this.stat = model;
        },
        getClassName: function () {
            var className = 'days';

            if (this.stat.attributes.detailDay.today) {
                className += ' today';
            }

            return className;
        },
        getTotalWorkingTime:function(){

        },
        render: function () {
            var data = this.stat.attributes;
            var modify = data.clockInHistory ? data.clockInHistory.editedCheckTime : false;
            var tardy = data.tardy && !modify;
            var normal  = !tardy && !modify;

            this.$el.addClass(this.getClassName()).html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
                stat:this.stat.attributes,
                clockInTime:this.stat.getClockInTime(),
                clockOutTime:this.stat.getClockOutTime(),
                totalWorkingTime:this.stat.getTotalWorkingTime(),
                normalWorkingTime:this.stat.getNormalWorkingTime(),
                extensionWorkingTime:this.stat.getExtensionWorkingTime(),
                nightWorkingTime:this.stat.getNightWorkingTime(),
                approvals:this.stat.getApprovals(),
                tardy:tardy,
                normal:normal,
                modify:modify,
            }));
            return this;
        },

    });
    return TimelineCompanyStatsDayItem;
});

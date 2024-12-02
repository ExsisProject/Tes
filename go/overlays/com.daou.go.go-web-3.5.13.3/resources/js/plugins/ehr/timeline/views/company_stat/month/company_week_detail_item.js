
define("timeline/views/company_stat/month/company_week_detail_item", function (require) {

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/company_stat/month/company_week_detail_item");

    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");

    var TimelineCompanyStatsDayItem = Backbone.View.extend({
        tagName: 'td',
        className:'weeks',

        initialize: function (model) {
            this.stat = model;

        },
        getTotalWorkingTime:function(){

        },
        render: function () {
            var data = this.stat.attributes;
            var modify = data.clockInHistory ? data.clockInHistory.editedCheckTime : false;
            var tardy = data.tardy;
            var normal  = !tardy && !modify;

            this.$el.html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
                stat:this.stat.attributes,
                totalWorkingTime:this.stat.getTotalWorkingTime(),
                normalWorkingTime:this.stat.getNormalWorkingTime(),
                extensionWorkingTime:this.stat.getExtensionWorkingTime(),
                nightWorkingTime:this.stat.getNightWorkingTime(),
                over:this.stat.isOverTotalWorkingTime(),
                normal:!this.stat.isOverTotalWorkingTime(),
            }));
            return this;
        },

    });
    return TimelineCompanyStatsDayItem;
});

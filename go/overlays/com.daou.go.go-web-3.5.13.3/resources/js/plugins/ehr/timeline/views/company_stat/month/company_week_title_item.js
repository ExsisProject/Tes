
define("timeline/views/company_stat/month/company_week_title_item", function (require) {

  var Backbone = require("backbone");
  var Tmpl= require("hgn!timeline/templates/company_stat/month/company_week_title_item");


    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");

   var TimelineCompanyStatsDayItem= Backbone.View.extend({
        tagName:'th',
        className:'sorting_disabled week',

        initialize: function (model) {
            this.week =  model.weekOfMonthIdx +"주";
        },
        render: function () {
            this.$el.html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
                week: this.week, }));
            return this;
        },

    });
    return TimelineCompanyStatsDayItem;
});

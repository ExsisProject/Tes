
define("timeline/views/company_stat/week/company_day_title_item", function (require) {

  var Backbone = require("backbone");
  var Tmpl= require("hgn!timeline/templates/company_stat/week/company_day_title_item");
    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");

   var TimelineCompanyStatsDayItem= Backbone.View.extend({
        tagName:'th',

        initialize: function (model) {
            this.day= model;
        },
        getClassName:function(){

            if (!this.day) {
                return 'sorting_disabled days ';
            }

            var className = 'sorting_disabled days ';

            if(this.day.today){
                className += 'today ';
            }

            if( this.day.dayOfWeek == 'Sun' || this.day.holiDay){
                className += 'day_sun';
            }
            else if(this.day.dayOfWeek == 'Sat'){
                className += 'day_sat';
            }

            return className;
        },
        render: function () {
            this.$el.addClass(this.getClassName()).html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
                day: this.day,
            }));
            return this;
        },

    });
    return TimelineCompanyStatsDayItem;
});

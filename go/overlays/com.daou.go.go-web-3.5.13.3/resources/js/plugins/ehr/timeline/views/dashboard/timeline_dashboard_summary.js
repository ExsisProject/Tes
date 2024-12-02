define("timeline/views/dashboard/timeline_dashboard_summary", function (require) {

    var Backbone = require("backbone");

    var Tmpl = require("hgn!timeline/templates/dashboard/timeline_dashboard_summary");

    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var _ = require("underscore");

    var DashboardModel= require("timeline/models/dashboard/dashboard_summary");

    var TimelineDashboard = Backbone.View.extend({
        events: {
            "click [data-profile]": "showProfile",
        },
        initialize: function (date, deptId) {
            this.baseDate = date;
            this.deptId = deptId;
            this.model = new DashboardModel(moment(this.baseDate).format("YYYY-MM-DD"), this.deptId);
        },
        isRequiredRuleUpdate:function(){
            return this.model.isRequiredRuleUpdate();
        },

        render: function () {

            this.$el.html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
                tardy:this.numberStr(this.model.getTardy()),
                early:this.numberStr(this.model.getEarly()),
                absence:this.numberStr(this.model.getAbsence()),
                vacation:this.numberStr(this.model.getVacation()),
                missingClockIn:this.numberStr(this.model.getMissingClockIn()),
                missingClockOut:this.numberStr(this.model.getMissingClockOut()),
                autoClockOut:this.numberStr(this.model.getAutoClockOut()),
                unAuthDevice:this.numberStr(this.model.getUnAuthDevice()),
            }));
            return this;
        },
        numberStr:function(num){
           if( !!!num || num === 0  ) {
               return '-';
           }
           return num + '';
        }
    });

    return TimelineDashboard;

});
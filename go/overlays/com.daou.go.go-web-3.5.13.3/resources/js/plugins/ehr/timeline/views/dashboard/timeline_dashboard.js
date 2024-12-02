define("timeline/views/dashboard/timeline_dashboard", function (require) {

    var Backbone = require("backbone");

    var Tmpl = require("hgn!timeline/templates/dashboard/timeline_dashboard");
    var Summary= require("timeline/views/dashboard/timeline_dashboard_summary");
    var DataList= require("timeline/views/dashboard/timeline_dashboard_list");

    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var _ = require("underscore");

    var TimelineDashboard = Backbone.View.extend({
        className:"go_renew go_ehr_attend_company attend_statistic_co",
        events: {
            "click [data-profile]": "showProfile",
            "click .ic_date_prev":"prevMonth",
            "click .ic_date_next":"nextMonth",

        },
        initialize: function (param) {
            this.baseDate = new Date();
            this.companyMode = true;
            if( param) {
                this.deptId = param.deptId;
                this.companyMode = !(this.deptId > 0 );
            }
        },
        refreshCb:function(self){
              self.render();
        },
        render: function () {
            this.summary = new Summary(this.baseDate, this.deptId);

            this.dataList= new DataList({
                baseDate:this.baseDate,
                refreshCb:this.refreshCb,
                parent:this,
                requiredRuleUpdate:this.summary.isRequiredRuleUpdate(),
                deptId:this.deptId
                });

            this.$el.html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
                month: moment(this.baseDate).format("YYYY.MM"),
                companyMode:this.companyMode

            }));

            this.$el.find('#summary').append(this.summary.$el);
            this.summary.render();

            this.$el.find('#data-list').append(this.dataList.$el);
            this.dataList.render();
            return this;
        },
        nextMonth:function(){
            this.baseDate.setMonth(this.baseDate.getMonth() +1);
            this.render();
        },
        prevMonth:function(){
            this.baseDate.setMonth(this.baseDate.getMonth() -1);
            this.render();
        },

    });

    return TimelineDashboard;

});
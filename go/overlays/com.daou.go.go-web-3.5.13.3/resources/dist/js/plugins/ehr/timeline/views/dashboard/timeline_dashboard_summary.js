define("timeline/views/dashboard/timeline_dashboard_summary",function(require){var e=require("backbone"),t=require("hgn!timeline/templates/dashboard/timeline_dashboard_summary"),n=require("i18n!timeline/nls/timeline"),r=require("i18n!nls/commons"),i=require("underscore"),s=require("timeline/models/dashboard/dashboard_summary"),o=e.View.extend({events:{"click [data-profile]":"showProfile"},initialize:function(e,t){this.baseDate=e,this.deptId=t,this.model=new s(moment(this.baseDate).format("YYYY-MM-DD"),this.deptId)},isRequiredRuleUpdate:function(){return this.model.isRequiredRuleUpdate()},render:function(){return this.$el.html(t({TimelineLang:n,CommonLang:r,tardy:this.numberStr(this.model.getTardy()),early:this.numberStr(this.model.getEarly()),absence:this.numberStr(this.model.getAbsence()),vacation:this.numberStr(this.model.getVacation()),missingClockIn:this.numberStr(this.model.getMissingClockIn()),missingClockOut:this.numberStr(this.model.getMissingClockOut()),autoClockOut:this.numberStr(this.model.getAutoClockOut()),unAuthDevice:this.numberStr(this.model.getUnAuthDevice())})),this},numberStr:function(e){return!e||e===0?"-":e+""}});return o});
define("timeline/models/dashboard/dashboard_summary", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");

    var DashboardSummary = Backbone.Model.extend({
        initialize: function (baseDate, deptId) {
            this.baseDate = baseDate;
            this.deptId = deptId;
            this.fetch({async: false})
            console.log(this)
        },
        url: function () {
            return GO.contextRoot + "api/ehr/timeline/company/dashboard/summary?" + this.mkParam();
        },
        mkParam:function(){
            return $.param({baseDate:this.baseDate , deptId:this.deptId});
        },
        getTardy:function(){
            //늦은 출근
            return this.get('tardy');
        },
        getEarly:function(){
            //이른 퇴근
            return this.get('early');
        },
        getVacation:function(){
            //휴가
            return this.get('vacationDay');
        },
        getAbsence:function(){
            //결근
            return this.get('absence');
        },
        getUmcommuteCompleated:function(){
            //출퇴근 미체크
            return this.get('unCommuteCompleted');
        },
        getLateClockout:function(){
            //늦은 퇴근
           return this.get('lateClockOut') ;
        },
        getAutoClockout:function(){
            //자동 퇴근
            return this.get('autoClockOut') ;
        },
        isRequiredRuleUpdate:function(){
            //업데이트 필요
            return this.get('requiredRuleUpdate') ;
        },
        getMissingClockIn:function(){
            return this.get('missingClockIn');
        },
        getMissingClockOut:function(){
            return this.get('missingClockOut');
        },
        getAutoClockOut:function(){
           return this.get('autoClockOut') ;
        },
        getUnAuthDevice:function(){
           return this.get('unAuthDevice') ;
        },
        warningCount:function(){
            return this.get('warning');
        }
    });

    return DashboardSummary;
});
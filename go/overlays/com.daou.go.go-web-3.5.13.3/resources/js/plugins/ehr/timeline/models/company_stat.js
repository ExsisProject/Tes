define("timeline/models/company_stat", function (require) {

    var WeeklyStats = require("timeline/collections/weekly_stats");
    var MonthStats = require("timeline/collections/month_stats");
    var Backbone = require("backbone");
    var GO = require("app");

    var CompanyWeekStat = Backbone.Model.extend({
        defaults: {},

        initialize: function (param) {
            this.range = param.range;
            this.companyId = param.companyId;
            this.deptId = param.deptId;

            if(this.range === "COMPANY") {
                this.type = 'MONTH';
            }else { // DEPARTMENT
                this.type = 'WEEK';
            }
            this.page = 0;
            this.offSet = 20;
            this.direction = 'desc';
            this.property = 'total';
            this.date = new Date();
            this.filterQuery = '';
        },
        url: function () {
            return GO.contextRoot + "api/ehr/timeline/company/stats" + this.getQueryParam();
        },
        initWeekData: function () {
            this.weekPage = this.get("weekPage");
            this.pageInfo = this.weekPage.pageInfo;
            this.pageInfo.pageNo = this.pageInfo.page;
            this.weeks = new WeeklyStats(this.weekPage.content, this.pageInfo);
            this.days = this.get("days");
            this.deptName = this.get("deptName");
        },
        initMonthData: function () {
            this.monthPage = this.get("monthPage");
            this.pageInfo = this.monthPage.pageInfo;
            this.pageInfo.pageNo = this.pageInfo.page;
            this.weekList = this.get("weeks");
            this.monthPage.content.page = this.pageInfo;
            this.deptName = this.get("deptName");
            this.months = new MonthStats(this.monthPage.content, this.pageInfo);
        },
        initData: function () {
            if (this.type == 'WEEK') {
                this.initWeekData();
            }
            else {
                this.initMonthData();
            }
        },
        updateType: function (type) {
            this.type = type;
        },
        toogleType: function () {
            this.type = this.type == 'WEEK' ? 'MONTH' : 'WEEK';
        },
        isWeekType: function () {
            return this.type == 'WEEK';
        },
        getQueryParam: function () {
            return '?' + $.param(
                {
                    'range': this.range,
                    'type': this.type,
                    'page': this.page,
                    'offSet': this.offSet,
                    'direction': this.direction,
                    'property': this.property,
                    'day': GO.util.customDate(this.date, 'YYYY-MM-DD')
                }
            ) + this.getSelectKeyParam() + this.getFilterQuery();
        },
        getSelectKeyParam: function () {
            if (this.companyId && this.companyId > 0) {
                return '&' + $.param({'companyId': this.companyId});
            }
            else if (this.deptId && this.deptId > 0) {
                return '&' + $.param({'deptId': this.deptId});
            }
            return ''
        },
        getFilterQuery: function () {
            if (this.filterQuery.length > 0) {
                return '&' + this.filterQuery;
            }
            return '';
        },
        setFilter: function (key, val) {
            this.filter = {key: val};
        },
        nextDate: function () {
            this.moveDate(true);
        },
        prevDate: function () {
            this.moveDate(false);
        },
        moveDate: function (plus) {
            if (this.isWeekType()) {
                this.date.setDate(this.date.getDate() + (plus ? 7 : -7))
            }
            else {
                this.date.setMonth(this.date.getMonth() + (plus ? 1 : -1));
            }
        },
        moveToday: function () {
            this.date = new Date();
        },
        setDate: function (date) {
            this.date = new Date(date);
        },
        hasData: function () {
            if (this.isWeekType()) {
                return _.isEmpty(this.weeks.models) ? false : true;
            } else {
                return _.isEmpty(this.months.models) ? false : true;
            }
        },
        getDateInfo: function () {
            if (this.isWeekType()) {
                var days = this.get('weekDayList').days;
                return days[0] + ' ~ ' + days[6];
            } else {
                return this.get('month');
            }
        },
        toogleSort: function () {
            this.direction = this.direction == 'desc' ? 'asc' : 'desc';
        },
        selectDepartment: function (deptId) {
            this.deptId = deptId;
            this.companyId = null;
        },
        selectCompany: function (companyId) {
            this.companyId = companyId;
            this.deptId = null;
        },

        parse : function(data){
            this.set(data.data);
            this.initData()
        }
    });

    return CompanyWeekStat;

});

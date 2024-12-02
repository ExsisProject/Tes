define("timeline/views/company_stat/company_stats", function (require) {

    var Backbone = require("backbone");

    var Tmpl = require("hgn!timeline/templates/company_stat/company_stats");

    var CompanyWeekStatItem = require("timeline/views/company_stat/week/company_week_stat_item");
    var CompanyDayItem = require("timeline/views/company_stat/week/company_day_title_item");

    var CompanyMonthStatItem = require("timeline/views/company_stat/month/company_month_stat_item");
    var CompanyWeekItem = require("timeline/views/company_stat/month/company_week_title_item");
    var FilterView= require("timeline/views/company_stat/stat_filter");

    var CompanyStat= require("timeline/models/company_stat");
    var PaginationView = require("views/pagination");
    var PageSizeView = require("views/pagesize");

    var DownloadLoadingView = require("timeline/views/download_loading");

    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var _ = require("underscore");

    var TimelineCompanyStats = Backbone.View.extend({
        events: {
            "click [data-profile]": "showProfile",
            "click #xlsxDownBtn": "downExcel",
            "click #monthBtn": "changeMonth",
            "click #weekBtn": "changeWeek",
            "click #todayBtn": "moveToday",
            "click #nextDate": "nextDate",
            "click #prevDate": "prevDate",
            "click #searchDate" : "clickCalendar",
            "click #timeSort" : "toogleSort"
        },
        initialize: function (param) {
            this.param = param;
            this.companyStat = new CompanyStat(param);
        },
        initDatePicker:function(){
            var self = this;

            this.$el.find("#calendarDatepicker").datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onSelect : function(selectedDate){
                    self.companyStat.setDate(selectedDate);
                    self.fetchAndRenderContent();
                }
            });

        },

        render: function () {
            this.$el.html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
                companyStat:this.companyStat,
                weekClass:this.companyStat.isWeekType() ? 'on' : 'first',
                monthClass:this.companyStat.isWeekType() ? 'last' : 'on',
                dateInfo : moment().format("YYYY-MM"),
                isCompany:this.param.range == 'COMPANY',
                isDept:this.param.range == 'DEPARTMENT',
            }));

            // 엑셀 문서 다운로드 버튼 생성 및 이벤트 중복 생성 방지 처리
            console.log("excel view make : " + this.companyStat.isWeekType())
            this.downloadingView = new DownloadLoadingView({
                getDownloadURL: "api/ehr/timeline/company/stats/excel" + this.companyStat.getQueryParam(),
                appendTarget: this.$el.find('div#timeline_list_length'),
                week:this.companyStat.isWeekType()
            });

            this.initDatePicker();
            this.fetchAndRenderContent();
            this.renderPageSize();

            this.downloadingView.render();

            return this;
        },

        fetchAndRenderContent : function() {

            this.downloadingView.updateGetDownloadUrl("api/ehr/timeline/company/stats/excel" + this.companyStat.getQueryParam(), this.companyStat.isWeekType());

            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            this.companyStat.fetch({async : true})
                .done(_.bind(function(){
                    this.$el.find("#searchDate").text(this.companyStat.getDateInfo());
                    this.renderData();
                    this.renderFilter();
                    $(window).scrollTop(0);
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                },this));
        },

        renderFilter:function(){
           this.$el.find("#filter_parent").empty();
           this.filterView = new FilterView({range:this.companyStat.range , options : this.filterObj});
           this.$el.find("#filter_parent").append(this.filterView.$el);
           this.filterView.render();
           this.filterView.bind('statFiltering', this.searchFilter, this);
        },

        renderData:function(){
            if(this.companyStat.isWeekType()){
                this.renderWeekContent();
            }
            else{
                this.renderMonthContent();
            }

            this.renderPages();
        },
        renderInitHeader: function () {
            this.$el.find("#timeline_stat_title").empty();

            var HEADERS = [
                "<th class=\"sorting_disabled name\"><span class=\"title_sort\">" + CommonLang["이름"] + "</span></th>",
                "<th class=\"sorting total_time\"><span id=\"timeSort\" class=\"title_sort\">" + TimelineLang["누적근무시간"] + "<ins class=\"ic\"></span></th>"
            ];

            _.each(HEADERS, _.bind(function (HEADER) {
                this.$el.find("#timeline_stat_title").append(HEADER);
            }, this));
        },
        renderMonthContent:function(){
            this.renderInitHeader();

            for( var i = 0, week; week =this.companyStat.weekList[i]; i ++){
                var timelineCompanyWeek = new CompanyWeekItem(week);
                this.$el.find("#timeline_stat_title").append(timelineCompanyWeek.$el);
                timelineCompanyWeek.render();
            }

            if(this.companyStat.months.isEmpty()){
                this.renderEmptyInfo();
                return;
            }

            this.$el.find("#timeline_stat_content").empty();

            for( var i = 0, month; month =this.companyStat.months.models[i]; i++){
                var timelineCompanyMonthItem = new CompanyMonthStatItem(month);
                this.$el.find("#timeline_stat_content").append(timelineCompanyMonthItem.$el);
                timelineCompanyMonthItem.render();
            }
        },

        renderEmptyInfo : function() {
            var colspanCount = this.$el.find("#timeline_stat_title th").length;
            var template = "<tr class='odd'>" +
                "     <td valign='top' colspan='"+ colspanCount +"' class='dataTables_empty'>" +
                "      <p class='data_null'> " +
                "       <span class='ic_data_type ic_no_data'></span>" +
                "       <span class='txt'>"+ CommonLang["데이터가 없습니다."] +"</span>" +
                "      </p>" +
                "     </td>" +
                "    </tr>";

            this.$el.find("#timeline_stat_content").html(template);
        },

        renderWeekContent:function(){
            this.renderInitHeader();
            for( var i = 0, day; day=this.companyStat.days[i]; i ++){
                var timelineCompanyDay = new CompanyDayItem(day);
                this.$el.find("#timeline_stat_title").append(timelineCompanyDay.$el);
                timelineCompanyDay.render();
            }

            if(this.companyStat.weeks.isEmpty()){
                this.renderEmptyInfo();
                return;
            }

            this.$el.find("#timeline_stat_content").empty();
            for( var i = 0, week; week=this.companyStat.weeks.models[i]; i ++){
                var timelineCompanyItem = new CompanyWeekStatItem(week);
                this.$el.find("#timeline_stat_content").append(timelineCompanyItem.$el);
                timelineCompanyItem.render();
            }
        },

        renderPageSize: function () {
            this.pageSizeView = new PageSizeView({pageSize: this.companyStat.offSet, el:this.$el.find('.dataTables_length')});
            this.pageSizeView.render();
            this.pageSizeView.bind('changePageSize', this.selectPageSize, this);
            this.pageSizeView.$el.find('select').addClass('tb_paging select_box');
        },

        renderPages: function () {
            var pageInfo =
                this.companyStat.isWeekType() ?this.companyStat.weeks.pageInfo() : this.companyStat.months.pageInfo();

            this.pageView = new PaginationView({pageInfo: pageInfo, useBottomButton: true});

            this.$el.append(this.pageView.$el);
            this.pageView.render();
            this.pageView.bind('paging', this.selectPage, this);

            this.$el.find('div.tool_absolute > div.dataTables_paginate').remove();
            this.$el.find('div.tool_absolute').append(this.pageView.render().el);
        },
        selectPage: function (pageNo) {
            this.companyStat.page = pageNo;
            this.fetchAndRenderContent();
        },
        clickCalendar : function() {
            $("#calendarDatepicker").trigger('focus');
        },
        selectPageSize: function (pageSize) {
            this.companyStat.offSet = pageSize;
            this.fetchAndRenderContent();
        },
        downExcel: function () {
            window.location.href = GO.contextRoot + "api/ehr/timeline/company/stats/excel" + this.companyStat.getQueryParam();
        },
        changeMonth:function(e){
            this.$el.find("#statType li").removeClass("on");
            $(e.currentTarget).addClass("on");
            this.companyStat.updateType('MONTH');
            this.fetchAndRenderContent();
        },
        changeWeek:function(e){
            this.$el.find("#statType li").removeClass("on");
            $(e.currentTarget).addClass("on");
            this.companyStat.updateType('WEEK');
            this.fetchAndRenderContent();
        },
        prevDate:function(){
           this.companyStat.prevDate();
           this.fetchAndRenderContent();
        },
        nextDate:function(){
            this.companyStat.nextDate();
            this.fetchAndRenderContent();
        },
        moveToday:function () {
            this.companyStat.moveToday();
            this.fetchAndRenderContent();
        },
        toogleSort:function(){
            this.companyStat.toogleSort();
            this.fetchAndRenderContent();
        },
        searchFilter:function(filterObj){
            this.filterObj = filterObj;
            this.companyStat.filterQuery= filterObj.query;
            this.companyStat.page = 0;
            this.fetchAndRenderContent();
        },

    });

    return TimelineCompanyStats;

});
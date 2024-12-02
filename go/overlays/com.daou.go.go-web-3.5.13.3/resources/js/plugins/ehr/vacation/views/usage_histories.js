define(function (require) {
    var Backbone     = require("backbone");
    var GO           = require("app");
    var Tmpl         = require("hgn!vacation/templates/usage_histories");
    var VacationLang = require("i18n!vacation/nls/vacation");
    var CommonLang   = require("i18n!nls/commons");
    var AdminLang = require("i18n!admin/nls/admin");
    var TitleView    = require("vacation/views/title");
    var DeptModel    = require("models/dept_profile");
    require("jquery.go-grid");

    var lang = {
        "이름" : CommonLang["이름"],
        "부서명" : CommonLang["부서명"],
        "기간" : CommonLang["기간"],
        "사용일수" : VacationLang["사용일수"],
        "분류" : VacationLang["분류"],
        "연차 데이터 없음" : VacationLang["연차 데이터 없음"],
        "목록 다운로드" : CommonLang["목록 다운로드"],
        "전사 연차사용내역" : VacationLang["전사 연차사용내역"],
        "부서 연차사용내역" : VacationLang["부서 연차사용내역"],
        "초기화": AdminLang["초기화"],
        "검색 조건":CommonLang["검색 조건"],
        "조건별 상세검색" : VacationLang["조건별 상세검색"]
    }

    var DescendantDept = Backbone.Collection.extend({
        initialize : function(options){
            this.deptId = options.deptId;
        },
        url : function() {
            return GO.contextRoot + 'api/department/descendant/' + this.deptId;
        }
    });

    var UsageHistories = Backbone.View.extend({
        events: {
            "click #preDate" : "preDate",
            "click #nextDate" : "nextDate",
            "click #searchDate" : "showCalendar",
            "keyup #userName, #deptName" : "enterSearch",
            "click #searchBtn" : "clickSearch",
            "change #descendant_select" : "changeDept",
            "click #xlsxDownBtn" : "xlsxDownload",
            "click #searchReset" : "reset"
        },

        initialize: function () {
            this.deptId = this.options.deptId;
            this.$el.off();
            this.isCompany = false;

            if(this.deptId == "company"){
                this.isCompany = true;
                this.descendantDept = new Backbone.Collection();
                this.dept = new Backbone.Model();
                this.deptId = null;
            }else{
                this.hasDescendantSelect  = true;
                this.descendantDept = new DescendantDept({"deptId" : this.deptId});
                this.descendantDept.fetch({async: false});
                this.dept = DeptModel.read(this.deptId);
            }
        },

        render: function () {
            var current = GO.util.toMoment();
            var searchDate = GO.util.shortDateMonth(current);
            var preDate = GO.util.calDate(searchDate, 'months', -1);
            var nextDate = GO.util.calDate(searchDate, 'months', 1);
            this.$el.html(Tmpl({
                lang : lang,
                searchDate : searchDate,
                displaySearchDate : moment(searchDate).format("YYYY.MM"),
                preDate : GO.util.customDate(preDate, "YYYY-MM"),
                nextDate : GO.util.customDate(nextDate, "YYYY-MM"),
                descendantDept : this.descendantDept.toJSON(),
                hasDescendantSelect : this.hasDescendantSelect,
                dept : this.dept.toJSON(),
                isCompany : this.isCompany
            }));

            var title = VacationLang["부서 연차 사용내역"];
            if(this.isCompany){
                title = VacationLang["전사 연차 사용내역"];
            }
            this.$el.find('header.content_top').html(new TitleView().render(title).el);
            this.renderList();
            this.initDatePicker();
            this.initSearchDatePicker();
            return this;
        },

        renderList : function(){

            var url = GO.contextRoot + "api/ehr/vacation/histories";
            var self = this;
            this.list = $.goGrid({
                el: this.$el.find('#vacation_list'),
                method: 'GET',
                destroy: true,
                url: url,
                params: this.getParam(),
                emptyMessage: "<p class='data_null'> " +
                                "<span class='ic_data_type ic_no_data'></span>" +
                                "<span class='txt'>" + lang["연차 데이터 없음"] + "</span>" +
                               "</p>",
                checkbox: true,
                defaultSorting: [[2, "desc"]],
                columns : [
                    { mData: "userName", sWidth: '130px', sClass: "", bSortable: false, fnRender : function(obj){
                        var data = obj.aData;
                        return data.userName;
                    }},
                    { mData: "deptName", sWidth: '130px', sClass: "", bSortable: false},
                    { mData: "startDate", sWidth: '130px', sClass: "", bSortable: false, fnRender : function(obj){
                        var data = obj.aData;
                        return data.startDate + " ~ " + data.endDate;
                    }},
                    { mData: "usedPoint", sWidth: '130px', sClass: "", bSortable: false},
                    { mData: "title", sWidth: '130px', sClass: "", bSortable: false}
                ],
                fnDrawCallback : function(obj, oSettings, listParams) {
                    $(window).scrollTop(0);
                    var $toolbar = $($('#table_area div.tool_bar')[0]);
                    $toolbar.find("div.custom_header").hide();
                    if(self.isCompany){
                        $toolbar.prepend($("#excel_download_area").show());
                    }else{
                        $toolbar.append($("#descendant_area").show());
                    }
                    $toolbar.append($('#dateBtns').show());
                    $("div.custom_bottom").css({"height" : "1px"});
                    $(".odd").css({"cursor":"default"});
                    $(".even").css({"cursor":"default"});
                }
            })
        },

        reset : function() {
            var monthOfStartAndEnd = this.getMonthOfStartAndEnd(moment());
            this.$el.find("#searchStartDate").val(monthOfStartAndEnd.startDate);
            this.$el.find("#searchEndDate").val(monthOfStartAndEnd.endDate);
            this.$el.find("#userName").val("");
            this.$el.find("#deptName").val("");
        },

        xlsxDownload : function(){
            var url = GO.contextRoot + "api/ehr/vacation/histories/download";

            var params = {
                offset : 9999999,
                page : 0,
                property : "startDate",
                direction : "desc",
                startDate : this.$el.find("#searchStartDate").val(),
                endDate : this.$el.find("#searchEndDate").val(),
                userName : this.$el.find("#userName").val(),
                deptName : this.$el.find("#deptName").val()
            };

            window.location.href = url + "?" + $.param(params);
        },

        enterSearch : function(e){
            if(e.keyCode != "13"){return;}

            this.search();
        },

        clickSearch : function(){
            this.search();
        },

        search : function(){
            var startDate = this.$el.find("#searchStartDate").val();
            var endDate = this.$el.find("#searchEndDate").val();
            var userName = this.$el.find("#userName").val();
            var deptName = this.$el.find("#deptName").val();

            this.reloadList(startDate, endDate, userName, deptName);
        },

        getParam : function(){
            var targetMonth = this.isCompany ? moment() :this.$el.find("#searchDate").data("date");
            var params = {};
            params["deptId"] = this.deptId;
            $.extend(params, this.getMonthOfStartAndEnd(targetMonth));
            return params;
        },

        getMonthOfStartAndEnd : function(month){
            var moment = GO.util.toMoment(month);
            return {
                startDate : GO.util.customDate(moment.startOf('months'), 'YYYY-MM-DD'),
                endDate : GO.util.customDate(moment.endOf('months'), 'YYYY-MM-DD')
            }
        },

        preDate : function(e){
            var $el = $(e.currentTarget);
            this.changeMonth($el.attr("data-date"));
        },

        nextDate : function(e){
            var $el = $(e.currentTarget);
            this.changeMonth($el.attr("data-date"));
        },

        changeDept : function(e){
            this.deptId = $(e.currentTarget).val();
            var period = this.getMonthOfStartAndEnd(this.$el.find("#searchDate").attr("data-date"));
            this.reloadList(period.startDate, period.endDate);
        },

        reloadList : function(startDate, endDate, userName, deptName){
            this.list.tables.customParams = {
                'userName' : userName,
                'deptName' : deptName,
                'startDate' : startDate,
                'endDate' : endDate,
                'deptId' : this.deptId
            };

            this.list.tables.fnClearTable();
        },

        showCalendar : function(){
            this.$el.find("#calBtn").focus();
        },

        // 상단의 월 기준
        initDatePicker : function(){
            var $calendar = this.$el.find("#calBtn");
            $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
            $calendar.datepicker({
                dateFormat : "yy-mm",
                changeMonth: true,
                changeYear : true,
                yearSuffix: "",
                onSelect: $.proxy(function( selectedDate ) {
                    this.changeMonth(selectedDate+"");
                }, this)
            });
        },

        changeMonth : function(searchDate){
            $("#preDate").attr("data-date", GO.util.formatDatetime(GO.util.calDate(searchDate,'months',-1), null, "YYYY-MM"));
            $("#searchDate").attr("data-date", GO.util.formatDatetime(searchDate, null, "YYYY-MM"));
            $("#searchDate").text(GO.util.formatDatetime(searchDate, null, "YYYY.MM"));
            $("#nextDate").attr("data-date", GO.util.formatDatetime(GO.util.calDate(searchDate,'months',1), null, "YYYY-MM"));
            var moment = GO.util.toMoment(searchDate);
            var startDate = GO.util.customDate(moment.startOf('months'), 'YYYY-MM-DD');
            var endDate = GO.util.customDate(moment.endOf('months'), 'YYYY-MM-DD');

            this.reloadList(startDate, endDate);
        },

        initSearchDatePicker : function(){
            var $searchStartDate = this.$el.find("#searchStartDate");
            var currentDate = GO.util.now();
            var startDate = currentDate.startOf("months").format("YYYY-MM-DD");
            var endDate = currentDate.endOf("months").format("YYYY-MM-DD");

            $searchStartDate.val(startDate);
            $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
            $searchStartDate.datepicker({
                dateFormat : "yy-mm-dd",
                changeMonth: true,
                changeYear : true,
                yearSuffix: "",
                onSelect : function(selectedDate){
                    $searchEndDate.datepicker( "option", "minDate", selectedDate );
                }
            });

            var $searchEndDate = this.$el.find("#searchEndDate");
            $searchEndDate.val(endDate);
            $searchEndDate.datepicker({
                dateFormat : "yy-mm-dd",
                changeMonth: true,
                changeYear : true,
                yearSuffix: "",
                minDate : startDate
            });
        }
    });


    return UsageHistories;

});

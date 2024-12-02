(function () {
    define([
            "backbone",
            "app",
            "hgn!welfare/templates/histories",
            "i18n!welfare/nls/welfare",
            "i18n!nls/commons",
            "welfare/views/title",
            "jquery.go-grid"
        ],

        function (
            Backbone,
            GO,
            Tmpl,
            WelfareLang,
            CommonLang,
            TitleView
        ) {
            var lang = {
                "이름" : CommonLang["이름"],
                "부서명" : CommonLang["부서명"],
                "사용일" : WelfareLang["사용일"],
                "사용 Point" : WelfareLang["사용 Point"],
                "분류" : WelfareLang["분류"],
                "거래처" : WelfareLang["거래처"],
                "복지포인트 데이터 없음" : WelfareLang["복지포인트 데이터 없음"],
                "목록 다운로드" : CommonLang["목록 다운로드"]
            }

            var CompanyHistories = Backbone.View.extend({
                events: {
                    "click #preDate" : "preDate",
                    "click #nextDate" : "nextDate",
                    "click #calArea" : "showCalendar",
                    "keyup #searchKeyword" : "enterSearch",
                    "click #searchBtn" : "clickSearch",
                    "click #xlsxDownBtn" : "xlsxDownload"
                },

                initialize: function () {
                    this.$el.off();
                },

                render: function () {
                    var current = GO.util.toMoment();
                    var searchDate = GO.util.shortDateMonth(current);
                    var preDate = GO.util.calDate(searchDate, 'months', -1);
                    var nextDate = GO.util.calDate(searchDate, 'months', 1);
                    this.$el.html(Tmpl({
                        lang : lang,
                        searchDate : searchDate,
                        preDate : GO.util.customDate(preDate, "YYYY-MM"),
                        nextDate : GO.util.customDate(nextDate, "YYYY-MM"),
                    }));

                    this.$el.find('header.content_top').html(new TitleView().render("전사 복지포인트").el);
                    this.renderList();
                    this.initDatePicker();
                    this.initSearchDatePicker();
                    return this;
                },

                renderList : function(){

                    var url = GO.contextRoot + "api/ehr/welfare/histories";
                    var self = this;
                    this.list = $.goGrid({
                        el: this.$el.find('#welfare_list'),
                        method: 'GET',
                        destroy: true,
                        url: url,
                        params: this.getParam(),
                        emptyMessage: "<p class='data_null'> " +
                                        "<span class='ic_data_type ic_no_data'></span>" +
                                        "<span class='txt'>" + lang["복지포인트 데이터 없음"] + "</span>" +
                                       "</p>",
                        checkbox: true,
                        defaultSorting: [[2, "desc"]],
                        columns : [
                            { mData: "userName", sWidth: '130px', sClass: "", bSortable: false, fnRender : function(obj){
                                var data = obj.aData;
                                return data.userName;
                            }},
                            { mData: "deptName", sWidth: '130px', sClass: "", bSortable: false},
                            { mData: "eventDate", sWidth: '130px', sClass: "", bSortable: false},
                            { mData: null, sWidth: '130px', sClass: "money", bSortable: false, fnRender : function(obj){
                                return GO.util.numberWithCommas(obj.aData.usedPoint);
                            }},
                            { mData: null, sWidth: '130px', sClass: "", bSortable: false, fnRender : function(obj){
                                var data = obj.aData;

                                if(data.description == null){
                                    return "";
                                }else{
                                    return data.description;
                                }
                            }},
                            { mData: "title", sWidth: '130px', sClass: "", bSortable: false}
                        ],
                        fnDrawCallback : function(obj, oSettings, listParams) {
                            $(window).scrollTop(0);
                            $($('div.tool_bar')[0]).addClass('calendar_tool_bar');
                            var $toobar = $($('div.tool_bar')[0]);
                            $toobar.prepend($("#excel_download_area").show());
                            $toobar.append($('#dateBtns').show());

                            self.list.tables.find("tbody .money").attr('style', 'text-align : right !important');
                            self.list.tables.find("tbody tr td:first-child").attr('style' , "text-align : center!important");
                            $("div.custom_bottom").css({"height" : "1px"});
                        }
                    })
                },

                xlsxDownload : function(){
                    var url = GO.contextRoot + "api/ehr/welfare/histories/download";
                    var searchDate = this.$el.find("#searchDate").attr("data-date");
                    var startDate = GO.util.toMoment(searchDate).startOf("years").format("YYYY-MM-DD");
                    var endDate = GO.util.toMoment(searchDate).endOf("years").format("YYYY-MM-DD");

                    var params = {
                        offset : 9999999,
                        page : 0,
                        property : "eventDate",
                        direction : "desc",
                        startDate : startDate,
                        endDate : endDate
                    }

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
                    var searchField = this.$el.find("#searchTypes").val();
                    var keyword = this.$el.find("#searchKeyword").val();

                    this.reloadList(startDate, endDate, searchField, keyword);
                },

                getParam : function(){
                    var $el = this.$el;
                    var targetMonth = this.$el.find("#searchDate").data("date")
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

                reloadList : function(startDate, endDate, searchField, keyword){
                    this.list.tables.customParams = {
                        'searchField' : searchField,
                        'keyword'  : keyword,
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
                    $("#searchDate").text(GO.util.formatDatetime(searchDate, null, "YYYY-MM"));
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


            return CompanyHistories;

        });

})();
(function () {
    define([
            "backbone",
            "app",
            "hgn!welfare/templates/company_manage_list",
            "welfare/views/company_manage_welfare_popup",
            "welfare/views/company_manage_change_popup",
            "i18n!welfare/nls/welfare",
            "i18n!nls/commons",
            "jquery.go-grid"
        ],

        function (
            Backbone,
            GO,
            Tmpl,
            ManageWelfarePopupView,
            ManageChangePopupView,
            WelfareLang,
            CommonLang
        ) {
            var lang = {
                "ID(계정)" : WelfareLang["ID(계정)"],
                "이름" : CommonLang["이름"],
                "부서명" : CommonLang["부서명"],
                "입사일" : WelfareLang["입사일"],
                "년간 Point" : WelfareLang["년간 Point"],
                "조정 Point" : WelfareLang["조정 Point"],
                "사용 Point" : WelfareLang["사용 Point"],
                "남은 Point" : WelfareLang["남은 Point"],
                "상태" : WelfareLang["상태"],
                "목록 다운로드" : CommonLang["목록 다운로드"],
                "선택 추가" : WelfareLang["선택 추가"],
                "전체 추가" : WelfareLang["전체 추가"],
                "복지포인트 데이터 없음" : WelfareLang["복지포인트 데이터 없음"],
                "이전" : CommonLang["이전"],
                "다음" : CommonLang["다음"],
                "오늘" : CommonLang["오늘"],
                "추가" : CommonLang["추가"],
                "날짜 이동" : WelfareLang["날짜 이동"],
                "기간" : CommonLang["기간"],
                "선택된 항목이 없습니다." : CommonLang["선택된 항목이 없습니다."],
                "개인 복지포인트 수정" : WelfareLang["개인 복지포인트 수정"],
                "확인" : CommonLang["확인"],
                "취소" : CommonLang["취소"],
                "저장되었습니다." : CommonLang["저장되었습니다."],
                "검색" : CommonLang["검색"],
                "전체" : CommonLang["전체"],
                "정상" : CommonLang["정상"],
                "메일휴면" : WelfareLang["메일휴면"],
                "중지" : CommonLang["중지"],
                "개인 복지포인트 수정" : WelfareLang["개인 복지포인트 수정"]
            };

            var CompanyManageList = Backbone.View.extend({
                events: {
                    "click #preDate" : "preDate",
                    "click #nextDate" : "nextDate",
                    "click #calArea" : "showCalendar",
                    "click #selected_change" : "selectedChange",
                    "click #all_change" : "allChange",
                    "keyup #searchKeyword" : "enterSearch",
                    "click #searchBtn" : "clickSearch",
                    "change #searchTypes" : "searchTypeChange",
                    "click #hiredate_search_btn" : "hireDateSearch",
                    "change #status_types" : "changeStatus",
                    "click #xlsxDownBtn" : "xlsxDownload"
                },

                initialize: function () {

                },

                render: function () {
                    var currentYear = GO.util.toMoment().year()
                    this.$el.html(Tmpl({
                        lang : lang,
                        preDate : currentYear -1,
                        searchDate : currentYear,
                        nextDate : currentYear + 1
                    }));

                    this.renderList();
                    this.initDatePicker();
                    this.initSearchDatePicker();
                    return this;
                },

                xlsxDownload : function(){
                    var url = GO.contextRoot + "api/ehr/welfare/company/list/download";
                    var params = {
                        offset : 99999,
                        page : 0,
                        property : "userName",
                        direction : "asc",
                        year : this.$el.find("#searchDate").attr("data-date")
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

                selectedChange : function(){
                    var ids = this.list.tables.getCheckedIds();

                    if(ids.length < 1){
                        $.goMessage(CommonLang["선택된 항목이 없습니다."]);
                        return;
                    }

                    var options = {
                        type : "selected",
                        ids : ids
                    }

                    this.callChangePopup(options);
                },

                allChange : function(){
                    var options = {
                        type : "company",
                        year : this.$el.find("#searchDate").attr("data-date")
                    }

                    this.callChangePopup(options);
                },

                callChangePopup : function(options){
                    var self = this;
                    var title = options.type == "company" ? lang["전체 추가"] : lang["선택 추가"];
                    var popupEl = $.goPopup({
                        header: title,
                        width: 400,
                        title: "",
                        modal: true,
                        contents: "<div id='manageChangePopup'></div>",
                        buttons : [
                            {
                                btype : 'confirm',
                                btext : lang['확인'],
                                callback : function() {
                                    manageChangePopupView.save();
                                    manageChangePopupView.on("save.success", function(){
                                        $.goMessage(CommonLang["저장되었습니다."]);
                                        popupEl.close();
                                        self.list.tables.fnClearTable();
                                    })
                                }},
                            {
                                btype : 'normal',
                                btext : lang['취소'],
                                callback : function() {
                                    popupEl.close();
                                }},
                        ]
                    });

                    var viewOptions = $.extend({el : "#manageChangePopup"}, options);

                    var manageChangePopupView = new ManageChangePopupView(viewOptions);
                    manageChangePopupView.render();
                },

                hireDateSearch : function(){
                    var params = {
                        'year' : this.$el.find("#searchDate").attr("data-date"),
                        'startHireDate' : this.$el.find("#searchStartDate").val(),
                        'endHireDate' : this.$el.find("#searchEndDate").val()
                    };

                    this.reloadList(params);
                },

                changeDate : function(inputDate){
                    if(_.isUndefined(inputDate)){
                        inputDate = $("#searchDate").attr("data-date");
                    }

                    var preDate = GO.util.formatDatetime(GO.util.calDate(inputDate,'years',-1), null, "YYYY");
                    var searchDate = GO.util.formatDatetime(inputDate, null, "YYYY");
                    var nextDate = GO.util.formatDatetime(GO.util.calDate(inputDate,'years',1), null, "YYYY");

                    this.$el.find("#preDate").attr("data-date", preDate);
                    this.$el.find("#searchDate").attr("data-date", searchDate);
                    this.$el.find("#searchDate").text(searchDate);
                    this.$el.find("#nextDate").attr("data-date", nextDate);

                    var params = {"year" : searchDate};
                    this.reloadList(params);
                },

                reloadList : function(options){
                    this.list.tables.customParams = options;
                    this.list.tables.customParams['searchField'] = this.$el.find("#searchTypes").val();
                    this.list.tables.fnClearTable();
                },

                changeStatus : function(){
                    var params = {
                        'year' : this.$el.find("#searchDate").attr("data-date"),
                        'keyword'  : this.$el.find("#status_types").val()
                    };

                    this.reloadList(params);
                },

                search : function(){
                    var param = {
                        'year' : this.$el.find("#searchDate").attr("data-date"),
                        'keyword'  : this.$el.find("#searchKeyword").val()
                    };

                    if($.trim(param.keyword) == ""){
                        $.goMessage(CommonLang["검색어를 입력하세요."]);
                        return;
                    }

                    this.reloadList(param);
                },

                searchTypeChange : function(e){
                    var type = $(e.currentTarget).val();
                    var $el = this.$el;

                    if(type == "user" || type =="dept"){
                        $el.find("#keyword_section").show();
                        $el.find("#hiredate_search").hide();
                        $el.find("#status_types").hide();
                    }else if(type == "hiredate"){
                        $el.find("#keyword_section").hide();
                        $el.find("#hiredate_search").show();
                        $el.find("#status_types").hide();
                    }else{  // status
                        $el.find("#keyword_section").hide();
                        $el.find("#hiredate_search").hide();
                        $el.find("#status_types").show();
                    }
                },

                showCalendar : function(){
                    this.$el.find("#calBtn").focus();
                },

                preDate : function(e){
                    var $el = $(e.currentTarget);
                    this.changeDate($el.attr("data-date"));
                },

                nextDate : function(e){
                    var $el = $(e.currentTarget);
                    this.changeDate($el.attr("data-date"));
                },

                renderList : function() {

                    var params = {
                        year : this.$el.find("#searchDate").attr("data-date")
                    };

                    var url = GO.contextRoot + "api/ehr/welfare/company/list";
                    var self = this;
                    this.list = $.goGrid({
                        el: this.$el.find('#welfare_list'),
                        method: 'GET',
                        destroy: true,
                        url: url,
                        params: params,
                        emptyMessage: "<p class='data_null'> " +
                        "<span class='ic_data_type ic_no_data'></span>" +
                        "<span class='txt'>" + lang["복지포인트 데이터 없음"] + "</span>" +
                        "</p>",
                        defaultSorting: [[2, "asc"]],
                        checkbox: true,
                        checkboxData: 'id',
                        columns : [
                            { mData: null, sWidth: '100px', sClass: "loginId", bSortable: false, fnRender : function(obj){
                                var data = obj.aData;
                                return "<span data-id='" + data.id +"'>" + data.loginId + "</span>";
                            }},
                            { mData: "userName", sWidth: '100px', sClass: "", bSortable: true},
                            { mData: "deptName", sWidth: '150px', sClass: "", bSortable: false},
                            { mData: "hireDate", sWidth: '80px', sClass: "", bSortable: false},
                            { mData: null, sWidth: '120px', sClass: "money", bSortable: false, fnRender : function(obj){
                                return GO.util.numberWithCommas(obj.aData.totalPoint);
                            }},
                            { mData: null, sWidth: '120px', sClass: "money", bSortable: false, fnRender : function(obj){
                                return GO.util.numberWithCommas(obj.aData.additionPoint);
                            }},
                            { mData: null, sWidth: '120px', sClass: "money", bSortable: false, fnRender : function(obj){
                                return GO.util.numberWithCommas(obj.aData.usedPoint);
                            }},
                            { mData: null, sWidth: '120px', sClass: "money", bSortable: false, fnRender : function(obj){
                                return GO.util.numberWithCommas(obj.aData.restPoint);
                            }},
                            { mData: 'status', sWidth: '70px', sClass: "", bSortable: false}
                        ],
                        fnDrawCallback : function(obj, oSettings, listParams) {
                            $(window).scrollTop(0);
                            $('div.tool_bar .custom_header').closest('div').addClass('calendar_tool_bar');
                            var $top_toobar = $($('div.tool_bar')[0]);
                            $top_toobar.prepend($("#excel_download_area").show());
                            $top_toobar.append($("#all_change").show());
                            $top_toobar.append($("#selected_change").show());
                            $top_toobar.append($('#dateBtns').show());

                            self.list.tables.find("tbody .money").attr('style', 'text-align : right !important');
                            $("div.custom_bottom").css({"height" : "1px"});
                            self.$el.find('#welfare_list tbody td.loginId').css('cursor', 'pointer').click(function(e) {
                                var $el = $(e.currentTarget);
                                var welfareId = $el.find("span").data("id");
                                self.callUserWelfareUpdatePopup(welfareId);
                            });
                        }
                    })
                },

                callUserWelfareUpdatePopup : function(welfareId){
                    var self = this;
                    var popupEl = $.goPopup({
                        header: lang["개인 복지포인트 수정"],
                        width: 400,
                        title: "",
                        modal: true,
                        contents: "<div id='manageWelfarePopup'></div>",
                        buttons : [
                            {
                                btype : 'confirm',
                                btext : lang['확인'],
                                callback : function() {
                                    manageWelfarePopupView.save();
                                    manageWelfarePopupView.on("save.success", function(){
                                        $.goMessage(CommonLang["저장되었습니다."]);
                                        popupEl.close();
                                        self.list.tables.fnClearTable();
                                    })
                                }},
                            {
                                btype : 'normal',
                                btext : lang['취소'],
                                callback : function() {
                                    popupEl.close();
                                }},
                        ]
                    });
                    var manageWelfarePopupView = new ManageWelfarePopupView({el : "#manageWelfarePopup", welfareId : welfareId});
                    manageWelfarePopupView.render();
                },

                // 상단 캘린더 초기화
                initDatePicker : function(){
                    var $calendar = this.$el.find("#calBtn");
                    $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
                    $calendar.datepicker({
                        dateFormat : "yy-mm-dd",
                        changeMonth: true,
                        changeYear : true,
                        yearSuffix: "",
                        onSelect: $.proxy(function( selectedDate ) {
                            var selectedYear = GO.util.toMoment(selectedDate).year();
                            this.changeDate(selectedYear+"");
                        }, this)
                    });
                },

                // 입사일 캘린더 초기화
                initSearchDatePicker : function(){
                    var $searchStartDate = this.$el.find("#searchStartDate");
                    var currentDate = GO.util.now().format("YYYY-MM-DD");
                    $searchStartDate.val(currentDate);
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
                    $searchEndDate.val(currentDate);
                    $searchEndDate.datepicker({
                        dateFormat : "yy-mm-dd",
                        changeMonth: true,
                        changeYear : true,
                        yearSuffix: "",
                        minDate : currentDate
                    });
                }

            });

            return CompanyManageList;
        });
})();
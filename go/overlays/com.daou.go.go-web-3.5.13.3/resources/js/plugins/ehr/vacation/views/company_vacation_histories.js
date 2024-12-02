define("vacation/views/company_vacation_histories", function (require) {

    var Backbone = require("backbone");
    var GO = require("app");

    var ProfileView = require("views/profile_card");
    var Tmpl = require("hgn!vacation/templates/company_vacation_histories");
    var VacationLang = require("i18n!vacation/nls/vacation");
    var CommonLang = require("i18n!nls/commons");
    var TitleView = require("vacation/views/title");
    var AdminLang = require("i18n!admin/nls/admin");

    var ManagePopup = require("vacation/views/company_manage_vacation_popup");
    var UploaderPopup = require("vacation/views/company_manage_uploader");
    require("GO.util");
    require("jquery.go-popup");
    require("jquery.go-grid");
    require("jquery.go-preloader");

    var lang = {
        "전사 연차현황": VacationLang["전사 연차현황"],
        "이름": CommonLang["이름"],
        "부서명": CommonLang["부서명"],
        "입사일": VacationLang["입사일"],
        "퇴사일": VacationLang["퇴사일"],
        "근속연수": VacationLang["근속연수"],
        "발생 연차": VacationLang["발생 연차"],
        "1년 미만 발생 월차": VacationLang["1년 미만 발생 월차"],
        "1년 미만 이월 월차": VacationLang["1년 미만 이월 월차"],
        "조정 연차": VacationLang["조정 연차"],
        "총연차":VacationLang["총연차"],
        "사용 연차": VacationLang["사용 연차"],
        "잔여 연차": VacationLang["잔여 연차"],
        "상태": CommonLang["상태"],

        "목록 다운로드": CommonLang["목록 다운로드"],
        "연차 초기 설정": VacationLang["연차 초기 설정"],
        "연차 조정": VacationLang["연차 조정"],
        "연차 일괄 조정": VacationLang["연차 일괄 조정"],

        "검색": CommonLang["검색"],
        "초기화": AdminLang["초기화"],
        "검색 조건":CommonLang["검색 조건"],

        "기준일": VacationLang["기준일"],
        "상태": CommonLang["상태"],
        "전체": CommonLang["전체"],
        "정상": CommonLang["정상"],
        "메일휴면": VacationLang["메일휴면"],
        "중지": CommonLang["중지"],


        "기간": CommonLang["기간"],
        "분류": VacationLang["분류"],
        "목록없음": AdminLang["목록없음"],

        "선택된 연차가 없습니다.": VacationLang["선택된 연차가 없습니다."],

        "확인": CommonLang["확인"],
        "취소": CommonLang["취소"],
        "선택된 사용자가 없습니다.": VacationLang["선택된 사용자가 없습니다."],

        "연차 현황을 위한 꿀팁 가이드":VacationLang["연차 현황을 위한 꿀팁 가이드"],
        "연차 현황을 위한 꿀팁 가이드 설명 1":VacationLang["연차 현황을 위한 꿀팁 가이드 설명 1"],
        "연차 현황을 위한 꿀팁 가이드 설명 2":VacationLang["연차 현황을 위한 꿀팁 가이드 설명 2"],
        "연차 현황을 위한 꿀팁 가이드 설명 3":VacationLang["연차 현황을 위한 꿀팁 가이드 설명 3"],
        "연차 현황을 위한 꿀팁 가이드 설명 4":VacationLang["연차 현황을 위한 꿀팁 가이드 설명 4"],
        "연차 현황을 위한 꿀팁 가이드 설명 5":VacationLang["연차 현황을 위한 꿀팁 가이드 설명 5"],
        "발생 월차" : VacationLang["발생 월차"],
        "이월 월차" : VacationLang["이월 월차"],
        "조건별 상세검색" : VacationLang["조건별 상세검색"],
        "연차 현황 꿀팁 가이드" : VacationLang["연차 현황 꿀팁 가이드"]
    };

    var CompanyHistories = Backbone.View.extend({
        events: {
            "click [data-profile]" : "showProfile",
            "click #baseDate": "showBaseCalendar",
            "click #startHireDateCal": "showStartCalendar",
            "click #endHireDateCal": "showEndCalendar",
            "click #searchBtn": "search",
            "click #resetSearchBtn": "resetSearch",
            "click #vacationManage .showSelectedManagePopup": "showSelectedManagePopup",
            "click #vacationManage .showAllManagePopup": "showAllManagePopup",
            "click #downloadList": "downloadList",
            "click #showUploadPopup": "showUploadPopup",
            "click #vacation_description_icon" : "showDescription",
            "click" : "hideDescription",
            "click #preDate" : "preDate",
            "click #nextDate" : "nextDate",
            "click #mangeSubMenu" : "showManageSubMenu",
            "keyup #userName, #deptName" : "enterSearch"
        },

        getDisplayBaseDate : function(){
            return moment(this.baseDate).format("YYYY.MM.DD");
        },

        showManageSubMenu : function(e) {
            e.stopPropagation();
            this.$el.find("#submenu").show();
        },

        preDate : function() {
            this.changeDate(-1);
        },

        nextDate : function() {
            this.changeDate(1);
        },

        changeDate : function(day){
            var $baseDate = this.$el.find("#baseDate");
            var baseDate = $baseDate.text();
            this.baseDate = moment(baseDate, "YYYY-MM-DD").add("days", day).format("YYYY-MM-DD");
            $baseDate.text(this.getDisplayBaseDate());
            $baseDate.data("basedate", this.baseDate);
            this.search();
        },

        hideDescription: function() {
            this.$el.find("#vacation_description").hide();
            this.$el.find("#submenu").hide();
        },

        showDescription : function(e) {
            e.stopPropagation();
            this.$el.find("#vacation_description").toggle();
        },

        downloadList: function () {
            var self = this;
            var params = this.getParam();
            params["direction"] = this.list.listParams["direction"];
            params["property"] = this.list.listParams["property"];
            var token = new Date().getTime();
            params["downloadTokenId"] = token;
            var path = GO.contextRoot + "api/ehr/vacation/stat/company/list/download";
            var downloadUrl = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') + path;
            $('#download_vacation_form').attr('action', downloadUrl);

            _.each(params, function(value, key){
                $('#download_vacation_form').append('<input type="hidden" name="' + key +'" value="' +value+ '">');
            });

            this.preloader = $.goPreloader();
            this.fileDownloadCheckTimer = window.setInterval(function () {
                var cookieValue = $.cookie('downloadTokenId');
                if (cookieValue == token)
                    self.finishDownload();
            }, 1000);
            $('#download_vacation_form').submit();
            return false;
        },

        finishDownload : function(){
            window.clearInterval(this.fileDownloadCheckTimer);
            $('#download_vacation_form').empty();
            this.preloader.release();
        },

        showUploadPopup: function () {
            var uploaderPopup = new UploaderPopup(this.accountUseEhr);
            var self = this;
            var popupEl = $.goPopup({
                header: lang["연차 초기 설정"],
                width: 500,
                title: "",
                modal: true,
                pclass: "layer_normal layer_annualvacation_set",
                contents: uploaderPopup.$el,
                buttons: [
                    {
                        btype: 'confirm',
                        btext: lang['확인'],//등록하겠습니다.
                        callback: function () {
                            uploaderPopup.submit();
                            popupEl.close();
                            self.list.tables.fnClearTable();
                        }
                    },
                ]
            });

            uploaderPopup.render();
            popupEl.reoffset();
        },


        showAllManagePopup: function () {
            var managePopupView = new ManagePopup("ALL");
            var self = this;
            var popupEl = $.goPopup({
                header: lang["연차 일괄 조정"],
                width: 500,
                title: "",
                modal: true,
                pclass: "layer_normal layer_annualvacation_adjust",
                contents: managePopupView.$el,
                buttons: [
                    {
                        btype: 'confirm',
                        btext: lang['확인'],
                        callback: function () {
                            managePopupView.save();
                            managePopupView.on("save.success", function () {
                                $.goMessage(CommonLang["저장되었습니다."]);
                                self.search();
                                popupEl.close();
                            })
                        }
                    },
                    {
                        btype: 'normal',
                        btext: lang['취소'],
                        callback: function () {
                            popupEl.close();
                        }
                    }
                ]
            });

            managePopupView.render();
            popupEl.reoffset();
        },

        showSelectedManagePopup: function () {
            var ids = this.list.tables.getCheckedIds(),
                type,
                option;

            if (ids.length == 0) {
                $.goError(lang["선택된 사용자가 없습니다."]);
                return;
            }

            if (ids.length > 1) {
                type = "MULTI_SELECTED";
                option = {ids: ids};
            } else {
                type = "SINGLE_SELECTED";
                option = {id: ids[0], accountUseEhr: this.accountUseEhr};
            }

            var managePopupView = new ManagePopup(type, option);
            var self = this;
            var popupEl = $.goPopup({
                header: type == "MULTI_SELECTED" ? lang["연차 일괄 조정"] : lang["연차 조정"],
                width: 500,
                title: "",
                modal: true,
                pclass: "layer_normal layer_annualvacation_adjust",
                contents: managePopupView.$el,
                buttons: [
                    {
                        btype: 'confirm',
                        btext: lang['확인'],
                        callback: function () {
                            managePopupView.save();
                            managePopupView.on("save.success", function () {
                                $.goMessage(CommonLang["저장되었습니다."]);
                                self.search();
                                popupEl.close();
                            })
                        }
                    },
                    {
                        btype: 'normal',
                        btext: lang['취소'],
                        callback: function () {

                            popupEl.close();
                        }
                    }
                ]
            });

            managePopupView.render();
            popupEl.reoffset();
        },

        initialize: function (accountUseEhr) {
            this.accountUseEhr = _.isUndefined(accountUseEhr) ? false : accountUseEhr;
            this.$el.off();
            this.current = GO.util.toMoment();
            this.baseDate = GO.util.customDate(this.current, 'YYYY-MM-DD');
        },

        render: function () {

            this.$el.html(Tmpl({
                lang: lang,
                baseDate: this.baseDate,
                displayBaseDate : this.getDisplayBaseDate()
            }));

            this.$el.find('header.content_top').html(new TitleView().render(lang["전사 연차현황"]).el);

            this.renderList();
            this.renderCustomButtons();
            this.initDatePicker();
            return this;
        },

        renderList: function () {
            var url = GO.contextRoot + "api/ehr/vacation/stat/company/list";
            var self = this;
            this.list = $.goGrid({
                el: this.$el.find('#vacation_list'),
                method: 'GET',
                destroy: true,
                url: url,
                params: {
                    'baseDate': this.baseDate,
                },
                emptyMessage: "<p class='data_null'> " +
                "<span class='ic_data_type ic_no_data'></span>" +
                "<span class='txt'>" + lang["목록없음"] + "</span>" +
                "</p>",
                defaultSorting: [[1, "asc"]],
                checkbox: true,
                checkboxData: 'userId',
                columns: [
                    {
                        mData: "userName", sWidth: '', sClass: "", bSortable: true, fnRender: function (obj) {
                            if (obj.aData.userName) {
                                return '<a data-profile data-id=' + obj.aData.userId + '>' + obj.aData.userName +" "+(obj.aData.positionName?obj.aData.positionName:'')+ '</a>';
                            }
                            return '';
                        }
                    },{
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.deptNames) {
                                return obj.aData.deptNames;
                            }
                            return '';
                        }
                    },

                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.hireDate) {
                                return obj.aData.hireDate;
                            }
                            return '-';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.leaveDate) {
                                return obj.aData.leaveDate;
                            }
                            return '-';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.workingYear != null && obj.aData.workingYear != undefined) {
                                return obj.aData.workingYear;
                            }
                            return '';
                        }
                    },

                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.workingYearPoint != null && obj.aData.workingYearPoint != undefined) {
                                return obj.aData.workingYearPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.publishedMonthPoint != null && obj.aData.publishedMonthPoint != undefined) {
                                return obj.aData.publishedMonthPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.carriedMonthPoint != null && obj.aData.carriedMonthPoint != undefined) {
                                return obj.aData.carriedMonthPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.modifiedPoint != null && obj.aData.modifiedPoint != undefined) {
                                return obj.aData.modifiedPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.sumPoint != null && obj.aData.sumPoint != undefined) {
                                return obj.aData.sumPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.usedPoint != null && obj.aData.usedPoint != undefined) {
                                return obj.aData.usedPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.restPoint != null && obj.aData.restPoint != undefined) {
                                return obj.aData.restPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.userStatus && obj.aData.userStatus != undefined) {
                                return obj.aData.userStatus;
                            }
                            return '';
                        }
                    },
                ],
                fnDrawCallback: function (obj, oSettings, listParams) {
                    $(window).scrollTop(0);
                    self.$el.find('#vacation_list tbody tr').click(function (e) {
                        var $el = $(e.target);
                        if($el.is('input:checkbox')||$el.is('a')||$el.closest('p').is('.data_null')) return;
                        var userId = $el.closest("tr").find('input[name=userId]').val();
                        window.open("/app/ehr/vacation/"+userId, userId,"scrollbars=yes,resizable=yes,width=1280,height=640");
                    });
                }
            })
        },

        renderCustomButtons: function () {
            var critical = [
                '<div class="critical">',
                '<a class="btn_tool" id="showUploadPopup" data-bypass><span class="ic_toolbar setting"></span><span class="txt">' + lang["연차 초기 설정"] + '</span></a>',
                '<div class="wrap_tip_annual">',
                '    <span class="text tit_tip"></span>',
                '    <span class="btn_wrap" id="vacation_description_icon">',
                '        <span class="ic ic_info" title="">',
                '            <span class="layer_tail" id="vacation_description" style="display:none;">',
                '                <i class="ic ic_tail"></i>',
                '                <div class="wrap_help_guide_s">',
                                    lang["연차 현황 꿀팁 가이드"],
                '                </div>',
                '            </span>',
                '        </span>',
                '    </span>',
                '</div>',
                '</div>'
            ].join("");

            // 아래 a class="showSelectedManagePopup 라인은 디자인팀 요청으로 마크업을 개행하면 안됩니다!
            var optional = [
                '<div class="optional">',
                '<div class="btn_submenu" id="vacationManage">',
                '    <a class="showSelectedManagePopup  btn_tool btn_tool_multi" data-role="button" evt-rol="toolbar" evt-act="toolbar-message-delete"><span class="ic_toolbar adjust"></span><span class="txt_caution ">' + lang["연차 조정"] + '</span></a><span id="mangeSubMenu" class="btn_func_more" evt-rol="toolbar" sub="on"><span class="ic ic_arrow_type3"></span></span>',
                '    <div class="array_option delete" id="submenu" style="display:none;">',
                '        <ul id="toolbar_delete" class="array_type">',
                '            <li evt-rol="toolbar-message-delete" class="showSelectedManagePopup"><span>' + lang["연차 조정"] + '</span></li>',
                '            <li evt-rol="toolbar-message-erase" class="showAllManagePopup"><span>' + lang["연차 일괄 조정"] + '</span></li>',
                '        </ul>',
                '    </div>',
                '</div>',
                '<a class="btn_tool" id="downloadList" data-bypass><span class="ic_toolbar download"></span><span class="txt">' + lang["목록 다운로드"] + '</span></a>\n',
                '<form id="download_vacation_form" method="POST" target="ifm_download_vacation_form" style="display: none;"></form>',
                '<iframe name="ifm_download_vacation_form" id="ifm_download_vacation_form" style="border:0px;width:0px;height:0px;"></iframe>',
                '</div>'
            ].join("");

            var toolBar = this.$el.find('#middle_tool_bar');
            toolBar.append(critical);
            toolBar.append(optional);

            this.customGridView();
        },
        customGridView:function(){

            var self = this;
            var lengthEl = this.$el.find('#vacation_list_length');
            var opt= this.$el.find('.optional');
            lengthEl.appendTo(opt);

            var select = lengthEl.find("select[name=vacation_list_length]");
            select.addClass('select_box')

            var tbs = this.$el.find('#vacation_list_wrapper').find('.tool_bar');

            for(var i =0 , tb; tb = tbs[i]; i ++){
                if( !$(tb).hasClass('tool_absolute')){
                   $(tb).attr('style', 'display:none')
                }
            }

            this.$el.find('#ehr_checkbox1').click(function(e) {
                self.$el.find('#vacation_list').find('input[type=checkbox]').not('[disabled]').attr('checked',$(e.currentTarget).is(':checked') );
            });
        },

        xlsxDownload: function () {
            var url = GO.contextRoot + "api/ehr/vacation/histories/download";
            var searchDate = this.$el.find("#searchDate").attr("data-date");
            var startDate = GO.util.toMoment(searchDate).startOf("years").format("YYYY-MM-DD");
            var endDate = GO.util.toMoment(searchDate).endOf("years").format("YYYY-MM-DD");

            var params = {
                property: "startDate",
                direction: "desc",
                startDate: startDate,
                endDate: endDate
            }

            window.location.href = url + "?" + $.param(params);
        },

        showProfile : function(e) {
            e.stopPropagation();
            var target = e.currentTarget;
            var userId = $(target).attr("data-id");
            if (!userId) return;
            ProfileView.render(userId, target);
        },

        enterSearch: function (e) {
            if (e.keyCode != "13") {
                return;
            }

            this.search();
        },

        search: function () {
            var params = this.getParam();
            this.reloadList(params);
        },

        reloadList: function (params) {
            this.list.tables.customParams = params;
            this.list.tables.fnClearTable();
        },

        getParam: function () {
            var params = {
                baseDate: this.$el.find("#baseDate").data("basedate"),
                startHireDate: this.$el.find("#startHireDate").val() ? moment(new Date(this.$el.find("#startHireDate").val()).setHours(0)).format("YYYY-MM-DDTHH:mm:ss.SSSZ") : '',
                endHireDate: this.$el.find("#endHireDate").val() ? moment(new Date(this.$el.find("#endHireDate").val()).setHours(0)).format("YYYY-MM-DDTHH:mm:ss.SSSZ") : '',
                deptName: this.$el.find("#deptName").val(),
                userName: this.$el.find("#userName").val(),
                userStatus: this.$el.find("#status").val()
            };

            return params;
        },

        showBaseCalendar: function () {
            this.$el.find("#baseDatePicker").focus();
        },

        showStartCalendar: function () {
            this.$el.find("#startHireDatePicker").focus();
        },

        showEndCalendar: function () {
            this.$el.find("#endHireDatePicker").focus();
        },

        resetSearch: function () {
            this.$el.find("#baseDate").val(GO.util.customDate(this.current, 'YYYY-MM-DD'));
            this.$el.find("#startHireDate").val("");
            this.$el.find("#endHireDate").val("");
            this.$el.find("#deptName").val("");
            this.$el.find("#userName").val("");
            this.$el.find("input#all").prop("checked", true);

        },
        // 상단의 월 기준
        initDatePicker: function () {
            var baseDatePicker = this.$el.find("#baseDatePicker");
            $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
            baseDatePicker.datepicker({
                dateFormat: "yy.mm.dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onSelect: $.proxy(function (selectedDate) {
                    this.baseDate = moment(selectedDate, "YYYY-MM-DD").format("YYYY-MM-DD");
                    var $baseDate = this.$el.find("#baseDate");
                    $baseDate.data("basedate", this.baseDate);
                    $baseDate.text(this.getDisplayBaseDate());
                    this.search();
                }, this)
            });
            var startHireDatePicker = this.$el.find("#startHireDatePicker");
            $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
            startHireDatePicker.datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onSelect: $.proxy(function (selectedDate) {
                    $("#startHireDate").val(selectedDate);
                    endHireDatePicker.datepicker("option", "minDate", selectedDate);
                }, this)
            });
            var endHireDatePicker = this.$el.find("#endHireDatePicker");
            $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
            endHireDatePicker.datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onSelect: $.proxy(function (selectedDate) {
                    $("#endHireDate").val(selectedDate);
                }, this)
            });
        },

    });


    return CompanyHistories;

});
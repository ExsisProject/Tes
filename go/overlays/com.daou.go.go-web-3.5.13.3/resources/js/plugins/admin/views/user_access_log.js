define("admin/views/user_access_log", function (require) {

    var $ = require("jquery");
    var Backbone = require("backbone");
    var GO = require("app");

    var userAccessLogTmpl = require("hgn!admin/templates/user_access_log");
    var emptyTmpl = require("hgn!admin/templates/list_empty");

    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");

    require("jquery.go-grid");
    require("GO.util");

    var lang = {
        download: adminLang["목록 다운로드"],
        limit_message: adminLang["목록 다운로드 기간 제한"],
        required_date_message: adminLang["목록 다운로드 필수값 입력 요청"],
        search_total_result: adminLang["0개의 데이터가 검색되었습니다."],
        search_duration: adminLang["기간"],
        recent_7d: adminLang["최근 7일간"],
        recent_15d: adminLang["최근 15일간"],
        recent_30d: adminLang["최근 30일간"],
        date_input: adminLang["직접입력"],

        name : commonLang["이름"],
        email : commonLang["이메일"],
        dept: adminLang["부서"],
        login_event_type: adminLang["상태"],
        site_type: adminLang["유형"],
        ip: adminLang["IP"],
        device: adminLang["디바이스"],
        browser: adminLang["브라우저"],
        os: adminLang["운영체제"],
        time: commonLang["시간"],

        search : commonLang["검색"],
        reset : adminLang["초기화"],
        detail_search : commonLang["상세검색"],
        simple_search: commonLang["기본 검색"],
        open : commonLang["열기"],
        close : commonLang["닫기"]
    };

    var UserAccessLogList = Backbone.View.extend({
        el : '#layoutContent',

        events : {
            "click #searchBtn" : "_renderUserAccessLogList",
            "change #selectDateOpt" : "_changeSelectDateOpt",
            "click #userAccessLogCvsDownload" : "_downloadCsv",
            "click #detailSearch" : "_showDetail",
            "click #simpleSearch" : "_showSimple",
            "click #reset" : "_reset"
        },

        initialize : function() {
            this.listEl = '#userAccessLogList';
            this.dataTable = null;

            this.loginEventTypes = this._getListOfType('loginevent');
            this.accuracyTypes = this._getListOfType('accuracy');
            this.clientTypes = this._getListOfType('client');
            this.siteTypes= [{name:'ADMIN'},{name:'USER'}];
        },

        _getListOfType : function(type) {
            var typeList = [];
            $.ajax({
                type: "GET",
                async: false,
                url: GO.contextRoot + "ad/api/useraccesslog/types/" + type,
                success: function (resp) {
                    typeList = resp.data;
                }
            });
            return typeList;
        },

        render : function() {
            var self = this;
            this.$el.empty();
            this.$el.html(userAccessLogTmpl({
                lang : lang,
                accuracyTypes : self.accuracyTypes,
                loginEventTypes : self.loginEventTypes,
                clientTypes : self.clientTypes,
                siteTypes:self.siteTypes
            }));

            this.$searchArea = this.$el.find("#simpleSearchArea");
            this._initDate();
            this._initAccuracy();
            this._renderUserAccessLogList();
        },

        _renderUserAccessLogList : function(){
            if(this.dataTable != null) {
                this.dataTable.tables.fnDestroy();
            }

            function wrappingSpan(wrappingTarget, spanClassName) {
                var spanClassName = _.isUndefined(spanClassName) ? 'txt' : spanClassName;
                var tpl = ['<span class="'+spanClassName+'">', wrappingTarget, '</span>'];
                return tpl.join('');
            }

            var self = this;
            this.dataTable = $.goGrid({
                el : this.listEl,
                method : 'GET',
                url : GO.contextRoot + 'ad/api/useraccesslog/list'+ self.getQueryParam(),
                emptyMessage : emptyTmpl({
                    label_desc : commonLang['검색결과없음']
                }),
                defaultSorting : [[ 0, "desc" ]],
                sDomType : 'admin',
                params : {
                    'page' : this.page
                },
                displayLength : GO.session('adminPageBase'),
                pageUse : true,
                columns : [
                    { mData: "createdAt", bSortable: true, fnRender : function(obj) {
                        return wrappingSpan(GO.util.basicDate(obj.aData.createdAt));
                        }},
                    { mData: "user", sWidth: '200px', bSortable: true, fnRender : function(obj) {
                        if (obj.aData.user.name) {
                            return wrappingSpan(obj.aData.user.name) + wrappingSpan('('+obj.aData.user.email+')', 'txt2');
                        }
                        return wrappingSpan(obj.aData.loginId);
                        }},
                    { mData : function(objAdata) {
                        var wrappingTarget = objAdata.deptName ? objAdata.deptName : "-";
                        return wrappingSpan(wrappingTarget);
                        }, sWidth: "150px", bSortable: false},
                    { mData: "loginEventType", bSortable: true, fnRender : function(obj) {
                        var label_state = obj.aData.securityRiskLevel == "NORMAL"? 'normal':'abnormal';
                        return wrappingSpan(obj.aData.loginEventMessage, 'label_state '+label_state);
                        }},

                    { mData : "siteType", bSortable: true, fnRender: function(obj) {
                            return wrappingSpan(obj.aData.siteType);
                        }},
                    { mData : "ip", sWidth: '200px', bSortable: false, fnRender: function(obj) {
                        return wrappingSpan(obj.aData.ip);
                        }},
                    { mData : "clientType", bSortable: true, fnRender: function(obj) {
                        return wrappingSpan(obj.aData.clientType);
                        }},
                    { mData : "browser", bSortable: false, fnRender: function(obj) {
                        return wrappingSpan(obj.aData.browser);
                        }},
                    { mData : "os", bSortable: false, fnRender: function(obj) {
                        return wrappingSpan(obj.aData.os);
                        }}
                ],
                fnDrawCallback : function(obj, aoParams) {
                    var totalCountText = GO.i18n(lang.search_total_result, {
                        "arg0": aoParams._iRecordsTotal.toLocaleString(),
                    });
                    var totalCountTpl = ['<div class="critical"><span>',totalCountText,'</span></div>'];
                    var downTpl = ['<div class="optional"><span class="btn_tool" id="userAccessLogCvsDownload">',
                    lang.download, '</span></div>'];
                    self.$el.find('.toolbar_top').empty();
                    self.$el.find('.toolbar_top').append(totalCountTpl.join(""));
                    self.$el.find('.toolbar_top').append(downTpl.join(""));
                }
            });
        },

        getQueryParam: function () {
            var selectedParam = {};
            var $searchArea = this.$searchArea;
            $searchArea.find(".param_check input:checkbox:checked").each(function(){
                var searchClassName = $(this).closest("th").attr("class");
                var $itemWrapper = $searchArea.find("td."+searchClassName+ " span[class^='wrap_']");

                $itemWrapper.each(function(){
                    var paramKey, paramValue;
                    if ($(this).hasClass("wrap_txt") || $(this).hasClass("wrap_date")) {
                        paramKey = $(this).find("input").attr("id");
                        paramValue = $(this).find("input").val();
                    } else if ($(this).hasClass("wrap_select")) {
                        paramKey = $(this).find("select").attr("id");
                        paramValue = $(this).find("option:selected").val();
                    } else {
                        return;
                    }

                    // converter
                    if (paramKey.indexOf('StartDate') >= 0) {
                        selectedParam['startDate'] = paramValue;
                    } else if (paramKey.indexOf('EndDate') >= 0) {
                        selectedParam['endDate'] = paramValue;
                    } else {
                        selectedParam[paramKey] = paramValue;
                    }
                });
            });

            selectedParam["accuracy"] = $searchArea.find("select#accuracy option:selected").val();
            return '?' + $.param(selectedParam);
        },

        _initDate : function() {
            $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );

            this._initDatepicker("#simpleStartDate", "#simpleEndDate");
            this._initDatepicker("#detailStartDate", "#detailEndDate");

            this._getAreas().forEach(function(area) {
                area.find("select#selectDateOpt option[value='7d']").attr('selected', true).trigger('change');
            }, this);
        },

        _initDatepicker: function(startEl, endEl) {
            var self = this;
            var startDate = this.$el.find(startEl);
            var endDate = this.$el.find(endEl);

            endDate.val(GO.util.now().format("YYYY-MM-DD"));
            startDate.val(GO.util.now().add('days', -6).format('YYYY-MM-DD'));

            startDate.datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                maxDate : endDate.val()
            });

            endDate.datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onClose : function(selectedDate){
                    self._changeDateHandler(selectedDate);
                }
            });
        },

        _initAccuracy : function() {
            this._getAreas().forEach(function(area) {
                area.find("select#accuracy option[value='LIKE']").attr("selected", true);
            }, this);
        },

        _changeDateHandler : function(selectedDate){
            var startDate = this._getStartDate();
            var endDate = this._getEndDate();
            var selectDateOpt = this.$searchArea.find('select#selectDateOpt option:selected').val();
            switch(selectDateOpt) {
                case 'custom':
                    startDate.datepicker('option', 'maxDate', selectedDate);
                    break;
                case '7d':
                    var day = GO.util.toMoment(endDate.val()).add('days',-6).format('YYYY-MM-DD');
                    startDate.val(day);
                    break;
                case '15d':
                    var day = GO.util.toMoment(endDate.val()).add('days',-14).format('YYYY-MM-DD');
                    startDate.val(day);
                    break;
                case '30d':
                    var day = GO.util.toMoment(endDate.val()).add('days',-29).format('YYYY-MM-DD');
                    startDate.val(day);
                    break;
            }

            this._dateDisabledHandler();
        },

        _dateDisabledHandler : function(){
            var selectDateOpt = this.$searchArea.find('select#selectDateOpt option:selected').val();
            var startDate = this._getStartDate();
            if(selectDateOpt == 'custom'){
                startDate.attr('disabled', false);
            } else {
                startDate.attr('disabled', true);
            }
        },

        _changeSelectDateOpt : function(){
            var endDate = this._getEndDate();
            this._changeDateHandler(endDate.val());
        },

        _downloadCsv : function() {
            var startDate = this._getStartDate().val();
            var endDate = this._getEndDate().val();
            var durationCheck = this.$searchArea.find("#searchDurationCheck").is(":checked");

            if (!startDate || !endDate || !durationCheck) {
                $.goMessage(lang.required_date_message);
                return;
            }
            if (GO.util.daysDiff(startDate, endDate) > 30) {
                $.goMessage(lang.limit_message);
                return;
            }
            var url = "ad/api/useraccesslog/download";
            GO.util.downloadCsvFilePreventDuplicate(url + this.getQueryParam());
        },
        _showSimple:function(){
            this._toggleSearch(false)
        },
        _showDetail : function() {
            this._toggleSearch(true)
        },
        _toggleSearch: function(detail) {
            if(detail) { // 상세검색 open
                this.$searchArea.hide();
                this.$searchArea = this.$el.find("#detailSearchArea");
                this.$searchArea.show();
            } else {
                this.$searchArea.hide();
                this.$searchArea = this.$el.find("#simpleSearchArea");
                this.$searchArea.show();
                this.$searchArea.find("#nameCheck").prop("checked", true).hide();
            }
        },
        _reset: function() {
            this.$searchArea.find('input:text').val('');
            this.$searchArea.find('input:checkbox').removeAttr('checked');
            this.$searchArea.find('select').prop('selectedIndex', 0);
            this._initDate();
        },

        _getAreas: function() {
            return [this.$el.find("#simpleSearchArea"), this.$el.find("#detailSearchArea")];
        },

        _getStartDate: function() {
            var isSimpleArea = this.$el.find("#simpleSearchArea").is(":visible");
            if (isSimpleArea) {
                return this.$el.find('#simpleStartDate');
            } else {
                return this.$el.find('#detailStartDate');
            }
        },

        _getEndDate: function() {
            var isSimpleArea = this.$el.find("#simpleSearchArea").is(":visible");
            if (isSimpleArea) {
                return this.$el.find('#simpleEndDate');
            } else {
                return this.$el.find('#detailEndDate');
            }
        }
    });

    return UserAccessLogList;
});

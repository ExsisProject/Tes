define("admin/views/openapi/openapi_management", function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");
    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require("i18n!nls/commons");

    var openApiScope = require("admin/constants/openapi_scope");

    var BaseTmpl = require("hgn!admin/templates/openapi/openapi_management");
    var ClientManagementTmpl = require("hgn!admin/templates/openapi/client_management");
    var OpenApiStatTmpl = require("hgn!admin/templates/openapi/openapi_stats");

    require("jquery.go-grid");

    var lang = {
        '클라이언트설정': adminLang['클라이언트 설정'],
        'API통계': "API " + adminLang['통계'],
        '추가': commonLang['추가'],
        '삭제': commonLang['삭제'],
        '클라이언트이름': adminLang['클라이언트 이름'],
        "서비스URL": adminLang['서비스 URL'],
        "등록일": adminLang['등록일'],
        "검색": commonLang['검색'],
        "목록없음": adminLang['목록없음'],
        "삭제대상을선택해주세요": commonLang['삭제 대상을 선택해 주세요'],
        "삭제": commonLang['삭제'],
        "삭제하시겠습니까": commonLang['삭제하시겠습니까?'],
        "삭제되었습니다": commonLang["삭제되었습니다."]
    };

    var statLang = {
        "날짜": adminLang["날짜"],
        "검색": commonLang['검색'],
        "기간": commonLang['기간'],
        "구분": adminLang['구분'],
        "카테고리": adminLang['카테고리'],
        "성공": commonLang['성공'],
        "실패": commonLang['실패'],
        "전체": commonLang['전체'],
        "사용자": commonLang['사용자'],
        "서버": adminLang['서버']
    };

    var OpenApiManagementView = App.BaseView.extend({
        events: {
            "click #openapi_tab li": "changeTab",
            "click #client_management #search": "searchClient",
            "keydown #client_management span.search_wrap input": "searchClientKeyboardEvent",
            "click #client_management #add_client": "addOAuthClients",
            "click #client_management #remove_client": "deleteOAuthClients",
            "click #btn_stat_search": "searchStats"
        },

        initialize: function () {
            this.active_tab = "client";
        },

        render: function () {
            this.$el.html(BaseTmpl({'lang': lang}));
            this.renderViewByActiveTab();
            return this;
        },
        renderClientGrid: function () {
            var self = this;
            this.dataTable = $.goGrid({
                el: '#client_table',
                method: 'GET',
                destroy: true,
                url: GO.contextRoot + 'ad/api/oauthclient/company/list',
                emptyMessage: "<p class='data_null'> " +
                    "<span class='ic_data_type ic_no_data'></span>" +
                    "<span class='txt'>" + lang.목록없음 + "</span>" +
                    "</p>",
                defaultSorting: [],
                sDomType: 'admin',
                checkbox: true,
                checkboxData: 'id',
                displayLength: GO.session('adminPageBase'),
                columns: [
                    {
                        mData: "koName", sClass: "subject", bSortable: true, fnRender: function (obj) {
                            var clientName = obj.aData.koName;
                            return "<span data-type='title' data-id='" + obj.aData.id + "'>" + clientName + "</span>";
                        }
                    },
                    {mData: "clientId", sWidth : "250px", bSortable: false},
                    {mData: "baseUrl", sWidth : "250px", bSortable: false},
                    {mData: "redirectUrl", sWidth : "250px", bSortable: false},
                    {
                        mData: null, bSortable: true, sWidth : "100px",
                        fnRender: function (obj) {
                            return GO.util.customDate(obj.aData.createdAt, "YYYY-MM-DD");
                        }
                    },
                ],
                fnDrawCallback: function (obj, oSettings, listParams) {
                    self.$el.find('#checkedAll').attr('checked', false);
                    self.$el.find(this.el + " tr>td.subject span[data-type='title']").css('cursor', 'pointer').click(function (e) {
                        var url = "company/openapi/" + $(e.currentTarget).attr("data-id");
                        GO.router.navigate(url, {trigger: true});
                    });
                }
            }).tables;
        },

        renderStatGrid: function () {
            this.statDataTable = $.goGrid({
                el: '#stat_table',
                method: 'GET',
                destroy: true,
                url: GO.contextRoot + 'ad/api/stat/openapi2',
                emptyMessage: "<p class='data_null'> " +
                    "<span class='ic_data_type ic_no_data'></span>" +
                    "<span class='txt'>" + lang.목록없음 + "</span>" +
                    "</p>",
                defaultSorting: [],
                sDomType: 'admin',
                checkbox: false,
                displayLength: GO.session('adminPageBase'),
                columns: [
                    {mData: "reportDate", sWidth: "100px", bSortable: false},
                    {mData: "clientId", sWidth: "250px", bSortable: false},
                    {
                        mData: "apiType", sWidth: "100px", bSortable: false, fnRender: function (obj) {
                            var apiType = obj.aData.apiType;
                            return apiType === "USER" ? statLang.사용자 + " API" : statLang.서버 + " API";
                        }
                    },
                    {
                        mData: "category", sWidth: "150px", bSortable: false, fnRender: function (obj) {
                            var category = obj.aData.category;
                            return openApiScope.find(scope => scope.key === category).value;
                        }
                    },
                    {mData: "apiOperation", bSortable: false},
                    {mData: "successCount", sWidth: "100px", bSortable: false},
                    {mData: "failCount", sWidth: "100px", bSortable: false},
                    {mData: "totalCount", sWidth: "100px", bSortable: false}
                ]
            }).tables;
        },
        changeTab: function (e) {
            var target = $(e.currentTarget);
            this.active_tab = target.find("span").attr('data-type');
            this.$el.find('#openapi_tab li').removeClass('active');
            target.addClass('active');
            this.renderViewByActiveTab();
        },
        renderViewByActiveTab: function () {
            if (this.active_tab == "client") {
                this.$el.find("#tab_content").html(ClientManagementTmpl({'lang': lang}));
                this.renderClientGrid();
            } else {
                this.$el.find("#tab_content").html(OpenApiStatTmpl({'lang': statLang, 'openApiScope': openApiScope}));
                this.renderStatSearchParamInit();
                this.renderStatGrid();
            }
        },
        renderStatSearchParamInit: function () {
            $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
            var startDate = this.$el.find("#startDate"),
                endDate = this.$el.find("#endDate");

            this.$el.find("#startDate").val(GO.util.fromNow('days', -7).format("YYYY-MM-DD"));
            this.$el.find("#endDate").val(GO.util.now().format("YYYY-MM-DD"));

            startDate.datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onClose: function (selectedDate) {
                    endDate.datepicker("option", "minDate", selectedDate);
                }
            });

            endDate.datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                minDate: startDate.val()
            });
            return this;
        },

        searchStats: function () {
            this.statDataTable.setSearchParam(this.getStatSearchParam());
        },
        getStatSearchParam: function () {
            var startDate = GO.util.toISO8601(GO.util.toMoment($('#startDate').val()));
            var endDate = GO.util.toISO8601(GO.util.toMoment($('#endDate').val()).add('days', 1).subtract('seconds', 1));
            var apiType = $('#apiType').val();
            var category = $('#category').val();
            var apiOperation = $.trim($('#apiOperation').val());
            var clientId = $.trim($('#clientId').val());

            var param = {
                startDate: startDate,
                endDate: endDate,
                apiType: apiType,
                category: category,
                apiOperation: apiOperation,
                clientId: clientId
            };

            return param;
        },
        searchClient: function () {
            var searchEl = this.$el.find(".table_search #searchkeyword");
            var keyword = searchEl.val();
            var searchtype = this.$el.find('#searchtype').val();
            this.dataTable.search(searchtype, keyword, searchEl);
        },

        searchClientKeyboardEvent: function (e) {
            if (e.keyCode == 13) {
                this.searchClient();
            }
        },

        addOAuthClients: function () {
            GO.router.navigate("company/openapi/create", {trigger: true});
        },

        deleteOAuthClients: function (e) {
            var ids = this.dataTable.getCheckedIds(),
                url = GO.contextRoot + "ad/api/oauthclient",
                self = this;

            var checkClientCnt = $('#client_table').find('tbody input[type="checkbox"]:checked').length;
            if (checkClientCnt != ids.length) return;
            if (ids.length == 0) {
                $.goMessage(lang.삭제대상을선택해주세요);
                return;
            }

            $.goConfirm(lang.삭제, lang.삭제하시겠습니까, function () {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    data: JSON.stringify(ids),
                    dataType: 'json',
                    contentType: "application/json",
                    url: url
                }).done(function (response) {
                    $.goMessage(lang.삭제되었습니다);
                    self.dataTable.reload();
                });
            });
        }
    });
    return OpenApiManagementView;
});

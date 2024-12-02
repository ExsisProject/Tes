(function () {
define([
        "jquery",
        "backbone",
        "app",
        "system/models/openapi_config",
        "hgn!system/templates/oauth_client_list",
        "hgn!system/templates/list_empty",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "jquery.go-grid",
        "jquery.go-sdk",
        "GO.util"
    ],

    function (
        $,
        Backbone,
        App,
        OpenApiModel,
        listTmpl,
        emptyTmpl,
        commonLang,
        adminLang
    ) {
        var lang = {
            '통합인증 클라이언트': adminLang['통합인증 클라이언트'],
            '클라이언트 이름': adminLang['클라이언트 이름'],
            '등록일': adminLang['등록일'],
            '서비스 URL': adminLang['서비스 URL'],
            '비고': adminLang['비고'],
            '메뉴': commonLang['메뉴'],
            '사용여부': adminLang["사용여부"],
            '사용' : commonLang["사용"],
            '사용하지않음' : commonLang["사용하지 않음"],
            '저장': commonLang['저장']
        };
        var oauthView = Backbone.View.extend({
            el: '#layoutContent',
            events : {
                "click #btn_openapi_ok" : "saveOpenApiConfig"
            },
            initialize: function () {
                this.listEl = '#oauthClientList';
                this.dataTable = null;
                this.openApiModel = OpenApiModel.get();
                this.unbindEvent();
                this.bindEvent();
            },
            unbindEvent: function () {
            },
            bindEvent: function () {
            },
            render: function () {
                $('.breadcrumb .path').html(adminLang['통합인증 클라이언트']);
                this.$el.empty();
                this.$el.html(listTmpl({
                    lang: lang,
                    openApi: this.openApiModel.toJSON()
                }));
                this.renderOAuthClientList();
            },
            renderOAuthClientList: function () {
                this.$tableEl = this.$el.find('#oauthClientList');
                this.dataTable = $.goGrid({
                    el: this.listEl,
                    method: 'GET',
                    url: GO.contextRoot + 'ad/api/oauthclient/system/list',
                    emptyMessage: emptyTmpl({
                        label_desc: adminLang["표시할 데이터 없음"]
                    }),
                    pageUse: true,
                    sDomUse: true,
                    checkbox: false,
                    sDomType: 'admin',
                    defaultSorting: [[1, "desc"]],
                    displayLength: App.session('adminPageBase'),
                    columns: [
                        {
                            mData: "koName", sWidth: '200px', bSortable: true, fnRender: function (obj) {
                                return obj.aData.koName;
                            }
                        },
                        {
                            mData: "createdAt", sWidth: '150px', bSortable: true, fnRender: function (obj) {
                                return GO.util.basicDate(obj.aData.createdAt);
                            }
                        },
                        {
                            mData: "clientId", bSortable: false, fnRender: function (obj) {
                                return obj.aData.clientId;
                            }
                        },
                        {
                            mData: "baseUrl", bSortable: false, fnRender: function (obj) {
                                return obj.aData.baseUrl;
                            }
                        },
                        {
                            mData: "redirectUrl", bSortable: false, fnRender: function (obj) {
                                return obj.aData.redirectUrl;
                            }
                        },
                        {
                            mData: "description", bSortable: false, fnRender: function (obj) {
                                var desc = obj.aData.description;
                                if (_.isNull(desc) || _.isUndefined(desc) || _.isEmpty(desc)) {
                                    return "-";
                                } else {
                                    return obj.aData.description;
                                }
                            }
                        }
                    ],
                    fnDrawCallback: function (obj) {
                    }
                });
            },
            saveOpenApiConfig: function () {
                var openApiUse = $("input[name='openApiUse']:checked").val();
                this.openApiModel.set("openApiUse", openApiUse == 'on' ? true : false);
                this.openApiModel.save({}, {
                    success : function(model, response) {
                        if(response.code == '200') {
                            $.goMessage(commonLang["저장되었습니다."]);
                        }
                    },
                    error : function(model, response) {
                        $.goAlert(commonLang["실패"],commonLang["실패했습니다."]);
                    }
                })
            }
        }, {
            __instance__: null
        });

        return oauthView;
    });
}).call(this);

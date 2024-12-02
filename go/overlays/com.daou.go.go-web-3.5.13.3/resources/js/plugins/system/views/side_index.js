define([
        "jquery",
        "backbone",
        "app",
        "hgn!admin/templates/side_hidden_menus",
        "i18n!admin/nls/admin"
    ],

    function (
        $,
        Backbone,
        App,
        layoutTpl,
        adminLang
    ) {
        var instance = null,
            tmplVar = {
                'label_index': adminLang["검색/푸쉬"],
                'label_cache': adminLang["캐시 관리"],
                'label_schedule': adminLang["스케줄 관리"],
                'label_webrevision': adminLang["webRevision 관리"],
                'label_log': adminLang["로그 레벨 설정"],
                'label_gadgetspec': adminLang["가젯 명세서 관리"],
                'label_customize_register': adminLang["커스터마이즈 등록"],
                'label_search_indexing': adminLang["검색 인덱싱"],
                'label_extension_function': adminLang["확장 기능 관리"],
                'label_color_style': adminLang["color style 관리"],
                'label_admin_job': adminLang["AdminJob 관리"],
                'label_data_init': adminLang["데이터 초기화"],
                'label_custom_profile_config': adminLang["커스텀 프로필 관리"],
                'label_google_analytics': adminLang["Google Analytics 관리"],
                'label_attnd_sync_config': adminLang["근태 동기화 설정"],
                'label_db_config': adminLang["DB 설정"],
                'label_sync_config': adminLang["데이터 동기화 설정 / 수행"],
                'label_display_config': adminLang["DisplayConfig 관리"],
                'label_ehr_stat': adminLang["근태 통계"],
                'label_ecd_config': adminLang["데이터 백업 설정"],
                'label_oauth_clients': adminLang['통합인증 클라이언트'],
                'label_gotalk_config': adminLang["Gotalk 설정"],
                'label_vacation_history_corrector': adminLang['근태 이력 관리'],
                'label_chat_bot_config': 'chat bot config',
                'label_site_control_option': "사이트 제어 옵션",
                'label_lab_feedback': '실험실 피드백 설정'
            };

        var layoutView = Backbone.View.extend({

            el: '.admin_side',
            events: {
                'click ul.admin li': 'movePage'
            },

            movePage: function (e) {
                var target = $(e.currentTarget);
                App.router.navigate(target.attr('data-url'), {trigger: true, pushState: true});

            },

            initialize: function () {
                this.$el.off();
            },

            render: function (args) {
                var isActive = function () {
                    if (args == this.leftName) return true;
                    return false;
                };

                var menus = [{
                    leftName: "index",
                    href: 'system/extension/index',
                    name: tmplVar['label_index'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "cache",
                    href: 'system/extension/cache',
                    name: tmplVar['label_cache'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "schedule",
                    href: 'system/extension/schedule',
                    name: tmplVar['label_schedule'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "webrevision",
                    href: 'system/extension/webrevision',
                    name: tmplVar['label_webrevision'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "log",
                    href: 'system/extension/log',
                    name: tmplVar['label_log'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "gadgetspec",
                    href: 'system/extension/gadgetspec',
                    name: tmplVar['label_gadgetspec'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "customize",
                    href: 'system/extension/customize',
                    name: tmplVar['label_customize_register'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "searcher",
                    href: 'system/extension/searcher',
                    name: tmplVar['label_search_indexing'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "extensionfunc",
                    href: 'system/extension/extensionfunc',
                    name: tmplVar['label_extension_function'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "colorstyle",
                    href: 'system/extension/colorstyle',
                    name: tmplVar['label_color_style'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "adminjob",
                    href: 'system/extension/adminjob',
                    name: tmplVar['label_admin_job'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "datainit",
                    href: 'system/extension/datainit',
                    name: tmplVar['label_data_init'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "customProfileConfig",
                    href: 'system/extension/customprofile/config',
                    name: tmplVar['label_custom_profile_config'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "tmwConfig",
                    href: 'system/extension/tmw',
                    name: "TMW 연동",
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "attndSyncConfig",
                    href: 'system/extension/attndSyncConfig',
                    name: tmplVar['label_attnd_sync_config'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "frontNotice",
                    href: 'system/extension/frontnotice',
                    name: "로그인페이지 공지",
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "dbConfig",
                    href: 'system/extension/dbconfig',
                    name: tmplVar['label_db_config'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "syncConfig",
                    href: 'system/extension/syncconfig',
                    name: tmplVar['label_sync_config'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "displayConfigModel",
                    href: 'system/extension/displayconfig',
                    name: tmplVar['label_display_config'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "googleAnalytics",
                    href: 'system/extension/googleanalytics',
                    name: tmplVar['label_google_analytics'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "ehrStat",
                    href: 'system/extension/ehrStat',
                    name: tmplVar['label_ehr_stat'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "ecdConfig",
                    href: 'system/extension/ecdconfig',
                    name: tmplVar['label_ecd_config'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "gotalkConfig",
                    href: 'system/extension/gotalkconfig',
                    name: tmplVar['label_gotalk_config'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "oauthClients",
                    href: 'system/extension/oauthclients',
                    name: tmplVar['label_oauth_clients'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "vacationCorrector",
                    href: 'system/extension/vacationCorrector',
                    name: tmplVar['label_vacation_history_corrector'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "chatBotConfig",
                    href: 'system/extension/chatbotconfig',
                    name: tmplVar['label_chat_bot_config'],
                    isShow: true,
                    isActive: isActive
                }, {
                    leftName: "feedbackConfig",
                    href: 'system/extension/laboratory/feedback/configs',
                    name: tmplVar['label_lab_feedback'],
                    isShow: GO.useLabFeedback,
                    isActive: isActive
                }];

                if (GO.session().brandName == "DO_INSTALL") {
                    menus.push({
                        leftName: "sitecontroloption",
                        href: 'system/extension/sitecontroloption',
                        name: tmplVar['label_site_control_option'],
                        isShow: true,
                        isActive: isActive
                    });
                }

                this.$el.html(layoutTpl({
                    contextRoot: GO.contextRoot,
                    menus: menus
                }));

                GO.util.setTopMenu('baseTopMenu');
            }
        });

        return {
            render: function (args) {
                if (instance === null) instance = new layoutView();
                return instance.render(args);
            }
        };
    });

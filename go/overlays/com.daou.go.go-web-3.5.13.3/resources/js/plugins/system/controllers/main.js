//시스템어드민
define("system/controllers/main", function (require) {
    var App = require("app");
    var Layout = require("views/layouts/system_default");
    var InstallLayout = require("views/layouts/install_default");
    var adminLang = require("i18n!admin/nls/admin");

    var SystemAdminController = (function () {
        var Controller = function () {

        };

        Controller.prototype = {

            /**
             * 팩키지 설치 및 디폴트 사이트 기본설정
             */
            installRenderCreateDomain: function () {
                this.installRenderer("system/views/domain_create", "system/views/nav_install", "domain", {el: "#installLayout"});
            },
            installRenderModifyDomain: function (domainId) {
                this.installRenderer("system/views/domain_create", "system/views/nav_install", "domain", {
                    el: "#installLayout",
                    domainId: domainId
                });
            },
            installRenderCreateSite: function () {
                this.installRenderer("system/views/site_create", "system/views/nav_install", "site", {el: "#installLayout"});
            },
            installRenderInstallComplete: function () {
                this.installRenderer("system/views/install_complete", "system/views/nav_install", "done");
            },

            /**
             * 도메인 / 사이트 관리
             */
            renderSiteSystem: function () {
                this.renderer("site", "system/views/site_list", "system/views/side_site", adminLang["사이트 목록"]);
            },
            renderSiteCreateSystem: function () {
                this.renderer("site", "system/views/site_create", "system/views/side_site", adminLang["사이트 추가"], {el: "#layoutContent"});
            },
            renderSiteModifySystem: function (siteId) {
                this.renderer("site", "system/views/site_create", "system/views/side_site", adminLang["사이트 수정"], {
                    el: "#layoutContent",
                    siteId: siteId
                });
            },
            renderSiteGroupSystem: function () {
                this.renderer("sitegroup", "system/views/sitegroup_list", "system/views/side_site", adminLang["사이트 그룹 목록"]);
            },
            renderSiteGroupCreateSystem: function () {
                this.renderer("sitegroup", "system/views/sitegroup_detail", "system/views/side_site", adminLang["사이트 그룹 추가"], {el: "#layoutContent"});
            },
            renderSiteGroupModifySystem: function (siteGroupId) {
                this.renderer("sitegroup", "system/views/sitegroup_detail", "system/views/side_site", adminLang["사이트 그룹 수정"], {
                    el: "#layoutContent",
                    siteGroupId: siteGroupId
                });
            },
            renderSystemDomain: function () {
                this.renderer("site", "system/views/domain_modify", "system/views/side_site", adminLang["도메인 상세"]);
            },
            renderDomainList: function () {
                this.renderer("domain", "system/views/domain_list", "system/views/side_site", adminLang["도메인 목록"]);
            },
            renderCreateDomain: function () {
                this.renderer("domain", "system/views/domain_create", "system/views/side_site", adminLang["도메인 추가"], {el: "#layoutContent"});
            },
            renderModifyDomain: function (domainId) {
                this.renderer("domain", "system/views/domain_create", "system/views/side_site", adminLang["도메인 수정"], {
                    el: "#layoutContent",
                    domainId: domainId
                });
            },

            /**
             * Hidden Page
             */
            renderIndexLink: function () {
                this.renderContent("index", "system/views/index", "system/views/side_index", adminLang["검색/푸쉬"]);
            },
            renderCacheSystem: function () {
                this.renderContent("cache", "system/views/cache_list", "system/views/side_index", adminLang["캐시 관리"]);
            },
            renderScheduleSystem: function () {
                this.renderContent("schedule", "system/views/schedule_list", "system/views/side_index", adminLang["global schedule"]);
            },
            renderWebRevision: function () {
                this.renderContent("webrevision", "system/views/web_revision", "system/views/side_index", adminLang["webRevision 관리"]);
            },
            renderLogSystem: function () {
                this.renderContent("log", "system/views/log_config", "system/views/side_index", adminLang["로그 레벨 설정"]);
            },
            renderGadgetSpec: function () {
                this.renderContent("gadgetspec", "system/views/gadget_spec", "system/views/side_index", adminLang["가젯 명세서 관리"]);
            },
            renderCustomizeRegister: function () {
                this.renderContent("customize", "system/views/customize_register", "system/views/side_index", adminLang["커스터마이즈 등록"]);
            },
            renderSearchIndexing: function () {
                this.renderContent("searcher", "system/views/search_indexing_list", "system/views/side_index", adminLang["검색 인덱싱"]);
            },
            renderExtensionFunc: function () {
                this.renderContent("extensionfunc", "system/views/extension_function", "system/views/side_index", adminLang["확장 기능 관리"]);
            },
            renderColorStyle: function () {
                this.renderContent("colorstyle", "system/views/color_style", "system/views/side_index", adminLang["color style 관리"]);
            },
            renderAdminJob: function () {
                this.renderContent("adminjob", "system/views/admin_job", "system/views/side_index", adminLang["AdminJob 관리"]);
            },
            renderDataInit: function () {
                this.renderContent("dataInit", "system/views/data_init", "system/views/side_index", adminLang["데이터 초기화"]);
            },
            renderCustomProfileConfig: function () {
                this.renderContent("customProfileConfig", "system/views/custom_profile_config", "system/views/side_index", adminLang["커스텀 프로필 관리"]);
            },
            renderTmwConfig: function () {
                this.renderContent("tmwConfig", "system/views/tmw_config", "system/views/side_index", adminLang["TMW 연동"]);
            },
            renderAttndSyncConfig: function () {
                this.renderContent("attndSyncConfig", "system/views/attnd_sync_config", "system/views/side_index", adminLang["근태 동기화 설정"]);
            },
            renderFrontNotice: function () {
                this.renderContent("frontNotice", "system/views/notice/list", "system/views/side_index", "로그인페이지 공지");
            },
            renderFrontNoticeModify: function (id) {
                this.renderContent("frontNotice", "system/views/notice/form", "system/views/side_index", "로그인페이지 공지", {noticeId: id});
            },
            renderFrontNoticeCreate: function () {
                this.renderContent("frontNotice", "system/views/notice/form", "system/views/side_index", "로그인페이지 공지");
            },
            renderDbConfig: function () {
                this.renderContent("dbConfig", "system/views/database/db_config_list", "system/views/side_index", adminLang["DB 설정"]);
            },
            renderSyncConfig: function () {
                this.renderContent("syncConfig", "system/views/sync/config_main", "system/views/side_index", adminLang["데이터 동기화 설정 / 수행"]);
            },
            renderDisplayConfigModel: function () {
                this.renderContent("displayConfigModel", "system/views/display_config_model", "system/views/side_index", adminLang["DisplayConfig 관리"]);
            },
            renderGoogleAnalytics: function () {
                this.renderContent("googleAnalytics", "system/views/google_analytics", "system/views/side_index", adminLang["Google Analytics 관리"]);
            },
            renderEhrStat: function () {
                this.renderContent("ehrStat", "system/views/ehr_stat", "system/views/side_index", adminLang["근태 통계"]);
            },
            renderEcdConfig: function () {
                this.renderContent("ecdConfig", "system/views/ecd_config", "system/views/side_index", adminLang["데이터 백업 설정"]);
            },
            renderOAuthClients: function () {
                this.renderContent("oauthClients", "system/views/oauth_client_list", "system/views/side_index", adminLang["통합인증 클라이언트"]);
            },
            renderGotalkConfig: function () {
                this.renderContent("gotalkConfig", "system/views/gotalk_config", "system/views/side_index", "Gotalk 설정")
            },
            renderChatBotConfig: function () {
                this.renderContent("chatBotConfig", "system/views/chat_bot_config", "system/views/side_index", "chat bot config")
            },
            renderLinkplusConfig: function () {
                this.renderContent("linkplusConfig", "system/views/linkplus_config", "system/views/side_index", "링크플러스 설정");
            },
            renderVacationCorrector: function() {
                this.renderContent("vacationCorrector", "system/views/vacation_corrector", "system/views/side_index", "근태 이력 관리");
            },
            renderSiteControlOption: function () {
                this.renderContent("sitecontroloption", "system/views/site_control_option", "system/views/side_index", "사이트 제어 옵션")
            },

            renderLabFeedbackConfigList: function () {
                this.renderContent("feedbackConfig", "system/views/laboratory/feedback/list", "system/views/side_index", "실험실 피드백 설정 목록");
            },
            renderLabFeedbackConfigModify: function (id) {
                this.renderContent("feedbackConfig", "system/views/laboratory/feedback/config", "system/views/side_index", "실험실 피드백 설정 수정", {feedbackConfigId: id});
            },
            renderLabFeedbackConfigCreate: function () {
                this.renderContent("feedbackConfig", "system/views/laboratory/feedback/config", "system/views/side_index", "실험실 피드백 설정 추가");
            },

            /**
             * 기타설정
             */
            renderStoragePeriod: function () {
                this.renderer("storagePeriod", "system/views/storage_period", "system/views/side_etc", adminLang["보관 기간 설정"]);
            },
            renderPasswordConfig: function () {
                this.newRenderer("passwordConfig", "system/views/password_config", "system/views/side_etc", adminLang["비밀번호 찾기 설정"]);
            },
            renderPasswordRules: function () {
                this.newRenderer("passwordRules", "system/views/password_rules", "system/views/side_etc", adminLang["비밀번호 정책 설정"]);
            },
            renderTimelineOpenApiKey: function () {
                this.newRenderer("timelineOpenApiKey", "system/views/timeline_open_api_key", "system/views/side_etc", adminLang["근태관리 지도 Open API"]);
            },

            /**
             * 모빌리티 (App Version 관리, APNS 인증서 관리)
             */
            renderApnsManagerSystem: function () {
                this.renderer("device", "system/views/apns_manager", "system/views/side", adminLang["APNS 인증서 관리"]);
            },
            renderDeviceVersionSystem: function () {
                this.renderer("device", "system/views/device_version_list", "system/views/side", adminLang["디바이스 버전 관리"]);
            },
            renderDeviceVersionCreateSystem: function () {
                this.renderer("device", "system/views/device_version_create", "system/views/side", adminLang["버전 추가"]);
            },
            renderDeviceVersionModifySystem: function (deviceId) {
                this.renderer("device", "system/views/device_version_create", "system/views/side", adminLang["버전 상세"], {deviceId: deviceId});
            },

            /**
             * 관리자
             */
            renderOtpAdminList: function () {
                this.newRenderer("otpAdminList", "system/views/otp_admin_list", "system/views/side_admin", adminLang["2차인증 관리자 OTP"]);
            },

            render: function () {
                this.renderCompanyInfo();
            },

            newRenderer: function (leftMenu, contentsPath, sidePath, title, option) {
                require([contentsPath, sidePath], function (ContentsView, SideView) {
                    Layout.setTitle(title).render().done(function (layout) {
                        SideView.render(leftMenu);
                        var contentView = new ContentsView();
                        Layout.getContentElement().html(contentView.el);
                    });
                });
                $('body').addClass('prefix')
            },

            installRenderer: function (contentsPath, statePath, state, option) {
                require([contentsPath, statePath], function (ContentsView, StateView) {
                    InstallLayout.render().done(function (layout) {
                        StateView.render(state);
                        if ("__instance__" in ContentsView) {
                            (new ContentsView).render(option);
                        } else {
                            ContentsView.render(option);
                        }
                    });
                    $('body').addClass('prefix')
                });
            },

            renderer: function (leftMenu, contentsPath, sidePath, title, option) {
                require([contentsPath, sidePath], function (ContentsView, SideView) {
                    Layout.setTitle(title).render().done(function (layout) {
                        SideView.render(leftMenu);
                        if ("__instance__" in ContentsView) {
                            (new ContentsView).render(option);
                        } else {
                            ContentsView.render(option);
                        }
                    });
                    $('body').addClass('prefix')
                });
            },

            renderContent: function (leftMenu, contentsPath, sidePath, title, option) {
                require([contentsPath, sidePath], function (ContentsView, SideView) {
                    Layout.setTitle(title).render().done(function (layout) {
                        SideView.render(leftMenu);
                        var view = new ContentsView(option);
                        Layout.getSideElement().html(view.el);
                        Layout.getContentElement().html(view.el);
                        view.render();
                    });
                    $('body').addClass('prefix')
                });
            }
        };

        return Controller;

    })();

    return new SystemAdminController();

});

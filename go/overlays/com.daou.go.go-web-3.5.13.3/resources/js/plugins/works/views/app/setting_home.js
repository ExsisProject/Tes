/**
 * 앱 설정 홈
 */

define('works/views/app/setting_home', function (require) {
    // dependency
    var Backbone = require('backbone');
    var when = require('when');
    var WorksUtil = require('works/libs/util');

    var WorksHomeLayout = require('works/views/app/home/works_home_layout');
    var ManageContentTopView = require('works/views/app/layout/manage_content_top');

    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var OpenApiModel = require('works/models/applet_openapi');

    var SettingHomeTpl = require('hgn!works/templates/app/setting_home');
    var worksLang = require("i18n!works/nls/works");

    var CONSTANTS = require('works/constants/works');

    require('jquery.go-popup');

    var lang = {
        "기본 정보": worksLang["기본 정보"],
        "기본설정 설명": worksLang["기본설정 설명"],
        "입력 화면": worksLang["입력 화면"],
        "입력화면 설명": worksLang["입력화면 설명"],
        "목록 화면": worksLang["목록 화면"],
        "목록화면 설명": worksLang["목록화면 설명"],
        "프로세스": worksLang["프로세스"],
        "프로세스 설명": worksLang["프로세스 설명"],
        "접근 제어": worksLang["접근 제어"],
        "접근 제어 설명": worksLang["접근 제어 설명"],
        "해당 앱으로 이동": worksLang["해당 앱으로 이동"],
        "앱 삭제": worksLang["앱 삭제"],
        '가이드툴팁': worksLang['앱 운영관리 1분이면 충분합니다.'],
        "가이드": worksLang['가이드'],
        '데이터 일괄 등록': worksLang['데이터 일괄 등록'],
        '데이터 일괄 등록 설명': worksLang['데이터 일괄 등록 설명'],
        '기본 정보 가이드 설명': worksLang['기본 정보 가이드 설명'],
        '입력 화면 가이드 설명': worksLang['입력 화면 가이드 설명'],
        '목록 화면 가이드 설명': worksLang['목록 화면 가이드 설명2'],
        '프로세스 가이드 설명': worksLang['프로세스 가이드 설명'],
        '접근 제어 가이드 설명': worksLang['접근 제어 가이드 설명'],
        '앱 관리 가이드 안내1': worksLang['앱 관리 가이드 안내1'],
        '앱 관리 가이드 안내2': worksLang['앱 관리 가이드 안내2'],
        '도움말 센터 바로가기': worksLang['도움말 센터 바로가기'],
        '앱간 데이터 연동': worksLang['앱간 데이터 연동'],
        '앱간 데이터 연동 설명': worksLang['앱간 데이터 연동 설명'],
        '데이터 목록 다운로드': worksLang['데이터 목록 다운로드'],
        '데이터 목록 다운로드 설명': worksLang['데이터 목록 다운로드 설명'],
        '데이터 목록 조회 권한': worksLang['데이터 목록 조회 권한'],
        '가이드설명': worksLang['가이드설명'],
        '외부 데이터 가져오기': worksLang['외부 데이터 가져오기'],
        '외부 데이터 가져오기 설명': worksLang['외부 데이터 가져오기 설명'],
        'API 연동 ON': worksLang['API 연동 ON'],
        'API 연동 OFF': worksLang['API 연동 OFF']
    };


    var WorksSettingHomeView = Backbone.View.extend({
        className: 'go_content go_renew go_works_home app_temp',
        events: {
            "click a[name='appHome']": "moveAppHome",
            "click img[name='goAppIcon']": "moveAppHome",
            "click #settingsBaseinfo": "moveSettingsBaseinfo",
            "click #settingsUserform": "moveSettingsUserform",
            "click #settingsListview": "moveSettingsListview",
            "click #settingsWorkflow": "moveSettingsWorkflow",
            "click #settingsShare": "moveSettingsShare",
            "click #appleteDelete": "appleteDelete",
            //"click #btnPopupLayer": "popupGuideLayer",
            'click #import': '_onClickImport',
            'click #integration': '_onClickIntegration',
            'click #download': '_onClickDownload',
            'click #settingsOpenApi': '_onClickOpenApi'
        },
        initialize: function (options) {
            options = options || {};
            this.layoutView = WorksHomeLayout.create();

            if (options.hasOwnProperty('appletId')) {
                this.model = new AppletBaseConfigModel({"id": options.appletId});
                this.openApiModel = new OpenApiModel({"appletId": options.appletId});
            }
        },

        render: function () {
            var self = this;

            return when(this.layoutView.render())
                .then(_.bind(fetchModel, this))
                .then(_.bind(fetchOpenApiModel, this))
                .then(function renderMe() {
                    WorksUtil.checkAppManager(self.model.get('admins'))
                    self.layoutView.setContent(self);
                    self.$el.append(Hogan.compile(SettingHomeTpl({
                        "isLocaleKo?": GO.locale == 'ko',
                        "id": self.model.get('id'),
                        "name": self.model.get('name'),
                        "thumbSmall": self.model.get('thumbSmall'),
                        "useOpenApi": self.checkUseOpenApi(),
                        lang: lang,
                    })).render());

                    var contentTopView = new ManageContentTopView({
                        baseConfigModel: self.model,
                        pageName: '',
                        useActionButton: false
                    });
                    contentTopView.setElement(this.$('#worksContentTop'));
                    contentTopView.render();
                    if (WorksUtil.getShowGuideLayer() == null) { //가이드 레이어는 사용자 별로 한번만 띄운다.
                        setTimeout(function () {
                            self.popupGuideLayer();
                        }, 500);
                        WorksUtil.saveShowGuideLayer(true);
                    }
                }).otherwise(function printError(err) {
                    console.log(err.stack);
                });
        },

        checkUseOpenApi: function () {
            var openApiConfig = this.openApiModel.toJSON();
            return openApiConfig.useApi;
        },

        popupGuideLayer: function () {
            /* var url = GO.contextRoot + "resources/guide/works/start.htm";
             window.open(url, "popupRead", "resizable=yes,scrollbars=yes,width=1024,height=790");*/
        },

        moveAppHome: function (e) {
            e.preventDefault();
            GO.router.navigate('/works/applet/' + this.model.get('id') + '/home', {"pushState": true, "trigger": true});
        },

        moveSettingsBaseinfo: function (e) {
            e.preventDefault();
            GO.router.navigate('/works/applet/' + this.model.get('id') + '/settings/baseinfo', {
                "pushState": true,
                "trigger": true
            });
        },

        moveSettingsUserform: function (e) {
            e.preventDefault();
            GO.router.navigate('/works/applet/' + this.model.get('id') + '/settings/userform', {
                "pushState": true,
                "trigger": true
            });
        },

        moveSettingsListview: function (e) {
            e.preventDefault();
            GO.router.navigate('/works/applet/' + this.model.get('id') + '/settings/listview', {
                "pushState": true,
                "trigger": true
            });
        },

        moveSettingsWorkflow: function (e) {
            e.preventDefault();
            GO.router.navigate('/works/applet/' + this.model.get('id') + '/settings/workflow', {
                "pushState": true,
                "trigger": true
            });
        },

        moveSettingsShare: function (e) {
            e.preventDefault();
            GO.router.navigate('/works/applet/' + this.model.get('id') + '/settings/share', {
                "pushState": true,
                "trigger": true
            });
        },

        appleteDelete: function (e) {
            e.preventDefault();
            var self = this;
            var appletId = this.model.get('id');
            var name = this.model.get('name');
            $.ajax({
                type: "GET",
                dataType: "json",
                url: GO.contextRoot + "api/works/applets/" + appletId + "/consumers",
                success: function (resp) {
                    var confirmCallback = function (popup) {
                        var $input = popup.find('#checkUserAgree');
                        if (!_.isUndefined(name) && name.trim() == $input.val().trim()) {
                            self.model.setUrl("/api/works/applets/" + appletId);
                            self.model.fetch({
                                async: false,
                                type: 'DELETE',
                                success: function () {
                                    GO.router.navigate('/works', {"pushState": true, "trigger": true});
                                },
                                error: function (collection, response, options) {
                                    $.goError(resp.message);
                                }
                            });
                        } else {
                            popup.find('.error_msg').remove();
                            $input.after("<span class='error_msg'>" + worksLang['앱 이름이 일치하지 않습니다.'] + "</span>");
                        }
                    };

                    var contents = ["<div>", worksLang["앱 삭제 설명"], "</div>", "<div><strong>", worksLang["앱 삭제 확인"], "</strong></div>",
                        "<div><input id='checkUserAgree' class='txt_mini w_max' type='text'></div>"].join('');

                    $.goImportantCaution({
                        title: worksLang["앱을 삭제하시겠습니까?"],
                        contents: contents,
                        confirmCallback: confirmCallback,
                    });
                },
                error: function (resp) {
                    $.goError(resp.message);
                }
            });
        },

        _onClickImport: function () {
            GO.router.navigate('/works/applet/' + this.model.get('id') + '/settings/csv', {
                pushState: true,
                trigger: true
            });
        },

        _onClickIntegration: function () {
            GO.router.navigate('/works/applet/' + this.model.get('id') + '/settings/integration', {
                pushState: true,
                trigger: true
            });
        },

        _onClickDownload: function () {
            GO.router.navigate('/works/applet/' + this.model.get('id') + '/settings/download', {
                pushState: true,
                trigger: true
            });
        },

        _onClickOpenApi: function () {
            GO.router.navigate('/works/applet/' + this.model.get('id') + '/settings/openapi', {
                pushState: true,
                trigger: true
            });
        },
        _onClickBadgeClose: function () {
            $("#guideBadge").remove();
            $("#guideBanner").show();
            $.cookie(CONSTANTS.WORKS_GUIDE.WORKS_SETTING_BADGE + GO.session().id, "done", {
                expires: CONSTANTS.WORKS_GUIDE.EXPIREDATE,
                path: "/"
            });
        },

        openHelpDocPopup: function () {
            $.post("/api/help/meta", {}) //go-nav.js 함수를 그대로 따라함..
                .done(function (resp) {
                    if (resp.data.available) {
                        var url = resp.data.mainContents.url;
                        window.open(
                            url,
                            'help',
                            'width=1280,height=760,status=yes,scrollbars=no,resizable=no'
                        );
                    }
                });
        }
    });

    function fetchModel() {
        var defer = when.defer();
        this.model.fetch({
            success: defer.resolve,
            error: defer.reject
        });

        return defer.promise;
    }

    function fetchOpenApiModel() {
        var defer = when.defer();
        this.openApiModel.fetch({
            success: defer.resolve,
            error: defer.reject
        });

        return defer.promise;
    }

    return WorksSettingHomeView;
});

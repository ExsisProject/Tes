define("views/notification/side", function (require) {
    var _ = require("underscore");
    var Backbone = require("backbone");
    var GO = require("app");
    var Hogan = require("hogan");
    var SiteConfigModel = require("models/site_config");
    var SettingAlarmView = require("views/notification/setting_alarm");
    var SideTmpl = require("hgn!templates/notification/side");
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    var userLang = require("i18n!nls/user");
    var notiLang = require("i18n!nls/notification");

    var makeNotiUrl,
        categoriesInfo,
        NotificationSideView;

    makeNotiUrl = function (category) {
        return GO.config("contextRoot") + "app/noti/" + category;
    };

    categoriesInfo = {
        all: {
            app: "all",
            title: notiLang["전체 알림"],
            url: makeNotiUrl('all'),
            css: "ic_type_alarm",
            selected: false
        },
        unread: {
            app: "unread",
            title: notiLang["안읽은 알림"],
            url: makeNotiUrl('unread'),
            css: "ic_type_alarm_off",
            selected: false
        },
        mail: {
            app: "mail",
            title: notiLang["메일"],
            url: makeNotiUrl('mail'),
            css: "ic_type_mail",
            selected: false
        },
        calendar: {
            app: "calendar",
            title: notiLang["캘린더"],
            url: makeNotiUrl('calendar'),
            css: "ic_type_cal",
            selected: false
        },
        bbs: {
            app: "bbs",
            title: notiLang["게시판"],
            url: makeNotiUrl('bbs'),
            css: "ic_type_bbs",
            selected: false
        },
        community: {
            app: "community",
            title: notiLang["커뮤니티"],
            url: makeNotiUrl('community'),
            css: "ic_type_comm",
            selected: false
        },
        survey: {
            app: "survey",
            title: commonLang["설문"],
            url: makeNotiUrl('survey'),
            css: "ic_type_survey",
            selected: false
        },
        report: {
            app: "report",
            title: commonLang["보고"],
            url: makeNotiUrl('report'),
            css: "ic_type_report",
            selected: false
        },
        task: {
            app: "task",
            title: commonLang["업무"],
            url: makeNotiUrl('task'),
            css: "ic_type_task",
            selected: false
        },
        works: {
            app: "works",
            title: commonLang["Works"],
            url: makeNotiUrl('works'),
            css: "ic_type_works",
            selected: false
        },
        todo: {
            app: "todo",
            title: commonLang["ToDO+"],
            url: makeNotiUrl('todo'),
            css: "ic_type_todo",
            selected: false
        },
        approval: {
            app: "approval",
            title: commonLang["전자결재"],
            url: makeNotiUrl('approval'),
            css: "ic_type_approval",
            selected: false
        },
        docs: {
            app: "docs",
            title: commonLang["문서관리"],
            url: makeNotiUrl('docs'),
            css: "ic_type_docs",
            selected: false
        },
        asset: {
            app: "asset",
            title: commonLang["예약"],
            url: makeNotiUrl('asset'),
            css: "ic_type_asset",
            selected: false
        },
        webfolder: {
            app: "webfolder",
            title: commonLang["자료실"],
            url: makeNotiUrl('webfolder'),
            css: "ic_type_file",
            selected: false
        },
        ehr: {
            app: "ehr",
            title: commonLang["근태관리"],
            url: makeNotiUrl('ehr'),
            css: "ic_type_ehr",
            selected: false
        },
        channel: {
            app: "channel",
            title: commonLang['외부 시스템'],
            url: makeNotiUrl('channel'),
            css: "ic_type2_alarm",
            selected: false
        },
        manager: {
            app: "manager",
            title: adminLang['운영자'],
            url: makeNotiUrl('manager'),
            css: "ic_type_task",
            selected: false
        },
        openapi: {
            app: "openapi",
            title: "OpenAPI",
            url: makeNotiUrl('openapi'),
            css: "ic_type_task",
            selected: false
        }
    };

    // Mail > 알림 설정 뷰 제외
    delete categoriesInfo['mail'];
    if (!GO.isAvailableApp('board')) delete categoriesInfo['bbs'];
    if (!GO.isAvailableApp('community')) delete categoriesInfo['community'];
    if (!GO.isAvailableApp('calendar')) delete categoriesInfo['calendar'];
    if (!GO.isAvailableApp('task')) delete categoriesInfo['task'];
    if (!GO.isAvailableApp('works')) delete categoriesInfo['works'];
    if (!GO.isAvailableApp('todo')) delete categoriesInfo['todo'];
    if (!GO.isAvailableApp('report')) delete categoriesInfo['report'];
    if (!GO.isAvailableApp('survey')) delete categoriesInfo['survey'];
    if (!GO.isAvailableApp('approval')) delete categoriesInfo['approval'];
    if (!GO.isAvailableApp('docs')) delete categoriesInfo['docs'];
    if (!GO.isAvailableApp('asset')) delete categoriesInfo['asset'];
    if (!GO.isAvailableApp('webfolder')) delete categoriesInfo['webfolder'];
    if (!GO.isAvailableApp('ehr')) delete categoriesInfo['ehr'];

    var NotificationApp = Backbone.Model.extend({
        url: function () {
            return '/api/user/push';
        }
    });

    var NotificationSideView = Backbone.View.extend({

        tagName: 'nav',
        className: 'side_menu',
        categoriesInfo: categoriesInfo,

        events: {
            "click #alarm_setting": "settingAlarm"
        },

        initialize: function (options) {
            this.options = options || {};
            this._setCurrentSelectedMenu(this.options.category);
            console.log(this.options.category)
            this.siteConfigModel = SiteConfigModel.read().toJSON();
            this.appModel = new NotificationApp();
            this.settingView = new SettingAlarmView();

        },

        render: function () {
            this.$el.append(SideTmpl({
                gnbTitle: commonLang['알림'],
                categories: _.values(this.categoriesInfo)
            }));

            this.appModel.fetch().done($.proxy(function () {
                var applist = this.appModel.attributes.notiCategory;
                _.each(applist, function (value, appInfo) {
                    if (value == false) {
                        this.$el.find("li[data-appname='" + appInfo + "']").hide();
                    } else {
                        this.$el.find("li[data-appname='" + appInfo + "']").show();
                    }
                }, this);
                // PC Client에서 알림 설정을 호출했을 때
                if (document.location.pathname == '/app/noti/setting') {
                    this.settingPopupMenu();
                }
            }, this));
            if (this.siteConfigModel.channelService != "on") {
                this.$el.find("li[data-appname='channel']").remove();
            }
            return this.$el;
        },

        _setCurrentSelectedMenu: function (toBeSelected) {
            _.each(this.categoriesInfo, function (info, category) {
                info['selected'] = (category == toBeSelected);
            });
        },

        _initPushSettingTemplate: function () {
            var html = [];
            html.push("<span id='alarm_setting' class='btn_wrap' title='" + userLang['알림설정'] + "'>");
            html.push("		<span btn-type='boardAdmin' class='ic_side ic_side_setting'></span>");
            html.push("</span>");
            return html.join('\n');
        },

        _cautionTemplate: function () {
            var html = [];
            html.push("<section class='form_admin'>")
            html.push("<span id='alarm_caution' class='des'>" + commonLang['알림 설정 경고'] + "</span>");
            html.push("</section>");
            html.push("<br/><br/>");
            return html.join('\n');
        },

        settingAlarm: function (e) {
            this.settingPopupMenu();
            e.stopPropagation();
        },

        settingPopupMenu: function () {
            var popupEl = $.goPopup({
                header: userLang['알림설정'],
                pclass: "layer_normal layer_alramSet",
                width: 304,
                closeIconVisible: false,
                buttons: [{
                    'btext': commonLang['확인'],
                    'btype': 'confirm',
                    'autoclose': false,
                    'callback': function () {
                        console.log("pressed Confirm")
                        GO.router.navigate("/noti/all", {trigger: true, replace: true});
                    }
                }]
            }, this);

            popupEl.find('.content').append(this.settingView.render(this.appModel.attributes));
            popupEl.find('.btn_layer_wrap').prepend($(this._cautionTemplate()));
        }

    });

    return NotificationSideView;

});

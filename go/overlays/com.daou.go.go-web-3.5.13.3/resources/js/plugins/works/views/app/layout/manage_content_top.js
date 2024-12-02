define('works/views/app/layout/manage_content_top', function (require) {
    var Backbone = require('backbone');
    var BackdropView = require("components/backdrop/backdrop");
    var renderAppContentTopTpl = require('hgn!works/templates/app/manage_content_top');
    var WorksUtil = require('works/libs/util');
    var worksLang = require("i18n!works/nls/works");
    require('jquery.go-popup');

    var lang = {
        appIcon: worksLang['앱 아이콘'],
        operator: worksLang['운영자'],
        showAppDesc: worksLang['앱 설명 보기'],
        gotoSettingsHome: worksLang['관리 홈으로 가기'],
        '가이드툴팁': worksLang['앱 운영관리 1분이면 충분합니다.']
    };

    var AppContentTop = Backbone.View.extend({
        tagName: 'header',
        className: 'content_top works_tit',
        baseConfigModel: null,
        pageName: null,
        useActionButton: true,

        events: {
            "click .btn-goto-settings-home": '_goToSettingsHome',
            "click #applet-info-desc": '_toggleDesc',
            'click .btn-goto-app-home': '_goToAppHome',
            'click .btn-goto-app-intro': '_goToAppInto' //baseinfo_form(앱 등록 페이지에서 받아 오는 버튼)
        },

        initialize: function (options) {
            options = options || {};

            this.baseConfigModel = null;
            this.pageName = null;

            if (options.hasOwnProperty('baseConfigModel')) {
                this.baseConfigModel = options.baseConfigModel;
            }

            if (options.hasOwnProperty('pageName')) {
                this.setPageName(options.pageName);
            }

            this.useActionButton = true;
            if (options.hasOwnProperty('useActionButton')) {
                this.useActionButton = options.useActionButton;
            }

            this.infoDesc = '';
            if (options.hasOwnProperty('infoDesc')) {
                this.infoDesc = options.infoDesc;
            }

            this.isAppNamePrefixed = true;
            if (options.hasOwnProperty('isAppNamePrefixed')) {
                this.isAppNamePrefixed = options.isAppNamePrefixed;
            }

            this.showOperatorList = false;
            if (options.hasOwnProperty('showOperatorList')) {
                this.showOperatorList = options.showOperatorList;
            }
        },

        render: function () {
            this.$el.html(renderAppContentTopTpl({
                config: this.baseConfigModel.toJSON(),
                pageTitle: this._makePageTitle(),
                operatorList: this._makeOperatorList(),
                showOperatorList: this.showOperatorList,
                useActionButton: this.useActionButton,
                infoDesc: this.infoDesc,
                isAdmin: this.baseConfigModel.isAdmin(GO.session('id')),
                lang: lang
            }));
        },

        setPageName: function (pn) {
            this.pageName = pn;
            this.render();
        },

        _makeOperatorList: function () {
            var result = [];
            _.each(this.baseConfigModel.get('admins'), function (user) {
                result.push(user.name + (user.position ? ' ' + user.position : ''));
            });

            return result.join(', ');
        },

        _makePageTitle: function () {
            if (this.isAppNamePrefixed) {
                return '<a class="btn-goto-app-home"> ' + this.baseConfigModel.get('name') + '</a>' + ' > ' + '<a class="btn-goto-settings-home">' + worksLang['관리'] + '</a>' + (this.pageName ? ' > ' + this.pageName : '');
            } else {
                return this.pageName;
            }
        },

        _toggleDesc: function () {
            if (!this.backdropView) {
                this.backdropView = new BackdropView();
                this.backdropView.backdropToggleEl = this.$("span[el-backdrop]");
                this.backdropView.linkBackdrop(this.$("span[el-backdrop-link]"));
            }
        },

        _goToSettingsHome: function (e) {
            e.preventDefault();
            GO.router.navigate('works/applet/' + this.baseConfigModel.get('id') + '/settings/home', {trigger: true});
        },

        _goToAppHome: function (e) {
            WorksUtil.goAppHome(this.baseConfigModel.get('id'));
        },

        _goToAppInto: function (e) {
            e.preventDefault();
            WorksUtil.goCreateAppIntro();
        }

    });

    return AppContentTop;
});

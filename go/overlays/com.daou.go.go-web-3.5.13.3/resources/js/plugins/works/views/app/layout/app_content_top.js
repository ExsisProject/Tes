define('works/views/app/layout/app_content_top', function (require) {
    var commonLang = require('i18n!nls/commons');
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        appIcon: worksLang['앱 아이콘'],
        operator: worksLang['운영자'],
        showAppDesc: worksLang['앱 설명 보기'],
        gotoSettingsHome: worksLang['관리 홈으로 가기'],
        "관리": worksLang["관리"],
        '통합검색': commonLang['통합검색'],
        '상세검색': commonLang['상세검색'],
        '상세': commonLang['상세'],
        '데이터연동가이드': worksLang['데이터연동가이드'],
        "앱간 데이터 연동": worksLang['앱간 데이터 연동'],
        "앱간연동설명": worksLang['앱간연동설명'],
        Works: commonLang['Works']
    };

    var ContentTopView = require('works/views/app/layout/content_top');
    var BackdropView = require("components/backdrop/backdrop");
    var Template = require('hgn!works/templates/app/app_content_top');

    return ContentTopView.extend({
        tagName: 'header',
        className: 'content_top works_tit',

        baseConfigModel: null,
        pageName: null,
        useActionButton: true,

        events: _.extend(ContentTopView.prototype.events, {
            "click [el-setting-home]": '_goToSettingsHome',
            "click [el-app-home]": '_goToAppHome',
            "click #interAppGuideBtn": '_interAppGuideBtn',
            "click [data-btn-integration]": "_goAppIntegration"
        }),

        initialize: function (options) {
            options = options || {};

            this.appletId = options.appletId;
            this.subFormId = options.subFormId;
            this.accessibleForms = options.accessibleForms;
            this.isFormManager = options.isFormManager || false;
            this.useSearch = options.useSearch;
            this.pageName = options.pageName || "";
            this.isFullSizeLayout = options.isFullSizeLayout || false;
            this.description = options.description;
            this.isSetting = options.isSetting || false;
            this.useActionButton = options.useActionButton || true;
            this.baseConfigModel = options.baseConfigModel;
            this.isOrgDocPopup = options.isOrgDocPopup || false;

        },

        render: function () {
            this.baseConfigModel.deferred.done($.proxy(function () {
                var keyword = GO.router.getSearch('keyword');
                var self = this;
                this.$el.html(Template({
                    useSearch: this.useSearch,
                    config: this.baseConfigModel.toJSON(),
                    desc: GO.util.textToHtml(this.baseConfigModel.get("desc")),
                    externalDesc: this.description,
                    pageTitle: this._makePageTitle(),
                    operatorList: this._makeOperatorList(),
                    useActionButton: this.useActionButton,
                    isAdmin: this.baseConfigModel.isAdmin(GO.session('id')),
                    lang: lang,
                    isFullSizeLayout: this.isFullSizeLayout,
                    "keyword": keyword || '',
                    "maxlength": 64,
                    "has_keyword?": !!keyword,
                    isOrgDocPopup: this.isOrgDocPopup,
                    isSetting: this.isSetting,
                    isFormManager: this.isFormManager,
                    forms: this.accessibleForms,
                    isSelect: function () {
                        if (this.mainForm) {
                            return GO.util.isInvalidValue(self.subFormId);
                        } else {
                            return self.subFormId == this.id;
                        }
                    },
                    showSettingButton: !this.isSetting && this.baseConfigModel.isAdmin(GO.session('id')) && !this.isOrgDocPopup,
                    useIntegration: this.baseConfigModel.get('useIntegration')
                }));

                this.backdrop();
            }, this));

            return this;
        },

        setPageName: function (pn) {
            this.pageName = pn;
        },

        backdrop: function () {
            var backdropView = new BackdropView();
            backdropView.backdropToggleEl = this.$("[el-backdrop]");
            backdropView.linkBackdrop(this.$("[el-backdrop-link]"));

            var descriptionDisplayFlag = !this.isSetting
                && this.baseConfigModel.get("showDescription")
            backdropView.toggle(descriptionDisplayFlag);

        },
        _interAppGuideBtn: function () {
            var url = window.location.protocol + "//" + window.location.host + GO.contextRoot + 'app/works/interapp/help';
            var option = 'width=1280, height=700, left=0, top=0, scrollbars=1';
            window.open(url, '', option);
        },
        _makeOperatorList: function () {
            var result = [];
            _.each(this.baseConfigModel.get('admins'), function (user) {
                result.push(user.name + (user.position ? ' ' + user.position : ''));
            });

            return result.join(', ');
        },

        _makePageTitle: function () {
            return this.isSetting || this.isFullSizeLayout ?
                '<span><a el-app-home>' + this.baseConfigModel.get("name") + "</a> &gt; " +
                "<a el-setting-home>" + worksLang["관리"] + "</a> &gt; </span>" + this.pageName :
                '<span class="txt"><a el-app-home>' + _.escape(this.baseConfigModel.get('name')) + (this.pageName ? ' > ' + this.pageName : '') + '</a></span>';
        },

        _goToSettingsHome: function (e) {
            e.preventDefault();
            GO.router.navigate('works/applet/' + this.baseConfigModel.get('id') + '/settings/home', {trigger: true});
            this.remove();
        },

        _goToAppHome: function (e) {
            e.preventDefault();
            GO.router.navigate('works/applet/' + this.baseConfigModel.get('id') + '/home', {trigger: true});
            this.remove();
        },

        _goAppIntegration: function (e) {
            e.preventDefault();
            GO.router.navigate('works/applet/' + this.baseConfigModel.get('id') + '/settings/integration', {
                "pushState": true,
                "trigger": true
            });
        }
    });
});

define('works/views/app/base_setting', function (require) {

    var Backbone = require('backbone');
    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        "저장" : commonLang["저장"],
        "취소" : commonLang["취소"],
        "관리 홈으로 이동" : worksLang["관리 홈으로 이동"],
        "해당 앱으로 이동" : worksLang["해당 앱으로 이동"]
    };

    var WorksUtil = require('works/libs/util');

    var AppletBaseConfigModel = require("works/models/applet_baseconfig");

    var WorksSettingsLayoutView = require('works/views/app/settings_layout');
    var AppContentTopView = require('works/views/app/layout/app_content_top');

    var Template = require('hgn!works/templates/app/base_setting');

    return Backbone.View.extend({

        events: {
            'click [el-save]' : '_onClickSave',
            'click [el-cancel]' : '_onClickCancel',
            'click [el-setting-home]' : '_onClickSettingHome',
            'click [el-app-home]' : '_onClickAppHome'
        },

        initialize: function (options) {
            this.appletId = options.appletId;
            this.isPageActionUse = options.isPageActionUse === undefined ? true : options.isPageActionUse;
            this.config = new AppletBaseConfigModel({id: this.appletId});
            this.config.fetch({
                success: function(model) {
                    WorksUtil.checkAppManager(model.get('admins'));
                }
            });
            AppletBaseConfigModel.setInstance(this.config);

            this.layoutView = WorksSettingsLayoutView.create();
            if (GO.session()['theme'] !== 'THEME_ADVANCED') this.layoutView.setUseOrganogram(false);
        },

        render : function() {
            this.layoutView.render();
            this.layoutView.$el.addClass("go_full_screen go_skin_default go_skin_works"); // 디자인팀에서 css 정리가 필요할것으로 보임.
            this.layoutView.$el.removeClass("full_page");
            this.layoutView.setContent(this);
            this.$el.html(Template({lang: lang, isPageActionUse: this.isPageActionUse}));
            this._renderContentTopView();

            return this;
        },

        _renderContentTopView: function() {
            var contentTopView = new AppContentTopView({
                baseConfigModel : this.config,
                pageName : this.lang["페이지 제목"],
                isFullSizeLayout : true,
                description : this.lang["페이지 설명"],
                isSetting : true
            });
            contentTopView.setElement(this.$("header"));
            contentTopView.render();
        },

        _onClickSave : function() {
            console.log('on click save');
        },

        _onClickCancel : function() {
            console.log('on click cancel');
        },

        _onClickSettingHome : function() {
            GO.router.navigate("works/applet/" + this.appletId + "/settings/home", true);
        },

        _onClickAppHome : function() {
            GO.router.navigate("works/applet/" + this.appletId + "/home", true);
        }
    });
});

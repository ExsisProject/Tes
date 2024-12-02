define("admin/views/department/org_exposure_config", function (require) {

    var Backbone = require("backbone");
    var GO = require("app");
    var Tpl = require("hgn!admin/templates/org_exposure_config");
    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require("i18n!nls/commons");

    var OrgExposureConfig = Backbone.View.extend({
        events: {
            "click button.useSiteNameConfig" : "toggleSiteNameConfig",
            "click button.useOrgUnfoldConfig" : "toggleOrgUnfoldConfig"
        },

        initialize: function () {
            this.orgExposureConfigModel = new Backbone.Model();
            this.orgExposureConfigModel.url = GO.contextRoot + "ad/api/org/exposure/config";
            this.orgExposureConfigModel.fetch({async: false});
            this.orgExposureConfig = this.orgExposureConfigModel.toJSON();
            this.useOrgUnfoldConfig = this.orgExposureConfig.useOrgUnfoldConfig;
        },
        render: function () {
            this.$el.html(Tpl({
                orgExposure: this.orgExposureConfig,
                lang: {
                    'org_exposure_config': adminLang['사이트 조직도 노출 설정'],
                    'siteName_use_config': adminLang['사이트명 사용 여부'],
                    'orgUnfold_use_config': adminLang['조직도 펼침 여부'],
                    'org_unfold': adminLang['펼침'],
                    'org_fold': adminLang['펼치지 않음'],
                    'siteName_use_config_tool_tip': adminLang['사이트명 사용 설명'],
                    'orgOpen_use_config_tool_tip': adminLang['소속 부서원 펼침 설명'],
                    'org_exposure_config_ok': commonLang["저장"],
                    'org_exposure_config_cancel': commonLang["취소"],
                    'label_use': adminLang["사용함"],
                    'label_notuse': commonLang["사용하지 않음"]
                },
            }));
            return this;
        },
        toggleSiteNameConfig: function(){
            this.$el.find(".useSiteNameConfig").toggleClass("on");
        },
        toggleOrgUnfoldConfig: function(){
            this.$el.find(".useOrgUnfoldConfig").toggleClass("on");
        },
        orgExposureConfigSave: function () {
            var self = this;
            self.orgExposureConfigModel.set("useSiteNameConfig", this.$el.find(".useSiteNameConfig.on").val(), {silent: true});
            self.orgExposureConfigModel.set("useOrgUnfoldConfig", this.$el.find(".useOrgUnfoldConfig.on").val(), {silent: true});
            self.orgExposureConfigModel.save({}, {
                success: function (model, response) {
                    if (response.code == '200') {
                        $.goMessage(commonLang["저장되었습니다."]);
                        self.orgExposureConfigModel = model;
                        self.orgExposureConfig = self.orgExposureConfigModel.toJSON();
                        self.render();
                    }
                },
                error: function (model, response) {
                    var responseData = JSON.parse(response.responseText);
                    if (responseData.message != null) {
                        $.goMessage(responseData.message);
                    } else {
                        $.goMessage(commonLang["실패했습니다."]);
                    }
                }
            });
        },
/*
        orgExposureConfigCancel: function (e) {
            e.stopPropagation();

            var self = this;
            $.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function () {
                self.render();
                $.goMessage(commonLang["취소되었습니다."]);
            }, commonLang["확인"]);
        },*/

    });


    return OrgExposureConfig;

});
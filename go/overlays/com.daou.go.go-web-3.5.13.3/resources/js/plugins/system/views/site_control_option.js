define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var GO = require("app");
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    var Template = require("hgn!system/templates/site_control_option");
    var Model = require("system/models/site_control_option");

    var lang = {
        '사이트제어옵션': "사이트 제어 옵션",
        '사용여부': adminLang["사용여부"],
        '사용': commonLang["사용"],
        '사용하지않음': commonLang["사용하지 않음"],
        '저장': commonLang["저장"]
    };

    return Backbone.View.extend({
        events: {
            "click #site_control_option_btn_ok": "saveSiteControlOption"
        },

        initialize: function () {
            this.isSaaS = GO.session().brandName == "DO_SAAS";
            this.model = Model.init();
        },

        render: function () {
            $('.breadcrumb .path').html(lang["사이트제어옵션"]);
            this.model.fetch().done($.proxy(function () {
                this.$el.html(Template({
                    lang: lang,
                    isSaaS: this.isSaaS,
                    isSiteControlOn: this.model.isSiteControlOn()
                }));
            }, this));
        },

        saveSiteControlOption: function () {
            var siteControlOptionValue = this.$el.find("input[name='site_control_option']:checked").val();
            this.model.save({data: siteControlOptionValue === 'on'}, {
                type: 'POST',
                success: function (_model, response) {
                    if (response.code == '200') {
                        $.goMessage(commonLang["저장되었습니다."]);
                    }
                },
                error: function (_model, response) {
                    var responseData = JSON.parse(response.responseText);
                    $.goAlert(commonLang["실패"], responseData.message);
                }
            })
        }
    });
});
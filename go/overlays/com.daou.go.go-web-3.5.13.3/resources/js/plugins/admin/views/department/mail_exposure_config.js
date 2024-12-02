define("admin/views/department/mail_exposure_config", function (require) {

    var Backbone = require("backbone");
    var GO = require("app");
    var Tpl = require("hgn!admin/templates/department/mail_exposure_config");
    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require("i18n!nls/commons");

    var MailExposureConfig = Backbone.View.extend({
        events: {
            'click button.btn_toggle': 'toggleButton',
        },

        initialize: function () {
            this.configApi = GO.contextRoot + "ad/api/mailaddr/exposure/config";

            var _self = this;
            $.ajax({
                url : this.configApi,
                type : 'GET',
                async : false
            }).done(function(data) {
                _self.useMailExposure = data.data;
            });
        },

        render: function () {
            this.$el.html(Tpl({
                useMailExposure: this.useMailExposure,
                adminLang : adminLang,
                commonLang : commonLang
            }));
            return this;
        },

        toggleButton: function(){
            this.$el.find("button.btn_toggle").toggleClass("on");
        },

        save: function () {
            $.ajax({
                url : this.configApi,
                type : 'POST',
                data : { mailExposure : this.$el.find("button.on").attr("title") === "ON" },
            }).done(function () {
                $.goMessage(commonLang["저장되었습니다."]);
            }).fail(function () {
                $.goMessage(adminLang["요청 처리 중 오류가 발생하였습니다."]);
            });
        },

    });
    return MailExposureConfig;

});
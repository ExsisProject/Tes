define("vacation/views/config/main",function (require) {
    var Backbone = require("backbone");
    var Tmpl = require("hgn!vacation/templates/config/main");
    var TitleView = require("vacation/views/title");
    var BasicConfigView = require("vacation/views/config/basic_config");
    var AutoCreateConfigView = require("vacation/views/config/auto_create_config");
    var VacationLang = require("i18n!vacation/nls/vacation");

    var Manage = Backbone.View.extend({
        events: {},

        initialize: function () {
            this.$el.off();
            this.basicConfigView = new BasicConfigView();
            this.autoCreateConfigView = new AutoCreateConfigView();
        },

        render: function () {
            this.$el.html(Tmpl());
            this.$el.find('header.content_top').html(new TitleView().render(VacationLang["전사 연차현황 관리"]).el);
            // Default Content render
            this.$el.find("#autoCreateConfig").html(this.autoCreateConfigView.$el);
            this.$el.find("#manageConfig").html(this.basicConfigView.$el);

            this.autoCreateConfigView.render();
            this.basicConfigView.render();

            return this;
        }
    });

    return Manage;

});
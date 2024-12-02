define('store/views/home', function (require) {

    var Backbone = require('backbone');
    var GO = require('app');
    var $ = require('jquery');
    var HomeTmpl = require('hgn!store/templates/home');
    var ActiveTab = require('store/views/active_tab');
    var AllTab = require('store/views/all_tab');
    var Configs = require('store/collections/configs');
    var DetailView = require('store/views/detail');
    var RegView = require('store/views/registration');
    var storeLang = require("i18n!store/nls/store");

    var StoreHomeView = Backbone.View.extend({
        events: {
            "click #activeTab" : "goToMyTab",
            "click #allTab" : "renderAllTab",
            "click #linkHome": "linkHome"
        },

        initialize: function () {
            this.configs = new Configs();
        },

        //초기 광고동의여부 체크
        validateTermsAdConfig: function () {
            if (this.configs.length === 0) {
                return false;
            }
            var config = this.configs.getConfigByName('termsAdvertisement');
            return config && config.configValue === 'true';
        },

        checkConfig: function () {
            this.configs.fetch().done($.proxy(function () {
                var checked = this.validateTermsAdConfig();
                if (!checked) {
                    this.goToAgreement();
                }
            }, this));
        },

        renderActiveTab : function () {
            this.checkConfig();
            this.renderTabBar();
            this.activeTabView = new ActiveTab();
            $("#activeTab").addClass("on");
            $("#allTab").removeClass("on");
            this.activeTabView.render();

            return this;
        },

        renderAllTab : function () {
            this.checkConfig();
            this.renderTabBar();
            this.allTabView = new AllTab();
            $("#allTab").addClass("on");
            $("#activeTab").removeClass("on");
            this.allTabView.render();
            return this;
        },

        linkHome: function () {
            GO.router.navigate(GO.contextRoot + 'store/', true);
        },

        goToAgreement : function () {
            GO.router.navigate('store/agreement', true);
        },

        renderTabBar : function () {
            this.$el.html(HomeTmpl({
                    lang : storeLang
                }
            ));
        },

        renderDetail : function (code) {
            this.checkConfig();
            this.renderTabBar();
            var tmplPath = 'hgn!store/templates/details/' + code;
            require([tmplPath], function (tmpl) {
                var detailView = new DetailView({
                    tmpl : tmpl,
                    code : code
                });
                detailView.render();
            });
        },

        renderRegistration : function (code) {
            this.checkConfig();
            this.renderTabBar();
            var regView = new RegView(code);
            regView.render();
        },

        goToMyTab : function () {
            GO.router.navigate('store/my', true);
        }

    });

    return StoreHomeView;

});
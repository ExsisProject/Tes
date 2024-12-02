define("store/controllers/main", function (require) {
    var DefaultLayout = require('store/views/layouts/default');
    var HomeView = require('store/views/home');
    var AgreementView = require('store/views/agreement');
    var IframeView = require('store/views/iframe_view');
    var r = {};

    r.renderAgreement = function () {
        DefaultLayout.render().done(function (layout) {
            var agreementView = new AgreementView();
            layout.setContent(agreementView);
            agreementView.render();
        })
    };

    r.renderActiveTab = function () {
        DefaultLayout.render().done(function (layout) {
            var homeView = new HomeView();
            layout.setContent(homeView);
            homeView.renderActiveTab();
        })
    };

    r.renderAllTab = function () {
        DefaultLayout.render().done(function (layout) {
            var homeView = new HomeView();
            layout.setContent(homeView);
            homeView.renderAllTab();
        })
    };

    r.renderDetail = function (code) {
        DefaultLayout.render().done(function (layout) {
            var homeView = new HomeView();
            layout.setContent(homeView);
            homeView.renderDetail(code);
        })
    };

    r.renderRegistration = function (code) {
        DefaultLayout.render().done(function (layout) {
            var homeView = new HomeView();
            layout.setContent(homeView);
            homeView.renderRegistration(code);
        })
    };

    r.renderStoreIframe = function () {
        DefaultLayout.render().done(function (layout) {
            var iframe = new IframeView();
            layout.setContent(iframe);
            iframe.render();
        })
    }


    return r;
});
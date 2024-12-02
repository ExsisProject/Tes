define('store/views/agreement', function (require) {

    var Backbone = require('backbone');
    var GO = require('app');
    var $ = require('jquery');
    var UserTmpl = require('hgn!store/templates/agreement_user');
    var AdminTmpl = require('hgn!store/templates/agreement_admin');
    var Config = require('store/models/config');
    var StoreAdminModel = require('store/models/store_admin');
    var commonLang = require("i18n!nls/commons");
    var storeLang = require("i18n!store/nls/store");

    var AgreementView = Backbone.View.extend({

        events: {
            "click #useLinkPlus" : "useLinkPlus",
            "click #linkplus_agree" : "toggleButton",
            "click #guide" : "openGuide",
            "click #guide_clip" : "openGuideClip"
        },

        initialize: function () {
            this.isAdmin = StoreAdminModel.getInstance().isAdmin();
            this.configName = 'termsAdvertisement';

        },

        render: function () {
            var self = this;
                if(self.isAdmin) {
                    self.$el.html(AdminTmpl({
                        baseImgUrl : GO.contextRoot + 'resources/images/linkplus/',
                        lang : storeLang
                    }));
                } else {
                   self.$el.html(UserTmpl({
                       baseImgUrl : GO.contextRoot + 'resources/images/linkplus/',
                       lang : storeLang
                    }));
                }
                return self;
        },

        toggleButton : function (e) {
            var checked = $("#linkplus_agree").is(':checked');
            if (checked) {
                $("#useLinkPlus").removeClass('disabled');
            } else {
                $("#useLinkPlus").addClass('disabled');
            }
        },

        useLinkPlus : function (e) {
            var self = this;
            var checked = $("#linkplus_agree").is(':checked');
            if (!checked || !this.isAdmin) {
                e.preventDefault();
                $.goSlideMessage(storeLang['정보 수신 동의가 필요합니다.']);
                return;
            }
            var config = new Config();
            config.set({
                configName : self.configName,
                configValue : checked
            });

            config.save(null, {
                success : function () {
                    GO.router.navigate('store', true);
                    $.goSlideMessage(storeLang['동의가 완료되었습니다.']);

                },
                error : function (model, response) {
                    if (response.message)
                        $.goAlert(response.message);
                    else
                        $.goError(commonLang["500 오류페이지 내용"]);
                }
            });
        },

        openGuide : function () {
            var url = 'https://daouoffice.com/cloud_guide/etc/LinkPlus.pdf';
            window.open(url, "_blank");
        },

        openGuideClip : function () {
            var url = 'https://youtu.be/bVq4BakEIOA';
            window.open(url, "_blank");
        }
        
    });

    return AgreementView;

});
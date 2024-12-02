define('store/views/detail', function (require) {

    var Backbone = require('backbone');
    var GO = require('app');
    var $ = require('jquery');
    var Product = require('store/models/product');
    var adminLang = require("i18n!admin/nls/admin");
    var StoreAdmin = require('store/models/store_admin');
    var commonLang = require("i18n!nls/commons");
    var storeLang = require("i18n!store/nls/store");
    var SSOFormView = require("store/views/sso_form");
    var TermsProvided = require("store/models/terms_provided");
    var TermsProvidedView = require("store/views/terms_provided");

    var StoreDetailView = Backbone.View.extend({
        el: '#innerContent',

        events: {
            "click #register": "register",
            "click #goToList ": "goToList",
            "click #useService": "useService",
            "click a[data-type='prev']": "bannerLeft",
            "click a[data-type='next']": "bannerRight",
            "click .list_accordion .subject": "toggleAccordion",
            "click .serviceLink" : "openServicePage"
        },

        initialize: function (options) {
            this.isAdmin = StoreAdmin.getInstance().isAdmin();
            this.tmpl = options.tmpl;
            this.code = options.code;
            this.product = new Product({code: this.code});
            this.initializeBanner();
        },

        render: function () {
            $(this.el).addClass('linkplus_detail');
            var self = this;
            this.product.fetch().done($.proxy(function () {
                var product = self.product.attributes;
                self.$el.html(self.tmpl({
                    storeLang: storeLang,
                    commonLang: commonLang,
                    isApply: self.isAdmin && product.status === 'REGISTRATION_APPLY',
                    inUse : product.status === 'REGISTRATION_COMPLETE',
                    canUse: product.status === 'REGISTRATION_COMPLETE' && product.ssoFlag,
                    canRegister: self.isAdmin && product.status !== 'REGISTRATION_COMPLETE',
                    baseImgUrl: GO.contextRoot + 'resources/images/linkplus/'
                }));

                if (product['ssoFlag']) {
                    self.ssoFormView = new SSOFormView();
                    self.$el.append(self.ssoFormView.render());
                }
            }));

        },

        useService: function () {
            var self = this;
            var product = this.product.attributes;
            var isAgreed = TermsProvided.getInstance(product.id).isAgreed();
            if (!isAgreed) {
                var btnOptions = {
                    btext: storeLang["사용하기"],
                    callback: function (product, checked) {
                        self.saveTermsProvided(product, checked);
                    }
                };
                var termsView = new TermsProvidedView();
                termsView.popUpTermsProvided(product, btnOptions);

                return;
            }
            this.useSSO(product);
        },

        useSSO: function (product) {
            var self = this;
            $.ajax({
                type: "GET",
                url: GO.contextRoot + "api/store/service/sso/data?storeProductId=" + product.id,
                success: function (res) {
                    self.ssoFormView.postSSOForm(product, res.data);
                },
                error: function (resp) {
                    $.goSlideMessage(adminLang['요청 처리 중 오류가 발생하였습니다.'], 'caution');
                }
            });
        },

        saveTermsProvided: function (product, checked) {
            var self = this;
            var termsProvided = new TermsProvided(product.id);
            termsProvided.save(null, {
                url: termsProvided.getUrl() + '&agreed=' + checked,
                success: function () {
                    self.useSSO(product);
                },
                error : function () {

                }
            });

        },

        register: function () {
            var self = this;
            var product = this.product.attributes;
            if (product['regAdditionFlag']) {
                this.goToRegistration();
                return;
            }

            //이미 동의 후 재신청하는 경우
            if(product['termsProvided']) {
                this.postRegistration(product, product['termsProvided']);
                return;
            }

            var btnOptions = {
                btext: commonLang["신청하기"],
                callback: function (product, checked) {
                    self.postRegistration(product, checked);
                }
            };

            var termsView = new TermsProvidedView();
            termsView.popUpTermsProvided(product, btnOptions);
        },

        postRegistration: function (product, termsProvided) {
            var self = this;
            $.ajax({
                type: "POST",
                dataType: "json",
                url: GO.contextRoot + "api/store/service/registration",
                contentType: "application/json",
                data: JSON.stringify({
                    storeProductId: product.id,
                    termsProvided: termsProvided
                }),
                success: function (res) {
                    self.checkOpenUrl(res.data);
                    GO.router.navigate('store/' + self.code + '/detail', true);
                    $.goSlideMessage(storeLang['신청이 완료되었습니다.']);

                },
                error: function (resp) {
                    $.goSlideMessage(resp.responseJSON.message, 'caution');
                }
            });
        },

        goToRegistration: function () {
            GO.router.navigate('store/' + this.code + '/register', true);
        },

        goToList: function () {
            $(this.el).removeClass();
            GO.router.navigate('store/all', true);
        },

        initializeBanner: function () {
            this.BANNER_INDEX = 0;
            this.BANNER_LEN = 3;
            this.BANNER_WIDTH = 801;
        },

        bannerLeft: function () {
            var bIndex = this.BANNER_INDEX - 1;
            if (bIndex < 0)
                bIndex = this.BANNER_LEN - 1;

            this.showBannerAt(bIndex);
        },

        bannerRight: function () {
            var bIndex = this.BANNER_INDEX + 1;
            if (bIndex >= this.BANNER_LEN)
                bIndex = 0;

            this.showBannerAt(bIndex);
        },

        showBannerAt: function (bIndex) {
            this.updateBannerIndex(bIndex);
            if (bIndex !== this.BANNER_INDEX) {
                //  n번째 배너 위치 값 구하기.
                var destination = -this.BANNER_WIDTH * bIndex;

                $("#banner_wrapper").stop();
                $("#banner_wrapper").animate({
                    left: destination
                }, 1000);

                this.BANNER_INDEX = bIndex;
            }
        },

        updateBannerIndex: function (nIndex) {
            var indexSpans = this.$el.find(".banner_rolling_page span");
            indexSpans.removeClass("on");
            $(indexSpans[nIndex]).addClass("on");
        },

        toggleAccordion: function (e) {
            $(e.currentTarget).siblings(".desc").toggleClass("on");
            if ($(e.currentTarget).siblings(".desc")[0].classList.contains("on")) {
                $(e.currentTarget).find('div.optional').children('span').removeClass('arrow_d');
                $(e.currentTarget).find('div.optional').children('span').addClass('arrow_t');
            } else {
                $(e.currentTarget).find('div.optional').children('span').removeClass('arrow_t');
                $(e.currentTarget).find('div.optional').children('span').addClass('arrow_d');
            }
        },

        checkOpenUrl: function (data) {
            var openUrl = data['openUrl'];

            if (openUrl && openUrl.trim() !== "") {
                window.open(openUrl, "_blank");
            }
        },

        openServicePage : function(e) {
            var url = $(e.currentTarget).data('url');
            window.open(url, "_blank");
        }
    });

    return StoreDetailView;

});
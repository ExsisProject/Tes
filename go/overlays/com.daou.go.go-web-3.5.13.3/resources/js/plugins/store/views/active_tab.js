define('store/views/active_tab', function(require) {

    var Backbone = require('backbone');
    var GO = require('app');
    var _ = require('underscore');
    var $ = require('jquery');
    var ActiveTabTmpl = require('hgn!store/templates/active_tab');
    var Products = require('store/collections/products');
    var jsonProducts = require('json!store/views/products.json');
    var BackdropView = require('components/backdrop/backdrop');
    var StoreAdmin = require('store/models/store_admin');
    var adminLang = require("i18n!admin/nls/admin");
    var storeLang = require("i18n!store/nls/store");
    var SSOFormView = require("store/views/sso_form");
    var TermsProvidedView = require("store/views/terms_provided");
    var TermsProvided = require("store/models/terms_provided");


    var ActiveTabView = Backbone.View.extend({

        el : '#innerContent',

        events : {
            "click a.btn_more" : "toggleMore",
            "click li.cancelBtn" : "cancelService",
            "click #goToAllTabBtn" : "goToAllTab",
            "click a.useBtn" : "useService",
            "click .list_album_thum" : "goToDetail",
            "click #guide" : "openGuide",
            "click #banner" : "openBanner",
            "click #closeBanner" : "closeBanner"
        },
        
        initialize : function () {
            this.isAdmin = StoreAdmin.getInstance().isAdmin();
            var type = 'my';
            var options = { statuses : ['REGISTRATION_COMPLETE']};
            if(this.isAdmin) {
                options['statuses'].push('REGISTRATION_APPLY');
            }
            this.myProducts = new Products(type, options);
        },

        getProductList : function() {
            this.productList = [];
            var self = this;
            _.each(jsonProducts, function(product) {
                var model = self.myProducts.getByProductCode(product['code']);
                if (model) {
                    var merged = $.extend({}, product, model);
                    self.productList.push(merged);
                }
            });
            this.productList = _.sortBy(this.productList, 'sortOrder');
        },
        
        render : function () {
            var self = this;
            this.ssoFormView = new SSOFormView();
            this.myProducts.fetch().done($.proxy(function() {
                this.bannerOpened = $.cookie('isStoreBannerClosed') !== 'true';
                this.getProductList();
                this.$el.html(ActiveTabTmpl({
                    showBanner: self.bannerOpened,
                    baseImgUrl : GO.contextRoot + 'resources/images/linkplus/',
                    lang : storeLang,
                    hasProducts : this.productList.length > 0,
                    products : this.productList,
                    button : function () {
                        if (this.status === 'REGISTRATION_COMPLETE') {
                            return 'button';
                        }
                    },
                    canCancel : function () {
                        return this.status === 'REGISTRATION_COMPLETE' && self.isAdmin;
                    },
                    canUse : function () {
                        return this.status === 'REGISTRATION_COMPLETE' && this.ssoFlag;
                    },
                    inUse : function () {
                        return this.status === 'REGISTRATION_COMPLETE';
                    },
                    inApplying : function () {
                        return this.status === 'REGISTRATION_APPLY' && self.isAdmin;
                    }
                }));
                $('.linkplus_my').show();
                $("#active").append(this.ssoFormView.render());
            }, this));
            return this;
        },

        toggleMore : function (e) {
                this.backdropView = new BackdropView();
                this.backdropView.backdropToggleEl = $(e.currentTarget).children(".array_option");
                this.backdropView.linkBackdrop($("a[id="+e.currentTarget.id+"]"));
        },

        cancelService : function (e) {
            var self = this;
            var productId = $(e.currentTarget).attr('data-id');

            $.ajax({
                type: "POST",
                dataType: "json",
                url: GO.contextRoot + "api/store/service/cancel",
                contentType: "application/json",
                data: JSON.stringify({
                    storeProductId : productId
                }),
                success: function (res) {
                    self.checkOpenUrl(res.data);
                    GO.router.navigate('store/my', true);
                    $.goSlideMessage(storeLang['해지 신청이 완료되었습니다.']);
                },
                error: function (resp) {
                    var errorMessage = resp.responseJSON.message;
                    if (errorMessage != null) {
                        $.goSlideMessage(errorMessage, 'caution');
                    } else {
                        $.goSlideMessage(adminLang['요청 처리 중 오류가 발생하였습니다.'], 'caution');
                    }
                }
            });

        },

        useService : function (e) {
            var self = this;
            var productId = $(e.currentTarget).attr('data-id');
            var product = this.myProducts.getByProductId(productId);
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


        goToAllTab : function () {
            GO.router.navigate('store/all', true);
        },

        goToDetail : function (e) {
            var code = $(e.currentTarget).attr('data-code');
            //디테일 뷰 호출 로깅 작업
            this.logDetailViewOpen(code);
            return GO.router.navigate('store/' + code + '/detail', true);
        },

        checkOpenUrl: function (data) {
            var openUrl = data['openUrl'];

            if (openUrl && openUrl.trim() !== "") {
                window.open(openUrl, "_blank");
            }
        },

        logDetailViewOpen : function (code) {
            $.ajax({
                type : 'GET',
                url : GO.contextRoot + 'api/store/service/logging/detail/view?code=' + code
            })
        },

        openGuide : function () {
            window.open('https://www.daouoffice.com/linkplus.jsp', 'guide');
        },

        openBanner: function(e) {
            var btype = $(e.currentTarget).attr('data-btype');
            $.ajax({
                type : 'GET',
                url : GO.contextRoot + 'api/store/service/logging/banner?bannerType=' + btype
            })
            window.open('https://daouoffice.com/cloud_guide/etc/LinkPlus.pdf', 'banner');
        },

        closeBanner: function () {
            $.cookie('isStoreBannerClosed', true, {expires: 1} );
            $("div .banner_s").remove();
        }

    });

    return ActiveTabView;
});












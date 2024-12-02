define('store/views/all_tab', function(require) {

    var Backbone = require('backbone');
    var GO = require('app');
    var _ = require('underscore');
    var $ = require('jquery');
    var AllTabTmpl = require('hgn!store/templates/all_tab');
    var Products = require('store/collections/products');
    var jsonProducts = require('json!store/views/products.json');
    var StoreAdmin = require('store/models/store_admin');
    var storeLang = require("i18n!store/nls/store");

    var AllTabView = Backbone.View.extend({
        el : '#innerContent',
        events : {
            "click .list_album_thum" : "showDetail",
            "click a[data-type='prev']": "bannerLeft",
            "click a[data-type='next']": "bannerRight",
            "click #benefitLink" : "openBenefitPage",
            "click .banner" : "goToDetail"
        },

        initialize : function () {
            this.isAdmin = StoreAdmin.getInstance().isAdmin();
            var type = 'all';
            var options = { statuses : ['REGISTRATION_COMPLETE']};
            if(this.isAdmin) {
                options['statuses'].push('REGISTRATION_APPLY');
            }
            this.allProducts = new Products(type, options);
            this.initializeBanner();
        },

        getProductList : function() {
            this.productList = [];
            var self = this;
            _.each(jsonProducts, function(product) {
                var model = self.allProducts.getByProductCode(product['code']);
                if (model) {
                    var merged = $.extend({}, product, model);
                    self.productList.push(merged);
                }
            });
            this.productList = _.sortBy(this.productList, 'sortOrder');
        },

        render : function () {
            var self = this;
            this.allProducts.fetch().done($.proxy(function() {
                this.getProductList();
                this.$el.html(AllTabTmpl({
                    baseImgUrl : GO.contextRoot + 'resources/images/linkplus/',
                    products : this.productList,
                    lang : storeLang,
                    inUse : function () {
                        return this.status === 'REGISTRATION_COMPLETE';
                    },
                    inApplying : function () {
                        return this.status === 'REGISTRATION_APPLY' && self.isAdmin;
                    }
                }));
            }, this));

            return this;
        },

        showDetail : function (e) {
            var code = $(e.currentTarget).attr('data-code');
            //디테일 뷰 호출 로깅 작업
            this.logDetailViewOpen(code);

            GO.router.navigate("store/all", {trigger: false, pushStatus: true});
            return GO.router.navigate('store/' + code + '/detail', true);
        },

        logDetailViewOpen : function (code) {
            $.ajax({
                type : 'GET',
                url : GO.contextRoot + 'api/store/service/logging/detail/view?code=' + code
            })
        },

        initializeBanner: function () {
            this.BANNER_INDEX = 0;
            this.BANNER_LEN = 3;
            this.BANNER_WIDTH = 1013;
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

        openBenefitPage: function () {
            window.open('https://care.daouoffice.co.kr/hc/ko/articles/900003146743', "benefit");
        },

        goToDetail: function (e) {
            this.logBannerClick(e);
            var code = $(e.currentTarget).attr('data-code');
            return GO.router.navigate('store/' + code + '/detail', true);
        },

        logBannerClick: function (e) {
            var btype = $(e.currentTarget).attr('data-btype');
            var code = $(e.currentTarget).attr('data-code');
            $.ajax({
                type : 'GET',
                url : GO.contextRoot + 'api/store/service/logging/banner?code='+code+'&bannerType='+btype
            })
        }

    });


    return AllTabView;
});
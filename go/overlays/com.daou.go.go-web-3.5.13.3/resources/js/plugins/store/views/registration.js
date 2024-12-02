define('store/views/registration', function (require) {

    var Backbone = require('backbone');
    var GO = require('app');
    var _ = require('underscore');
    var $ = require('jquery');
    var RegTmpl = require('hgn!store/templates/registration');
    var Product = require('store/models/product');
    var jsonProducts = require('json!store/views/products.json');
    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require("i18n!nls/commons");
    var storeLang = require("i18n!store/nls/store");
    var StoreAdmin = require('store/models/store_admin');

    var StoreRegisterView = Backbone.View.extend({
        el: '.linkplus',

        events: {
            "click #register": "register",
            "click #cancel": "goBack",
            "click #popCollect" : "popUpTermsCollect",
            "click #popProvided" : "popUpTermsProvided",
            "click #popMarketing" : "popUpTermsMarketing"
        },

        initialize: function (code) {
            this.isAdmin = StoreAdmin.getInstance().isAdmin();
            this.code = code;
            this.product = new Product({code: this.code});
        },

        render: function () {
            if (!this.isAdmin) {
                GO.router.navigate('/store', true);
                return;
            }

            var self = this;
            this.product.fetch().done($.proxy(function () {
                self.makeProductData();
                self.$el.html(RegTmpl({
                    baseImgUrl: GO.contextRoot + 'resources/images/linkplus/',
                    product : self.product,
                    commonLang : commonLang,
                    storeLang : storeLang,
                    partnerName : self.product.partnerName
                }));
            }));


        },

        makeProductData : function () {
            var self = this;
            var jsonData = _.find(jsonProducts, function (product) {
                return product.code === self.code;
            });

            this.product = $.extend({}, this.product.attributes, jsonData);
        },

        register: function () {
            var self = this;
            if (!this.validateForm()) {
                return false;
            }

            var formData = this.getFormData();
            $.ajax({
                type: "POST",
                dataType: "json",
                url: GO.contextRoot + "api/store/service/registration",
                contentType: "application/json",
                data: JSON.stringify(formData),
                success: function (res) {
                    GO.router.navigate('store/' + self.code + '/detail', true);
                    $.goSlideMessage(storeLang['신청이 완료되었습니다.']);
                },
                error: function (resp) {
                    $.goSlideMessage(resp.responseJSON.message, 'caution');
                }
            });
        },

        getFormData : function () {
            var inputs = $("#regForm :input:not(:checkbox)");
            var formData = GO.util.serializeForm(inputs);

            var checkboxes = $("#regForm :input[type=checkbox]");
            _.each(checkboxes, function(cb) {
                formData[cb.name] = cb.checked;
            });

            formData["storeProductId"] = this.product.id;
            formData["additionalService"] = this.product.name;

            return formData;
        },

        validateForm : function () {
            var inputResult = this.validateInputs();
            var cbResult = this.validateCheckboxes();
            if (!inputResult.value) {
                $.goSlideMessage(inputResult.message);
                return false;
            } else if (!cbResult.value) {
                $.goSlideMessage(cbResult.message + "가 필요합니다");
                return false;
            }
            return true;
        },

        validateInputs : function () {
            var result = {value : true, message : storeLang["필수항목을 모두 입력해주세요."]};
            var inputs = $("#regForm :input[type=text]");
            _.find(inputs, function(data) {
                if (data.value.trim() === '') {
                    result.value = false;
                    return true;
                }
                if (data.name === 'additionalEmail') {
                    var validEmail = $.goValidation.isValidEmail(data.value);
                    if (!validEmail) {
                        result.value = false;
                        result.message = commonLang['이메일 형식이 올바르지 않습니다.'];
                    }
                }
            });

            return result;
        },

        validateCheckboxes : function () {
            var result = {value : true, message : ""};
            var checkboxes = $("#regForm :input[type=checkbox]");
            _.each(checkboxes, function(cb) {
                if(cb.name !== 'termsMarketing' && !cb.checked) {
                    result.value = false;
                    result.message = result.message === "" ? $("label[for='" + cb.id + "'] > a").text() : result.message;
                }
            });

            return result;
        },

        goBack: function () {
            return GO.router.navigate('store/' + this.code + '/detail', true);
        },

        popUpTermsCollect : function () {
            var collectTmpl = $("#collectTmpl").html();
            $.goPopup({
                header: '개인정보 수집 및 활용 동의',
                modal: true,
                pclass: 'layer_normal layer_linkplus_apply',
                contents: collectTmpl
            });
        },

        popUpTermsProvided : function () {
            var providedTmpl = $("#providedTmpl").html();
            $.goPopup({
                header: '개인정보 제3자 제공 동의',
                modal: true,
                pclass: 'layer_normal layer_linkplus_apply',
                contents: providedTmpl
            });

        },

        popUpTermsMarketing : function () {
            var marketingTmpl = $("#marketingTmpl").html();
            $.goPopup({
                header: '마케팅 수신 동의',
                modal: true,
                pclass: 'layer_normal layer_linkplus_apply',
                contents: marketingTmpl
            });


        }
    });

    return StoreRegisterView;

})
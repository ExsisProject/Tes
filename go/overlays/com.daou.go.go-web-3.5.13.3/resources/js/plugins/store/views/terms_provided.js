define('store/views/terms_provided', function (require) {

    var Backbone = require('backbone');
    var $ = require('jquery');
    var TermsProvidedTmpl = require("hgn!store/templates/terms_provided");
    var storeLang = require("i18n!store/nls/store");


    var StoreTermsProvidedView = Backbone.View.extend({

        initialize: function () {

        },

        popUpTermsProvided: function (product, btnOptions) {
            var self = this;
            this.popUpEl = $.goPopup({
                header: '개인정보 제 3자 제공 동의',
                modal: false,
                pclass: 'layer_normal layer_linkplus_apply',
                contents: TermsProvidedTmpl({
                    partnerName: product.partnerName,
                    lang : storeLang
                }),

                buttons: [{
                    autoclose: false,
                    btype: 'confirm',
                    btext: btnOptions.btext,
                    callback: function () {
                        var checked = $('#termsProvide').is(':checked');
                        if (!checked) {
                            $.goSlideMessage('개인정보 제3자 제공 동의가 필요합니다.');
                            return;
                        }
                        btnOptions.callback(product, checked);
                        self.popUpEl.close();
                    }
                }]
            });

            this.popUpEl.reoffset();
        }

    });

    return StoreTermsProvidedView;

})





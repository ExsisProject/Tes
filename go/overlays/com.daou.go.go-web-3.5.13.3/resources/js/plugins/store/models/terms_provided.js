define('store/models/terms_provided', function (require) {
    var Backbone = require('backbone');
    var GO = require('app');

    var StoreTermsProvided = Backbone.Model.extend({

            initialize: function (productId) {
                this.productId = productId;
            },

            url: function () {
                return GO.config('contextRoot') + 'api/store/user/term?productId=' + this.productId;
            },

            isAgreed: function () {
                return this.get('true') != null || this.get('true') !== undefined;
            },

            getUrl: function () {
                return this.url();
            }
        },
        {
            getInstance: function (productId) {
                var instance = new StoreTermsProvided(productId);
                instance.fetch({
                    async: false
                });

                return instance;
            }
        }
    );


    return StoreTermsProvided;
});
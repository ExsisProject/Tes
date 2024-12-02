define('store/collections/products', function (require) {

        var GO = require('app');
        var Backbone = require('backbone');
        var ProductModel = require('store/models/product');

        var Products = Backbone.Collection.extend({
            model: ProductModel,

            initialize: function (type, options) {
                this.type = type;
                this.options = options || {};

            },
            url: function () {
                return GO.contextRoot + "api/store/products/" + this.type + '?' + $.param(this.options, true);
            },

            getByProductCode: function (code) {
                return this.findWhere({code: code}) ? this.findWhere({code: code}).attributes : null;
            },

            getByProductId : function (id) {
                return this.findWhere({id: Number(id)}).attributes;
            }

        });

        return Products;

    }
)
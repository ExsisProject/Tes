define('store/models/product', function (require) {

    var Backbone = require('backbone');

    var Product = Backbone.Model.extend({

        initialize: function (options) {
            this.options = options;
            this.code = options.code;
        },

        url : function () {
            return GO.contextRoot + 'api/store/' + this.code;
        }


    });

    return Product;

});

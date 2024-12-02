define(function(require) {
    var Asset = require('asset/models/reservation_asset');
    var Backbone = require('backbone');
    return Backbone.Collection.extend({

        model: Asset,

        url: function() {
            return GO.contextRoot + 'api/asset/reservation';
        }
    });
});
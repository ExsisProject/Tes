define(function(require) {
    var Backbone = require('backbone');
    return Backbone.Model.extend({
        urlRoot: function() {
            return GO.contextRoot + 'api/asset/' + this.get('assetId') + '/item/' + this.get('itemId') + '/reserve';
        }
    })
});
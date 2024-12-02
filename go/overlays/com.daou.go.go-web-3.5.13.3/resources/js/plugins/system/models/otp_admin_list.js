define([
    "backbone"
],
function(Backbone) {

    return Backbone.Model.extend({

        url: function () {
            return GO.contextRoot + 'ad/api/system/password';
        }

    });
});
define([
    "backbone"
],
function(Backbone) {

	var PasswordConfigModel = Backbone.Model.extend({

        defaults: {
            passwordSearchFeature: false
        },

        url: function() {
            return GO.contextRoot + 'ad/api/system/password';
        }
        
    });

    return PasswordConfigModel;
});
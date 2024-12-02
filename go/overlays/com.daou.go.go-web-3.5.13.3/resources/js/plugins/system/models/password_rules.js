define([
    "backbone"
],
function(Backbone) {

	var PasswordRulsModel = Backbone.Model.extend({

        url: function() {
            return GO.contextRoot + 'ad/api/system/password/rules';
        }
        
    });

    return PasswordRulsModel;
});
define(function(require) {
	var Backbone = require("backbone");

	var PasswordConfigModel = Backbone.Model.extend({
		idAttribute: "_id",
        url: GO.contextRoot + 'api/passwordconfig'
    });

    return PasswordConfigModel;
});
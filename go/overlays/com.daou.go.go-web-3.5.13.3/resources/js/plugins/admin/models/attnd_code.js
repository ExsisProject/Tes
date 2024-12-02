define("admin/models/attnd_code", function(require) {
	var Backbone = require("backbone");
	var GO = require("app");
	
	var AttndCode = Backbone.Model.extend({
		urlRoot : function() {
			return GO.contextRoot + "ad/api/ehr/attnd/code";
		},
		
		initialize : function(options) {
		}
	});
	
	return AttndCode;
});
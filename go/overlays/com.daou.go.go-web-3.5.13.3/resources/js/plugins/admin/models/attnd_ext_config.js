define("admin/models/attnd_ext_config", function(require) {
	var Backbone = require("backbone");
	var GO = require("app");
	
	var AttndExtConfig = Backbone.Model.extend({
		urlRoot : function() {
			return GO.contextRoot + "ad/api/ehr/attnd/config/ext";
		},
		
		initialize : function(options) {
		}
	});
	
	return AttndExtConfig;
});
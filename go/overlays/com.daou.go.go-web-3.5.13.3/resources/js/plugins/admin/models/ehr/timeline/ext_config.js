define("admin/models/ehr/timeline/ext_config", function(require) {
	var Backbone = require("backbone");
	var GO = require("app");
	
	var TimelineExtConfig = Backbone.Model.extend({
		urlRoot : function() {
			return GO.contextRoot + "ad/api/ehr/timeline/config/ext";
		},
		
		initialize : function(options) {
		}
	});
	
	return TimelineExtConfig;
});
define("admin/models/ehr/timeline/code", function(require) {
	var Backbone = require("backbone");
	var GO = require("app");
	
	var TimelineCode = Backbone.Model.extend({
		urlRoot : function() {
			return GO.contextRoot + "ad/api/timeline/status";
		},
		
		initialize : function(options) {
		}
	});
	
	return TimelineCode;
});
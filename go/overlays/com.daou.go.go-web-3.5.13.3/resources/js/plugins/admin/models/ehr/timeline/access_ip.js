define("admin/models/ehr/timeline/access_ip", function (require) {
	var Backbone = require("backbone");
	var GO = require("app");

	var TimelineAccessIp = Backbone.Model.extend({
		urlRoot : GO.contextRoot+"ad/api/timeline/ip"
	});
	return TimelineAccessIp;
});
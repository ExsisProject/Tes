define([
    'underscore',
    'backbone',
    "i18n!approval/nls/approval"
], function(
    _,
    Backbone,
    approvalLang
) {
	var ListItemModel = Backbone.Model.extend({

		initialize: function() {

		},
		url : GO.contextRoot + "ad/api/approval/allapprform"
	});
	return ListItemModel;
});
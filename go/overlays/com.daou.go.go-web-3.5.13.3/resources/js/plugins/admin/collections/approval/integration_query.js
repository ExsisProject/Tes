define([
    'underscore',
    'backbone',
    "admin/models/approval/integration_query"
], function(
	_,
    Backbone,
	IntegrationQueryModel
) {
	var IntegrationQueryCollection = Backbone.Collection.extend({
		
		model : IntegrationQueryModel,
		
		initialize : function() {
		},
	});
	
	return IntegrationQueryCollection;
});
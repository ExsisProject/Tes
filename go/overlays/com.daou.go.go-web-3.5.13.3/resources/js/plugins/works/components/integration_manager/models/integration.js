define("works/components/integration_manager/models/integration", function(require) {

	var BaseModel = require('models/base_model');

	return BaseModel.extend({
		
		initialize : function(options) {
			BaseModel.prototype.initialize.call(this, options);
			this.appletId = options.appletId;
		},
		
		url : function() {
			return GO.contextRoot + "api/works/applets/" + this.appletId + "/integration";
		},
		
		mergeFromFieldsAndParse: function(fields) {
			_.each(this.get('consumers'), function(app) {
				app.fieldLabels = _.compact(_.map(app.fieldMappings, function(fieldMapping) {
					var field = fields.findWhere({cid: fieldMapping.producerFieldCid});
					return field ? field.toJSON().label : null;
				})).join(', ');
				
				app.createdBys = _.compact(_.map(app.fieldMappings, function(fieldMapping) {
					var field = fields.findWhere({cid: fieldMapping.producerFieldCid});
					return field ? fieldMapping.createdBy.name : null;
				})).join(', ');
				
				app.hasListAuth = _.contains(app.privileges, 'SHOW_LIST');
				app.hasDocAuth = _.contains(app.privileges, 'SHOW_DOC');
			});
			_.each(this.get('producers'), function(app) {
				app.fieldLabels = _.compact(_.map(app.fieldMappings, function(fieldMapping) {
					var field = fields.findWhere({cid: fieldMapping.consumerFieldCid});
					return field ? field.toJSON().label : null;
				})).join(', ');
				
				var field = fields.findWhere({cid: app.consumerFieldCid});
				app.field = field ? field.toJSON() : app.consumerFieldCid ;
				app.hasListAuth = _.contains(app.privileges, 'SHOW_LIST');
				app.hasDocAuth = _.contains(app.privileges, 'SHOW_DOC');
			});
		},
		
		getListAuthByCid: function(integrationAppletId) {
			var producers = _.map(this.get('producers'), function(producerIntegration) {
				return {id: producerIntegration.producer.id, privileges: producerIntegration.privileges};
			});
			var producerCollection = new Backbone.Collection(producers);
			var producer = producerCollection.findWhere({id: integrationAppletId});
			if (!producer) return false;
			return _.contains(producer.get('privileges'), 'SHOW_LIST');
		}
	});
});
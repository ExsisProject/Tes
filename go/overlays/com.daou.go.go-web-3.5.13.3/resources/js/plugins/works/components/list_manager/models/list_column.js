define('works/components/list_manager/models/list_column', function(require) {
	
	var FIELD_TYPE = require("works/constants/field_type");
	
	var Model = Backbone.Model.extend({
		initialize : function() {
			this.modelName = "column";
		},
		
		defaults : {
			fieldCid : "",
			columnName : "",
			isTitle : false
		},
		
		isDesc : function() {
			return this.get("isSortBy") && this.get("sortDirection") == "DESC";
		}
		
		//isSortable : function() {
		//	return !_.contains(FIELD_TYPE.NOT_SORTABLE_TYPES, this.get("fieldType"));
		//}
	});
	
	return Model;
});
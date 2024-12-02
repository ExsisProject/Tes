define("works/components/filter/models/filter_condition_option", function(require) {
	
	var ConditionOption = Backbone.Model.extend({
		initialize : function() {
			this.modelName = "filter_condition_option";
		}
	});
	
	return ConditionOption;
});
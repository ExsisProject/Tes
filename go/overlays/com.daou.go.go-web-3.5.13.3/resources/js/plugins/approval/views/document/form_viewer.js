define([
    "jquery",
    "underscore",
    "backbone",
], 
function(
	$, 
	_, 
	Backbone
) {
	var FormViewer = Backbone.View.extend({
		initialize: function(options) {
			this.mode,
			this.contents,
			this.activityGroups = [];
		},
		
		render: function() {
			
		}
	});
	
	
	return FormViewer;
});
define([
    "backbone",
    "models/comments" 
],

function(
		Backbone, 
		Model
) {	
	var Comments = Backbone.Collection.extend({
		model : Model,
		
		initialize : function(options) {
			this.url = options.url;
		},
		
		url: function() {
			return this.url;
		}
	}); 
	
	return Comments;
});
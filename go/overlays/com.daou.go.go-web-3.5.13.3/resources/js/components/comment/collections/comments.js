define([
    "backbone",
    "components/comment/collections/comment" 
],

function(
		Backbone, 
		Comment
) {	
	var Comments = Backbone.Collection.extend({
		model : Comment,
		
		initialize : function(options) {
			this.typeUrl = options.typeUrl;
			this.typeId = options.typeId;
		},
		
		url : function() {
			return GO.contextRoot + ["api", this.typeUrl , this.typeId, "comment"].join('/') + "?offset=1000";
		}
	}); 
	
	return Comments;
});
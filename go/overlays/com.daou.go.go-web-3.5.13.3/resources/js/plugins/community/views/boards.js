(function() {
	define([
	    "jquery",
	    "backbone", 	
	    "app",	    
	    "community/collections/boards",	    
	], 
	function(
		$,
		Backbone,
		App, 
		communityBoardCollection
	) {
		var Boards = Backbone.View.extend({
			initialize: function(options) {
				this.options = options || {};
				this.collection = communityBoardCollection.getCollection(this.options.communityId, this.options.status);
			},
			render: function() {				
			}			
		});		
		return {
			render: function(args) {
				return new Boards(args).render();
			}
		};
	});
}).call(this);
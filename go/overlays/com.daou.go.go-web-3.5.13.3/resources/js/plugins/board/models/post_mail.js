define([
    "backbone",
    "app"
],

function(Backbone, App) {
	
	var PostMailModel = Backbone.Model.extend({

		initialize: function(options) {
			this.boardId = options.boardId;
			this.postId = options.postId;
		},

		url: function() {
			return [GO.contextRoot + "api/board", this.boardId, "post", this.postId, "email"].join('/');
		}
	}); 
	
	return PostMailModel;
});
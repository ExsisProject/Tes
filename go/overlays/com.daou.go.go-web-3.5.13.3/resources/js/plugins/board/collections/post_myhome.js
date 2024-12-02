define([
    "backbone",
    "board/models/post" 
],

function(
		Backbone, 
		Model
) {	
	var BoardPosts = Backbone.Collection.extend({
		model : Model,
		initialize : function(opt){
		    var type = (opt == undefined) ? "" : opt.url_type;
		    
		    this.url_type = type;
		},
		url: function() {
		    var urlType = (this.url_type == undefined) ? "" : "/" + this.url_type;
			return "/api/board/myhome" + urlType;
		}
	}); 
	return {
		getCollection: function(opt) {
			
			var async = false;
			if(typeof opt.async != "undefined"){
				async = opt.async;
			}			
			var boardPosts = new BoardPosts(opt);
			boardPosts.fetch({
								data : opt.data,
								async: async,
								contentType:'application/json',
								reset: true
								});
			return boardPosts;
		},
		create : function(opt) {
			return new BoardPosts(opt);
		}
	};
	//return BoardPosts;
});
define([
    "backbone"
//    ,
//    "board/models/clipboard" 
],

function(
		Backbone
//		, 
//		Model
) {	
	var ClipBoardList = Backbone.Collection.extend({
//		model : Model,
		url: function() {
			return "/api/clipboard";
		},
		
	}); 
	return ClipBoardList;
});
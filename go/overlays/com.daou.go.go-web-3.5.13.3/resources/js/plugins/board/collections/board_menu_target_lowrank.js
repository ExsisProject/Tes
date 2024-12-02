(function() {
	define([
        "backbone"
//        ,
//        "board/models/board_menu_list" 
    ],

    function(
    		Backbone
//    		, 
//    		Model
    ) {	
    	var instance = null;
    	var BoardMenuList = Backbone.Collection.extend({
//    		model : Model,
    		url: function() {
    			return "/api/board/menu/target/lowrank";
    		}
    	}); 
    	
    	return {
    		getCollection: function() {
    			if(instance == null) instance = new BoardMenuList();
    			instance.fetch({ async : false });
    			return instance;
    		}
    	};
    });
}).call(this);

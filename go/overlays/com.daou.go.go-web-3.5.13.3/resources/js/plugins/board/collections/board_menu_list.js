define([
    "backbone"
],

function(
		Backbone
) {	
	var instance = null;
	var BoardMenuList = Backbone.Collection.extend({
		url: function() {
			return "/api/board/menu";
		},
		
		
		hasBoard : function() {
			var hasBoard = false;
			_.each(this.models, function(model) {
				if (model.has("boards") && model.get("boards").length) hasBoard = true; 
			});
			return hasBoard;
		}
	}); 
	
	return {
		getCollection: function() {
			if(instance == null) instance = new BoardMenuList();
			instance.fetch({reset: true});
			return instance;
		},
		getMenus : function() {
			if(instance == null) instance = new BoardMenuList();
			instance.fetch({async : false});
			return instance;
		},
		// Deprecated!! 게시판 create 직후 바로 hasBoard 를 하면 check 안됨.
//		hasBoard: function() {
//			var hasBoard = false;
//			if(instance == null) instance = new BoardMenuList();
//			if(instance.code != 200) instance.fetch({async : false});
//			$.each(instance.toJSON(), function(k,v) {
//				if(v.hasOwnProperty('boards')){
//					if(v.boards.length) hasBoard = true;
//				}
//			});
//			return hasBoard;
//		},
		hasBoardWritable: function(){
			var hasWritable = false;
			if(instance == null) instance = new BoardMenuList();
			if(instance.code != 200) instance.fetch({async : false});
			$.each(instance.toJSON(), function(k,v) {
				if(v.hasOwnProperty('boards')){
					$.each(v.boards,function(m,n){
						if(n.menu && n.actions.writable){
							hasWritable = true;
						}
					});
				}
			});
			return hasWritable;
		},
		create : function(opts){
		    return new BoardMenuList(opts);
		}
	};
});
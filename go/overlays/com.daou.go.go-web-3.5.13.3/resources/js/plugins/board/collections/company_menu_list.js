(function() {
define([
    "backbone"
],
function(
		Backbone
) {	
	var instance = null;
	var CompanyMenuList = Backbone.Collection.extend({
		url: function() {
			return "/api/board/menu/company/all";
		},
		
		
		hasBoard : function() {
			return this.length ? true : false;
		},
		
		
		getClassicBoards : function() {
			var classicBoards = _.filter(this.models, function(model) {
				return model.get("type") == "CLASSIC";
			});
			
			return new Backbone.Collection(classicBoards);
		}
	}); 
	
	return {
		getCollection: function() {
			instance = new CompanyMenuList();
			instance.fetch({async : false});
			return instance;
		},
//		hasBoardWritable: function(){
//			var hasWritable = false;
//			if(instance == null) instance = new CompanyMenuList();
//			if(instance.code != 200) instance.fetch({async : false});
//			$.each(instance.toJSON(), function(k,v) {
//				if(v.hasOwnProperty('actions')){		
//					if(v.menu && v.actions.writable){
//						hasWritable = true;
//					}
//				}
//			});
//			return hasWritable;
//		},
		create : function(opts){
		    return new CompanyMenuList(opts);
		}
	};
});
}).call(this);
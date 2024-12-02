define([
    "backbone"
],

function(Backbone) {
	
	var LinkMenu = Backbone.Model.extend({
	    urlRoot: GO.contextRoot+"ad/api/messenger/link"
	}, {
		get: function(id) {
			var instance = new LinkMenu();
			instance.set("id", id, {silent:true});
			instance.fetch({async:false});
			return instance;
		},
	    create : function() {
	        return new LinkMenu();
	    }
	}); 
	
	return {
		read : function(id){
			return linkMenu = LinkMenu.get(id);
		},
		create : function(){
		    return LinkMenu.create();
		}
	};
});
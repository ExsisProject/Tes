define([
    "backbone"
],

function(Backbone) {
	
	var AttndAccessIp = Backbone.Model.extend({
	    urlRoot: GO.contextRoot+"ad/api/ehr/attnd/ip"
	}, {
		get: function(id) {
			var instance = new AttndAccessIp();
			instance.set("id", id, {silent:true});
			instance.fetch({async:false});
			return instance;
		},
	    create : function() {
	        return new AttndAccessIp();
	    }
	}); 
	
	return {
		read : function(id){
			return attndAccessIp = AttndAccessIp.get(id);
		},
		create : function(){
		    return AttndAccessIp.create();
		}
	};
});
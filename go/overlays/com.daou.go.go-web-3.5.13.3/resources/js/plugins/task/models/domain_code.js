define([
    "backbone"
],

function(Backbone) {
	var DomainCode = Backbone.Model.extend({});
    var DomainCodes = Backbone.Collection.extend({
    	
    	model : DomainCode,
    	
    	
    	url : function() {
    		return "/api/" + this.type + "/list";
    	},
    	
    	
    	getList : function(type) {
    		var self = this;
    		var deferred = $.Deferred();
    		
    		this.type = type;
    		if (this[type]) {
    			this.models = _.clone(this[type]);
    			deferred.resolve(this);
    		} else {
    			this.fetch({
    				success : function(collection) {
    					self[type] = _.clone(collection.models);
    					deferred.resolve(self);
    				}
    			});
    		}
    		return deferred;
    	}
    }); 
	return DomainCodes;
});
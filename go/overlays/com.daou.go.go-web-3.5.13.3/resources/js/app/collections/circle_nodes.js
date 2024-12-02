define(
    [
        "backbone"
    ],

    function(
            Backbone
    ) { 
        var CircleNode = Backbone.Model.extend({
        	getMemberNames : function() {
        		return _.map(this.members(), function(member) {
        			return member.data.attr.title; 
        		});
        	},
        	
        	getMembers : function() {
        		return _.map(this.members(), function(member) {
        			return member.metadata; 
        		});
        	},
        	
        	members : function() {
        		return _.filter(this.get("children"), function(children) {
        			return _.contains(["MEMBER", "MASTER", "MODERATOR"], children.data.attr.rel);
        		});
        	}
        });
        
        var CircleNodes = Backbone.Collection.extend({
            model : CircleNode,
            
            
            initialize : function(options) {
            	this.circle = options.circle;
            	this.type = options.type; // tree or member
            },
            
            
            url : function() {
        		return GO.contextRoot + "api/org/circle/" + this.type;
            },
            
            getCircle : function(id) {
            	return _.find(this.models, function(model) {
					return model.get("data").id == "org_" + id; 
				});
            },
            
            
            listParser : function() {
            	var data = _.map(this.models, function(node) {
            		return this.isMemberType() ? node.get("metadata") : node.toJSON();
            	}, this);
            	
            	return _.flatten(data);
            },
            
            
            isMemberType : function() {
            	return this.type == "member";
            }
        });
    
        return CircleNodes;
    }
);
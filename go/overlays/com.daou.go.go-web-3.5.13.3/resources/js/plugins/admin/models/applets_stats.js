define([
    "backbone"
],
function(Backbone) {
    var WorksStats = Backbone.Model.extend({
    	
    	initialize : function() {
		},
		
        url : function() {
        	return "/ad/api/works/present";
        },
        
        totalAppletCount : function() {
        	return parseInt(this.get("aliveApplets"));
        },
        
        totalDocCount : function() {
        	return parseInt(this.get("docs"));
        },
        
        typeLabel : function() {
        	return _.map(this.get("types"), function(type) {
        		return type.name;
        	}).join(", ");
        }
    }); 
    
    return WorksStats;
});

define([
    "backbone"
],
function(Backbone) {
    var TaskStats = Backbone.Model.extend({
    	
    	initialize : function() {
		},
		
        url : function() {
        	return "/ad/api/task/present";
        },
        
        totalCount : function() {
        	return parseInt(this.get("aliveFolders")) + parseInt(this.get("stoppedFolders"));
        },
        
//        amount : function() {
//        	return GO.util.getHumanizedFileSize(this.get("attachSize"));
//        },
        
        typeLabel : function() {
        	return _.map(this.get("types"), function(type) {
        		return type.name;
        	}).join(", ");
        }
    }); 
    return TaskStats;
});

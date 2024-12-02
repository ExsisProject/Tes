define([
    "backbone"
],

function(Backbone) {
    var TaskActivity = Backbone.Model.extend({
    	initialize : function(data) {
    		this.taskId = data.taskId;
    		this.id = data.activityId || data.id || null;
    	},
    	
    	
    	defaults : {
    		commentCount : 0
    	},
    	
    	
    	urlRoot : function() {
    		return "/api/task/" + this.taskId + "/activity" ;
    	},
    	
    	
    	setTaskId : function(taskId) {
    		this.taskId = taskId;
    	},
    	
    	
    	commentPresent : function() {
    		return this.get("commentCount") > 0;
    	},
    	
    	
    	createdAt : function() {
    		return GO.util.basicDate3(this.get("createdAt"));
    	},
    	
    	
    	isModify : function() {
    		return this.get("createdAt") != this.get("updatedAt");
    	},
    	
    	
    	modifyTime : function() {
    		return this.isModify() ? this.get("updatedAt") : this.get("createdAt");
    	},
    	
    	
    	hasAttach : function() {
    		return this.has("attaches") && this.get("attaches").length > 0;
    	},
    	
    	
    	hasMobileContent : function() {
    		return this.mobileContent() === "" ? false : true;
    	},
    	
    	
    	mobileContent : function() {
    		var content = this.get("content").replace(/[<][^>]*[>]/gi, "").replace(/&nbsp;/gi, "").trim();
    		return content;
    	},
    	
    	hasMoreComment : function() {
    		return this.get("commentCount") > this.get("comments").length;
    	}
    }); 
    return TaskActivity;
});
define([
    "backbone",
    "i18n!task/nls/task"
],
function(Backbone, taskLang) {
    var TaskType = Backbone.Model.extend({
    	
    	initialize : function(id) {
    		this.id = id;
		},
		
		
		urlRoot : function() {
    		return "/ad/api/task/type";
		},
		
		
		defaults : {
			name : "",
			description : "",
			approver : false,
			appliedFolders : 0,
			taskStatuses : [{
		      "name" : taskLang["대기"],
		      "start" : false,
		      "end" : false,
		      "doing" : false
		    }, {
		      "name" : taskLang["진행"],
		      "start" : false,
		      "end" : false,
		      "doing" : false
		    }, {
		      "name" : taskLang["완료"],
		      "start" : false,
		      "end" : true,
		      "doing" : false
		    }],
			addPushes : [],
			editPrivileges : [],
			editPushes : [],
			deletePrivileges : ["REGISTRANT", "ADMIN"],
			transitions : [],
			status : "HIDDEN"
		},
		
		
		statusLabel : function() {
			var statuses = _.map(this.get("taskStatuses"), function(status) {
				return status.name;
			});
			return statuses.join("-");
		},
		
		
		isShow : function() {
			return this.get("status") == "SHOW";
		},
		
		
		editable : function() {
			return this.get("appliedFolders") == 0;
		},
		
		
		auths : function(type) {
			var auths =[];
			auths = _.filter(this.get("edit" + type), function(attr) {
				return _.contains(["DUEDATE", "ASSIGNEE", "NAME"], attr.attribute); // ETC 는 NAME 을 참조  
			});
			
			return auths;
		}
    }); 
    return TaskType;
});

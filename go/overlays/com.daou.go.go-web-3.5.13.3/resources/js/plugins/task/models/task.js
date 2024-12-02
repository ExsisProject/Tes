define([
    "backbone",
    "task/models/task_folder"
],

function(
		Backbone, 
		TaskFolder 
		) {
    var Task = Backbone.Model.extend({
    	
    	initialize : function(data) {
    		this.id = data ? data.id : null;
    	},
    	
    	
    	urlRoot : function() {
    		return "/api/task";
    	},
    	
    	
    	isDelay : function() {
    		if (this.get("dueDate") === undefined) return false;
    		
    		var dueDate = GO.util.toMoment(this.get("dueDate"));
    		var currentDate = GO.util.now();
    		
    		return (dueDate < currentDate) && !this.get("status").end ? true : false;
    	},
    	
    	
    	hasActivity : function() {
    		return this.get("activityCount") > 0 ? true : false;
    	},

        hasBeginDate : function() {
            return this.get("beginDate") ? true : false;
        },
    	
    	hasDueDate : function() {
    		return this.get("dueDate") ? true : false;
    	},

		getShortBeginDate : function() {
			return this.get("beginDate") ? GO.util.shortDate(this.get("beginDate")) : "";
		},

		getBeginDate : function() {
			return this.get("beginDate") ? GO.util.basicDate2(this.get("beginDate")) : "";
		},

		getShortDueDate : function() {
			return this.get("dueDate") ? GO.util.shortDate(this.get("dueDate")) : "";
		},

		getDueDate : function() {
			return this.get("dueDate") ? GO.util.basicDate2(this.get("dueDate")) : "";
		},
    	
    	firstAssignee : function() {
    		var assignees = this.get("assignees");
    		var assignee = _.find(assignees, function(assignee) {
    			return assignee.id == GO.session().id;  
    		});
    		
    		return assignee || assignees[0];
    	},
    	
    	
    	assigneeLabel : function(str1, str2) {
    		var assignees = this.get("assignees");
    		
    		if (assignees.length == 0) return "-";
    		
    		var assignee = this.firstAssignee();
    		var assigneeStr = assignee.name; 
    		
			if (assignees.length == 1) {
				assigneeStr = assigneeStr + " " + assignee.position || "";
			} else if (assignees.length > 1) {
				assigneeStr = assigneeStr + " " + str1 + " " + (assignees.length - 1) + str2;
			}
			
			return assigneeStr;
    	},
    	
    	creatorLabel : function() {
    		var creator = this.get("creator");
    		return creator.name + " " + creator.position || "";
    	},
    	
    	
    	getEditableAttribute : function() {
    		var deferred = $.Deferred();
			var editable = {
				APPROVER: true,
				ASSIGNEE: true,
				CONTENT: true,
				DUEDATE: true,
				FIELD: true,
				NAME: true,
				PRIVATETASK: true,
				REFERER: true,
				TAG: true
			};
			
			var url;
			if (this.get("id")) {
				url = this.get("id") + "/attribute/editable";
			} else {
				var issueTypeId = this.get("issueType").id;
				if (!issueTypeId) return deferred.resolve(editable);
				url = "attribute/writable/" + this.get("issueType").id;
			}
			
			
			$.ajax({
				type : "GET",
				async : false,
				url : GO.contextRoot + "api/task/" + url,
				success : function(resp) {
					var attributes = _.keys(editable);
					var nonPermissionAttr = _.difference(attributes, resp.data);
					
					_.each(resp.data, function(attr) {
						editable[attr] = true;
					});
					_.each(nonPermissionAttr, function(attr) {
						editable[attr] = false;
					});
					
					deferred.resolve(editable);
				}
			});
			
			return deferred;
    	},
    	
    	
    	getAction : function() {
    		var self = this;
    		var deferred = $.Deferred();
    		
    		$.ajax({
    			type : "GET",
    			url : GO.contextRoot + "api/task/" + this.get("id") + "/action",
    			success : function(resp) {
    				self.actions = resp.data;
    				deferred.resolve(resp.data);
    			}
    		});
    		
    		return deferred;
    	},
    	
    	
    	hasAction : function() {
    		return this.actions && this.actions.length > 0;
    	},
    	
    	
    	getUpdatedAt : function() {
    		return this.get("id") ? GO.util.toISO8601(new Date()) : null;
    	},
    	
    	
    	getTagLabel : function() {
    		return this.get("tags").join(", ");
    	},
//    	
//    	
//    	isAssigneeType : function() {
//    		return this.get("id") || this.get("issueType").directlyAssign; 
//    	},
//    	
//    	
    	isReadable : function() {
    		return this.get("actions").readable;
    	},
    	
    	
    	parsedAttaches : function() {
        	return _.each(this.get("attaches"), function(attach) {
        		attach["icon"] = GO.util.getFileIconStyle(attach);
        		attach["fileSizeString"] = GO.util.getHumanizedFileSize(attach.size);
        	});
        },
        
        
        getFiles : function() {
        	return _.filter(this.parsedAttaches(), function(attach) {
        		return !GO.util.isImage(attach.extention);
        	});
        },
        
        getImages : function() {
        	return _.filter(this.parsedAttaches(), function(attach) {
        		return GO.util.isImage(attach.extention);
        	});
        },
		
		hasEvent : function() {
			var event = this.get("calendarEvent");
			if(event){
				return true;
			}
			return false;
		},
		getEventStartDate : function() {
			if(this.hasEvent()) {
				return GO.util.basicDate(this.get("calendarEvent").startTime);
			}else{
				return '';
			}
		},
		getEventEndDate : function() {
			if(this.hasEvent()) {
				return GO.util.basicDate(this.get("calendarEvent").endTime);
			}else{
				return '';
			}
		},
		getEventSummary : function() {
			if(this.hasEvent()) {
				return this.get("calendarEvent").summary;
			}else{
				return '';
			}
		},
		getEventLocation : function() {
			if(this.hasEvent()) {
				return this.get("calendarEvent").location;
			}else{
				return '';
			}
		},
		getCalendarId : function() {
			if(this.hasEvent()) {
				return this.get("calendarEvent").calendarId;
			}else{
				return '';
			}
		},
		getEventType : function() {
			if(this.hasEvent()) {
				return this.get("calendarEvent").type;
			}else{
				return '';
			}
		},
		getEventId : function() {
			if(this.hasEvent()) {
				return this.get("calendarEvent").id;
			}else{
				return '';
			}
		},
		getCalendarTimeType : function() {
			if(this.hasEvent()) {
				return this.get("calendarEvent").timeType;
			}else{
				return '';
			}
		},
		getCalendarEventCreator : function() {
			if(this.hasEvent()) {
				return this.get("calendarEvent").creator;
			} else {
				return null;
			}
		}
    }); 
    return Task;
});
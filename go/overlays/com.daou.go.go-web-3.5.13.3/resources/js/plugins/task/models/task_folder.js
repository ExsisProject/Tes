define([
    "backbone",
    
    "jquery.go-sdk"
],

function(
		Backbone
		) {
    var TaskFolder = Backbone.Model.extend({
    	initialize : function(data) {
    		this.id = data ? data.id : null;
    	},
    	
    	
    	urlRoot : function() {
    		return "/api/task/folder";
    	},
    	
    	
    	defaults : {
        	id : null,
        	name : "",
        	types : [],
        	fields : [],
        	createdAt : null,
        	updatedAt : null,
        	description : "",
        	share : {
        		departmentShares : [],
        		domainCodeShares : []
        	}
        },
    	
    	
    	getDepartment : function() {
    		return $.ajax({
    			url : GO.contextRoot + "api/department/profile/" + this.get("deptId")
    		});
    	},
    	
    	
    	adminLabel : function() {
    		if (!this.get("admins")) return "";
    		return $.map(this.get("admins"), function(admin) {
    			return admin.name + " " + admin.position || "";
    		}).join(", ");
    	},
    	
    	
    	minAdminLabel : function(str1, str2) {
    		var admins = this.get("admins");
    		if (admins.length == 0) return;
			var adminLabel = admins[0].name + " " + admins[0].position || "";
			if (admins.length > 1) {
				adminLabel = adminLabel + " " + str1 + " " + (admins.length - 1) + str2;
			}
			return adminLabel;
    	},
    	
    	
    	hasAdmin : function() {
    		return this.get("admins") && this.get("admins").length > 0;
    	},

    	
    	findIssueType : function(id) {
    		var types = this.get("types");
    		if (types.length == 1 || !id) return types[0];
    		return _.find(types, function(type) {
				return id == type.id;
			});
    	},
    	
    	
    	getCurrentTypeFields : function(id) {
    		if (!id) return null;
    		if (!this.findIssueType(id)) return [];
    		return this.findIssueType(id).fields;
    	},
    	
    	
    	getMovableFolders : function() {
    		var self = this;
    		var deferred = $.Deferred();
    		
    		$.ajax({
    			type : "GET",
//    			dataType : "json",
    			url : GO.contextRoot + "api/task/folder/dept/" + this.get("deptId"),
    			success : function(resp) {
    				var folders = _.filter(resp.data.folders, function(folder) {
    					return self.get("id") != folder.id;
    				});
    				deferred.resolve(folders);
    			}
    		});
    		
    		return deferred;
    	},
    	
    	
    	getDepartmentShareIds : function() {
    		var ids = _.map(this.getDepartmentShares(), function(dept) {
    			return dept.nodeId;
    		});
    		return _.reject(ids, function(id) {
    			return id == this.get("deptId");
    		}, this);
    	},
    	
    	
    	getDomainCodeShareIds : function() {
    		return $.map(this.getDomainCodeShares(), function(dept) {
    			return dept.nodeId;
    		});
    	},
    	
    	
    	getDepartmentShares : function() {
    		return _.filter(this.get("share").nodes, function(node) {
    			return _.contains(["department", "subdepartment"], node.nodeType);
    		});
    	},
    	
    	
    	getSubDepartmentShares : function() {
    		return _.filter(this.get("share").nodes, function(node) {
    			return _.contains(["subdepartment"], node.nodeType);
    		});
    	},
    	
    	
    	getDomainCodeShares : function() {
    		return _.filter(this.get("share").nodes, function(node) {
    			return _.contains(["position", "grade", "duty", "usergroup"], node.nodeType);
    		});
    	},
    	
    	
    	getCompanyShare : function() {
    		return _.filter(this.get("share").nodes, function(node) {
    			return node.nodeType == "company";
    		});
    	},
    	
    	
    	isNews : function() {
    		return this.get("taskCreatedAt") ? GO.util.isCurrentDate(this.get("taskCreatedAt"), 1) : false;
        },
        
        
        isPrivate : function() {
        	var deptShares = this.getDepartmentShares();
        	var domainCodeShares = this.getDomainCodeShares();
        	
        	if (domainCodeShares.length) return true;
        	
    		var myDeptShares = _.find(deptShares, function(dept) {
    			return dept.nodeId == this.get("deptId");
    		}, this);
    		
    		if (!myDeptShares) return false;
    		
    		return myDeptShares.members.length ? true : false;
        },
    	
    	
    	isShare : function() {
        	var deptShares = this.getDepartmentShares();
        	var isSubShare = this.isSubDepartmentShare();
        	
    		var otherDeptShares = _.reject(deptShares, function(dept) {
    			return dept.nodeId == this.get("deptId");
    		}, this);
    		
    		return otherDeptShares.length || isSubShare ? true : false;
        },
    	
    	
    	isSubDepartmentShare : function() {
    		return this.getSubDepartmentShares().length > 0;
    	},
    	
    	
    	isDepartmentShare : function() {
    		return this.getDepartmentShares().length > 0; 
    	},
    	
    	
    	isCompanyShare : function() {
    		return this.getCompanyShare().length > 0 || this.getDomainCodeShares().length > 0;
    	},
    	
    	
    	isDomainCodeShare : function() {
    		return this.getDomainCodeShares().length > 0;
    	},
    	
    	
    	isMultiType : function() {
    		return this.get("types").length > 1 ? true : false;
    	},
    	
    	
    	getIssueTypes : function() {
    		return this.get("types") || [];
    	},
    	
    	
    	defaultType : function() {
    		return this.id ? this.get("types")[0] : {}; 
    	},
    	
    	
		getPredefinedField : function() {
			var self = this;
			var deferred = $.Deferred();
			
			$.ajax({
    			type : "GET",
    			url : GO.contextRoot + "api/task/field/predefined",
    			success : function(resp) {
    				var fields = [];
    				$(resp.data).map(function(key, value) {
						fields.push(value);
					});
    				deferred.resolve(self.fieldParser(fields));
    			}
    		});
			
			return deferred;
		},

		
		getTaskType : function() {
			var deferred = $.Deferred();
			
			$.ajax({
    			type : "GET",
    			url : GO.contextRoot + "api/task/type",
    			success : function(resp) {
    				var taskTypes = [];
    				$(resp.data).map(function(key, value) {
						taskTypes.push({
							id : value.id,
							name : value.name, 
							description : value.description,
							isApprover : value.approver,
							checked : key == 0 ? true : false
						});
					});
    				deferred.resolve(taskTypes);
    			}
    		});
			
			return deferred;
		},
		
		
		getRequiredFields : function() {
			return _.filter(this.get("fields"), function(field) {
    			return field.required;
    		});
		},
		
		
		getRequiredSelectFields : function() {
			return _.filter(this.getRequiredFields(), function(field) {
				return field.type == "SELECT";
			});
		},
		
		
		getRequiredTextFields : function() {
			return _.filter(this.getRequiredFields(), function(field) {
				return field.type == "TEXT";
			});
		},
		
		
		getTextFields : function() {
			return _.filter(this.get("fields"), function(field) {
				return field.type == "TEXT";
			});
		},
		
		
		fieldParser : function(fields) {
			return _.each(fields, function(field) {
				if (field.type == "BOOLEAN") field["defaultValue"] = GO.util.toBoolean(field.defaultValue);
			});
		},
		
		
		parsedFields : function() {
			return this.fieldParser(this.get("fields"));
		}
    }); 
    return TaskFolder;
});
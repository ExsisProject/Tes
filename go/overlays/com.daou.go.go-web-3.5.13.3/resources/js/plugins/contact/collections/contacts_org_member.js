;(function() {
	define([
	    "backbone",
	    "contact/models/company_group" 
	],
	function(
			Backbone, 
			Model
	) {	
		var instance = null;
		var DeptMember = Backbone.Collection.extend({
			model : Model,
			url: function() {
				if(this.keyword == undefined || this.keyword == "") {
					return "/api/department/members/sorted?offset=20&page="+this.page+"&deptId="+this.deptId;
				} else if (this.nodeType == "department"){
					return "/api/org/user/sort/list?offset=20&nodeType="+this.nodeType+"&nodeId="+this.nodeId+"&page="+this.page +"&keyword="+encodeURIComponent(this.keyword);
				} else {
					return "/api/org/user/sort/list?offset=20&nodeType=org&page="+ this.page +"&keyword="+ encodeURIComponent(this.keyword);
				}
			}
		});

		return {
			getCollection: function(deptId, keyword, page, nodeType, nodeId) {
				if(instance == null) instance = new DeptMember();
				instance.deptId = (deptId == undefined) ? null : deptId;
				instance.keyword = keyword;
				instance.page = page;
				instance.nodeType = nodeType;
				instance.nodeId = nodeId;
				instance.fetch({ async : false, reset : true});
				return instance;
			}	
		};	
	});
})();
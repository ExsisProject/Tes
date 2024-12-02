define(function(require){

    var Backbone = require("backbone");

	var DeptContact = Backbone.Model.extend({
		urlRoot : function() {
			return "/api/contact/dept/"+this.deptId+"/contact";
		},
		
		setDeptId : function(deptId){
            this.deptId = deptId;
		}
	});
	return DeptContact;
});
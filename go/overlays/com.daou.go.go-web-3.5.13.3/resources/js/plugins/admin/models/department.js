(function() {
define([
    "backbone"
],

function(Backbone) {
	
	var DepartmentModel = Backbone.Model.extend({
	    
		url: function() {
		    var isDeleted = (this.get('isDeleted') == undefined) ? false : this.get('isDeleted');
		    
		    if(isDeleted){
		        return "/ad/api/department/" + this.get('id') + "/delete";
		    }else{
		        return "/ad/api/department/" + this.get('id');
		    }
		},
		
		setModifyFlag : function() {
			this.set("isModifyEmail", this.get("emailId") == "");
			this.set("isModifyCode", this.get("code") == "");
			this.set("isModifyAlias", this.get("deptAlias") == "");
			this.set("isModifyUseReception", false);
		}
	}); 
	
	return DepartmentModel;
});
}).call(this);
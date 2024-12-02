define([
    "admin/models/approval/appr_dept_folder",
], function(
	Folder
) {
	var DeptFolders = Backbone.Collection.extend({
		
		model : Folder,
		
		initialize : function() {
		},
		
		url : function() {
			return GO.contextRoot + "ad/api/approval/deptfolder/" + this.deptId;
		},
		
		setDeptId : function(deptId) {
			this.deptId = deptId;
		},
		
		deleteFolders : function(data) {
			return $.ajax({
				url : GO.contextRoot + "ad/api/approval/deptfolder/" + this.deptId + "/folder",
				type : "DELETE",
				contentType : 'application/json',
				data : JSON.stringify(data)
			});
		},
		
		submitOrder : function(data) {
			return $.ajax({
				url : GO.contextRoot + "ad/api/approval/deptfolder/" + this.deptId + "/folder/sort",
				type : "PUT",
				contentType : 'application/json',
				data : JSON.stringify(data)
			});
		}
	});
	
	return DeptFolders;
});
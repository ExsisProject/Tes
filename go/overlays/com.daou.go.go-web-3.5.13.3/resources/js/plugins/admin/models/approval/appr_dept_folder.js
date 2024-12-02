define([], function() {
	var Folder = Backbone.Model.extend({
		
		initialize : function(options) {
			this.deptId = options.deptId;
		},
		
		urlRoot : function() {
			var deptId = this.deptId || this.collection.deptId;
			return GO.contextRoot + "ad/api/approval/deptfolder/" + deptId + "/folder";
		}
	});
	
	return Folder;
});
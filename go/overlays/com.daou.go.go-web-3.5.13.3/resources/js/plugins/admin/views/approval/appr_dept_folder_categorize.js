define([
	"hgn!admin/templates/approval/appr_dept_folder_categorize",
	"admin/collections/approval/appr_dept_folders"
], 
function(
    Template,
    DeptFolders
) {	
	
	var View = Backbone.View.extend({
		
		initialize : function(options) {
			this.department = options.department;
			this.collection = new DeptFolders();
			this.collection.setDeptId(this.department.id);
			this.collection.on("sync", this.render, this);
			this.collection.fetch();
		},
		
		
		events : {
			"click p" : "_selectFolder"
		},
		
		
		render : function() {
			this.$el.html(Template({
				id : this.department.id,
				name : this.department.name,
				collection : this.collection.toJSON()
			}));
			
			return this;
		},
		
		/**
		 * 선택된 아이템 highlight
		 * @method _selectFolder
		 */
		_selectFolder : function(e) {
			var target = $(e.currentTarget);
			this.$("p").removeClass("on");
			if (target.attr("data-folderId")) {
				target.addClass("on");
			}
		},
		
		
		/**
		 * 선택된 아이템 반환
		 * @method _selectFolder
		 * @return {object} $(element)
		 */
		getSelectedFolderEl : function() {
			return this.$("p.on");
		}
	});
	
	return View;
});
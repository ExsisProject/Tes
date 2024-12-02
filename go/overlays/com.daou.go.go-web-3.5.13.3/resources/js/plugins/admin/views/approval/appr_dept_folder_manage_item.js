define([
	"i18n!nls/commons",    
	"hgn!admin/templates/approval/appr_dept_folder_manage_item"
], 
function(
    commonLang,
    Template
) {	
	
	var lang = {
		"수정" : commonLang["수정"],	
		"수정완료" : commonLang["수정완료"],	
		"취소" : commonLang["취소"]	
	};
	
	var View = Backbone.View.extend({
		
		tagName : "tr",
		
		initialize : function() {
			this.isEditMode = false;
		},
		
		
		events : {
			"click #edit" : "_edit",
			"click #cancel" : "_cancel",
			"click #save" : "_save"
		},
		
		
		render : function() {
			this.$el.html(Template({
				model : this.model.toJSON(),
				createdAt : GO.util.shortDate(this.model.get("createdAt")),
				isEditMode : this.isEditMode,
				lang : lang
			}));
			this.$el.attr("data-folderId", this.model.get("id"));
			
			return this;
		},
		
		/**
		 * 수정모드로 렌더링 
		 * @method _edit
		 */
		_edit : function() {
			this.isEditMode = true;
			this.render();
		},
		
		/**
		 * 일반모드로 렌더링 
		 * @method cancel
		 */
		_cancel : function() {
			this.isEditMode = false;
			this.render();
		},
		
		/**
		 * 저장 
		 * @method save
		 */
		_save : function() {
			var self = this;
			var folderName = this.$("#folderName").val();
			this.model.save({
				"folderName" : folderName
			}, {
				success : function() {
					self.isEditMode = false;
					self.render();
				}
			});
		}
	});
	
	return View;
});
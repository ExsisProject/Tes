define(["i18n!nls/commons","hgn!admin/templates/approval/appr_dept_folder_manage_item"],function(e,t){var n={"\uc218\uc815":e["\uc218\uc815"],"\uc218\uc815\uc644\ub8cc":e["\uc218\uc815\uc644\ub8cc"],"\ucde8\uc18c":e["\ucde8\uc18c"]},r=Backbone.View.extend({tagName:"tr",initialize:function(){this.isEditMode=!1},events:{"click #edit":"_edit","click #cancel":"_cancel","click #save":"_save"},render:function(){return this.$el.html(t({model:this.model.toJSON(),createdAt:GO.util.shortDate(this.model.get("createdAt")),isEditMode:this.isEditMode,lang:n})),this.$el.attr("data-folderId",this.model.get("id")),this},_edit:function(){this.isEditMode=!0,this.render()},_cancel:function(){this.isEditMode=!1,this.render()},_save:function(){var e=this,t=this.$("#folderName").val();this.model.save({folderName:t},{success:function(){e.isEditMode=!1,e.render()}})}});return r});
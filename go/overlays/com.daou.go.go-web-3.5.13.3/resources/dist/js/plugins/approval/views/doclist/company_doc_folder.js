define(["jquery","underscore","backbone","approval/views/apprform/appr_company_folder_tree","hgn!approval/templates/company_doc_folder","i18n!nls/commons","i18n!approval/nls/approval"],function(e,t,n,r,i,s,o){var u,a=n.Collection.extend({model:n.Model.extend(),url:function(){return"/api/approval/companyfolder/tree"},setFolderId:function(e){this.folderId=e}}),f=n.View.extend({el:".layer_doc_type_select .content",initialize:function(e){this.options=e||{},this.folderId=this.options.folderId},events:{},render:function(){var e=i({});this.$el.html(e),this.companyDocTreeView=new r({isAdmin:!1,treeElementId:"companyDocList",selectCallback:function(e){}}),this.companyDocTreeView.render()},release:function(){this.$el.off(),this.$el.empty()}});return f});
define(["jquery","underscore","backbone","app","approval/views/apprform/admin_company_folder_tree","hgn!approval/templates/document/doc_type_select","i18n!nls/commons","i18n!approval/nls/approval"],function(e,t,n,r,i,s,o,u){var a=n.View.extend({tag:"appr_setting",treeView:null,formListView:null,el:".layer_approval_line_state .content",initialize:function(){this.release()},events:{},doc_type_confirm:function(){var t=this.treeView.getSelectedNodeData().el.data(),n=t.type;if(n=="root")return e.goError(u["\ud574\ub2f9 \ud3f4\ub354\ub294 \uc120\ud0dd\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4"]),!1;var r=this.treeView.getFullPathName();return e("#docInfo_txt_form").text(r),e("#docInfo_txt_form").attr("data-docTypeId",t.id),!0},render:function(){var e={"\ud574\ub2f9 \ud3f4\ub354\ub294 \uc120\ud0dd\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4":u["\ud574\ub2f9 \ud3f4\ub354\ub294 \uc120\ud0dd\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4"]},t=s({isAdmin:!0,lang:e});this.$el.html(t),this.treeView=new i({isAdmin:!0,treeElementId:"doc_type_select_tree"}),this.treeView.render()},release:function(){this.$el.off(),this.$el.empty()}});return a});
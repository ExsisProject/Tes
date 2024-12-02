// 결재 양식 관리 > 양식 추가
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "approval/views/apprform/admin_company_folder_tree",
    "hgn!approval/templates/document/doc_type_select",
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	CompanyFolderTreeView,
	DocTypeSelectTpl,
    commonLang,
    approvalLang
) {
	var DocTypeSelectView = Backbone.View.extend({
		tag : "appr_setting",
        treeView: null,
        formListView: null,
		el : ".layer_approval_line_state .content",
		initialize: function() {
			this.release();
		},
		
		events: {
		},
		
		doc_type_confirm : function(){
			var objSelected =  this.treeView.getSelectedNodeData()['el'].data();
			var typeCheck  = objSelected.type;
			if(typeCheck == 'root'){
				$.goError(approvalLang['해당 폴더는 선택할 수 없습니다']);
				return false;
			}
			var fullPathName = this.treeView.getFullPathName();
			$('#docInfo_txt_form').text(fullPathName);
			$('#docInfo_txt_form').attr('data-docTypeId', objSelected.id);
			return true;
			
		},
		
    	render: function() {
    		var lang = {
        			"해당 폴더는 선택할 수 없습니다" : approvalLang['해당 폴더는 선택할 수 없습니다']
        		};
    		var tpl = DocTypeSelectTpl({
    			isAdmin : true,
    			lang : lang
    		});
    		this.$el.html(tpl);
			this.treeView = new CompanyFolderTreeView({
                isAdmin: true,
                treeElementId: 'doc_type_select_tree'
			});
			
			this.treeView.render();

		},

		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	
	return DocTypeSelectView;
});
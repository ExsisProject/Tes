// 결재 진행 사이드 > 문서 분류 선택
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "approval/views/apprform/appr_company_folder_tree",
    "hgn!approval/templates/document/doc_type_select",
    "hgn!approval/templates/document/add_docfolder",
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
	tplAddDocFolder,
    commonLang,
    approvalLang
) {
	var DocTypeSelectView = Backbone.View.extend({
		tag : "appr_setting",
        treeView: null,
        formListView: null,
		el : ".layer_doc_type_select .content",
		initialize: function(options) {
		    this.options = options || {};
			this.release();
		},
		
		events: {
		},
		
		doc_type_confirm : function(){

			var fullPathName = this.treeView.getFullPathName();
			
			var objSelected = this.treeView._getSelectedNodeData();
			if(objSelected.rel == 'root'){
				$.goMessage(approvalLang["해당 폴더는 선택할 수 없습니다"]);
				return false;
			}
			
			//$('#docInfo_txt_form').text(fullPathName);
			//$('#docInfo_txt_form').attr('data-docTypeId', objSelected.id);
			var data = { 'id' : '' , 'folderId' : objSelected.id ,'folderName' : fullPathName , 'modifiable' : true};
			if ( !data.folderId ) {
				$.goMessage(approvalLang["선택된 대상이 없습니다."]);
				return false;
			}
			var targetEl = $('#addFolder');
			if(!targetEl.find('li[data-folderId="'+data.folderId+'"]').length) { 
				targetEl.find('li.creat').before(tplAddDocFolder($.extend(data, { })));
				this.trigger('docReferenceSelect');
			} else {
				$.goMessage(approvalLang["이미 선택되었습니다."]);
			}
			return true;
			
		},
		
    	render: function() {
    		var lang = {
        			"해당 폴더는 선택할 수 없습니다" : approvalLang['해당 폴더는 선택할 수 없습니다']
    		};
    		var tpl = DocTypeSelectTpl({
    			lang : lang
    		});
    		this.$el.html(tpl);
			this.treeView = new CompanyFolderTreeView({
                isAdmin: false,
                treeElementId: 'doc_type_select_tree',
                apiCommonUrl : 'api/docfolder/sidetree'
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
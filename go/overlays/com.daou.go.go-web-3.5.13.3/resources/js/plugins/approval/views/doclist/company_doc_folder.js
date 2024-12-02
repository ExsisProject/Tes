define([
    "jquery",
    "underscore",
    "backbone",
    "approval/views/apprform/appr_company_folder_tree",
    "hgn!approval/templates/company_doc_folder",
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone,
	CompanyDocTreeTreeView,
	CompanyDocFolderTpl,
    commonLang,
    approvalLang
) {
	var docIds;
	
	var CompanyFolderTree = Backbone.Collection.extend({
		model : Backbone.Model.extend(),
		url : function(){
			// 문서 이동
//			return '/api/approval/companyfolder/' + this.folderId + '/documents';
			return '/api/approval/companyfolder/tree';
		},
		setFolderId: function(folderId){
			this.folderId = folderId;
		}
	});
	
	var CompanyDocFolderView = Backbone.View.extend({
		
		el : ".layer_doc_type_select .content",
		
		initialize: function(options) {
		    this.options = options || {};
			this.folderId = this.options.folderId;
		},
		events: {
		},
		render: function() {
			var tpl = CompanyDocFolderTpl({

			});

			this.$el.html(tpl);
			
			this.companyDocTreeView = new CompanyDocTreeTreeView({
                isAdmin: false,
                treeElementId: 'companyDocList',
                selectCallback :function(obj){ }
			});
			
			this.companyDocTreeView.render();
		},
		
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
		
	});
	
	return CompanyDocFolderView;
});
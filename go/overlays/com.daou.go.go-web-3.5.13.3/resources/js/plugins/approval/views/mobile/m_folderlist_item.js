// 문서목록에서 개별 문서에 대한 View
define([
    "jquery",
    "backbone",
    "app",
    "hgn!approval/templates/mobile/m_folderlist_item",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function(
	$, 
	Backbone, 
	GO,
	FolderListItemTpl,
    commonLang,
    approvalLang
) {
	var DocListItemView = Backbone.View.extend({
		initialize: function(options) {
		    this.options = options || {};
			_.bindAll(this, 'render');
		},
		tagName: 'li',
		events: {
            'vclick .tit' : 'moveDeptFolderDocList'
        },
		render: function() {
			var folder = {
					id: this.model.get('id'),
					deptName : this.model.get('deptName'),
					folderId : this.model.get('folderId'),
					folderName : this.model.get('folderName'),
					createdAt: this.model.getCreatedAt(),
					docCount: this.model.get('docCount')
				};
				this.$el.html(FolderListItemTpl({
					folder: folder,
					lang : approvalLang
				}));
				return this;
		},
		moveDeptFolderDocList: function() {
			// 부서 문서함일 경우 링크 금지
			if(this.type=='up_dept') { return false; }
			
			var folderId = this.model.get('folderId');
			var url = "/approval/deptfolder/" + folderId + "/documents";
			GO.router.navigate(url, true);
		}

	});
	
	return DocListItemView;
});
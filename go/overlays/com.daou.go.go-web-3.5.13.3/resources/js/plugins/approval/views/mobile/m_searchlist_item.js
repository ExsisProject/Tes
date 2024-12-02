// 문서목록에서 개별 문서에 대한 View
define([
    "jquery",
    "backbone",
    "app",
    "hgn!approval/templates/mobile/m_searchlist_item",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function(
	$, 
	Backbone, 
	GO,
    DocListItemTpl,
    commonLang,
    approvalLang
) {
	var DocListItemView = Backbone.View.extend({
		initialize: function(options) {
		    this.options = options || {};
			this.listType = this.options.listType;
			_.bindAll(this, 'render');
		},
		tagName: 'li',
		events: {
            'vclick .tit' : 'showUrl'
        },
		render: function() {
			this.model.setListType(this.listType);
			var doc = {
				id: this.model.get('id'),
				draftedAt: this.model.getDraftedAt(),
				formName: this.model.get('formName'),
				title: this.model.get('title'),
				drafterId: this.model.get('drafterId'),
				drafterName: this.model.get('drafterName'),
				docStatus: this.model.getDocStatusName(),
				isNew: this.model.get('isNew'),
				receiveStatusClass: this.model.getReceiveStatusClass(),
				receiveStatusName: this.model.getReceiveStatusName(),
				docTypeName: this.model.getDocType(),
				statusClass: this.model.getDocStatusClass(),
				drafterPositionName : this.model.get('drafterPositionName'),
				completedAt: this.model.getCompletedAt(),
				docNum: this.model.get('docNum'),
				showUrl: this.model.getShowUrl()
			};
			this.$el.html(DocListItemTpl({
				doc: doc,
				deptId: this.deptId,
				lang : approvalLang
			}));
			return this;
		},
		
		showUrl: function(e){
			var listUrl = GO.router.getUrl();
			var baseUrl = listUrl.substring(0,listUrl.indexOf("?"));
			sessionStorage.setItem('list-history-baseUrl',baseUrl);
			sessionStorage.setItem('list-history-pageNo',GO.router.getSearch().page ? GO.router.getSearch().page : 0 );
			var listType = this.listType;
			if (!listType) {
				listType = "approval";
			}
			var url = "/" + listType + "/document/" + this.model.get('id');
			GO.router.navigate(url, true);
		}

	});
	
	return DocListItemView;
});
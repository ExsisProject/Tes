// 문서목록에서 개별 문서에 대한 View
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "approval/models/doclist_item",
    "views/profile_card",
    "approval/views/document/apprflow",
    "approval/views/document_attach",
    "hgn!approval/templates/doclist_item",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function(
	$, 
	_, 
	Backbone, 
	GO,
	DocListItemModel,
	ProfileCardView,
	ApprovalFlowView,
	DocumentAttachFileView,
    DocListItemTpl,
    commonLang,
    approvalLang
) {
	var DocListView = Backbone.View.extend({
		tagName: 'tr',
		events: {
            'click span.ic_file_s' : 'showAttach', 
            'click span.read' : 'showApprFlow',
            'click span.notyet' : 'showApprFlow',
            'click span.finish' : 'showApprFlow',
            'click .writer': 'showUserProfile',
            'click td.subject a:not([class])' : 'showUrl'
        },
		initialize: function(options) {
		    this.options = options || {};
			_.bindAll(this, 'render', 'showApprFlow', 'showAttach', 'showUserProfile');
			this.columns = this.options.columns;
			this.deptId = this.options.deptId;
			this.listType = this.options.listType;
		},
		render: function() {
			
			var listType = this.listType;
			this.model.setListType(listType);
		
			var doc = {
				id: this.model.get('id'),
				draftedAt: this.model.getDraftedAt(),
				formName: this.model.get('formName'),
				title: this.model.get('title'),
				hasAttach: this.model.get('attachFileCount') > 0 ? true : false,
				attachCount: this.model.get('attachFileCount'),
				drafterId: this.model.get('drafterId'),
				drafterName: this.model.get('drafterName'),
				docStatus: this.model.getDocStatusName(),
				statusClass: this.model.getDocStatusClass(),
				completedAt: this.model.getCompletedAt(),
				docNum: this.model.get('docNum'),
				isReceive: this.model.get('docType') == 'RECEIVE'
			};
			this.$el.html(DocListItemTpl({
				doc: doc,
				columns: this.columns,
				deptId: this.deptId,
				lang : approvalLang
			}));
			return this;
		},
		// 첨부파일 팝업레이어
		showAttach: function(e) {
			e.stopPropagation();
			var documentAttachFileView = new DocumentAttachFileView({
				docId : this.model.get('id')
			});
			
			documentAttachFileView.render();
		},
		// 결재상태 팝업레이어
		showApprFlow: function(e) {
			e.stopPropagation();
			e.preventDefault();
			var approvalFlowView = new ApprovalFlowView({
				docId : this.model.get('id')
			});
			var popupEl = $.goPopup({
				'pclass' : 'layer_normal layer_approval_line_state',
				'header' : approvalLang['결재 진행 상황'],
				'modal' : true,
				'width' : "300px",
				'contents' :  approvalFlowView.render().$el.html(),
				'buttons' : [{
								'btext' : commonLang['확인'],
								'btype' : 'confirm',
								'callback' : function() {}
							}]
			});
			
			 popupEl.on('click', 'a[data-userid]', $.proxy(this.showUserProfileCard, this));
			
		},
		// 사용자프로필 팝업레이어
		showUserProfile: function(e) {
			e.stopPropagation();
			e.preventDefault();
			ProfileCardView.render(this.model.get('drafterId'), e.currentTarget);
		},
		showUserProfileCard : function(e) {
			ProfileCardView.render($(e.currentTarget).attr('data-userid'), e.currentTarget);
		},
		showUrl: function(e){
			sessionStorage.setItem('list-history-baseUrl',GO.router.getUrl());
			sessionStorage.setItem('list-history-doc-id', this.model.get('id'));
			var listType = this.listType;
			if (!listType) {
				listType = "approval";
			}
			var url = "/" + listType + "/document/" + this.model.get('id');
			GO.router.navigate(url, true);
			
		}
	});
	
	return DocListView;
});
// 문서목록에서 개별 문서에 대한 View
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "approval/models/loglist_item",
    "views/profile_card",
    "hgn!approval/templates/loglist_item",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function(
	$, 
	_, 
	Backbone, 
	GO,
	LogListItemModel,
	ProfileCardView,
    LogListItemTpl,
    commonLang,
    approvalLang
) {
	var LogListView = Backbone.View.extend({
		tagName: 'tr',
		events: {
            'click .writer': 'showUserProfile',
            'click .drafter': 'showDrafterUserProfile',
            'click .subject' : 'showUrl'
        },
		initialize: function(options) {
		    this.options = options || {};
			_.bindAll(this, 'render', 'showUserProfile');
			this.columns = this.options.columns;
		},
		render: function() {
			var log = {
				id: this.model.get('id'),
				accessAt: this.model.getAccessAt(),
				accessType: this.model.getAccessType(),
				accessUserId: this.model.get('accessUserId'),
				accessUserName: this.model.get('accessUserName'),
				accessUserPositionName: this.model.get('accessUserPositionName'),
				title: this.model.get('title'),
				docStatus: this.model.getDocStatusName(),
				drafterId: this.model.get('drafterId'),
				drafterName: this.model.get('drafterName'),
				formName: this.model.get('formName')
			};
			this.$el.html(LogListItemTpl({
				log: log,
				columns: this.columns,
				lang : approvalLang
			}));
			return this;
		},
		// 사용자프로필 팝업레이어
		showUserProfile: function(e) {
			e.stopPropagation();
			e.preventDefault();
			if (this.model.get('drafterId')) {
				ProfileCardView.render(this.model.get('drafterId'), e.currentTarget);
			}
		},
		showDrafterUserProfile: function(e) {
			e.stopPropagation();
			e.preventDefault();
			if (this.model.get('drafterId')) {
				ProfileCardView.render(this.model.get('drafterId'), e.currentTarget);
			}
		}
	});
	
	return LogListView;
});
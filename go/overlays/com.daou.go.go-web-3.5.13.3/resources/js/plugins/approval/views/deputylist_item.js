// 문서목록에서 개별 문서에 대한 View
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    
    "approval/views/content_top",
    "views/profile_card",
    "approval/models/deputy_item",
    
    "hgn!approval/templates/deputy_item",
    
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function(
	$, 
	_, 
	Backbone, 
	GO,
	
	ContentTopView,
	ProfileCardView,
	DocListItemModel,
    
	DocListItemTpl,
    
    commonLang,
    approvalLang
) {
	var DocListView = Backbone.View.extend({
		tagName: 'tr',
		events: {
            'click .people': 'showUserProfile',
            'click .absence_reason' : '_goDeputyDetail'
        },
		initialize: function(options) {
			_.bindAll(this, 'render');
			this.columns = options.columns;
		},
		render: function() {
			var doc = {
				id : this.model.getId(),
				startAt : this.model.getStartAt(),
				endAt : this.model.getEndAt(),
				title : this.model.getTitle(),
				deputyUserId : this.model.getDeputyUserId(),
				deputyUserName : this.model.getDeputyUserName(),
				deputyUserPosition : this.model.getDeputyUserPosition(),
				deputyUserDeptName : this.model.getDeputyUserDeptName(),
				absenceContent : this.model.getAbsenceContent(),
				useFlag : this.model.getUseFlag(),
				showUrl: this.model.getShowUrl()
			};
			this.$el.html(DocListItemTpl({
				doc: doc,
				columns: this.columns,
				lang : approvalLang
			}));
			return this;
		},
		showUserProfile : function(e){
			e.stopPropagation();
			e.preventDefault();
			ProfileCardView.render(this.model.getDeputyUserId(), e.currentTarget);
		},
		
		_goDeputyDetail : function(e){
			e.stopPropagation();
			e.preventDefault();
			var id = $(e.currentTarget).attr('data-id');
			GO.router.navigate('/approval/usersetting/deputy/modify/'+id, {trigger: true});
		}
	});
	
	return DocListView;
});
// 결재이력
define([
    // 필수
	"jquery",
	"underscore",
    "backbone",
    "app",
    "approval/models/appr_flow",
    "views/profile_card",
    "hgn!approval/templates/document/apprflow",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
],

function(
    $,
	_,
    Backbone,
    App,
    ApprFlowModel,
    ProfileCardView,
    ApprflowTbl,
    commonLang,
	approvalLang
) {

	var ApprFlowView = Backbone.View.extend({

		tagName: 'div',
		className: 'aside_wrapper_body',

		events: {
			"click a[data-userid]" : "showUserProfile"
		},

		initialize: function(options) {
		    this.options = options || {};
			this.release();
			this.docId = this.options.docId;
			this.masterChange = this.options.masterChange;
			this.isAdmin = false;
			
			if (_.isBoolean(this.options.isAdmin)) {
			    this.isAdmin = this.options.isAdmin;
			}
			
			if (!_.isObject(this.options.model)) {
				this.model = new ApprFlowModel({
					docId : this.docId,
					isAdmin : this.isAdmin,
					masterChange : this.masterChange
				});
				this.model.fetch({ async : false });
			}else{
				this.model = this.options.model;
			}
		},

    	render : function(){
			var isCurrent = function(){
				return this.status != "undefined" && this.status == "WAIT" && !this.postCheck;
			};

			var isActive = function(){
				return !!this.status;
			};

			var CompletedAt = function() {
				return GO.util.basicDate(this.completedAt);
			};
			_.each(this.model.get('activityGroups'), function(item, key) {
				_.each(item.activities, function(v, i){
				    // 코멘트 있는 경우
					if (!_.isUndefined(v.comment) && !_.isEmpty(v.comment)){
						v['comment'] = GO.util.escapeHtml(v.comment);
					}
					
					if(v.holdingActivity && v.holdingActivity.comment){
						v.holdingActivity.comment = GO.util.escapeHtml(v.holdingActivity.comment);
					}
					if(v.deputyActivity && v.deputyActivity.comment){
						v.deputyActivity.comment = GO.util.escapeHtml(v.deputyActivity.comment);
					}

				});
			});
			var tpl = ApprflowTbl({
			    dataset: this.model.get('activityGroups'),
			    isEmpty: this.model.hasNoActivities(),
				lang : { 'portrait' : approvalLang['초상화'], 'postCheck' : approvalLang['후열'], 'noApprline' : approvalLang['결재선 정보가 없습니다.'], '보류' : approvalLang['보류']  },
				isCurrent : isCurrent,
				isActive : isActive,
				formattedCompletedAt : CompletedAt,
				contextRoot: GO.contextRoot
			});
			this.$el.html(tpl);
			return this;
		},

		show: function() {
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        },

		makeApprFlow : function(dataset){
			dataset[0].activities[0]['isCurrent'] = true;
			dataset[0].activities[0]['isActive'] = true;
			var tpl = ApprflowTbl({
			    dataset: dataset,
			    isEmpty: false,
				lang : { 'portrait' : approvalLang['초상화'] },
				contextRoot: GO.contextRoot
			});
			this.$el.empty();
			this.$el.html(tpl);
		},
		
		getCurrentActivity : function() {
			return this.model.getCurrentActivity();
		},
		
		showUserProfile : function(e) {
			// TODO 그룹 합의일 경우 userid 가 없음. 별도 이벤트 처리를 진행할 것인지?
			if(!$(e.currentTarget).attr('data-userid')){
				return;
			}

			ProfileCardView.render($(e.currentTarget).attr('data-userid'), e.currentTarget);
		},

    	release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});

	return ApprFlowView;
});
// 결재이력
define([
    // 필수
	"jquery",
    "backbone",
    "app",
    "approval/models/activity",
    "approval/models/appr_flow",
    "hgn!approval/templates/mobile/document/m_apprflow",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
],

function(
    $,
    Backbone,
    App,
    ActivityModel,
    ApprFlowModel,
    ApprflowTbl,
    commonLang,
	approvalLang
) {

	var ApprFlowView = Backbone.View.extend({
		initialize : function(options){
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
            }
           
		},
    	render : function(){
			var isCurrent = function(){
				return (typeof this.status != 'undefined' && this.status == "WAIT" && !this.postCheck)? true : false;
			};

			var isActive = (this.status) ? true : false;
			_.each(this.model.get('activityGroups'), function(item, key) {
				_.each(item.activities, function(v, i){
				    // 코멘트 처리
					if(_.isUndefined(v.comment) || _.isEmpty(v.comment)){
						v['isNotEmptyComment'] = false;
					}else{
						v['isNotEmptyComment'] = true;
						v['comment'] = GO.util.escapeHtml(v.comment);
					}
					if(v.holdingActivity && v.holdingActivity.comment){
						v.holdingActivity.comment = GO.util.escapeHtml(v.holdingActivity.comment);
						if(_.isEmpty(v.holdingActivity.comment)){
							v['isNotEmptyHoldingComment'] = false;
						}else{
							v['isNotEmptyHoldingComment'] = true;
						}
					}else{
						v['isNotEmptyHoldingComment'] = false;
					}
					if(v.deputyActivity && v.deputyActivity.comment){
						v.deputyActivity.comment = GO.util.escapeHtml(v.deputyActivity.comment);
						if(_.isEmpty(v.deputyActivity.comment)){
							v['isNotEmptyDeputyComment'] = false;
						}else{
							v['isNotEmptyDeputyComment'] = true;
						}
					}else{
						v['isNotEmptyDeputyComment'] = false;
					}
				});
			});

			var tpl = ApprflowTbl({
			    dataset: this.model.get('activityGroups'),
				lang : { 'portrait' : approvalLang['초상화'], 'postCheck' : approvalLang['후열'], 'noApprline' : approvalLang['결재선 정보가 없습니다.'] , '보류' : approvalLang['보류']  },
				isCurrent : isCurrent,
				isActive : isActive,
				fCompletedAt : function(){
					 return GO.util.basicDate(this.completedAt);
				}
			});

			this.$el.html(tpl);
			return this;
		},

		makeApprFlow : function(dataset){
			var index = 0;
			var isCurrent = null;
			var tpl = ApprflowTbl({
			    dataset: dataset,
				lang : { 'portrait' : approvalLang['초상화'] },
				isCurrent : function(){
					if( index == 0 ){
						isCurrent = true;
					} else {
						isCurrent = false;
					}
					index++;
					return isCurrent;
				},
				isActive : false
			});
			this.$el.empty();
			this.$el.html(tpl);
		},
		
		getCurrentActivity : function() {
            return this.model.getCurrentActivity();
        },

    	release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});

	return ApprFlowView;
});
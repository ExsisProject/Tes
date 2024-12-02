(function() {
    define([
        "jquery",
        "backbone",
        "approval/models/activity_group",
        "approval/collections/activities",
        "app"
    ], 
    function(
        $,
        Backbone,
        ActivityGroupModel,
        ActivityCollection,
        App
    ) {

        /**
        *
        * 결재 라인을 구성하는 액티비티 그룹 (양식의 라인과, 결재 문서의 라인에서 공통으로 사용합니다. 
        *
        */
        var ApprActivityGroupModel = ActivityGroupModel.extend({
            
            defaults: {
                seq: 0,
                name: '',
                maxApprovalCount: 5,
                activities: null
            },
            
            initialize: function() {
                if (!_.isArray(this.get('activities'))) {
                    this.set('activities', []);
                }
            },

            validateAddPosition: function(activitySeq) {
            	if(this.collection) {
            		return this.collection.validateAddPosition(this.get('seq'), activitySeq);
            	}
                return true;
            },
            
            // 결재자를 추가 할 수 없는 activity 가 없는 그룹. 
            isNotAddableEmptyGroup : function() {
            	var lastDisabledActivity = this.collection.lastDisabledActivity();
            	if (!lastDisabledActivity) return false;
            	var groupSeqOfLastDisabledActivity = lastDisabledActivity.get("groupSeq");
            	
            	return !this.get("activities").length && this.get("seq") < groupSeqOfLastDisabledActivity;
            }
        });

        return ApprActivityGroupModel;
    });
}).call(this);
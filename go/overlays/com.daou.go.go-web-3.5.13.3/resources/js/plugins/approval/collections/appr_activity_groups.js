(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "approval/models/appr_activity_group",
        "approval/collections/activities",
    ], 
    function(
        $,
        Backbone,
        App,
        ApprActivityGroupModel,
        ActivityCollection
    ) {

        /**
        *
        * 결재 라인을 구성하는 ActivityGroup 컬렉션
        *
        */
        var ApprActivityGroupCollection = Backbone.Collection.extend({
            
            model: ApprActivityGroupModel,
            
            /**
             * 해당 위치의 Group의 Activity 위치에 새로운 액티비티가 추가 가능한지 여부를 검사한다.
             * @param groupSeq 추가하려는 그룹의 순서
             * @param activitySeq 추가하려는 액티비티의 순서 (없으면 마지막 순서로 임의 지정한다)
             */
            validateAddPosition: function(groupSeq, activitySeq) {
                var lastDisabledActivity = this.lastDisabledActivity();
                if (!lastDisabledActivity) {
                    return true;
                }
                
                var groupSeqOfLastDisabledActivity = lastDisabledActivity.get("groupSeq");

                if (groupSeq < groupSeqOfLastDisabledActivity) {
                    // 마지막 disabled 액티비티가 있는 그룹보다 앞 그룹에 추가하려는 경우
                    return false;
                } else if (groupSeq == groupSeqOfLastDisabledActivity) {
                	if(lastDisabledActivity.get('parallelAgreement')){
                		var agreementInfo = this.agreeActivityInfo(lastDisabledActivity.get("groupSeq"));
                		if(!agreementInfo.moveBeforMe && activitySeq <= lastDisabledActivity.get('seq')){
                    		return false;
                    	}else if(agreementInfo.moveBeforMe){
                    		return !(activitySeq <= lastDisabledActivity.get('seq') - agreementInfo.count);
    	                }
                    }
                    // 마지막 disabled 액티비티가 있는 그룹에 추가하려는 경우
                    if (activitySeq < lastDisabledActivity.get('seq')) {
                        return false;
                    }
                }
                
                return true;
            },
            
            lastDisabledActivity : function() {
            	// 전체 그룹에서 activity 를 뽑는다.
            	var allActivities = this.map(function(group) {
            		return _.map(group.get("activities"), function(activity) {
            			return _.extend(activity, {groupSeq : group.get("seq")});
            		});
            	});
            	
            	var allActivityCollection = new ActivityCollection(_.flatten(allActivities));
            	var disableCollection = allActivityCollection.filter(function(activity) {
                    return !activity.isDeletable() && !activity.isPreviousReturn();
                });

            	return _.last(disableCollection);
            },
            //예정자가 결재를 바꿀때 움직이려는 계정이 내 앞으로 갈수 있는지, 몇개까지 갈 수 있는지를 반환
            agreeActivityInfo : function(groupSeq) {
            	var allActivityCollection = new ActivityCollection(_.flatten(this.models[groupSeq].get("activities")),
            			{comparator:function(model) {return -model.get('seq')}});
            	
            	var isCompletedAgreeActivity = false;
            	var agreeActivityCount = 0;
            	
            	allActivityCollection.each(function(activity){
            		if(!activity.isDeletable()){
                 	   if(activity.attributes.status == "COMPLETE" && activity.attributes.parallelAgreement){
                 		  isCompletedAgreeActivity = true;
                 		  return;
                 	   }else if(activity.attributes.parallelAgreement){
                 		  agreeActivityCount = agreeActivityCount +1;
                 	   }
                    }
            	});
            	if(isCompletedAgreeActivity){
            		return {moveBeforMe : false};
            	}
            	return {moveBeforMe : true, count : agreeActivityCount};
            }
        });

        return ApprActivityGroupCollection;
        
    });
}).call(this);

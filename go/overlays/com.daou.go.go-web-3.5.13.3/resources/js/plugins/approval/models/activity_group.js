    define([
        "jquery",
        "backbone",
        "app",
        "approval/models/activity",
        "approval/collections/activities",

        "i18n!approval/nls/approval"
    ],
    function(
        $,
        Backbone,
        App,
        ActivityModel,
        ActivityCollection,

        approvalLang
    ) {

    	var ACTIVITY_TYPE_NAME = {
			"APPROVAL" : approvalLang['결재'],
	        "AGREEMENT" : approvalLang['합의'],
	        "CHECK" : approvalLang['확인'],
	        "INSPECTION" : approvalLang['감사']
    	};

        /**
        *
        * 결재 라인을 구성하는 액티비티 그룹 (양식의 라인과, 결재 문서의 라인에서 공통으로 사용합니다.
        *
        */
        return Backbone.Model.extend({

            defaults: {
                seq: 0,
                name: '',
                maxApprovalCount: 5,
                activities: null,
                useApproval: true
            },

            initialize: function() {
                if (!_.isArray(this.get('activities'))) {
                    this.set('activities', []);
                }
            },

            addActivity: function(activityData, index) {
                var acol = new ActivityCollection(this.get('activities'));
                var am = new ActivityModel(activityData);

                // 나의 결재선에서 추가될 경우 name이 비어있는 현상 수정
                if(!am.get('name')) {
                	am.set('name', ACTIVITY_TYPE_NAME[am.get('type').toUpperCase()], {silent: true});
                }

                if (acol.isExistActivity(am)) {
                    return false;
                }

                if (_.isNumber(index)) {
                    acol.add(am.clone(), {
                        at: index,
                        merge: true
                    });
                } else {
                    acol.add(am.clone());
                }

                this.set('activities', acol.toJSON());
            },

            isExceedMaxApprovalCount: function() {
                var acol = new ActivityCollection(this.get('activities'));
                return (acol.getApprovalAndDraftActivities().length > this.get('maxApprovalCount'));
            },

            isFullMaxApprovalCount: function() {
                var acol = new ActivityCollection(this.get('activities'));
                return (acol.getApprovalAndDraftActivities().length >= this.get('maxApprovalCount'));
            },

            isFullMaxApprovalAndAgreementCount: function() {
                var acol = new ActivityCollection(this.get('activities'));
                return (acol.getApprovalAndAgreementAndDraftActivities().length >= this.get('maxApprovalCount'));
            },

            getMaxApprovalCount : function(){
                return this.get('maxApprovalCount');
            },

            /**
             * 자신을 포함한 형제 그룹에서, 동일한 액티비티 데이터가 있는지 검사한다.
             */
            isExistActivity: function(activityData) {
                var am = new ActivityModel(activityData);
                var acol = new ActivityCollection(this.get('activities'));
                return acol.isExistActivity(am);
            },

            setActivityType: function(userId, deptId, type, typeName) {
                var acol = this.getActivityCollection();
            	var activityModel = acol.getByUserIdAndDeptId(userId, deptId);
                activityModel.setType(type, typeName);
                this.set('activities', acol.toJSON());
            },

            setArbitrarilyDecidable: function(userId, deptId, arbitrary) {
            	var acol = this.getActivityCollection();
            	var activityModel = acol.getByUserIdAndDeptId(userId, deptId);
        		activityModel.setArbitrarilyDecidable(arbitrary);
        		this.set('activities', acol.toJSON());
            },

            getActivityCollection: function() {
                return new ActivityCollection(this.get('activities'));
            },

            getApprovalAndDraftActivities: function() {
                var acol = new ActivityCollection(this.get('activities'));
                return acol.getApprovalAndDraftActivities();
            },

            getApprovalAndAgreementAndDraftActivities: function() {
                var acol = new ActivityCollection(this.get('activities'));
                return acol.getApprovalAndAgreementAndDraftActivities();
            },

            canUseApproval : function(actionCheck){ //아직 actionCheck를 사용하지 않지만 훗날 사용하게 될 가능성이 많으므로 일단 받아둔다..
            	return this.get('useApproval');
            },

            canUseAgreement : function(actionCheck){
            	if(actionCheck['useAgreement']){
            		return this.get('useAgreement');
            	}else{
            		return false;
            	}
            },

            canUseCheck : function(actionCheck){
            	if(actionCheck['useCheckActivity']){
            		return this.get('useCheck');
            	}else{
            		return false;
            	}
            },

            canUseInspection : function(actionCheck){
            	if(actionCheck['useInspectionActivity']){
            		return this.get('useInspection');
            	}else{
            		return false;
            	}
            },

            isAllApprovalTypeBlock : function(actionCheck){ //결재, 합의, 확인, 감사가 전부 불가능
            	return !this.canUseApproval(actionCheck) && !this.canUseAgreement(actionCheck) && !this.canUseCheck(actionCheck) && !this.canUseInspection(actionCheck)

            },

            getAvailableApprovalType : function(actionCheck){
            	var availableTypes = [];
            	if(this.canUseApproval(actionCheck)) availableTypes.push({type : 'APPROVAL', name : ACTIVITY_TYPE_NAME['APPROVAL']});
            	if(this.canUseAgreement(actionCheck)) availableTypes.push({type : 'AGREEMENT', name : ACTIVITY_TYPE_NAME['AGREEMENT']});
            	if(this.canUseCheck(actionCheck)) availableTypes.push({type : 'CHECK', name : ACTIVITY_TYPE_NAME['CHECK']});
            	if(this.canUseInspection(actionCheck)) availableTypes.push({type : 'INSPECTION', name : ACTIVITY_TYPE_NAME['INSPECTION']});
            	return availableTypes;
            },

            onlyCanAgreement : function(actionCheck){
            	var availableApprovalType = this.getAvailableApprovalType(actionCheck);
            	return (availableApprovalType.length == 1 && _.first(availableApprovalType)['type'] == 'AGREEMENT');
            },

            agreementAllowTypeValidate : function(agreementAllowType, isDept){
         	   return (agreementAllowType == 'USER' && !isDept) || (agreementAllowType == 'DEPARTMENT' && isDept) || (agreementAllowType == 'ALL');
            },

            getValidApprovalType : function(actionCheck, activityData){
            	var availableTypes = this.getAvailableApprovalType(actionCheck);
            	if(activityData['isDept']){
            		return _.findWhere(availableTypes, {type : 'AGREEMENT'}); //없으면 undefined 날라감. 부서는 합의만 가능하므로 합의를 사용하지 못하는 결재그룹에서는 사용가능한 결재타입이 없다.
            	}else{ //유저일 경우 추가하고자는 결재그룹에서 현재  activity의 결재타입이 사용가능할 경우는 결재타입 그대로 셋팅하고 없는 경우는 avalitype에서 첫번째 것을 셋팅한다.
            		return _.findWhere(availableTypes, {type : activityData['type']}) || _.first(availableTypes); //없으면 undefined날라감.
            	}
            },

            removeActivityByUserIdAndDeptId: function(userId, deptId) {
                var acol = new ActivityCollection(this.get('activities'));
                acol.removeByUserIdAndDeptId(userId, deptId);
                this.set('activities', acol.toJSON());
            },

            sortActivitiesByUserIdAndDeptId: function(keys) {
                var acol = new ActivityCollection(this.get('activities')),
                    sorted = new ActivityCollection();

                _.each(keys, function(key) {
                    var copiedKey = {
                        userId: key.userId,
                        deptId: key.deptId
                    };

                    if (copiedKey.userId == '') { copiedKey.userId = null; }
                    if (copiedKey.deptId == '') { copiedKey.deptId = null; }

                    var model = new ActivityModel(copiedKey);
                    acol.each(function(m) {
                        if (m.equals(model)) {
                            sorted.add(m);
                        }
                    });
                });

                this.set('activities', sorted.toJSON());
            }
        });
    });
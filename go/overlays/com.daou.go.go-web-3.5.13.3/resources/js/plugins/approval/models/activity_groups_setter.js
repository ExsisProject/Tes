define([
    'backbone',
    "approval/models/appr_activity_group",
    "approval/collections/appr_activity_groups",
    "approval/collections/activities",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
], function(
    Backbone,
    ApprActivityGroupModel,
    ApprActivityGroupCollection,
    ActivityCollection,
    commonLang,
    approvalLang
) {
    var lang = {
        'header' : approvalLang['결재 정보'],
        'save_as_my_line' : approvalLang['개인 결재선으로 저장'],
        'delete_as_my_line' : approvalLang['개인 결재선 삭제'],
        'my_line_name' : approvalLang['결재선 이름'],
        'normal' : approvalLang['일반'],
        'my_lines' : approvalLang['나의결재선'],
        'draft' : approvalLang['기안'],
        'name' : commonLang['이름'],
        'dept' : approvalLang['부서'],
        'line' : approvalLang['라인'],
        'status' : approvalLang['상태'],
        'approval' : approvalLang['결재'],
        'agreement' : approvalLang['합의'],
        'check' : approvalLang['확인'],
        'agreement_type' : approvalLang['합의방식'],
        'agreement_linear' : approvalLang['순차합의'],
        'agreement_parallel' : approvalLang['병렬합의'],
        'activityType' : approvalLang['타입'],
        'add' : commonLang['추가'],
        'delete' : commonLang['삭제'],
        'confirm' : commonLang['확인'],
        'cancel' : commonLang['취소'],
        'add_activity' : approvalLang['드래그하여 결재선을 추가할 수 있습니다.'],
        'msg_duplicate_activity' : approvalLang['중복된 대상입니다.'],
        'msg_max_approval_count_exceed' : approvalLang['결재자 수가 최대 결재자 수를 넘을 수 없습니다.'],
        'msg_not_selected' : approvalLang['선택된 대상이 없습니다.'],
        'msg_not_deletable_status_activity' : approvalLang['삭제할 수 없는 상태의 결재자 입니다.'],
        'msg_not_deletable_assigned_activity' : approvalLang['지정 결재자는 삭제할 수 없습니다.'],
        'msg_save_success' : commonLang['저장되었습니다.'],
        'msg_not_addable_position' : approvalLang['완료된 결재 앞에 결재자를 추가할 수 없습니다.'],
        'msg_duplicated_my_line_title' : approvalLang['중복된 이름을 사용할 수 없습니다.'],
        'msg_my_line_set_error_maxCount' : approvalLang['결재자를 최대치보다 넘게 할당할 수 없습니다.'],
        'msg_my_line_set_error_assigned_deleted' : approvalLang['나의 결재선 적용 불가 메세지'],
        'msg_my_line_set_error_not_matching_group_count' : approvalLang['결재선의 갯수가 일치하지 않습니다.'],
        'msg_parallel_agreement_should_has_2_more_agreement' : approvalLang['병렬합의는 연속된 둘 이상의 합의가 필요합니다.'],
        'msg_not_belong_to_department_user' : approvalLang['부서가 없는 사용자는 추가할 수 없습니다.'],
        'notAddable' : approvalLang["이 결재칸에는 결재자를 추가할 수 없습니다"],
        "not_allowed_apprline" : approvalLang['선택한 대상은 이 결재그룹에 사용할 수 없습니다']
    };

    var ActivityGroupsSetter = Backbone.Model.extend({

        originGroups: null,
        assignedActivityDeletable: false,

        initialize: function(attrs, options) {
            options = options || {};

            if (_.isBoolean(options.assignedActivityDeletable)) {
                this.assignedActivityDeletable = options.assignedActivityDeletable;
            }
            if (_.isArray(options.original)) {
                this.originGroups = new ApprActivityGroupCollection(options.original);
            }
            if (_.isNull(this.originGroups)) {
                this.throwError('No "original" was set - required.');
            }

            if (_.isBoolean(options.includeAgreement)) {
                this.includeAgreement = options.includeAgreement;
            }

            this.apprAllowType = options.apprAllowType;

            this.actionCheck = options.actionCheck;
        },

        /**
         * 기존 데이터에 새로운 데이터를 덮어쓴 결과를 반환한다.
         *
         * @param input
         * @returns
         */
        makeData: function(input) {
            var newGroups = new ApprActivityGroupCollection(input);
            if (!this._validateGroupCountMatching(newGroups)) {
                this.throwError(lang['msg_my_line_set_error_not_matching_group_count']);
            }

            this.originGroups.each(function(oldGroup, index) {
                var newGroup = newGroups.at(index);
                if (!this._preValidateForGroupMerge(oldGroup, newGroup)) {
                    this.throwError(lang['msg_my_line_set_error_maxCount']);
                }
                if (!this._preValidateActivityForGroupMerge(oldGroup, newGroup)) {
                    this.throwError(lang['not_allowed_apprline']);
                }

                var resultGroup = this._mergeNewGroupToOldGroup(oldGroup, newGroup);
                if (!this._postValidateForGroupMerge(oldGroup, resultGroup)) {
                    this.throwError(lang['msg_my_line_set_error_assigned_deleted']);
                }

                oldGroup.set('activities', resultGroup.get('activities'));
            }, this);

            return this.originGroups.toJSON();
        },

        /**
         * 내 결재선의 그룹 갯수가 현재 결재선의 그룹 갯수보다 많거나 적은지 검사한다.
         *
         * @param newGroups
         * @returns {Boolean}
         */
        _validateGroupCountMatching: function(newGroups) {
            return this.originGroups.length == newGroups.length;
        },

        /**
         * 새로 할당하려는 액티비티 갯수가 대상 그룹의 최대 결재자수를 넘을 수 없다.
         *
         * @returns {Boolean}
         */
        _preValidateForGroupMerge: function(oldGroup, newGroup) {

            // 최대 허용 결재자 수 검사 (결재만 검사)
            if(newGroup.getApprovalAndDraftActivities().length > oldGroup.get('maxApprovalCount')){
                return false;
            }

            //결재선에 결재와 합의 같의 표시가 true일때(admin에서 지정 가능) 합의까지 counting하여 check
            if (this.includeAgreement && newGroup.getApprovalAndAgreementAndDraftActivities().length > oldGroup.get('maxApprovalCount')) {
                return false;
            }

            return true;
        },

        /**
         * 새로 할당하려는 액티비티의 타입이 현재 쓰이지 않을경우 할당할 수 없다.
         *
         * @returns {Boolean}
         */
        _preValidateActivityForGroupMerge: function(oldGroup, newGroup) {
            var valid = true;
            var newGroupActivities = new ActivityCollection(newGroup.get('activities'));
            var availTypes = oldGroup.getAvailableApprovalType(this.actionCheck);
            if(_.isUndefined(availTypes)){
                valid = false;
                return valid;
            }

            newGroupActivities.each(function(m){
                var isDept = m.get('userId') == null;
                if(!_.contains(_.pluck(availTypes, 'type'), m.get('type'))){
                    valid = false;
                }else if(this.apprAllowType == 'USER' && isDept){
                    valid = false;
                }
                if(m.get('type') == 'AGREEMENT'){ //합의일 경우에만 체크하는 로직. GO-17782
                    if(!oldGroup.agreementAllowTypeValidate(this.actionCheck['agreementAllowType'], isDept)){
                        valid = false;
                    }
                }
            }, this);

            return valid;
        },

        /**
         * 기존 결재 그룹에 새로운 그룹의 액티비티들을 할당한다.
         *
         * @param oldGroup
         * @param newGroup
         */
        _mergeNewGroupToOldGroup: function(oldGroup, newGroup) {
            var resultGroup = new ApprActivityGroupModel();
            var newGroupActivities = new ActivityCollection(newGroup.get('activities'));
            var oldGroupActivities = new ActivityCollection(oldGroup.get('activities'));
            var oldAssignedActivities = oldGroupActivities.selectOnlyAssigned();

            resultGroup.set('activities', []);
            oldGroupActivities.each(function(m) {
                if (m.isDraft()) {
                    resultGroup.addActivity(m.clone().toJSON());
                }
            });

            newGroupActivities.each(function(newActivity) {
                var resultActivity = newActivity.clone().toJSON();
                if (oldAssignedActivities.isExistActivity(newActivity)) {
                    resultActivity['assigned'] = true;
                }
                resultGroup.addActivity(resultActivity);
            });

            return resultGroup;
        },

        /**
         * 지정 결재자를 지울 수 있는 권한이 없는 경우, 새로 할당한 액티비티에 의해 기존의 지정 결재자가 삭제되었는지 확인한다.
         *
         * @param oldGroup
         * @param resultGroup
         * @returns {Boolean}
         */
        _postValidateForGroupMerge: function(oldGroup, resultGroup) {
            if (this.assignedActivityDeletable) {
                return true;
            }

            var isValidate = true,
                oldGroupActivities = new ActivityCollection(oldGroup.get('activities')),
                resultGroupActivities = new ActivityCollection(resultGroup.get('activities')),
                oldAssignedActivities = oldGroupActivities.selectOnlyAssigned();

            oldAssignedActivities.each(function(m) {
                if (!resultGroupActivities.isExistActivity(m)) {
                    isValidate = false;
                }
            });

            return isValidate;
        },

        throwError: function(message) {
            var ActivityGroupsSetterException = function (message) {
                this.name = "ActivityGroupsSetter";
                this.message = message;
            };

            throw new ActivityGroupsSetterException(message);
        }
    });
    return ActivityGroupsSetter;
});
define("approval/components/apprflow_editor/views/apprline/activity_groups", [
    "backbone",
    "app",
    
    "approval/components/apprflow_editor/views/apprline/activity_group", 
    	
    "approval/models/activity",
    "approval/models/appr_activity_group",
    "approval/models/appr_line",
    
    "approval/collections/appr_activity_groups",
    "approval/collections/activities",
    "approval/collections/appr_flows",
    
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    
    "jquery.go-sdk",
    "jquery.jstree",
    "jquery.go-popup",
    "jquery.go-grid",
    "jquery.go-validation"
],

function(
    Backbone,
    App,
    
    ActivityGroupView, 
    
    ActivityModel,
    ApprActivityGroupModel,
    ApprLineModel,
    
    ApprActivityGroupCollection,
    ActivityCollection,
    ApprFlowCollection,
    
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


    /**
     *
     * 내 결재선으로부터 결재선 정보를 세팅한다.
     *
     */
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


    /**
     * 결재선 목록 뷰
     * 
     * model: ApprDocumentModel
     */
    var ActivityGroupsView = Backbone.View.extend({

        observer: null,
        activityGroups: null,
        actionCheck: null,
        groupViewList: null,
        isArbitraryCheckVisible: false,
        __activated__: false,
        __disabled__: false, 
		useParallelAgreement:false,
		
        initialize: function(options) {
        	options = options || {};
        	
            this.observer = options.observer;
            this.__activated__ = false;
            this.__disabled__ = false;
            
            if(options.disable) {
            	this.disable();
            }
            
            // 기존호환성 유지 코드
            this.activityGroups = this.getActivityGroups();
            
            this.actionCheck = this.model.get('actionCheck');
            this.includeAgreement = this.model.get('docInfo').includeAgreement;
            this.isArbitraryCheckVisible = this.model.getActionCheck('isArbitraryCheckVisible');
		    this.isPermissibleArbitraryDecision = this.model.getActionCheck('isPermissibleArbitraryDecision');
			this.apprAllowType = 'ALL' //@TODO 2.0.2에서 이 값을 서버에서 데이터를 받을수 있도록한다. 'ALL' 모든 부서 선택가능. 'USER' 유저만 선택가능.
            listenEvents.call(this);
        },
        
        getActivityGroups : function(){
    		return new ApprActivityGroupCollection(this.model.apprFlowModel.get('activityGroups'));
        	if(this.model.get('useAutoApprFlow')){ //자동결재를 사용할경우
        		var flows = new ApprFlowCollection(this.model.autoApprFlowModel.get('autoApprFlows'));
        		var flow = flows.at(0);
        		
        		return new ApprActivityGroupCollection(flow.get('activityGroups'));
        	}else{
        		return new ApprActivityGroupCollection(this.model.apprFlowModel.get('activityGroups'));        		
        	}
        },
        
        isReceiveDoc : function(){
     	   var docData = this.model.get('document');
     	   return docData['apprStatus'] == 'TEMPSAVE' && docData['docStatus'] == 'RECEIVED' && docData['docType'] == 'RECEIVE';
        },
        /**
         * 렌더링..
         *
         * @returns
         */
        render: function() {
        	this.activate();
        	
            this.$el.empty();
            this.groupViewList = [];
            this.activityGroups.each(function(activityGroupModel, index) {
                var itemView = new ActivityGroupView({
                    model: activityGroupModel,
                    observer: this.observer,
                    actionCheck: this.actionCheck,
                    isArbitraryCheckVisible: this.isArbitraryCheckVisible,
                    isPermissibleArbitraryDecision: this.isPermissibleArbitraryDecision,
                    index: index, 
                    disable: this.isDisabled(),
                    includeAgreement : this.includeAgreement,
                    apprAllowType : this.apprAllowType,
                    isReceiveDoc : this.isReceiveDoc()
                });

                itemView.render();
                /**
                 * 결재그룹이 다른 경우 Sortable이 일어났을때 sortable을 할수 있는지 validation을 먼저 체크하고
                 * item을 drag(fromGroupView)가 발생한 view에서는 remove 이벤트가,
                 * drop(toGroupView)이 발생한 View에서는 add 이벤트를 발생시킨다.
                 * 그리고 나서 sortable의 stop이벤트에 return false를 주어서 기본 sortable동작을 cancel시킨다.
                 * 그렇기 떄문에 이벤트 명은 move가 들어가는게 좀더 의미상 맞는거 같다.
                 */
                itemView.on('moveActivityToOtherGroup', function(data){
                	var fromGroupView = this.groupViewList[data.fromGroupIndex];
                	var toGroupView = this.groupViewList[data.toGroupIndex];
                	var isValidFrom = fromGroupView.checkRemovableActivity(data.am);
                	var toAddModelClone = data.am.clone();
                	toAddModelClone.set('isDept', toAddModelClone.isDept());
                	var toAddType = toGroupView.model.getValidApprovalType(this.actionCheck, toAddModelClone.toJSON());
                	if(!_.isUndefined(toAddType)){
                		toAddModelClone.set({'type' : toAddType.type, 'name' : toAddType.name});
                	}
                	var isValidTo = toGroupView.checkAddableActivity(toAddModelClone.toJSON(), data.targetIndex);
                	if(isValidFrom && isValidTo){
                		toGroupView.model.addActivity(toAddModelClone.toJSON(), data.targetIndex);
                        fromGroupView.model.removeActivityByUserIdAndDeptId(data.userId, data.deptId);
                	}
                	fromGroupView.render();                		
                	toGroupView.render();
                }, this);
                this.groupViewList.push(itemView);
                this.$el.append(itemView.$el);
            }, this);

            this._makeEmptyGroupToSpareSpace();
            this._resizeEmptyGroupView();
            $(':input:radio[name=useParallelAgreement]').filter('input[value='+this.useParallelAgreement.toString()+']').attr('checked', 'checked');

            this.observer.trigger('activateDNDDroppable');
            return this.$el;
        },
        
        activate: function() {
        	this.__activated__ = true;
        }, 
        
        deactivate: function() {
        	this.__activated__ = false;
        }, 
        
        isActivated: function() {
        	return this.__activated__;
        }, 

        _makeEmptyGroupToSpareSpace: function() {
            this.emptyGroupView = new ActivityGroupView({
                model: null
            });

            this.emptyGroupView.render();
            this.$el.append(this.emptyGroupView.el);
        },

        _resizeEmptyGroupView: function() {
        	resizeEmptyGroupView.call(this);
        },

        /**
         * 액티비티 그룹 컬렉션을 JSON 형태로 반환한다.
         *
         * @returns
         */
        getCollectionJSON: function() {
            return this.activityGroups.toJSON();
        },

        /**
         * 액티비티 그룹 목록을 '기안'을 제외하고 반환한다. (복사본 배열)
         *
         * @returns {Array}
         */
        getActivityGroupsWithoutDraftActivity: function() {
            var activityGroups = [];
            this.activityGroups.each(function(model) {
                var cloned = model.clone(),
                    acol = new ActivityCollection(cloned.get('activities'));
                acol.removeDraftActivity();
                cloned.set('activities', acol.toJSON());
                activityGroups.push(cloned.toJSON());
            });

            return activityGroups;
        },

        /**
         * 각 액티비티 그룹에서 최대 결재자 수가 넘지 않았는지 검증한다.
         *
         * @returns {Boolean} 정상여부
         */
        validateMaxApprovalCount: function() {
            var isMaxApprovalCountExceed = false;
            this.activityGroups.each(function(model) {
                if (model.isExceedMaxApprovalCount()) {
                    isMaxApprovalCountExceed = true;
                }
            });

            return !isMaxApprovalCountExceed;
        },

        /**
         * 어느 한 그룹이라도 연속된 합의 액티비티를 가지고 있는지 여부를 검증한다.
         *
         * @returns {Boolean} 연속된 합의 액티비티 소유 여부
         */
        hasSerialParallelAgreement: function() {
            var isValid = false;

            this.activityGroups.each(function(model) {
                var activities = new ActivityCollection(model.get('activities')),
                    isBeforeAgreement = false;

                activities.each(function(a) {
                    if (a.isAgreement()) {
                        if (isBeforeAgreement) {
                            isValid = true;
                        } else {
                            isBeforeAgreement = true;
                        }
                    } else {
                        isBeforeAgreement = false;
                    }
                });
            });

            return isValid;
        },

        /**
         * 현재 마우스의 위치에 놓인 액티비티에.. 드래그 가능하다는 라인을 표시한다.
         *
         * @param opts.groupSeq 추가할 그룹의 순서
         * @param activitySeq 추가할 그룹내 액티비티 순서
         */
        drawDNDLine: function() {
            var groupSeq = arguments[0],
                activitySeq = arguments[1];
            
            if(!this.isActivated()) {
        		return;
        	}

            if ( groupSeq == 'last' && activitySeq == 'last' ) {
                var groupView = _.last(this.groupViewList);
                groupView.drawDragDropLineCss('last');
                return true;

            } else {
                if (!this.activityGroups.validateAddPosition(groupSeq, activitySeq)) {
                    return false;
                }

                this.clearAllGroupsDragDropLineCss();
                var groupView = this.groupViewList[groupSeq];
                groupView.drawDragDropLineCss(activitySeq - 1);
                return true;
            }
        },

        /**
         * 주어진 그룹의 액티비티 다음에 새로운 액티비티를 추가한다.
         *
         * @param opts.groupSeq 추가할 그룹의 순서
         * @param opts.targetSeq 추가할 그룹내 액티비티 순서
         * @param opts.activityData 새로운 액티비티 데이터 (go-orgtab 조직도가 반환하는 데이터)
         */
        addActivityByDND: function() {
            var groupSeq = arguments[0],
                targetSeq = arguments[1],
                activityData = arguments[2];

            if(!this.isActivated()) {
        		return;
        	}
            
            this.clearAllGroupsDragDropLineCss();
            if ( groupSeq == 'last' && targetSeq == 'last') {
                var groupView = _.last(this.groupViewList);
                groupView.addActivity(activityData, 'last');
            } else {

                if (this.activityGroups.validateAddPosition(groupSeq, targetSeq)) {
                    var groupView = this.groupViewList[groupSeq];
                    groupView.addActivity(activityData, targetSeq);
                }
            }
        },

        /**
        * 모든 그룹의 액티비티에 그려진 DND 라인을 모두 제거한다.
        *
        */
        clearAllGroupsDragDropLineCss: function() {
        	if(!this.isActivated()) {
        		return;
        	}
        	
            _.each(this.groupViewList, function(groupView) {
                groupView.clearDragDropLineCss();
            });
        },

        /**
         * 주어진 ActivityGroups로 현재 결재선 ActivityGroups를 대체한다.
         *
         * @param activityGroups
         */
        replaceActivityGroupsByMyLine: function(activityGroups, useParallelAgreement) {
        	
        	if(!this.isActivated()) {
        		return;
        	}
        	
            var setter = new ActivityGroupsSetter(null, {
                assignedActivityDeletable: this.actionCheck.assignedActivityDeletable,
                actionCheck : this.actionCheck,
                original: this.activityGroups.toJSON(),
                includeAgreement : this.includeAgreement,
                apprAllowType : this.apprAllowType
            });

            try {
                var result = setter.makeData(activityGroups);
                this.model.apprFlowModel.set('activityGroups', result);
                this.model.apprFlowModel.set('useParallelAgreement', useParallelAgreement);
                //this.model.set('apprFlowChanged', true);
                
                this.activityGroups.reset(result);
                this.useParallelAgreement = useParallelAgreement;
                this.render();
            } catch (e) {
                $.goMessage(e.message);
                this.observer.trigger('deselectMyLine');
                
            }
        }, 
        
        disable: function() {
        	this.__disabled__ = true;
        }, 
        
        isDisabled: function() {
        	return this.__disabled__;
        },
        
        _allActivityDelete: function(){
        	_.each(this.groupViewList, function(groupView, index) {
        		var $elActivities = groupView.$(".appr-activity-table").find("tr:not(.inactive)");
        		_.each($elActivities, function(elActivity){
        			var userIdObj = $(elActivity)[0].attributes["data-userid"];
        			var deptIdObj = $(elActivity)[0].attributes["data-deptid"];
        			var userId = $(userIdObj)[0].value
        			,deptId = $(deptIdObj)[0].value;
        			if(userId != undefined && deptId != undefined){
        				groupView._removeEachActivityGroup(userId, deptId);
        			}
        		});
            });
        }
    });
    
    // private methods..
    function listenEvents() {
        this.listenTo(this.observer, 'myLineSelected', this.replaceActivityGroupsByMyLine);
        this.listenTo(this.observer, 'dropCheck', this.drawDNDLine);
        this.listenTo(this.observer, 'dropFinish', this.addActivityByDND);
        this.listenTo(this.observer, 'dropOut', this.clearAllGroupsDragDropLineCss);
        this.listenTo(this.observer, 'resize', this._resizeEmptyGroupView);

        this.listenTo(this.activityGroups, 'change add remove', function(activityGroup) {
        	this.model.apprFlowModel.set('activityGroups', this.activityGroups.toJSON());
        	this.model.set('apprFlowChanged', true);
        	// 우선 임시로 apprline으로 고정해서 트리거링 한다.
        	this.observer.trigger('changedTabItem', 'apprline');
        });
    }
    
    function resizeEmptyGroupView() {
    	var self = this;
    	
    	// 아직 엘리먼트가 DOM트리에 붙지 않았을 경우 높이 계산이 되지 않는다.
    	// DOM 트리에 붙었는지 확인 후 높이 계산을 수행한다.
    	setTimeout(function() {
    		if(self.$el.parents('body').length > 0) {
        		var totalHeight = parseInt(self.$el.css('height'));
                var totalGroupsHeight = 0;
                var emptySpaceHeight = 0;
                var marginToAvoidScroll = 0; // 스크롤이 생기지 않도록, 충분한 공간을 두도록 한다.

                _.each(self.groupViewList, function(view) {
                    totalGroupsHeight += parseInt(view.$el.outerHeight());
                });

                emptySpaceHeight = totalHeight - totalGroupsHeight;
                if (emptySpaceHeight < marginToAvoidScroll) {
                    return;
                }

                self.emptyGroupView.$el.css({
                    'height': (emptySpaceHeight - marginToAvoidScroll)
                });
        	} else {
        		resizeEmptyGroupView.call(self);
        	}
    	}, 100);
    }

    return ActivityGroupsView;

});
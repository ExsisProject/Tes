(function() {

    define([
        "jquery",
        "backbone",
        "app",
        
        "approval/models/activity",
        "approval/models/appr_activity_group",
        "approval/models/appr_line",
        
        "approval/collections/appr_activity_groups",
        "approval/collections/activities",
        "hgn!approval/templates/document/apprflow_activity_group",
        
        "i18n!nls/commons",
        "i18n!approval/nls/approval",
        
        "jquery.go-sdk",
        "jquery.jstree",
        "jquery.go-popup",
        "jquery.go-grid",
        "jquery.go-validation"
    ],

    function(
        $,
        Backbone,
        App,
        
        ActivityModel,
        ApprActivityGroupModel,
        ApprLineModel,
        
        ApprActivityGroupCollection,
        ActivityCollection,
        activityGroupTmpl,
        
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
            'msg_my_line_set_error_assigned_deleted' : approvalLang['지정 결재자는 꼭 포함되어야 합니다.'],
            'msg_my_line_set_error_not_matching_group_count' : approvalLang['결재선의 갯수가 일치하지 않습니다.'],
            'msg_parallel_agreement_should_has_2_more_agreement' : approvalLang['병렬합의는 연속된 둘 이상의 합의가 필요합니다.'],
            'msg_not_belong_to_department_user' : approvalLang['부서가 없는 사용자는 추가할 수 없습니다.'],
            'notAddable' : approvalLang["이 결재칸에는 결재자를 추가할 수 없습니다"]
        };


        /**
         *
         * 내 결재선으로부터 결재선 정보를 세팅한다.
         *
         */
        var ActivityGroupsSetter = Backbone.Model.extend({

            originGroups: null,
            assignedActivityDeletable: false,

            initialize: function(options) {
                if (_.isBoolean(options.assignedActivityDeletable)) {
                    this.assignedActivityDeletable = options.assignedActivityDeletable;
                }
                if (_.isArray(options.original)) {
                    this.originGroups = new ApprActivityGroupCollection(options.original);
                }
                if (_.isNull(this.originGroups)) {
                    this.throwError('No "original" was set - required.');
                }
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
                return (oldGroup.get('maxApprovalCount') >= newGroup.getApprovalAndDraftActivities().length);
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
         *
         * 결재선 아이템 뷰
         *
         */
        var ActivityGroupView = Backbone.View.extend({

            tagName : 'div',
            className: 'activity_group', // apprflow_editor_tab.js에서 약속되어 사용되는 class명입니다. 함부로 바꾸지 마세요! (chogh1211)
            observer: null,
            actionCheck: null,
            index: null,
            isNullGroup: false,
            isArbitraryCheckVisible: false,	// 전결 선택가능여부

            initialize: function(options) {
            	this.model = options.model;
                this.index = options.index;
                this.observer = options.observer;
                this.actionCheck = options.actionCheck;
                this.isArbitraryCheckVisible = options.isArbitraryCheckVisible;
                if (_.isNull(this.model)) {
                    this.isNullGroup = true;
                }

                this.$el.off('click', '.add_activity');
                this.$el.off('click', '.delete_activity');
                this.$el.off('change', 'input[name=type]');
                this.$el.off('click', 'input[type=checkbox]');
                this.$el.on('click', '.add_activity', $.proxy(this._onAddArrowClicked, this));
                this.$el.on('click', '.delete_activity', $.proxy(this._onRemoveButtonClicked, this));
                this.$el.on('change', 'select', $.proxy(this._onTypeOptionChanged, this));
                this.$el.on('click', 'input[type=checkbox]', $.proxy(this._onArbitraryClicked, this));
            },

            /**
             * 결재선 그룹 뷰 렌더링
             *
             * @returns
             */
            render: function() {
            	var data = {
                    'isNullGroup?': this.isNullGroup,
                    'isArbitraryCheckVisible' : this.isArbitraryCheckVisible,
                    'isPermissibleArbitraryDecision' : this.actionCheck.isPermissibleArbitraryDecision,
                    'lang': lang
                };

                if (!this.isNullGroup) {
                    data = _.extend(this._convertToTmplData(this.model), data);
                    data.useCheckActivity = this.actionCheck.useCheckActivity;
                    // 결재자를 추가 할 수 없는 activity 가 없는 그룹. 
                    data.isNotAddableEmptyGroup = this.model.isNotAddableEmptyGroup();
                }

                this.$el.html(activityGroupTmpl(data));
                if (!this.isNullGroup) {
                    this._applySortableFunction();
                    this.$el.attr('data-index', this.index);
                    this.observer.trigger('activateDNDDroppable');
                    this.observer.trigger('resize');
                } else {
                    this.$el.addClass('hidden_and_empty_group');
                }

                return this;
            },

            /**
             * D&D 정렬 기능 적용
             *
             */
            _applySortableFunction: function() {
               var stopCallback = function(event, ui) {
                    var sortedKeys = [];
                    this.$el.find("tr").each(function(i, el) {
                        sortedKeys.push({
                            userId: $(el).attr('data-userId'),
                            deptId: $(el).attr('data-deptId')
                        });
                    });

                    this.model.sortActivitiesByUserIdAndDeptId(sortedKeys);
                    this.render();
                };

                this.$el.sortable({
                    items: "tr:not(.inactive)",
                    placeholder: "ui-state-highlight",
                    stop: $.proxy(stopCallback, this)
                });

                /**
                 * sortable library가 disableSelection을 지정해야 사용 가능한데,
                 * 이는 input 창에 적용하면 firefox에서 오류가 발생한다. 그래서 input에 대해서는 filtering..
                 */
                this.$el.filter('input').disableSelection();
            },

            /**
             * 결재선 그룹에 액티비티를 추가하며, 추가된 결과를 다시 렌더링한다.
             *
             * @param data (조직도 데이터 형식과 같음)
             * @returns {성공여부}
             */
            addActivity: function(data, index) {
                if (_.isNull(data) || _.isUndefined(data) || _.isEmpty(data)) {
                    $.goMessage(lang['msg_not_selected']);
                    return false;
                }
                
                var activityData = {};
                if (data['type'] == 'MEMBER' || data['type'] == 'MASTER' || data['type'] == 'MODERATOR') { // 사용자
                    activityData = {
                        type: 'APPROVAL',
                        name: lang['approval'],
                        deptId: data.deptId,
                        deptName: data.deptName,
                        userId: data.id, // 사용자인 경우에는 deptId, userId 모두를 할당함!
                        userName: data.name,
                        userDuty: data.duty,
                        userPosition: data.position,
                        displayName: data.displayName,
                        thumbnail: data.thumbnail
                    };
                } else { // 부서
                    activityData = {
                        type: 'AGREEMENT',
                        name: lang['agreement'],
                        deptId: data.id,
                        deptName: data.name,
                        userId: null,
                        userName: null,
                        userPosition: null,
                        displayName: data.name
                    };
                }

                // 중복 여부 검사
                if (this.model.isExistActivity(activityData)) {
                    $.goMessage(lang['msg_duplicate_activity']);
                    return false;
                }

                if (!ActivityModel.validate(activityData)) {
                    $.goMessage(lang['msg_not_belong_to_department_user']);
                    return false;
                }

                // 최대 허용 결재자 수 검사
                if (this.model.isFullMaxApprovalCount()) {
                    $.goMessage(lang['msg_max_approval_count_exceed']);
                    return false;
                }

                if (index != 'last') {
                    // 추가 가능한 위치인지 여부 검사
                    if (!this.model.validateAddPosition(index)) {
                        $.goMessage(lang['msg_not_addable_position']);
                        return false;
                    }
                }

                this.model.addActivity(activityData, index);
                this.render();
                return true;
            },

            /**
             * 모든 액티비티의 드롭 css를 제거한다.
             */
            clearDragDropLineCss: function() {
                this.$el.find('tr.activity > td').attr('style', '');
            },

            /**
             * 그룹내의 특정 액티비티 하단부에 드래그 라인을 표시한다.
             *
             * @param activitySeq
             */
            drawDragDropLineCss: function(targetActivitySeq) {
                var $target;
                if (targetActivitySeq == 'last') {
                    $target = this.$el.find('tr.activity:last');
                } else {
                    $target = this.$el.find('tr.activity:eq(' + targetActivitySeq + ')');
                }

                var timeoutMillisecondsForDraggableUIDelay = 10; // DraggableUI에서 dropOut에 대한 callback 실행이 조금 뒤늦게 발생함에 따른 처리. => dropCheck보다 dropOut이 뒤에 발생하는 경우를 처리한다.
                setTimeout(function() {
                    $target.find('td').each(function() {
                        $(this).css({
                            'border-bottom': '2px solid black'
                        });
                    });
                }, timeoutMillisecondsForDraggableUIDelay);
            },

            _convertToTmplData: function(model) {
                var acol = new ActivityCollection(model.get('activities') || []),
                    useCheckActivity = this.actionCheck.useCheckActivity;
                	isArbitraryCheckVisible = this.isArbitraryCheckVisible;

                return {
                    groupName: model.get('name'),
                    hasActivities: acol.length > 0,
                    activities: acol.map(function(m, index) {
                        // 양식에서 지정확인자를 넣어두었는데, 확인 기능을 사용하지 않게된 경우를 가리킨다.
                        var isDisabledAssignedCheckType = m.isCheck() && !useCheckActivity;

                        return {
                            status: m.get('status'),
                            userId: m.get('userId'),
                            userName: m.get('userName'),
                            deptId: m.get('deptId'),
                            deptName: m.get('deptName'),
                            activityType: m.get('statusName'),
                            activitiesCount: acol.length,
                            isAgreementType: m.isAgreement(),
                            isApprovalType: m.isApproval(),
                            isCheckType: m.isCheck(),
                            isDisabledAssignedCheckType: isDisabledAssignedCheckType,
                            isCheckTypeVisible: isDisabledAssignedCheckType || useCheckActivity,
                            arbitraryCheckable: isArbitraryCheckVisible && m.isApproval(),
                            isArbitraryChecked: m.isArbitraryChecked(),
                            isEnabled: m.isDeletable()
                        };
                    })
                };
            },

            _onAddArrowClicked: function() {
                this.observer.trigger('addActivity', $.proxy(this.addActivity, this), this);
            },

            _onRemoveButtonClicked: function(e) {
                var el = ($(e.currentTarget).hasClass('delete_activity')) ? $(e.currentTarget) : $(e.currentTarget).hasClass('delete_activity').parent(),
                    dataContainer = el.parent().parent(),
                    userId = dataContainer.attr('data-userId'),
                    deptId = dataContainer.attr('data-deptId');

                if (userId == '') { userId = null; }
                if (deptId == '') { deptId = null; }

                var acol = new ActivityCollection(this.model.get('activities')),
                    am = acol.getByUserIdAndDeptId(userId, deptId);

                if (am.isAssigned() && !this.actionCheck.assignedActivityDeletable) {
                    $.goMessage(lang['msg_not_deletable_assigned_activity']);
                    return false;
                }

                if (!am.isDeletableStatus()) {
                    $.goMessage(lang['msg_not_deletable_status_activity']);
                    return false;
                }

                this.model.removeActivityByUserIdAndDeptId(userId, deptId);
                this.render();
                return true;
            },

            _onTypeOptionChanged: function(e) {
                var el = $(e.target),
                    dataContainer = el.parent().parent(),
                    userId = dataContainer.attr('data-userId'),
                    deptId = dataContainer.attr('data-deptId');

                this.model.setActivityType(userId, deptId, el.val(), lang[el.val().toLowerCase()]);
                this.render();
            },
            
            _onArbitraryClicked: function(e) {
            	var el = $(e.target),
	                dataContainer = el.parent().parent(),
	                userId = dataContainer.attr('data-userId'),
	                deptId = dataContainer.attr('data-deptId');
            	var arbitrary = el.is(':checked');
            	this.model.setArbitrarilyDecidable(userId, deptId, arbitrary);
            }
        });


        /**
        *
        * 결재선 목록 뷰
        *
        */
        var ActivityGroupsView = Backbone.View.extend({

            el: '#activity_groups',
            observer: null,
            collection: null,
            actionCheck: null,
            groupViewList: null,
            isArbitraryCheckVisible: false,

            initialize: function(options) {
                this.observer = options.observer;
                if (_.isArray(options.activityGroups)) {
                    this.collection = new ApprActivityGroupCollection();
                    var original = new ApprActivityGroupCollection(options.activityGroups);
                    original.each(function(m) {
                        var copied = m.clone();
                        this.collection.add(copied);
                    }, this);
                }

                if (_.isObject(options.actionCheck)) {
                    this.actionCheck = options.actionCheck;
                }
                
                if (_.isBoolean(options.isArbitraryCheckVisible)) {
                	this.isArbitraryCheckVisible = options.isArbitraryCheckVisible;
                }
                
                if (_.isBoolean(options.isPermissibleArbitraryDecision)) {
                    this.isPermissibleArbitraryDecision = options.isPermissibleArbitraryDecision;
                }

                this.observer.bind('myLineSelected', this.replaceActivityGroupsByMyLine, this);
                this.observer.bind('dropCheck', this.drawDNDLine, this);
                this.observer.bind('dropFinish', this.addActivityByDND, this);
                this.observer.bind('dropOut', this.clearAllGroupsDragDropLineCss, this);
            },

            /**
             * 렌더링..
             *
             * @returns
             */
            render: function() {
                this.$el.empty();
                this.groupViewList = [];
                this.collection.each(function(model, index) {
                    var itemView = new ActivityGroupView({
                        model: model,
                        observer: this.observer,
                        actionCheck: this.actionCheck,
                        isArbitraryCheckVisible: this.isArbitraryCheckVisible,
                        isPermissibleArbitraryDecision: this.isPermissibleArbitraryDecision,
                        index: index
                    });

                    itemView.render();
                    this.groupViewList.push(itemView);
                    this.$el.append(itemView.$el);
                }, this);

                this._makeEmptyGroupToSpareSpace();
                this._resizeEmptyGroupView();

                this.observer.trigger('activateDNDDroppable');
                this.observer.bind('resize', this._resizeEmptyGroupView, this);
                return this.$el;
            },

            _makeEmptyGroupToSpareSpace: function() {
                this.emptyGroupView = new ActivityGroupView({
                    model: null
                });

                this.emptyGroupView.render();
                this.$el.append(this.emptyGroupView.$el);
            },

            _resizeEmptyGroupView: function() {
                var totalHeight = parseInt(this.$el.css('height')),
                    totalGroupsHeight = 0,
                    emptySpaceHeight = 0,
                    marginToAvoidScroll = 20; // 스크롤이 생기지 않도록, 충분한 공간을 두도록 한다.

                _.each(this.groupViewList, function(view) {
                    totalGroupsHeight += parseInt(view.$el.css('height'));
                });

                emptySpaceHeight = totalHeight - totalGroupsHeight;
                if (emptySpaceHeight < marginToAvoidScroll) {
                    return;
                }

                this.emptyGroupView.$el.css({
                    'height': (emptySpaceHeight - marginToAvoidScroll)
                });
            },

            /**
             * 액티비티 그룹 컬렉션을 JSON 형태로 반환한다.
             *
             * @returns
             */
            getCollectionJSON: function() {
                return this.collection.toJSON();
            },

            /**
             * 액티비티 그룹 목록을 '기안'을 제외하고 반환한다. (복사본 배열)
             *
             * @returns {Array}
             */
            getActivityGroupsWithoutDraftActivity: function() {
                var activityGroups = [];
                this.collection.each(function(model) {
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
                this.collection.each(function(model) {
                    if (model.isExceedMaxApprovalCount()) {
                        isMaxApprovalCountExceed = true;
                    }
                });

                return !isMaxApprovalCountExceed;
            },

            /**
             * 그룹에 상관 없이 맨 마지막 액티비티가 결재인지 여부를 검증한다.
             *
             * @returns {Boolean} 마지막 액티비티 결재인지 여부
             */
//            validateLastActivity: function() {
//                var activities = new ActivityCollection([]);
//                this.collection.each(function(model) {
//                    var acol = new ActivityCollection(model.get('activities'));
//                    activities.add(acol.models);
//                });
//
//                if (!activities.last()) {
//                    return false;
//                }
//
//                return activities.last().isApproval();
//            },

            /**
             * 어느 한 그룹이라도 연속된 합의 액티비티를 가지고 있는지 여부를 검증한다.
             *
             * @returns {Boolean} 연속된 합의 액티비티 소유 여부
             */
            hasSerialParallelAgreement: function() {
                var isValid = false;

                this.collection.each(function(model) {
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

                if ( groupSeq == 'last' && activitySeq == 'last' ) {
                    var groupView = _.last(this.groupViewList);
                    groupView.drawDragDropLineCss('last');
                    return true;

                } else {
                    if (!this.collection.validateAddPosition(groupSeq, activitySeq)) {
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

                this.clearAllGroupsDragDropLineCss();
                if ( groupSeq == 'last' && targetSeq == 'last') {
                    var groupView = _.last(this.groupViewList);
                    groupView.addActivity(activityData, 'last');
                } else {

                    if (this.collection.validateAddPosition(groupSeq, targetSeq)) {
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
                _.each(this.groupViewList, function(groupView) {
                    groupView.clearDragDropLineCss();
                });
            },

            /**
             * 주어진 ActivityGroups로 현재 결재선 ActivityGroups를 대체한다.
             *
             * @param activityGroups
             */
            replaceActivityGroupsByMyLine: function(activityGroups) {
                var setter = new ActivityGroupsSetter({
                    assignedActivityDeletable: this.actionCheck.assignedActivityDeletable,
                    original: this.collection.toJSON()
                });

                try {
                    var result = setter.makeData(activityGroups);
                    this.collection = new ApprActivityGroupCollection(result);
                    this.render();
                } catch (e) {
                    $.goMessage(e.message);
                }
            }
        });

        return ActivityGroupsView;

    });
}).call(this);
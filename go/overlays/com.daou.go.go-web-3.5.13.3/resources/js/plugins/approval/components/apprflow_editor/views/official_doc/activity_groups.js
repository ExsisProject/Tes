define("approval/components/apprflow_editor/views/official_doc/activity_groups", [
    "backbone",
    "app",
    
    "approval/components/apprflow_editor/views/official_doc/activity_group", 
    	
    "approval/models/activity",
    "approval/models/appr_activity_group",
	"approval/collections/appr_receiver",
	"approval/models/appr_receiver",
	"approval/collections/appr_official_version",
	"approval/models/appr_official_version",

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
    ApprReceiverCollection,
    ApprReceiverModel,
    ApprOfficialVersionCollection,
    ApprOfficialVersionModel,

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
        'msg_my_line_set_error_assigned_deleted' : approvalLang['지정 결재자는 꼭 포함되어야 합니다.'],
        'msg_my_line_set_error_not_matching_group_count' : approvalLang['결재선의 갯수가 일치하지 않습니다.'],
        'msg_parallel_agreement_should_has_2_more_agreement' : approvalLang['병렬합의는 연속된 둘 이상의 합의가 필요합니다.'],
        'msg_not_belong_to_department_user' : approvalLang['부서가 없는 사용자는 추가할 수 없습니다.'],
        'notAddable' : approvalLang["이 결재칸에는 결재자를 추가할 수 없습니다"],
		"not_allowed_apprline" : '선택한 개인결재선은 이 결재그룹에 사용할 수 없습니다.'
    };

    /**
     * 공문서 그룹 뷰
     * 
     * model: ApprDocumentModel
     */
    var ActivityGroupsView = Backbone.View.extend({

        observer: null,
        activityGroups: null,
        actionCheck: null,
        groupViewList: null,
        __activated__: false,
        __disabled__: false, 
		
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
            this.viewerType = this.options.viewerType;
            listenEvents.call(this);
        },
        
        getActivityGroups : function(){
    		return new ApprOfficialVersionCollection(this.model.docInfoModel.get('officialVersions'));
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
            	var isCreate = _.isEqual(activityGroupModel.get('state'), 'CREATE'); // 신규발송 상태의 그룹은 편집 가능하다.
            	// 현재 사용자가 승인과 반려가 가능한 _.isEqual(this.model.get('approvable'), true) 유저일 경우 발송완료 그룹 (_.isEqual(activityGroupModel.get('state'), 'APPROVE'))을 제외하곤 편집 가능하다.
            	var enableUser = !_.isEqual(activityGroupModel.get('state'), 'APPROVE') && _.isEqual(this.model.get('approvable'), true);
                var itemView = new ActivityGroupView({
                    model: activityGroupModel,
                    observer: this.observer,
                    viewerType : this.viewerType,
                    index: index,
                    documentEditModel : this.model,
                    disable: this.isDisabled() || !(isCreate || enableUser)
                });

                itemView.render();
                this.groupViewList.push(itemView);
                this.$el.append(itemView.$el);
            }, this);

            this._makeEmptyGroupToSpareSpace();
            this._resizeEmptyGroupView();

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
                var groupView = this.groupViewList[groupSeq];
                groupView.addActivity(activityData, targetSeq);
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
        
        disable: function() {
        	this.__disabled__ = true;
        }, 
        
        isDisabled: function() {
        	return this.__disabled__;
        }
    });
    
    // private methods..
    function listenEvents() {
        this.listenTo(this.observer, 'dropCheck', this.drawDNDLine);
        this.listenTo(this.observer, 'dropFinish', this.addActivityByDND);
        this.listenTo(this.observer, 'dropOut', this.clearAllGroupsDragDropLineCss);
        this.listenTo(this.observer, 'resize', this._resizeEmptyGroupView);

        this.listenTo(this.activityGroups, 'change add remove', function(activityGroup) {
        	this.model.docInfoModel.set('officialVersions', this.activityGroups.toJSON());
        	this.model.set('docInfoChanged', true);
        	// 우선 임시로 apprline으로 고정해서 트리거링 한다.
        	this.observer.trigger('changedTabItem', 'officialdoc');
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
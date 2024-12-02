define("approval/components/apprflow_editor/views/apprline/activity_group", [
	"backbone",
	
	"approval/models/activity",
	"approval/collections/activities",
	"hgn!approval/components/apprflow_editor/templates/apprline/activity_group",
	
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    
    "jquery.go-popup"
], 

function(
	Backbone,
	
	ActivityModel, 
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
        'inspection' : approvalLang['감사'],
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
        'msg_not_addable_before_draft' : approvalLang['기안자 앞으로 결재자를 추가할 수 없습니다.'],
        'notAddable' : approvalLang["이 결재칸에는 결재자를 추가할 수 없습니다"], 
        "msg_not_addable_item": approvalLang["항목을 추가할 수 없습니다"],
		"not_allowed_apprgroup" : approvalLang['선택한 대상은 이 결재그룹에 사용할 수 없습니다']
    };
	/**
	 * 결재 정보의 그룹별 결재라인 뷰
	 * model: ApprActivityGroupModel
	 */
   var ActivityGroupView = Backbone.View.extend({

       tagName : 'div',
       className: 'activity_group', // apprflow_editor_tab.js에서 약속되어 사용되는 class명입니다. 함부로 바꾸지 마세요! (chogh1211)
       observer: null,
       actionCheck: null,
       index: null,
       isNullGroup: false,
       isArbitraryCheckVisible: false,	// 전결 선택가능여부
       
       __disabled__: false, 
       
       events: {
    	   "click .add_activity": "_onAddArrowClicked", 
    	   "click .delete_activity": "_onRemoveButtonClicked", 
    	   "change select": "_onTypeOptionChanged", 
    	   "change input[type=checkbox]": "_onArbitraryClicked"
       }, 

       initialize: function(options) {
    	   options = options || {};
           this.index = options.index;
           this.observer = options.observer;
           this.actionCheck = options.actionCheck;
           this.isArbitraryCheckVisible = options.isArbitraryCheckVisible;
           this.isPermissibleArbitraryDecision = options.isPermissibleArbitraryDecision;
           if (_.isNull(this.model)) {
               this.isNullGroup = true;
           }
           this.__disabled__ = false;
           
           if(options.disable) {
        	   this.disable();
           }
           this.isReceiveDoc = options.isReceiveDoc || false;
           this.includeAgreement = options.includeAgreement;
           this.apprAllowType = options.apprAllowType;
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
               'isPermissibleArbitraryDecision' : this.isPermissibleArbitraryDecision,
               'lang': lang, 
               "disabled": this.isDisabled()
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
           this.$el.data('data-view', this);
           return this;
       },

       /**
        * D&D 정렬 기능 적용
        *
        */
       _applySortableFunction: function() {
    	   if(this.isDisabled()) return;
    	   var groupSelector = ".activity_group";
    	   var stopCallback = function(event, ui) {
    		   var index = this.index;
    		   var $group = ui.item.closest(groupSelector);
    		   var groupIndex = parseInt($group.data('index') || 0);
    		   
    		   if(groupIndex == 0 && ui.item.index() == 0){
    			   $.goMessage(lang['msg_not_addable_before_draft']);
                   return false;
    		   }
    		   
               if(groupIndex === this.index) {
                   if (!this.model.validateAddPosition(ui.item.index())) {
                       $.goMessage(lang['msg_not_addable_position']);
                       return false;
                   }
                   var sortedKeys = [];
                   this.$el.find("tr").each(function(i, el) {
                       sortedKeys.push({
                           userId: $(el).attr('data-userId'),
                           deptId: $(el).attr('data-deptId')
                       });
                   });
            	   this.model.sortActivitiesByUserIdAndDeptId(sortedKeys);
            	   this.render();
               }else{
            	   (function fakeSorting(){
                       var dataContainer = ui.item;
                       userId = dataContainer.attr('data-userId'),
                       deptId = dataContainer.attr('data-deptId');

                       if (userId == '') { userId = null; }
                       if (deptId == '') { deptId = null; }

                       var acol = new ActivityCollection(this.model.get('activities')),
                           am = acol.getByUserIdAndDeptId(userId, deptId);
                	   var data = {
                			   fromGroupIndex : this.index,
                			   toGroupIndex : groupIndex,
                			   am : am,
                			   userId : userId,
                			   deptId : deptId,
                			   dataContainer : dataContainer,
                			   targetIndex : dataContainer.index()
                	   }
                	   this.trigger('moveActivityToOtherGroup', data);            		   
            	   }).call(this);
            	   return false;
               }
           };

           this.$el.sortable({
               items: "tbody tr",
               cancel : "tr.inactive, select",
               connectWith: groupSelector,
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
                   isDept : false,
                   deptId: data.deptId,
                   deptName: data.deptName,
                   userId: data.id, // 사용자인 경우에는 deptId, userId 모두를 할당함!
                   userName: data.name,
                   userDuty: data.duty,
                   userPosition: data.position,
                   displayName: data.displayName,
                   thumbnail: data.thumbnail
               };
           } else if(data['type'] == 'org') { // 부서
               activityData = {
                   isDept : true,
                   deptId: data.id,
                   deptName: data.name,
                   userId: null,
                   userName: null,
                   userPosition: null,
                   displayName: data.name
               };
           } else {
        	   return false;
           }
           activityData['type'] = this.model.getValidApprovalType(this.actionCheck, activityData) && this.model.getValidApprovalType(this.actionCheck, activityData)['type'];
           activityData['name'] = this.model.getValidApprovalType(this.actionCheck, activityData) && this.model.getValidApprovalType(this.actionCheck, activityData)['name'];           
           
           if(!this.checkAddableActivity(activityData, index)){
        	   return false;
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
       
       disable: function() {
    	   this.__disabled__ = true;
       },
       
       isDisabled: function() {
    	   return this.__disabled__;
       },

       _convertToTmplData: function(model) {
    	   var self = this;
           var acol = new ActivityCollection(model.get('activities') || []),
           		canUseApproval =  model.canUseApproval(this.actionCheck),           		
           		canUseAgreement = model.canUseAgreement(this.actionCheck),
           		canUseCheck = model.canUseCheck(this.actionCheck),
           		canUseInspection = model.canUseInspection(this.actionCheck),
           		isArbitraryCheckVisible = this.isArbitraryCheckVisible,
           		agreementAllowType = this.actionCheck['agreementAllowType'] || 'ALL';
           		
           return {
               groupName: model.get('name'),
               hasActivities: acol.length > 0,
               activities: acol.map(function(m, index) {
                   // 양식에서 지정확인자를 넣어두었는데, 확인 기능을 사용하지 않게된 경우를 가리킨다.
                   var isDisabledAssignedCheckType = (m.isCheck() && !canUseCheck) || (m.isAgreement() && !canUseAgreement) || (m.isApproval() && !canUseApproval) || (m.isInspection() && !canUseInspection);

                   return {
                       status: m.get('status'),
                       userId: m.get('userId'),
                       userName: m.get('userName'),
                       deptId: m.get('deptId'),
                       deptName: m.get('deptName'),
                       activityType: m.get('name'), 
                       statusName: m.get('statusName'),
                       activitiesCount: acol.length,
                       isAgreementType: m.isAgreement(),
                       isApprovalType: m.isApproval(),
                       isCheckType: m.isCheck(),
                       isInspectionType: m.isInspection(),
                       isDisabledAssignedCheckType: isDisabledAssignedCheckType,
                       isApprovalTypeVisible: canUseApproval || (isDisabledAssignedCheckType && m.isApproval()),                       
                       isCheckTypeVisible: canUseCheck || (isDisabledAssignedCheckType && m.isCheck()),
                       isInspectionTypeVisible: canUseInspection || (isDisabledAssignedCheckType && m.isInspection()),
                       isAgreementTypeVisible : function(){
                    	   var isDept = _.isNull(m.get('userId')) && !_.isNull(m.get('deptId'));
                    	   var flag = canUseAgreement || (isDisabledAssignedCheckType && m.isAgreement());
                    	   var agreementAllowTypeValid = model.agreementAllowTypeValidate(agreementAllowType, isDept); 
                		   if(!agreementAllowTypeValid){
                			   flag = false;
                		   }
                           return flag;
                           /***
                            * 합의일때.. GO-17782
                            * 부서만 합의를 사용하게 한다면 사용자일때 에러화면을 띄우고
                            * 반대로 사용자만 합의를 사용하게 한다면 부서를 추가할 경우 에러 메세지를 띄운다. 
                            */
                       },
                       arbitraryCheckable: isArbitraryCheckVisible && m.isApproval(),
                       isArbitraryChecked: m.isArbitraryChecked(),
                       isLast : index + 1 === acol.length ? true : false,
                       isEnabled: !self.__disabled__ && m.isDeletable()
                   };
               })
           };
       },

       _onAddArrowClicked: function(e) {
    	   if(this.isDisabled()) return;
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
           
           if(!this.checkRemovableActivity(am)){
        	   return false;
           }

           this.model.removeActivityByUserIdAndDeptId(userId, deptId);
           this.render();
           return true;
       },
       
       checkAddableActivity : function(activityData, index){
    	   var agreementAllowType = this.actionCheck['agreementAllowType'] || 'ALL';
    	   if(!this.isReceiveDoc){
        	   if(this.model.isAllApprovalTypeBlock(this.actionCheck) || _.isUndefined(activityData.type)){
                   $.goMessage(lang['not_allowed_apprgroup']);
                   return false;
        	   }    		   
    	   }
    	   if(this.apprAllowType == 'USER' && activityData['isDept'] == true){
               $.goMessage(lang['not_allowed_apprgroup']);
               return false;      
    	   }
    	   
           // 중복 여부 검사
           if (this.model.isExistActivity(activityData)) {
               $.goMessage(lang['msg_duplicate_activity']);
               return false;
           }
//           getAvailableApprovalType
           if (!ActivityModel.validate(activityData)) {
               $.goMessage(lang['msg_not_belong_to_department_user']);
               return false;
           }

           // 최대 허용 결재자 수 검사 (결재만 검사)
           if (this.model.isFullMaxApprovalCount()) {
               $.goMessage(lang['msg_max_approval_count_exceed']);
               return false;
           }
           
           //결재선에 결재와 합의 같의 표시가 true일때(admin에서 지정 가능) 합의까지 counting하여 check
           if (this.includeAgreement && this.model.isFullMaxApprovalAndAgreementCount()) {
               $.goMessage(lang['msg_max_approval_count_exceed']);
               return false;
           }
           
           /***
            * 합의를 사용하지 않을때(actionCheck.useCheckActivity = false or activityGroupModels.UseAgreement = false && actionCheck.useCheckActivity  = true)
            * 부서를 추가할수 없다..(부서는 합의밖에 안되므로)
            */ 
           if(activityData['isDept'] == true){
        	   if(!this.model.canUseAgreement(this.actionCheck)){
                   $.goMessage(lang['not_allowed_apprgroup']);
            	   return false;
        	   } else if(agreementAllowType == 'USER'){
                   $.goMessage(lang['not_allowed_apprgroup']);
            	   return false;
        	   }
           }
           
           
           /***
            * 2.1.1 이 오면서 결재선 validate관련이 액티비티 그룹이 아닌 개별 액티비티 별로 validation체크를 할수밖에 없는 요구사항이 많음. 
            * 따라서 validation이 복잡해졌음.
            * 
            */
           if(this.model.onlyCanAgreement(this.actionCheck)){ //합의일 경우에만 체크하는 로직. GO-17782. 추가할려고 하는데 합의밖에 할수 없을경우 조건에 따라 예외처리 한다.
        	   if(!this.model.agreementAllowTypeValidate(this.actionCheck['agreementAllowType'], activityData['isDept'])){
                   $.goMessage(lang['not_allowed_apprgroup']);
            	   return false;
               }        	   
           }
        	   
           if (index != 'last') {
               // 추가 가능한 위치인지 여부 검사
               if (!this.model.validateAddPosition(index)) {
                   $.goMessage(lang['msg_not_addable_position']);
                   return false;
               }
           }

           return true;
       },
       
       checkRemovableActivity : function(activityModel){
           if (activityModel.isAssigned() && !this.actionCheck.assignedActivityDeletable) {
               $.goMessage(lang['msg_not_deletable_assigned_activity']);
               return false;
           }

           if (!activityModel.isDeletableStatus()) {
               $.goMessage(lang['msg_not_deletable_status_activity']);
               return false;
           }
           return true;
       },
       
       _removeEachActivityGroup: function(userId, deptId){
    	   var userId = userId || null
    	   ,deptId = deptId || null
    	   
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
       },
       
       /***
        * 결재선 추가(드래그앤 드롭이나 서로 다른 결재그룹간의 sorting이 일어날때 addActivity가 발생하는데 이때 이 함수를 거쳐서 approvalType을 바꾼다.)
        */
       getAddableApprType : function(){
    	   
       }
	});

	
	return ActivityGroupView;
});
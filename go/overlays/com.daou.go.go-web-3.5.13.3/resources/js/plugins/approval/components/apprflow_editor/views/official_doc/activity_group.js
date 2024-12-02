define("approval/components/apprflow_editor/views/official_doc/activity_group", [
	"backbone",
	"approval/collections/appr_receiver",
	"approval/models/official_preview",
	"hgn!approval/components/apprflow_editor/templates/official_doc/activity_group",
	
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    
    "jquery.go-popup"
],

function(
	Backbone,
	ApprReceiverCollection,
    OfficialPreviewModel,
	activityGroupTmpl,
	
    commonLang,
    approvalLang
) {
	var lang = {
        'header' : approvalLang['결재 정보'],
        'save_as_my_line' : approvalLang['개인 결재선으로 저장'],
        'delete_as_my_line' : approvalLang['개인 결재선 삭제'],
        'empty_msg' : '등록된 시행문이 없습니다.',
        'my_line_name' : approvalLang['결재선 이름'],
        'normal' : approvalLang['일반'],
        'my_lines' : approvalLang['나의결재선'],
        'draft' : approvalLang['기안'],
        'name' : commonLang['이름'],
        'dept' : approvalLang['부서'],
        'line' : approvalLang['라인'],
        'status' : approvalLang['상태'],
        '선택' : commonLang['선택'],
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
        "msg_not_addable_item": approvalLang["항목을 추가할 수 없습니다"],
		"not_allowed_apprgroup" : approvalLang['선택한 대상은 이 결재그룹에 사용할 수 없습니다'],
		"공문 발송 실패 메세지" : approvalLang['공문 발송 실패 메세지'],
		"발신 명의" : approvalLang["발신 명의"],
		"직인" : approvalLang["직인"],
		"시행문" : approvalLang["시행문"],
		"시행문 보기" : approvalLang["시행문 보기"],
		'신규 발송' : approvalLang['신규 발송'],
		"승인 대기" : approvalLang["승인 대기"],
		"발송 대기" : approvalLang["발송 대기"],
		"발송 실패" : approvalLang["발송 실패"],
		"발송 완료" : approvalLang["발송 완료"],
		"발송 취소" : approvalLang["발송 취소"],
		"발송 반려" : approvalLang["발송 반려"],
		"결재 반려" : approvalLang["결재 반려"],
		"열기" : commonLang["열기"],
		"닫기" : commonLang["닫기"],
		"의견" : approvalLang["의견"],
		"문서 보기" : approvalLang["문서 보기"]
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
       
       __disabled__: false, 
       
       events: {
    	   "click .add_activity": "_onAddArrowClicked", 
    	   "click .delete_activity": "_onRemoveButtonClicked",
    	   "change select": "_onTypeOptionChanged",
    	   "click .showOfficialFormPreview" : "showOfficialFormPreview",
    	   "click .showOfficial" : "showOfficial",
    	   "click span[evt-role='appr-official-toggle']" : "toggleList",
     	   "click a[evt-role='showOfficialComment']" : "showOfficialComment"
       }, 
       
       toggleList : function(e){
    	   var target = $(e.currentTarget);
    	   var currentStateIsOpen = target.hasClass('ic_open_s') ? true : false;
    	   if(currentStateIsOpen){
    		   target.removeClass('ic_open_s').addClass('ic_close_s');
    	   }else{
    		   target.removeClass('ic_close_s').addClass('ic_open_s');
    	   }
    	   this.$('.approval_line').toggle(!currentStateIsOpen);
       },

       initialize: function(options) {
    	   options = options || {};
           this.index = options.index;
           this.observer = options.observer;
           this.documentEditModel = options.documentEditModel;
           this.actionCheck = options.actionCheck;
           this.viewerType = options.viewerType;
           if (_.isNull(this.model)) {
               this.isNullGroup = true;
           }
           this.__disabled__ = false;
           
           if(options.disable) {
        	   this.disable();
           }
       },

       /**
        * 결재선 그룹 뷰 렌더링
        *
        * @returns
        */
       render: function() {
    	   var data = {
               'isNullGroup?': this.isNullGroup,
               'lang': lang, 
               "disabled": this.isDisabled()
           };
           if (!this.isNullGroup) {
               data = _.extend(this._convertToTmplData(this.model), data);
           }
           this.$el.html(activityGroupTmpl(data));
           
           if (!this.isNullGroup) {
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
        * 결재선 그룹에 액티비티를 추가하며, 추가된 결과를 다시 렌더링한다.
        * @param data (조직도 데이터 형식과 같음)
        * @returns {성공여부}
        */
       addActivity: function(data, index) {
    	   if (_.isNull(data) || _.isUndefined(data) || _.isEmpty(data)) {
               $.goMessage(lang['msg_not_selected']);
               return false;
    	   }
           
			if (_.isEmpty(data)) {
				return false;
			}
			
			if(this.isDisabled()){
				return false;
			}

			//공용주소록 폴더의 경우 추가되지 않도록 처리
			if(data.type === "normal") {
    	       return false;
            }
			
			// email 이 없는 연락처인경우 추가되지 않도록 한다.
			if (data.email === "" || data.email === undefined) {
				$.goError(commonLang["잘못된 이메일 주소입니다."]);
				return false;
			}
			
			var matched = _.findWhere(this.model.get('receivers'), {
				email : data.email
			});
			
			if(matched){
				$.goMessage(approvalLang['중복된 대상입니다.']);
				return false;
			};
			
			if(!_.isEmpty(data.companyName)){
				data['company'] = data.companyName; 
			}
           
			this.model.addReceiver(data, index);
			this.render();
			return true;
       },

       /**
        * 모든 액티비티의 드롭 css를 제거한다.
        */
       clearDragDropLineCss: function() {
           this.$el.find('tr.activity > td').attr('style', '');
       },
       
       /***
        * 시행문 양식 미리보기
        */
       
       showOfficialFormPreview : function(e) {
           var asignedForm = this.model.get('asignedForm');
           var htmlTemplate = asignedForm && asignedForm.html;
           if (htmlTemplate) {
        	   var hasCurrnetDocBody = !_.isUndefined(this.documentEditModel.get('currentDocBodyContent'));
        	   var previewModel = new OfficialPreviewModel(this.documentEditModel.toJSON());
        	   previewModel.get('docInfo')['officialVersions'] = [this.model.toJSON()];
        	   if(hasCurrnetDocBody){
                   previewModel.get('document')['docBodyContent'] = this.documentEditModel.get('currentDocBodyContent');
                   previewModel.get('document')['title'] = this.documentEditModel.get('currentTitle');
        	   }else{
                   previewModel.get('document')['docBodyContent'] = this.model.get('docBody');
        	   }
        	   /**
        	    * 공문서 미리보기는 팝업으로 열리는데 opener에 대한 접근이 필요하므로 세션에 저장해둔다.
        	    * store을 이용하여 Backbone의 MOdel을 저장할때 테스트 결과 instance는 Backbone.Model로 저장이 되지 않는다.
        	    * (previewModel을 store에 set 하더라도 get해보면 단순 json데이터만 반환된다.) 
        	    * 그래서 그냥 toJSON()을 저장하고 받아쓰는 쪽에서 new Model하여 instance를 다시 생성하는 방식으로 함.
        	    *         	    */
        	   GO.util.store.set('official-preview-data', previewModel.toJSON()); 

               var url = previewModel.getFullShowUrl();
               window.open(url, '','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
           } else {
               $.goSlideMessage(lang.empty_msg, 'caution');
           }
       },
       
       // 공문서 보기
       showOfficial : function(e){
    	   var officialId = this.model.get('id');
    	   var url = window.location.protocol + "//" +window.location.host + GO.contextRoot +"app/approval/official/" + officialId + "/popup";
    	   window.open(url, '','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
       },
       
       _getHtmlTemplate: function(formId) {
           var templateHtml = $('#' + formId + '_template_storage').contents();
           var copied = templateHtml.clone().show().html();
           return copied;
       },
       
       showOfficialComment : function(e){
           $.goPopup({	
               "pclass" : "layer_normal layer_approval",
               "header" : lang["의견"],
               "modal" : true,
               "draggable" : true,
               "allowPrevPopup" : true,
               "width" : 500,
               "contents" : GO.util.unescapeHtml(this.model.get('comment')),
               "buttons" : [{
                                'btext' : commonLang["닫기"],
                                'btype' : 'cancel'
                            }]
           });
       },
       
       /***
        * 정보를 보여주고 안보여주고.. 활성화되고 비활성화 처리되는 로직이 좀 복잡하다. 문서상세정보 있는 공문서탭 및 문서목록에서
        * 결재상태를 클릭할때 보여주는 문서정보 레이어팝업에서 쓰이는 official_doc_receiver_list.js과 로직이 비슷하니 변경시 관리포인트.
        */
       _convertToTmplData : function(model){
           var acol = new ApprReceiverCollection(model.getReceiver()) || [];
           var isOnlyView = this.viewerType === 'official_document' || model.get('state') !== 'CREATE'; //viewerType이 official_document는 공문서 상세에서 이 컴포넌트를 호출한 경우이다.
           var showBtn = this.viewerType !== 'official_document'; //공문서일때는 시행문보기나 문서(원문)보기 버튼을 노출시키지 않는다.
           var isCreate = model.get('state') === 'CREATE'; //create일떄는 시행문보기 버튼을 보여주고 create가 아니면 공문서를 보여준다
           var asignedForm = model.get('asignedForm');
           var asignedFormId = model.get('asignedForm') && model.get('asignedForm').id;
           var isForcedAsignedForm = false;
           var asignedSender = model.get('asignedSender');
           var asignedSenderId = model.get('asignedSender') && model.get('asignedSender').id;
           var asignedSign = model.get('asignedSign');
           var asignedSignId = model.get('asignedSign') && model.get('asignedSign').id;
           var formVisible = true;
           if(isOnlyView){
               if(!asignedFormId){
            	   formVisible = false;
               }        	   
           }else{
               //formVisible. 넘어오는 시행문 양식이 1개도 없거나 사용자가 편집할수 없는 상태에서 시행문 양식을 지정하지 않을경우 화면에 보이지 않는다
               if(model.get('forms').length < 1 || (!model.get('officialFormEditable') && !asignedFormId)){
            	   formVisible = false;
               }        	   
           }

           var formEditable = model.get('officialFormEditable') && !this.isDisabled();
           
           var senderVisible = true;
           
           if(isOnlyView){
               if(!asignedSenderId){
            	   senderVisible = false;
               }        	   
           }else{
               //senderVisible 넘어오는 발신명의가 하나도 없거나 사용자가 편집할수 없는 상태에서 발신명의를 지정하지 않을경우 화면에 보이지 않는다
               if(model.get('senders').length < 1 || (!model.get('officialSenderEditable') && !asignedSenderId)){
            	   senderVisible = false;
               }        	   
           }

           var senderEditable = model.get('officialSenderEditable') && !this.isDisabled();

           var signVisible = true;
           
           if(isOnlyView){
               if(!asignedSignId || !senderVisible){
            	   signVisible = false;
               }       	   
           }else{
               /**
                * 1. signVisible 넘어오는 직인이 하나도 없거나 
                * 2. 사용자가 편집할수 없는 상태에서 직인을 지정하지 않을경우
                * 3. 발신명의를 사용하지 않는 경우
                * 4. 발신명의에 현재 값이 없는 경우 보이지 않는다. 
                */
//               if(model.get('signs').length < 1 || (!model.get('officialSignEditable') && !asignedSignId) || !senderVisible || !asignedSenderId){
        	   if(model.get('signs').length < 1 || (!model.get('officialSignEditable') && !asignedSignId)){
            	   signVisible = false;
               }      	   
           }
           var signEditable = model.get('officialSignEditable') && !this.isDisabled();
           var signPreviewEditable = model.get('officialSignPreviewEditable') && !this.isDisabled();
           
       	   var hasComment = !_.isEmpty(this.model.get('comment')) ? true : false;
       	   var dockedVisible = formVisible || senderVisible || signVisible; //3중에 하나라도 보여야 하는 경우
       	   var isApproved = model.get('state') === 'APPROVE';
       	   var sentAt = model.get('sentAt')? GO.util.basicDate(model.get('sentAt')) : "";
       	   var failSent = false;
       	   if(model.get('state') === 'APPROVE'){ //GO-20811 발송은 하였는데 receiver에 발송실패한 목록이 하나라도 있을경우 이 그룹은 발송실패 그룹으로 명한다. 
       		   if(acol.findWhere({isSent : false})){
       			   failSent = true;
       		   }
       	   }
       	   
           return {
        	   isApproved : isApproved,
        	   sentAt : sentAt,
        	   failSent : failSent,
               groupName: this.getGroupName(model.get('state'), failSent),
               isOnlyView : isOnlyView,
               hasActivities: acol.length > 0,
               receivers : acol.map(function(m, index) {
                   return {
                	   name: m.get('name'),
                       email: m.get('email'),
                       company: m.get('company'),
                       isLast : index + 1 === acol.length ? true : false,
                       removable : !m.get('isSent')
                   }
               }),
               forms : _.map(model.get('forms'), function(m){
            	   return {
            		   id : m.id,
            		   name : m.name,
            		   isSelected : m.id == asignedFormId
            	   }
               }, this),
               asignedForm : asignedForm,
               formVisible : formVisible,
               formEditable : formEditable,
               senders : _.map(model.get('senders'), function(m){
            	   return {
            		   id : m.id,
            		   name : m.name,
            		   isSelected : m.id == asignedSenderId
            	   }
               }, this),
               asignedSender : asignedSender,
               senderVisible : senderVisible,
               senderEditable : senderEditable,
               signs : _.map(model.get('signs'), function(m){
            	   return {
            		   id : m.id,
            		   name : m.name,
            		   isSelected : m.id == asignedSignId
            	   }
               }, this),
               asignedSign : asignedSign,
               signVisible : signVisible,
               signEditable : signEditable,
               signPreviewEditable : signPreviewEditable,
               dockedVisible : dockedVisible,
               hasComment : hasComment,
               "isCreate" : isCreate,
               "showBtn" : showBtn,
				"isEnabled": !this.isDisabled()
           }
       },
       
       getGroupName : function(state, failSent){
     	   if(state == 'CREATE'){
     		   return lang['신규 발송'];
     	   }else if(state == 'WAIT'){
     		   return lang['승인 대기'];
     	   }else if(state == 'APPROVE'){
    		   return failSent ? lang['발송 실패'] : lang['발송 완료'];
     	   }else if(state == 'CANCEL'){
     		   return lang['발송 취소'];
     	   }else if(state == 'RETURN'){
     		   return lang['발송 반려'];
     	   }else if(state == 'DOC_RETURN'){
     		  return lang['결재 반려'];
     	   }
        },
       
       _onTypeOptionChanged : function(e){
    	 var type = $(e.currentTarget).attr('name'),
    	 item,
    	 id = $(e.currentTarget).val();
    	 if(_.isString(id)){
    		 id = parseInt(id);
    	 }
    	 if(type == 'formSelect'){
    		 item = _.findWhere(this.model.get('forms'), {id : id});
    		 this.model.set('asignedForm', item);
    	 }else if(type == 'senderSelect'){
    		 item = _.findWhere(this.model.get('senders'), {id : id});
    		 this.model.set('asignedSender', item);
    	 }else if(type == 'signSelect'){
    		 item = _.findWhere(this.model.get('signs'), {id : id});
    		 this.model.set('asignedSign', item);
    	 }
    	 this.render();
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

       _onAddArrowClicked: function(e) {
    	   if(this.isDisabled()) return;
           this.observer.trigger('addActivity', $.proxy(this.addActivity, this), this);
       },

       _onRemoveButtonClicked: function(e) {
           var el = ($(e.currentTarget).hasClass('delete_activity')) ? $(e.currentTarget) : $(e.currentTarget).hasClass('delete_activity').parent(),
               dataContainer = el.parent().parent(),
               email = dataContainer.attr('data-id');

           var acol = new ApprReceiverCollection(this.model.get('receivers')),
               am = acol.get(email);
           acol.remove(am);
           this.model.set('receivers', acol.toJSON())
           this.render();
           return true;
       }
	});

	
	return ActivityGroupView;
});
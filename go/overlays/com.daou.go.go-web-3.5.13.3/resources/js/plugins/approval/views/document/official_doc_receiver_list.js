define([
    "jquery",
    "underscore",
    "backbone",
	"approval/models/official_preview",
    "hgn!approval/templates/official_doc_receiver_list",
    "hgn!approval/templates/official_doc_receiver_list_item",
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
	"i18n!nls/user"
], 
function(
    $, 
    _, 
    Backbone,
    OfficialPreviewModel,
    Tpl,
    ItemTpl,
    commonLang,
    approvalLang,
    userLang
) {
    
    /**
     * 공문발송 목록 Collection
     */
	
	var lang = {
			"이름": commonLang["이름"], 
			"이메일": commonLang["이메일"],
			"회사": userLang["회사"],
			"remove": commonLang["삭제"],
	        'dept' : approvalLang['부서'],
	        'line' : approvalLang['라인'],
	        'status' : approvalLang['상태'],
	        'empty_msg' : '등록된 시행문이 없습니다.',
	        '선택' : commonLang['선택'],
	        'activityType' : approvalLang['타입'],
	        'add' : commonLang['추가'],
	        'delete' : commonLang['삭제'],
	        'confirm' : commonLang['확인'],
	        'cancel' : commonLang['취소'],
	        'msg_not_deletable_status_activity' : approvalLang['삭제할 수 없는 상태의 결재자 입니다.'],
	        'msg_not_deletable_assigned_activity' : approvalLang['지정 결재자는 삭제할 수 없습니다.'],
	        'msg_save_success' : commonLang['저장되었습니다.'],
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
			"문서 보기" : approvalLang["문서 보기"],
			"공문 발송 실패 메세지" : approvalLang['공문 발송 실패 메세지'],
			'emptyOfficialDocReceivers' : approvalLang['공문수신처로 지정된 곳이 없습니다.']
	    };
	
    var OfficialDocReceiverCollection = Backbone.Collection.extend({
        url: function() {
            if (this.isAdmin) {
                return ['/ad/api/approval/manage/document', this.docId , 'officialdocreceiver'].join('/');
            } else {
                return ['/api/approval/document', this.docId , 'officialdocreceiver'].join('/');
            }
        },

        initialize: function(options) {
            this.docId = options.docId;
            this.isAdmin = options.isAdmin;
        }
    });
    
    var OfficialDocReceiverListItemView = Backbone.View.extend({
        tagName: 'div',
        className: 'list_approval_line_wrap',
        initialize: function(options) {
        	this.options = options || {};
        	this.model = this.options.model;
        	this.type = this.options.type;
        	this.isAdmin = this.options.isAdmin || false;
        },
        
        events: {
      	   "click span[evt-role='appr-official-toggle']" : "toggleList",
     	   "click .showOfficial" : "showOfficial",
     	   "click a[evt-role='showOfficialComment']" : "showOfficialComment"
         },
        
        render: function() { //  결재선 공문서 탭인 views/official_doc/activity_group.js 와 로직이 비슷하다. 변경시 관리포인트.
        	var model = this.model;
            var asignedForm = model.get('asignedForm');
            var asignedFormId = model.get('asignedForm') && model.get('asignedForm').id;
            var formVisible = asignedFormId ? true : false;
            
            var asignedSender = model.get('asignedSender');
            var asignedSenderId = model.get('asignedSender') && model.get('asignedSender').id;
            var senderVisible = asignedSenderId ? true : false;
            
            var asignedSign = model.get('asignedSign');
            var asignedSignId = model.get('asignedSign') && model.get('asignedSign').id;
//            var signVisible = asignedSignId && senderVisible ? true : false;
            var signVisible = asignedSignId ? true : false;
            
            var dockedVisible = formVisible || senderVisible || signVisible; //3중에 하나라도 보여야 하는 경우만 그린다
            var isApproved = model.get('state') === 'APPROVE';
            var sentAt = model.get('sentAt')? GO.util.basicDate(model.get('sentAt')) : "";
        	var receivers = _.map(model.get('receivers'), function(m){
            	return {
                    'company' : m['company'],
                    'name' : m['name'],
                    'email' : m['email']
            	}
            });
        	
        	var hasComment = !_.isEmpty(this.model.get('comment')) ? true : false;
            var failSent = false;
            if(model.get('state') === 'APPROVE'){ //GO-20811 발송은 하였는데 receiver에 발송실패한 목록이 하나라도 있을경우 이 그룹은 발송실패 그룹으로 명한다. 
            	if(_.findWhere(model.get('receivers'), {isSent : false})){
            		failSent = true;
            	}
            }
            var groupName = this.getGroupName(model.get('state'), failSent);
        	
        	this.$el.html(ItemTpl({
        		lang : lang,
        		isApproved : isApproved,
        		isAdmin : this.isAdmin,
        		sentAt : sentAt,
            	receivers : receivers,
            	hasComment : hasComment,
            	hasActivities : receivers.length > 0 ? true : false,
    			failSent : failSent,
            	groupName : groupName,
            	asignedForm : asignedForm,
            	asignedSender : asignedSender,
            	asignedSign : asignedSign,
            	formVisible : formVisible,
            	senderVisible : senderVisible,
            	signVisible : signVisible,
            	dockedVisible : dockedVisible,
            	isOfficial : this.type === 'official' //공문서에서 호출한 경우는 문서보기 버튼을 보여주지 않는다.
        	}));
            
            return this;
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
        
        showOfficial: function(e) {
        	var officialId = this.model.get('id');
        	var url = window.location.protocol + "//" +window.location.host + GO.contextRoot +"app/approval/official/" + officialId + "/popup";
        	window.open(url, '','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
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
         }
    });
    
    /**
     * 공문발송 목록 View
     */
    var OfficialDocReceiverListView = Backbone.View.extend({
        
        tagName: 'div',
        className: 'aside_wrapper_body',
        
        initialize: function(options) {
            this.isAdmin = false;
            this.type = options.type || "";
            if (_.isBoolean(options.isAdmin)) {
                this.isAdmin = options.isAdmin;
            }
            this.docStatus = options.docStatus || "";
            if (options.dataList) {
                this.collection = new OfficialDocReceiverCollection(options.dataList);
                this.collectionInjected = true;
            } else {
                this.collection = new OfficialDocReceiverCollection({
                    isAdmin : this.isAdmin,
                    docId : options.docId
                });
                this.collectionInjected = false;
            }
        },
        
        render: function() {
            var ctx = this;
            if (!this.collectionInjected) {
                this.collection.fetch({
                    success: function(collection) {
                        ctx._renderList(collection);
                    }
                })
            } else {
                ctx._renderList(this.collection);
            }

            return this;
        },
        
        _renderList: function(collection) {
        	var dataList = [];
        	var hasReceiver = false;
    		collection.each(function(model) {
    			//결재정보탭에서는 신규발송(stats, "CREATE")을 표시하지 않지만 결재진행중일경우는 보여준다.
    			if(!_.isEqual(model.get('state'), 'CREATE') || _.isEqual(this.docStatus, 'INPROGRESS')){
    				dataList.push(model)
    			}
    			if(model.get('receivers') && model.get('receivers').length > 0){
    				hasReceiver = true;
    			}
    		}, this);
        	if(dataList.length < 1 || !hasReceiver){ // 공문 수신처가 한개도 없을경우 hasReceiver == false도 그리지 않는다.
        		var htmls = [];
                htmls.push('<ul class="list_line list_officialDoc">');
                htmls.push('    <li class="inactive last" style="margin-left: 10px">{{lang.emptyOfficialDocReceivers}}</li>');
                htmls.push('</ul>');
        		this.$el.html(Hogan.compile(htmls.join('')).render({lang : lang}));
        	}else{
        		this.$el.html(Tpl({
        			lang : lang
        		}));
        		_.each(dataList, function(model) {
    				var view = new OfficialDocReceiverListItemView({
    					model : model,
    					isAdmin : this.isAdmin,
    					type : this.type
    				});
    				this.$el.append(view.render().el);            		
        		}, this);
        	}
        },

        show: function() {
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        }
    });
    
    return OfficialDocReceiverListView;
});
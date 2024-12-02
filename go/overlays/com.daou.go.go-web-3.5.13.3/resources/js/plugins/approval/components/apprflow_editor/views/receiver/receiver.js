define("approval/components/apprflow_editor/views/receiver/receiver", [
 	"approval/components/apprflow_editor/views/base_tab_item",
 	
 	"hgn!approval/components/apprflow_editor/templates/tab/layout",
 	"text!approval/components/apprflow_editor/templates/tab/header_dept.html",
	"text!approval/components/apprflow_editor/templates/tab/footer_dept.html",
 	
 	"approval/components/apprflow_editor/views/activity_list/activity_list", 
 	"approval/components/apprflow_editor/views/activity_list/doc_reader_activity_group", 
 	
	"approval/models/subscriber_group",
 	
 	"i18n!nls/commons", 
 	"i18n!approval/nls/approval"
 ], 

 function(
 	BaseTabItemView, 
	
 	TabViewLayoutTpl,
 	HeaderDeptTpl,
	FooterDeptTpl,
 	
 	ActivityGroupsView, 
 	DocReaderActivityGroupView, 
 	
	SubscriberGroupModel,
 	
 	commonLang, 
 	apprLang
 ) {
 	var lang = {
 		"name": commonLang["이름"], 
 		"department": apprLang["부서"], 
 		"remove": commonLang["삭제"],
		"saveMyASubscruber": apprLang["개인 그룹으로 저장"], 
		"msg_duplicated_my_line_title": apprLang['중복된 이름을 사용할 수 없습니다.'],
		"msg_save_success" : commonLang['저장되었습니다.'],
		"not_allowed_form" : apprLang['선택한 대상은 이 양식에 사용할 수 없습니다.'],
		'not_allowed_group_for_receiver' : apprLang['선택한 그룹으로 수신자를 지정할 수 없습니다.'],
		"dept_not_exist_user": apprLang['부서가 없는 사용자는 수신자로 지정 할 수 없습니다.'] 
 	};
 	
 	var DocReiceverActivityGroupView = DocReaderActivityGroupView.extend({
		initialize: function(options) {
			options = options || {};
			if(_.isString(options.receiveAllowType)){
				this.receiveAllowType = options.receiveAllowType;
			};
			DocReaderActivityGroupView.prototype.initialize.apply(this, arguments);
		},
		parseOrgTreeData: function(orgTreeData) {
			
			if(orgTreeData.type == "MEMBER" && orgTreeData.deptName.length == 0) {
				$.goError(lang['dept_not_exist_user']);
				return false;
			}      
			
			if(orgTreeData && !orgTreeData.hasOwnProperty('id')) {
				return false;  
			}
			
			if(!this.isValidOrgData(orgTreeData)){
				$.goError(lang['not_allowed_form']);
				return false;
			}
			
			var result = {};
			var filtered = this.collection.find(function(model) {
				var reader = model.get("reader");
				if (reader) {
					if (orgTreeData.type == 'org') {
						return reader.deptType && reader.id === orgTreeData.id;
					} else {
						return !reader.deptType && reader.id === orgTreeData.id;
					}
				}
			});
			
			// 중복 체크..
			if(filtered) {
				$.goMessage(apprLang['중복된 대상입니다.']);
				return false;
			}
			
			return {
				"reader": convertToApprUserModelFrom(orgTreeData)
			};
		},
		
		isValidOrgData : function(data){
			if(this.receiveAllowType == 'USER' && data.type == 'org'){
				return false;
			}else if(this.receiveAllowType == 'DEPARTMENT' && (data.type != 'org' || data.useReception == false) ){
				return false;
			}else if(this.receiveAllowType == 'ALL' && data.useReception == false){
				return false;
			}else{
				return true;				
			}
		}
 	});
 	
	/**
	 * 조직도에서 전달된 데이터를 ApprUserModel로 변환
	 * 
	 * 참고: ApprUserModel(백엔드)
	 */
	function convertToApprUserModelFrom(orgTreeData) {
		var result = {};
		if(orgTreeData && orgTreeData.type && orgTreeData.type.toLowerCase() === 'org') {
			result = {
				"id": orgTreeData.id, 
				"name": orgTreeData.name,
				"deptId": orgTreeData.id, 
				"deptName": orgTreeData.name,
				"deptType": true
			};
		} else {
			result = _.pick(orgTreeData, 'id', 'name', 'position', 'deptId', 'deptName', 'thumbnail');
			result.deptType = false;
		}
		return result;
	}
 	
	var ConvertRefererToNodeModel = Backbone.Model.extend({
        defaults : {
            nodeId: 0,
            nodeDeptId: "",
            nodeCompanyId: null,
            nodeCompanyName: null,
            nodeType: 'user', /* POSITION, GRADE, DUTY, USERGROUP, USER, DEPARTMENT, SUBDEPARTMENT */
            nodeValue: '', /* 멤버값 출력 문자열 */
            actions: '', /* read, write */
            members: []
        },
        initialize: function() {
            this.convert(this.get('reader'));
        },
        convert : function(readerModel){
        	this.set('nodeId', readerModel['id']);
        	this.set('nodeDeptId', readerModel['deptId']);
        	this.set('nodeValue', readerModel['name']);
        	this.set('nodeType', readerModel['deptType'] == false ? 'user' : 'department');
        }
	});
	
    var NodeCollection = Backbone.Collection.extend({
        model: ConvertRefererToNodeModel
    });
 	 	
 	/**
     * 수신자 지정 뷰
     */
     var ReceiverTabItemView = BaseTabItemView.extend({
     	className: 'set_data wrap_approvalLine_set', 
     	
     	tabId: 'receiver', 
     	// TODO: 다국어 처리
     	tabName: apprLang["수신자"], 
     	activityGroupsView: null, 
     	
     	viewerType: '', 
     	
     	_MAX_LENGTH_OF_MY_LINE_TITLE : 20,
     	
     	initialize: function(options) {
     		BaseTabItemView.prototype.initialize.apply(this, arguments);
     		
     		options = options || {};
     		
     		if(options.observer && options.observer.hasOwnProperty('bind')) {
     			this.observer = options.observer;
     		} else {
     			this.observer = _.extend({}, Backbone.Events);
     		}
     		
     		this.viewerType = '';
     		if(options.hasOwnProperty('viewerType')) {
    			this.viewerType = options.viewerType;
    		}
     		initRender.call(this);
     		initActivityGroupsView.call(this);
     	}, 
     	
    	events : {
    		"click .save-mysubscriber-btn": "_saveAsPeronalSubscriber",
    	},

     	/**
     	 * @Override 
     	 */
     	render: function() {
     		this.activityGroupsView.render();
     	}, 
     	
     	/**
     	 * @Override
     	 */
     	remove: function() {
     		this.activityGroupView.remove();
     		BaseTabItemView.prototype.remove.apply(this, arguments);
     	}, 
     	
     	/**
     	 * @Override
     	 */
     	editable: function() {
     		if(this.model.isStatusReturned()) {
    			return false;
    		}
     		
     		return this.viewerType === 'docmaster' || this.model.Permission.canEditReceiverList();
     	}, 
     	
     	/**
     	 * @Override
     	 */
     	usable: function() {
     		return this.model.Permission.canUseReceiverList();
     	},
     	
     	/**
     	 * @Override
     	 */
     	activate: function() {
     		BaseTabItemView.prototype.activate.apply(this, arguments);
     		this.activityGroupsView.activate();
     	}, 
     	
    	_saveAsPeronalSubscriber: function(e) {
    		var pid = 'gopopup-personalsubscriber';
    		e.preventDefault();
    		
    		// GO-16964: 더블클릭시 복수개의 창이 호출되는 것을 방지
    		if($('#' + pid).length > 0) return;
    		
    		// 결재선 변경 권한이 없으면 동작안함
    		if(!this.editable()) return;
    		
    		// 수신자 정보가 없으면 동작 않함
    		if (this.model.docInfoModel.get("docReceptionReaders").length == 0) {
                $.goMessage(GO.i18n(apprLang['선택된 대상이 없습니다.']));
                return false;
    		}
    		
            var $popup = $.goPopup({
            	'id': pid, 
                'allowPrevPopup' : true,
                'pclass' : 'layer_normal',
                'header' : apprLang['개인 그룹으로 저장'],
                'modal' : true,
                'width' : 300,
                'contents' : getSavePersonalApprSubscriberContentHtml(),
                'buttons' : [
                     {
                        'btext' : commonLang['확인'],
                        'btype' : 'confirm',
                        'autoclose' : false,
                        'callback' : _.bind(saveAsPeronalSubscriberOkButtonCallback, this)
                    },
                    {
                        'btext' : commonLang['취소'],
                        'btype' : 'cancel'
                    }
                ]
            });
            
            $('input#my_subscriber_title_input').keypress(_.bind(function (e) {
                if (e.which == 13) {
                	saveAsPeronalSubscriberOkButtonCallback.call(this, $popup, e);
                    return false;
                }
            }, this));
        },
     	
     	/**
     	 * @Override
     	 */
     	deactivate: function() {
     		BaseTabItemView.prototype.deactivate.apply(this, arguments);
     		this.activityGroupsView.deactivate();
     	}
     });
     
     // private members...
     function initRender() {
     	this.$el.html(TabViewLayoutTpl({"lang": lang}, {
     		"activityHeader": HeaderDeptTpl,
    		"activityFooter": FooterDeptTpl
     	}));
     }
     
     function initActivityGroupsView() {
 		this.docReceptionReaders = new Backbone.Collection(this.model.docInfoModel.get("docReceptionReaders"));
 		this.activityGroupsView = new ActivityGroupsView({
 			el: this.$el.find('.list_approval_line_wrap'), 
 			observer: this.observer
 		});
 		
 		this.activityGroupsView.addGroupView(new DocReiceverActivityGroupView({
 			activities: this.docReceptionReaders, 
 			disable: !this.editable(),
 			observer: this.observer,
 			receiveAllowType : this.model.getReceiveAllowType()
 		}));
 		
		this.listenTo(this.observer, 'mySubscriberSelected', function(attrs) {
			if(!this.isActivated()){
				return;
			}
			if(!validateSubscriber.call(this, attrs.nodes)){
				$.goError(lang['not_allowed_group_for_receiver']);
				this.observer.trigger('deselectSubscriber');
				return false;
			}
			
            var data = _.map(attrs.nodes, function(node) {
                return {
                    reader : {
                    	deptId : node.nodeDeptId,
                    	deptType : node.nodeType == 'department' ? true : false,
            			deptName : node.nodeDeptName,
                    	id : node.nodeId,
                    	name : node.nodeValue.split(' ')[0],
                    	position : node.nodeValue.split(' ')[1] ? node.nodeValue.split(' ')[1] : ""
                    }
                };
            });
			this.docReceptionReaders.reset(data);
		})
 		
 		this.listenTo(this.docReceptionReaders, 'add remove reset', _.bind(function addReceiver(model) {
 			var collection;
			
			// reset 이벤트일 경우 Backbone.Collection 객체가 넘어오므로 분기해준다.
			if(model instanceof Backbone.Collection) {
				collection = model;
			} else if(model instanceof Backbone.Model && model.collection) {
				collection = model.collection;
			}
			
			if(collection) {
 				this.model.docInfoModel.set("docReceptionReaders", collection.toJSON());
 				this.model.set('docInfoChanged', true);
 				this.observer.trigger('changedTabItem', this.getTabId());
 			}
 		}, this));
     }
     
     function validateSubscriber(nodes){
    	 var filtered = [];
    	 
    	 
    	 if(this.model.getReceiveAllowType() == 'DEPARTMENT'){
    		 filtered = _.filter(nodes, function(node){
    			return node.nodeType != 'department' || String(node.JSON.parse(node.actions).useReception) == 'false'; //node.action이 string type의 'false' 로 내려올떄가 있음.
    		 });
    	 }else if(this.model.getReceiveAllowType() == 'USER'){
    		 filtered = _.filter(nodes, function(node){
     			return node.nodeType == 'department' || String(node.actions) == 'false'; 
     		 });    		 
    	 }else if(this.model.getReceiveAllowType() == 'ALL'){
    		 filtered = _.filter(nodes, function(node){
				 return (node.nodeType == 'department' && String(JSON.parse(node.actions).useReception) == 'false')
					 || (node.nodeType != 'department' && String(node.actions) == 'false');
      			
      		 });    		 
    	 }

    	 return filtered.length < 1; 
     }
     
     function saveAsPeronalSubscriberOkButtonCallback(rs, event){
 		// 수신자 정보가 없으면 동작 않함
 		if (this.model.docInfoModel.get("docReceptionReaders").length == 0) {
             $.goMessage(GO.i18n(apprLang['선택된 대상이 없습니다.']));
             return false;
 		}
         var title = $('input#my_subscriber_title_input').val();
         if (_.isEmpty(title) || title.length > this._MAX_LENGTH_OF_MY_LINE_TITLE) {
             $.goMessage(GO.i18n(apprLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"20"}));
             return false;
         }
         
         var mySubscriberModel = new SubscriberGroupModel({
             subscriber : {"nodes" : new NodeCollection(this.model.docInfoModel.get("docReceptionReaders")).toJSON()},
             title: title
         });
         
         mySubscriberModel.save({}, {
             success: $.proxy(function(model, resp, opts) {
                 $.goMessage(lang['msg_save_success']);
                 
                 this.observer.trigger('reloadMySubscriber');
                 
                 rs.close('', event);
             }, this),
             
             error: function(model, resp, opts) {
                 $.goMessage(lang['msg_duplicated_my_line_title']);
             }
         });
     }
     
     function getSavePersonalApprSubscriberContentHtml() {
         return [
             '<table class="table_form_mini"><form>',
             '<tbody><tr>',
             '</tr><tr>',
             '    <th><span class="txt">'+apprLang['그룹 이름']+'</span></th>',
             '    <td><input id="my_subscriber_title_input" class="txt_mini w_max" type="text"></td>',           
             '</tr>',
             '</tbody></form></table>'
         ].join('\n');
     }
     
     return ReceiverTabItemView;
 });

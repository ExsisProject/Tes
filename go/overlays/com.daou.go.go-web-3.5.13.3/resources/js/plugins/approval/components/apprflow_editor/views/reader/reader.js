define("approval/components/apprflow_editor/views/reader/reader", [
	"approval/components/apprflow_editor/views/base_tab_item", 
	
	"hgn!approval/components/apprflow_editor/templates/tab/layout",
	"text!approval/components/apprflow_editor/templates/tab/header_read.html", 
	"text!approval/components/apprflow_editor/templates/tab/footer_dept.html",
	
	"approval/components/apprflow_editor/views/activity_list/activity_list", 
	"approval/components/apprflow_editor/views/activity_list/doc_reader_activity_group", 
	
	
	"approval/models/subscriber_group",
	
	"i18n!nls/commons", 
	"i18n!approval/nls/approval",
    "i18n!calendar/nls/calendar",
    "jquery.go-orgtab"
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
	apprLang,
	calLang
) {	
	var lang = {
		"name": commonLang["이름"], 
		"department": apprLang["부서"], 
		"remove": commonLang["삭제"],
		"readAt": "확인시간",
		"saveMyASubscruber": apprLang["개인 그룹으로 저장"], 
		"msg_duplicated_my_line_title": apprLang['중복된 이름을 사용할 수 없습니다.'],
		"msg_save_success" : commonLang['저장되었습니다.']
	};
	
	var ReaderActivityGroupView = DocReaderActivityGroupView.extend({
		initialize: function(options) {
			options = options || {};
			if(_.isString(options.receiveAllowType)){
				this.receiveAllowType = options.receiveAllowType;
			};
			this.options.includeReadAt = true;

			this.hash = {};
			_.each(options.activities.models, function (model) {
				this.hash[model.get('reader').id] = true;
			}, this);

			DocReaderActivityGroupView.prototype.initialize.apply(this, arguments);
		},
		/**
		 * @Override
		 */
		parseOrgTreeData: function(orgTreeData) {
			if(orgTreeData && orgTreeData.type && orgTreeData.type.toLowerCase() === 'org') {
				return false;
			}else{
				return DocReaderActivityGroupView.prototype.parseOrgTreeData.apply(this, arguments);
			}
		},
		addReaders : function(modelAttrs){
			var self = this;
			var modelAttr;
			var addOptions = {};
			if(!modelAttrs) {
				return;
			}

			_.each(modelAttrs, function (orgTreeModel) {
				if (this.hash[orgTreeModel.id]) {
					return;
				}
				modelAttr = {
					"reader" : convertToApprUserModelFrom(orgTreeModel)
				};

				this.hash[orgTreeModel.id] = true;
				self.collection.add(modelAttr, addOptions);
			}, this);

			this.observer.trigger('resize');				
		},
		/**
		 * override
		 */
		addActivity: function(orgTreeData, index) {
			var modelAttrs;
			if(orgTreeData && orgTreeData.type === 'company') {
				return;
			}
			var addOptions = {};
			if(orgTreeData.type != 'org'){
				modelAttrs = this.parseOrgTreeData(orgTreeData);
				if(!modelAttrs) {
					return;
				}
				if(_.isNumber(index) && this.collection.length > index) {
					addOptions.at = index;
					addOptions.merge = true;
				} 
				this.collection.add(modelAttrs, addOptions);
				this.observer.trigger('resize');
			}else{
				this.addActivityByOrg(orgTreeData);
			}
		},
		/***
		 * 부서를 선택했을경우
		 */
		addActivityByOrg : function(orgTreeData){
            var self = this;
    		var pid = 'gopopup-orgtab';
    		var memberList = [];
    		// GO-16964: 더블클릭시 복수개의 창이 호출되는 것을 방지
    		if($('#' + pid).length > 0) return;
    		var defer = $.Deferred();
    		//하위 부서원이 없는 경우
    		if(!orgTreeData.subdept){ 
                reqDeptMemberList.call(self, defer, orgTreeData.id);
                return;
			}
            $.goPopup({
            	'id': pid,
                pclass: 'layer_confim',
                'allowPrevPopup' : true,
                title : apprLang["열람자 추가"],
                message: GO.i18n(apprLang["열람자 추가 확인 메시지"], {"dept": orgTreeData.name}),
                modal : true,
                buttons : [{
                    btype : 'confirm',
                    btext: calLang["현재 부서원만 추가"],
                    callback: function() {
                    	reqDeptMemberList.call(self, defer, orgTreeData.id);
                    }
                }, {
                    btype : 'confirm',
                    btext: calLang["하위 부서원 모두 추가"],
                    callback: function() {
                    	reqDeptMemberList.call(self, defer, orgTreeData.id, true);
                    }
                }, {
                    btype : 'close', btext: commonLang["취소"]
                }]
            });
            
            function reqDeptMemberList(defer, deptId, isIncludeSubDept) {
                isIncludeSubDept = isIncludeSubDept || false;
                var reqUrl = GO.config('contextRoot') + 'api/organization/user?deptid=' + orgTreeData.id + (!!isIncludeSubDept ? '&scope=subdept' : '');
                    
                return $.ajax(reqUrl).done(_.bind(function(memberList) {
                    var memberInfos = [];
                    _.each(memberList, function(member) {
                            memberInfos.push(member.metadata);
                    }, this);
                    defer.resolve(this.addReaders(memberInfos));
                    
                }, this)).fail(function() {
                    console.log('error');
                    defer.reject();
                });
            }
		}
	});
	
	
	/**
     * 열람자 지정 뷰
     */
    var ReaderTabItemView = BaseTabItemView.extend({
    	className: 'set_data wrap_approvalLine_set', 
    	
    	tabId: 'reader', 
    	// TODO: 다국어 처리
    	tabName: apprLang["열람자"], 

    	activityGroupsView: null, 
    	
    	viewerType: '', 
    	
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
    		return (
				this.viewerType === 'docmaster' || 
				this.viewerType === 'formadmin' || 
				this.viewerType === 'officialdocmaster' ||
				this.model.Permission.canEditReaderList()
			);
    			
    	}, 
    	
    	/**
    	 * @Override
    	 */
    	usable: function() {
    		return this.model.Permission.canUseReaderList();
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

    		// 참조자 정보가 없으면 동작 않함
    		if (this.model.docInfoModel.get("docReadingReaders").length == 0) {
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
		var docReadingReaders = new Backbone.Collection(this.model.docInfoModel.get("docReadingReaders"));
		this.activityGroupsView = new ActivityGroupsView({
			el: this.$el.find('.list_approval_line_wrap'), 
			observer: this.observer
		});
		this.activityGroupsView.addGroupView(new ReaderActivityGroupView({
			activities: docReadingReaders, 
			disable: !this.editable(), 
			observer: this.observer,
			receiveAllowType : 'USER',
			tabId : this.getTabId(),
			actionCheck : this.model.get('actionCheck')
		}));
		
		this.listenTo(this.observer, 'mySubscriberSelected', function(attrs) {
			if(!this.isActivated()){
				return;
			}
			
			if(!validateSubscriber.call(this, attrs.nodes)){
				console.log('!validateSubscriber.call');
				$.goError(apprLang['선택한 그룹으로 열람자를 지정할 수 없습니다.']);
				this.observer.trigger('deselectSubscriber');
				return false;
			}
			
			var beforeReaderIds = [];
			_.each(docReadingReaders.toJSON(), function(model) {
				beforeReaderIds.push(model.reader.id);
			});
			
			_.each(attrs.nodes, function(node) {
				// 중복 체크..
				if(!_.contains(beforeReaderIds, node.nodeId)) {
					var data = {
		                    reader : {
		                    	deptId : node.nodeDeptId,
		                    	deptType : node.nodeType == 'department' ? true : false,
		            			deptName : node.nodeDeptName,
		                    	id : node.nodeId,
		                    	name : node.nodeValue.split(' ')[0],
		                    	position : node.nodeValue.split(' ')[1] ? node.nodeValue.split(' ')[1] : ""
		                    }
		                };
					docReadingReaders.add(new Backbone.Model(data));
				}
			});
		})
		
		this.listenTo(docReadingReaders, 'add remove reset', _.bind(function addReader(model) {
			var collection;
			
			// reset 이벤트일 경우 Backbone.Collection 객체가 넘어오므로 분기해준다.
			if(model instanceof Backbone.Collection) {
				collection = model;
			} else if(model instanceof Backbone.Model && model.collection) {
				collection = model.collection;
			}
			
			if(collection) {
				this.model.docInfoModel.set("docReadingReaders", collection.toJSON());
				this.model.set('docInfoChanged', true);
				this.observer.trigger('changedTabItem', this.getTabId());
			}			
		}, this));
	}
    
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
	
    function validateSubscriber(nodes){
    	var filtered = [];
    	filtered = _.filter(nodes, function(node){
       			return node.nodeType == 'department' || String(node.actions) == 'false'; 
  		 });    		 
      	 return filtered.length < 1; 
      }
    
    function validateSubscriberGroup(){
    	var valid = true;
    	_.each(this.activityGroupsView.groupViewList, function(groupView){
    		groupView.collection.each(function(model){
    			if(!model.get('removable')){
    				valid = false;
    			}
    		});
    	}, this);
    	return valid;
      }

	
    function saveAsPeronalSubscriberOkButtonCallback(rs, event){
    	// 참조자 정보가 없으면 동작 않함
		if (this.model.docInfoModel.get("docReadingReaders").length == 0) {
            $.goMessage(GO.i18n(apprLang['선택된 대상이 없습니다.']));
            return false;
		}
		
        var title = $('input#my_subscriber_title_input').val();
        if (_.isEmpty(title) || title.length > this._MAX_LENGTH_OF_MY_LINE_TITLE) {
            $.goMessage(GO.i18n(apprLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"20"}));
            return false;
        }
        
        var mySubscriberModel = new SubscriberGroupModel({
            subscriber : {"nodes" : new NodeCollection(this.model.docInfoModel.get("docReadingReaders")).toJSON()},
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
    
    return ReaderTabItemView;
});

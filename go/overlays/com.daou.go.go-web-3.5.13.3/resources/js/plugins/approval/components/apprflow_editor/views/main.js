define("approval/components/apprflow_editor/views/main", [
	"backbone",
	"app",
	
	"approval/components/apprflow_editor/views/base_tab",
	"hgn!approval/components/apprflow_editor/templates/main",
	
	"approval/components/apprflow_editor/views/side",
	"approval/components/apprflow_editor/views/side/org_tree",
	"approval/components/apprflow_editor/views/side/my_appr_line",
	"approval/components/apprflow_editor/views/side/my_subscriber",
	"approval/components/apprflow_editor/views/side/contact",

	"approval/collections/appr_activity_groups",
	"approval/collections/appr_official_version",
	"approval/models/document",
	"approval/models/appr_line",
	
	"i18n!nls/commons",
	"i18n!approval/nls/approval",
	
	"jquery.go-popup"
], function(
    Backbone,
    App,
    
    BaseTabView,
    tmpl,
    
    BaseSideView, 
	OrgTreeSideView,
	MyApprLineSideView,
	MyApprSubscriberSideView,
	ContactSideView,

	ApprActivityGroupCollection,
	ApprOfficialVersionCollection,
    ApprDocumentModel, 
    ApprLineModel,
    
    commonLang,
    approvalLang
) {
	var LAYER_WIDTH = '900px';
	var lang = {
        'header' : approvalLang['결재 정보'],
        'save_as_my_line' : approvalLang['개인 결재선으로 저장'],
        'normal' : approvalLang['일반'],
        'my_lines' : approvalLang['나의결재선'],
        'activityType' : approvalLang['타입'],
        'name' : commonLang['이름'],
        'dept' : approvalLang['부서'],
        'state' : approvalLang['상태'],
        'arbitrary' : approvalLang['전결'],
        'delete' : commonLang['삭제'],
        'agreement_type' : approvalLang['합의방식'],
        'agreement_linear' : approvalLang['순차합의'],
        'agreement_parallel' : approvalLang['병렬합의'],
        'confirm' : commonLang['확인'],
        'cancel' : commonLang['취소'],
        'msg_max_approval_count_exceed' : approvalLang['결재자 수가 최대 결재자 수를 넘을 수 없습니다.'],
        'msg_parallel_agreement_should_has_2_more_agreement' : approvalLang['병렬합의는 연속된 둘 이상의 합의가 필요합니다.'],
        'msg_save_success' : commonLang['저장되었습니다.'],
        'msg_duplicated_my_line_title' : approvalLang['중복된 이름을 사용할 수 없습니다.'],
        'my_line_name' : approvalLang['결재선 이름'], 
        'alert_modified': approvalLang['저장되지 않은 정보가 있습니다'],
        'msg_receiver_add' : '공문서 수신처를 한 곳 이상 지정해 주세요.'
    };

	
    /**
     * 
     * 결재선 뷰가 반환하는 예외 클래스
     * 
     */
    var ApprFlowEditorException = function(message) {
        this.message = message;
        this.name = 'ApprFlowEditorException';
    };
    
    /**
     * 수신자용 조직도
     * 수신자는 멀티컴퍼니를 지원하지 않아야 하므로 별도의 클래스를 만든다.(id, tabId가 고유해야해서 상속으로 푼다...)
     */
    var ReceiverOrgTreeSideView = OrgTreeSideView.extend({
    	id: 'aside-receiver-orgtree', 
    	tabId: 'rcvorgtree'
    });
    
    /**
     * 수신자용 조직도(부서전용)
     * 수신자는 멀티컴퍼니를 지원하지 않아야 하므로 별도의 클래스를 만든다.(id, tabId가 고유해야해서 상속으로 푼다...)
     */
    var ReceiverOrgTreeDeptSideView = ReceiverOrgTreeSideView.extend({
    	id: "aside-dept-orgtree", 
    	tabId: "depttree",
    	type: 'department'
    });
    
    /**
     * 참조자용 조직도
     * 
     */
    var RefererOrgTreeSideView = OrgTreeSideView.extend({
    	id: 'aside-referer-orgtree', 
    	tabId: 'reforgtree'
    });

    /**
     * Main View 
     */
    var MainView = BaseTabView.extend({
        className: "content apprflow-editor",
        
        tabEl: '.maintab', 
        tabItemEl: '.maintab-item', 
        itemTemplate: '<li><span class="ic_txt_change">*</span><span class="txt">{{tabName}}</span></li>',
        
        saveCallback: function() {},
        apprLineModel: null,
        isArbitraryCheckVisible: false,
        isAdmin: false, 
        sideView: null, 
        observer: null, 
        // 전자결재 문서관리에서 호출하는 것인지의 여부
        viewerType: '',
        masterAuthModel  : null, //appr_master_auth.js

        /**
         * @saveCallback 결재선 수정사항 저장시 수행할 콜백 메서드
         * @activityGroups 화면을 구성할 때 담아내고 싶은 결재선 정보
         */
        initialize: function(options) {
        	options = options || {};
        	
        	// 옵져버 초기화
        	this.observer = _.extend({}, Backbone.Events);
        	
        	BaseTabView.prototype.initialize.apply(this, arguments);
        	initOptions.call(this, options);
        	
        	initRender.call(this);
        	initSideView.call(this);
        	initTabItemView.call(this);
        }, 
        

        /**
         * @Override
         * 각 서브뷰를 만들고 등록하면 탭이 생성되는 방식으로 한다.
         */
        render: function() {
        	BaseTabView.prototype.render.apply(this, arguments);
            
            wrapLayerPopup.call(this);
            renderSideView.call(this);
        },
        
        remove: function() {
        	BaseTabView.prototype.remove.apply(this, arguments);
        }, 
        
        /**
         * 확인 클릭시 콜백 정의
         */
        onConfirmed: function() {
        	return true;
        }, 
        
        /**
         * 취소 클릭시 콜백 정의
         */
        onCanceled: function() {
        	return true;
        }, 
        
        /**
         * @Override
         */
        activateTab: function(targetTabId) {
        	BaseTabView.prototype.activateTab.apply(this, arguments);
        	setViewLayout.call(this);
        	// GO-17068	[IE8]전자결재> 결재 정보> 참조자/ 수신자/ 공문서 수신처 탭 UI 깨짐 현상 발생합니다.
        	// 이슈 대응용 코드
        	setWrapClassname.call(this);
        }, 
    }, {
    	__tabViewKlassList__: [],
    	
    	addTabView: function(TabViewKlass) {
    		this.__tabViewKlassList__.push(TabViewKlass);
    	}
    });
    
    // private members
    function initRender() {
    	this.$el.html(renderTemplate.call(this));
    }
    
    function renderTemplate() {
    	return tmpl(mergeTemplateOption.call(this));
    }
    
    function mergeTemplateOption() {
    	return _.extend({
            lang: lang,
            isAdmin: this.isAdmin,
            isArbitraryCheckVisible: this.isArbitraryCheckVisible
        }, this.apprLineModel.toJSON());
    }
    
    function initOptions(options) {
    	if(options.apprDocumentModel) {
    		// 원본을 보존하기 위해서 복사본을 이용한다.
    		this.model = options.apprDocumentModel.clone();
    	} else {
    		this.model = new ApprDocumentModel();
    	}
    	
    	// 이전 버전 호환
    	if (_.isFunction(options.saveCallback)) {
            this.onConfirmed = options.saveCallback;
        }
    	
    	// saveCallback과 같이 정의되어 있으면 onConfirmed가 우선이 되도록 한다.
    	if (_.isFunction(options.onConfirmed)) {
    		this.onConfirmed = options.onConfirmed;
    	}
    	
    	// 이전버전 호환 제공
    	this.apprLineModel = new ApprLineModel(this.model.get('apprFlow'));
    	this.actionCheck = this.model.get('actionCheck');
    	this.documentModel = this.model.get('document');
    	this.docStatus = this.documentModel.docStatus;
    	
        // 사이트 관리자에서 호출하는지의 여부
    	this.isAdmin = false;
        if (_.isBoolean(options.isAdmin)) {
            this.isAdmin = options.isAdmin;
        }
        
        // 전자결재 문서관리자인지 여부설정
        this.viewerType = '';
        if (_.isString(options.viewerType)) {
        	this.viewerType = options.viewerType;
        }
        
        if (options.masterAuthModel) {
        	this.masterAuthModel = options.masterAuthModel;
        }
        
        this.isArbitraryCheckVisible = false;
        if (_.isBoolean(this.actionCheck.isArbitraryCheckVisible)) {
        	this.isArbitraryCheckVisible = this.actionCheck.isArbitraryCheckVisible;
        }
        
        if (_.isNull(this.apprLineModel)) {
            throw new ApprFlowEditorException("No 'apprLineModel' is set.");
        }
        
        if (_.isNull(this.actionCheck)) {
         // 문서 생성시라고 해도, 결재선 관련된 권한 정보가 존재한다.
            throw new ApprFlowEditorException("No 'actionCheck' is set.");
        }
    }
    
	function initTabItemView() {		
    	_.each(MainView.__tabViewKlassList__, function(TabItemView, i) {
    		var viewObj = new TabItemView({
    			model: this.model, 
    			isAdmin: this.isAdmin,
    			masterAuthModel : this.masterAuthModel, //appr_master.js
    			viewerType: this.viewerType, 
    			observer: this.observer,
			});
			if (this.options.defaultActiveTab === viewObj.getTabId()) viewObj.activate();
    		this.addItemView(viewObj);
    	}, this);
    	
    	this.listenTo(this.observer, 'changedTabItem', function(tabId) {
    		this.getTabElement(tabId).addClass('selectable');
    		this.$('.alert-modified').show();
    	});
	}
	
    function wrapLayerPopup() {
    	var self = this;
    	
    	var popupEl = $.goPopup({
            'pclass' : 'layer_normal detail_search_wrap layer_approval_line',
            'header' : lang['header'],
            'modal' : true,
            'width' : '900px',
            'buttons' : [{
                'btext' : lang['confirm'],
                'btype' : 'confirm',
                'autoclose' :false,
                'callback' : _.bind(onSaveButtonClicked, this)
            }, {
                'btext' : lang['cancel'],
                'btype' : 'cancel', 
                'callback' : function() {
                	self.remove();
                }
            }]
        });
    	
    	popupEl.find('.content').replaceWith(this.el);
    	popupEl.reoffset();
    	
    	return popupEl;
    }
    
    function initSideView() {
    	this.sideView = new BaseSideView({
    		el: this.$el.find('.aside-apprline'), 
    		observer: this.observer
    	});
    	
    	this.orgTreeSideView = new OrgTreeSideView({
    		docStatus: this.model.getDocStatus(),
    		dndDropTarget : '.appr-activity',
            isDndActive : true,
            observer: this.observer,
            multiCompanySupporting : this.model.get('actionCheck')['multiCompanySupporting'],
            isAdmin: this.isAdmin,
    		active: true,
            draggables : getDraggable.call(this),
            useDisableNodeStyle : false,
            useApprReception : false,
            useApprReference : false            
		});
    	
    	this.rcvOrgTreeDeptSideView = new ReceiverOrgTreeDeptSideView({
    		docStatus: this.model.getDocStatus(),
    		dndDropTarget : '.appr-activity',
            isDndActive : true,
            observer: this.observer,
            multiCompanySupporting : this.model.get('actionCheck')['multiCompanySupporting'],
            isAdmin: this.isAdmin,
    		active: true,
            draggables : getDraggable.call(this),
            useDisableNodeStyle : true,
            useApprReception : true,
            useApprReference : false,
		});
    	
    	this.rcvOrgTreeSideView = new ReceiverOrgTreeSideView({
    		docStatus: this.model.getDocStatus(),
    		dndDropTarget : '.appr-activity',
            isDndActive : true,
            observer: this.observer,
            multiCompanySupporting : this.model.get('actionCheck')['multiCompanySupporting'],
            receiveAllowType : this.model.getReceiveAllowType(),
            isAdmin: this.isAdmin,
            draggables : getDraggable.call(this),
            useDisableNodeStyle : true,
            useApprReception : true,
            useApprReference : false
		});
    	
    	this.refOrgTreeSideView = new RefererOrgTreeSideView({
    		docStatus: this.model.getDocStatus(),
    		dndDropTarget : '.appr-activity',
            isDndActive : true,
            observer: this.observer,
            multiCompanySupporting : this.model.get('actionCheck')['multiCompanySupporting'],
            receiveAllowType : 'ALL',
            isAdmin: this.isAdmin,
            draggables : getDraggable.call(this),
            useDisableNodeStyle : true,
            useApprReception : false,
            useApprReference : true
		});
    	
    	this.contactSideView = new ContactSideView({
    		docStatus: this.model.getDocStatus(),
    		dndDropTarget : '.appr-activity',
            isDndActive : true,
            observer: this.observer,
            isAdmin: this.isAdmin, 
            disabled: true
		});
    	
    	this.myApprSubscriberSideView = new MyApprSubscriberSideView({
    		docStatus: this.model.getDocStatus(),
    		observer: this.observer,
    	});
    	
    	// 조직도(멀티 컴퍼니 지원)
    	this.sideView.addItemView(this.orgTreeSideView);
    	this.sideView.addItemView(this.rcvOrgTreeDeptSideView);
    	this.sideView.addItemView(this.rcvOrgTreeSideView);
    	this.sideView.addItemView(this.refOrgTreeSideView);
    	this.sideView.addItemView(new MyApprLineSideView({
    		docStatus: this.model.getDocStatus(),
    		observer: this.observer,
    	}));
    	
    	this.sideView.addItemView(this.myApprSubscriberSideView);    	
    	this.sideView.addItemView(this.contactSideView);
    }
    
    function renderSideView() {
    	this.sideView.render();
    }
    
    function getDraggable(){
    	return 'a[nodeState != "DISABLE"][rel], ul.department_list > li > a[nodeState != "DISABLE"], ul.member_list > li > a[nodeState != "DISABLE"]';
    }
    
    function onSaveButtonClicked(popupEl) {
		/**
		 * GO-19238 CLONE - [스마트로] 결재선 지정시 최대 결재자수를 초과해 설정할수 있는 오류
		 * 확인 버튼 클릭시 최대 결재자수 Validation 로직 추가
		 */
		var apprFlowValid = true;
		if(this.viewerType === 'official_document'){ //이 컴포넌트를 공문서 목록에서 호출했을 경우이다.
			/*
			 * 공문서 관리자가 edit를 한적이 있고(관리자만 editing을 할수 있기 떄문에 docinfoChanged가 true인 경우는 현재 사용자는 관리자임)수신처가 아무도 없다면 저장시키지 말아야 한다.
			 */
			if(this.model.get('docInfoChanged')){
				var officialVersions = new ApprOfficialVersionCollection(this.model.docInfoModel.get('officialVersions'));
				if(officialVersions.isEmptyReceiver()){
					$.goMessage(lang['msg_receiver_add']);
					return false;
				}
			}
			this.remove();
			popupEl.close();
			// 복사본 반환
			this.onConfirmed(this.model);			
		}else{
			this.activityGroups = new ApprActivityGroupCollection(this.model.apprFlowModel.get('activityGroups'));
			this.activityGroups.each(function(activityGroupModel) {
				// 최대 허용 결재자 수 검사
				if (activityGroupModel.isExceedMaxApprovalCount()) {
					$.goMessage(lang['msg_max_approval_count_exceed']);
					apprFlowValid = false;
				}
			});

			if(apprFlowValid) {
				this.remove();
				popupEl.close();
				// 복사본 반환
				this.onConfirmed(this.model);
			}			
		}
    }
    
    function setViewLayout() {
    	var activeTabItemView = this.getActiveTabItemView();
    	var $wrap = this.$el.find('.set_wrap');
    	
    	if(activeTabItemView.editable()) {
    		this.sideView.show();
    		$wrap.removeClass('no_column');
    		
    		switch(activeTabItemView.getTabId()) {
        	case 'apprline':
        		this.sideView.enableTab('orgtree');
        		this.sideView.disableTab('depttree');
        		this.sideView.disableTab('rcvorgtree');
        		this.sideView.disableTab('reforgtree');
        		this.sideView.enableTab('myapprline');
        		this.sideView.disableTab('contact');
        		this.sideView.disableTab('mysubscriber');
        		
        		// orgtree 조직도가 선택되어 있음을 알림
        		this.orgTreeSideView.selected();
        		break;
        	case 'referer':
        		this.sideView.disableTab('orgtree');
        		this.sideView.disableTab('depttree');
        		this.sideView.disableTab('rcvorgtree');
        		this.sideView.enableTab('reforgtree');
        		this.sideView.disableTab('myapprline');
        		this.sideView.disableTab('contact');
        		this.sideView.enableTab('mysubscriber');
        		this.myApprSubscriberSideView.deselectSubscriber(); // highlight된 focus상태를 없앤다
        		this.sideView.activateTab('reforgtree');
        		this.refOrgTreeSideView.selected();
        		break;
        	case 'reader':
        		this.sideView.enableTab('orgtree');
        		this.sideView.disableTab('depttree');
        		this.sideView.disableTab('rcvorgtree');
        		this.sideView.disableTab('reforgtree');
        		this.sideView.disableTab('myapprline');
        		this.sideView.disableTab('contact');
        		this.sideView.enableTab('mysubscriber');
        		this.myApprSubscriberSideView.deselectSubscriber(); // highlight된 focus상태를 없앤다
        		this.sideView.activateTab('orgtree');
        		this.orgTreeSideView.selected();
        		break;
        	case 'receiver':
        		var receiveAllowType = this.model.getReceiveAllowType();
        		if(receiveAllowType == 'DEPARTMENT'){
            		this.sideView.disableTab('orgtree');
            		this.sideView.enableTab('depttree');
            		this.sideView.disableTab('rcvorgtree');
            		this.sideView.activateTab('depttree');
               		this.rcvOrgTreeDeptSideView.selected();
        		}else{
            		this.sideView.disableTab('orgtree');
            		this.sideView.disableTab('depttree');
            		this.sideView.enableTab('rcvorgtree');
            		this.sideView.activateTab('rcvorgtree');
            		this.rcvOrgTreeSideView.selected();
        		}
        		this.sideView.disableTab('reforgtree');		
        		this.sideView.disableTab('myapprline');
        		this.sideView.disableTab('contact');
        		this.sideView.enableTab('mysubscriber');        		
        		// activate 시켜줘야 한다.
        		this.myApprSubscriberSideView.deselectSubscriber(); // highlight된 focus상태를 없앤다
        		break;
        	case 'officialdoc':
        		this.sideView.disableTab('orgtree');
        		this.sideView.disableTab('depttree');
        		this.sideView.disableTab('rcvorgtree');
        		this.sideView.disableTab('reforgtree');
        		this.sideView.disableTab('myapprline');
        		this.sideView.enableTab('contact');
        		this.sideView.disableTab('mysubscriber');
        		// activate 시켜줘야 한다.
        		this.sideView.activateTab('contact');
        		this.contactSideView.selected();
        		break;
        	}
    	} else {
    		this.sideView.hide();
    		$wrap.addClass('no_column');
    	}
	}
    
    function setWrapClassname() {
    	var activeTab = this.getActiveTabItemView();
    	var tabId = activeTab.getTabId();
    	var classname = 'wrap_approval_agree';
    	var $wrap = this.$el.find('.set_wrap');
    	
    	if(tabId === 'apprline' || tabId === 'receiver' || tabId === 'referer' || tabId === 'reader') {
    		$wrap.addClass(classname);
    	} else {
    		$wrap.removeClass(classname);
    	}
    }

    return MainView;
});
define("approval/components/apprflow_editor/views/side/org_tree", [
	"approval/components/apprflow_editor/views/base_tab_item", 
	"approval/views/document/appr_tree", 
	
	"i18n!nls/commons"
], 

function(
	BaseTabItemView, 
	OrgTreeTabView, 
	
	commonLang
) {
	/**
     * 탭 뷰 (나의 결재선, 조직도 포함)
     */
    var OrgTreeSideView = BaseTabItemView.extend({
    	
    	id: "aside-orgtree", 
    	tabId: "orgtree",
    	// TODO: 다국어 처리
    	tabName: commonLang["조직도"], 
    	
    	type: 'node', 
    	multiCompanySupporting: false,
    	
    	orgTreeTabView: null, 
    	receiveAllowType : null,
    	initialize: function(options) {
    		options = options || {};
    		BaseTabItemView.prototype.initialize.apply(this, arguments);
    		
    		if(options.hasOwnProperty('docStatus')) {
    			this.docStatus = options.docStatus;
    		}
    		
    		if(options.hasOwnProperty('observer')) {
    			this.observer = options.observer;
    		}

    		this.useDisableNodeStyle = _.isBoolean(options.useDisableNodeStyle) ? options.useDisableNodeStyle : false;
            this.useApprReception = _.isBoolean(options.useApprReception) ? options.useApprReception : false;
            this.useApprReference = _.isBoolean(options.useApprReference) ? options.useApprReference : false;
            this.receiveAllowType = options.receiveAllowType || 'ALL';
    		if(options.hasOwnProperty('type')) {
    			this.type = options.type;
    		}
    		
    		if(options.hasOwnProperty('isDndActive')) {
    			this.isDndActive = options.isDndActive;
    		}
    		
    		if(options.hasOwnProperty('dndDropTarget')) {
    			this.dndDropTarget = options.dndDropTarget; 
    		}
    		
    		if(options.hasOwnProperty('isAdmin')) {
    			this.isAdmin = options.isAdmin;
    		}
    		
    		if(options.hasOwnProperty('multiCompanySupporting')) {
    			this.multiCompanySupporting = options.multiCompanySupporting;
    		}
    		
    		if(options.hasOwnProperty('draggables')) {
    			this.draggables = options.draggables;
    		}

    		this.observer.bind('addActivity', function(callback) {
    			if(!this.isActivated()) return;
    			if(!_.isFunction(callback)) return; 
                callback(this.getSelectedItem());
            }, this);
    	}, 
    	
    	/**
    	 * @Override
    	 */
    	render: function() {
    		var self = this;
    		// popup 그려지고 나서 호출되어야 하나... popup이 호출하자마자 그려지지 않는다.
    		// popup이 그려질 때까지 계속 체크한다.
    		if(this.$el.parents('body').length > 0) {
        		this.orgTreeTabView = new OrgTreeTabView({
                    'elementId' : this.getElID(),
                    "orgElId": this.getOrgElID(),
                    "searchResultElId": this.getSearchElID(),
                    'observer' : this.observer,
                    'isDndActive' : this.isDndActive,
                    'dndDropTarget' : this.dndDropTarget,
                    'multiCompanySupporting' : this.multiCompanySupporting,
                    'isAdmin': this.isAdmin, 
                    "type": this.type,
                    'draggables' : this.draggables,
                    'useDisableNodeStyle' : this.useDisableNodeStyle,
                    'useApprReception' : this.useApprReception,
                    'useApprReference' : this.useApprReference,
                    'receiveAllowType' : this.receiveAllowType
                });
    			this.orgTreeTabView.render();
    		} else {
    			setTimeout(function() {
        			self.render();
        		}, 100);
    		}
    	}, 
    	
        getSelectedItem: function() {
            if (this.orgTreeTabView.isShowing()) {
                return this.orgTreeTabView.getSelected();
            } else {
                return {};
            }
        },
    	
    	/**
    	 * @Override
    	 */
    	checkAuth: function() {
    		return true;
    	}, 
    	
    	/**
    	 * 아래의 메소드들은 $.goOrgTab이 싱글톤 객체여서 나타나는 문제점들을 보완하기 위해 추가된 함수
    	 * 조직도가 리팩토링이 된다면 제거대상이 될 함수들.
    	 */
    	getElID: function() {
    		return this.id;
    	}, 
    	
    	getType: function() {
    		return this.type;
    	}, 
    	
    	getOrgElID: function() {
    		return this.id + '-tree';
    	},
    	
    	getSearchElID: function() {
    		return this.id + '-search';
    	}, 
    	
    	getMultiCompanySupporting: function() {
    		return this.multiCompanySupporting;
    	},
    	
    	// 조직도 두개 이상을 호출했을 때 현재 선택된 조직도를 다시 로드하기 위한 함수
    	selected: function() {
    		this.render();
    	}
    });
    
    return OrgTreeSideView;
});
define("approval/components/apprflow_editor/views/base_tab", [
	"backbone", 
	"hogan"
], 

function(Backbone, Hogan) {
    var TAB_STATUS_ACTIVATED = 'activated';
    var TAB_STATUS_DEACTIVATED = 'deactivated';
    var SELCTOR_TABVIEW_PREFIX = '.tabview-';
    var SELECTOR_TAB_ALL = '[data-role=tab]';
    var SELECTOR_TABITEM_CONTAINER = '.tab-item-container';
    var TAB_EVENT_NS = '.apprFlowEditor.tab';
    
    /**
     * 결재 정보 레이어내의 탭형식의 뷰는 모두 이 추상 클래스를 상속받아야 함.
     */
	var BaseTabView = Backbone.View.extend({
		
		__tabItemViews__: {},
		__rendered__: false, 
		
		// tab 엘리먼트. 각 탭은 tabEl 엘리먼트의 하위에 추가된다.
		tabEl: '.apprflow-editor-tab',
		// tabView가 추가되는 엘리멘트. tabItemEl 엘리먼트 하위에 tabItemView가 추가된다.
		tabItemEl: SELECTOR_TABITEM_CONTAINER, 
		// 탭 템플릿
		itemTemplate: '<li><span class="txt">{{tabName}}</span></li>',
		// 활성화된 탭에 대한 클래스명 지정
		activeTabClassName: 'active', 
		
		initialize: function(options) {
			options = options || {};
			
			// 반드시 초기화해주어야 탭이 중복해서 그려지지 않는다.
			this.__tabItemViews__ = {};
			this.__rendered__ = false;
			
			if(options.tabEl) {
				this.tabEl = options.tabEl;
			}
			
			if(options.itemTemplate) {
				this.itemTemplate = options.itemTemplate;
			}
			
			// Backbone.View의 events 해시를 이용하게 되면, 
			// 상속받는 곳에서 events 해시를 오버라이딩하는 작업을 별도로 해야 하므로 번거롭다.
			// tab관련 이벤트는 events 해시를 이용하지 않고 수행한다.
			bindTabEvent.call(this);
		}, 
		
		remove: function() {
			this.__tabItemViews__ = {};
			this.__rendered__ = false;
			
			unbindTabEvent.call(this);
			clearTabViews.call(this);
			
			Backbone.View.prototype.remove.apply(this, arguments);
		}, 
		
		/**
		 * @Override
		 * 하위뷰에서 오버라이드시 반드시 상위render를 불러야 한다.
		 */
		render: function() {
			renderTab.call(this);
			this.activateTab();
		}, 
		
    	
        /**
         * @param ApprFlowTabView tabView ApprFlowTabView 인스턴스
         */
        addItemView: function(/*BaseItemView*/tabItemView) {
        	if(!tabItemView.usable()) return;
        	this.__tabItemViews__[tabItemView.getTabId()] = tabItemView;
        }, 
        
        getItemViews: function() {
        	return this.__tabItemViews__;
        }, 
        
        getItemView: function(tabId) {
        	var result;
        	_.each(this.__tabItemViews__, function(tabItemView) {
        		if(tabItemView.getTabId() === tabId) {
        			result = tabItemView;
        		}
        	}, this);
        	
        	return result;
        }, 
        
        getItemViewAt: function(index) {
        	return _.values(this.__tabItemViews__)[index];
        },
        
        getTabElement: function(tabId) {
        	return this.$(SELECTOR_TAB_ALL + '[data-tabid=' + tabId + ']');
        }, 
        
        getTabElements: function() {
        	return this.$(SELECTOR_TAB_ALL);
        }, 
        
        disableTab: function(tabId) {
        	var $tab = this.getTabElement(tabId);
        	var tabItemView = this.getItemView(tabId);
        	
        	tabItemView.disable();
        	
        	if(tabItemView.isActivated()) {
        		var firstTabItemView = _.first(_.values(this.__tabItemViews__));
        		this.activateTab(firstTabItemView.getTabId());
        	}
        	this.render();
        },
        
        enableTab: function(tabId) {
        	var tabItemView = this.getItemView(tabId);
        	
        	tabItemView.enable();
        	this.render();
        }, 
        
        activateTab: function(targetTabId) {
        	if(_.isUndefined(targetTabId)) {
        		var curActiveTab = getActiveTabItemView.call(this);
        		targetTabId = curActiveTab.getTabId();
        	} 
        	
        	_.each(this.__tabItemViews__, function(tabItemView) {
        		if(tabItemView.getTabId() === targetTabId) {
        			tabItemView.toggle(true);
        			activateTabItemView.call(this, tabItemView);
        		} else {
        			tabItemView.toggle(false);
        		}
        	}, this);
        	toggleTab.call(this);
        }, 
        
        getActiveTabItemView: function() {
        	return getActiveTabItemView.call(this);
    	}
    	    	
    }, {
    	TAB_STATUS_ACTIVATED: TAB_STATUS_ACTIVATED, 
    	TAB_STATUS_DEACTIVATED: TAB_STATUS_DEACTIVATED
    });
	
	// private members
	function renderTab() {
		var compiledTpl = Hogan.compile(this.itemTemplate);
		var $tabContainer = this.$el.find(this.tabEl);
		
		$tabContainer.empty();
		_.each(this.getItemViews(), function(tabItemView, tabId) {
			if(tabItemView.isEnabled()) {
				var $tab = $(compiledTpl.render({
					"tabId": tabId, 
					"tabName": tabItemView.tabName
				}));
				
				$tab.attr('data-role', 'tab');
				$tab.attr('data-tabid', tabId);
				
				$tabContainer.append($tab);
			}
			
		}, this);
	}
	
	function clearTabViews() {
		_.each(this.getItemViews(), function(tabItemView) {
			var tabId = tabItemView.getTabId();
			tabItemView.remove();
			delete this.__tabItemViews__[tabId];
		}, this);
	}
	
	function activateTabItemView(activeView) {
		if(_.isUndefined(activeView)) {
			activeView = getActiveTabItemView.call(this);
		}
		
		if(activeView && this.$el.find(SELCTOR_TABVIEW_PREFIX + activeView.getTabId()).length < 1) {
			this.$el.find(this.tabItemEl).append(activeView.el);
			activeView.render();
		}
	}
	
	function getActiveTabItemView() {
		var activeView;
		
		_.each(this.getItemViews(), function(tabItemView) {
			if(tabItemView.isActivated()) {
				activeView = tabItemView;
			}
		}, this);
		
		if(!activeView) {
			activeView = this.getItemViewAt(0);
			activeView.activate();
		}
		
		return activeView;
	}
	
	function toggleTab() {
		_.each(this.getItemViews(), function(tabItemView) {
			if(!tabItemView.isEnabled()) return;
			
			var $tab = this.getTabElement(tabItemView.getTabId());
			
			if(tabItemView.isActivated()) {
				$tab.addClass(this.activeTabClassName);
			} else {
				$tab.removeClass(this.activeTabClassName);
			}
		}, this);
	}
	
	function bindTabEvent() {
		this.$el.on("click" + TAB_EVENT_NS, SELECTOR_TAB_ALL, _.bind(onClickedTab, this))
	}
	
	function onClickedTab(e) {
    	var $tab = $(e.currentTarget);
    	
    	e.preventDefault();
    	this.activateTab($tab.data('tabid'));
    	// 하위에 탭뷰를 포함할 경우가 있으므로 이벤트 전파를 막는다.
    	e.stopPropagation();
    }
	
	function unbindTabEvent() {
		this.$el.off(TAB_EVENT_NS);
	}
	
	return BaseTabView;
});
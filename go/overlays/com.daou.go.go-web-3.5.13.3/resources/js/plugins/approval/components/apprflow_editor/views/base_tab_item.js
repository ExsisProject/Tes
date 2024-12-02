define("approval/components/apprflow_editor/views/base_tab_item", [
	"backbone"
], 

function(
	Backbone 
) {
    var TAB_STATUS_ACTIVATED = 'activated';
    var TAB_STATUS_DEACTIVATED = 'deactivated';
    
    /**
     * ApprFlowBaseTabItemView
     * 결재 정보 레이어내의 탭내에 위치하는 뷰는 모두 이 추상 클래스를 상속받아야 함.
     */
	var BaseTabItemView = Backbone.View.extend({
    	__status__: TAB_STATUS_DEACTIVATED, 
    	__enabled__: true, 
    	
    	tabId: 'undefined', 
    	tabName: 'undefined', 
    	
    	initialize: function(options) {
    		options = options || {};
    		this.$el.addClass('tabview-' + this.getTabId());
    		
    		if(options.active) {
    			this.setActiveStatus(true);
    		}
    		
    		if(options.disabled) {
    			this.disable();
    		}    		
    	}, 
    	
    	render: function() {
    		// render
    	}, 
    	
    	getTabId: function() {
    		return this.tabId;
    	}, 
    	
    	getTabName: function() {
    		return this.tabName;
    	}, 
    	
    	/**
    	 * activate
    	 * 뷰를 활성화 시킨다.
    	 */
    	activate: function() {
    		this.$el.show();
    		this.setActiveStatus(true);
    	}, 
    	
    	/**
    	 * deactivate
    	 * 뷰를 비활성화 시킨다.
    	 */
    	deactivate: function() {
    		this.$el.hide();
    		this.setActiveStatus(false);
    	}, 
    	
    	setActiveStatus: function(/*boolean*/isActivated) {
    		if(isActivated) {
    			this.__status__ = TAB_STATUS_ACTIVATED;
    		} else {
    			this.__status__ = TAB_STATUS_DEACTIVATED;
    		}
    	}, 
    	
    	isActivated: function() {
    		return this.__status__ === TAB_STATUS_ACTIVATED;
    	}, 
    	
    	enable: function() {
    		this.__enabled__ = true;
    	},
    	
    	disable: function() {
    		this.__enabled__ = false;
    	}, 
    	
    	isEnabled: function() {
    		return this.__enabled__;
    	},
    	
    	/**
    	 * @param boolean activated 뷰를 활성화할 것인지의 여부를 판단해서 처리
    	 */
    	toggle: function(activated) {
    		if(activated) {
    			this.activate();
    		} else {
    			this.deactivate();
    		}
    	}, 
    	
    	/**
    	 * 변경 권한 검사.
    	 * 해당뷰에 대한 변경 권한이 있는지 여부 반환
    	 */
    	editable: function(/*args...*/) {
    		return true;
    	}, 
    	
    	/**
    	 * 사용 권한 검사
    	 * 해당뷰에 대한 사용 권한이 있는지 여부 반환
    	 */
    	usable: function() {
    		return true;
    	}
    });
	
	return BaseTabItemView;
});
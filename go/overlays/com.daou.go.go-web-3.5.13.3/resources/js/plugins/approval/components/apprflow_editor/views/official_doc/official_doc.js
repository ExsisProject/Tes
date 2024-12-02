define("approval/components/apprflow_editor/views/official_doc/official_doc", [
	"approval/components/apprflow_editor/views/base_tab_item", 
	
	"hgn!approval/components/apprflow_editor/templates/tab/layout",
	"text!approval/components/apprflow_editor/templates/tab/header_email.html",

	"approval/components/apprflow_editor/views/official_doc/activity_groups",
	"approval/components/apprflow_editor/views/activity_list/activity_docinfo",
	
	"approval/collections/appr_official_version",
	"approval/models/appr_official_version",
	"hgn!approval/components/apprflow_editor/templates/activity_list/activity_docinfo_email", 
	
	"i18n!nls/commons",
	"i18n!nls/user",
	"i18n!approval/nls/approval", 
	
	"jquery.go-popup"
], 

function(
	BaseTabItemView,
	
	TabViewLayoutTpl,
	HeaderEmailTpl,
	
	ActivityGroupsView,
	ActivityDocInfoView,
	
    ApprOfficialVersionCollection,
    ApprOfficialVersionModel,
	ActDocinfoEmailTpl, 
	
	commonLang,
	userLang,
	apprLang
) {	
	var lang = {
		"name": commonLang["이름"], 
		"email": commonLang["이메일"],
		"company": userLang["회사"],
		"remove": commonLang["삭제"]
	};
	
	/**
     * 공문서 수신처 뷰
     */
    var OfficialDocTabItemView = BaseTabItemView.extend({
    	className: 'set_data ', 
    	
    	tabId: 'officialdoc', 
    	tabName: apprLang["공문서 수신처"],  
    	
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

    	/**
    	 * @Override 
    	 */
    	render: function() {
    		this.activityGroupsView.render();
    	}, 
    	
    	/**
    	 * @Override
    	 * approval/models/document.js의 API를 이용하여 권한검사
    	 */
    	editable: function() {
    		if(this.model.isStatusReturned()) {
    			return false;
    		}
    		
    		return (
				this.viewerType === 'docmaster' || 
				this.viewerType === 'officialdocmaster' ||
				this.viewerType === 'official_document' ||
				this.model.Permission.canEditOfficialDocList()
			);
    	}, 
    	
    	/**
    	 * @Override
    	 */
    	usable: function() {
    		return this.model.Permission.canUseOfficialDocList() || this.viewerType === 'official_document';
    	}, 
    	
    	/**
    	 * @Override
    	 */
    	activate: function() {
    		BaseTabItemView.prototype.activate.apply(this, arguments);
    		this.activityGroupsView.activate();
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
    		"activityHeader": HeaderEmailTpl
    	}));
    }
    
    function initActivityGroupsView() {
		this.activityGroupsView = new ActivityGroupsView({
			el: this.$el.find('.list_approval_line_wrap'), 
			model: this.model, 
			disable: !this.editable(),
			viewerType : this.viewerType,
            observer: this.observer
        });
		
	}
    
    return OfficialDocTabItemView;
});
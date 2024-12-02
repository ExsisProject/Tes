define("approval/components/apprflow_editor/views/side/contact", [
	"approval/components/apprflow_editor/views/side/org_tree", 
	
	"i18n!approval/nls/approval"
], 

function(
	OrgTreeTabView,
	
	approvalLang
) {
	/**
     * 탭 뷰 (나의 결재선, 조직도 포함)
     */
    var ContactSideView = OrgTreeTabView.extend({
    	id: "aside-contact", 
    	tabId: "contact",
    	// TODO: 다국어 처리
    	tabName: approvalLang["공용주소록"], 
    	type: 'contact'
    });
    
    return ContactSideView;
});
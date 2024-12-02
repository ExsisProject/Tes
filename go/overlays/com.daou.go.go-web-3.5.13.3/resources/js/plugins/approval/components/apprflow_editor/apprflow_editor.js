define("approval/components/apprflow_editor/apprflow_editor", [
	"approval/components/apprflow_editor/views/main",
	"approval/components/apprflow_editor/views/apprline/apprline", 
	"approval/components/apprflow_editor/views/referer/referer",
	"approval/components/apprflow_editor/views/receiver/receiver", 
	"approval/components/apprflow_editor/views/reader/reader", 
	"approval/components/apprflow_editor/views/official_doc/official_doc"
], 

function(
	MainView, 
	ApprLineTabItemView, 
	RefererTabItemView, 
	ReceiverTabItemView, 
	ReaderTabItemView, 
	OfficialDocTabItemView
) {
	
    // TabView 등록
	// 결재선
    MainView.addTabView(ApprLineTabItemView);
    // 참조자
    MainView.addTabView(RefererTabItemView);
    // 수신자
    MainView.addTabView(ReceiverTabItemView);
    // 열람자
    MainView.addTabView(ReaderTabItemView);
    // 공문서 수신처
    MainView.addTabView(OfficialDocTabItemView);
    
    // MainView를 그대로 반환한다.
	return MainView;
	
});
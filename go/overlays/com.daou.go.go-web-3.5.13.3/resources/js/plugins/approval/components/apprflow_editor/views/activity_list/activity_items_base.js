define("approval/components/apprflow_editor/views/activity_list/activity_items_base", [
	"backbone"
], 

function(
	Backbone
) {
	
	/**
	 * ActivityGroupView의 activities를 그리기 위한 뷰
	 */
	var BaseActivityItemsView = Backbone.View.extend({
		addItem: function(item) {
			// 구현체에서 구현
		}
	});
	
	return BaseActivityItemsView;
});
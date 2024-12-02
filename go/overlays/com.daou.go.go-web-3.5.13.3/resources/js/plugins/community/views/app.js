define([
    "backbone", 
    "app", 
    "community/views/list_tab"
], 
    
function(
    Backbone, 
    App, 
    listTab
) {
    var instance = null;
	var AppView = Backbone.View.extend({
		el : '#content',
		
		/**
		 * @Override
		 * el로 외부에 있는 엘리먼트에 체결하였으므로, 엘리먼트를 지우지 않고 이벤트만 해제하도록 한다.
		 */
		remove: function() {
			this.$el.empty();
			this.undelegateEvents();
		},

		render: function() {
			listTab.render();
		}
	});

	return AppView;
});
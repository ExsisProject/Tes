define("approval/components/apprflow_editor/views/side", [
	"approval/components/apprflow_editor/views/base_tab"
], 

function(
	BaseTabView, 
	OrgTreeTabItemView, 
	MyApprLineTabItemView
) {
	
	var BaseSideView = BaseTabView.extend({
		tabEl: '.sidetab', 
		tabItemEl: '.sidetab-item', 
		itemTemplate: '<li><a href="#" data-bypass><span class="txt">{{tabName}}</span></a></li>', 
		activeTabClassName: 'selected', 
		
		initialize: function(options) {
			options = options || {};
			
			BaseTabView.prototype.initialize.apply(this, arguments);
		}, 
		
		render: function() {
			var tabEls, len = 0;
			
			BaseTabView.prototype.render.apply(this, arguments);
			tabEls = this.getTabElements();
			len = tabEls.length;
			
			if(len > 1) {
				$(_.first(tabEls)).addClass('first');
				$(_.last(tabEls)).addClass('last');
			} else if(len === 1) {
				$(_.last(tabEls)).addClass('last');
			}
		}, 
		
		show: function() {
			this.$el.show();
		}, 
		
		hide: function() {
			this.$el.hide();
		}, 
		
		addItemView: function(/*BaseItemView*/tabItemView) {
			BaseTabView.prototype.addItemView.apply(this, arguments);
        }, 
	});
	
	
	return BaseSideView;
});
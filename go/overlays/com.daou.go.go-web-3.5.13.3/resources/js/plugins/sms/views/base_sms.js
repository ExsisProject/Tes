define('sms/views/base_sms', function(require) {
	
	var Backbone = require('backbone');
	var LayoutView = require('sms/views/layouts/default');
	var ContentTopView = require('sms/views/content_top');
	var HomeSide = require("sms/views/side");
	
	var BaseSmsView = Backbone.View.extend({
		
	    className: 'content_page',

		initialize: function(options) {
			options = options || {};
			this.layoutView = new LayoutView();		
		}, 
		
		render: function() {
			
			var self = this;
			var layoutView = this.layoutView;
			
			layoutView.render()
			self._renderSide(layoutView)
			
			var contentTopView = new ContentTopView({	
	        });
			
	        layoutView.getContentElement().html(contentTopView.el);
	        contentTopView.render();
	        layoutView.setContent(self);
			
			return this;
		}, 
		
		_renderSide : function(layoutView) {
			this.sideView = new HomeSide({
			});
				
			layoutView.getSideElement().empty().append(this.sideView.el);
			this.sideView.render();
		}		
	});
	
	return BaseSmsView;
});
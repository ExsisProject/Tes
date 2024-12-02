define('sms/views/layouts/default', function(require) {
	
	var DefaultLayout = require('views/layouts/default');
	
	var SmsDefaultLayout = DefaultLayout.extend({
		
	    className: 'go_skin_default', 
		
		sideView: null, 
		contentTopView: null, 
		
		initialize: function() {
			DefaultLayout.prototype.initialize.apply(this, arguments);
			this.sideView = null;
			this.contentTopView = null;
		},
		
		render: function() {
			
			var self = this;
			self.appName = 'sms';
			
			DefaultLayout.prototype.render.call(this, arguments);
			self.getContentElement().empty();
		    self.getSideElement().empty();
		    
			return this;
		}
	});

	
	return SmsDefaultLayout;
});
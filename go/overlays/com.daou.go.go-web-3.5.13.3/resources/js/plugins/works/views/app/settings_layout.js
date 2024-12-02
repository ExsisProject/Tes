define('works/views/app/settings_layout', function(require) {
	// dependency
	var FullpageLayout = require('views/layouts/fullpage');

	var WorksSettingsLayoutView = FullpageLayout.extend({
		name: "works-settings", 
		contentTopView: null, 
		
		initialize: function() {
			FullpageLayout.prototype.initialize.apply(this, arguments);
			
			this.contentTopView = null;
		},
		
		render: function() {
			this.getBodyElement().empty();
			
			return FullpageLayout.prototype.render.call(this, arguments);
		},
		
        /**
         * @Override
         */
        remove: function() {
        	FullpageLayout.prototype.remove.apply(this, arguments);
        	this.contentTopView.remove();
        }
	});
	
	return WorksSettingsLayoutView;
});
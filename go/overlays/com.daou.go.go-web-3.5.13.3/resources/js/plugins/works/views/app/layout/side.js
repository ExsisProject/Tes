define('works/views/app/layout/side', function(require) {
	
	// dependency
	var Backbone = require('backbone');
	var GO = require('app');
	var renderTemplate = require('hgn!works/templates/app/side');
	
	var WorksSideView = Backbone.View.extend({
		initialize: function() {
			initRender.call(this);
		}
	});
	
	// private methods
	function initRender() {
		this.$el.html(renderTemplate({
			"appName": '업무 2.0', 
			"contextRoot": GO.config('contextRoot')
		}));
	}
	
	return WorksSideView;
});
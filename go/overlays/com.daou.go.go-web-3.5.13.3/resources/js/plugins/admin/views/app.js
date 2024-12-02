(function() {
	define([
	        "backbone",
	        "app",
	        "admin/views/side",
	        "admin/views/company_info"
	        ],
	function(
			Backbone,
			App,
			side,
			content
	) {
		var AppView = Backbone.View.extend({
			initialize: function() {
				console.log('admin app.js initialize');
				return false;
			},
			
			render: function() {
				console.log('admin app.js render');
			}
		},{
			__instance__: null
		});
		return AppView;
	});
}).call(this);

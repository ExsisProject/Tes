(function() {
	
	define(["backbone", "dashboard/models/dashboard"], function(Backbone, Dashboard) {
		var Dashboards;
		
		Dashboards = Backbone.Collection.extend({
			model: Dashboard, 
			comparator : 'seq', 
			
			url: function() {
				return '/api/dashboard';
			}, 
			
			activate: function(dashboardId) {
				this.each(function(model) {
					model.activateFrom(dashboardId);
				});
			}, 
			
			getActiveDashboard: function() {
				return this.filter(function(model) {
					return model.activated();
				})[0];
			}, 
			
			resetActivated: function() {
				this.at(0).activate();
			}
		});
		
		return Dashboards;
	});
	
})();
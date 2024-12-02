(function() {
	
	define(["backbone", "app"], function(Backbone, GO) {
		
		var DashboardModel = Backbone.Model.extend({
			urlRoot: '/api/dashboard', 
			
			getBoxCount: function() {
				return this.get('boxCount') || 2;
			}, 
			
			getLayoutOption: function() {
				return getLayoutOption(this.get('layout'));
			}, 
			
			fetchCompanyDashboard: function(options) {
				return this.fetch(_.extend(options || {}, {
					url: (GO.config('contextRoot') + _.result(this, 'urlRoot') + '/company').replace('//', '/')
				}));
			}, 
			
			setLayout: function(layoutId) {
				this.set({'layout': layoutId, "boxCount": getLayoutOption(layoutId).boxCount});
			}
		});
		
		// TODO: 레이아웃 메커니즘 변경(우선, 8.3에 임시 대응)
		// save 시 layout이 2이면 boxCount를 3으로 강제로 설정해야 한다.
		function getLayoutOption(layout) {
			var strLayout = layout + '', 
				option = {
					"1": {
						// null이면 레이아웃 기본 클래스를 사용
						"className": null, 
						"useSide": true, 
						"useContentWrapper": true, 
						"boxCount": 2
					}, 
					
					"2": {
						"className": 'go_skin_home_default', 
						"useSide": false, 
						"useContentWrapper": false, 
						"boxCount": 3
					}
				};
			
			if(!option[strLayout]) {
				layout = '1';
			}
			
			return option[strLayout];
		}
		
		return DashboardModel;
		
	});
	
})();
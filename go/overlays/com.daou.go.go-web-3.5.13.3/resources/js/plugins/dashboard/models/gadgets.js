(function() {
	
	define(["backbone", "dashboard/models/gadget"], function(Backbone, Gadget) {
		
		var Gadgets;
		
		Gadgets = Backbone.Collection.extend({
			model: Gadget, 
			dashboardId: null, 
			
			url: function() {
				return ['/api/dashboard', this.getDashboardId(), 'gadget'].join('/');
			}, 
			
			setDashboardId: function(newId) {
				this.dashboardId = newId;
			}, 
			
			getDashboardId: function() {
				return this.dashboardId;
			}, 
			
			/**
			 * 컬렉션의 sortBy 대신 boxNumber와 boxOrder 두가지 조건을 비교하기 위해 직접 sort 함수를 사용한다. 
			 */
			rawSort: function() {				
				this.models.sort(function( a, b ) {
	                if( a.get('boxNumber') !== b.get('boxNumber') ) { return a.get('boxNumber') - b.get('boxNumber'); }
	                if( a.get('boxOrder') !== b.get('boxOrder') ) { return a.get('boxOrder') - b.get('boxOrder'); }
	                
	                return -1;
	            });
				
				return this;
			}
		});
		
		/**
		 * [ Factory Class ]
		 * Gadget 컬렉션은 반드시 dashboard와 연결되므로 직접 컬렉션 객체를 생성못하도록 한다.
		 */
		return {
			create: function(dashboardId, gadgets) {
				var gadgets = new Gadgets(gadgets || []);
				gadgets.setDashboardId(dashboardId);
				return gadgets;
			}
		};
	});
	
})();
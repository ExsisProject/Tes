(function() {
	
	define(function() {
		
		return {
			
			index: function() {
				require(["dashboard/views/site/layout", "dashboard/views/site/app"], function(Layout, DashboardAppView) {
					Layout.render().done(function(layout) {
                    	var dashboadAppView = new DashboardAppView();               		
                    	layout.getBodyElement().empty().append(dashboadAppView.el);
                    });
                });
			},
			search : function() {
				require(["dashboard/views/search/search_results", "dashboard/views/search/defaults"], function(SearchResultsView, DefaultLayout) {
					DefaultLayout.render().done(function(layout) {

						var content = layout.getContentElement();
						layout.sideInit();
						layout.renderSide();
						var searchResultsView = new SearchResultsView();
						content.html(searchResultsView.render().el);
					});
				});
			},
			appsearch : function() {
				require(["dashboard/views/search/app_search_results", "dashboard/views/search/defaults"], function(SearchResultsView, DefaultLayout) {
					DefaultLayout.render().done(function(layout) {
						var content = layout.getContentElement();
						layout.sideInit();
						layout.renderSide();
						var searchResultsView = new SearchResultsView();
						content.html(searchResultsView.render().el);
					});
				});
			}
			
		};
		
	});
	
})();
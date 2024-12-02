(function() {
	
	define([
        "survey/views/layouts/mobile"
    ],
    
    function(
		SurveyMobileLayout
    ) {
		var SurveyController = (function() {			
			function Controller() {
				this.layoutView = new SurveyMobileLayout();
			};
			
			Controller.prototype.dashboard = function() {
				var self = this;
				require(["survey/views/mobile/dashboard"], function(DashboardView) {
					self.layoutView.render().done(function(layout) {
						var dashboardView = layout.buildContentView(DashboardView);
						dashboardView.render();
					});
				});
			};
			
			Controller.prototype.list = function(category) {
				var self = this;
				
				require(["survey/views/mobile/list"], function(ListView) {
					self.layoutView.render().done(function(layout) {
						var listView = layout.buildContentView(ListView, { "filter": category }, true);
						listView.render();
					});
				});
			};
			
			Controller.prototype.detail = function(surveyId) {
				var self = this;
				
				require(["survey/views/mobile/detail"], function(DetailView) {

					self.layoutView.render().done(function(layout) {
						var detailView = layout.buildContentView(DetailView, {}, true);

						//GO-23154 폰트 사이즈 멀티구성 제거
						//layout.getContentElement().addClass('content');
						
						detailView.model.set('id', surveyId);
						detailView.render();
					});
				});
			};
			
			Controller.prototype.modifyResponse = function(surveyId) {
				var self = this;
				
				require(["survey/views/mobile/detail"], function(DetailView) {
					self.layoutView.render().done(function(layout) {
						var detailView = layout.buildContentView(DetailView, {}, true);

						//GO-23154 폰트 사이즈 멀티구성 제거
						//layout.getContentElement().addClass('content');
						
						detailView.setResponseView();
						detailView.model.set('id', surveyId);
						detailView.render();
					});
				});
	        };
			
			Controller.prototype.comments = function(surveyId) {
				var self = this;
				
				require(["survey/views/mobile/comment"], function(CommentView) {
					self.layoutView.render().done(function(layout) {
						var commentView = layout.buildContentView(CommentView, {}, true);
						
						layout.getContentElement().addClass('content photo_type'); 
						
						commentView.model.set('id', surveyId);
						commentView.render();
					});
				});
			};
			
			return Controller;
		})();
		
		return new SurveyController();
	});
	
}).call(this);
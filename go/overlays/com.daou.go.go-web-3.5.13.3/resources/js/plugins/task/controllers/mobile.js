(function() {
	
	define([
	        "views/layouts/mobile_default",
	        "task/views/mobile/side"
    ], 
    
    function(
    		MobileLayout,
    		SideView
    ) {
		var TaskController = (function() {
			var appName = "task";
			var LayoutView = MobileLayout.create();
			var SideMenuView = SideView.create(appName);
			
			var Controller = function() {
				
			};

			Controller.prototype = {
				renderSideMenu : function() {
					if($('body').data('sideApp') != appName) {
						SideMenuView.render().done(function(sideMenu) {
							var sideEl = LayoutView.getSideContentElement().append(sideMenu.el);
							GO.EventEmitter.trigger('common', 'layout:initSideScroll', this);
							sideEl.parent().hide();
						});
					} else {
						return;
					}
				},	
				
				render: function() {
					require(["task/views/mobile/home"], function(View) {
						LayoutView.render(appName).done(function(layout) {
							var view = new View();
							view.render();
							Controller.prototype.renderSideMenu();

						});
					});
				},
				
				taskList: function(folderId) {
					require(["task/views/mobile/task_list"], function(View) {
						LayoutView.render(appName).done(function(layout) {
							var view = new View({id : folderId});
							view.render();
							Controller.prototype.renderSideMenu();
						});
					});
				},
				
				taskDetail: function(taskId) {
					require(["task/views/mobile/task_detail"], function(View) {
						LayoutView.render(appName).done(function(layout) {
							var view = new View({id : taskId});
							layout.getContentElement().html(view.el);
							view.dataFetch().done(function(taskView) {
								taskView.render();
								layout.getSearchWrapElement().hide();
							});
						});
					});
				},
				
				createTask : function(folderId) {
					require(["task/views/mobile/task"], function(View) {
						LayoutView.render(appName).done(function(layout) {
							var view = new View({folderId : folderId});
							view.dataFetch().done(function(taskView) {
								taskView.render();
							});
						});
					});
				},
				
				editTask : function(taskId) {
					require(["task/views/mobile/task"], function(View) {
						LayoutView.render(appName).done(function(layout) {
							var view = new View({id : taskId});
							view.dataFetch().done(function(taskView) {
								taskView.render();
							});
						});
					});
				},
				
				createActivity : function(taskId) {
					require(["task/views/mobile/task_activity_form"], function(View) {
						LayoutView.render(appName).done(function(layout) {
							var view = new View({taskId : taskId});
							view.render();
						});
					});
				},

				taskActivities : function(taskId) {
					require(["task/views/mobile/task_activity"], function(View) {
						LayoutView.render(appName).done(function(layout) {
							var view = new View({taskId : taskId});
							view.render();
						});
					});
				},

				editActivity : function(taskId, activityId) {
					require(["task/views/mobile/task_activity_form"], function(View) {
						LayoutView.render(appName).done(function(layout) {
							var view = new View({
								taskId : taskId,
								activityId : activityId
							});
							view.render();
						});
					});
				},
				
				commentList : function(taskId, activityId) {
					require(["task/views/mobile/comment_list"], function(View) {
						LayoutView.render(appName).done(function(layout) {
							var view = new View({
								taskId : taskId,
								activityId : activityId
							});
							view.dataFetch().done(function() {
								view.render();
							});
						});
					});
				},
				
				searchResult : function() {
					require(["task/views/mobile/task_search_result"], function(View) {
						LayoutView.render(appName).done(function(layout) {
							var view = new View();
							Controller.prototype.renderSideMenu();
							layout.getContentElement().html(view.el);
							view.dataFetch().done(function() {
								view.render();
								view.renderResult();
							});
						});
					});
				}
			};
			
			return Controller;
		})();
		
		return new TaskController();
	});
	
}).call(this);
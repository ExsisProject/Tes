(function() {
	
	define([
	        "task/views/layouts/defaults"
    ], 
    
    function(
    		DefaultLayout
    ) {
		var TaskController = (function() {
			var Controller = function() {
				
			};

			Controller.prototype = {
				render : function(isForce) {
					require(["task/views/app"], function(View){
						var layout = DefaultLayout.create();
						layout.sideInit();
						layout.render().done(function(layout){
							var content = layout.getContentElement();
							var view = new View();
							content.html(view.el);
							view.render(isForce);
						});
					});
				},
				createFolder : function() {
					require(["task/views/task_folder"], function(View){
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var view = new View();
							content.html(view.el);
							view.dataFetch().done(function(folderView) {
								folderView.render();
							});
						});
					});
				},
				editFolder : function(folderId) {
					require(["task/views/task_folder"], function(View){
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var view = new View({id : folderId});
							content.html(view.el);
							view.dataFetch().done(function(folderView) {
								folderView.render();
							});
						});
					});
				},
				taskDetail : function(taskId) {
					require(["task/views/task_detail"], function(View){
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var view = new View({id : taskId});
							content.html(view.el);
							view.dataFetch().done(function(taskView) {
								taskView.render();
							});
						});
					});
				},
				taskPrint : function(taskId) {
					require(["task/views/task_detail", "task/views/print"], function(View, PrintView){
						var printView = new PrintView();
						var view = new View({
							id : taskId,
							isPrint : true
						});
						$("body").html(printView.render().el);
						printView.$el.html(view.el);
						view.dataFetch().done(function(taskView) {
							taskView.render();
							printView.print();
						});
					});
				},
				createTask : function(folderId) {
					require(["task/views/task"], function(View){
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var view = new View({folderId : folderId});
							// GO-16446 : Placeholder is required 발생 및 중복으로 Render 되는 이슈 방지
							content.html(view.el);
							view.dataFetch().done(function(taskView) {
								taskView.render();
							});
						});
					});
				},
				editTask : function(taskId) {
					require(["task/views/task"], function(View){
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var view = new View({id : taskId});
							// GO-16446 : Placeholder is required 발생 및 중복으로 Render 되는 이슈 방지
							content.html(view.el);
							view.dataFetch().done(function(taskView) {
								taskView.render();
							});
						});
					});
				},
				taskList : function(folderId) {
					require(["task/views/task_list"], function(View){
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var view = new View({id : folderId});
							content.empty().append(view.el);
							view.dataFetch().done(function() {
								view.render();
							});
						});
					});
				},
				folderAdministrate : function(deptId) {
					require(["task/views/folder_admin"], function(View){
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var view = new View({deptId : deptId});
							content.empty().append(view.el);
							view.dataFetch().done(function() {
								view.render();
							});
						});
					});
				},
				endTask : function(deptId) {
					require(["task/views/closed_folder_list"], function(View){
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var view = new View({deptId : deptId});
							content.empty().append(view.el);
							view.render();
						});
					});
				},
				subDeptTask : function(status) {
					require(["task/views/sub_dept_folder_list"], function(View){
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var view = new View({status : status});
							content.empty().append(view.el);
							view.dataFetch().done(function() {
								view.render();
							});
						});
					});
				},
				searchResult : function() {
					require(["task/views/task_search_result"], function(View){
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var view = new View();
							content.empty().append(view.el);
							view.dataFetch().done(function() {
								view.render();
								view.renderResult();
							}).fail(function() {
								view.render();
							});
						});
					});
				},
                calendar: function(deptId) {
                    require(["task/views/task_calendar"], function(View){
                        DefaultLayout.render().done(function(layout) {
                            var view = new View({
                                deptId: deptId
                            });
                            layout.getContentElement().empty().append(view.render().el);
                        });
                    });
                },
                taskPopup: function(taskId) {
                    require(["task/views/task_detail_popup"], function(View){
                        DefaultLayout.render().done(function(layout) {
                            layout.getSideElement().remove();
                            var view = new View({id : taskId});
                            var content = layout.getContentElement();
                            content.css('margin-left', '0px');
                            content.html(view.el);
                            view.dataFetch().done(function(taskView) {
                                taskView.render();
                            });
                        });
                    });
                },
                home: function() {
                    this.render(true);
                }
			};
			
			return Controller;
		})();
		
		return new TaskController();
	});
	
}).call(this);
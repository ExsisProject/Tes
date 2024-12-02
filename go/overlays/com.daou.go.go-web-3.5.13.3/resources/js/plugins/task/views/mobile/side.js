;(function() {
	define([
			"backbone",
			"app",
			
			"i18n!nls/commons",
			"i18n!task/nls/task",
	        "hgn!task/templates/mobile/side",
	        "task/collections/task_department_folders",
	        "task/views/mobile/side_dept",
	        "task/views/mobile/side_folder",
	        "admin/models/task_config",
	        "components/favorite/collections/favorite"
	], 
	function(
			Backbone,
			App,
			
			commonLang,
			taskLang,
	        SideTmpl,
	        TaskDeptFolders,
	        SideDeptView,
	        SideFolderView,
	        TaskConfigModel,
	        Favorites
	) {
		var lang = {
				"task" : taskLang["업무"],
				"newTask" : taskLang["새 업무"],
				"deptFolder" : taskLang["부서별 업무 폴더"],
				"addFolder" : taskLang["업무 폴더 추가"],
				"companyFolder" : taskLang["전사 업무 폴더"],
				"favorite" : commonLang["즐겨찾기"]
		};
		
		
		var TaskSideView = Backbone.View.extend({
			events : {
				"vclick li[data-id]" : "moveToFolder"
			},
			
			
			initialize : function() {
				this.deptFolders = new TaskDeptFolders({type : "dept"});
				this.companyFolders = new TaskDeptFolders({type : "public"});
				this.favorites = Favorites.get({url : GO.contextRoot + "api/task/folder/favorite"});
				this.model = TaskConfigModel.read({admin : false}).toJSON();
				
				GO.config("attachNumberLimit", this.model.attachNumberLimit);
				GO.config("attachSizeLimit", this.model.attachSizeLimit);
				GO.config("maxAttachNumber", this.model.maxAttachNumber);
				GO.config("maxAttachSize", this.model.maxAttachSize);
				GO.config("excludeExtension", this.model.excludeExtension ? this.model.excludeExtension : "");
				
			},
			
			
			render : function() {
				this.packageName = this.options.packageName;
				
				var self = this;
				var fetchDeptFolder = this.deptFolders.fetch();
				var fetchCompanyFolder = this.companyFolders.fetch();
				var fetFolderPresent = this.favorites.fetch();
				var deferred = $.Deferred();
			
				$.when(fetchDeptFolder, fetchCompanyFolder, fetFolderPresent).done(function() {
					self.$el.html(SideTmpl({
						lang : lang,
						hasFavorite : self.favorites.hasFavorite(),
						favorites : self.favorites.toJSON()
					}));
					if(!self.deptFolders.folderPresent()) {
						$("#commonWriteButton").hide();
					}
					self.renderDeptView(self.deptFolders, self.$el.find("#sideDeptList"), true);
					self.renderDeptView(self.companyFolders, self.$el.find("#companyList"), false);
//					self.$el.append("<div style='height:51px'></div>"); // mobileDefault bugFix
					
					self.setSideApp();
					
					deferred.resolveWith(self, [self]);
				});
	            
	            return deferred;
			},
			
			
			renderDeptView : function(collection, $el, subFlag) {
				_.each(collection.models, function(dept) {
					if (dept.isEmptyfolder()) return;
					var sideDeptView = new SideDeptView(dept);
					$el.append(sideDeptView.render().el);
					sideDeptView.renderFolders();
				}, this);
			},
			
			
			moveToFolder : function(e) {
				var folderID = $(e.currentTarget).attr("data-id");
				App.router.navigate("task/folder/" + folderID + "/task", true);
			},
			
			
			setSideApp : function() {
                $('body').data('sideApp', this.packageName);
            }
		}, {
            __instance__: null, 
            create: function(packageName) {
                this.__instance__ = new this.prototype.constructor({'packageName':packageName});//if(this.__instance__ === null) 
                return this.__instance__;
            }
        });
		
		return TaskSideView;
	});
}).call(this);
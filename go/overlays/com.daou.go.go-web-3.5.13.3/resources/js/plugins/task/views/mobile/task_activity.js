;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
			"views/mobile/header_toolbar",
	        "task/views/mobile/task_activity_item",
	        "task/collections/task_activities"
	], 
	function(
			Backbone,
			Hogan,
			App,
			
			commonLang,
			taskLang,
			HeaderToolbarView,
			TaskActivityItemView,
			TaskActivities
	) {

		var menus = {
			"활동기록등록" : {
				id : "btnWriteActivity",
				text: commonLang["등록"],
				triggerFunc : 'task-write-activity'
			}
		};
		
		
		var TaskActivityView = Backbone.View.extend({
			el : "#content",

			initialize : function(data) {
				this.taskId = data.taskId;
				this.activities = new TaskActivities({taskId : this.taskId});
				this.currentPage = 1;
				this.headerBindEvent();
			},

			dataFetch : function() {
				return this.activities.fetch();
			},

			headerBindEvent : function() {
				GO.EventEmitter.off('trigger-action');
				GO.EventEmitter.on('trigger-action','task-write-activity', this.goActivityCreate, this);
			},

			render : function() {
				var self = this;
				this.dataFetch().done(function () {
					self.models = self.activities.models;
					if(self.models.length == 0) {
						GO.router.navigate("task/" + self.taskId + "/detail", true);
					} else {
						self.renderActivity();
						self.renderHeaderToolBar();
					}
				});
				return this;
			},

			renderActivity : function() {
				var activity = this.models[this.currentPage-1];
				var taskActivityItem =  new TaskActivityItemView({model : activity, taskId : this.taskId});
				this.$el.empty().html(taskActivityItem.el);
				taskActivityItem.render();
				return this;
			},

			renderHeaderToolBar: function() {
				HeaderToolbarView.render({
					title : this.currentPage+"/"+this.models.length,
					actionMenu : this.getUseMenus(),
					isLeftBtn : this.currentPage > 1,
					leftBtnCallback : $.proxy(this._onClickPrevious, this),
					isRightBtn :  this.currentPage < this.models.length,
					rightBtnCallback : $.proxy(this._onClickNext, this),
					isClose : true
				});
			},

			getUseMenus : function() {
				var useMenuList = [];
				useMenuList.push(menus.활동기록등록);
				return useMenuList;
			},

			goActivityCreate : function(){
				App.router.navigate("task/" + this.taskId + "/create", true);
			},

			_onClickPrevious: function() {
				this.currentPage--;
				this.renderActivity();
				this.renderHeaderToolBar();
			},

			_onClickNext: function () {
				this.currentPage++;
				this.renderActivity();
				this.renderHeaderToolBar();
			}
		});
		return TaskActivityView;
	});
}).call(this);
;(function() {
	define([
			"backbone",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        "hgn!task/templates/todo_item",
	        "views/profile_card"
	], 
	function(
			Backbone,
			App,
			
			commonLang,
			taskLang,
			TodoItemTmpl,
			ProfileView
	) {
		var lang = {
				"activity" :taskLang["활동기록"],
				"dueDate" :taskLang["기한일"],
				"assignee" :taskLang["담당자"],
				"delay" : taskLang["지연"],
				"empty" : taskLang["미지정"]
		};
		
		
		var TodoItem = Backbone.View.extend({
			tagName : "li",
			
			events : {
				"click div[data-type=task]" : "goTaskDetail",
				"click #assigneeArea" : "popupProfile",
			},
			
			
			initialize : function(data) {
				this.task = data.task;
			},
			
			
			render : function() {
				this.$el.html(TodoItemTmpl({
					lang : lang,
					task : this.task.toJSON(),
					dueDate : this.task.getDueDate() || "-",
					activityFlag : this.task.hasActivity(),
					assignee : this.task.firstAssignee(),
					assigneeLabel : this.task.assigneeLabel(taskLang["외"], commonLang["명"]),
					isDelay : this.task.get("delay")
				}));
				this.$el.attr("id", this.task.get("id"));
				return this;
			},
			
			
			popupProfile : function(e) {
				if (!this.task.firstAssignee()) return;
				var target = e.currentTarget;
				var userId = $(target).attr("data-userId");
				ProfileView.render(userId, target);
				e.stopPropagation();
			},
			
			
			goTaskDetail : function() {
				if (!this.task.isReadable()) {
					$.goPopup({
						title : taskLang["접근 권한 확인"],
						message  : taskLang["접근 권한 없음 설명"],
						buttons : [{
							btype : "confirm",
							btext : commonLang["확인"],
							callback : function() {
							}
						}]
					});
					return;
				}
				
				GO.util.store.set("taskFolderId", null, {type : "session"});
				App.router.navigate("task/" + this.task.id + "/detail", true);
			}
		});
		return TodoItem;
	});
}).call(this);
;(function() {
	define([
			"backbone",
			"app",
			
			"i18n!nls/commons",
			"i18n!task/nls/task",
	        "hgn!task/templates/home",
	        "task/collections/todos",
	        "task/views/task_title",
	        "task/views/todo_item",
	        "jquery.go-preloader"
	], 
	function(
			Backbone,
			App,
			
			commonLang,
			taskLang,
	        HomeTmpl,
	        Todos,
	        TaskTitleView,
	        TodoItemView
	) {
		var lang = {
			"count" : taskLang["건"],	
			"total" : taskLang["총"],	
			"all" : commonLang["전체"],	
			"assign" : taskLang["담당업무"],	
			"approve" : taskLang["승인업무"],	
			"refer" : taskLang["참조업무"],
			"request" : taskLang["등록업무"],
			"showMore" : taskLang["더 보기"]
		};
		
		
		var emptyList =
			'<li>' +
				'<p class="data_null">' +
					'<span class="ic_data_type ic_no_contents"></span>' +
					'<span class="txt">' + taskLang["등록된 업무가 없습니다."] + '</span>' +
					'<br><br>' +
				'</p>' +				
			'</li>';
		
		
		var TaskHomeView = Backbone.View.extend({
			events : {
				"click #taskTypes li" : "renderTaskByType",
				"click #moreTodos" : "moreTodos"
			},
			
			
			initialize : function() {
				this.todos = new Todos();
			},
			
			
			dataFetch : function() {
				var self = this;
				var deferred = $.Deferred();
				
				this.todos.fetchAll().done(function() {
					self.type = "all";
					deferred.resolve();
				});
				
				this.initPreloader(deferred);
				
				return deferred;
			},
			
			
			initPreloader : function(deferred) {
				var preloader = $.goPreloader();
				
				deferred.progress(function() {
					preloader.render();
				});
				
				deferred.always(function() {
					preloader.release();
				});
				
				return deferred;
			},
			
			
			render : function() {
				this.$el.html(HomeTmpl({
					data : this.todos,
					lang : lang
				}));
				
				var taskTitleView = new TaskTitleView({
					title : taskLang["나의 업무"]
				});
				this.$el.find(".content_top").html(taskTitleView.el);
				taskTitleView.render();
				
				return this;
			},
			
			
			renderTodos : function() {
				if (this.todos.isEmpty()) $("#todoList").append(emptyList);
				
				_.each(this.todos.models, function(todo) {
					var todoItemView = new TodoItemView({
						task : todo,
						className : todo.get("read") ? "" : "read_no"
					});
					$("#todoList").append(todoItemView.render().el);
				});
				
				if (this.isEnd()) $("#moreTodos").hide();
			},
			
			
			renderTaskByType : function(e) {
				var self = this;
				var target = $(e.currentTarget);
				var type = target.attr("data-type");
				
				if (type == this.type) return;
				
				this.$("#taskTypes").find("li").removeClass("active");
				target.addClass("active");
				
				this.type = type;
				this.todos.setType(type);
				this.todos.setPage(0);
				
				var promise = this.todos.fetch({
					success : function() {
						$("#todoList").find("li").remove();
						$("#moreTodos").show();
						self.renderTodos();
					}
				});
				
				this.initPreloader(promise);
			},
			
			
			moreTodos : function() {
				var self = this;
				var page = this.todos.listOption.page;
				this.todos.setPage(page + 1);
				this.todos.fetch({
					success : function(resp) {
						self.renderTodos();
					} 
				});
			},
			
			
			isEnd : function() {
				return $("#todoList").find("li[id]").length == this.todos.page.total;
			}
		});
		return TaskHomeView;
	});
}).call(this);
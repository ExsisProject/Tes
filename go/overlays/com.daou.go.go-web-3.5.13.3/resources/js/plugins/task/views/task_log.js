;(function() {
	define([
			"backbone",
			"hogan",
			
	        "i18n!task/nls/task",
	        "task/collections/task_logs",
	        "task/views/task_log_item"
	], 
	function(
			Backbone,
			Hogan,
			
			taskLang,
			TaskLogs,
			TaskLogItemView
	) {
		var lang = {
				"history" :taskLang["변경이력"],
				"showMore" :taskLang["더 보기"]
		};
		
		
		var TaskLogTmpl = Hogan.compile(
			'<div class="reply_wrap">' +
				'<header class="single_title">' +
					'<span class="txt">{{lang.history}}</span>' +
					'<span class="num" id="logCount">{{count}}</span>' +
				'</header>' +
				'<div class="aside_wrapper_body">' +
					'<ul id="logList" class="type_simple_list simple_list_alarm">' +				
					'</ul>' +
					'<div id="moreLog" class="bottom_action">' +
						'<a class="btn_list_reload">' +
							'<span class="ic"></span>' +
							'<span class="txt">{{lang.showMore}}</span>' +
						'</a>' +
					'</div>' +			
				'</div>' +
			'</div>'
		);
		
		
		var TaskLogView = Backbone.View.extend({
			events : {
				"click #moreLog" : "moreLog"
			},
			
			
			initialize : function(data) {
				this.logs = new TaskLogs({id : data.taskId});
				
			},
			
			
			render : function() {
				var self = this;
				this.logs.fetch({
					success : function() {
						self.$el.html(TaskLogTmpl.render({
							count : self.logs.models.length,
							lang : lang
						}));
						self.renderLogs();
					}
				});
				return this;
			},
			
			
			renderLogs : function() {
				_.each(this.logs.models, function(log) {
					var logItemView = new TaskLogItemView(log);
					$("#logList").append(logItemView.render().el);
				});
				$("#logCount").text(this.logs.page.total);
				if (this.isEnd()) $("#moreLog").hide();
			},
			
			
			moreLog : function() {
				var self = this;
				var page = this.logs.page.page;
				this.logs.setPage(page + 1);
				this.logs.fetch({
					success : function(resp) {
						self.renderLogs();
					} 
				});
			},
			
			
			isEnd : function() {
				return $("#logList").find("li").length == this.logs.page.total;
			}
		});
		return TaskLogView;
	});
}).call(this);
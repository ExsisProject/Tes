;(function() {
	define([
			"backbone",
			"hogan",
			
			"i18n!nls/commons",
	        "calendar/collections/calendar_logs"
	], 
	function(
			Backbone,
			Hogan,
			
			commonLang,
			CalendarLogs
	) {
		var lang = {
				"history" :commonLang["변경이력"],
				"showMore" :commonLang["더보기"]
		};
		
		
		var emptyTpl = Hogan.compile(
			'<li>' +
				'<p class="desc">' +
					commonLang["변경이력이 없습니다."] + 
				'</p>' +
			'</li>'
		);
		
		
		var CalendarLogTmpl = Hogan.compile(
			'<div class="reply_wrap">' +
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
		
		
		var LogItemTmpl = Hogan.compile(
				'<p class="photo">' + 
					'<img src="{{log.actor.thumbnail}}" title="{{log.actor.name}} {{#log.actor.position}}{{log.actor.position}}{{/log.actor.position}}"  alt="{{log.actor.name}} {{log.actor.position}}">' +
				'</p>' +
				'<div class="info">' +
					'<p class="name">{{log.actor.name}} </p>' +
					'<span class="date">{{createdAt}}</span>' +
					'{{#messages}}' +
					'<p class="subject">{{{.}}}</p>' +
					'{{/messages}}' +
				'</div>'
			);
			
			var LogItemView = Backbone.View.extend({
				tagName : "li",
				
				
				events : {
				},
				
				
				initialize : function(data) {
					this.log = data;
				},
				
				
				render : function() {
					this.$el.html(LogItemTmpl.render({
						log : this.log.toJSON(),
						messages : this.log.contentParser(),
						createdAt : GO.util.basicDate(this.log.get("createdAt")) 
					}));
					return this;
				}
			});
		
		
		var CalendarLogView = Backbone.View.extend({
			events : {
				"click #moreLog" : "moreLog"
			},
			
			
			initialize : function(options) {
				this.logs = new CalendarLogs({
					calendarId : options.calendarId,
					eventId : options.eventId
				});
			},
			
			
			render : function() {
				var self = this;
				this.logs.fetch({
					success : function() {
						self.$el.html(CalendarLogTmpl.render({
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
					var logItemView = new LogItemView(log);
					$("#logList").append(logItemView.render().el);
				});
				$("#logCount").text(this.logs.page.total);
				if (this.isEnd()) $("#moreLog").hide();
				if (!this.logs.length) this.$("#logList").append(emptyTpl.render());
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
		return CalendarLogView;
	});
}).call(this);
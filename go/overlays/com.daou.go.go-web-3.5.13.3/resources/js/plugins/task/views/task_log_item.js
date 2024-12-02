;(function() {
	define([
			"backbone",
			"hogan",
			
	        "i18n!task/nls/task"
	], 
	function(
			Backbone,
			Hogan,
			
			taskLang
	) {
		var TaskLogItemTmpl = Hogan.compile(
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
		
		var TaskLogItem = Backbone.View.extend({
			tagName : "li",
			
			
			events : {
			},
			
			
			initialize : function(data) {
				this.log = data;
			},
			
			
			render : function() {
				this.$el.html(TaskLogItemTmpl.render({
					log : this.log.toJSON(),
					messages : this.log.contentParser(),
					createdAt : GO.util.basicDate(this.log.get("createdAt")) 
				}));
				return this;
			}
		});
		return TaskLogItem;
	});
}).call(this);
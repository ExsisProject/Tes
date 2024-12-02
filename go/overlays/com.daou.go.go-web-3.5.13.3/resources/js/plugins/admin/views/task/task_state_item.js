;(function() {
	define([
			"backbone",
			"hogan",
			
			"i18n!nls/commons",
			
			"hgn!admin/templates/task_flow_item"
	], 
	function(
			Backbone,
			
			Hogan,
			
			commonLang,
			
			TaskTypeTpl
	) {
		var TaskStateItemTpl = Hogan.compile(
			'<td class="state">{{model.name}}</td>' +
			'<td class="check">' +
				'<input type="checkbox" {{#model.end}}checked{{/model.end}}>' + 
			'</td>' +
			'<td class="action">' +
				'<span class="wrapBtn">' +
					'<span class="ic ic_delete" title="' + commonLang["삭제"] + '"></span>' +
				'</span>' +
			'</td>'
		);
		
		var TaskStateItemView = Backbone.View.extend({
			tagName : "tr",
			
			events : {
				"click input[type=checkbox]" : "setEndState"
			},
			
			initialize : function(options) {
				GO.EventEmitter.on("task", "reset:endState", function(model) {
					if (this.model == model) return;
					this.resetEndState();
				}, this);
				
				this.editable = options.editable;
			},
			
			
			render : function() {
				this.$el.html(TaskStateItemTpl.render({
					model : this.model.toJSON(),
					editable : this.editable
				}));
				this.$el.attr("data-type", "state");
				
				return this;
			},
			
			
			setEndState : function(e) {
				var target = $(e.currentTarget);
				var isEndState = target.is(":checked");
				if (!isEndState) {
					this.resetEndState();
					return;
				}
				GO.EventEmitter.trigger("task", "reset:endState", this.model);
				this.model.set("end", isEndState);
				this.$("input[type=checkbox]").attr("checked", true);
				
				console.log(this.model.get("name") + " => " + this.model.get("end"));
			},
			
			
			resetEndState : function() {
				this.model.set("end", false);
				this.$("input[type=checkbox]").attr("checked", false);
				console.log(this.model.get("name") + " => " + this.model.get("end"));
			}
		});
		
		return TaskStateItemView;
	});
}).call(this);
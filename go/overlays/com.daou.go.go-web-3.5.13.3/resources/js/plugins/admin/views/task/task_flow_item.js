;(function() {
	define([
			"backbone",
			
			"i18n!nls/commons",
			"i18n!admin/nls/admin",
			
			"hgn!admin/templates/task_flow_item"
	], 
	function(
			Backbone,
			
			commonLang,
			adminLang,
			
			FlowItemTpl
	) {
		var lang = {
			"firstRegistration" : adminLang["최초등록"],
			"select" : commonLang["선택"],
			"select" : commonLang["선택"],
			"add" : commonLang["추가"],
			"delete" : commonLang["삭제"]
		};
		
		
		var TaskFlowItemView = Backbone.View.extend({
			tagName : "tr",
			
			events : {
				"change select" : "changeState",
				"click input[type=checkbox]" : "setRoles",
				"focusout input[type=text]" : "setActionName"
			},
			
			initialize : function(options) {
				GO.EventEmitter.on("task", "change:states", function(collection) {
					this.renderStates(collection);
				}, this);
				this.isFirst = this.model.isFirst();
				this.roles = options.roles;
			},
			
			
			render : function() {
				this.$el.html(FlowItemTpl({
					lang : lang,
					model : this.model.toJSON(),
					isFirst : this.isFirst,
					roles : this.roles,
					cid : this.cid
				}));
				this.renderStates(this.collection);
				this.renderRoles();
				this.$el.attr("data-type", "flow");
				
				return this;
			},
			
			
			renderStates : function(states) {
				_.each(["before", "next"], function(type) {
					var stateName = this.model.get(type + "Status");
					var listEl = this.$("select[data-type=" + type + "]");
					
					listEl.find("option:gt(0)").remove();
					states.each(function(state) {
						var stateEl = '<option value="' + state.get("name") + '">' + state.get("name") + '</option>';
						listEl.append(stateEl);
					}, this);
					
					var isDelete = states.isDelete(stateName);
					isDelete ? listEl.val("") : listEl.val(stateName);
					listEl.toggleClass("pause", isDelete);
				}, this);
			},
			
			
			renderRoles : function() {
				_.each(["action", "push"], function(type) {
					var typeArea = this.$("td[data-type=" + type +"]");
					_.each(this.model.get(type + "Roles"), function(role) {
						typeArea.find("input[value=" + role + "]").attr("checked", true);
					}, this);
				}, this);
			},
			
			
			changeState : function(e) {
				var target = $(e.currentTarget);
				var type = target.attr("data-type");
				target.removeClass("pause");
				this.model.set(type + "Status", target.val());
			},
			
			
			setRoles : function(e) {
				var group = $(e.currentTarget).parents("td[data-type]");
				var type = group.attr("data-type");
				var lists = [];
				_.each(group.find("input[type=checkbox]:checked"), function(role) {
					lists.push(role.getAttribute("value"));
				});
				this.model.set(type + "Roles", lists);
				console.log(this.model.get(type + "Roles"));
			},
			
			
			setActionName : function(e) {
				this.model.set("actionName", $(e.currentTarget).val());
			}
		});
		
		return TaskFlowItemView;
	});
}).call(this);
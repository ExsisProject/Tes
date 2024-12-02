define('works/views/app/workflow_flow_item', function(require) {

	var adminLang = require("i18n!admin/nls/admin");
	var commonLang = require('i18n!nls/commons');
	var worksLang = require("i18n!works/nls/works");
	var ItemTpl = require('hgn!works/templates/app/workflow_flow_item');
	
	var lang = {
			"상태변경 버튼명": worksLang["상태변경 버튼명"],
			"상태 변경자": adminLang["상태 변경자"],
			"상태 변경 알림대상": adminLang["상태 변경 알림대상"],
			"최초등록" : adminLang["최초등록"],
			"선택" : commonLang["선택"],
			"추가" : commonLang["추가"],
			"삭제" : commonLang["삭제"],
			"색상 변경" : commonLang["색상 변경"],
			"상태변경": worksLang["상태변경"],
		};
	
	var FlowItemView = Backbone.View.extend({
		initialize : function(options) {
			this.options = options || {};
			this.model = options.model;
			this.collection = options.collection;
			GO.EventEmitter.on("works", "change:workflowStat", function(collection) {
				this.renderStats(collection);
			}, this);
			this.isFirst = options.isFirst ? true : false;
			this.roles = options.roles;
			this.lang = options.lang;
		},
		
		events : {
			"change select" : "changeStat",
			"click input[type=checkbox]" : "setRoles",
			"focusout input[type=text]" : "setActionName"
		},
		
		changeStat : function(e) {
			var target = $(e.currentTarget);
			var type = target.attr("data-type");
			target.removeClass("pause");
			this.model[type + "Status"] = target.val();
		},
		
		setRoles : function(e) {
			var group = $(e.currentTarget).closest("td[data-type]");
			var type = group.attr("data-type");
			var lists = [];
			_.each(group.find("input[type=checkbox]:checked"), function(role) {
				lists.push(role.getAttribute("value"));
			});
			this.model[type + "Roles"] = lists;
		},
		
		setActionName : function(e) {
			var actionName = $(e.currentTarget).val();
			if (actionName.length < 2 || 100 < actionName.length) {
				return;
			}
			this.model["actionName"] = actionName;
		},

		render : function() {
			this.$el.html(ItemTpl({
				lang : lang,
				model : this.model,
				roles : this.roles,
				isFirst : this.isFirst,
				cid : this.cid
				}));
			this.renderRoles();
			this.$el.attr("data-type", "flow");
			return this;
		},

		renderStats : function(collection){
			_.each(["before", "next"], function(type) {
				var stateName = this.model[type + "Status"];
				var listEl = this.$("select[data-type=" + type + "]");

				listEl.find("option:gt(0)").remove();
				var isDelete = collection.isDelete(stateName);
				isDelete ? listEl.val("") : listEl.val(stateName);
				listEl.toggleClass("pause", isDelete);
			}, this);
		},
		
		renderRoles : function() {
			_.each(["action", "push"], function(type) {
				var typeArea = this.$("div[data-type=" + type +"]");
				var roles = this.model[type + "Roles"];

				if (!roles) {
					return;
				}

				roles.forEach(function (role) {
					typeArea.find("input[value=" + role + "]").attr("checked", true);
				});

			}, this);
		}
	});
	
	return FlowItemView;
});
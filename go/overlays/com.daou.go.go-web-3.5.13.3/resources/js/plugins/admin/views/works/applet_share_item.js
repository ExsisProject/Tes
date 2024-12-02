;(function() {
	define([
			"backbone",
			
			"i18n!nls/commons",
			"i18n!admin/nls/admin",
			"i18n!works/nls/works",	
			
			"hgn!admin/templates/works/applet_share_item"
	], 
	function(
			Backbone,
			
			commonLang,
			adminLang,
			worksLang,
			
			ShareItemTmpl
	) {
		var lang = {
			"user" : commonLang["사용자"],
	        "subdepartment" : adminLang["부서"],
			"department" : adminLang["부서"],
	        "position" : adminLang["직위"],
	        "duty" : adminLang["직책"],
	        "grade" : adminLang["직급"],
	        "usergroup" : adminLang["사용자그룹"],
	        "including_sub_dept" : adminLang["하위부서 포함"],
	        "앱 삭제" : worksLang["앱 삭제"]
		};
		
		
		var AppletShareItemView = Backbone.View.extend({
			tagName : "tr",
			attributes: {"el-share-item": ""},
			
			events : {
				"change select" : "changeState",
				"click input[type=checkbox]" : "setRoles",
				"focusout input[type=text]" : "setActionName",
	            "click #share-del-btn" : "triggerShareDeleteItem"
			},
			
			initialize : function(options) {
				this.options = options || {};
				this.item = options.item;
			},
			
			render : function() {
				var nodeSubValue = undefined;
				if(this.item.nodeType == "subdepartment") {
					nodeSubValue = lang["including_sub_dept"];
				}
				
				this.$el.html(ShareItemTmpl({
					lang : lang,
					typeLabel : lang[this.item.nodeType],
					nodeValue : this.item.nodeValue,
					nodeSubValue : nodeSubValue
				}));
				this.$el.attr("data-nodeid", this.item.nodeId);
				this.$el.attr("data-nodetype", this.item.nodeType);
				this.$el.attr("data-nodeDeptId", this.item.nodeDeptId);
				
				return this;
			},
			
			triggerShareDeleteItem :function() {
				
			},
			
		});
		
		return AppletShareItemView;
	});
}).call(this);
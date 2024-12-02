define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "hgn!approval/templates/rulelist_item",
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    
],
function(
	$, 
	_, 
	Backbone, 
	GO,
    RuleListItemTpl,
    commonLang,
    approvalLang
) {
	var lang = _.extend(commonLang,{
		"제목이" : approvalLang["제목이"],
		"양식명이" : approvalLang["양식명이"],
		"기안자가" : approvalLang["기안자가"],
		"기안부서가" : approvalLang["기안부서가"],
		"include" : approvalLang["을(를) 포함 할 때"],
		"matchAllCondition" : approvalLang["모두 만족"],
		"matchOneCondition" : approvalLang["하나만 만족"],
		
	});
	var RuleListView = Backbone.View.extend({
		tagName: 'tr',
		events: {
            "click #editCancle" : "toggleEditForm"
        },
		initialize: function(options) {
		    this.options = options || {};
			_.bindAll(this, 'render');
			this.columns = this.options.columns;
		},
		render: function() {
			var ruleSet = this.model.toJSON().ruleSetModel;
			this.$el.html(RuleListItemTpl({
				model : this.model.toJSON(),
				ruleSet: ruleSet,
				postActionModel : ruleSet.postActionList[0],
				convertRules : function(){
					var rules = [];
					$.each(this.ruleSet.rules, function(i, item){
						if(item.type == "TITLE"){
							rules.push(lang.제목이 + " '" + item.target + "' " + lang.include);
						} else if (item.type == "FORM") {
							rules.push(lang.양식명이 + " '" + item.target + "' " + lang.include);
						} else if (item.type == "DRAFTER") {
							rules.push(lang.기안자가 + " '" + item.target + "' " + lang.include);
						} else if (item.type == "DRAFT_DEPT") {
							rules.push(lang.기안부서가 + " '" + item.target + "' " + lang.include);
						}
					});
					return rules.join(", ");
				},
				convertCondition : function() {
					if(this.ruleSet.rules.length == 1){
						return "-";
					}
					if(this.ruleSet.condition == "AND"){
						return lang.matchAllCondition;
					}
					return lang.matchOneCondition;
				},
				columns: this.columns,
				lang : lang
			}));
			
			return this;
		}
        
	});
	
	return RuleListView;
});
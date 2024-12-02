define("works/components/filter/collections/filter_condition_options", function(require) {

	var worksLang = require('i18n!works/nls/works');
	var ConditionOption = require("works/components/filter/models/filter_condition_option");
	
	return Backbone.Collection.extend({
		model : ConditionOption,
		
		initialize : function() {
			this.collectionName = "filter_condition_options"; // debugging 용도
		},
		
		setLabel : function() {
			this.each(function(model) {
				model.set("label", model.get("displayText"));
				model.set("cid", model.get("value"));
			});
		},
		
		setUsed : function(values) {
			this.each(function(model) {
				var isUsed = _.contains(values, model.get("value"));
				model.set("isUsed", isUsed);
			});
		},
		
		findByKeyword : function(keyword) {
			if (!keyword) return [];
			
			return this.filter(function(model) {
				return model.get("displayText").indexOf(keyword) > -1;
			});
		},
		
		labelText : function() {
			var cnt = 0;
			var checkedModels = this.filter(function(model) {
				if (model.get("isUsed") && cnt < 3) {
					cnt++;
					return  true;
				}
				return false;
			}, this);
			
			if (!checkedModels.length) return worksLang['모두'];
			
			var displayLabel = _.map(checkedModels, function(model) {
				return model.get("displayText");
			}, this);
			
			if (displayLabel.length == 3) displayLabel.push("...");
			
			return displayLabel.join(",");
		},
		
		getUsedOption : function() {
			var usedOptions = this.filter(function(model) {
				return model.get("isUsed");
			});
			
			return _.map(usedOptions, function(model) {
				if (model.get("isOrgType")) {
					return {
						id : model.get("value"),
						name : model.get("label")
					};
				}
				return model.get("value");
			});
		},
		
		addOption : function(model) {
			if (!_.isObject(this.findWhere({value : model.get("value")}))) {
				this.push(model);
			}
		},
		
		addConditionFromUsers : function(users) {
			_.each(users, function(user) {
				this.push(new ConditionOption({
					value : user.id,
					label : user.name,
					isUsed : true,
					isOrgType : true
				}));
			}, this);
		}
	});
});
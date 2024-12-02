define("works/components/filter/collections/filter_conditions", function(require) {
	var Condition = require("works/components/filter/models/filter_condition");
	var VALUE_TYPE = require('works/constants/value_type');
	var COMPONENT_TYPE = require('works/constants/component_type');
	var CONDITION_TYPE = require('works/constants/condition_type');
	var worksLang = require('i18n!works/nls/works');
	var FUNCTION_NAME = {ME: 'me()'}; // 파일로 빼기엔 너무,,

	return Backbone.Collection.extend({
		
		model : Condition,
		
		initialize : function() {
			this.modelName = "filter_conditions"; // debugging 용도
		},
		
		/**
		 * 서버에서는 지워진 field 의 condition도 함께 내려준다.
		 * field 에 없는 condition 은 무시, 삭제하자.
		 *  
		 * field 의 cid, label, fieldType, options 을 condition 으로 머지한다.
		 */
		mergeFromFields : function(fields) {
			var deletedFieldConditions = [];
			this.each(function(model) {
				var result = model.mergeFromFields(fields);
				if (!result) deletedFieldConditions.push(model);
			}, this);
			this.remove(deletedFieldConditions);
		},
		
		getSearchQueryString : function() {
			var queries = [];
			this.each(function(model) {
				queries.push(model.modelToQuery());
			}, this);
			
			return _.compact(queries).join(" AND ");
		},

		getLabelTexts: function() {
			return this.map(function(model) {
				return model.get('label') + ': ' + model.getLabelText();
			}, this).join(' / ');
		}
	}, {
		getCreatedByConditions: function() {
			return {
				conditionType: CONDITION_TYPE.SELECT,
				fieldCid: COMPONENT_TYPE.Creator,
				fieldType: COMPONENT_TYPE.Creator,
				label: worksLang["등록자"],
				multiple: false,
				options: [],
				valueType: VALUE_TYPE.USER,
				values: {
					values: [{
						id: FUNCTION_NAME.ME,
						name: worksLang['현재 사용자']
					}]
				}
			};
		}
	});
});
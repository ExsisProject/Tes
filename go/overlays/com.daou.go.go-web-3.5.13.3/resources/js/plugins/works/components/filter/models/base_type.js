define("works/components/filter/models/base_type", function(require) {
	var VALUE_TYPE = require("works/constants/value_type");
	var CONDITION_TYPE = require('works/constants/condition_type');

	return Backbone.Model.extend({
		initialize : function() {},

		/**
		 * options 을 가지고있는 조건.
		 */
		isSelectTypeCondition : function() {
			return _.contains([VALUE_TYPE.SELECT, VALUE_TYPE.SELECTS, VALUE_TYPE.USER, VALUE_TYPE.USERS, VALUE_TYPE.DEPTS], this.get('valueType'));
		},

		isTextValueType: function() {
			return _.contains([VALUE_TYPE.STEXT, VALUE_TYPE.TEXT, VALUE_TYPE.STEXTS], this.get("valueType"));
		},

		isSelectValueType : function() {
			return _.contains([VALUE_TYPE.SELECT, VALUE_TYPE.SELECTS], this.get("valueType"));
		},
		
		isUserType : function() {
			return _.contains([VALUE_TYPE.USER, VALUE_TYPE.USERS], this.get("valueType"));
		},
		
		isDeptType : function() {
			return VALUE_TYPE.DEPTS == this.get("valueType");
		},
		
		isOrgType : function() {
			return this.isUserType() || this.isDeptType();
		},
		
		isAppletDocValueType : function() {
			return VALUE_TYPE.APPLETDOCS === this.get("valueType");
		},

		/**
		 * AppletDoc 은 Text 와 Select 두가지 conditionType 을 갖는다.
		 */
		isTextAppletDocType: function() {
			return this.isAppletDocValueType() && !_.isArray(this.get('values').values); // {} or  {text: 'text'}
		},

		/**
		 * AppletDoc 은 Text 와 Select 두가지 conditionType 을 갖는다.
		 */
		isSelectAppletDocType: function() {
			return this.isAppletDocValueType() && _.isArray(this.get('values').values); // [{id: 1, text: 'text'}, ..]
		},

		/**
		 * 값을 multi로 갖을 수 있는 경우
		 * # FILE, LISTBOX, CHECKBOX, ORG
		 * STEXTS, SELECTS, FILES, USERS, DEPTS, APPLETDOCS
		 */
		isMultiValueType : function() {
			return _.contains([VALUE_TYPE.SELECTS, VALUE_TYPE.USERS, VALUE_TYPE.FILES, VALUE_TYPE.STEXTS, VALUE_TYPE.DEPTS, VALUE_TYPE.APPLETDOCS], this.get("valueType"));
		},

		/**
		 * table 컴포넌트에 속한 field 인경우.
		 *
		 * ★ 멀티플(테이블 컴포넌트에 들어 갈 수 있는)이 가능한 항목.
		 * 텍스트, 숫자, 날짜, 시간, 날짜+시간, 셀렉트바
		 */
		_isMultiple : function() {
			return this.get("multiple") == true;
		}
	});
});
		
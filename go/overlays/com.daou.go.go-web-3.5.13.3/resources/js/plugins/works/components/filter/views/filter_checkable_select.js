/**
 * current user 기능을 위해 별도 구현.
 */

define("works/components/filter/views/filter_checkable_select", function(require) {
	var worksLang = require('i18n!works/nls/works');
	var VALUE_TYPE = require('works/constants/value_type');
	var ConditionOption = require('works/components/filter/models/filter_condition_option');
	var CheckableSelectView = require('components/select/views/select_list');
	var FUNCTION_NAME = {
		CURRENT: 'current', // '현재사용자' 조건의 과거 호환 코드. current => me()
		ME: 'me()',
		MY_DEPTS: 'myDepts()',
		MY_SUB_DEPTS: 'myDepts() mySubDepts()' // mySubDepts 는 하위부서만 가지고 온다. 현재 부서도 포함시키기 위해 두가지 펑션을 같이 쓴다.
	};
	
	return CheckableSelectView.extend({
		
		initialize : function(options) {
			CheckableSelectView.prototype.initialize.call(this, options);
			this.valueType = options.valueType;
		},
		
		render : function() {
			CheckableSelectView.prototype.render.call(this);

			this._functionCheck();

			return this;
		},
		
		_functionCheck: function() {
			var isUserType = _.contains([VALUE_TYPE.USER, VALUE_TYPE.USERS], this.valueType);
			var isDepartmentsType = VALUE_TYPE.DEPTS == this.valueType;
			if (isUserType && !(this._hasFunctionOption(FUNCTION_NAME.ME) || this._hasFunctionOption(FUNCTION_NAME.CURRENT))) {
				this._addCurrentUserOption();
			}
			if (isDepartmentsType && !this._hasFunctionOption(FUNCTION_NAME.MY_DEPTS)) this._addMyDepartmentsOption();
			if (isDepartmentsType && !this._hasFunctionOption(FUNCTION_NAME.MY_SUB_DEPTS)) this._addMySubDepartmentsOption();
		},

		_hasFunctionOption: function(functionName) {
			return !!this.collection.findWhere({value: functionName});
		},
		
		_addCurrentUserOption: function() {
			var model;
			if (this._hasFunctionOption(FUNCTION_NAME.CURRENT)) { // '현재사용자' 조건의 과거 호환 코드. current => me()
				model = this.collection.findWhere({value: FUNCTION_NAME.CURRENT});
				model.set('value', FUNCTION_NAME.ME);
			} else {
				model = new ConditionOption({
					label: worksLang['현재 사용자'],
					type: 'function',
					value: FUNCTION_NAME.ME,
					isUsed: false,
					isOrgType: true,
					isDefaultDisplayOption: true
				});
				this.collection.unshift(model, {silent: true});
			}
			this._addSelectItem(model);
		},

		_addMyDepartmentsOption: function() {
			var model = new ConditionOption({
				label: worksLang['현재 사용자의 부서'],
				type: 'function',
				value: FUNCTION_NAME.MY_DEPTS,
				isUsed: false,
				isOrgType: true,
				isDefaultDisplayOption: true
			});
			this.collection.unshift(model, {silent: true});
			this._addSelectItem(model);
		},

		_addMySubDepartmentsOption: function() {
			var model = new ConditionOption({
				label: worksLang['현재 사용자의 부서 (하위부서 포함)'],
				type: 'function',
				value: FUNCTION_NAME.MY_SUB_DEPTS,
				isUsed: false,
				isOrgType: true,
				isDefaultDisplayOption: true
			});
			this.collection.unshift(model, {silent: true});
			this._addSelectItem(model);
		}
	});
});
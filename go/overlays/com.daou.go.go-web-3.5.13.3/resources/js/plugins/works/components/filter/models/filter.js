define('works/components/filter/models/filter', function(require) {
    var Backbone = require('backbone');
	var commonLang = require('i18n!nls/commons');
	var worksLang = require('i18n!works/nls/works');
	var Conditions = require('works/components/filter/collections/filter_conditions');
	return Backbone.Model.extend({

		type: 'mine', // [mine, base, others]

		initialize : function(options) {
			options = options || {};
			this.type = options.type || this.type;
			this.modelName = 'filter'; // debugging 용도
			this.useDocNo = options.useDocNo;
		},

		defaults : {
			name : commonLang['검색'],
			conditions : []
		},

		urlRoot : function() {
			var typeValue = this.isOthersFilter() ? 'mine' : this.type;
			return GO.contextRoot + 'api/works/applets/' + this.get('appletId') + '/filters/' + typeValue;
		},

		getSearchQuery : function(/*conditions*/) {
			var conditions = new Conditions(this.get('conditions'));
			var queryString = [];
			var conditionQuery = conditions.getSearchQueryString();
			var searchText = this.get('searchKeyword');

			if (conditionQuery) queryString.push(conditionQuery);
			if (searchText) {
				var queryStr = 'textContent:"' + this._escapeSpecialCharacter(searchText) + '"';
				if(this.useDocNo) {	// 문서번호(채번) 사용할 경우 문서번호도 검색
					queryStr = '(' + queryStr + ' OR docNo:"' + this._escapeSpecialCharacter(searchText) + '")';
				}
				queryString.push(queryStr);
			}

			return queryString.join(' AND ');
		},

		validate: function(attrs) {
			if (attrs.name.length > 64 || attrs.name.length < 1) {
				return GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {arg1 : 1, arg2 : 64});
			}
		},

		setType: function(type) {
			this.type = type;
		},

		isOthersFilter: function() {
			return this.type === 'others';
		},

		_escapeSpecialCharacter : function(string) {
			return string.replace(/[\\+!():^\[\]{}~*?|&;\/-\\"]/g, '\\$&');
		}
	}, {
		getCreatedByFilterOptions: function() {
			return {
				name: worksLang['내가 등록한 데이터'],
				conditions: Conditions.getCreatedByConditions()
			}
		}
	});
});
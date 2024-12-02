define("works/components/list_manager/models/list_setting", function(require) {
	var BaseModel = require('models/base_model');
	return BaseModel.extend({

		initialize : function(attributes, options) {
			BaseModel.prototype.initialize.call(this, options);
			this.appletId = options.appletId;
			this.type = options.type || 'base'; // personal or base
		},

		url: function() {
			var baseUrl = GO.contextRoot + 'api/works/applets/' + this.appletId + '/listview';
			var urlMap = {
				'base': '',
				'personal': '/my' + (this.id ? '/' + this.id : '')
			};

			return baseUrl + urlMap[this.type];
		},

		setType: function(type) {
			this.type = type;
		},

		/**
		 * 필드를 바탕으로 컬럼 추출.
		 *
		 * 컬럼은 있지만 필드가 없는경우 -> 컬럼으로 추가했지만 필드가 사라진경우. 컬럼값 무시.
		 * 필드는 있지만 컬럼이 없는경우 -> 컬럼으로 사용 안하는 필드
		 *
		 * 컬럼으로부터 columnName 을 가져오기 위해 merge 한다
		 *
		 */
		getColumns : function(fields) {
			var columns = this.get("columns") || [];
			if (!columns.length) return [];

			var fieldCids = _.map(columns, function(column) {
				return column.fieldCid;
			});

			var usedFields = _.map(fieldCids, function(fieldCid) {
				var field = fields.findWhere({cid : fieldCid});
				if (!field) return;
				/**
				 * 여기서 머지도 같이 해주자.
				 */
				var column = _.findWhere(columns, {fieldCid : fieldCid});
				field.set("columnName", column.columnName);

				return field;
			});

			return _.compact(usedFields);
		},

		getSortColumnFieldCid : function() {
			var index = this.get("sortColumnIndex");
			if (index < 0) return null;

			return this.get("columns")[index].fieldCid;
		},

		getSortDirection : function() {
			var sortDirection = this.get("sortDirection");

			return sortDirection ? sortDirection.toLowerCase() : null;
		}
	});
});

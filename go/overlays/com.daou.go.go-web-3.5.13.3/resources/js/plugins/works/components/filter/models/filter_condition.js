define("works/components/filter/models/filter_condition", function(require) {
	var worksLang = require("i18n!works/nls/works");
	var lang = {
		"오늘부터" : worksLang["오늘부터"],
		"오늘까지" : worksLang["오늘까지"],
		"일전" : worksLang["일전"],
		"일후" : worksLang["일후"],
		"달전" : worksLang["달전"],
		"달후" : worksLang["달후"]
	};
	
	var CONDITION_TYPE = require("works/constants/condition_type");
	var BaseModel = require('works/components/filter/models/base_type');
	var ConditionOptions = require('works/components/filter/collections/filter_condition_options');

	return BaseModel.extend({

		initialize : function() {
			this.modelName = "filter_condition"; // debugging 용도
		},

		defaults : {
			values : {}
		},

		/**
		 * 새로 만듬.
		 */
		getLabelText: function() {
			var label = '';
			if (this.isSelectValueType()) {
				var options = new ConditionOptions(this.get('options'));
				options.setUsed(this.get('values').values);
				label = options.labelText();
			} else if (this.isOrgType()) {
				label = this.userLabelText();
			} else if(this.isAppletDocValueType()) {
				label = this._appletDocLabelText();
			} else {
				label = this._labelText();
			}
			return label;
		},

		_labelText : function() {
			var label = "";
			var values = this.get("values");

			if (!values) return "";

			switch (this.get("conditionType")) {
			case CONDITION_TYPE.TEXT:
				label = values.text;
				break;
			case CONDITION_TYPE.TIME:
				label = values.fromTime + " ~ " + values.toTime;
				break;
			case CONDITION_TYPE.DATETIME:
				var fromDateTimeStr = moment(values.fromDateTime).format("YYYY-MM-DD HH:mm");
				var toDateTimeStr = moment(values.toDateTime).format("YYYY-MM-DD HH:mm");
				label = fromDateTimeStr + " ~ " + toDateTimeStr;
				break;
			case CONDITION_TYPE.RELATIVE_DATETIME:
				label = this._relativeDateLabel();
				break;
			case CONDITION_TYPE.DATE:
				label = this._dateLabel();
				break;
			case CONDITION_TYPE.RELATIVE_DATE:
				label = this._relativeDateLabel();
				break;
			case CONDITION_TYPE.NUMBER:
				label = this.minValueWithCommas() + " ~ " + this.maxValueWithCommas();
				break;
			}

			return label;
		},

		/**
		 * date, datetime, time, relativeDate, relativeDateTime
		 */
		valuesToDateTime : function() {
			var values = this.get("values");
			var fromDateTime = null;
			var toDateTime = null;

			_.each(this.get("values"), function(value, key) {
				switch (key) {
				case "fromTime":
					fromDateTime = moment(moment().format("YYYY-MM-DD") + "T" + value);
					break;
				case "toTime":
					toDateTime = moment(moment().format("YYYY-MM-DD") + "T" + value);
					break;
				case "fromDateTime":
					fromDateTime = moment(moment(value).format("YYYY-MM-DD hh:mm")); // 초를 없애야 계산할때 1분 차이가 안난다.
					break;
				case "toDateTime":
					toDateTime = moment(moment(value).format("YYYY-MM-DD hh:mm")); // 초를 없애야 계산할때 1분 차이가 안난다.
					break;
				case "fromValue":
					fromDateTime = moment().subtract(parseInt(value), values.fromUnit + "s");
					break;
				case "toValue":
					toDateTime = moment().add(parseInt(value), values.toUnit + "s");
					break;
				case "fromDate":
					fromDateTime = this._yyyymmddToDate(value);
					break;
				case "toDate":
					toDateTime = this._yyyymmddToDate(value);
					break;
				default:
					break;
				}
			}, this);

			return {
				fromDateTime : fromDateTime,
				toDateTime : toDateTime
			};
		},

		/**
		 * date, datetime, time, relativeDate, relativeDateTime
		 */
		isRelativeType : function() {
			return this.get("conditionType").indexOf("RELATIVE") > -1;
		},

		/**
		 * number type only
		 */
		minValueWithCommas : function() {
			if (!this.get("values")) return 0;

			if (this.get("conditionType") != CONDITION_TYPE.NUMBER) {
				console.warn(this.get("conditionType") + " does not support this method.");
				return "";
			}
			return GO.util.numberWithCommas(parseFloat(this.get("values").minValue));
		},

		/**
		 * number type only
		 */
		maxValueWithCommas : function() {
			if (!this.get("values")) return 0;

			if (this.get("conditionType") != CONDITION_TYPE.NUMBER) {
				console.warn(this.get("conditionType") + " does not support this method.");
				return "";
			}
			return GO.util.numberWithCommas(parseFloat(this.get("values").maxValue));
		},

		/**
		 * field 의 cid, label, fieldType, multiple, options 을 condition 으로 머지한다.
		 * 서버에서 내려온 condition 은 없어진 값일수도 있다. fields 에 없는 condition 이면 무시하도록 한다.
		 */
		mergeFromFields : function(fields) {
			var field = _.findWhere(fields, {cid : this.get("fieldCid")});

			if (!field) return false;

			this.set("label", field.label);
			this.set("fieldCid", field.cid);
			this.set("fieldType", field.fieldType);
			this.set("valueType", field.valueType);
			this.set("multiple", field.multiple);
			if (this.get("conditionType") == CONDITION_TYPE.SELECT) {
				this.set("options", field.options);
			}
			return true;
		},

		modelToQuery : function() {
			var str = "";
			var values = this.get("values");
			var solrFormat = "YYYY-MM-DDTHH:mm:ss.SSS"; // 뒤에 Z 를 붙여야 한다.
			var fromDateTimeStr, toDateTimeStr, fromUnit, toUnit;

			switch (this.get("conditionType")) {
			case CONDITION_TYPE.TEXT:
				// ex) c1_texts:텍스트value
				if (!values.text) break;
				str = this.get("fieldCid") + ":" + '"' + this._escapeSpecialCharacter(values.text) + '"';
				break;
			case CONDITION_TYPE.SELECT:
				// ex) c2_longs:(10 20 30),  c2_docIds.id:(11, 13)
				if (values.values && !values.values.length) break;
				var valueString = _.uniq(_.map(values.values, function(value) {
					return _.isObject(value) ? (value.id == 'current' ? 'me()' : value.id): value; // Object case 는 simpleUserModel // current. 과거 호환 코드.
				}, this)).join(" ");
				str = this.get("fieldCid") + (this.isAppletDocValueType() ? (".id:(") : (":(")) + valueString + ")";
				break;
			case CONDITION_TYPE.TIME:
				// ex) c3_string:[12:34 TO 23:45]
				str = this.get("fieldCid") + ":[" + values.fromTime + " TO " + values.toTime + "]";
				break;
			case CONDITION_TYPE.DATETIME:
				// ex) c4_dates:[2015-07-14T15:00:00.000Z TO 2015-07-14T15:00:59.999Z]
				fromDateTimeStr = moment.utc(values.fromDateTime).format(solrFormat) + "Z";
				toDateTimeStr = moment.utc(values.toDateTime).format(solrFormat) + "Z";
				str = this.get("fieldCid") + ":[" + fromDateTimeStr + " TO " + toDateTimeStr + "]";
				break;
			case CONDITION_TYPE.RELATIVE_DATETIME:
				// ex) c4_dates:[2015-07-14T15:00:00.000Z TO 2015-07-15T14:59:59.999Z]
				fromUnit = values.fromUnit.toUpperCase();
				toUnit = values.toUnit.toUpperCase();
				fromDateTimeStr = "";
				toDateTimeStr = "";

				if (fromUnit == "NOW") {
					fromDateTimeStr = moment.utc(moment().startOf("day"));
				} else if (fromUnit == "DAY") {
					fromDateTimeStr = moment.utc(moment().subtract("days", values.fromValue).startOf("day"));
				} else if (fromUnit == "MONTH") {
					fromDateTimeStr = moment.utc(moment().subtract("months", values.fromValue).startOf("day"));
				}

				if (toUnit == "NOW") {
					toDateTimeStr = moment.utc(moment().endOf("day"));
				} else if (toUnit == "DAY") {
					toDateTimeStr = moment.utc(moment().add("days", values.toValue).endOf("day"));
				} else if (toUnit == "MONTH") {
					toDateTimeStr = moment.utc(moment().add("months", values.toValue).endOf("day"));
				}

				str = this.get("fieldCid") + ":[" + fromDateTimeStr.format(solrFormat) + "Z TO " + toDateTimeStr.format(solrFormat) + "Z]";
				break;
			case CONDITION_TYPE.DATE:
				// ex) c5_strings:[20150101 TO 20151231]
				str = this.get("fieldCid") + ":[" + values.fromDate + " TO " + values.toDate + "]";
				break;
			case CONDITION_TYPE.RELATIVE_DATE:
				// ex) c5_string:[20150425 TO 20150628]
				var fromValue = parseInt(values.fromValue);
				var toValue = parseInt(values.toValue);
				fromUnit = values.fromUnit;
				toUnit = values.toUnit;

				var fromDateStr = GO.util.now().subtract(fromValue, fromUnit + "s").format("YYYYMMDD");
				var toDateStr = GO.util.now().add(toValue, toUnit + "s").format("YYYYMMDD");
				str = this.get("fieldCid") + ":[" + fromDateStr + " TO " + toDateStr + "]";
				break;
			case CONDITION_TYPE.NUMBER:
				// ex) c6_doubles:[123456 TO 234567]
				if (_.isUndefined(values.minValue) || _.isUndefined(values.maxValue)) break;
				str = this.get("fieldCid") + ":[" + values.minValue + " TO " + values.maxValue + "]";
				break;
			default:
				break;
			}

			return str;
		},

		setDefaultValues : function() {
			this.set("values", this._getDefaultValues(this.get("conditionType")));
		},

		userLabelText : function() {
			return _.map(this.get("values").values, function(user) {
				return user.name;
			}).join(",");
		},

		_appletDocLabelText : function() {
			var values = this.get('values');
			//console.log('text applet doc? : ' + this.isTextAppletDocType());
			//console.log('select applet doc? : ' + this.isSelectAppletDocType());
			var parsedValues = _.isArray(values.values) ? values.values : [values];
			return _.map(parsedValues, function(data) {
				return data.text;
			}).join(",");
		},
		
		_dateLabel : function() {
			var fromDate = this._yyyymmddToDate(this.get("values").fromDate);
			var toDate = this._yyyymmddToDate(this.get("values").toDate);
			
			return fromDate.format("YYYY-MM-DD") + " ~ " + toDate.format("YYYY-MM-DD");
		},
		
		_yyyymmddToDate : function(str) {
			var dateSlot = [];
			
			dateSlot.push(str.substr(0,4));
			dateSlot.push(str.substr(4,2));
			dateSlot.push(str.substr(6,2));
			
			return moment(dateSlot.join("-") + "T00:00");
		},
		
		/**
		 * relativeDate, relativeDateTime
		 */
		_relativeDateLabel : function() {
			var str = "";
			var values = this.get("values");
			
			switch (values.fromUnit) {
			case "now":
				str = lang["오늘부터"];
				break;
			case "day":
				str = values.fromValue + lang["일전"];
				break;
			case "month":
				str = values.fromValue + lang["달전"];
				break;
			}
			
			str += " ~ ";
			
			switch (values.toUnit) {
			case "now":
				str += lang["오늘까지"];
				break;
			case "day":
				str += values.toValue + lang["일후"];
				break;
			case "month":
				str += values.toValue + lang["달후"];
				break;
			}
				
			return str;	
		},
		
		_getDefaultValues : function(type) {
			var values = null;
			
			switch (type) {
			case CONDITION_TYPE.TEXT:
				values = {
					text : ""
				};
				break;
			case CONDITION_TYPE.SELECT:
				values = {
					values : []
				};
				break;
			case CONDITION_TYPE.TIME:
				values = {
					fromTime : "00:00",
					toTime : "00:00"
				};
				break;
			case CONDITION_TYPE.DATETIME:
				values = {
					fromDateTime : new Date(),
					toDateTime : new Date()
				};
				break;
			case CONDITION_TYPE.DATE:
				values = {
					fromDate : GO.util.now().format("YYYYMMDD"),
					toDate : GO.util.now().format("YYYYMMDD")
				};
				break;
			case CONDITION_TYPE.NUMBER:
				values = {
					minValue : 0,
					maxValue : 0
				};
				break;
			}
			
			return values;
		},
		
		_escapeSpecialCharacter : function(string) {
			return string.replace(/[\\+!():^\[\]\{}~*?|&;\/-\\"]/g, '\\$&');
		}
	});
});
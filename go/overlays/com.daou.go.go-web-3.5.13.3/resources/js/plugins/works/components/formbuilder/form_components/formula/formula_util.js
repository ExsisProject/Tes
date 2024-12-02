define('works/components/formbuilder/form_components/formula/formula_util', function(require) {
	var worksLang = require("i18n!works/nls/works");
	var ValueType = require('works/constants/value_type');
	var lang = {
		"일": worksLang["일"],
		"시간": worksLang["시간"],
        "분": worksLang["분"]	
	};
	
	/**
     * param unixTime
     * return object = {day, hour, minute};
     */
     var unixTimeToTimeObject = function(data) {
    	var isPositive = (data >= 0) ? true : false;
    	var tmpData = Math.abs(data);
    	
    	var pDay = tmpData / (60*60*24*1000);
    	var strDay = Math.floor(pDay);
    	var pHour = (tmpData - (strDay * (60*60*24*1000))) / (60*60*1000);
    	var strHour = Math.floor(pHour);
    	var strMinute = Math.floor((tmpData - (strDay * (60*60*24*1000)) - (strHour * (60*60*1000))) / (60*1000));
    	return { day: strDay, hour: strHour, minute: strMinute, isPositive:isPositive };
    }
	
	var makeTimeToDisplayText = function(data) {
    	var result = "";
		if(data.hour == 0) {
			result = data.minute + lang["분"];
		} else if(data.minute == 0) {
			result = data.hour + lang["시간"];
		} else {
			result = data.hour + lang["시간"] + " " + data.minute + lang["분"];
		}
		if(!data.isPositive){
    		result = "-"  + result;
    	}
    	return result;
    }
	
	var makeDayToDisplayText = function(data) {
		var result = "";
    	if(data.hour == 0 && data.minute == 0) {
    		result = data.day + lang["일"];
    	} else if(data.day == 0 && data.minute == 0) {
    		result = data.hour + lang["시간"];
    	} else if(data.day == 0 && data.hour == 0) {
    		result = data.minute + lang["분"];
    	} else if(data.day != 0 && data.hour != 0 && data.minute == 0) {
    		result = data.day + lang["일"] + " " + data.hour + lang["시간"];
    	} else if(data.day == 0 && data.hour != 0 && data.minute != 0) {
    		result = data.hour + lang["시간"] + " " + data.minute + lang["분"];
    	}  else {
    		result = data.day + lang["일"] + " " + data.hour + lang["시간"] + " " + data.minute + lang["분"];
    	}
    	if(!data.isPositive){
    		result = "-"  + result;
    	}
    	return result;
	};

	var strTimeToNumMinute = function (strTime) {
		try {
			var str = strTime.split(':');
			var minute = (parseInt(str[0]) * 60) + parseInt(str[1]);
			return minute;
		} catch (e) {
			return NaN;
		}
	};

     var convertValueList = function(value, valueType, properties) {
		 if (ValueType.DATE == valueType) {
			 if (_.isString(value) && value.length > 0) {
				 var date = new Date(value.substring(0, 4), value.substring(4, 6) - 1, value.substring(6, 8));
				 val = parseInt(date.getTime());
			 } else {
				 val = NaN;
			 }
		 } else if (ValueType.TIME == valueType) {
			 if (value && value.length > 0) {
				 val = strTimeToNumMinute(value);
			 } else {
				 val = parseInt(value);
			 }
		 } else if (ValueType.DATETIME == valueType) {
			 if (_.isString(value) && value.length > 0) {
				 var date = new Date(value);
				 val = parseInt(date.getTime());
			 } else if (moment.isMoment(value)) {
				 val = parseInt(value.toDate().getTime());
			 } else {
				 val = NaN;
			 }
		 } else {
			 val = (properties.dataType == "PERCENT") ? value / 100 : value;
		 }
	 };

	// 자바스크립트 생성자에 apply를 적용시키는 방법
	// http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
	var applyToConstructor = function(Constructor) {
		var args = Array.prototype.slice.call(arguments, 1);
		return function () {
			var Temp = function () {
				}, // temporary constructor
				inst, ret; // other vars

			// Give the Temp constructor the Constructor's prototype
			Temp.prototype = Constructor.prototype;

			// Create a new instance
			inst = new Temp;

			// Call the original Constructor with the temp
			// instance as its context (i.e. its 'this' value)
			ret = Constructor.apply(inst, args);

			// If an object has been returned then return it otherwise
			// return the original instance.
			// (consistent with behaviour of the new operator)
			return Object(ret) === ret ? ret : inst;
		}
	};

	var getFormulaFunc = function (params, expression) {
		var funcBody = 'return ' + (expression ? expression : 'void(0)') + ';';
		var formulaFunc;

		params.unshift(Function);
		params.push(funcBody);

		try {
			formulaFunc = applyToConstructor.apply(undefined, params);
			return formulaFunc();
		} catch (e) {
			return function () {
			};
		}
	};

	var strTimeToNumMinute = function (strTime) {
		try {
			var str = strTime.split(':');
			var minute = (parseInt(str[0]) * 60) + parseInt(str[1]);
			return minute;
		} catch (e) {
			return NaN;
		}
	};

	var convertNumberValueList = function (datas) {
		var numberValues = [];
		_.each(datas, function (data) {
			var valueType = data.valueType;
			var value = data.value;
			var numberValue;
			if (ValueType.DATE == valueType) {
				if (_.isString(value) && value.length > 0) {
					var date = new Date(value.substring(0, 4), value.substring(4, 6) - 1, value.substring(6, 8));
					numberValue = parseInt(date.getTime());
				} else {
					numberValue = NaN;
				}
			} else if (ValueType.TIME == valueType) {
				if (value && value.length > 0) {
					numberValue = strTimeToNumMinute(value);
				} else {
					numberValue = parseInt(value);
				}
			} else if (ValueType.DATETIME == valueType) {
				if (_.isString(value) && value.length > 0) {
					var date = new Date(value);
					numberValue = parseInt(date.getTime());
				} else if (moment.isMoment(value)) {
					numberValue = parseInt(value.toDate().getTime());
				} else {
					numberValue = NaN;
				}
			} else {
				var inputVal = parseFloat(value);
				numberValue = data.multiple ? value : ((data.dataType == "PERCENT") ? inputVal / 100 : inputVal);
			}

			if (!_.isNumber(numberValue)) {
				numberValue = null;
			}

			numberValues.push(numberValue);
		}, this);
		return numberValues;
	};

	return {

		// 날짜와시간/날짜 자동계산 컴포넌트 일 계산 결과값 "분"으로 컨버팅 ex) xx일 xx시간 xx분 => yy분
        dayToMinuteForDayFormula: function(data) {
            var isPositive = (data >= 0) ? true : false;
            var tmpData = Math.abs(data);

            var pMinute = tmpData / (60*1000);
            var strMinute = Math.floor(pMinute);

            if(!isPositive) {
            	return (strMinute * -1);
			} else {
            	return strMinute;
			}
        },

        // 날짜와시간/날짜 자동계산 컴포넌트 시간 계산 결과값 "분"으로 컨버팅 ex) xx시간 xx분 => yy분
        timeToMinuteForDayFormula: function(data) {
            var object = unixTimeToTimeObject(data);
            var result = (((object.day * 24) + object.hour) * 60) + object.minute;

            if(!object.isPositive) {
                return (result * -1);
            } else {
            	return result;
			}
        },

        // 시간컴포넌트 시간 계산 ex) xx시간 xx분
		timeToTimeDisplayText: function(data) {
			var isPositive = (data >= 0) ? true : false;
        	var tmpData = Math.abs(data);
        	var hour = parseInt(tmpData / 60);
    		var minute = parseInt(tmpData % 60);

    		var object = {hour:hour, minute:minute, isPositive:isPositive};
    		return makeTimeToDisplayText(object);
		},

        // 날짜/날짜와시간 컴포넌트 시간 계산 ex) xx 시간
		dateTimeToTimeDisplayText: function(data) {
        	var object = unixTimeToTimeObject(data);
        	object.hour = (object.day*24)+object.hour;
        	object.day = 0;
        	return makeTimeToDisplayText(object);
        }, 

		// 날짜/날짜와시간 컴포넌트 일 계산 ex) xx일 xx시간 xx분
		dateTimeToDayDisplayText: function(data) {
        	return makeDayToDisplayText(unixTimeToTimeObject(data));
        },

		convertValueList : function(value, valueType, properties) {
        	return convertValueList(value, valueType, properties);
		},

		getExpressionCodes: function(expression) {
			var pattern = /[\+\*\-\%\/\(\)]/gi;
			var expressionUnits = _.compact(expression.split(pattern));
			return _.map(expressionUnits, function (unit) {
				return unit.replace(/ /gi, ""); // GO-29538 자동계산 수식 이슈로 사칙연산 split 후 문자열에 공백이 있을 수 있으므로 공백 제거
			});
		},

		getFormulaValue: function(properties, codes, datas) {
			var dateValueType = properties.dateValueType;
			var expressionType = properties.expressionType;
			var expression = properties.expression;
			var decimalPoints = properties.decimalPoints;

			var formulaFunc = getFormulaFunc(codes, expression);
			var result = formulaFunc.apply(null, convertNumberValueList(datas));
			if (!result) return "";
			if (!dateValueType == ValueType.TIME && !expressionType == "day" && !expressionType == "time") {
				result = GO.util.fixFloatingPoint(result, decimalPoints);
			}
			return result;
		}
	}
});
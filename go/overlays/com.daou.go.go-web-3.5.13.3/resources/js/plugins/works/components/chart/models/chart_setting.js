define("works/components/chart/models/chart_setting", function() {
	return Backbone.Model.extend({
		initialize : function(options) {
			this.fieldCid = options.fieldCid;
			this.modelName = "chart_setting";
		},

		defaults : {
			title : "",
			goal : "",
			chartType : "COLUMN",
			groupByCid : "", // 차트 데이터 요청시 사용.
			rangeOption : null, // 차트 데이터 요청시 사용.
			aggMethod : "COUNT", // 차트 데이터 요청시 사용.
			subAggMethod : "COUNT", // 차트 데이터 요청시 사용.
			aggCid : "", // 차트 데이터 요청시 사용.
			theme: '0'
		},
		
		getValues : function() {
			var values = {};
			
			if (this.has("fromDate")) values["fromDate"] = this.get("fromDate");
			if (this.has("toDate")) values["toDate"] = this.get("toDate");
			if (this.has("fromValue")) values["fromValue"] = this.get("fromValue");
			if (this.has("toValue")) values["toValue"] = this.get("toValue");
			if (this.has("fromUnit")) values["fromUnit"] = this.get("fromUnit");
			if (this.has("toUnit")) values["toUnit"] = this.get("toUnit");
			
			return values;
		},
		
		/**
		 * date, datetime, time, relativeDate, relativeDateTime
		 */
		toDateTime : function() {
			var values = this.getValues();
			var fromDateTime = null;
			var toDateTime = null;
			
			_.each(values, function(value, key) {
				switch (key) {
				case "fromValue":
					fromDateTime = moment().subtract(parseInt(value), values.fromUnit + "s");
					break;
				case "toValue":
					toDateTime = moment().add(parseInt(value), values.toUnit + "s");
					break;
				case "fromDate":
					fromDateTime = moment(value);
					break;
				case "toDate":
					toDateTime = moment(value);
					break;
				}
			}, this);
			
			return {
				fromDateTime : fromDateTime,
				toDateTime : toDateTime
			};
		},
		
		isInvalidTitle : function() {
			var isInvalid = false; 
			var title = this.get("title");
			if (title.length < 1 || title.length > 20) {
				isInvalid = true;
			}
			
			return isInvalid;
		},
		
		isInvalidGoal : function() {
			var isInvalid = false;
			if (this.get("chartType") === "GAUGE" && !this.get("goal")) {
				isInvalid = true;
			}
			
			return isInvalid;
		},

        setQueryString : function(queryString) {
			this.set('queryString', queryString);
        }
	});
});
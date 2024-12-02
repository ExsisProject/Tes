/**
 * date_form.js
 * 
 * 시간 직접입력이 가능한 컴포넌트. 정리가 좀 필요하다..
 * 직접 사용해도 되고, extend 해서 사용 해도 된다.
 * 구현체로는 chart_date_form.js 가 있다.
 * 
 * hasDate : dateView 존재여부. 기본값 true. false 인 경우 timeView 만 노출.
 * hasTime : timeView 존재여부. 기본값 true. false 인 경우 dateView 만 노출.
 * hasRelativeView : 현재일 기준 옵션. extend 에서 구현하는게 좋을듯.
 * externalModel : 내부 모델은 date.js 을 사용한다. date 값을 가지고 있는 모델을 바인딩 할 수 있다.
 * isRelative : hasRelative 에 종속되는 옵션. 현재일 기준 date 인지 여부.
 * values : relative 관련 date format. fromValue, fromUnit, toValue, toUnit 과 같은 값을 갖는다.
 * dateTime : fromDateTime, toDateTime 을 갖는다.
 */

define(function(require) {
	
	var worksLang = require("i18n!works/nls/works");
	var lang = {
			"오늘부터" : worksLang["오늘부터"],
			"오늘까지" : worksLang["오늘까지"],
			"일전" : worksLang["일전"],
			"일후" : worksLang["일후"],
			"달전" : worksLang["달전"],
			"달후" : worksLang["달후"],
			"시각" : worksLang["시각"],
			"현재일 기준" : worksLang["현재일 기준"]
	};
	
	var CONDITION_TYPE = require("works/constants/condition_type");
	
	var TimeSelectView = require("components/date_form/views/time_select");
	var DateTime = require("components/date_form/models/date_time");
	var DateFormTmpl = require("hgn!components/date_form/templates/date_form");
	
	return Backbone.View.extend({
		
		tagName : "ul",
		className : "select_option",
		
		DAY_OPTION_SIZE : 31,
		MONTH_OPTION_SIZE : 12,
		
		initialize : function(options) {
			this.options = options || {};
			this.hasDate = this.options.hasDate !== false;
			this.hasTime = this.options.hasTime !== false;
			
			this.useBackdrop = this.options.useBackdrop !== false;
			this.isSingle = this.options.isSingle; // relative 를 고려하지 않았기 때문에 아직 같이 사용하면 안됨. 
			this.hasRelativeView = this.options.hasRelativeView;
			this.externalModel = this.options.externalModel;
			this.isRelative = this.options.isRelative;
			this.values = this.options.values;
			
			var fromDateTime = this.options.dateTime ? this.options.dateTime.fromDateTime : null;
			var toDateTime = this.options.dateTime ? this.options.dateTime.toDateTime : null;
			
			this.model = new DateTime({
				startDateTime : fromDateTime,
				endDateTime : toDateTime
			});
			
			this.model.on("change:startDateTime", this._onChangeStartDateTime, this);
			this.model.on("change:endDateTime", this._onChangeEndDateTime, this);
		},
		
		events : {
			"click ul[el-time-list] li" : "_onSelect",
			"keydown input[data-time]" : "_onKeydown",
			"change input[data-time]" : "_onChange",
			"change select[data-type='fromUnit']" : "_onChangeFromUnit",
			"change select[data-type='toUnit']" : "_onChangeToUnit",
			"change input[type='radio']" : "_onChangePeriod",
			"click li[el-period]" : "_onClickPeriod"
		},
		
		render : function() {
			this.$el.html(DateFormTmpl({
				lang : lang,
				startDate : this.model.getStartDate(),
				endDate : this.model.getEndDate(),
				hasDate : this.hasDate,
				hasTime : this.hasTime,
				hasRelativeView : this.hasRelativeView,
				cid : this.cid,
				isSingle : this.isSingle
			}));
			
			this._renderTimeList();
			this._initDatepicker();
			this._togglePeriodView();
			
			return this;
		},
		
		/**
		 * set 된 time 을 기반으로 interval 을 계산하기 때문에 set 을 한번에 하면 안된다. 
		 */
		resetView : function() {
			if (!this.externalModel) return;
			
			var startDateTime = this.externalModel.valuesToDateTime().fromDateTime;
			var endDateTime = this.externalModel.valuesToDateTime().toDateTime;
			this.model.set({startDateTime : startDateTime});
			this._setStartDateOfView();
			this.model.set({endDateTime : endDateTime});
			
			this._togglePeriodView();
		},
		
		/**
		 * dateFormView.setModel() 또는, externalModel.trigger("setModel") 을 통해 호출 가능.
		 */
		setModel : function() {
			var conditionType = this._getConditionType();
			var fromDateTime = this.model.get("startDateTime");
			var toDateTime = this.model.get("endDateTime");
			var values = {};
			
			switch (conditionType) {
			case CONDITION_TYPE.TIME:
				values["fromTime"] = fromDateTime.format("HH:mm");
				values["toTime"] = toDateTime.format("HH:mm");
				break;
			case CONDITION_TYPE.DATETIME:
				values["fromDateTime"] = fromDateTime;
				values["toDateTime"] = toDateTime.add(1, "m").subtract(1, "ms");
				break;
			case CONDITION_TYPE.RELATIVE_DATETIME:
				values = this._getRelativeData();
				break;
			case CONDITION_TYPE.DATE:
				values["fromDate"] = fromDateTime.format("YYYYMMDD"); 
				values["toDate"] = toDateTime.format("YYYYMMDD"); 
				break;
			case CONDITION_TYPE.RELATIVE_DATE:
				values = this._getRelativeData();
				break;
			}
			
			this.externalModel.set("conditionType", conditionType);
			this.externalModel.set("values", values);
		},
		
		_togglePeriodView : function() {
			if (this.isRelative) {
				this._activateRelative();
			} else {
				this._activateAbstract();
			}
		},
		
		_activateAbstract : function() {
			this.$("#dateFormAbstract" + this.cid).attr("checked", true);
		},
		
		/**
		 * 검색용 주석 : fromValue, fromUnit, toValue, toUnit
		 */
		_activateRelative : function() {
			this.$("#dateFormRelative" + this.cid).attr("checked", true);
			
			this._renderFromToOption(this.values.fromUnit, "from");
			this._renderFromToOption(this.values.toUnit, "to");
			_.each(this.values, function(value, key) {
				this.$("select[data-type='" + key + "']").val(value);
			}, this);
			
			var isFromNow = this.values && this.values.fromUnit == "now";
			this.$("select[data-type='fromValue']").toggle(!isFromNow);
			
			var isToNow = this.values && this.values.toUnit == "now";
			this.$("select[data-type='toValue']").toggle(!isToNow);
		},
		
		_onClickPeriod : function(event) {
			event.preventDefault();
			console.log("on click period");
			
			var type = $(event.currentTarget).attr("el-period");
			this.$("#dateForm" + GO.util.initCap(type) + this.cid).attr("checked", true); 
		},
		
		_onChangePeriod : function(event) {
			console.log("on change period");
			
			var periodType = $(event.currentTarget).val();
			
			this.isRelative = periodType != "abstract";
			this._togglePeriodView();
		},
		
		/**
		 * 검색용 주석 : startTimeList, endTimeList
		 */
		_renderTimeList : function() {
			_.each(this.$("span[data-el='backdropWrapper']"), function(el) {
				var $el = $(el);
				var type = $el.attr("data-type");
				var timeSelectView = new TimeSelectView({
					model : this.model,
					type : type,
					useBackdrop : this.useBackdrop
				});
				$el.html(timeSelectView.render().el);
				timeSelectView.linkBackdrop(this.$("input[data-time='" + type + "']"));
				this[type + "TimeList"] = timeSelectView;
			}, this);
		},
		
		_initDatepicker : function() {
			this.$("input[data-date='start']").datepicker({
				dateFormat: "yy-mm-dd", 
				changeMonth: true,
				changeYear: true,
				yearSuffix: "",
				onClose: _.bind(function(selectedDate) {
					this._changeStartDateTimeOfModel(selectedDate);
				}, this)
			});
			this.$("input[data-date='end']").datepicker({
				dateFormat: "yy-mm-dd", 
				changeMonth: true,
				changeYear: true,
				yearSuffix: "",
				onClose: _.bind(function(selectedDate) {
					this._changeEndDateTimeOfModel(selectedDate);
				}, this),
				minDate : this.model.getStartDate()
			});
		},
		
		/**
		 * 모델의 startDateTime 를 바꾼다.
		 */
		_changeStartDateTimeOfModel : function(selectedDate) {
			var startDateTime = this.model.getStartDateTime(selectedDate, null);
			this.model.set("startDateTime", startDateTime);
		},
		
		/**
		 * 모델의 endDateTime 를 바꾼다.
		 * 종료일시가 시작일시보다 작은 경우, 종료시간을 시작시간과 동일하게 set 한다.
		 */
		_changeEndDateTimeOfModel : function(selectedDate) {
			var endDateTime = this.model.getEndDateTime(selectedDate, null);
			this.model.set("endDateTime", endDateTime, {validate : true});
			if (this.model.validationError) {
				this.model.set("endDateTime", this.model.get("startDateTime"));
			}
			this._renderEndTimeOption();
		},
		
		/**
		 * 모델 에 바인딩된 함수. date나 time 이 변경되면 동작한다.
		 * 시작일시가 변경되어도 종료일시와의 간격을 유지해준다.
		 * date 를 사용하지 않는경우, 간격을 유지하지 않고 종료시간을 시작시간과 같게 변경한다.
		 */
		_onChangeStartDateTime : function() {
			// console.log("onChangeStartDateTime");
			
			this._setStartTimeOfView();
			var diff = this.model.get("endDateTime").diff(this.model.previous("startDateTime"), "minutes");
			var newEndDateTime = !this.hasDate ? this.model.get("startDateTime") : this.model.get("startDateTime").clone().add(diff, "minutes");
			this.model.set("endDateTime", newEndDateTime);
			if (this.hasTime) this.endTimeList.renderTimeOption();
		},
		
		/**
		 * 모델 에 바인딩된 함수. date나 time 이 변경되면 동작한다.
		 */
		_onChangeEndDateTime : function() {
			// console.log("onChangeEndDateTime");
			
			this.$("input[data-date='end']").datepicker("option", "minDate", this.model.getStartDate());
			this._setEndDateOfView();
			this._setEndTimeOfView();
		},
		
		_renderEndTimeOption : function() {
			if (this.hasTime) this.endTimeList.renderTimeOption();
		},
		
		_onSelect : function(e) {
			e.stopPropagation();
			
			var type = $(e.currentTarget).closest("[data-type]").attr("data-type");
			var target = $(e.currentTarget);
			var time = target.find("span.txt").text();
			
			this[type + "TimeList"].toggle(false);
			this._changeDateTimeOfModel(type, time);
		},
		
		/**
		 * 검색용 주석 : startTimeList, endTimeList
		 */
		_onKeydown : function(e) {
			if (e.keyCode && e.keyCode != 13) return;
			e.preventDefault();
			
			var target = $(e.currentTarget);
			var type = target.attr("data-time");
			var time = target.val();
			
			this[type + "TimeList"].toggle(false);
			this._changeDateTimeOfModel(type, time);
		},
		
		_onChange : function(e) {
			var target = $(e.currentTarget);
			var type = target.attr("data-time");
			var time = target.val();
			
			this._changeDateTimeOfModel(type, time);
		},
		
		/**
		 * 모델의 time 을 바꾼다.
		 * 검색용 주석 : getStartDateTime, getEndDateTime 
		 */
		_changeDateTimeOfModel : function(type, time) {
			var parsedTime = this.model.parseTime(time); 
			var dateTime = this.model["get" + GO.util.initCap(type) + "DateTime"](null, parsedTime);
			
			this.model.set(type + "DateTime", dateTime);
		},
		
		/**
		 * 뷰의 startDate 를 바꾼다.
		 */
		_setStartDateOfView : function() {
			this.$("input[data-date='start']").val(this.model.getStartDate());
		},
		
		/**
		 * 뷰의 endDate 를 바꾼다.
		 */
		_setEndDateOfView : function() {
			this.$("input[data-date='end']").val(this.model.getEndDate());
		},
		
		/**
		 * 뷰의 startTime 을 바꾼다.
		 */
		_setStartTimeOfView : function() {
			this.$("input[data-time='start']").val(this.model.getStartTime());
		},
		
		/**
		 * 뷰의 endTime 을 바꾼다.
		 */
		_setEndTimeOfView : function() {
			this.$("input[data-time='end']").val(this.model.getEndTime());
		},
		
		_onChangeFromUnit : function() {
			var unit = this.$("select[data-type='fromUnit']").val();
			var isHide = unit == "now";
			this.$("select[data-type='fromValue']").toggle(!isHide);
			this._renderFromToOption(unit, "from");
		},
		
		_onChangeToUnit : function() {
			var unit = this.$("select[data-type='toUnit']").val();
			var isHide = unit == "now";
			this.$("select[data-type='toValue']").toggle(!isHide);
			this._renderFromToOption(unit, "to");
		},
		
		_getConditionType : function() {
			var isRelative = this.$("#dateFormRelative" + this.cid).is(":checked");
			var conditionType = "";
			if (this.hasDate && this.hasTime) {
				conditionType = isRelative ? CONDITION_TYPE.RELATIVE_DATETIME : CONDITION_TYPE.DATETIME;
			} else if (this.hasDate && !this.hasTime) {
				conditionType = isRelative ? CONDITION_TYPE.RELATIVE_DATE : CONDITION_TYPE.DATE;
			} else if (!this.hasDate && this.hasTime) {
				conditionType = CONDITION_TYPE.TIME;
			}
			
			return conditionType;
		},
		
		_getRelativeData : function() {
			var values = {};
			_.each(this.$("select"), function(selectEl) {
				var type = $(selectEl).attr("data-type");
				values[type] = $(selectEl).val();
			});
			
			return values;
		},
		
		_renderFromToOption: function(unit, type) {
			if (_.contains(["day", "month"], unit)) {
				var optionSize = this[unit.toUpperCase() + "_OPTION_SIZE"]; 
				var options = [];
				for (var int = 1; int <= optionSize; int++) {
					options.push('<option value="' + int + '">' + int + '</option>');
				}
				this.$('select[data-type="' + type + 'Value"]').html(options);
			}
		}
	});
});
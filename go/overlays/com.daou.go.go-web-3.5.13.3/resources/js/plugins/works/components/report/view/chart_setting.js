define("works/components/report/view/chart_setting", function(require) {

	var DATE_ITEMS = ["DAY", "MONTH", "YEAR"];

	var VALUE_TYPE = require("works/constants/value_type");
	var commonLang = require("i18n!nls/commons");
	var worksLang = require("i18n!works/nls/works");
	var lang = {
		"MINUTE" : worksLang["MINUTE"],
		"HOUR" : worksLang["HOUR"],
		"DAY" : worksLang["DAY"],
		"WEEK" : worksLang["WEEK"],
		"MONTH" : worksLang["MONTH"],
		"QUARTER" : worksLang["QUARTER"],
		"YEAR" : worksLang["YEAR"],
		"차트 이름" : worksLang["차트 이름"],
		"차트 타입" : worksLang["차트 타입"],
		"세로 막대형" : worksLang["세로 막대형"],
		"꺾은 선형" : worksLang["꺾은 선형"],
		"원형" : worksLang["원형"],
		"속도 그래프" : worksLang["속도 그래프"],
		"그룹별 통계" : worksLang["그룹별 통계"],
		"목표값" : worksLang["목표값"],
		"집계 방식" : worksLang["집계 방식"],
		"정렬" : worksLang["정렬"],
		"개수" : worksLang["개수"],
		"합계" : worksLang["합계"],
		"평균" : worksLang["평균"],
		"최대값" : worksLang["최대값"],
		"최소값" : worksLang["최소값"],
		"그룹없음" : worksLang["그룹없음"],
		"삭제된 항목" : worksLang["삭제된 항목"],
		"항목이 삭제되었습니다 설명" : worksLang["항목이 삭제되었습니다 설명"],
		'기본형' : worksLang['기본형'],
		'누적형' : worksLang['누적형'],
		'콤보 차트': worksLang['콤보 차트'],
		'테마 지정': worksLang['테마 지정'],
		'차트 미리보기': worksLang['차트 미리보기'],
		'데이터 값 표시': worksLang['데이터 값 표시']
	};

	var NumberFormView = require("components/number_form/number_form");

	var TimeFormatItemTmpl = Hogan.compile('<option value="{{type}}">{{label}}</option>');
	var Tmpl = require("hgn!works/components/report/template/chart_setting");

	return Backbone.View.extend({
		initialize : function(options) {
			this.appletId = options.appletId;
			this.chartFields = options.chartFields;
			this.numberFields = options.numberFields;

			this.model.on("change:title", this._validateTitle, this);
			this.model.on("change:goal", this._validateGoal, this);
			this.model.on("change:groupByCid", this._validateGroupByCid, this);
			this.model.on("change:subGroupByCid", this._validateGroupByCid, this);
			this.model.on("change:stack", this._validateStack, this);
			this.model.on("change:subStack", this._validateSubStack, this);
		},

		events : {
			"click [data-chart-theme]" : "_onClickChartTheme",
			"click [data-combination-label]" : "_onClickCombination",
			"change #fields" : "_onChangeField", // 그룹별 통계
			"change #subFields" : "_onChangeSubField", // 그룹별 통계
			"change #chartTitle" : "_validateTitle",
			"change [data-combination-input]" : "_onChangeCombination",
			"change #chartType" : "_onChangeChartType",
			"change #aggMethod" : "_onChangeAggMethod",
			"change #subAggMethod" : "_onChangeSubAggMethod",
			"focusout [el-gauge-value]" : "_validateGoal"
		},

		render : function() {
			this.$el.html(Tmpl({
				lang : lang,
				model : this.model.toJSON(), // chart
				chartFields : this.chartFields.toJSON(), // fields
				numberFields : this.numberFields.toJSON(),
				hasNumberFields : this.numberFields.length > 0
			}));

			this.$el.attr("data-chart-cid", this.model.cid);
			this.numberFormView = new NumberFormView({
				inputClass : "txt w_min",
				inputSelector : {"el-gauge-value" : ""}
			});
			this.numberFormView.setElement(this.$("[el-number-form-wrapper]"));
			this.numberFormView.render();

			this._renderTimeFormatItem();

			this._setData();

			return this;
		},

		_setData : function() {
			this.$("#chartType").val(this.model.get("chartType"));
			this._onChangeChartType();
			this.numberFormView.setValue(this.model.get("goal") || "");
			this.$("#fields").val(this.model.get("groupByCid"));
			this.$('#subFields').val(this.model.get('subGroupByCid'));
			this.$('#stack').val(_.isUndefined(this.model.get('stack')) ? 'false' : this.model.get('stack') + '');
			this.$('#subStack').val(_.isUndefined(this.model.get('subStack')) ? 'false' : this.model.get('subStack') + '');
			if (this.model.get('rangeOption')) this.$('#rangeOption').val(this.model.get('rangeOption'));
			if (this.model.get('subRangeOption')) this.$('#subRangeOption').val(this.model.get('subRangeOption'));
			if (this.model.get('combination')) this.$('[data-combination-input]').prop('checked', true);
			this._toggleCombinationArea(this.model.get('combination'));
			this._onChangeField();
			this._onChangeSubField();
			this._setAggArea();
			this._onChangeAggMethod();
			this._onChangeSubAggMethod();
			this._setTheme();
		},

		_setAggArea: function() {
            if (this.isDeletedAggField()) {
                this.$("#aggMethod").val("COUNT");
                this.$("#aggCid").val("");
            } else {
                this.$("#aggMethod").val(this.model.get("aggMethod"));
                this.$("#aggCid").val(this.model.get("aggCid"));
            }
            if (this.isDeletedSubAggField()) {
                this.$("#subAggMethod").val("COUNT");
                this.$("#subAggCid").val("");
            } else {
                this.$("#subAggMethod").val(this.model.get("subAggMethod"));
                this.$("#subAggCid").val(this.model.get("subAggCid"));
            }
		},

		_setTheme: function() {
			var theme = null;
			if (this.model.get('theme')) {
				theme = this.$('[data-chart-theme="' + this.model.get('theme') + '"]')
			} else {
				theme = this.$el.find('.chart_skin :first');
			}

			theme.addClass('on');
			theme.addClass('chart_skin_on');
		},

		_onClickChartTheme: function(e) {
			var $target = $(e.currentTarget);
			$target.siblings('.on').removeClass('on');
			$target.siblings('.chart_skin_on').removeClass('chart_skin_on');
			$target.addClass('on');
			$target.addClass('chart_skin_on');
		},

        _onChangeCombination: function(e) {
			var isCombination = $(e.currentTarget).is(':checked');
            this._changeCombination(isCombination);
		},

		_onClickCombination: function() {
			this.$('[data-combination-input]').click();
		},

		_changeCombination: function(isCombination) {
            this._toggleCombinationArea(isCombination);
		},

		_onChangeChartType : function() {
			var chartType = this.$("#chartType").val();
			var isGauge = chartType === "GAUGE";
			var isLineOrColumn = chartType === 'LINE' || chartType === 'COLUMN';

			this.$("[el-fields]").toggle(!isGauge);
			this.$("[el-gauge-value-area]").toggle(isGauge);
			this.$("#subFields").toggle(isLineOrColumn);

			if (!isGauge) {
				this.$el.find('[el-gauge-value]').val('');
			}
			if (isLineOrColumn) {
				this.$('#subChartType').val(chartType === 'LINE' ? 'COLUMN' : 'LINE');
			} else {
				this.$el.find("#subFields").val('');
				this.$el.find("#subRangeOption").val('');
				this._onChangeSubField();

				this.$el.find('[data-combination-input]').prop('checked', false);
                this._changeCombination(true);
			}

			this.$el.find('[data-combination-input-area]').toggle(isLineOrColumn);
			this.$el.find('[data-combination-area]').toggle(!!(isLineOrColumn && this.$el.find('[data-combination-input]').is(":checked")));
            this._toggleStack(isLineOrColumn);
            this._toggleSubStack(isLineOrColumn);
		},

		_onChangeField : function() {
			this._toggleDateTimeView(this.$("#fields").find("option:selected").attr("data-value-type"), 'rangeOption');
		},

        _onChangeSubField : function() {
            this._toggleDateTimeView(this.$("#subFields").find("option:selected").attr("data-value-type"), 'subRangeOption');
        },

		_onChangeAggMethod : function() {
			var calcType = this.$("#aggMethod").val();
			var isCount = calcType === "COUNT";

			var aggCid = isCount ? null : this.$("#aggCid").val();
			if(this.numberFields.length > 0 && aggCid == null) {
				this.$("#aggCid").val(this.numberFields.models[0].get("cid"));
			}

			this.$("#aggCid").toggle(!isCount);
		},

        _onChangeSubAggMethod : function() {
            var subAggMethod = this.$("#subAggMethod").val();
            var isCount = subAggMethod === "COUNT";
			var subAggCid = this.$("#subAggCid").val();
			if (!isCount && this.numberFields.length > 0 && subAggCid == null) {
				this.$("#subAggCid").val(this.numberFields.models[0].get("cid"));
			}

            this.$("#subAggCid").toggle(!isCount);
        },

        /**
		 *
         * @param valueType
         * @param key (rangeOption, subRangeOption)
         * @private
         */
		_toggleDateTimeView : function(valueType, key) {
			var $postfix = this.$('#' + key);
			var isDateFormatField = _.contains([VALUE_TYPE.DATE, VALUE_TYPE.DATETIME, VALUE_TYPE.TIME], valueType);
			var isTimeField = VALUE_TYPE.TIME === valueType;

			if (isDateFormatField) { // date, datetime, time
				if (isTimeField) { // time
					$postfix.toggle(false);
				} else { // date, datetime
					$postfix.toggle(true);
				}
			} else { // etc
				$postfix.toggle(false);
			}
		},

		_toggleCombinationArea: function(flag) {
			this.$('[data-combination-area]').toggle(!!flag);
		},

        _toggleStack: function(flag) {
			this.$('#stack').toggle(flag);
		},

        _toggleSubStack: function(flag) {
            this.$('#subStack').toggle(flag);
        },

		_renderTimeFormatItem : function() {
			var $postfix = this.$("select[data-postfix]");
			$postfix.empty();

			_.each(DATE_ITEMS, function(item) {
				$postfix.append(TimeFormatItemTmpl.render({
					type : item,
					label : lang[item]
				}));
			}, this);
		},

		save: function () {
			var groupByValue = this.$el.find("#fields :selected").attr('data-value-type');
			var subGroupByValue = this.$el.find("#subFields :selected").attr('data-value-type');
			var isDateFormatField = _.contains([VALUE_TYPE.DATE, VALUE_TYPE.DATETIME, VALUE_TYPE.TIME], groupByValue);
			if (!isDateFormatField) {
				this.$el.find("#rangeOption").val('');
			}

			isDateFormatField = _.contains([VALUE_TYPE.DATE, VALUE_TYPE.DATETIME, VALUE_TYPE.TIME], subGroupByValue);
			if (!isDateFormatField) {
				this.$el.find("#subRangeOption").val('');
			}

			var aggMethod = this.$el.find("#aggMethod").val();
			if ("COUNT" == aggMethod) {
				this.$el.find("#aggCid").val('');
			}

			this.model.set('title', this.$el.find('#chartTitle').val());
			this.model.set('chartType', this.$el.find("#chartType").val());
			this.model.set('subChartType', this.$el.find("#subChartType").val());
			this.model.set("aggMethod", aggMethod);
			this.model.set("aggCid", this.$el.find("#aggCid").val());
			this.model.set("subAggMethod", this.$el.find("#subAggMethod").val());
			this.model.set("subAggCid", this.$el.find("#subAggCid").val());
			this.model.set('stack', 'true' === this.$el.find("#stack").val());
			this.model.set('subStack', 'true' === this.$el.find("#subStack").val());
			this.model.set("goal", parseInt(this.numberFormView.getValue()));
			this.model.set('groupByCid', this.$el.find("#fields").val());
			this.model.set('rangeOption', this.$el.find("#rangeOption").val());
			this.model.set('subGroupByCid', this.$el.find("#subFields").val());
			this.model.set('theme', this.$el.find('.chart_skin_on').attr('data-chart-theme'));
			this.model.set('subRangeOption', this.$el.find("#subRangeOption").val());
			this.model.set('combination', this.$el.find('[data-combination-input]').prop('checked'));
			this.model.set('aggField', this.$el.find("#aggCid").val());
		},

		isValid: function () {
			if (!this._validateTitle()) {
				return false;
			}

			if (!this._validateGoal()) {
				return false;
			}

			if (!this._validateGroupByCid()) {
				return false;
			}

			if (!this._validateStack()) {
				return false;
			}

			if (!this._validateSubStack()) {
				return false;
			}

			return true;
		},

		_validateTitle : function() {
			var title = this.$el.find('#chartTitle').val();
			if (title.length < 1 || title.length > 20) {
				$.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1 : 1, arg2 : 20}), this.$("#chartTitle"), false, true);
				return false;
			}
			return true;
		},

		_validateGoal : function() {
			var chartType = this.$el.find('#chartType').val();
			if (chartType === "GAUGE" && !this.$el.find('[el-gauge-value]').val()) {
				$.goError(commonLang["필수항목을 입력하지 않았습니다."], this.$("[el-gauge-value]"), false, true);
				return false;
			}
			return true;
		},

		_validateGroupByCid: function() {
			if (this.model.get('subGroupByCid') && !this.model.get('groupByCid')) {
                $.goError(commonLang["필수항목을 입력하지 않았습니다."], this.$("#fields"), false, true);
                this.model.set('subGroupByCid', null);
                this.$("#subFields").val('');
                return false;
			}

			return true;
		},

		_validateStack: function() {
			if (this.model.get('stack') === 'true' && !this.model.get('subGroupByCid')) {
				$.goError(worksLang['누적형 설명'], this.$('#stack'), false, true);
				return false;
			}
			return true;
		},

		_validateSubStack: function() {
			if (this.model.get('subStack') === 'true' && !this.model.get('subGroupByCid')) {
				$.goError(worksLang['누적형 설명'], this.$('#subStack'), false, true);
				return false;
			}
			return true;
		},

		isDeletedAggField : function() {
			return this.model.get("hasDeletedField") && !this.numberFields.hasFieldByCid(this.model.get("aggCid"));
		},

        isDeletedSubAggField : function() {
            return this.model.get("hasDeletedField") && !this.numberFields.hasFieldByCid(this.model.get("subAggCid"));
        }
	});
});

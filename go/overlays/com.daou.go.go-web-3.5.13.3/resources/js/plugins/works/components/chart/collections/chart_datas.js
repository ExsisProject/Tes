define("works/components/chart/collections/chart_datas", function (require) {

    var Backbone = require('backbone');
    var FormulaUtil = require("works/components/formbuilder/form_components/formula/formula_util");

    return Backbone.Collection.extend({

        initialize: function (models, options) {
            this.appletId = options.appletId;
            this.groupByField = options.groupByField;
            this.aggField = options.aggField;
            this.chartType = options.chartType;
            if ('GAUGE' !== this.chartType) {
                this.groupByCid = options.groupByCid;
                this.subGroupByCid = options.subGroupByCid;
            }
            this.rangeOption = options.rangeOption;
            this.subRangeOption = options.subRangeOption;
            this.aggMethod = options.aggMethod;
            this.aggCid = options.aggCid || null;
            this.q = options.q || "";
        },

        url: function () {
            return GO.contextRoot + "api/works/applets/" + this.appletId + "/stats?" + this._makeParam();
        },

        parse: function (resp) {
            if (!this.hasDayTimeFormulaField(this.groupByField) && !this.hasDayTimeFormulaField(this.aggField)) {
                return resp.data;
            }

            if (!_.isUndefined(this.groupByField)) {
                if (this.groupByField.isDateTimeToDayFormulaFieldType()) {
                    _.each(resp.data, function (model) {
                        model.name = FormulaUtil.dateTimeToDayDisplayText(model.name);
                    });
                } else if (this.groupByField.isTimeToTimeFormulaFieldType()) {
                    _.each(resp.data, function (model) {
                        model.name = FormulaUtil.timeToTimeDisplayText(model.name);
                    });
                } else if (this.groupByField.isDateTimeToTimeFormulaFieldType()) {
                    _.each(resp.data, function (model) {
                        model.name = FormulaUtil.dateTimeToTimeDisplayText(model.name);
                    });
                }
            }

            if (!_.isUndefined(this.aggField)) {
                if (this.aggField.isDateTimeToDayFormulaFieldType()) {
                    _.each(resp.data, function (model) {
                        model.value = FormulaUtil.dayToMinuteForDayFormula(model.value);
                    });
                } else if (this.aggField.isDateTimeToTimeFormulaFieldType()) {
                    _.each(resp.data, function (model) {
                        model.value = FormulaUtil.timeToMinuteForDayFormula(model.value);
                    });
                }
            }

            return resp.data;
        },

        hasDayTimeFormulaField: function (field) {
            return !_.isUndefined(field) && field.isDayTimeFormulaFieldType();
        },

        isMultiSeries: function () {
            return !!this.subGroupByCid;
        },

        getMultiSeriesData: function () {
            var data = this.toJSON();
            var map = {};
            var subLegend = this.getSubLegend();
            _.each(data, function (item) {
                _.each(subLegend, function (key) {
                    if (!map[key]) map[key] = [];
                    var foundItem = _.find(item.value, {name: key});
                    map[key].push(foundItem ? foundItem.value : 0);
                });
            });

            return map;
        },

        getSubLegend: function (postfix) {
            postfix = postfix || '';
            var data = this.toJSON();
            var subLegend = [];
            _.each(data, function (item) {
                _.each(item.value, function (subItem) {
                    subLegend.push(subItem.name + postfix);
                });
            });
            subLegend = _.uniq(subLegend);

            return subLegend;
        },

        getLabel: function (datas) {
            datas = datas || this.models;
            return _.map(datas, function (model) {
                return model.get("name");
            });
        },

        getPieData: function () {
            if (this.length >= 100) {
                return _.filter(this.toJSON(), function (model, index) {
                    return index < 100;
                });
            }
            return this.toJSON();
        },

        getPieLabel: function () {
            return this.getLabel();
        },

        getGaugeData: function () {
            var data = this.at(0);
            if (!data) return [];

            data = data.clone();
            data.set("name", "");

            var value = data.get("value");
            if (typeof value === 'number') {
                data.set("value", parseFloat(value.toFixed(2)));
            }
            return [data.toJSON()];
        },

        setQueryString: function (queryString) {
            this.q = queryString;
        },

        _makeParam: function () {
            var param = {
                aggMethod: this.aggMethod,
                aggCid: this.aggCid,
                q: this.q
            };

            if (this.groupByCid) param["groupByCid"] = this.groupByCid;
            if (this.rangeOption) param["rangeOption"] = this.rangeOption;
            if (this.subGroupByCid) param["subGroupByCid"] = this.subGroupByCid;
            if (this.subRangeOption) param["subRangeOption"] = this.subRangeOption;

            /* GO-32401 데이터가 100개가 넘을 경우 VALUE 가 높더라도 그래프에 보이지 않는 현상으로
			 * 원형그래프는 VALUE 내림차순으로 정렬 */
            if ('PIE' === this.chartType) {
                param["sort"] = 'VALUE';
                param["direction"] = 'DESC';
            }

            return $.param(param);
        }
    });
});

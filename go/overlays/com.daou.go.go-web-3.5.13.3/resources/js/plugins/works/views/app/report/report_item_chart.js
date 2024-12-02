define('works/views/app/report/report_item_chart', function (require) {
    var ReportItem = require('works/views/app/report/report_item');
    var FilterView = require("works/views/app/report/works_report_filter");
    var ChartModel = require("works/components/chart/models/chart_setting");
    var ChartSettingView = require("works/components/report/view/chart_setting");
    var ChartView = require("works/components/report/view/chart");
    var Condition = require("works/components/filter/models/filter_condition");
    var Conditions = require("works/components/filter/collections/filter_conditions");

    var EmptyTemplate = require('hgn!works/components/report/template/item_empty_preview');
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        "리포트 아이템 컴포넌트 삭제 경고": worksLang['리포트 아이템 컴포넌트 삭제 경고']
    }

    return ReportItem.extend({
        initialize: function (options) {
            ReportItem.prototype.initialize.call(this, options);
            this.type = 'chart';
            this.chartView = {};

            this.appletId = options.appletId;
            this.fields = options.fields;
            this.chartFields = this.fields.getChartFields();
            this.numberFields = this.fields.getNumberFields();
            this.chartOption = this.chartFields.length ? {fieldCid : this.chartFields.at(0).get("cid")} : {};
            this.conditions = new Conditions();
            this.contentWrap = $(options.contentWrap);

            if (options.chartModel) {
                this.chartModel = options.chartModel;
            } else {
                this.chartOption.title = worksLang["새 차트"];
                this.chartModel = new ChartModel(this.chartOption);
            }
        },

        render: function () {
            if (this._isValidComponent()) {
                this._setChartsView();
                return;
            }

            this._setEmptyView();
        },

        _setChartsView: function (isEmpty) {
            this.chartView = new ChartView({
                model: this.chartModel,
                appletId: this.appletId,
                chartFields: this.chartFields,
                numberFields: this.numberFields,
                useToolbox: false
            });

            this.contentWrap.empty();
            this.contentWrap.append(this.chartView.el);

            this.chartView.render();
            this.chartView._fetchChartData();
        },

        _setEmptyView: function () {
            this.contentWrap.empty();
            this.contentWrap.append(EmptyTemplate({
                lang: lang
            }));
        },

        reload_setting: function () {
            if (!this.chartSettingView.isValid()) {
                return false;
            }

            this.chartSettingView.save();
            this._setChartsView();
            return true;
        },

        reload_filter:function(){
            this.conditions = this.filterView._getConditions();
            this.chartModel.setQueryString(this.filterView._getFilterQuery());
            this.chartView._fetchChartData();
            return true;
        },

        getSettingTmpl: function() {
            this.chartSettingView = new ChartSettingView({
                chartFields : this.chartFields,
                numberFields : this.numberFields,
                model : this.chartModel,
                appletId: this.appletId
            });

            return this.chartSettingView.render().el;
        },

        getFilterTmpl: function() {
            var usedFieldIds = _.map(this.conditions.toJSON(), function (condition) {
                return condition.fieldCid;
            });

            _.each(this.fields.toArray(), function (field) {
                field.set('isUsed', usedFieldIds.includes(field.get('cid')));
            });

            this.filterView = new FilterView({
                conditions: this.conditions.clone(),
                fields: this.fields
            });

            this.conditions = this.filterView._getConditions();
            return this.filterView.render().el;
        },

        _reloadField: function () {
            this.chartFields = this.fields.getChartFields();
            this.numberFields = this.fields.getNumberFields();
            this.chartOption = this.chartFields.length ? {fieldCid : this.chartFields.at(0).get("cid")} : {};
            this.chartModel = new ChartSetting(this.chartOption);
        },

        /**
         * component를 사용하는 필드의 component를 찾을 수 없을 경우 false를 리턴한다.
         * 앱에서 component를 삭제한 경우에 발생한다.
         *
         * @returns {boolean}
         * @private
         */
        _isValidComponent: function () {
            var aggCid = this.chartModel.get('aggCid');
            if (aggCid && !this.chartFields.findByCid(aggCid)) {
                return false;
            }

            var groupByCid = this.chartModel.get('groupByCid');
            if (groupByCid && !this.chartFields.findByCid(groupByCid)) {
                return false;
            }

            var subGroupByCid = this.chartModel.get('subGroupByCid');
            if (subGroupByCid && !this.chartFields.findByCid(subGroupByCid)) {
                return false;
            }

            return true;
        },

        toJSON: function () {
            return {
                chartModel: this.chartModel.attributes,
                conditions: this.conditions.toJSON(),
                type: this.type
            };
        },

        toObject: function (item) {
            this.chartModel = new ChartModel(item.data.chartModel);
            this.conditions = new Conditions();
            this.chartModel.appletId = this.appletId;

            for (var i=0; i<item.data.conditions.length; i++) {
                this.conditions.push(new Condition(item.data.conditions[i]));
            }
        }
    })
})
define('works/views/app/report/report_item_table', function (require) {
    var ReportItem = require('works/views/app/report/report_item');
    var FilterView = require("works/views/app/report/works_report_filter");
    var VALUE_TYPE = require("works/constants/value_type");

    var TableSettingView = require('works/components/report/view/table_setting');
    var TablePreview = require('works/components/report/view/table_preview');
    var TableModel = require('works/components/report/models/table_model');

    var Condition = require("works/components/filter/models/filter_condition");
    var Conditions = require("works/components/filter/collections/filter_conditions");

    return ReportItem.extend({
        initialize: function (options) {
            ReportItem.prototype.initialize.call(this, options);
            this.type = 'data';
            this.appletId = options.appletId;
            this.fields = options.fields;
            this.chartFields = this.fields.getChartFields();
            this.numberFields = this.fields.getNumberFields();

            var standardField = this.chartFields.length ? this.chartFields.toJSON()[0] : {};
            var calculateField = this.chartFields.length ? this.chartFields.toJSON()[0] : {};

            this.tableModel = options.tableModel ? options.tableModel : new TableModel({
                appletId: this.appletId,
                aggMethod: this.aggMethod,
                calculateField: calculateField,
                standardField: standardField,
                rangeOption: this.chartFields.length ?  this.getDefaultRangeOption(calculateField.valueType) : '',
                rowCount: this.rowCount,
                direction: this.direction,
                q: this.q
            });

            this.conditions = new Conditions();
            this.contentWrap = $(options.contentWrap);
        },

        render: function () {
            this._setTableView();
        },

        _setTableView: function () {
            if (!this._isValidComponent()) {
                this._previewRender(true);
                return;
            }

            $.when(
                this.tableModel.fetch()
            ).then($.proxy(function () {
                this._previewRender();
            }, this));
        },

        _previewRender: function (isEmpty) {
            this.tablePreview = new TablePreview({
                model: this.tableModel,
                appletId: this.appletId,
                chartFields: this.chartFields
            });

            this.contentWrap.empty();
            this.contentWrap.append(this.tablePreview.render(isEmpty).el);
        },

        reload_setting: function () {
            if (!this.tableSettingView .isValid()) {
                return false;
            }

            this.tableSettingView.save();
            this._setTableView();
            return true;
        },

        reload_filter:function(){
            this.conditions = this.filterView._getConditions();
            this.tableModel.setQueryString(this.filterView._getFilterQuery());
            this._setTableView();
            return true;
        },

        getSettingTmpl: function() {
            this.tableSettingView = new TableSettingView({
                appletId: this.appletId,
                chartFields: this.chartFields,
                numberFields: this.numberFields,
                model: this.tableModel
            });
            return this.tableSettingView.render().el;
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

            return this.filterView.render().el;
        },

        getDefaultRangeOption: function (valueType) {
            var isDateFormatField = _.contains([VALUE_TYPE.DATE, VALUE_TYPE.DATETIME], valueType);
            var isTimeField = VALUE_TYPE.TIME === valueType;

            if (isTimeField) {
                return "HOUR"
            } else if (isDateFormatField) {
                return "DAY";
            }
            return "";
        },

        toJSON: function () {
            return {
                tableModel: this.tableModel.toJSON(),
                conditions: this.conditions.toJSON(),
                type: this.type
            };
        },

        toObject: function (item) {
            this.tableModel = new TableModel(item.data.tableModel);
            this.conditions = new Conditions();
            this.tableModel.appletId = this.appletId;

            for (var i=0; i<item.data.conditions.length; i++) {
                this.conditions.push(new Condition(item.data.conditions[i]));
            }
        },

        /**
         * component를 사용하는 필드의 component를 찾을 수 없을 경우 false를 리턴한다.
         * 앱에서 component를 삭제한 경우에 발생한다.
         *
         * @returns {boolean}
         * @private
         */
        _isValidComponent: function () {
            if (!this._isValidCid(this.tableModel.get('standardField'))) {
                return false;
            }

            if (!this._isValidCid(this.tableModel.get('calculateField'))) {
                return false;
            }

            var self = this;
            var subQueryStr = this.tableModel.get('subQuery');
            if (!subQueryStr) {
                return true;
            }

            var subComponents = _.filter(JSON.parse(subQueryStr), function (subQuery) {
                var component = self.chartFields.findByCid(subQuery.componentId);
                return component ? false : true;
            })

            if (subComponents.length > 0) {
                return false;
            }

            return true;
        },

        _isValidCid: function (field) {
            var field = this.chartFields.findByCid(field.cid);
            return field ? true : false;
        }
    })
})
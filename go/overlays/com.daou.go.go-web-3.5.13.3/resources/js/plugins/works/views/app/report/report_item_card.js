define('works/views/app/report/report_item_card', function (require) {
    var ReportItem = require('works/views/app/report/report_item');
    var CardModel = require('works/components/report/models/card_model');
    var SettingView = require('works/components/report/view/card_setting');
    var Preview = require('works/components/report/view/card_preview');
    var FilterView = require("works/views/app/report/works_report_filter");
    var Condition = require("works/components/filter/models/filter_condition");
    var Conditions = require("works/components/filter/collections/filter_conditions");

    var worksLang = require('i18n!works/nls/works');

    return ReportItem.extend({
        initialize: function (options) {
            ReportItem.prototype.initialize.call(this, options);
            this.appletId = options.appletId,
            this.type = 'card';
            this.fields = options.fields;
            this.chartFields = this.fields.getChartFields();
            this.contentWrap = $(options.contentWrap);

            this.cardModel = new CardModel({
                'appletId': this.appletId,
                'cid': options.cid ? options.cid : this.chartFields.at(0).get("cid"),
                'title': options.title ? options.title : worksLang["새 카드"],
                'color': options.color ? options.color : 1,
                'method': options.method ? options.method : this._getDefaultMethod(),
                'aggRangeOption': options.aggRangeOption ? options.aggRangeOption : "ALL",
                'compareRangeOption': options.compareRangeOption ? options.compareRangeOption : "DONE",
                'aggStartDate': options.aggStartDate,
                'aggEndDate': options.aggEndDate,
                'isEndDateToday': options.isEndDateToday ? true : false,
                'compareStartDate': options.compareStartDate,
                'compareEndDate': options.compareEndDate
            });

            this.conditions = new Conditions();
        },

        render: function () {
            this._setTableView();
        },

        _setTableView: function() {
            if (!this._isValidComponent()) {
                this.previewRender(true);
                return;
            }

            $.when(
                this.cardModel.fetch()
            ).then($.proxy(function () {
                this.previewRender();
            }, this));
        },

        previewRender: function (isEmpty) {
            this.preview = new Preview({
                model: this.cardModel,
                selectField: this.getFieldByCid(this.cardModel.get('cid'))
            });

            this.contentWrap.empty();
            this.contentWrap.append(this.preview.render(isEmpty).el);
            this.autoResize();
        },

        getSettingTmpl: function() {
            this.settingView = new SettingView({
                appletId: this.appletId,
                fields: this.fields,
                model: this.cardModel
            });
            return this.settingView.render().el;
        },

        reload_filter:function(){
            this.conditions = this.filterView._getConditions();
            this.cardModel.setQueryString(this.filterView._getFilterQuery());
            this._setTableView();
            return true;
        },

        getFilterTmpl: function() {
            var usedFieldIds = _.map(this.conditions.toJSON(), function (condition) {
                return condition.fieldCid;
            });

            var fields = this.fields.clone();
            _.each(fields.toArray(), function (field) {
                if ('create_date' === field.get('cid')) {
                    fields.remove(field);
                    return;
                }

                field.set('isUsed', usedFieldIds.includes(field.get('cid')));
            });

            this.filterView = new FilterView({
                conditions: this.conditions.clone(),
                fields: fields
            });

            return this.filterView.render().el;
        },

        reload_setting: function () {
            if (!this.settingView.isValid()) {
                return false;
            }

            this.settingView.save();
            this.render();
            return true;
        },

        getFieldByCid: function (cid) {
            return _.find(this.chartFields.toJSON(), function (field) {
                return field.cid == cid;
            });
        },

        autoResize : function () {
            var itemEl = this.contentWrap;
            var cardEl = itemEl.children();

            var itemHeight = itemEl.height();
            var cardHeight = cardEl.height();

            var marginHeight = (itemHeight - cardHeight)/2;
            if (marginHeight < 0) {
                marginHeight = 0;
            }

            cardEl.css('margin-top', marginHeight);
        },

        _getDefaultMethod: function () {
            var field = this.chartFields.at(0);
            if ('NUMBER' === field.get('fieldType').toUpperCase()) {
                return 'SUM';
            }
            return 'COUNT';
        },

        /**
         * component를 사용하는 필드의 component를 찾을 수 없을 경우 false를 리턴한다.
         * 앱에서 component를 삭제한 경우에 발생한다.
         *
         * @returns {boolean}
         * @private
         */
        _isValidComponent: function () {
            var field = this.chartFields.findByCid(this.cardModel.get('cid'));
            if (!field) {
                return false;
            }

            return true;
        },

        toJSON: function () {
            return {
                cardModel: this.cardModel.toJSON(),
                conditions: this.conditions.toJSON(),
                type: this.type
            };
        },

        toObject: function (item) {
            this.cardModel = new CardModel(item.data.cardModel);
            this.cardModel.appletId = this.appletId;
            this.conditions = new Conditions();

            var self = this;
            _.forEach(item.data.conditions, function (condition) {
                self.conditions.push(new Condition(condition));
            });
        }
    })
})
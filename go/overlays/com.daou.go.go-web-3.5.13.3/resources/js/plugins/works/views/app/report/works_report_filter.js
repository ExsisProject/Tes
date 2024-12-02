define("works/views/app/report/works_report_filter", function (require) {

    var FieldAddButtonView = require("works/components/filter/views/filter_condition_add_button");
    var FilterTemplate = require("hgn!works/components/report/template/report_filter");
    var Filter = require("works/components/filter/models/filter");

    var Condition = require("works/components/filter/models/filter_condition");
    var Conditions = require("works/components/filter/collections/filter_conditions");
    var ConditionButtonView = require("works/components/filter/views/filter_condition_button");
    var VALUE_TYPE = require('works/constants/value_type');

    return Backbone.View.extend({
        initialize: function (options) {
            this.template = FilterTemplate;
            this.fields = options.fields;

            this.conditions = options.conditions || new Conditions();
            this.conditions.on("unuseCondition", this._onUnuseCondition, this);

            this._initFilter({conditions: this.conditions.toJSON()});
        },

        render: function () {
            this.$el.html(this.template(_.extend({
                model: this.filter.toJSON()
            }, this.templateParam)));

            this._renderFieldAddButton();
            this._renderConditions(this.conditions);

            return this;
        },

        _initFilter: function (data, type) {
            var filterOption = {
                appletId: this.appletId,
                type: type || 'mine',
                useDocNo: this.useDocNo || false
            };
            if (_.isObject(data)) {
                this.filter = new Filter(_.extend(data, {useDocNo: this.useDocNo || false}));
                this.conditions.reset(data.conditions);
            } else if (data === 'createdBy') {	// '내가등록한데이터' 필터
                this.filter = new Filter(_.extend(filterOption, Filter.getCreatedByFilterOptions()));
                this.conditions.reset(this.filter.get("conditions"));
            } else {
                if (parseInt(data) > 0) filterOption['id'] = parseInt(data);
                this.filter = new Filter(filterOption);
            }

            this.filter.off("sync");
            this.filter.on("sync", this._onSyncFilter, this);
            this.filter.off("change:name");
            this.filter.on("change:name", this._onChangeNameOfFilter, this);
        },

        _renderFieldAddButton: function () {
            var view = new FieldAddButtonView({
                useCheckbox: this.useCheckbox,
                type: VALUE_TYPE.SELECT,
                collection: this.fields.getFilterFields()
            });
            view.$el.on('addCondition', _.bind(this._onToggleFieldOption, this));

            this.$("#fieldManagerAndConditionsArea").append(view.render().el);
        },

        _onToggleFieldOption: function (e, fieldModel) {
            var condition;
            var isUsed = fieldModel.get("isUsed");
            if (isUsed) {
                var conditionObj = fieldModel.fieldToCondition();
                condition = new Condition(conditionObj);
                var field = this.fields.findWhere({cid: condition.get("fieldCid")});

                condition.setDefaultValues();
                condition.mergeFromFields(this.fields.toJSON());

                this.conditions.push(condition);
                this._renderConditionButton({
                    type: field.get('fieldType'),
                    valueType: field.get('valueType'),
                    model: condition
                }, true);
            } else {
                condition = this.conditions.findWhere({fieldCid: fieldModel.get("cid")});
                condition.trigger("unusedItem", [condition]);
            }
        },

        _renderConditionButton: function (options, isInstantSearch) {
            var view = new ConditionButtonView(_.extend(options, {fields: this.fields, zIndex: 999}));
            this.$("#fieldManagerAndConditionsArea").append(view.render().el);
            view.$el.find('td:last').css('width', 'auto');
        },

        _renderConditions: function (conditions) {
            conditions.each(function (condition) {
                var field = this.fields.findWhere({cid: condition.get("fieldCid")});
                // 서버에서 내려온 condition 은 없어진 값일수도 있다. fields 에 없는 condition 이면 무시하도록 한다.
                if (!field) return;
                var fieldType = field.get('fieldType');
                var valueType = field.get('valueType');
                if (!fieldType) return;

                this._renderConditionButton({
                    type: fieldType, // @deprecated
                    valueType: valueType,
                    model: condition
                });
            }, this);
        },

        _clearConditionButtons: function () {
            if (this.$listEl) {
                this.$listEl.find("div[el-condition]").remove();
            }
        },

        _getFilterQuery: function () {
            this.filter.set('conditions', this.conditions.toJSON());
            return this.filter.getSearchQuery();
        },

        _getConditions: function () {
            return this.conditions;
        },

        _onUnuseCondition: function (conditionModel) {
            var field = this.fields.findWhere({cid: conditionModel.get("fieldCid")});
            field.set("isUsed", false);
            this.conditions.remove([conditionModel]);
            this.filter.set('conditions', this.conditions.toJSON());
        },
    })
});

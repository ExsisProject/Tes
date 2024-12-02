define('works/components/formbuilder/form_components/input_select/input_select', function (require) {

    var GO = require('app');
    //var Hogan = require('hogan');
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');
    var OptionListSettingView = require('works/components/formbuilder/core/views/option_list_setting');

    var Validator = require('works/components/formbuilder/form_components/input_select/input_select_validator');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/input_select/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/input_select/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/input_select/option');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');
    var CONSTANTS = require('works/constants/works');

    var REQUIRED_VAL = CONSTANTS.WORKS_COMPONENTS.WORKS_REQUIRED_VAL;

    var lang = {
        "이름": commonLang["이름"],
        "설명": worksLang["설명"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        "툴팁으로 표현": worksLang["툴팁으로 표현"],
        "필수 입력 컴포넌트": worksLang["필수 입력 컴포넌트"],
        "기본값": worksLang["기본값"],
        "세부항목": worksLang["세부항목"],
        "추가": commonLang["추가"],
        "삭제": commonLang["삭제"],
        "이름숨기기": worksLang["이름숨기기"]
    };

    var OptionView = BaseOptionView.extend({
        customEvents: {
            "click span#add_option": "_addOptionItem",
            "click input#required": "_checkRequireOptionItem"
        },

        renderBody: function () {
            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON()
            }));
            this._attachOptionListItemView();
        },

        remove: function () {
            BaseOptionView.prototype.remove.apply(this, arguments);
            if (this.optionListSettingView) {
                this.optionListSettingView.remove();
            }
        },

        _attachOptionListItemView: function () {
            this.optionListSettingView = new OptionListSettingView({model: this.model});
            this.$('.option-item-list').append(this.optionListSettingView.el);
            this.optionListSettingView.render();
        },

        _addOptionItem: function () {
            if (this.optionListSettingView) {
                this.optionListSettingView.addOptionItem();
            }
        },

        _checkRequireOptionItem: function (e) {
            if (this.optionListSettingView) {
                this.optionListSettingView.checkRequireOptionItem($(e.currentTarget).is(":checked"));
            }
        }
    });

    var FormView = BaseFormView.extend({

        events: {
            'change select': '_onChange'
        },

        initialize: function() {
            BaseFormView.prototype.initialize.apply(this, arguments);
            this.validator = new Validator();
        },

        render: function () {
            var val = this.appletDocModel.get(this.clientId);

            /**
             * 기본값을 사용하는 경우:
             * 1. 등록이면서, 값이 없는 경우. (ex 복사할때 매칭되는 값이 없는 경우)
             *
             * 기본값을 사용하지 않는 경우:
             * 1. 등록이면서, 값이 있는 경우 (ex 복사할때 매칭되는 값이 있는 경우)
             * 2. 수정시.
             */
            // if (!val && !this.isEditable() && !this.appletDocModel.id) {
            if ((_.isUndefined(val) || _.isNull(val)) && !this.isEditable() && !this.appletDocModel.id && this.isShow()) {
                val = this.model.get('defaultValue');
            }

            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                isDisabled: this.isEditable()
            }));

            //문서수정시 선택한 값 select (폼수정시 디폴트옵션을 선택함에 따라 미리보기가 바뀌어야함으로 아래로직을 타면 안됨)
            if (!_.isUndefined(val) && !this.isEditable()) {
                this.$('select').val(val);
            }

            /**
             * 값을 세팅하지 않는 경우:
             * 1. 수정이면서, 값이 없는 경우 (ex 문서가 이미 등록된 상태에서 나중에 컴포넌트가 추가된 경우)
             */
            if (_.isUndefined(val) && this.appletDocModel.id) {
                this.$('select').prepend('<option value="-1">---</option>').val(-1);
            }

            this.appletDocModel.set(this.clientId, val);

            if (this.isShow()) {
                this._onChange();
            }
        },

        _onChange: function () {
            this.$('option[value="-1"]').remove();
            this._changeValue.call(this, this._getValue());
            this.appletDocModel.set(this.getDataFromView());
        },

        _getValue: function () {
            var values = [];
            if (this.isMultiple()) {
                values = [];
                values.push(this.getSubmitValue());
                _.each(this.getMultipleViews(), function (multiView) {
                    values.push(multiView.getSubmitValue());
                });

            } else {
                values = this.getSubmitValue();
            }
            return values;
        },

        validate: function () {
            var $elements = this.$('select');

            var result = this.validator.validate({value:$elements.val()}, this.model.toJSON());
            if (!result.isValid) {
                this.printErrorTo($elements, result.message);
            }

            return result.isValid;
        },

        getFormData: function () {
            if (this.isMultiple()) {
                this.appletDocModel.set(this.clientId, this._getMultipleData());
            }
            return this.appletDocModel.toJSON();
        },

        getDataFromView: function () {
            var returnData = {};
            returnData[this.getCid()] = this._getValue();
            return returnData;
        },

        getSubmitValue: function () {
            return this.$('select').val();
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            var items = this.model.get('items'),
                selectValue = this.appletDocModel.get(this.clientId),
                selectDisplayText = "";

            $.each(items, function (i, k) {
                if (k.value == selectValue) {
                    selectDisplayText = k.displayText;
                }
            });

            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                userData: selectDisplayText
            }));
        },
        getTitle: function () {
            var items = this.model.get('items'),
                selectValue = this.appletDocModel.get(this.clientId),
                selectDisplayText = "";

            $.each(items, function (i, k) {
                if (k.value == selectValue) {
                    selectDisplayText = k.displayText;
                }
            });
            return selectDisplayText;
        }
    });

    var InputSelectComponent = FormComponent.define(ComponentType.Select, {
        name: worksLang['드롭 박스'],
        valueType: 'SELECT',
        group: 'basic',

        properties: {
            "label": {defaultValue: worksLang['드롭 박스']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "required": {defaultValue: false},
            //공통속성

            "defaultValue": {defaultValue: '0'},
            "items": {
                defaultValue: [
                    {"value": REQUIRED_VAL, "displayText": worksLang['선택안함'], "selected": false, "isDisabled": true},
                    {"value": '0', "displayText": worksLang['옵션1'], "selected": true},
                    {"value": '1', "displayText": worksLang['옵션2'], "selected": false},
                    {"value": '2', "displayText": worksLang['옵션3'], "selected": false}
                ]
            }
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(InputSelectComponent);
});

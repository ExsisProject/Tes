define('works/components/formbuilder/form_components/input_radio/input_radio', function (require) {

    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');
    var OptionListSettingView = require('works/components/formbuilder/core/views/option_list_setting');

    var Validator = require('works/components/formbuilder/form_components/input_radio/input_radio_validator');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/input_radio/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/input_radio/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/input_radio/option');

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
        "레이아웃 설정": worksLang["레이아웃 설정"],
        "가로": worksLang["가로"],
        "세로": worksLang["세로"],
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
                model: this.model.toJSON(),
                isHorizontal: this.model.get('align') == 'horizontal'
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
            'change input': '_onChange'
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
            if (_.isUndefined(val) && !this.isEditable() && !this.appletDocModel.id && this.isShow()) {
                val = this.model.get('defaultValue');
            }

            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                clientId: this.clientId,
                label: GO.util.escapeHtml(this.model.get('label')),
                isHorizontal: this.model.get('align') == 'horizontal',
                isDisabled: this.isEditable()
            }));

            if (!_.isUndefined(val) && !this.isEditable()) {
                this.$('input[value="' + val + '"]').prop('checked', true);
            }

            /**
             * 값을 세팅하지 않는 경우:
             * 1. 수정이면서, 값이 없는 경우 (ex 문서가 이미 등록된 상태에서 나중에 컴포넌트가 추가된 경우)
             */
            if (_.isUndefined(val) && this.appletDocModel.id) {
                this.$('input:checked').prop('checked', false);
            }

            this.appletDocModel.set(this.clientId, val);
            if (this.isShow()) {
                this._onChange();
            }
        },

        _onChange: function () {
            this._changeValue.call(this, this._getValue());
            this.appletDocModel.set(this.getDataFromView());
        },

        _getValue: function () {
            return this.$('input[type="radio"]:checked').val();
        },

        validate: function () {
            var $elements = this.$('input[type="radio"]:checked');

            var validationData = {value:$elements.val(), count:$elements.length};
            var result = this.validator.validate(validationData, this.model.toJSON());
            if (!result.isValid) {
                this.printErrorTo($elements, result.message);
            }
            return result.isValid;
        },

        //getFormData: function() {
        //    return this.appletDocModel.toJSON();
        //},

        getDataFromView: function () {
            var result = {};
            result[this.clientId] = this._getValue();
            return result;
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

    var InputRadioComponent = FormComponent.define(ComponentType.Radio, {
        name: worksLang['단일 선택'],
        valueType: 'SELECT',
        group: 'basic',

        properties: {
            "label": {defaultValue: worksLang['단일 선택']},
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
            },
            "align": {defaultValue: 'horizontal'}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(InputRadioComponent);
});

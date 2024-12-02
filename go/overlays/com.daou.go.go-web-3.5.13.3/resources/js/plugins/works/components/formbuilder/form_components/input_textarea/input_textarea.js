define('works/components/formbuilder/form_components/input_textarea/input_textarea', function (require) {

    var GO = require('app');
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var Validator = require('works/components/formbuilder/form_components/input_textarea/input_textarea_validator');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/input_textarea/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/input_textarea/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/input_textarea/option');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    var lang = {
        "이름": commonLang["이름"],
        "설명": worksLang["설명"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        "툴팁으로 표현": worksLang["툴팁으로 표현"],
        "필수 입력 컴포넌트": worksLang["필수 입력 컴포넌트"],
        "기본값": worksLang["기본값"],
        "최소 입력 수": worksLang["최소 입력 수"],
        "최대 입력 수": worksLang["최대 입력 수"],
        "입력 너비 조절": worksLang["입력 너비 조절"],
        "퍼센트설명": worksLang["퍼센트설명"],
        "입력 높이 조절": worksLang["입력 높이 조절"],
        "줄": worksLang["줄"],
        "이름숨기기": worksLang["이름숨기기"]
    };

    var defaultValues = {
        width: 100,
        widthUnit: 'percent',
        rows: 10
    };

    var OptionView = BaseOptionView.extend({

        customEvents: {
            "blur input[name=rows], input[name=width]": "_checkOptionValidate"
        },

        renderBody: function () {

            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON(),
                isWidthUnitPx: this.model.get('widthUnit') === 'px'
            }));
        },
        _checkOptionValidate: function (e) {
            var $target = $(e.currentTarget),
                $targetName = $target.attr('name'),
                $targetValue = $target.val();

            if ($targetValue == '' && _.has(defaultValues, $targetName)) {
                $target.val(defaultValues[$targetName]);
                this.model.set($targetName, defaultValues[$targetName]);
            }
        }
    });

    var FormView = BaseFormView.extend({

        events: {
            'change textarea': '_onChange'
        },
        initialize: function() {
            BaseFormView.prototype.initialize.apply(this, arguments);
            this.validator = new Validator();
        },

        render: function () {
            var value = this.appletDocModel.get(this.clientId);
            if (!value) {
                var defaultValue = this.model.get('defaultValue');
                if (defaultValue) this.appletDocModel.set(this.clientId, defaultValue);
            }
            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                clientId: this.clientId,
                inputValue: this._getInputValue(),
                isReadonly: this.isEditable(),
                "editable?": this.isEditable()
            }));
            this.resizeWidth(this.model.get('width'), this.model.get('widthUnit') === 'percent' ? '%' : this.model.get('widthUnit'));
        },

        //getFormData: function() {
        //    return this.appletDocModel.toJSON();
        //},

        getDataFromView: function () {
            var result = {};
            result[this.clientId] = this._getInputElement().val();
            return result;
        },

        validate: function () {
            var $text = this.$('textarea');
            var textValue = $text.val();

            var result = this.validator.validate({value:textValue}, this.model.toJSON());
            if (!result.isValid) {
                this._printErrorTo(result.message);
            }

            return result.isValid;
        },

        /**
         * @Override
         */
        resizeWidth: function (width, unit) {
            this._getInputElement().outerWidth(width + unit);
        },

        _onChange: function () {
            this.appletDocModel.set(this.getDataFromView());
        },

        _printErrorTo: function (msg) {
            var $text = this.$('textarea');
            $text.trigger('focus');
            this.printErrorTo($text, msg);
        },

        _getInputElement: function () {
            return this.$('textarea');
        },

        _getInputValue: function () {
            var val = this.appletDocModel.get(this.clientId);
            var result = this.appletDocModel.id ? val : this.model.get('defaultValue');
            if (val && val.toString().length > 0) { // array, string, number
                result = val;
            }
            return result;
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            var replaceUserData = this._convertTitleFormat();
            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                userData: replaceUserData
            }));
            this.resizeWidth(this.model.get('width'), this.model.get('widthUnit') === 'percent' ? '%' : this.model.get('widthUnit'));
        },

        getTitle: function () {
            return this._convertTitleFormat();
        },

        /**
         * @Override
         */
        resizeWidth: function (width, unit) {
            this._getInputElement().outerWidth(width + unit);
        },

        _convertTitleFormat: function (str) { //str인자로 받는이유?
            var title = GO.util.textToHtml(this.appletDocModel.get(this.clientId));

            return title;
        },

        _getInputElement: function () {
            return this.$('textarea');
        },
    });

    var InputTextareaComponent = FormComponent.define(ComponentType.Textarea, {
        name: worksLang['멀티 텍스트'],
        valueType: 'TEXT',
        group: 'basic',

        properties: {
            "label": {defaultValue: worksLang['멀티 텍스트']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "required": {defaultValue: false},
            //공통속성

            "defaultValue": {defaultValue: ''},

            "width": {defaultValue: defaultValues.width},
            "widthUnit": {defaultValue: defaultValues.widthUnit},

            "rows": {defaultValue: defaultValues.rows}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(InputTextareaComponent);
});

define('works/components/formbuilder/form_components/input_listbox/input_listbox', function (require) {

    var GO = require('app');
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');
    var OptionListSettingView = require('works/components/formbuilder/core/views/option_list_setting');

    var Validator = require('works/components/formbuilder/form_components/input_listbox/input_listbox_validator');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/input_listbox/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/input_listbox/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/input_listbox/option');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    var WorksUtil = require('works/libs/util');

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
        "선택 최소 개수": worksLang["선택 최소 개수"],
        "선택 최대 개수": worksLang["선택 최대 개수"],
        "이름숨기기": worksLang["이름숨기기"]
    };
    var defaultValues = {
        minCheckedCount: 0,
        maxCheckedCount: 3
    };

    var OptionView = BaseOptionView.extend({

        customEvents: {
            "keypress input[name=minCheckedCount], input[name=maxCheckedCount]": "onlyNumber",
            "keyup input[name=minCheckedCount], input[name=maxCheckedCount]": "replaceNumber",
            "click span#add_option": "_addOptionItem",
            "blur input[name=minCheckedCount], input[name=maxCheckedCount]": "_checkOptionValidate"
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
            this.optionListSettingView = new OptionListSettingView({
                model: this.model,
                checkType: OptionListSettingView.TYPE_CHECKBOX
            });
            this.$('.option-item-list').append(this.optionListSettingView.el);
            this.optionListSettingView.render();
        },

        _addOptionItem: function () {
            if (this.optionListSettingView) {
                this.optionListSettingView.addOptionItem();
            }
        },

        _checkOptionValidate: function (e) {
            var $target = $(e.currentTarget),
                $targetName = $target.attr('name'),
                $targetValue = $target.val();

            if ($targetValue == '' && _.has(defaultValues, $targetName)) {
                $target.val(defaultValues[$targetName]);
                this.model.set($targetName, defaultValues[$targetName]);
            }

            var inputMinCheckedCount = $("input[name=minCheckedCount]");
            if (inputMinCheckedCount.val() > $("input[name=maxCheckedCount]").val()) {
                inputMinCheckedCount.val(defaultValues['minCheckedCount']);
                this.model.set('minCheckedCount', defaultValues['minCheckedCount']);
            }
        },

        onlyNumber: function (e) {
            var keyCode = e.keyCode ? e.keyCode : e.which;
            if (!WorksUtil.isNumber(keyCode)) { //숫자가 아니면
                e.preventDefault();
                return false;
            }
        },

        replaceNumber: function (e) { //keypress가 한글에서는 이벤트가 동작하지 않는 버그때문에 keyup을 통해 막아야함. 근데 그것도 키보드 동시에 2개 누르면 못막는 버그가 있어서 replace해야함
            var keyCode = e.keyCode ? e.keyCode : e.which;
            if (!WorksUtil.isNumber(keyCode)) { //숫자가 아니면
                var replace = $(e.currentTarget).val().replace(/[^0-9]/gi, '');
                $(e.currentTarget).val(replace);
                e.preventDefault();
                return false;
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
        /**
         * 기본값: model.get('items') > selected
         * 기본값을 사용하는 경우:
         * 1. 등록이면서, 값이 없는 경우. (ex 복사할때 매칭되는 값이 없는 경우)
         *
         * 기본값을 사용하지 않는 경우:
         * 1. 등록이면서, 값이 있는 경우 (ex 복사할때 매칭되는 값이 있는 경우)
         * 2. 수정시.
         */
        render: function () {
            var _this = this;
            var val = this.appletDocModel.get(this.clientId);
            if (!val) {
                val = [];
            }
            var model = new Backbone.Model($.extend(true, {}, this.model.toJSON()));
            if (this.appletDocModel.id || (!this.appletDocModel.id && val.length)) {
                _.each(model.get("items"), function (item) {
                    item.selected = _.contains(val, parseInt(item.value));
                });
            }

            //처음 등록시 디폴트값을 val에 push
            if (val.length < 1 && !this.isEditable() && !this.appletDocModel.id && this.isShow()) {
                _.each(model.get("items"), function (item) {
                    if (item.selected) {
                        val.push(item.value);
                    }
                });
            }

            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                clientId: this.clientId,
                isDisabled: this.isEditable()
            }));

            //등록, 수정시 체크박스에 체크
            if (val.length > 0 && !this.isEditable()) {
                _.each(val, function (item) {
                    _this.$('input[value="' + item + '"]').prop('checked', true);
                });

            }

            if (this.isShow()) {
                this._onChange();
            }
        },

        _onChange: function () {
            this._changeValue.call(this, this._getValue());
            this.appletDocModel.set(this.getDataFromView());
        },

        _getValue: function () {
            var $checkedBoxes = this.$('input[type=checkbox]:checked');
            var $checkedValues = [];
            $.each($checkedBoxes, function (i, k) {
                $checkedValues.push(parseInt(k.value));
            });
            return $checkedValues;
        },

        getDataFromView: function () {
            var result = {};
            result[this.clientId] = this._getValue();
            return result;
        },

        validate: function () {
            var $msgTarget = this.$('.txt_list_box');
            var $checkedboxes = this.$('input[type=checkbox]:checked');

            var result = this.validator.validate({count:$checkedboxes.length}, this.model.toJSON());
            if (!result.isValid) {
                this.printErrorTo($msgTarget, result.message);
            }

            return result.isValid;
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            if (!this._getVisible()) return;

            var items = this.model.get('items'),
                selectedItems = this.appletDocModel.get(this.clientId),
                displayText = "";

            if (selectedItems) {
                $.each(items, function (i, item) {
                    $.each(selectedItems, function (i, selectedItem) {
                        if (item.value == selectedItem) {
                            if (displayText == "") {
                                displayText = item.displayText;
                            } else {
                                displayText += ', ' + item.displayText;
                            }
                        }
                    });
                });
            }

            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                userData: displayText
            }));
        },
        getTitle: function () {
            var model = this.model.toJSON();
            var val = this.appletDocModel.get(this.clientId);
            _.each(model.items, function (m) {
                m['selected'] = _.indexOf(val, parseInt(m.value)) != -1
            });

            return _.pluck(_.where(model.items, {selected: true}), 'displayText').join(', ');
        }
    });

    var InputListboxComponent = FormComponent.define(ComponentType.ListBox, {
        name: worksLang['리스트박스'],
        valueType: 'SELECTS',
        group: 'basic',

        properties: {
            "label": {defaultValue: worksLang['리스트박스']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "required": {defaultValue: false},
            //공통속성

            "items": {
                defaultValue: [
                    {"value": '0', "displayText": worksLang['옵션1'], "selected": true},
                    {"value": '1', "displayText": worksLang['옵션2'], "selected": false},
                    {"value": '2', "displayText": worksLang['옵션3'], "selected": false}
                ]
            },

            "minCheckedCount": {defaultValue: defaultValues.minCheckedCount},
            "maxCheckedCount": {defaultValue: defaultValues.maxCheckedCount}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(InputListboxComponent);
});

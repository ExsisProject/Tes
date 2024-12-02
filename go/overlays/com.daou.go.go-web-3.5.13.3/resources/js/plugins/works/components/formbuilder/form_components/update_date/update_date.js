define('works/components/formbuilder/form_components/update_date/update_date', function (require) {

    var GO = require('app');
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/update_date/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/update_date/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/update_date/option');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    var lang = {
        "이름": commonLang["이름"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "이름숨기기": worksLang["이름숨기기"],
        "자동입력": worksLang["자동입력"]
    };

    var OptionView = BaseOptionView.extend({

        customEvents: {},

        renderBody: function () {
            this.$el.html(renderOptionTpl({
                model: this.model.toJSON(),
                lang: lang
            }));
        }
    });

    var FormView = BaseFormView.extend({
        render: function () {
            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                lang: lang
            }));
        },

        getFormData: function () {
            return null;
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            var value = this.appletDocModel.get(this.clientId);
            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                userData: value ? GO.util.basicDate(value) : "-",
                lang: lang
            }));
        },
        getTitle: function () {
            var date = this.appletDocModel.get(this.clientId);
            if (date != null) {
                return GO.util.basicDate(date);
            } else {
                return "";
            }
        }
    });

    var UpdateDateComponent = FormComponent.define(ComponentType.UpdateDate, {
        type: 'update_date',
        name: worksLang['변경일'],
        valueType: 'DATETIME',
        group: 'basic',
        cid: 'update_date',

        properties: {
            "label": {defaultValue: worksLang['변경일']},
            "hideLabel": {defaultValue: false}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(UpdateDateComponent);
});

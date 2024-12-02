define('works/components/formbuilder/form_components/updater/updater', function (require) {

    var GO = require('app');
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/updater/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/updater/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/updater/option');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');
    var lang = {
        "자동입력": worksLang["자동입력"],
        "이름": commonLang["이름"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "이름숨기기": worksLang["이름숨기기"]
    };

    var OptionView = BaseOptionView.extend({
        // customEvents: {},
        renderBody: function () {
            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON()
            }));
        }
    });

    var FormView = BaseFormView.extend({
        render: function () {
            this.$body.html(renderFormTpl({
                lang: lang,
                label: GO.util.escapeHtml(this.model.get('label')),
                model: this.model.toJSON()
            }));
        },

        getFormData: function () {
            return null;
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            var updater = this.appletDocModel.get(this.clientId);
            if (updater) {
                var updaterName = this.appletDocModel.get(this.clientId).name,
                    updaterPosition = " " + this.appletDocModel.get(this.clientId).position;
            }

            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                userData: updater ? updaterName.concat(updaterPosition) : ""
            }));
        },
        getTitle: function () {
            var updaterName = this.appletDocModel.get(this.clientId).name;
            var updaterPosition = " " + this.appletDocModel.get(this.clientId).position;
            return updaterName.concat(updaterPosition);
        }
    });

    var InputFileComponent = FormComponent.define(ComponentType.Updater, {
        name: worksLang['변경자'],
        valueType: 'USER',
        group: 'basic',
        cid: 'updater',

        properties: {
            "label": {defaultValue: worksLang['변경자']},
            "hideLabel": {defaultValue: false}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(InputFileComponent);
});

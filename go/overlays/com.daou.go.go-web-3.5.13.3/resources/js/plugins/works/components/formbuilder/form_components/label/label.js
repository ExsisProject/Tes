define('works/components/formbuilder/form_components/label/label', function (require) {

    var GO = require('app');
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/label/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/label/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/label/option');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');
    var lang = {
        "이름": commonLang["이름"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."]
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
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label'))
            }));
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label'))
            }));
        },
        getTitle: function () {
            return this.model.get('label');
        }
    });

    var InputLabelComponent = FormComponent.define(ComponentType.Label, {
        name: worksLang['라벨'],
        //valueType: 'STRING',
        group: 'design',
        properties: {
            "label": {defaultValue: worksLang['라벨']}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(InputLabelComponent);
});

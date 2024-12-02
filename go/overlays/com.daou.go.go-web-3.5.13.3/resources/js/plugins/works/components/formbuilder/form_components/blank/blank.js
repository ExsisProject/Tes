define('works/components/formbuilder/form_components/blank/blank', function (require) {

    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/blank/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/blank/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/blank/option');

    var worksLang = require("i18n!works/nls/works");
    var lang = {
        "빈 영역입니다": worksLang["빈 영역입니다."],
        "공백 높이 조절": worksLang["공백 높이 조절"],
        "최소 높이 설명": worksLang["최소 높이 설명"]
    };

    var OptionView = BaseOptionView.extend({
        customEvents: {
            "keyup input[name=height]": '_updateHeight'
        },

        renderBody: function () {
            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON()
            }));
        },

        _updateHeight: function (e) {
            if ($('input[name=height]').val() < 20) {
                return false;
            }
            var $target = $(e.currentTarget);
            this.model.set($target.attr('name'), $target.val());
        }
    });

    var FormView = BaseFormView.extend({
        render: function () {
            this.$body.html(renderFormTpl({
                lang: lang,
                model: this.model.toJSON()
            }));
            this.targetResizeHeight(this.$el.find('.blank'), this.model.get('height'));
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            this.$body.html(renderDetailTpl({
                model: this.model.toJSON()
            }));
            this.targetResizeHeight(this.$el.find('.blank'), this.model.get('height'));
        }
    });

    var BlankComponent = FormComponent.define(ComponentType.Blank, {
        type: 'blank',
        name: worksLang['공백'],
        //valueType: 'STRING',
        group: 'design',
        properties: {
            "height": {defaultValue: 100}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(BlankComponent);
});

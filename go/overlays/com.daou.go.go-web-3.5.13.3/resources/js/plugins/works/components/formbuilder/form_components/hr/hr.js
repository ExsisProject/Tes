define('works/components/formbuilder/form_components/hr/hr', function (require) {

    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/hr/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/hr/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/hr/option');

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
        "세부항목": worksLang["세부항목"],
        "추가": commonLang["추가"],
        "삭제": commonLang["삭제"],
        "이름숨기기": worksLang["이름숨기기"],
        "라인": worksLang["라인"]
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
                lang: lang
            }));
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                lang: lang
            }));
        }
    });

    var HrComponent = FormComponent.define(ComponentType.Hr, {
        type: 'hr',
        name: worksLang['라인'],
        //valueType: 'STRING',
        group: 'design',

        properties: {},

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(HrComponent);
});

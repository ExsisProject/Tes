define('works/components/formbuilder/form_components/create_date/create_date', function (require) {

    var GO = require('app');
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/create_date/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/create_date/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/create_date/option');

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
        "사용자 선택 허용 수": worksLang["사용자 선택 허용 수"],
        "제한 없음": worksLang["제한 없음"],
        "기본 값 지정": worksLang["기본 값 지정"],
        "등록자를 기본값으로 지정": worksLang["등록자를 기본값으로 지정"],
        "자동입력": worksLang["자동입력"],
        "등록자": commonLang['등록자']
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

    var CreateDateComponent = FormComponent.define(ComponentType.CreateDate, {
        type: 'create_date',
        name: commonLang['등록일'],
        valueType: 'DATETIME',
        group: 'basic',
        cid: 'create_date',

        properties: {
            "label": {defaultValue: commonLang['등록일']},
            "hideLabel": {defaultValue: false}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(CreateDateComponent);
});

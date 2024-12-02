define('works/views/app/doc_content_edit', function (require) {

    var FormBuilder = require('works/components/formbuilder/formbuilder');
    var Template = require('hgn!works/templates/app/doc_content_edit');

    var commonLang = require('i18n!nls/commons');
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        confirm: commonLang['확인'],
        cancel: commonLang['취소'],
        waitingMsg: worksLang['저장중 메세지'],
        privateOptionTitle: worksLang['비공개로 등록합니다.'],
        privateOptionDesc: worksLang['비공개 옵션 설명'],
        goToList: worksLang['목록으로 이동']
    };

    return Backbone.View.extend({
        initialize: function (options) {
            this.baseConfigModel = options.baseConfigModel;
            this.appletFormModel = options.appletFormModel;
            this.appletDocModel = options.appletDocModel;
            this.isMultiForm = options.isMultiForm;
            this.integrationModel = options.integrationModel
        },

        render: function () {
            this.$el.html(Template({
                lang: lang,
                canUsePrivateOption: this.baseConfigModel.canUsePrivateOption(),
                isPrivateOptionClosed: this.baseConfigModel.isPrivateOptionClosed(),
                isEmptyForm: this.appletFormModel.get('data').emptyChildrenComponent,
                isMultiForm: this.isMultiForm,
                formName: this.appletFormModel.get('name'),
                mainForm: this.appletFormModel.get('mainForm')
            }));

            var component = FormBuilder.createUserComponent(
                this.appletFormModel.toJSON(),
                this.appletDocModel,
                {type: 'form'},
                this.integrationModel
            );
            this.canvasView = component.getFormView();
            this.canvasView.setElement(this.$('#fb-canvas-edit'));
            this.canvasView.renderNode();
            component.trigger('form');
            //this.listenTo(this.appletDocModel, 'sync', this._onSyncAppletDoc); // listen 하는 시점 중요함.
            // this._onSyncAppletDoc();
            component.getObserver().trigger('setInitDisplay');      // 에디터 모드 rendering 후 작업이 필요할 이런식으로 트리거 이용!!

            if (this.isMultiForm) this.$('.page_action_wrap').remove();

            return this;
        },

        _onSyncAppletDoc: function () {
            this.canvasView.renderNode();
        }
    });
});

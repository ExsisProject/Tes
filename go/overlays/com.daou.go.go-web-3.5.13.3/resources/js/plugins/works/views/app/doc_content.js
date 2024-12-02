define('works/views/app/doc_content', function (require) {

    var FormBuilder = require('works/components/formbuilder/formbuilder');

    var Template = require('hgn!works/templates/app/doc_content');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');
    var lang = {
        '접기': worksLang['접기'],
        '잠시만 기다려주세요': commonLang['잠시만 기다려주세요'],
        "needToSetProcess": worksLang["프로세스 사용하기 버튼 문구"],
        "noSubject": commonLang['제목없음']
    };

    return Backbone.View.extend({
        attributes: {'el-doc-content': ''},
        className: 'build_content_inner',
        canvasView: null,

        events: {
            "click .btn-content-fold": '_toggleContent'
        },

        initialize: function (options) {
            this.isPrint = options.isPrint;
            this.docId = options.docId;
            this.baseConfigModel = options.baseConfigModel;
            this.appletFormModel = options.appletFormModel;
            this.needToSetProcess = (this.baseConfigModel.get('useProcess') && !this.model.get('status'));
            this.integrationModel = options.integrationModel;
            this.formName = options.formName;
            this.mainForm = options.mainForm;
        },

        render: function () {
            this.$el.html(Template({
                lang: lang,
                isPrint: this.isPrint,
                needToSetProcess: this.needToSetProcess,
                formName: this.formName,
                mainForm: this.mainForm
            }));

            var component = FormBuilder.createUserComponent(
                this.appletFormModel.toJSON(),
                this.model,
                {type: 'detail'},
                this.integrationModel
            );
            this.canvasView = component.getDetailView();
            this.canvasView.setElement(this.$('#fb-canvas-detail').empty());
            this.canvasView.renderNode();
            component.trigger('detail');
            this.listenTo(this.model, 'sync', this._onSyncAppletDoc); // listen 하는 시점 중요함.

            return this;
        },

        printSubjectAndWorkflowText: function () {
            this._printSubject();
            this._printWorkflowText();
            this._printDocNoText();
        },

        _printSubject: function () {
            var subject = this._getSubject();
            this.$('#subject').text(subject || lang.noSubject);
        },

        _printWorkflowText: function () {
            var text = '';
            var useProcess = this.baseConfigModel.get('useProcess');
            var docStatus = this.model.get('status');
            var docStatusColor = docStatus || 0;

            if (useProcess && docStatus) {
                text = docStatus.name;
                docStatusColor = docStatus.color;
            } else if (useProcess && !docStatus) {
                text = '-';
            } else {
                this.$('#stateArea').closest('span').hide();
            }

            this.$('#stateArea').removeClass(function (index, className) {
                return (className.match(/bgcolor\S+/g) || []).join(' ');
            });
            this.$('#stateArea').addClass("bgcolor" + docStatusColor);
            this.$('#stateArea').text(GO.util.unescapeHtml(text));
        },

        _printDocNoText: function () {
            var useDocNo = this.baseConfigModel.get('useDocNo');
            var docNo = this.model.get('docNo');

            if (useDocNo && docNo) {
                this.$('#docNo').text(worksLang['문서번호'] + ': ' + GO.util.unescapeHtml(docNo)
                );
            } else {
                this.$('#docNo').hide();
            }
        },

        _getSubject: function () {
            return FormBuilder.getDocumentTitle(this.model);
        },

        _toggleContent: function (e) {
            var $current = $(e.currentTarget);

            e.preventDefault();

            if (this.canvasView) {
                this.canvasView.$el.slideToggle(150);
                toggleFoldingButton($current);
            }
        },

        _onSyncAppletDoc: function () {
            this.canvasView.renderNode();
            this.printSubjectAndWorkflowText();
        }
    });

    function toggleFoldingButton($button) {
        if ($button.find('.icon-arrow').hasClass('on')) {
            $button.find('.icon-arrow').removeClass('on');
            $button.find('.txt').text(worksLang['접기']);
        } else {
            $button.find('.icon-arrow').addClass('on');
            $button.find('.txt').text(worksLang['펼치기']);
        }
    }
});

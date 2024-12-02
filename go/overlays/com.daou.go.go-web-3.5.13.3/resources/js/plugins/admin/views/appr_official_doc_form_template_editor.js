define([
    "jquery",
    "backbone",
    "app",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "i18n!approval/nls/approval",

    "hgn!admin/templates/appr_form_template_editor",
    'admin/views/appr_official_template_list',
    'admin/views/appr_form_template_editor',
    'components/form_component_manager/official_form_manager',

    "formeditor",
    "jquery.go-sdk",
    "jquery.go-popup",
    "jquery.go-grid"
],
function(
    $,
    Backbone,
    App,
    commonLang,
    adminLang,
    approvalLang,

    editorTmpl,
    OfficialTemplateListAppView,
    TemplateEditorView,
    OfficialManager
) {

    var lang = TemplateEditorView.lang;

    /**
     * 템플릿 편집기 연동 부..
     */
    return TemplateEditorView.extend({

        editorOption: {
            lang: GO.session('locale'),
            bUseApprovalType: 'official',
            theme: 'form-appr-admin'
        },

        initialize: function(options) {
            options = _.extend({}, options);
            if (_.isString(options.htmlContent)) {
                this.htmlContent = options.htmlContent;
            }
            if (_.isString(options.previewElId)) {
                this.previewElId = options.previewElId;
            }

            this.TemplateListModule = OfficialTemplateListAppView;
        },

        render: function() {
            //this.popupEl = $.goPopup({
            //    'header': lang['edit_template'],
            //    'modal': true,
            //    'width': 1000,
            //    'height': '800px',
            //    'pclass': 'layer_normal layer_doc_edit',
            //    'contents': editorTmpl({lang: lang}),
            //    'closeCallback': _.bind(function() {
            //        this._cancelTemplate();
            //    }, this)
            //});
            //
            //var option = this.editorOption;
            //
            //if (this.approvalInfo) {
            //    option.approvalInfo = this.approvalInfo;
            //}
            //
            //if (_.isString(this.htmlContent)) {
            //    option.editorValue = $.goFormEditor.spanToDSL(this.htmlContent);
            //}
            //
            //$("#" + this.editorElId).goFormEditor(option);
            //this.popupEl.off("click", "a#save_template");
            //this.popupEl.off("click", "a#cancel_template");
            //this.popupEl.off("click", "a#load_another_template");
            //this.popupEl.on("click", "a#save_template", $.proxy(this._saveTemplate, this));
            //this.popupEl.on("click", "a#cancel_template", $.proxy(this._cancelTemplate, this));
            //this.popupEl.on("click", "a#load_another_template", $.proxy(this._loadAnotherTemplate, this));

            var saveCallback = _.bind(function(name, content) {
                this.model.set('name', name);
                this.htmlContent = content;
            }, this);
            var toggleEl = $('.tWrap');
            var view = new OfficialManager(_.extend(this.editorOption, {
                title: this.model.get('name'),
                isOfficial : true,
                content: this.htmlContent,
                saveCallback: saveCallback,
                toggleEl: toggleEl
            }));
            toggleEl.hide();
            $('body').append(view.render().el);
        },

        /**
         * 미리 보기 화면을 띄워서 보여준다.
         */
        preview: function(content) {
            content = content || this.model.get('templateHtml');
            var popup = $.goPopup({
                'allowPrevPopup': true,
                'header': lang['template_preview'],
                'modal': true,
                'top': '20%',
                'width': 810,
                'pclass': 'layer_normal layer_doc_edit_preview',
                'contents': '<form><div class="doc_wrap" style="width:780px" class="ie9-scroll-fix" id="' + this.previewElId + '"></div></form>'
            });

            if (!content) {
                $.goSlideMessage(lang.empty_msg, 'caution');
                popup.close();
            } else {
                $("#" + this.previewElId).setTemplate({
                    data: content
                });

                if (parseInt(popup.css('height')) < 100) {
                    popup.css('height', 100);
                }

                popup.find("div.content").css({
                    'max-height': '500px',
                    'overflow': 'auto'
                });

                popup.reoffset();

                //var content = this.htmlContent;
                //content = content.replace("{{text:subject}}", "여기에 제목이 들어갑니다.");
                //content = content.replace("{{editor:appContent}}", "내용");
                //content = content.replace("{{label:draftUser}}", "기안자");
                //content = content.replace("{{label:position}}", "직위");
                //content = content.replace("{{label:empNo}}", "사번");
                //content = content.replace("{{label:mobileNo}}", "핸드폰번호");
                //content = content.replace("{{label:directTel}}", "직통전화");
                //content = content.replace("{{label:repTel}}", "대표번호");
                //content = content.replace("{{label:draftDept}}", "기안부서");
                //content = content.replace("{{label:draftDate}}", "기안일");
                //content = content.replace("{{label:docNo}}", "문서번호");
                //content = content.replace("{{label:recipient}}", "수신처");
                //content = content.replace("{{span:officialDocReceiver}}", "공문수신처");
                //content = content.replace("{{label:preserveDuration}}", "보존연한");
                //content = content.replace("{{label:securityLevel}}", "보안등급");
                //content = content.replace("{{label:docClassification}}", "전사문서함");
                //content = content.replace("{{label:docReference}}", "문서참조");
                //content = content.replace("{{label:openOption}}", "결재공개여부");
                //content = content.replace("{{label:officialDocSender}}", "발신명의");
                //content = content.replace("{{label:officialDocSign}}", "직인");
                //content = content.replace("{{span:officialDocVersionReceiver}}", "공문수신처2");
                //content = content.replace("{{label:draftUserEmail}}", "기안자이메일");
                //content = content.replace("{{label:fax}}", "팩스번호");
                //content = content.replace("{{label:attachFile}}", "첨부파일명");
                //content = content.replace("{{label:completeDate}}", "완료일");
                //
                //$("#" + this.previewElId).html(content);
                //
                //if (parseInt(popup.css('height')) < 100) {
                //    popup.css('height', 100);
                //}
                //
                //popup.find("div.content").css({
                //    'max-height': '500px',
                //    'overflow': 'auto'
                //});
                //
                //popup.reoffset();
            }
        }
    });
});
;(function () {
    define([
            'jquery',
            'backbone',
            'app',
            "hogan",
            'i18n!nls/commons',
            "components/comment/collections/comment",
            'hgn!components/m_comment/templates/form',
            'hgn!components/m_comment/templates/temp_attach_image_item',
            "components/go-fileuploader/mobile",
            'i18n!board/nls/board',
            "jquery.go-validation",
            'GO.util'

        ],
        function (
            $,
            Backbone,
            GO,
            Hogan,
            CommonLang,
            CommentModel,
            CommentFormTmpl,
            AttachTempImageTpl,
            FileUploader,
            BoardLang
        ) {
            var lang = {
                'commentSave': CommonLang["등록"],
                'commentPlaceholder': CommonLang["댓글을 입력하세요."],
                "save_success": CommonLang["저장되었습니다."],
                "alert_length": CommonLang["0자이상 0이하 입력해야합니다."],
                "preview": CommonLang['미리보기'],
                'download': CommonLang['다운로드'],
                'public_writer': BoardLang["작성자 공개"]
            };

            var _savingFlag = false;

            var CommentFormView = Backbone.View.extend({
                tagName: "li",
                className: "creat",
                events: {
                    "vclick a.save": "save"
                },
                initialize: function (options) {
                    this.options = options || {};
                    this.attachOptions = {};
                    this.$el.off();
                    this.typeUrl = this.options.typeUrl;
                    this.typeId = this.options.typeId;
                    this.model = new CommentModel();
                    this.model.set({typeUrl: this.typeUrl, typeId: this.typeId});
                    GO.EventEmitter.off("m_comment", "form_fileuploader");
                    GO.EventEmitter.on("m_comment", "form_fileuploader", this.attachFileInForm, this);
                    this.boardModel = options.boardModel;
                },

                attachFileInForm: function () {
                    window.attachFileSuccess = $.proxy(this.attachSuccess, this);
                    window.attachFileError = this.attachFail;
                },

                render: function () {
                    this.$el.html(CommentFormTmpl({
                        lang: lang,
                        isMobileApp: GO.config('isMobileApp'),
                        anonymFlag: this.boardModel ? this.boardModel.get('anonymFlag') || false : false,
                        availableAnonymousWriterOptionInPostComment: this.boardModel ? this.boardModel.get('availableAnonymousWriterOptionInPostComment') || false : false
                    }));
                    return this;
                },

                attachFileUploader: function () {
                    this.attachOptions.success = this.attachSuccess;
                    this.attachOptions.error = this.attachFail;
                    FileUploader.bind(this.$el.find('#form_fileuploader'), this.attachOptions);
                },

                attachSuccess: function (r) {
                    var obj = (typeof r === "string") ? JSON.parse(r) : r.data;
                    obj.fileSize = GO.util.getHumanizedFileSize(obj.fileSize);
                    obj.isImage = GO.util.isImage(obj.fileExt);
                    obj.icon_class = GO.util.getFileIconStyle({extention: obj.fileExt});
                    var tpl = AttachTempImageTpl(obj);

                    var $attachWrap = $('#form_attach_wrap');
                    $attachWrap.show();
                    if ($("#form_fileuploader").data("attachable") === "false") {
                        return;
                    }
                    try {
                        this.attachValidate(obj);
                    } catch (e) {
                        if (e.message === "overMaxAttachNumber") {
                            $("#form_fileuploader").data("attachable", "false");
                        }
                        return;
                    }
                    if (GO.util.isImage(obj.fileExt)) {
                        $("#form_attach_wrap #img_attach_wrap_ul").append(tpl);
                        $("span[data-btntype='attachDelete']").on("click", function (e) {
                            $("#form_fileuploader").data("attachable", "true");
                            $(e.currentTarget).closest('li').remove();
                        });
                    } else {
                        $("#form_attach_wrap #file_attach_wrap_ul").append(tpl);
                        $("span.ic_file_del").on("click", function (e) {
                            $("#form_fileuploader").data("attachable", "true");
                            $(e.currentTarget).closest('li').remove();
                        });
                    }
                },

                attachFail: function () {
                    alert(CommonLang['업로드에 실패하였습니다.']);
                },

                attachValidate: function (file) {
                    var maxAttachSize = null;
                    var data = GO.util.getFileNameAndTypeData(file);
                    if (GO.config('allowedFileUploadSize')) {
                        maxAttachSize = GO.config('allowedFileUploadSize') / 1024 / 1024;
                    }
                    try {
                        $.goValidation.attachValidate("#form_attach_wrap ul li", data, maxAttachSize);
                        if (GO.session().brandName == "DO_SAAS") {
                            FileUploader.attachFileValidateBySaaS(data.size);
                        }
                    } catch (e) {
                        var message = e.message;

                        if (message == "AttachSizeException") {
                            GO.util.delayAlert(GO.i18n(CommonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                        } else if (message == "AttachNumberExceptionBySaaS") {
                            GO.util.delayAlert(GO.i18n(CommonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", GO.config('commonAttachConfig').maxAttachNumber));
                            throw new Error("overMaxAttachNumber");
                        } else if (message == "NotFoundExtException") {
                            GO.util.delayAlert(CommonLang['첨부할 수 없는 파일 입니다.']);
                        }
                        throw new Error("Attach Validation Error");
                    }
                },

                save: function (e) {
                    if (_savingFlag) {
                        return;
                    }
                    var messageEl = this.$el.find("textarea"),
                        message = messageEl.val(),
                        self = this;

                    if (!message || !$.goValidation.isCheckLength(2, 1000, $.trim(message))) {
                        alert(GO.i18n(lang["alert_length"], {"arg1": "2", "arg2": "1000"}));
                        return;
                    }
                    var attaches = FileUploader.getAttachInfo("#form_attach_wrap");
                    /* 작성개 공개 여부 */
                    var isOpenWriter = this.$el.find('#isOpenWriter').is(':checked');
                    this.model.set({message: message, attaches: attaches, publicWriter: isOpenWriter});

                    this.model.save(null, {
                        beforeSend: function () {
                            _savingFlag = true;
                        },
                        success: function (model) {
                            GO.EventEmitter.trigger("m_comment", 'change:comment');
                        },
                        error: function (model, rs) {
                            var responseObj = JSON.parse(rs.responseText);
                            var errorMsg = CommonLang['저장에 실패 하였습니다.'];
                            if (responseObj.message) {
                                errorMsg = responseObj.message;
                            }
                            alert(errorMsg);
                            return false;
                        },
                        complete: function () {
                            _savingFlag = false;
                        },
                    });
                },

            }, {
                __instance__: null,
                create: function (type, typeId, boardModel) {
                    var instance = new CommentFormView({
                        "typeUrl": type,
                        "typeId": typeId,
                        "boardModel": boardModel
                    });

                    instance.render();

                    return instance;
                }
            });

            return CommentFormView;
        });
}).call(this);
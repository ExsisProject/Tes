;(function () {
    define([
            'jquery',
            'backbone',
            'app',
            "hogan",
            'i18n!nls/commons',
            "components/m_comment/views/item",
            "components/comment/collections/comment",
            'hgn!components/m_comment/templates/reply_item',
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
            CommontItemView,
            CommentModel,
            CommentReplyItemTmpl,
            AttachTempImageTpl,
            FileUploader,
            BoardLang
        ) {
            var lang = {
                'save': CommonLang['저장'],
                'cancel': CommonLang['취소'],
                'modify': CommonLang['수정'],
                'delete': CommonLang['삭제'],
                'commentSave': CommonLang["댓글 작성"],
                'commentPlaceholder': CommonLang["댓글을 입력하세요."],
                "reply_save": CommonLang["댓글 등록"],
                "reply_cancel": CommonLang["취소"],
                "save_success": CommonLang["저장되었습니다."],
                'public_writer' : BoardLang["작성자 공개"]
            };


            var CommentReplyView = Backbone.View.extend({
                tagName: "li",
                className: "creat reply",
                events: {
                    "vclick a.comment_reply_save": "save",
                    "vclick a.comment_reply_cancel": "cancel",
                },

                initialize: function (options) {
                    this.options = options || {};
                    this.attachOptions = {};

                    this.$el.off();
                    this.typeUrl = this.options.typeUrl;
                    this.typeId = this.options.typeId;
                    this.commentId = this.options.commentId;
                    this.model = new CommentModel();
                    this.model.set({typeUrl: this.typeUrl, typeId: this.typeId, commentId: this.commentId});
                    this.boardModel = options.boardModel;
                    GO.EventEmitter.off("m_comment", "reply_fileuploader");
                    GO.EventEmitter.on("m_comment", "reply_fileuploader", this.attachFileInReply, this);
                },

                attachFileInReply: function () {
                    window.attachFileSuccess = $.proxy(this.attachSuccess, this);
                    window.attachFileError = this.attachFail;
                },

                render: function () {
                    this.$el.html(CommentReplyItemTmpl({
                        lang: lang,
                        thumbnail: GO.session('thumbnail'),
                        isMobileApp: GO.config('isMobileApp'),
                        anonymFlag: this.boardModel ? this.boardModel.get('anonymFlag') || false : false,
                        availableAnonymousWriterOptionInPostComment: this.boardModel ? this.boardModel.get('availableAnonymousWriterOptionInPostComment') || false : false
                    }));

                    this.$el.addClass("depth2");
                    return this;
                },

                attachFileUploader: function () {
                    this.attachOptions.success = this.attachSuccess;
                    this.attachOptions.error = this.attachFail;
                    FileUploader.bind(this.$el.find('#reply_fileuploader'), this.attachOptions);
                },

                attachSuccess: function (r) {
                    var obj = (typeof r === "string") ? JSON.parse(r) : r.data;
                    obj.fileSize = GO.util.getHumanizedFileSize(obj.fileSize);
                    obj.isImage = GO.util.isImage(obj.fileExt);
                    obj.icon_class = GO.util.getFileIconStyle({extention: obj.fileExt});
                    var tpl = AttachTempImageTpl(obj);

                    window.target.closest('li').find("#reply_attach_wrap").show();
                    window.target.closest('li').find("#reply_attach_wrap ul").show();

                    if (window.target.closest('li').find("#reply_fileuploader").data("attachable") === "false") {
                        return;
                    }
                    try {
                        this.attachValidate(obj)
                    } catch (e) {
                        if (e.message === "overMaxAttachNumber") {
                            $("#reply_fileuploader").data("attachable", "false");
                        }
                        return;
                    }
                    if (obj.isImage) {
                        window.target.closest('li').find('#reply_attach_wrap ul.img_wrap').append(tpl);
                        $("span.ic_del").on("click", function (e) {
                            $("#reply_fileuploader").data("attachable", "true");
                            $(e.currentTarget).closest('li').remove();
                        });
                    } else {
                        window.target.closest('li').find('#reply_attach_wrap ul.file_wrap').append(tpl);
                        $("span.ic_file_del").on("click", function (e) {
                            $("#reply_fileuploader").data("attachable", "true");
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
                        $.goValidation.attachValidate("#reply_attach_wrap ul li", data, maxAttachSize);
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
                    var messageEl = this.$el.find("textarea"),
                        message = messageEl.val(),
                        self = this;
                    var attaches = FileUploader.getAttachInfo("#reply_attach_wrap div.wrap_attach");

                    if (this.model.isCalendar() && this.commentId) {
                        this.model.set({
                            thread: this.commentId
                        });
                    }
                    /* 작성개 공개 여부 */
                    var isOpenWriter = this.$el.find('#isOpenWriter').is(':checked');

                    this.model.set({message: message, attaches: attaches, publicWriter: isOpenWriter});
                    this.model.save(null, {
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
                    });
                },

                cancel: function () {
                    this.$el.remove();
                },

            }, {
                __instance__: null,
                create: function (options) {
                    var instance = new CommentReplyView({
                        "typeUrl": options.typeUrl,
                        "typeId": options.typeId,
                        "commentId": options.commentId,
                        "boardModel": options.boardModel
                    });

                    instance.render();

                    return instance;
                }
            });

            return CommentReplyView;
        });
}).call(this);
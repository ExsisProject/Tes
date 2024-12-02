;(function () {
    define([
            'jquery',
            'backbone',
            'app',
            "hogan",
            'i18n!nls/commons',
            'hgn!components/m_comment/templates/item',
            'hgn!components/m_comment/templates/temp_attach_image_item',
            "attach_file",
            "components/go-fileuploader/mobile",
            'i18n!board/nls/board',
            'GO.util',
            "jquery.go-validation"
        ],
        function (
            $,
            Backbone,
            GO,
            Hogan,
            CommonLang,
            CommentItemTmpl,
            AttachTempImageTpl,
            AttachFilesView,
            FileUploader,
            BoardLang
        ) {
            var lang = {
                'reply': CommonLang["댓글"],
                'modify': CommonLang['수정'],
                'remove': CommonLang['삭제'],
                'save': CommonLang['저장'],
                'cancel': CommonLang['취소'],
                "alert_length": CommonLang["0자이상 0이하 입력해야합니다."],
                "removeRemoveDesc": CommonLang["댓글이 등록된 글은 삭제할 수 없습니다."],
                "removeSuccess": CommonLang["댓글을 삭제하였습니다."],
                "removeConfirm": CommonLang["댓글을 삭제하시겠습니까?"],
                "modifySuccess": CommonLang["변경되었습니다."],
                "preview": CommonLang['미리보기'],
                'download': CommonLang['다운로드'],
                'public_writer': BoardLang["작성자 공개"],
                "emoticonDelete": CommonLang["이모티콘 삭제"]
            };

            var CommentItemView = Backbone.View.extend({
                tagName: "li",
                events: {
                    "vclick #info_mode a.modify": "modify",
                    "vclick #info_mode a.remove": "remove",

                    "vclick #edit_mode a.save": "save",
                    "vclick #edit_mode a.cancel": "cancel",
                    "vclick #emoticonDeleteBtn": "_onClickDeleteEmoticon"
                },
                initialize: function (options) {
                    this.$el.off();
                    this.options = options || {};
                    this.attachOptions = {};
                    this.isReply = options.isReply;
                    this.typeUrl = this.options.typeUrl;
                    this.typeId = this.options.typeId;
                    this.model = this.options.model;
                    this.model.set({typeUrl: this.typeUrl, typeId: this.typeId});
                    this.anonymFlag = options.anonymFlag;
                    GO.EventEmitter.off("m_comment", "item_fileuploader");
                    GO.EventEmitter.on("m_comment", "item_fileuploader", this.attachFileInItem, this);
                },

                attachFileInItem: function () {
                    window.attachFileSuccess = $.proxy(this.attachSuccess, this);
                    window.attachFileError = this.attachFail;
                },

                render: function () {
                    var isReplyComment = (this.model.get("id") != this.model.get("thread")),
                        isWritableReply = this.isReply && !isReplyComment,
                        self = this;
                    this.$el.html(CommentItemTmpl({
                        data: $.extend({}, this.model.toJSON(),
                            {
                                createdAtBasicDate: GO.util.basicDate3(this.model.get("createdAt")),
                                isWritableReply: isWritableReply,
                                showMessage: GO.util.escapeHtml(this.model.get("message")),
                                editMessage: this.model.get("message"),
                            }
                        ),
                        hasEmoticon: this.model.hasEmoticon(),
                        emoticonPathSrc: this.model.getEmoticonPath(),
                        emoticonPath: this.model.get("emoticonPath"),
                        thumbnail: this.model.get("writer").thumbSmall || this.model.get("writer").thumbnail,
                        lang: lang,
                        isMobileApp: GO.config('isMobileApp'),
                        anonymFlag: this.anonymFlag || false,
                        availableAnonymousWriterOptionInPostComment: this.model.get('publicWriter') || false
                    }));

                    // todo download url 수정
                    var url = this.isBoard() ? "/attaches/" : "/download/";
                    AttachFilesView.create(this.$el.find('#attach-placeholder'), this.model.get("attaches"), function (item) {
                        return GO.config('contextRoot') + 'api/' + self.typeUrl + "/" + self.typeId + "/comment/" + self.model.id +
                            url + item.get("id");
                    });

                    //TODO 만약 내가 등록한거면 OK 아니면 숨김
                    if (isReplyComment) {
                        this.$el.addClass("depth2");
                    } else {
                        this.$el.addClass("depth1");
                    }

                    this.$el.attr("comment-id", this.model.get("id"));
                    this.$el.attr("comment-thread-id", this.model.get("thread"));
                    return this;
                },

                attachFileUploader: function () {
                    this.attachOptions.success = this.attachSuccess;
                    this.attachOptions.error = this.attachFile;
                    FileUploader.bind(this.$el.find('#item_fileuploader'), this.attachOptions);
                },

                attachSuccess: function (r) {
                    var obj = (typeof r === "string") ? JSON.parse(r) : r.data;
                    obj.fileSize = GO.util.getHumanizedFileSize(obj.fileSize);
                    obj.isImage = GO.util.isImage(obj.fileExt);
                    obj.icon_class = GO.util.getFileIconStyle({extention: obj.fileExt});
                    var tpl = AttachTempImageTpl(obj);

                    window.target.closest('li').find("#item_attach_wrap").show();
                    window.target.closest('li').find("#item_attach_wrap ul").show();

                    if (window.target.closest('li').find("#item_fileuploader").data("attachable") === "false") {
                        return;
                    }
                    try {
                        this.attachValidate(obj)
                    } catch (e) {
                        if (e.message === "overMaxAttachNumber") {
                            window.target.closest('li').find("#item_fileuploader").data("attachable", "false");
                        }
                        return;
                    }
                    if (obj.isImage) {
                        window.target.closest('li').find('#item_attach_wrap ul.img_wrap').append(tpl);
                        $("span.ic_del").on("click", function (e) {
                            window.target.closest('li').find("#item_fileuploader").data("attachable", "true");
                            $(e.currentTarget).closest('li').remove();
                        });
                    } else {
                        window.target.closest('li').find('#item_attach_wrap ul.file_wrap').append(tpl);
                        $("span.ic_file_del").on("click", function (e) {
                            window.target.closest('li').find("#item_fileuploader").data("attachable", "true");
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
                        $.goValidation.attachValidate("#item_attach_wrap ul li", data, maxAttachSize);
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

                _onClickDeleteEmoticon: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $(e.currentTarget).parents('[data-emoticon-edit-part]').removeClass("thumb_append");
                    $(e.currentTarget).parents('[data-emoticon-edit-part]').empty();
                },

                // 게시판 서버 코드를 common(업무, 보고, 설문) 과 맞춰야 한다. 임시로 클라이언트에서 처리.
                isBoard: function () {
                    return this.typeUrl.split("/")[0] == "board";
                },

                modify: function (e) {
                    e.preventDefault();
                    this.$el.find("#edit_mode").find(".edit_content").height(this.$el.find("#info_mode").find(".subject").height());
                    this.$el.find("#info_mode").hide();
                    this.$el.find("#edit_mode").show();
                    this.$el.find("#edit_mode div.wrap_attach").replaceWith("<div id='attach-placeholder-edit'></div>");

                    if (this.model.get("attaches").length > 0) {
                        this.$el.find("#item_attach_wrap").show();
                    }

                    AttachFilesView.edit(this.$el.find('#attach-placeholder-edit'), this.model.get("attaches"), '');
                    this.$el.find("#edit_mode ul.img_wrap .btn_wrap span").removeClass('ic_classic').addClass('ic');
                    this.attachFileUploader();

                    if (this.model.hasEmoticon()) {
                        var $emoticonEl = this.$el.find("#edit_mode").find('[data-emoticon-edit-part]');
                        $emoticonEl.addClass("thumb_append");
                        $emoticonEl.empty();
                        $emoticonEl.append('<img class="emoticon" id="commentEmoticonImg" src="' + this.model.getEmoticonPath() + '" data-item-path ="' + this.model.get("emoticonPath") + '" alt=""><span class="btn btn_del_type2" id="emoticonDeleteBtn" title=""></span>');
                    }
                },

                remove: function () {
                    var self = this;

                    if (this.$el.hasClass("depth1") && this.$el.next().hasClass("depth2")) {
                        alert(lang.removeRemoveDesc);
                        return;
                    }

                    if (confirm(lang.removeConfirm)) {
                        this.model.destroy({
                            success: function () {
                                GO.EventEmitter.trigger("m_comment", 'change:comment');
                            }
                        });
                    }
                },

                cancel: function (e) {
                    e.preventDefault();

                    this.$el.find("#info_mode").show();
                    this.$el.find("#edit_mode").hide();
                    this.$el.find("#edit_mode textarea.edit_content").val(this.model.get("message"));
                },

                save: function (e) {
                    e.preventDefault();
                    var self = this;

                    var content = this.$el.find("#edit_mode textarea").val();
                    var attaches = FileUploader.getAttachInfo("#item_attach_wrap div.wrap_attach");
                    var emoticonPath = this.$el.find("#commentEmoticonImg").attr("data-item-path");

                    if (!content || !$.goValidation.isCheckLength(2, 1000, $.trim(content))) {
                        alert(GO.i18n(lang["alert_length"], {"arg1": "2", "arg2": "1000"}));
                        return;
                    }

                    this.model.set({message: content, attaches: attaches, emoticonPath: emoticonPath});

                    this.model.save(null, {
                        success: function () {
                            self.render();
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
                }
            }, {
                __instance__: null,
                create: function (typeUrl, typeId) {
                    var instance = new CommentItemView({
                        "typeUrl": typeUrl,
                        "typeId": typeId
                    });

                    instance.render();

                    return instance;
                }
            });

            return CommentItemView;
        });
}).call(this);
define([
        "jquery",
        "underscore",
        "backbone",
        "app",

        "approval/models/comment",
        "approval/collections/comments",
        "approval/views/document/comment_attaches",
        "approval/views/document/comment_reply",
        "views/profile_card",
        "components/emoticon/views/emoticons",

        "hgn!approval/templates/document/comment",
        "hgn!approval/templates/document/comments",
        "hgn!approval/templates/document/comment_reply_modify",

        "i18n!approval/nls/approval",
        "i18n!nls/commons",
        "file_upload",
        "jquery.go-sdk",
        "jquery.go-popup",
        "GO.util",
        "jquery.placeholder",
        'go-fancybox'
    ],
    function (
        $,
        _,
        Backbone,
        GO,
        CommentModel,
        CommentCollection,
        CommentAttachesView,
        CommentReplyView,
        ProfileView,
        EmoticonView,
        CommentItemTpl,
        CommentTpl,
        CommentModifyTpl,
        approvalLang,
        commonLang,
        FileUpload
    ) {
        var lang = {
            '저장': commonLang['저장'],
            '삭제': commonLang['삭제'],
            '취소': commonLang['취소'],
            '사진': commonLang['사진'],
            '등록': commonLang['등록'],
            '댓글': approvalLang['댓글'],
            '댓글 작성': approvalLang['댓글 작성'],
            '댓글 수정': approvalLang['댓글 수정'],
            '댓글 삭제': approvalLang['댓글 삭제'],
            '댓글을 삭제 하시겠습니까?': approvalLang['댓글을 삭제 하시겠습니까?'],
            '댓글이 등록된 글은 삭제할 수 없습니다.': approvalLang['댓글이 등록된 글은 삭제할 수 없습니다.'],
            '개': approvalLang['개'],
            '최대 첨부 갯수는 0개 입니다.': approvalLang['최대 첨부 갯수는 0개 입니다.'],
            '첨부할 수 있는 최대 사이즈는 0MB 입니다.': approvalLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'],
            '확장자가 땡땡인 것들은 첨부 할 수 없습니다.': approvalLang['확장자가 땡땡인 것들은 첨부 할 수 없습니다.'],
            '0자이상 0이하 입력해야합니다.': approvalLang['0자이상 0이하 입력해야합니다.'],
            '파일 첨부': commonLang['파일 첨부'],
            '이미지 첨부': commonLang['이미지 첨부'],
            commentPlaceholder: commonLang["댓글을 남겨보세요"]
        };

        var CommentsView = Backbone.View.extend({
            initialize: function (options) {
                this.options = options || {};
                this.comments = this.options.comments;
                this.docId = this.options.docId;
                this.originalDocId = this.options.originalDocId;
                this.isBrowseByReference = this.options.isBrowseByReference;
                this.dateFormat = options.dateFormat ? options.dateFormat : 'SNS';
                this.commentModel = new CommentModel();
                this.emoticonView = new EmoticonView({});

                this.collection = CommentCollection.getCollection({docId: this.docId});
                this.collection.on("reset", this.render, this);
                this.isSaaS = GO.session().brandName == "DO_SAAS";
                this.totalAttachSize = 0;
                this.totalAttachCount = 0;
            },
            events: {
                'click span.photo a': 'showProfileCard',
                'click span.btn-comment-reply': 'addCommentReplyForm',
                'click span.comment_modify': 'addModifyForm',
                'click span.comment_delete': 'actionDeleteComment',
                'click span.comment_modify_save': 'actionModifyComment',
                'click span.comment_modify_cancel': 'removeModifyForm',
                'click span#apprComment': 'commentSave',
                'keyup .reply_wrap textarea.w_max': 'expandEditor',
                'click a.preview': 'commentAttachPreview',
                "click #emoticonBtn": "toggleEmoticonGroup",
                "click [data-emoticon-delete-btn]": "deleteEmoticon",
                "click [data-upload-btn]": "_validClickAttaches",
            },

            expandEditor: function (e) {
                GO.util.textAreaExpand(e);
            },

            render: function () {
                var self = this;
                var data = this.collection.toJSON();
                this.$el.html(CommentTpl({
                    commentCount: data.length > 5 ? data.length : false,
                    thumbnail: GO.session("thumbnail"),
                    lang: lang
                }));

                $.each(data, function (key, model) {
                    var tpl = CommentItemTpl({
                        lang: lang,
                        data: model,

                        hasEmoticon: !!model.emoticonPath,
                        emoticonPathSrc: !!model.emoticonPath ? GO.config('emoticonBaseUrl') + model.emoticonPath : "",

                        dateformat: function () {
                            if (self.dateFormat == 'basicDate') {
                                return GO.util.basicDate(this.createdAt);
                            } else {
                                return GO.util.snsDate(this.createdAt);
                            }
                        },
                        messageParse: function () {
                            return GO.util.escapeHtml(this.message);
                        },
                        isReply: function () {
                            if (this.id === this.thread) return false;
                            return true;
                        },
                        // 댓글 수정, 삭제 권한
                        isWritable: function () {
                            if (this.writer.id === GO.session("id")) {
                                return true;
                            } else {
                                return false;
                            }
                        },
                        attachFiles: function () {
                            if (this.attaches) {
                                return CommentAttachesView.render({
                                    attaches: this.attaches,
                                    writer: this.writer,
                                    docId: self.docId,
                                    commentId: this.id,
                                    originalDocId: self.originalDocId,
                                    isBrowseByReference: self.isBrowseByReference,

                                });
                            }
                            return '';
                        },
                        sizeCal: function () {
                            var data = this.size;
                            var size = GO.util.getHumanizedFileSize(data);
                            return size;
                        },
                        attachWrap: function () {
                            if (this.attaches) {
                                return true;
                            }
                            return false;
                        }
                    });

                    $('ul#comment_reply').append(tpl);
                });

                this.initUpload();

                $('.fancybox-thumbs').goFancybox();

                this.$el.find('[data-replies-wrapper]').append(this.emoticonView.render().el);
            },

            showProfileCard: function (e) {
                var userId = $(e.currentTarget).attr('data-userid');
                ProfileView.render(userId, e.currentTarget);
            },

            commentAttachPreview: function (e) {
                var currentEl = $(e.currentTarget);
                GO.util.preview(currentEl.attr("data-id"));
                return false;
            },

            addCommentReplyForm: function (e) {
                var commentEl = $(e.currentTarget).parents('li'),
                    commentReplyId = ['reply', this.docId, commentEl.attr('data-id')].join('_');
                if (!this.$el.has('#' + commentReplyId).length) {
                    $(e.currentTarget).find('.comment_reply').html(lang['취소']);
                    //댓글에 댓글 폼 추가
                    this.$el.find('li[data-thread="' + commentEl.attr('data-id') + '"]:last').after('<li id="' + commentReplyId + '" class="depth_in reply_create" />');
                    CommentReplyView.render({
                        docId: this.docId,
                        commentId: commentEl.attr('data-id'),
                        el: '#' + commentReplyId,
                        lang: lang,
                        collection: this.collection,
                        emoticonView: this.emoticonView
                    });
                } else {
                    $(e.currentTarget).find('.comment_reply').html(lang['댓글']);
                    this.emoticonView.moveToMainEmoticonView($(e.currentTarget));
                    CommentReplyView.close('#' + commentReplyId);
                }
            },

            commentSave: function (e) {
                var self = this;
                var commentModel = new CommentModel();
                messageForm = this.$el.find('#formApprComment');

                if (!messageForm.val() || !$.goValidation.isCheckLength(2, 1000, $.trim(messageForm.val())) || messageForm.val() == approvalLang['댓글을 입력해주세요']) {
                    messageForm.focus();
                    $.goMessage(GO.i18n(lang['0자이상 0이하 입력해야합니다.'], {"arg1": "2", "arg2": "1000"}));
                    return;
                }

                var attaches = [];
                var attachPart = $("#commentAttachPart").find('li:not(.attachError)');

                attachPart.each(function () {
                    attaches.push({
                        path: $(this).attr("data-tmpname"),
                        name: $(this).attr("data-name")
                    });
                });

                commentModel.set({docId: this.docId}, {silent: true});
                commentModel.save({
                        writer: this.writer,
                        message: messageForm.val(),
                        attaches: attaches,
                        emoticonPath: this.emoticonView.getSelectedEmoticonImgSrc($(e.currentTarget))
                    },
                    {
                        type: 'POST',
                        success: function (model, rs) {
                            self.collection.fetch({async: false, reset: true});
                        }
                    });
            },

            addModifyForm: function (e) {
                var commentEl = $(e.currentTarget).parents('li');
                var model = this.collection.get(commentEl.attr('data-id'));
                commentEl.find('div.action_wrap').hide();
                commentEl.addClass('reply_create reply_edit');

                var images = [];
                var files = [];

                $.each(model.get('attaches'), function (k, v) {
                    v.humanSize = GO.util.getHumanizedFileSize(v.size);

                    if (v.thumbSmall) {
                        images.push(v);
                    } else {
                        var reExt = new RegExp("(zip|doc|docx|ppt|pptx|xls|xlsx|hwp|pdf|txt|html|htm|jpg|jpeg|png|gif|tif|tiff|bmp|exe|avi|mp3|mp4|mov|mpg|mpeg|lzh|xml|log|csv|eml)", "gi");
                        if (!reExt.test(v.extention)) {
                            v.extention = "def";
                        }
                        files.push(v);
                    }
                });

                commentEl.find('p.message').after(CommentModifyTpl({
                    isAttaches: model.get('attaches').length ? true : false,
                    hasFiles: files.length ? true : false,
                    hasImages: images.length ? true : false,
                    hasEmoticon: !_.isUndefined(model.get("emoticonPath")),
                    emoticonPathSrc: GO.config('emoticonBaseUrl') + model.get("emoticonPath"),
                    emoticonPath: model.get("emoticonPath"),
                    contextRoot: GO.contextRoot,
                    files: files,
                    images: images,
                    docId: this.docId,
                    commentId: model.get('thread'),
                    writer: model.get('writer'),
                    message: GO.util.unescapeHtml(model.get('message')),
                    id: model.get('id'),
                    lang: lang
                })).hide();
                commentEl.find('ul.origin').hide();
                commentEl.find('#emoticonPart').hide();

                this.initCommentModifyUpload(this.docId, model.get('thread'));
            },

            actionDeleteComment: function (e) {
                var self = this,
                    commentEl = $(e.currentTarget).parents('li'),
                    commentId = commentEl.attr('data-id'),
                    commentData = this.collection.get(commentId).toJSON();

                if (commentData.replyCount > 0) {
                    $.goAlert(lang['댓글 삭제'], lang['댓글이 등록된 글은 삭제할 수 없습니다.']);
                } else {
                    var action = function () {
                        self.commentModel.set({docId: self.docId, commentId: commentId}, {silent: true});
                        self.commentModel.save({}, {
                            type: 'DELETE',
                            success: function (model, rs) {
                                if (rs.code == 200) {
                                    self.collection.fetch({async: false, reset: true});
                                }
                            }
                        });
                    };
                    $.goCaution(lang['댓글 삭제'], lang['댓글을 삭제 하시겠습니까?'], action);
                }
            },

            toggleEmoticonGroup: function (e) {
                console.info("toggleEmoticonGroup");
                e.preventDefault();
                e.stopPropagation();

                if (this.emoticonView.hasAttaches($(e.currentTarget))) {
                    return false;
                }
                this.emoticonView.renderEmoticonGroup($(e.currentTarget));
            },

            deleteEmoticon: function (e) {
                var emoticonEl = $(e.currentTarget).parent()
                emoticonEl.empty();
                emoticonEl.removeClass();
            },

            initCommentModifyUpload: function (docId, commentId) {
                var self = this;
                var options = {
                    el: "#commentAttach_" + docId + "_" + commentId,
                    context_root: GO.contextRoot,
                    button_text: "",
                    button_width: 36,
                    button_height: 26,
                    url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
                    mode: "COMMENT",
                    progressBarUse: true,
                    progressEl: "#progress_" + docId + "_" + commentId
                };

                var maxAttachSize = parseInt(GO.config('commonAttachConfig').maxAttachSize);
                var maxAttachByteSize = maxAttachSize * 1024 * 1024;
                var maxAttachNumber = parseInt(GO.config('commonAttachConfig').maxAttachNumber);

                (new FileUpload(options))
                    .queue(function (e, data) {

                    })
                    .start(function (e, data) {

                        if (self.emoticonView.hasSelectedEmoticon($(e.currentTarget))) {
                            return false;
                        }

                        if (!GO.config('attachFileUpload')) {
                            $.goAlert(commonLang['파일첨부용량초과']);
                            return false;
                        }

                        if (self.isSaaS) {
                            if (maxAttachByteSize < data.size) {
                                $.goMessage(GO.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                                return false;
                            } else {
                                self.totalAttachSize += data.size;
                            }

                            var currentTotalAttachCount = $("#commentFileModifyWrap_" + docId + "_" + commentId).find("li").length + self.totalAttachCount + 1;
                            if (maxAttachNumber < currentTotalAttachCount) {
                                $.goMessage(GO.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
                                return false;
                            } else {
                                self.totalAttachCount++;
                            }
                        }
                    })
                    .progress(function (e, data) {

                    })
                    .success(function (e, serverData, fileItemEl) {
                        var alertMessage = "";
                        var attachClass = "";

                        if (GO.util.fileUploadErrorCheck(serverData)) {
                            alertMessage = "<strong class='caution'>" + GO.util.serverMessage(serverData) + "</strong>";
                            attachClass = "attachError";
                        } else {
                            if (GO.util.isFileSizeZero(serverData)) {
                                $.goAlert(GO.util.serverMessage(serverData));
                                return false;
                            }
                        }

                        var data = serverData.data;
                        var tmpName = data.filePath;
                        var name = data.fileName;
                        var extention = data.fileExt;
                        var size = data.fileSize;
                        var humanSize = GO.util.getHumanizedFileSize(size);
                        var thumbnail = data.thumbnail;
                        var templete = "";
                        var hostId = data.hostId;

                        if (GO.util.isImage(extention)) {
                            templete =
                                '<li class="' + attachClass + '" data-tmpname="' + tmpName + '" data-name="' + name + '" data-hostid="' + hostId + '" data-size="' + size + '">' +
                                '<span class="item_image">' +
                                '<span class="thumb">' +
                                '<img src="' + thumbnail + '" alt="' + name + '" />' +
                                '</span>' +
                                '<span class="btn_wrap">' +
                                '<span class="ic_classic ic_del" title="삭제" data-docId=' + docId + '></span>' +
                                '</span>' +
                                '</span>' +
                                '</li>';

                            if ($("#commentFileModifyWrap_" + docId + "_" + commentId).find("ul.img_wrap").length == 0) {
                                $("#commentFileModifyWrap_" + docId + "_" + commentId).append('<ul class="img_wrap"></ul>');
                            }
                            $("#commentFileModifyWrap_" + docId + "_" + commentId).find("ul.img_wrap").append(templete);
                        } else {
                            var fileType = "def";
                            if (GO.util.fileExtentionCheck(extention)) {
                                fileType = extention;
                            }

                            templete =
                                '<li class="' + attachClass + '" data-tmpname="' + tmpName + '" data-name="' + name + '" data-hostid="' + hostId + '" data-size="' + size + '">' +
                                '<span class="item_file">' +
                                '<span class="ic_file ic_' + fileType + '"></span>' +
                                '<span class="name">' + name + '</span>' +
                                '<span class="size">(' + humanSize + ')</span>' +
                                '<span class="btn_wrap" title="삭제">' +
                                '<span class="ic_classic ic_del" data-docId=' + docId + '></span>' +
                                '</span>' + alertMessage +
                                '</span>' +
                                '</li>';

                            if ($("#commentFileModifyWrap_" + docId + "_" + commentId).find("ul.file_wrap").length == 0) {
                                $("#commentFileModifyWrap_" + docId + "_" + commentId).append('<ul class="file_wrap"></ul>');
                            }
                            $("#commentFileModifyWrap_" + docId + "_" + commentId).find("ul.file_wrap").append(templete);
                        }

                        self.resetAttachSizeAndCount();
                    })
                    .complete(function (e, data) {

                    })
                    .error(function (e, data) {
                        if (data.jqXHR) {
                            if (data.jqXHR.statusText == "abort") {
                                $.goAlert(commonLang['취소되었습니다.']);
                            } else {
                                $.goAlert(commonLang['업로드에 실패하였습니다.']);
                            }
                            self.resetAttachSizeAndCount();
                        }
                    });
            },

            actionModifyComment: function (e) {
                var self = this;
                var commentEl = $(e.currentTarget).parents('li');
                commentEl.removeClass('reply_create reply_edit');
                messageForm = commentEl.find('textarea');
                var id = commentEl.attr("data-id");
                var docId = $(e.currentTarget).attr("data-docId");
                var commentId = $(e.currentTarget).attr("data-commentid");

                if (!$.goValidation.isCheckLength(2, 1000, $.trim(messageForm.val())) || !messageForm.val()) {
                    messageForm.focus();
                    $.goMessage(GO.i18n(lang['0자이상 0이하 입력해야합니다.'], {"arg1": "2", "arg2": "1000"}));
                    return;
                }

                var data = {
                    id: id,
                    docId: this.docId,
                    writer: this.writer,
                    message: messageForm.val(),
                    emoticonPath: this.emoticonView.getSelectedEmoticonImgSrc($(e.currentTarget)),
                    thread: commentId
                };

                var attaches = [];
                var attachOpt;
                var attachPart = $("#commentFileModifyWrap_" + docId + "_" + commentId).find('li:not(.attachError)');

                attachPart.each(function () {
                    attachOpt = {};
                    if ($(this).attr("data-tmpname")) {
                        attachOpt.path = $(this).attr("data-tmpname");
                    }
                    if ($(this).attr("data-name")) {
                        attachOpt.name = $(this).attr("data-name");
                    }
                    if ($(this).attr("data-id")) {
                        attachOpt.id = $(this).attr("data-id");
                    }
                    attaches.push(attachOpt);
                });

                if (attaches.length > 0) {
                    data.attaches = attaches;
                }

                this.commentModel.clear();
                this.commentModel.set({docId: this.docId}, {silent: true});
                this.commentModel.save(data, {
                    type: 'PUT',
                    success: function (model, rs) {
                        self.collection.fetch({async: false, reset: true});
                    }
                });
            },

            removeModifyForm: function (e) {
                var commentEl = $(e.currentTarget).parents('li'),
                    model = this.collection.get(commentEl.attr('data-id'));

                this.emoticonView.moveToMainEmoticonView($(e.currentTarget));
                commentEl.removeClass('reply_create reply_edit');
                commentEl.find('div.action_wrap, p.message, ul.origin, #emoticonPart').attr('style', '');
                commentEl.find('.appr-doc-replyform').remove();
            },

            commentAttachDelete: function (e) {
                $(e.target).parents('li').first().remove();
                if ($("#commentAttachPart").find('li').length < 1) {
                    $("#commentAttachPart").css("margin-bottom", "0px");
                }
            },

            initUpload: function () {
                var self = this;
                var options = {
                    el: "#commentAttachBtn",
                    context_root: GO.contextRoot,
                    button_text: "",
                    button_width: 36,
                    button_height: 26,
                    url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
                    mode: "COMMENT",
                    progressBarUse: true,
                    progressEl: "#commentProgressBar"
                };

                var maxAttachSize = parseInt(GO.config('commonAttachConfig').maxAttachSize);
                var maxAttachByteSize = maxAttachSize * 1024 * 1024;
                var maxAttachNumber = parseInt(GO.config('commonAttachConfig').maxAttachNumber);

                (new FileUpload(options))
                    .queue(function (e, data) {

                    })
                    .start(function (e, data) {

                        if (self.emoticonView.hasSelectedEmoticon($(e.currentTarget))) {
                            return false;
                        }

                        if (!GO.config('attachFileUpload')) {
                            $.goAlert(commonLang['파일첨부용량초과']);
                            return false;
                        }

                        if (self.isSaaS) {
                            if (maxAttachByteSize < data.size) {
                                $.goMessage(GO.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                                return false;
                            } else {
                                self.totalAttachSize += data.size;
                            }

                            var currentTotalAttachCount = $("#commentAttachPart").find("li").length + self.totalAttachCount + 1;
                            if (maxAttachNumber < currentTotalAttachCount) {
                                $.goMessage(GO.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
                                return false;
                            } else {
                                self.totalAttachCount++;
                            }
                        }
                    })
                    .progress(function (e, data) {

                    })
                    .success(function (e, serverData, fileItemEl) {
                        var alertMessage = "";
                        var attachClass = "";
                        if (GO.util.fileUploadErrorCheck(serverData)) {
                            alertMessage = "<strong class='caution'>" + GO.util.serverMessage(serverData) + "</strong>";
                            attachClass = "attachError";
                        } else {
                            if (GO.util.isFileSizeZero(serverData)) {
                                $.goAlert(GO.util.serverMessage(serverData));
                                return false;
                            }
                        }

                        var data = serverData.data;
                        var tmpName = data.filePath;
                        var name = data.fileName;
                        var extention = data.fileExt;
                        var size = data.fileSize;
                        var humanSize = GO.util.getHumanizedFileSize(size);
                        var thumbnail = data.thumbnail;
                        var hostId = data.hostId;
                        var templete = "";

                        if (GO.util.isImage(extention)) {
                            templete =
                                '<li class="' + attachClass + '" data-tmpname="' + tmpName + '" data-name="' + name + '" data-hostid="' + hostId + '" data-size="' + size + '">' +
                                '<span class="item_image">' +
                                '<span class="thumb">' +
                                '<img src="' + thumbnail + '" alt="' + name + '" />' +
                                '</span>' +
                                '<span class="btn_wrap">' +
                                '<span class="ic_classic ic_del" title="' + lang['삭제'] + '"></span>' +
                                '</span>' +
                                '</span>' +
                                '</li>';

                            $("#commentAttachPart").find("ul.img_wrap").append(templete);
                        } else {
                            var fileType = "def";
                            if (GO.util.fileExtentionCheck(extention)) {
                                fileType = extention;
                            }

                            templete =
                                '<li class="' + attachClass + '" data-tmpname="' + tmpName + '" data-name="' + name + '" data-hostid="' + hostId + '" data-size="' + size + '">' +
                                '<span class="item_file">' +
                                '<span class="ic_file ic_' + fileType + '"></span>' +
                                '<span class="name">' + name + '</span>' +
                                '<span class="size">(' + humanSize + ')</span>' +
                                '<span class="btn_wrap" title="' + lang['삭제'] + '">' +
                                '<span class="ic_classic ic_del"></span>' +
                                '</span>' + alertMessage +
                                '</span>' +
                                '</li>';
                            $("#commentAttachPart").find("ul.file_wrap").append(templete);
                        }

                        self.resetAttachSizeAndCount();
                    })
                    .complete(function (e, data) {

                    })
                    .error(function (e, data) {
                        if (data.jqXHR) {
                            if (data.jqXHR.statusText == "abort") {
                                $.goAlert(commonLang['취소되었습니다.']);
                            } else {
                                $.goAlert(commonLang['업로드에 실패하였습니다.']);
                            }
                            self.resetAttachSizeAndCount();
                        }
                    });
            },

            getViewedTotalAttachSize: function (element) {
                var viewedTotalAttachSize = 0;
                $(element).find('li').each(function () {
                    viewedTotalAttachSize += parseInt(this.getAttribute('data-size'), 0);
                });
                return viewedTotalAttachSize;
            },

            resetAttachSizeAndCount: function () {
                if (this.isSaaS) {
                    this.totalAttachSize = 0;
                    this.totalAttachCount = 0;
                }
            },

            _validClickAttaches: function (e) {
                if (this.emoticonView.hasSelectedEmoticon($(e.currentTarget))) {
                    return false;
                }
            },
        });

        return CommentsView;
    });

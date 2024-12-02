;(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "hgn!approval/templates/document/comment_reply",
            'i18n!nls/commons',
            "i18n!approval/nls/approval",
            "file_upload",
            'GO.util'

        ],
        function (
            $,
            Backbone,
            App,
            CommentReplyTpl,
            commonLang,
            approvalLang,
            FileUpload
        ) {
            var lang = {
                '0자이상 0이하 입력해야합니다.': approvalLang['0자이상 0이하 입력해야합니다.'],
                '댓글 작성': approvalLang['댓글 작성'],
                '등록': commonLang['등록'],
                commentPlaceholder: commonLang["댓글을 남겨보세요"]
            };
            var instance = null;

            var emoticonView = {};
            var CommentReply = Backbone.View.extend({
                initialize: function (options) {
                    this.options = options || {};
                    this.el = this.options.el;
                    this.docId = this.options.docId;
                    this.commentId = this.options.commentId;
                    this.collection = this.options.collection;
                    this.totalAttachSize = 0;
                    this.totalAttachCount = 0;

                    if (options.emoticonView) {
                        emoticonView = options.emoticonView;
                    }
                },

                events: {
                    'click .comment_reply_save': 'saveReply',
                    'click div.wrap_attach span.ic_del': 'commentAttachDelete',
                    "click #emoticonBtn": "toggleEmoticonGroup",
                    "click [data-emoticon-delete-btn]": "deleteEmoticon",
                },

                render: function () {
                    var writer = GO.session();
                    this.$el.html(CommentReplyTpl({
                        'writer': writer,
                        '댓글 작성': approvalLang['댓글 작성'],
                        docId: this.docId,
                        commentId: this.commentId,
                        lang: lang
                    }));
                    this.$el.find('input').focus();
                    this.initCommentReplyUpload(this.docId, this.commentId);
                },

                saveReply: function (e) {
                    var self = this,
                        messageEl = this.$el.find('textarea');

                    if (!$.goValidation.isCheckLength(2, 1000, $.trim(messageEl.val())) || !messageEl.val()) {
                        messageEl.focus();
                        $.goMessage(App.i18n(lang['0자이상 0이하 입력해야합니다.'], {"arg1": "2", "arg2": "1000"}));
                        return;
                    }

                    if (messageEl.val()) {
                        var attaches = [];
                        var attachPart = $("#commentAttachPart_" + this.docId + "_" + this.commentId).find('li:not(.attachError)');

                        attachPart.each(function () {
                            attaches.push({path: $(this).attr("data-tmpname"), name: $(this).attr("data-name")});
                        });

                        var emoticonPath = emoticonView.getSelectedEmoticonImgSrc($(e.currentTarget));

                        var url = [GO.contextRoot + "api/approval/document", this.docId, 'replycomment'].join('/');
                        $.go(url, JSON.stringify({
                            thread: this.commentId,
                            docId: this.docId,
                            message: GO.util.unescapeHtml(messageEl.val()),
                            attaches: attaches,
                            emoticonPath: emoticonPath
                        }), {
                            contentType: 'application/json',
                            responseFn: function (rs) {
                                if (rs.code == '200') {
                                    self.collection.fetch({async: false, reset: true});
                                }
                            }
                        });
                    } else {
                        messageEl.focus();
                    }
                },

                commentAttachDelete: function (e) {
                    $(e.target).parents('li').first().remove();
                },

                toggleEmoticonGroup: function (e) {
                    console.info("toggleEmoticonGroup");
                    e.preventDefault();
                    e.stopPropagation();

                    if (emoticonView.hasAttaches($(e.currentTarget))) {
                        return false;
                    }
                    emoticonView.renderEmoticonGroup($(e.currentTarget));
                },

                deleteEmoticon: function (e) {
                    var emoticonEl = $(e.currentTarget).parent()
                    emoticonEl.empty();
                    emoticonEl.removeClass();
                },

                initCommentReplyUpload: function (docId, commentId) {
                    var self = this;
                    var options = {
                        el: "#commentReplyAttach_" + docId + "_" + commentId,
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
                    var isSaaS = GO.session().brandName == "DO_SAAS";

                    (new FileUpload(options))
                        .queue(function (e, data) {

                        })
                        .start(function (e, data) {

                            if ($(e.currentTarget).parents('[data-func-wrapper]').siblings('[data-emoticon-edit-part]').find('img').length > 0) {
                                $.goMessage(commonLang["선택한 이모티콘 삭제 후 파일을 첨부해주세요."]);
                                return false;
                            }

                            if (isSaaS) {
                                if (maxAttachByteSize < data.size) {
                                    $.goMessage(GO.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                                    return false;
                                } else {
                                    self.totalAttachSize += data.size;
                                }

                                var currentTotalAttachCount = $("#commentAttachPart_" + docId + "_" + commentId).find("li").length + self.totalAttachCount + 1;
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

                                if ($("#commentAttachPart_" + docId + "_" + commentId).find("ul.img_wrap").length == 0) {
                                    $("#commentAttachPart_" + docId + "_" + commentId).append('<ul class="img_wrap"></ul>');
                                }
                                $("#commentAttachPart_" + docId + "_" + commentId).find("ul.img_wrap").append(templete);
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

                                if ($("#commentAttachPart_" + docId + "_" + commentId).find("ul.file_wrap").length == 0) {
                                    $("#commentAttachPart_" + docId + "_" + commentId).append('<ul class="file_wrap"></ul>');
                                }
                                $("#commentAttachPart_" + docId + "_" + commentId).find("ul.file_wrap").append(templete);
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
                }
            });

            return {
                render: function (opt) {
                    instance = new CommentReply(opt);
                    return instance.render();
                },
                close: function (el) {
                    $(el).remove();
                }
            };
        });
}).call(this);
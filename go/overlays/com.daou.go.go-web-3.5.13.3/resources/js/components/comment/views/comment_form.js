define(function (require) {
    var Backbone = require("backbone");
    var App = require("app");
    var CommentFormTpl = require("hgn!components/comment/templates/comment_form");

    var Comment = require("components/comment/collections/comment");

    var commonLang = require("i18n!nls/commons");
    var boardLang = require("i18n!board/nls/board");

    var FileUpload = require('file_upload');
    require('jquery.go-validation');

    var lang = {
        comment: commonLang["댓글"],
        save: commonLang["저장"],
        cancel: commonLang["취소"],
        write: commonLang["댓글 작성"],
        alert_length: commonLang["0자이상 0이하 입력해야합니다."],
        public_writer: boardLang["작성자 공개"],
        remove: commonLang["삭제"],
        upload: commonLang["등록"],
        emoticonDelete: commonLang["이모티콘 삭제"],
        commentPlaceholder: commonLang["댓글을 남겨보세요"]
    };

    var _savingFlag = false;
    var emoticonView = {};

    return Backbone.View.extend({
        attributes: {'data-comment-form': ''},

        events: {
            "mouseover #uploadBtn": "initUploader",
            "click span.ic_del": "deleteAttach",
            "click [data-emoticon-delete-btn]": "deleteEmoticon",
            "click [data-upload-btn]": "_validClickAttaches",
            "click #emoticonBtn": "toggleEmoticonGroup",
            "click #create": "submit",
            "click #update": "submit",
            "keyup textarea": "keyCheck",
            "keyup textarea": "expandTextArea"
        },

        initialize: function (options) {
            this.typeUrl = options.typeUrl;
            this.typeId = options.typeId;
            this.commentId = options.commentId || null;
            this.uid = options.uid;
            this.isSaaS = GO.session().brandName == "DO_SAAS";
            this.totalAttachSize = 0;
            this.totalAttachCount = 0;
            this.anonymFlag = options.anonymFlag;
            this.availableAnonymousWriterOptionInPostComment = options.availableAnonymousWriterOptionInPostComment || false;
            this.isPublicWriter = options.isPublicWriter || false;
            if (!this.model) {
                this.commentModelInit();
            }

            if (options.emoticonView) {
                emoticonView = options.emoticonView;
            }

        },

        render: function () {
            /**
             * IE8 버그로 인해 인라인 스타일이 필요함. GO-16249
             */
            var style1 = "";
            var style2 = "";
            var style3 = "";
            if (GO.util.isIE8()) {
                style1 = "position:absolute;right:0px;bottom:1px;background:#fff;height:20px;";
                style2 = "position:absolute;right:80px;bottom:2px;padding:0;width:36px;height:26px;";
                style3 = this.model.isNew() ? 'margin-right: 123px !important;' : '';
            }

            this.$el.html(CommentFormTpl({
                typeId: this.typeId,
                lang: lang,
                data: this.model.toJSON(),
                isCreate: this.model.isNew(),
                createdAt: this.model.createdAtStr(),
                user: GO.session(),
                hasAttach: this.model.hasAttach(),
                hasEmoticon: this.model.hasEmoticon(),
                emoticonPath: this.model.get("emoticonPath"),
                emoticonPathSrc: this.model.getEmoticonPath(),
                files: this.model.getFiles(),
                images: this.model.getImages(),
                cid: this.cid,
                anonymFlag: this.anonymFlag, //익명게시판의 게시글에서만 작성자 공개 여부 체크 박스가 보이도록 하기 위함
                isPublicWriter: this.isPublicWriter, //댓글 폼에 작성자 공개 여부 체크 박스가 보이도록 위함
                availableAnonymousWriterOptionInPostComment: this.availableAnonymousWriterOptionInPostComment,
                style1: style1,
                style2: style2,
                style3: style3
            }));

            return this;
        },

        keyCheck: function (e) {
            if (e.shiftKey && e.keyCode == 13) this.submit();
        },

        expandTextArea: function (e) {
            this._updateStyleCreateBtn($(e.currentTarget).parents('.form_wrap'));
            GO.util.textAreaExpand(e);
        },

        commentModelInit: function () {
            this.model = new Comment();
            this.model.set({
                typeUrl: this.typeUrl,
                typeId: this.typeId,
                attaches: []
            });
        },

        deleteAttach: function (e) {
            // fileupload component 대응
            var attachEl = $(e.currentTarget).parents("li[data-name]");
            var attachArea = attachEl.parents("#commentAttachPart");
            attachEl.remove();
            if (!attachArea.find("li").length) {
                attachArea.hide(); // file_wrap, image_wrap 의 margin과 padding 때문에 빈공간이 보임
                this._updateStyleCreateBtn(attachArea);
            }
        },

        deleteEmoticon: function (e) {
            var emoticonEl = $(e.currentTarget).parent()
            emoticonEl.empty();
            emoticonEl.removeClass();
            this._updateStyleCreateBtn(emoticonEl);
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

        submit: function (e) {
            if (!this.validate()) return;

            emoticonView.moveToMainEmoticonView($(e.currentTarget));

            var attachCount = this.model.get("attaches").length;
            var self = this;

            if (this.model.isCalendar() && this.commentId) this.model.set({
                thread: this.commentId
            });

            if (_savingFlag) {
                return;
            }
            /* 작성개 공개 여부 */
            var isOpenWriter = this.$el.find('#isOpenWriter').is(':checked');

            this.model.save({
                commentId: this.commentId,
                message: this.$("textarea").val(),
                attaches: this.getAttaches(),
                emoticonPath: this.$el.find('#commentEmoticonImg').attr("data-item-path"),
                publicWriter: isOpenWriter
            }, {
                beforeSend: function () {
                    _savingFlag = true;
                },
                success: function (model, resp) {
                    self.$el.trigger("change:attach", model.get("attaches").length - attachCount);
                    self.$el.trigger("change:log");
                    self.$el.trigger("comment:reset");

                    self.$('#create').removeClass('on');
                    self.$("textarea").val("").removeAttr("style");
                    self.$("#commentAttachPart").removeClass("option_display").find("li").remove();
                    self.$("[data-emoticon-edit-part]").removeClass("thumb_append").empty();
                    self.commentModelInit();
                },
                complete: function () {
                    _savingFlag = false;
                },
                error: function (model, resp) {
                    $.goError(resp.responseJSON.message);
                }
            });
        },

        validate: function () {
            var returnValue = true;
            var message = this.$("textarea").val();
            if (!message || !$.goValidation.isCheckLength(2, 1000, $.trim(message))) {
                $.goMessage(App.i18n(lang["alert_length"], {"arg1": "2", "arg2": "1000"}));
                returnValue = false;
            }
            return returnValue;
        },

        _validClickAttaches: function (e) {
            if (!_.isUndefined(emoticonView) && emoticonView.hasSelectedEmoticon($(e.currentTarget))) {
                return false;
            }
        },

        _updateStyleCreateBtn: function ($target) {
            var createBtnEl = $target.parents('.msg_wrap').find('[data-func-wrapper]').find('#create');
            var attachEl = $target.parents('.msg_wrap').find('#commentAttachPart');
            var emoticonEl = $target.parents('.msg_wrap').find('[data-emoticon-edit-part]');
            var msgEl = $target.parents('.msg_wrap').find('.form_wrap').find('textarea');

            if (attachEl.find('li').length < 1 && emoticonEl.find('img').length < 1 && msgEl.val().length < 1) {
                createBtnEl.removeClass("on");
            } else {
                createBtnEl.addClass("on");
            }
        },

        getAttaches: function () {
            var attacheEls = this.$("#commentAttachPart").find("li:not(.attachError)");
            return _.map(attacheEls, function (el) {
                var attachEl = $(el);
                return {
                    id: attachEl.attr("data-id"),
                    path: attachEl.attr("data-path"),
                    name: attachEl.attr("data-name"),
                    hostId: attachEl.attr("host-id"),
                    size: attachEl.attr("data-size")
                };
            });
        },

        initUploader: function (e) {
            $(e.currentTarget).attr("id", "");
            var deferred = this.initFileUpload(this.$("#fileControl"), this);

            // IE 에서 알 수 없는 이미지가 잠깐 나타났다가 사라지는 현상이 있어 0.2 초의 타임아웃을 준다.
            deferred.done(function () {
                if (GO.util.msie()) {
                    var uploader = $(e.currentTarget).find("object");
                    uploader.hide();
                    setTimeout(function () {
                        uploader.show();
                    }, 200);
                }
            });
        },

        initFileUpload: function (btnElId, context) {
            var self = this;
            var options = {
                el: btnElId,
                context_root: GO.contextRoot,
                button_text: "",
                url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
                mode: "COMMENT",
                button_width: 36,
                progressEl: "#progressBarWriteWrap" + this.cid
            };

            var maxAttachSize = (GO.config('attachSizeLimit')) ?
                parseInt(GO.config('maxAttachSize')) : parseInt(GO.config('commonAttachConfig').maxAttachSize);
            var maxAttachByteSize = maxAttachSize * 1024 * 1024;
            var maxAttachNumber = (GO.config('attachNumberLimit')) ?
                parseInt(GO.config('maxAttachNumber')) : parseInt(GO.config('commonAttachConfig').maxAttachNumber);

            var uploader = (new FileUpload(options))
                .queue(function (e, data) {
                })
                .start(function (e, data) {

                    if (!_.isUndefined(emoticonView) && emoticonView.hasSelectedEmoticon($(e.currentTarget))) {
                        return false;
                    }

                    if (!GO.config('attachFileUpload')) {
                        $.goAlert(commonLang['파일첨부용량초과']);
                        return false;
                    }

                    if (self.isSaaS || GO.config('attachSizeLimit')) {
                        if (maxAttachByteSize < data.size) {
                            $.goMessage(GO.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                            return false;
                        } else {
                            self.totalAttachSize += data.size;
                        }
                    }

                    if (self.isSaaS || GO.config('attachNumberLimit')) {
                        var currentTotalAttachCount = $("#commentAttachPart").find('li').length + self.totalAttachCount + 1;
                        if (maxAttachNumber < currentTotalAttachCount) {
                            $.goMessage(GO.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
                            return false;
                        } else {
                            self.totalAttachCount++;
                        }
                    }
                })
                .progress(function (e, data) {
                    self.$("#commentAttachPart").show();
                    self.$("#progressArea").show();
                })
                .success(function (e, resp, fileItemEl) {
                    var isImage = GO.util.isImage(resp.data.fileExt);
                    var attachEl2 = self.$("#commentAttachPart");
                    attachEl2.addClass("wrap_attach");

                    if (GO.util.fileUploadErrorCheck(resp)) {
                        fileItemEl.find(".item_file").append("<strong class='caution'>" + GO.util.serverMessage(resp) + "</strong>");
                        fileItemEl.addClass("attachError");
                    } else {
                        if (GO.util.isFileSizeZero(resp)) {
                            if (attachEl2.find("li").length == 0) {
                                attachEl2.css("display", "none");
                            }
                            $.goAlert(GO.util.serverMessage(resp));
                            return false;
                        }
                    }

                    fileItemEl.attr("data-size", resp.data.fileSize);

                    if (isImage) {
                        attachEl2.find("ul.img_wrap").append(fileItemEl);
                    } else {
                        attachEl2.find("ul.file_wrap").append(fileItemEl);
                    }

                    self._updateStyleCreateBtn(attachEl2);
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

            return uploader.deferred;
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
});

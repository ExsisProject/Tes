define(function (require) {
    var Backbone = require("backbone");
    var commonLang = require("i18n!nls/commons");
    var CommentContentView = require("components/comment/views/comment_content");
    var CommentFormView = require("components/comment/views/comment_form");
    var AttachView = require("attach_file");
    var Emoticons = require('components/emoticon/views/emoticons');

    var CommentItemView = Backbone.View.extend({
        tagName: "li",


        events: {
            "click #edit": "renderEditForm",
            "click #delete": "destroy",
            "click #cancel": "cancel",
            "click #reply": "toggleReplyForm"
        },


        initialize: function (options) {
            this.rootUrl = options.rootUrl;
            this.rootId = options.rootId;
            this.typeUrl = options.typeUrl,
                this.typeId = options.typeId,
                this.isWritable = options.isWritable;
            this.isReply = options.isReply && this.isWritable;
            this.uid = options.uid;
            this.popupPrint = options.popupPrint || false;
            this.availableAnonymousWriterOptionInPostComment = options.availableAnonymousWriterOptionInPostComment || false;
            this.anonymFlag = options.anonymFlag || false;
            this.isPublicWriter = options.model ? (options.model.get('publicWriter') || false) : false;
            this.emoticon = new Emoticons();
            this.model.set({
                typeUrl: this.typeUrl,
                typeId: this.typeId
            });
        },


        render: function () {
            this.commentView = new CommentContentView({
                model: this.model,
                isReply: this.isReply,
                writable: this.isWritable,
                popupPrint: this.popupPrint
            });
            this.$el.html(this.commentView.render().el);
            this.renderAttachView();

            if (this.model.isThread()) this.$el.addClass("depth_in");

            return this;
        },


        renderEditForm: function () {
            this.commentForm = new CommentFormView({
                model: this.model,
                uid: this.uid,
                anonymFlag: this.anonymFlag,
                availableAnonymousWriterOptionInPostComment: this.availableAnonymousWriterOptionInPostComment,
                isPublicWriter: this.isPublicWriter
            });
            this.$el.html(this.commentForm.render().el);
            this.commentForm.$("textarea").trigger("keyup");
            this.$el.addClass("reply_create reply_edit");
            if (this.model.isThread()) this.$el.addClass("reply_create");
        },


        destroy: function () {
            var self = this;
            var action = function () {
                self.model.destroy({
                    success: function (model, resp) {
                        self.$el.trigger("change:attach", 0 - model.get("attaches").length);
                        self.$el.trigger("change:log");
                        self.$el.trigger("comment:reset");
                        self.$el.remove();
                    },
                    error: function (model, resp) {
                        $.goError(resp.responseJSON.message);
                    }
                });
            };

            $.goCaution(commonLang["댓글 삭제"], commonLang["삭제하시겠습니까?"], action);
        },


        cancel: function (e) {
            // 이모티콘view 메인 댓글 입력 창의 이모티콘view로 이동
            this.emoticon.moveToMainEmoticonView($(e.currentTarget));

            this.render();
            this.$el.removeClass("reply_create reply_edit");
        },

        renderAttachView: function () {
            var self = this;
            var url = this.isBoard() ? "/attaches/" : "/download/";

            if (this.model.get("attaches").length) {
                AttachView.create(this.$("#attachPart"), this.model.get("attaches"), function (attach) {
                    return GO.contextRoot + "api/" + self.rootUrl + "/" + self.rootId + "/comment/" + self.model.id + url + attach.id;
                });
            }
        },

        // 게시판 서버 코드를 common(업무, 보고, 설문) 과 맞춰야 한다. 임시로 클라이언트에서 처리.
        isBoard: function () {
            return this.rootUrl.split("/")[0] == "board";
        },

        toggleReplyForm: function (e) {
            var textEl = this.$("#reply").find("span.txt_b");

            if (this.replyForm) {
                // 이모티콘view 메인 댓글 입력 창의 이모티콘view로 이동
                this.emoticon.moveToMainEmoticonView($(e.currentTarget));

                this.replyForm.remove();
                this.replyForm = null;
                textEl.text(commonLang["댓글"]);
            } else {
                var replyTpl = $("<li class='depth_in reply_create'></li>");
                var replyForm = new CommentFormView({
                    typeUrl: this.typeUrl,
                    typeId: this.typeId,
                    commentId: this.model.id,
                    uid: this.uid,
                    availableAnonymousWriterOptionInPostComment: this.availableAnonymousWriterOptionInPostComment || false,
                    anonymFlag: this.anonymFlag || false
                });
                this.replyForm = replyTpl.append(replyForm.render().el);
                this.$el.after(this.replyForm);
                textEl.text(commonLang["취소"]);
            }
        }
    });
    return CommentItemView;
});
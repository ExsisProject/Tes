define(function (require) {
    var Backbone = require("backbone");
    var Comments = require("components/comment/collections/comments");
    var CommentItemView = require("components/comment/views/comment_item");
    var CommentFormView = require("components/comment/views/comment_form");
    var CommentFrameTpl = require("hgn!components/comment/templates/comment_print_frame");
    var EmoticonView = require('components/emoticon/views/emoticons');
    var commonLang = require("i18n!nls/commons");
    require("jquery.go-validation");

    var lang = {
        댓글: commonLang["댓글"],
        개: commonLang["개"]
    };

    var CommentView = Backbone.View.extend({

        initialize: function (options) {
            this.typeUrl = options.typeUrl;
            this.typeId = options.typeId;
            this.rootUrl = options.rootUrl || options.typeUrl;
            this.rootId = options.rootId || options.typeId;
            this.isReply = options.hasOwnProperty("isReply") ? options.isReply : true;
            this.isPrintMode = options.isPrintMode;
            this.onAfterRender = _.bind(this.options.onAfterRender || function () {
            }, this);
            this.isWritable = (options.isWritable == undefined) ? true : options.isWritable;
            this.popupPrint = options.popupPrint || false;
            this.anonymFlag = options.anonymFlag;
            this.availableAnonymousWriterOptionInPostComment = options.availableAnonymousWriterOptionInPostComment || false;

            this.emoticonView = new EmoticonView({});

            if (this.isPrintMode) {
                this.isWritable = !(this.isPrintMode);
            }

            this.collection = new Comments({
                typeUrl: this.typeUrl,
                typeId: this.typeId
            });

            this.collection.on("reset", this.renderList, this);

            var self = this;
            this.$el.on("comment:reset", function () {
                self.fetchComments(true).done(function () {
                    self.$el.trigger("comment:change", [self.typeUrl, self.collection.length]);
                });
            });
        },

        render: function () {
            this.$el.html('<ul class="reply"></ul>');

            if (this.isWritable) {
                var commentFormView = new CommentFormView({
                    typeUrl: this.typeUrl,
                    typeId: this.typeId,
                    uid: this.cid,
                    anonymFlag: this.anonymFlag,
                    availableAnonymousWriterOptionInPostComment: this.availableAnonymousWriterOptionInPostComment,
                    emoticonView: this.emoticonView
                });
                this.$el.append(commentFormView.render().el);
                commentFormView.$el.addClass("reply_create");
                commentFormView.$el.attr("data-comment-main-edit", true);
            }

            this.$el.append(this.emoticonView.render().el);

            return this;
        },

        renderList: function () {
            this.$("ul.reply").children().remove();

            if (this.popupPrint) {
                this.$el.html(CommentFrameTpl({
                    lang: lang
                }));
            }

            this.collection.each(function (model) {
                this.addOne(model);
            }, this);

            this.$("#commentCount").append(this.collection.length);
            this.$("ul.reply").find("li:last").addClass("last");

            this.onAfterRender(this);
        },

        addOne: function (model) {
            var commentItem = new CommentItemView({
                model: model,
                rootUrl: this.rootUrl,
                rootId: this.rootId,
                typeUrl: this.typeUrl,
                typeId: this.typeId,
                isReply: this.isReply,
                isWritable: this.isWritable,
                uid: this.cid,
                popupPrint: this.popupPrint,
                availableAnonymousWriterOptionInPostComment: this.availableAnonymousWriterOptionInPostComment,
                anonymFlag: this.anonymFlag || false
            });
            if (this.popupPrint) {
                this.$("#comment_creat").append(commentItem.render().el);
            } else {
                this.$("ul.reply").append(commentItem.render().el);
            }
        },

        fetchComments: function (flag) {
            var asyncFlag = flag || false;
            var fetch = this.collection.fetch({data: {offset: 1000}, async: asyncFlag, reset: true});

            return asyncFlag ? fetch : this;
        },

        setComments: function (comments) {
            this.collection.set(comments);
        }
    });

    return {
        // 하위 호환을 위해 유지. 신규 App 에서는 사용 금지.
        render: function (opt) {
            var commentView = this.init(opt);
            return commentView.render().fetchComments();
        },
        init: function (opt) {
            return new CommentView(opt);
        }
    };
});
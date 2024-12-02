;(function () {
    define([
            'jquery',
            'backbone',
            'app',
            'i18n!nls/commons',
            "components/comment/collections/comments",
            "components/m_comment/views/item",
            "components/m_comment/views/form",
            "components/m_comment/views/reply",
            'hgn!components/m_comment/templates/temp_attach_image_item',
            "components/go-fileuploader/mobile",
            "views/mobile/header_toolbar",
            "jquery.go-validation",
            'GO.util'
        ],
        function (
            $,
            Backbone,
            GO,
            CommonLang,
            CommentCollection,
            CommentItemView,
            CommentFormView,
            CommentReplyView,
            AttachTempImageTpl,
            FileUploader,
            HeaderToolbarView
        ) {

            var CommentAppView = Backbone.View.extend({
                tagName: "ul",

                className: "list_reply",

                events: {
                    "vclick li a.reply": "addReply",
                    "keyup textarea": "_expandTextarea"
                },

                initialize: function (options) {
                    this.headerToolbarView = HeaderToolbarView;
                    this.options = options || {};
                    this.$el.off();
                    this.isReply = (options.isReply == undefined) ? true : options.isReply;
                    this.targetEl = this.options.targetEl;
                    this.typeUrl = this.options.type;
                    this.typeId = this.options.typeId;
                    this.collection = new CommentCollection({typeUrl: this.typeUrl, typeId: this.typeId});
                    this.collection.fetch({async: false});
                    this.commentFormView = null;
                    this.useCreateForm = (options.useCreateForm == undefined) ? true : options.useCreateForm
                    this.boardModel = options.boardModel;

                    if (this.useCreateForm == false) {
                        this.isReply = false;
                    }

                    GO.EventEmitter.off("m_comment");
                    GO.EventEmitter.on("m_comment", 'change:comment', _.bind(function () {
                        this.collection.fetch({
                            success: _.bind(function (collection) {
                                this.render();
                                GO.EventEmitter.trigger("common", "change:comment", collection.length);
                            }, this)
                        });
                    }, this));
                },

                render: function () {
                    var self = this;
                    this.commentFormView = new CommentFormView({
                        typeUrl: this.typeUrl,
                        typeId: this.typeId,
                        boardModel: this.boardModel
                    });
                    this.$el.html(this.commentFormView.el);
                    this.commentFormView.render();

                    this.collection.each(function (model, index) {
                        self.addComment(model);
                    });

                    if (!this.useCreateForm) {
                        this.$el.find("li.creat").remove();
                    }

                    this.targetEl.append(this.$el);
                    this.commentFormView.attachFileUploader();
                    this.headerToolbarView.render({
                        isClose: true,
                        title: CommonLang['댓글']
                    });
                    return this;
                },

                makeCommentItem: function (model) {
                    return new CommentItemView({
                        "typeUrl": this.typeUrl,
                        "typeId": this.typeId,
                        "model": model,
                        "isReply": this.isReply,
                        "anonymFlag": this.boardModel ? this.boardModel.get('anonymFlag') : false
                    });
                },

                addComment: function (model, placeHolderEl) {
                    var commentItemView = this.makeCommentItem(model);

                    if (placeHolderEl == undefined) {
                        this.$el.find("li.creat").before(commentItemView.render().$el);
                    } else {
                        placeHolderEl.off();
                        placeHolderEl.replaceWith(commentItemView.render().$el);
                    }

                    this.$el.trigger("addComment", [this]);
                },

                addReply: function (e) {
                    var targetEl = $(e.currentTarget);
                    var parentEl = targetEl.parents("li");
                    var commentId = parentEl.attr("comment-id");
                    var lastCommentEl = this.$el.find("li[comment-thread-id='" + commentId + "']:last");

                    var commentReplyView = CommentReplyView.create({
                        typeUrl: this.typeUrl,
                        typeId: this.typeId,
                        commentId: commentId,
                        boardModel: this.boardModel
                    });

                    if (!lastCommentEl.next().hasClass("reply")) {
                        lastCommentEl.after(commentReplyView.render().$el);
                    }

                    commentReplyView.attachFileUploader();
                },

                getCommentCount: function () {
                    return this.collection.length;
                },

                _expandTextarea: function (e) {
                    GO.util.textAreaExpand(e);
                }
            }, {
                __instance__: null,
                create: function (options) {
                    var instance = new CommentAppView({
                        "targetEl": $(options.el),
                        "type": options.type,
                        "typeId": options.typeId,
                        "isReply": options.isReply,
                        "useCreateForm": options.useCreateForm,
                        "boardModel": options.boardModel
                    });

                    instance.render();

                    __instance__ = instance;

                    return instance;
                }
            });
            return CommentAppView;
        });
}).call(this);
define(function (require) {
    var Backbone = require("backbone");
    var commonLang = require("i18n!nls/commons");
    var CommentContentTpl = require("hgn!components/comment/templates/comment_content");
    var CommentPrintTpl = require("hgn!components/comment/templates/comment_print");

    var lang = {
        comment: commonLang["댓글"]
    };

    var CommentItemView = Backbone.View.extend({

        initialize: function (options) {
            this.isReply = options.isReply;
            this.writable = options.writable;
            this.popupPrint = options.popupPrint || false;
        },

        render: function () {
            var tpl;
            if (this.popupPrint) {
                tpl = CommentPrintTpl;
            } else {
                tpl = CommentContentTpl;
            }

            this.$el.html(tpl({
                lang: lang,
                data: this.model.toJSON(),
                createdAt: GO.util.snsDate(this.model.get("createdAt")),
                hasAttach: this.model.hasAttach(),
                hasEmoticon: this.model.hasEmoticon(),
                emoticonPath: this.model.getEmoticonPath(),
                isReply: this.isReply && this.model.id == this.model.get("thread"),
                content: GO.util.textToHtmlWithHyperLink(this.model.get("message")),
                writable: this.writable,
                position: this.model.get("writer").position || this.model.get("writer").positionName, // 게시판이 positionName 으로 쓰고있음
                thumbnail: this.model.get("writer").thumbnail || this.model.get("writer").thumbSmall // 게시판이 thumbSmall 로 쓰고 있음
            }));

            return this;
        }
    });
    return CommentItemView;
});
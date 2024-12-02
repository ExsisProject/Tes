define('docs/views/mobile/docs_reply', function (require) {

    var Backbone = require('backbone');

    var ReplyTemplate = require('hgn!docs/templates/mobile/docs_reply');
    var HeaderToolbarView = require("views/mobile/header_toolbar");
    var CommentView = require("m_comment");

    return Backbone.View.extend({

        initialize: function (options) {
            this.options = options;
            this.docsInfoId = this.options.docsInfoId;
        },

        render: function () {
            $(".content_page").html(ReplyTemplate({}));

            this._renderHeader();
            CommentView.create({
                el: "#comment_list",
                type: "docs/docsInfo",
                typeId: this.docsInfoId
            });

            return this;
        },

        _renderHeader: function () {
            var toolBarData = {
                isClose: true
            };
            HeaderToolbarView.render(toolBarData);
        }
    });
});
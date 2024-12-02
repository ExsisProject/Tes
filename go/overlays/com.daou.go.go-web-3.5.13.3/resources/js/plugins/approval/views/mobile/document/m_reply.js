define('approval/views/mobile/document/m_reply', function (require) {

    var Backbone = require('backbone');

    var ReplyTemplate = require('hgn!approval/templates/mobile/document/m_reply');
    var HeaderToolbarView = require("views/mobile/header_toolbar");
    var CommentView = require("m_comment");
    var commonLang = require('i18n!nls/commons');

    return Backbone.View.extend({

        initialize: function (options) {
            this.options = options;
            this.docsInfoId = this.options.docsInfoId;
        },


        render: function () {

            $(".content_page").html(ReplyTemplate({

            }));

            CommentView.create({
                el : "#comment_list",
                type : "approval/document",
                typeId : this.docsInfoId
            });

            this._renderHeader();
            return this;
        },

        _renderHeader: function (){
            this.headerToolbarView = HeaderToolbarView;
            this.headerToolbarView.render({
                title : commonLang["댓글"],
                isClose : true
            });
        }
    });
});
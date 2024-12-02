define('works/views/mobile/doc_detail/doc_activity_item', function (require) {

    var Backbone = require('backbone');
    var App = require('app');

    var DocActivityItemTmpl = require('hgn!works/templates/mobile/doc_detail/doc_activity_item');
    var AttachFilesView = require('attach_file');
    var FontResize = require("views/mobile/m_font_resize");

    var commonLang = require('i18n!nls/commons');
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        "edit": commonLang["수정"],
        "delete": commonLang["삭제"],
        "comment": commonLang["댓글"]
    };

    return Backbone.View.extend({

        events: {
            "swipeleft #activityItemWrapper": "seeNext",
            "swiperight #activityItemWrapper": "seePrevious",
            "click #deleteActivityBtn": "destroyConfirm",
            "click #editActivityBtn": "editActivity",
            "click #goCommentList": "goCommentList"
        },

        initialize: function (options) {
            this.activity = options.model;
            this.appletId = options.appletId;
            this.docId = options.docId;
            this.model.set('appletId', this.appletId);
            this.model.set('docId', this.docId);
            this.editorId = "activityEditor" + this.activity.get("id");
            this.originalScale = 1;
        },

        render: function () {
            this.$el.html(DocActivityItemTmpl({
                content: GO.util.escapeXssFromHtml(this.activity.get('content')),
                lang: lang,
                data: this.activity.toJSON(),
                snsDate: GO.util.snsDate(this.activity.get("updatedAt") ? this.activity.get("updatedAt") : this.activity.get("createdAt")),
                commentPresent: this.activity.commentPresent()
            }));
            $("#content").css('visibility', 'hidden');
            $("#doc_header").css('visibility', 'visible');
            this.renderAttachView();
            this.resizeContent();
            return this;
        },

        renderAttachView: function () {
            var self = this;
            this.attachView = AttachFilesView.create('#attachArea' + this.activity.id, this.activity.get("attaches"), function (attach) {
                return GO.contextRoot + "api/works/activity/" + self.model.id + "/download/" + attach.id;
            });
        },

        resizeContent: function () {
            var self = this;
            setTimeout(function () {
                self.decideIscrollInit();
                self.fontResizeLayerAdd();
            }, 500);
        },

        decideIscrollInit: function () {
            if ($(document).width() < $("#activityContent").width()) {
                this.iscroll = GO.util.initDetailiScroll("activityItemWrapper", "iScrollContentWrap", "activityContentWrapper");
                this.originalScale = this.iscroll.options.zoomMin;
            } else {
                $("#content").css('visibility', 'visible');
            }
        },

        fontResizeLayerAdd: function () {
            FontResize.render({
                el: "#fontResizeWrap",
                targetContentEl: "#activityContent"
            });
        },

        editActivity: function () {
            if (/<.*>.*<\/.*>/.test(this.model.get('content'))) {
                alert(worksLang["PC에서 등록한 업무는 모바일에서 수정할 수 없습니다."]);
                return;
            }
            App.router.navigate("works/applet/" + this.appletId + "/doc/" + this.docId + "/activity/" + this.activity.get("id"), true);
        },

        destroyConfirm: function () {
            if (confirm(commonLang["삭제하시겠습니까?"])) this.destroyActivity();
        },

        destroyActivity: function () {
            var self = this;
            this.activity.destroy({
                success: function () {
                    alert(commonLang["삭제되었습니다."]);
                    App.router.navigate("works/applet/" + self.appletId + "/doc/" + self.docId + "/activities", true);
                },
                error: function () {
                    console.log("error");
                }
            });
        },

        isPageMovable: function () {
            var transformStr = $("#iScrollContentWrap").css('transform');
            var currentScale = transformStr.replace("matrix(", '').split(',')[0];
            return Number(currentScale).toFixed(6) == this.originalScale.toFixed(6);
        },

        seeNext: function (e) {
            if ($("#rightBtn").length > 0 && this.isPageMovable()) {
                $("#rightBtn").trigger('click');
            }
        },

        seePrevious: function (e) {
            if ($("#leftBtn").length > 0 && this.isPageMovable()) {
                $("#leftBtn").trigger('click');
            }
        },

        goCommentList: function () {
            App.router.navigate("works/applet/" + this.appletId + "/doc/" + this.docId + "/activity/" + this.activity.get("id") + "/comment", true);
        }
    });
});
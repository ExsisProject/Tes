define('works/views/app/report/report_text_view', function (require) {
    var worksLang = require("i18n!works/nls/works");

    return Backbone.View.extend({
        initialize: function (options) {
            this.content = options.content;
            this.rid = options.rid;
        },

        render: function () {
            var viewHtml;
            if (!this.content) {
                this.$el.addClass('item_image');
                viewHtml = Hogan.compile([
                    '<div class="widget_nulldata"><div class="nulldata">' +
                    '<div class="img"><span class="icx2 ic_box_nulldata"></span></div>' +
                    '<p class="nulldata_tit">' + worksLang['텍스트가 없습니다'] + '</p>' +
                    '<p class="nulldata_txt">' + worksLang['이 곳을 클릭하여 우측 톱니바퀴를 눌러 텍스트를 수정해주세요'] + '</p></div></div>'
                ].join(""));
            } else {
                viewHtml = Hogan.compile([
                    '<div><div class="report_import editor_view" id="reportContentView_' + this.rid + '">' + this.content + '</div></div>'
                ].join(""));
            }
            this.$el.html(viewHtml.render());
            return this;
        },

        getContent: function () {
            return this.content;
        },

        updateContent: function (content) {
            this.content = content;
        }
    });
});

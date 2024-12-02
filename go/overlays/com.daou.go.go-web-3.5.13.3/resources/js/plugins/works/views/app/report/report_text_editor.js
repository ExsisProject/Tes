define("works/views/app/report/report_text_editor", function (require) {
    var Template = require("hgn!works/components/report/works_report_editor")

    return Backbone.View.extend({
        initialize: function (options) {
            this.content = options.content;
        },

        render: function () {
            this.$el.html(Template({}));
            return this;
        },
    });
});

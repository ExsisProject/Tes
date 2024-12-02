define('works/views/app/print_body', function(require) {

    var BasePrintView = require("components/print/views/print");
    var PrintToolbarTmpl = require("hgn!works/templates/app/print_toolbar");
    var PrintBodyTmpl = require("hgn!works/templates/app/print_body");

    var commonLang = require('i18n!nls/commons');

    var lang ={
        title : commonLang["인쇄 미리보기"],
        print : commonLang["인쇄"]
    };

    var PrintView = BasePrintView.extend({
        tagName: 'div',
        className: 'layer_normal layer_report_print popup',

        events: {
            "click #printDoc": "print"
        },

        render: function() {
            this.$el.html(PrintBodyTmpl({
                lang : lang,
                content : typeof this.content == "string" ? this.content : ""
            }));

            if(typeof this.options.content != "string"){
                this.$el.find("#printContent").html(this.content);
            }

            this.$el.prepend(PrintToolbarTmpl({
                lang : lang,
                title : this.options.title || lang.title
            }));

            return this;
        }

    });

    return PrintView;
});
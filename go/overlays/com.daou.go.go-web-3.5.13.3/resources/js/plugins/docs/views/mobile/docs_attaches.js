define('docs/views/mobile/docs_attaches', function (require) {

    var Backbone = require('backbone');
    var docsModel = require("docs/models/docs_doc_item");
    var HeaderToolbarView = require("views/mobile/header_toolbar");
    var DocsAttachesView = require('docs/views/docs_attaches');
    var commonLang = require('i18n!nls/commons');
    var Template = Hogan.compile(
        '<div class="content">'
            +'<div class="box flat detail_docs">'
                +'<div class="module_drop">'
                    +'<div class="module_drop_body" id="{{attachesId}}"></div>'
                +'</div>'
            +'</div>'
        +'</div>'
    );

    return Backbone.View.extend({
        el: '#content',

        initialize: function (options) {
            this.options = options;
            this.docsId = this.options.docsId;
        },

        dataFetch: function() {
            var deferred = $.Deferred();
            this.docsModel = new docsModel({id : this.docsId});
            this.docsModel.fetch({
                statusCode: {
                    400 : function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    403 : function() { GO.util.error('403', { "msgCode": "400-common"}); },
                    404 : function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    500 : function() { GO.util.error('500'); }
                }
            }).done(function () {
                deferred.resolve();
            });
            return deferred;
        },

        render: function() {
            HeaderToolbarView.render({
                title: commonLang["첨부파일"],
                isClose : true
            });
            this.$el.html(Template.render({attachesId : 'attaches'+this.docsModel.id}));
            DocsAttachesView.render({
                el : '#attaches'+this.docsModel.id,
                attaches : this.docsModel.getAttaches(),
                docsId : this.docsModel.id
            });
        }
    });
});
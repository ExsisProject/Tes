define([
    'backbone',
    'underscore',
    'approval/views/document/document_print',
    'approval/models/document',
    'hgn!approval/templates/document/print_toolbar',
    'i18n!nls/commons',
    'i18n!approval/nls/approval'
], function(
    Backbone,
    _,
    DocumentPrintView,
    Document,
    ToolbarTemplate,
    commonLang
) {
    var lang = {
        '인쇄 미리보기': commonLang['인쇄 미리보기'],
        '인쇄': commonLang['인쇄']
    };

    return Backbone.View.extend({
        deferred: $.Deferred(),

        events: {
            'click #printDoc': 'printDoc'
        },

        initialize: function(options) {
            options = options || {};
            this.docId = options.docId;
            this.version = options.version;
            this.document = new Document({}, {docId: this.docId});
            this.document.fetch({
                success: _.bind(function(model) {
                    console.log(model);
                    this.deferred.resolve();
                }, this)
            });
        },

        render: function() {
            this.deferred.done(_.bind(function() {
                var versionDocument = this.document.get('actionLogs').filter(_.bind(function(log) {
                    return log.documentVersionModel && log.documentVersionModel.version + '' === this.version;
                }, this))[0];
                var documentVersionModel = versionDocument.documentVersionModel || {};
                var documentPrintView = new DocumentPrintView({
                    docId : this.docId,
                    docBody : documentVersionModel.docBody,
                    attaches : documentVersionModel.attaches,
                    references : documentVersionModel.references
                });
                documentPrintView.setElement(this.$el);
                documentPrintView.render();
                this.$el.prepend(ToolbarTemplate({lang: lang}));
                this.$el.find('.wrap_option').remove();
            }, this));

            return this;
        },

        printDoc: function() {
            GO.util.print(this.$el);
        }
    })
});
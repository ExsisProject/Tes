define([
        "jquery",
        "backbone",
        "views/mobile/header_toolbar",
        "hgn!approval/templates/mobile/document/m_doc_preview",
    ],
    function(
        $,
        Backbone,
        HeaderToolbarView,
        DocumentPreviewTpl
    ) {
        var DocumentActionView = Backbone.View.extend({
            initialize : function(options){
                _.bindAll(this, 'render');
                this.options = options || {};
                this.toolBarData = this.options.toolBarData;
                this.contents = this.options.contents
            },
            render: function() {
                this.headerToolbarView = HeaderToolbarView;
                this.headerToolbarView.render(this.toolBarData);
                this.$el.html(DocumentPreviewTpl({
                    contents : this.contents
                }));
            },
            release: function() {
                this.$el.off();
                this.$el.empty();
            }
        });
        return DocumentActionView;
    });
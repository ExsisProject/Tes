(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "admin/models/appr_official_doc_sender",
        "admin/views/appr_official_doc_sender"
    ], 
    function(
        $,
        Backbone,
        App,
        commonLang,
        adminLang,
        OfficialDocSenderModel,
        OfficialDocSenderView
    ) {

        /**
        *
        * 직인 생성 뷰
        *
        */
        var OfficialDocSenderShowView = Backbone.View.extend({

            formView: null,

            initialize : function(){
                this.model = new OfficialDocSenderModel({
                    id: this._getFormIdFromURL()
                });

                this.formView = new OfficialDocSenderView({
                    model: this.model
                });
            },
            
            render : function() {
                this.model.fetch({
                    success  : $.proxy(function(model, resp, opts) {
                        this.formView.render();
                    }, this)
                });
            },

            _getFormIdFromURL: function() {
                var pathSplit = GO.router.getUrl().split('/');
                return pathSplit[_.indexOf(pathSplit, 'sender') + 1];
            }
        });
        return OfficialDocSenderShowView;
    });
}).call(this);
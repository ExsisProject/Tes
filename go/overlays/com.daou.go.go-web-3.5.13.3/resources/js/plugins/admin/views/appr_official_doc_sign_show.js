(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "admin/models/appr_official_doc_sign",
        "admin/views/appr_official_doc_sign"
    ], 
    function(
        $,
        Backbone,
        App,
        commonLang,
        adminLang,
        OfficialDocSignModel,
        OfficialDocSignView
    ) {

        /**
        *
        * 직인 생성 뷰
        *
        */
        var OfficialDocSignShowView = Backbone.View.extend({

            formView: null,

            initialize : function(){
                this.model = new OfficialDocSignModel({
                    id: this._getFormIdFromURL()
                });

                this.formView = new OfficialDocSignView({
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
                return pathSplit[_.indexOf(pathSplit, 'sign') + 1];
            }
        });
        return OfficialDocSignShowView;
    });
}).call(this);
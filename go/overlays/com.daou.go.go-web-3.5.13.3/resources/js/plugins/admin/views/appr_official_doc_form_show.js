(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "admin/models/appr_official_doc_form",
        "admin/views/appr_official_doc_form"
    ], 
    function(
        $,
        Backbone,
        App,
        commonLang,
        adminLang,
        OfficialDocFormModel,
        OfficialDocFormView
    ) {

        /**
        *
        * 공문서 양식 생성 뷰
        *
        */
        var OfficialDocFormShowView = Backbone.View.extend({

            formView: null,

            initialize : function(){
                this.model = new OfficialDocFormModel({
                    id: this._getFormIdFromURL()
                });

                this.formView = new OfficialDocFormView({
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
                return pathSplit[_.indexOf(pathSplit, 'form') + 1];
            }
        });
        return  OfficialDocFormShowView;
    });
}).call(this);
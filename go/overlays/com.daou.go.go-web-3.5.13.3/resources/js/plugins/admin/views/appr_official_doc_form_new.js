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
        var OfficialDocFormNewView = Backbone.View.extend({

            formView: null,

            initialize : function(){
                this.formView = new OfficialDocFormView({
                    model: new OfficialDocFormModel()
                });
            },
            
            render : function() {
                this.formView.render();
            }
        });
        return OfficialDocFormNewView;
    });
}).call(this);
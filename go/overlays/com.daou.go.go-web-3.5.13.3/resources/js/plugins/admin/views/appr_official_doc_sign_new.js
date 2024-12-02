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
        var OfficialDocSignNewView = Backbone.View.extend({

            formView: null,

            initialize : function(){
                this.formView = new OfficialDocSignView({
                    model: new OfficialDocSignModel()
                });
            },
            
            render : function() {
                this.formView.render();
            }
        });
        return OfficialDocSignNewView;
    });
}).call(this);
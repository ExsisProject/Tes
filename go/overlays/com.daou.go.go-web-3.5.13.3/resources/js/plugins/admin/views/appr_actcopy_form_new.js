(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "admin/models/actcopy_form",
        "admin/views/appr_actcopy_form",
        "jquery.go-sdk",
        "jquery.jstree",
        "jquery.go-popup",
        "jquery.go-grid",
        "jquery.go-orgslide",
        "jquery.go-validation"
    ], 
    function(
        $,
        Backbone,
        App,
        commonLang,
        adminLang,
        ActcopyFormModel,
        ActcopyFormView
    ) {

        /**
        *
        * 결재 양식 생성 뷰
        *
        */
        var ActcopyFormNewView = Backbone.View.extend({

            formView: null,

            initialize : function(){
                this.formView = new ActcopyFormView({
                    model: new ActcopyFormModel()
                });
            },
            
            render : function() {
                this.formView.render();
            }
        });
        return ActcopyFormNewView
    });
}).call(this);
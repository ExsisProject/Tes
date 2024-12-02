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
                this.model = new ActcopyFormModel({
                    id: this._getFormIdFromURL()
                });

                this.formView = new ActcopyFormView({
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
                return pathSplit[_.indexOf(pathSplit, 'actcopyform') + 1];
            }
        });
        return ActcopyFormNewView;
    });
}).call(this);
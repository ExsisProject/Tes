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
        var OfficialDocSenderNewView = Backbone.View.extend({

            formView: null,

            initialize : function(){
                this.formView = new OfficialDocSenderView({
                    model: new OfficialDocSenderModel()
                });
            },
            
            render : function() {
                this.formView.render();
            }
        });
        return OfficialDocSenderNewView;
    });
}).call(this);
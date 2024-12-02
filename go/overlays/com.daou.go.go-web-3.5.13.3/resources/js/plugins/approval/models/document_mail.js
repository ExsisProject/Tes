define([
        "backbone",
        "app"
    ],

    function(Backbone, App) {

        var ApprDocumentMailModel = Backbone.Model.extend({

            initialize: function(options) {
                this.docId= options.docId;
            },

            url: function() {
                return [GO.contextRoot + "api/approval/document", this.docId, "sendmail"].join('/');
            }
        });

        return ApprDocumentMailModel;
    });
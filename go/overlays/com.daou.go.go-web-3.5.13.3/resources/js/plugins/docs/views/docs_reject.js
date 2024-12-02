define('docs/views/docs_reject', function(require) {

    var Backbone = require('backbone');
    var rejectTmpl = require("hgn!docs/templates/docs_reject");

    var docsLang = require("i18n!docs/nls/docs");
    
    var RejectModel = Backbone.Model.extend({

        initialize : function(options){
            this.docsId = options.docsId;
        },

        url: function () {
            return GO.contextRoot + "api/docs/"+this.docsId+"/rejected";
        }

    });


    var DocsRejectView =  Backbone.View.extend({

        initialize: function (options) {
            this.options = options;
            this.docsModel = this.options.docsModel;
        },

        render: function () {

            this.$el.html(rejectTmpl({
            	lang : { "반려" : docsLang["반려"] },
                model : this.rejectModel.toJSON(),
                date : GO.util.shortDate(this.rejectModel.get("createdAt"))
            }));
            return this;
        },

        rejectDataFetch : function(){

            var fetchReject = $.Deferred();
            this.rejectModel = new RejectModel({docsId : this.docsModel.id});
            this.rejectModel.fetch({
                statusCode: {
                    400 : function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    403 : function() { GO.util.error('403', { "msgCode": "400-common"}); },
                    404 : function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    500 : function() { GO.util.error('500'); }
                },

                success : function(){
                    fetchReject.resolve();
                }
            });

            return fetchReject;
        }
    });

    return DocsRejectView;
});
define('docs/views/mobile/docs_version', function (require) {

    var Backbone = require('backbone');
    var docsModel = require("docs/models/docs_doc_item");
    var HeaderToolbarView = require("views/mobile/header_toolbar");
    var docsLang = require("i18n!docs/nls/docs");
    var VersionTemplate = require('hgn!docs/templates/mobile/docs_version');
    var VersionItemTmpl = require('hgn!docs/templates/mobile/docs_version_item');

    var VersionsCollection = Backbone.Collection.extend({
        model : docsModel,

        initialize : function(options){
            this.docsId = options.docsId;
        },

        url: function () {
            return GO.contextRoot + "api/docs/"+this.docsId+"/versions";
        }
    });

    var DocsVersionView = Backbone.View.extend({
        el: '#content',

        events : {
            "click li.docsVersion" : "moveDocs"
        },

        initialize: function (options) {
            this.options = options;
            this.docsId = this.options.docsId;
        },

        dataFetch: function() {
            var deferred = $.Deferred();
            this.versionCollection = new VersionsCollection({docsId : this.docsId});
            this.versionCollection.fetch({
                statusCode: {
                    400 : function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    403 : function() { GO.util.error('403', { "msgCode": "400-common"}); },
                    404 : function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    500 : function() { GO.util.error('500'); }
                }, success : function(){
                    deferred.resolve();
                }
            });
            return deferred;
        },

        render: function() {
            var self = this;
            HeaderToolbarView.render({
                title: docsLang["버전"],
                isClose : true
            });
            this.$el.html(VersionTemplate());
            this.versionCollection.each(function (docsModel) {
                self.$el.find("#versionWrap").append(VersionItemTmpl({
                    current : self.docsId == docsModel.id,
                    version : "VER "+docsModel.getVersion(),
                    docsId : docsModel.id,
                    reason : docsModel.getReason(),
                    thumbnail : docsModel.getThumbnail(),
                    creatorName : docsModel.getCreatorName(),
                    creatorPosition : docsModel.getCreatorPosition(),
                    completeDate : docsModel.getCompleteDate()
                }));
            });
        },

        moveDocs: function(e) {
            var docsId = $(e.currentTarget).attr("data-id");
            if(docsId && docsId != this.docsId){
                GO.router.navigate("docs/detail/" + docsId, true);
            }
        }
    });

    return DocsVersionView;
});
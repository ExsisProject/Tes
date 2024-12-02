define([
        "backbone"
    ],

    function(
        Backbone
    ) {
        var WebSharedFolderList = Backbone.Collection.extend({
            model : Backbone.Model,
            url: function() {
                return "/api/webfolder/folder/tree?type=share";
            }
        });

        return {
            getCollection: function() {
                var webSharedFolderList = new WebSharedFolderList();
                webSharedFolderList.fetch({ async : false });
                return webSharedFolderList;
            }
        };
    });
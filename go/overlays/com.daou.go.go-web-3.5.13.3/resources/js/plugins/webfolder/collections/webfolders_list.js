define([
        "backbone"
    ],

    function(
        Backbone
    ) {
        var WebFolderList = Backbone.Collection.extend({
            model : Backbone.Model,

            initialize : function(options) {
                this.options = options || {};
            },

            url: function() {
                return "/api/webfolder/folder/list";
            }
        });
        return WebFolderList;
       }
   );
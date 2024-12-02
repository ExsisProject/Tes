define([
        "backbone",
        "app",
        "hrcard/models/hrInfo"
    ],
    function (Backbone,
              GO,
              MyInfo) {
        var instance = null;
        var InfoCollection = Backbone.Collection.extend({
            model: MyInfo,

            initialize : function(options) {
                this.options = options || {};
                this.userid = this.options.userid;
            },

            url : function() {
                return [GO.contextRoot + "api/hrcard/info", this.userid].join('/');
            },

            isEmpty : function() {
                return this.length == 0 ? true : false;
            }
        });

       return InfoCollection;
    });
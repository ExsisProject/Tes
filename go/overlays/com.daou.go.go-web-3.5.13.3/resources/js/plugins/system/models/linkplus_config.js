define('system/models/linkplus_config', function(require) {
    var Backbone = require('backbone');
    var GO = require('app');

    var LinkplusConfig = Backbone.Model.extend({

        initialize : function (isAdmin) {
            this.isAdmin = isAdmin;
        },

        url : function() {
            if (this.isAdmin) return GO.contextRoot + "ad/api/store/service/config";
            return GO.contextRoot + "api/store/service/config";
        },

        getServerHost: function () {
            return this.get('serverHost');
        },

        getClientHost: function () {
            return this.get('clientHost');
        },
    },
    {
        get : function(isAdmin){
            var instance = new LinkplusConfig(isAdmin);
            instance.fetch({async:false});
            return instance;
        }
    });

    return LinkplusConfig;
})
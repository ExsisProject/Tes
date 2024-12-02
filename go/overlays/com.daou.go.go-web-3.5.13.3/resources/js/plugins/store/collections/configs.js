define('store/collections/configs', function(require) {

    var Backbone = require('backbone');
    var Config = require('store/models/config');
    var GO = require('app');

    var Configs = Backbone.Collection.extend({

        model : Config,

        initialize : function (isAdmin) {
            this.isAdmin = isAdmin;
        },

        url : function () {
            if (this.isAdmin) {
                return GO.contextRoot + 'ad/api/store/configs';
            }
            return GO.contextRoot + 'api/store/configs';
        },

        getConfigByName : function(configName) {
            return this.findWhere({configName : configName})? this.findWhere({configName : configName}).attributes : null ;
        }

    });

    return Configs;
})
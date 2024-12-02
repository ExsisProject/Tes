define('store/models/config', function(require) {

    var Backbone = require('backbone');
    var GO = require('app');
    
    var Config = Backbone.Model.extend({
        
        initialize : function (isAdmin) {
            this.isAdmin = isAdmin;
        },

        url : function() {
            if (this.isAdmin) {
               return GO.contextRoot + 'ad/api/store/config';
            }
            return GO.contextRoot + 'api/store/config';
        }

    });   
    
    return Config;
})
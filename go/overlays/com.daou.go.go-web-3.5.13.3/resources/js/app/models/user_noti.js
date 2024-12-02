define([
    "backbone"
],
function(Backbone) {
    var Config = Backbone.Model.extend({
        urlRoot: GO.contextRoot + "api/user/notisetting"
    }, {
        get: function() {
            config = new Config();
            config.fetch({async:false});
            return config;
        }
    }); 
    
    return {
        read : function(){
            return config = Config.get();
        }
    };
});

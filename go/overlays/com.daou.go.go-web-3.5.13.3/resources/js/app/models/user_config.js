define([
    "backbone"
],
function(Backbone) {
    var Config = Backbone.Model.extend({
        urlRoot: GO.contextRoot + "api/user/config"
    }, {
        get: function(id) {
            config = new Config();
            config.set("id", id, {silent:true});
            config.fetch({async:false});
            return config;
        }
    }); 
    
    return {
        read : function(id){
            return config = Config.get(id);
        }
    };
});

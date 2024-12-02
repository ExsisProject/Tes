define([
    "backbone"
],
function(Backbone) {
    var TimeZone = Backbone.Model.extend({
        urlRoot: GO.contextRoot + "ad/api/timezones"
    }, {
        get: function() {
            config = new TimeZone();
            config.fetch({async:false});
            return config;
        }
    }); 
    
    return {
        read : function(){
            return timeZone = TimeZone.get();
        }
    };
});

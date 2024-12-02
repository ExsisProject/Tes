;(function() {
    define([
        "underscore", 
        "backbone", 
        "app"
    ], 
    function(
        _, 
        Backbone, 
        GO
    ) {
        var userListCollection = GO.BaseCollection.extend({
            url: function() {
                var url = GO.config("contextRoot") + "api/user/search";
                return url;
            }
        });
        return userListCollection;
    });
}).call(this);
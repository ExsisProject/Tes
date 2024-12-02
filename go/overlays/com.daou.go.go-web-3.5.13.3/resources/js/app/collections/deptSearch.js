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
        var DeptListCollection = GO.BaseCollection.extend({
            url: function() {
                var url = GO.config("contextRoot") + "api/departments/simple";
                return url;
            }
        });
        return DeptListCollection;
    });
}).call(this);
(function() {
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
        var DailyEventCollection = GO.BaseCollection.extend({
            conditions: {
                'year': 0, 'month': 0
            },
            url: function() {
                var url = GO.config("contextRoot") + "api/calendar/user/me/event/daily?";
                return url + $.param(conditions);
            }
        });
        return DailyEventCollection;
    });
}).call(this);
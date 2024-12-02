(function() {
    define([
        "backbone",
        "app"
    ],

    function(
        Backbone,
        GO
    ) {
        var CalendarFollower = GO.BaseModel.extend({
            url: function() {
                return "/api/calendar/follower/" + this.options.followId;
            },

            initialize: function(options) {
                this.options = options;
            }
        });

        return CalendarFollower;
    });
}).call(this);
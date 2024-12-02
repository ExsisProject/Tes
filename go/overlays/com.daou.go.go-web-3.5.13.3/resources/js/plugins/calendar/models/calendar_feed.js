(function() {
    define(["backbone", "app"], function(Backbone, GO) {
        var CalendarFeed = Backbone.Model.extend({
            urlRoot: "/api/calendar/feed", 
            
            isAccessible: function() {
                return !!(this.isFollowing() || !this.isPrivate());
            }, 
            
            getCalendarId: function() {
                return this.get("calendar").id;
            },
            
            isFollowing: function() {
                return this.get('state') === 'following';
            }, 
            
            isPrivate: function() {
                return this.get('calendar').visibility === 'private';
            }
        });

        return CalendarFeed;
    });
}).call(this);
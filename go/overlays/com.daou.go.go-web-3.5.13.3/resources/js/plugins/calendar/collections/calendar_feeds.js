(function() {
    define([
        "app", 
        "calendar/models/calendar_feed"
    ], 

    function(
        GO, 
        CalendarFeed
    ) {
        var CalendarFeeds = GO.BaseCollection.extend({
            model: CalendarFeed, 

            url: function() {
                return '/api/calendar/feed?sort=sequence asc';
            }, 

            userId: -1, 
            
            initialize: function() {
                this.userId = -1;
            }, 

            comparator: function(feed) {
                return feed.sequence;
            }, 

            /**
            조회할 구독 캘린더 목록의 소유자 설정

            @method setUserId
            @param {Integer} newId 사용자 고유 ID
            @chainable
            */ 
            setUserId: function(newId) {
                this.userId = newId;
                return this;
            }, 

            /**
            조회할 구독 캘린더 목록의 소유자 고유 ID

            @method setUserId
            @return {Integer} 사용자 고유 ID
            */ 
            getUserId: function() {
                return this.userId;
            }, 
            
            /**
            구독중인 캘린더인지 여부 반환

            @method isFollowing
            @param {Integer} calendarId 캘린더 고유 ID
            @return {boolean} 구독중인 캘린더인지 여부
            */ 
            isFollowing: function(calendarId) {
                var matched = this.filter(function(model) {
                    return !!(model.get('state') === 'following' && model.get('calendar').id === calendarId);
                });
                return matched.length > 0;
            }, 
            
            /**
            구독 신청중인 캘린더인지 여부 반환

            @method isSubscribed
            @param {Integer} calendarId 캘린더 고유 ID
            @return {boolean} 구독중인 캘린더인지 여부
            */ 
            isWaiting: function(calendarId) {
                var matched = this.filter(function(model) {
                    return !!(model.get('state') === 'waiting' && model.get('calendar').id === calendarId);
                });
                return matched.length > 0;
            }, 
            
            /**
            주어진 캘린더 ID가 접근가능한 캘린더인지 여부 반환

            @method isSubscribed
            @param {Integer} calendarId 캘린더 고유 ID
            @return {boolean} 구독중인 캘린더인지 여부
            */ 
            isAccessible: function(calendarId) {
                var matched = this.filter(function(model) {
                    return model.isAccessible(calendarId);
                });
                return matched.length > 0;
            }, 
            
            /**
            캘린더 ID로 Feed 모델 반환

            @method findByCalendarId
            @param {Integer} calendarId 캘린더 고유 ID
            @return {Backbone.Model} Feed 모델
            */
            findByCalendarId: function(calendarId) {
                return this.filter(function(model) {
                    return model.get("calendar").id === parseInt( calendarId );
                }); 
            }
        }, {
            __instance__: null, 

            /**
            조회할 사용자 ID 설정

            @method setUserId
            @static
            @chainable
            */ 
            setUserId: function(userid) {
                var instance = this.getInstance();
                instance.setUserId(userid);
                return this;
            }
        });

        return CalendarFeeds;
    });
}).call(this);
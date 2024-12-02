(function() {
    define([
        "jquery",
        "backbone",
        "app"
    ], 
    function(
        $,
        Backbone,
        App
    ) {

        /**
        *
        * 참조, 수신자 관련 모델입니다. 
        *
        */
        var SubscriberGroupModel = Backbone.Model.extend({
            
            url : function() {
                var url = GO.contextRoot + 'api/approval/usersetting/subscribergroup';
                if (!this.isNew()) {
                    url += '/' + this.get('id');
                }
                return url;
            },

            defaults: {
                title: ''
            }
        });

        return SubscriberGroupModel;
    });
}).call(this);
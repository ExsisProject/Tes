(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "approval/models/subscriber_group"
    ], 
    function(
        $,
        Backbone,
        App,
        ApprGroupModel
    ) {
        
        /**
        * 나의 결재선 목록 컬렉션
         * Circle 에 종속되다보니
         * user 의 경우 actions 가 공백으로
         * department 의 경우 json 형태로 내려옴
        */
        var ApprLineCollection = Backbone.Collection.extend({
            model: ApprGroupModel,
            url: function() {
                return GO.contextRoot + 'api/approval/usersetting/subscribergroup';
            }
        });
        
        return ApprLineCollection;
        
    });
}).call(this);

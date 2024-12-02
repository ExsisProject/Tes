(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "approval/models/appr_line"
    ], 
    function(
        $,
        Backbone,
        App,
        ApprLineModel
    ) {
        
        /**
        * 나의 결재선 목록 컬렉션
        */
        var ApprLineCollection = Backbone.Collection.extend({
            model: ApprLineModel,
            url: function() {
                return GO.contextRoot + 'api/approval/usersetting/apprline';
            }
        });
        
        return ApprLineCollection;
        
    });
}).call(this);
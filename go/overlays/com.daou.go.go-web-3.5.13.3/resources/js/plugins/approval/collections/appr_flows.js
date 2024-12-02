(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "approval/models/appr_flow"
    ], 
    function(
        $,
        Backbone,
        App,
        ApprFlowModel
    ) {

        /**
        *
        * 결재흐름 컬렉션. 사용자 화면에서 자동결재 entitiy관련.
        *
        */
        var ApprFlowCollection = Backbone.Collection.extend({
            model: ApprFlowModel
        });

        return ApprFlowCollection;
        
    });
}).call(this);
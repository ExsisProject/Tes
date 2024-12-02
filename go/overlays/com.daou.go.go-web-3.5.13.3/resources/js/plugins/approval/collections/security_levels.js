(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "approval/models/security_level"
    ],
    function(
        $,
        Backbone,
        App,
        SecurityLevelModel
    ) {

        /**
        *
        * 보안 등급 컬렉션
        *
        */
        var SecurityLevelCollection = Backbone.Collection.extend({
            url: GO.contextRoot + 'ad/api/approval/securitylevel',
            model: SecurityLevelModel
        });

        return SecurityLevelCollection;
        
    });
}).call(this);
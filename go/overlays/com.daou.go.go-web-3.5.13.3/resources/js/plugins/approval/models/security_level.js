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
        * 보안 등급 모델 (결재 양식, 시행문 등에서 사용함) 
        *
        */
        var SecurityLevelModel = Backbone.Model.extend({

            defaults: {
                level: 0,
                name: '',
                useFlag: false
            },
            
            initialize: function() {
                this.set('useFlag', ((this.get('useFlag') == 'true') || (this.get('useFlag') == true)));
            },
        });

        return SecurityLevelModel;
    });
}).call(this);
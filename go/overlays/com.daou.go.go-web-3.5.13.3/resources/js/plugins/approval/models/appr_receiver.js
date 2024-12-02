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

    	var ApprReceiverModel = Backbone.Model.extend({
    		idAttribute : 'email'
    	});

        return ApprReceiverModel;
    });
}).call(this);


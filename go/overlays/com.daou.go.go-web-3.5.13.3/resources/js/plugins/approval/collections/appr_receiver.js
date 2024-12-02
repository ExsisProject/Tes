(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "approval/models/appr_receiver"
    ], 
    function(
        $,
        Backbone,
        App,
        ApprReceiverModel
    ) {

    	var ApprReceiverCollection = Backbone.Collection.extend({
    		model : ApprReceiverModel
    	});

        return ApprReceiverCollection;
    });
}).call(this);


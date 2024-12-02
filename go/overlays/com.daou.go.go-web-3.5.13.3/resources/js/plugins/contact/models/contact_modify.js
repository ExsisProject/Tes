define([
        "backbone"
    ],

    function(Backbone) {
    	var ContactModify = Backbone.Model.extend({
    		url: function() {
    			return "/api/contact/personal/contact/"+this.get("id");
    		},
    	});
    	return ContactModify;
    });
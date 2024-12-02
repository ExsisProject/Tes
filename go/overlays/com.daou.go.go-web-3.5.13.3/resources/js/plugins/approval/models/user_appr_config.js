define([
    "backbone"
],

function(Backbone) {
	var UserApprConfigModel = Backbone.Model.extend({
	    url : "/api/approval/usersetting/userconfig",
        getDefaultPhoto : function(){
        	return 'resources/images/stamp_approved.png';
        }
	});
	
	return UserApprConfigModel;
});
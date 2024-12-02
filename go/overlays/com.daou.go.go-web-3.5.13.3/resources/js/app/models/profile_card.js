(function() {
	define([
        "backbone"
    ],
    function(Backbone) {
    	var instance = null;
    	var ProfileCard = Backbone.Model.extend({
    		url: function() {
    			return '/api/user/profile/'+ this.get('userId');
    		},
			hasDepartment : function(){
				return this.getDeptMembers().length > 0;
			},
			getDeptMembers : function(){
				return this.get("deptMembers");
			}
    	}, {
    		get: function(userId) {
    			instance = new ProfileCard();
    			instance.set("userId", userId, {silent: true});
    			instance.fetch({ async : false, reset : true });
    			return instance;
    		}
    	}); 
    	
    	return ProfileCard;
    });
}).call(this);
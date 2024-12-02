define([
    "backbone"
],
function(Backbone) {
    var Profile = Backbone.Model.extend({
        urlRoot: GO.contextRoot + "api/user/profile"
    }, {
        get: function(id) {
            var profile = new Profile();
            profile.set("id", id, {silent:true});
            profile.fetch({async:false});
            return profile;
        }
    }); 
    
    return {
        read : function(id){
            return Profile.get(id);
        }
    };
});

define([
    "backbone"
],

function(Backbone) {


	var GroupAdd = Backbone.Model.extend({
        initialize : function(type){
            this.type = type;
        },
		url: function() {
            var returnUrl = [];
            returnUrl.push("/api/contact");
            if(this.type == "DEPARTMENT"){
                returnUrl.push("dept/group");
            }else{ // USER
                returnUrl.push("personal/group");
            }

            returnUrl.push(this.get("id"));
            return returnUrl.join("/");
		},
	});
	return GroupAdd;
});
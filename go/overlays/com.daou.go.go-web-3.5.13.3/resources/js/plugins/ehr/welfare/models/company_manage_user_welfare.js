define([
    "backbone"
    ],

    function(
		Backbone
		) {
        var CompanyManageUserWelfare = Backbone.Model.extend({
            urlRoot: function(){
                return GO.contextRoot + "api/ehr/welfare";
            }
        }, {
        });

        return CompanyManageUserWelfare;
    }
);

define([
    "backbone"
    ],

    function(
		Backbone
		) {
        var CompanyManageUserVacation = Backbone.Model.extend({
            urlRoot: function(){
                return GO.contextRoot + "api/ehr/vacation";
            }
        }, {
        });

        return CompanyManageUserVacation;
    }
);

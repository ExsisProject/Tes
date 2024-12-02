define([
    "backbone"
    ],

    function(
		Backbone
		) {
        var CompanyManageConfig = Backbone.Model.extend({
            urlRoot: GO.contextRoot + "api/ehr/vacation/company/config",
            update : function(params){
                this.set("deptManageOpen" , params.isDeptOpen);
                this.set("useNextVacation", params.useNextVacation);
            }
        }, {
        });

        return CompanyManageConfig;
    }
);

define([
    "backbone"
    ],

    function(
		Backbone
		) {
        var UserWelfare = Backbone.Model.extend({
            url: function(){
                return GO.contextRoot + "api/ehr/welfare?" + this.getParams();
            },
            setYear : function(year){
                this.year = year;
            },
            getParams : function(){
                var param = {};
                param["year"] = this.year;
                return $.param(param);
            }
        }, {
        });

        return UserWelfare;
    }
);

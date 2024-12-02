define("timeline/models/user_month", function(require){
    var Backbone = require("backbone");
    var WeekModel = require("timeline/models/weekly_stat");

    var UserMonthModel = Backbone.Model.extend({
        url : GO.contextRoot + "api/ehr/timeline/month",

        initialize : function() {
            this.weeks = [];
        },

        parse : function(data){
            this.weeks = [];
            this.user = data.user;
            _.each(data["weekList"], function(week){
                this.weeks.push(new WeekModel(week));
            }, this);
            this.attributes = data;
        }
    });

    return UserMonthModel;
});
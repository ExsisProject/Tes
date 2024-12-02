
define("timeline/collections/daily_stats", function (require) {

    var Backbone = require("backbone");
    var DailyStat= require("timeline/models/daily_stat");

    var DailyStats = Backbone.Collection.extend({

        model : DailyStat,

        initialize : function(){
        },
    });
    return DailyStats;
});
define("timeline/collections/month_stats", function (require) {

    var WeeklyStat = require("timeline/models/month_stat");
    var PaginatedCollection = require("collections/paginated_collection");

    var WeeklyStats = PaginatedCollection.extend({
        model: WeeklyStat,

        initialize: function () {
            PaginatedCollection.prototype.initialize.apply(this, arguments);
        },
        getDeptId: function () {
            return null;
        },
    });
    return WeeklyStats;
});
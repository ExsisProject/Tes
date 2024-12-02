define('timeline/collections/timeline_histories', function (require) {
    var _ = require("underscore");
    var Backbone = require("backbone");
    var TimelineHistory= require("timeline/models/history");

    var Collection = Backbone.Collection.extend({

        model: TimelineHistory,

        initialize: function () {
        },

    });

    return Collection;
});

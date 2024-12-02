define("admin/models/ehr/timeline/access_gps", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");

    var TimelineAccessGps = Backbone.Model.extend({
        urlRoot : GO.contextRoot + "ad/api/timeline/gps/"
    });

    return TimelineAccessGps;
});
define("admin/models/ehr/timeline/access_beacon", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");

    var TimelineAccessBeacon = Backbone.Model.extend({
        urlRoot: GO.contextRoot + "ad/api/timeline/beacon"
    });

    return TimelineAccessBeacon;
});
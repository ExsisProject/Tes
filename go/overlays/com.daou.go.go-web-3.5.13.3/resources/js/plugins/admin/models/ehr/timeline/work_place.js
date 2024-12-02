define("admin/models/ehr/timeline/work_place", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");

    var TimelineWorkPlace = Backbone.Model.extend({
        urlRoot: GO.contextRoot + "ad/api/timeline/workplace",

        getCreatedAt: function() {
            return GO.util.shortDate(this.attributes.createdAt);
        }
    });

    return TimelineWorkPlace;
});
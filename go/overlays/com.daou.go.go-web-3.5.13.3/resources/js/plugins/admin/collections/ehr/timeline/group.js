define("admin/collections/ehr/timeline/group", function(require){

    var Backbone = require("backbone");
    var GroupModel = require("admin/models/ehr/timeline/group");

    var Groups = Backbone.Collection.extend({
        model: GroupModel,
        url: function() {
            return GO.contextRoot + "ad/api/timeline/groups";
        }
    });

    return Groups;
});
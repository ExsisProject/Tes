define("admin/collections/ehr/vacation/status_list", function(require){

    var Backbone = require("backbone");
    var Model = require("admin/models/ehr/vacation/status");

    return Backbone.Collection.extend({

        model: Model,

        url : function() {
            return GO.contextRoot + "ad/api/ehr/vacation/statuses/all";
        },

    });

});
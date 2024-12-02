define("admin/models/ehr/vacation/status", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");

    return Backbone.Model.extend({

        url : GO.contextRoot + "ad/api/ehr/vacation/status",

        fetch : function() {
            var options = {
                data : {
                    id : this.get('id')
                }
            };

            return Backbone.Model.prototype.fetch.call(this, options);
        }
    });

});
define("admin/models/ehr_basic_config_model", function(require) {
    var Backbone = require("backbone");
    var GO = require("app");

        var EhrBasicConfigModel = Backbone.Model.extend({
            urlRoot: function(){
                return GO.contextRoot + "ad/api/ehr/config/basic"
            },

            initialize : function(options) {
            }
        });


        return EhrBasicConfigModel;
    }
);

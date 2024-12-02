define("works/models/report_item", function(require) {
    var BaseModel = require('works/components/filter/models/base_type');

    return BaseModel.extend({
        initialize : function() {
            this.modelName = "report_item";
        },

        defaults : {
            rid : "",
        },
    });
});
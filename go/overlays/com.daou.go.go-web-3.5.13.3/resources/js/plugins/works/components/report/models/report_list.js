define("works/components/report/models/report_list", function(require) {
    var BaseModel = require('models/base_model');

    return BaseModel.extend({
        initialize : function(options) {
            BaseModel.prototype.initialize.call(this);
            this.modelName = "report_list";
            this.appletId = options.appletId;
        },

        url: function() {
            return GO.contextRoot + "api/works/applet/" + this.appletId + "/reports";
        },

        getFavorites: function () {
            return _.filter(this.values(), function (report) {
                return report.favorite;
            });
        },

        getAll: function () {
            return _.filter(this.values(), function (report) {
                return report.id;
            });
        },

        isEmpty: function () {
            return this.getAll().length == 0;
        }
    });
});
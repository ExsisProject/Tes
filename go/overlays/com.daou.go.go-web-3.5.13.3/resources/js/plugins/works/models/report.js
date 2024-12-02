define("works/models/report", function(require) {

    var BaseModel = require('models/base_model');

    return BaseModel.extend({
        initialize : function(options) {
            BaseModel.prototype.initialize.call(this, options);
            this.appletId = options.appletId;
            this.reportId = options.reportId;
        },

        url: function() {
            if (this.reportId) {
                return GO.contextRoot + 'api/works/applet/' + this.appletId + '/report/' + this.reportId;
            } else {
                return GO.contextRoot + 'api/works/applet/' + this.appletId + '/report/create';
            }
        },

        getTemplate: function() {
            var template = this.attributes.template;
            if (template) {
                return JSON.parse(template);
            }
            return {};
        },

        getReportItems: function() {
            return _.filter(this.attributes.reportItems, function (item) {
                var data = item.data;
                if (data) {
                    item.data = JSON.parse(data);
                    return true;
                }
                return false;
            });
        },

        //이건 임시..
        _clear: function() {
            this.attributes = {
                appletId: this.appletId,
                reportId: this.reportId
            }
        }
    });
});
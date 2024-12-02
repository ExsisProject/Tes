define('works/models/gantt_view', function (require) {
    var Backbone = require('backbone');

    return Backbone.Model.extend({
        initialize: function (options) {
            options = options || {};
            this.type = 'GET';
            this.appletId = options.appletId;
        },

        url: function () {
            var url = GO.contextRoot + 'api/works/applets/' + this.appletId + '/ganttview';
            return this.type == 'GET' ? url + '/settings' : url;
        },

        setType: function (type) {
            this.type = type;
        },

        hasRequiredFields: function () {
            return this.get('titleFieldCid') && this.get('startFieldCid') && this.get('endFieldCid');
        },

        hasStartEndField: function () {
            return this.get('startFieldCid') && this.get('endFieldCid');
        }
    });
});
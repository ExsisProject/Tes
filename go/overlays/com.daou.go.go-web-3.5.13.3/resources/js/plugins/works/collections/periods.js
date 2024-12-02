define('works/collections/periods', function (require) {
    var Backbone = require('backbone');
    var GO = require('app');

    return Backbone.Collection.extend({
        initialize: function (options) {
            this.options = options || {};
            this.appletId = options.appletId;
        },

        url: function () {
            return GO.contextRoot + 'api/works/applet/' + this.appletId + '/calendarview/periods';
        },

        getIds: function () {
            return _.map(this.models, function (period) {
                return period.id;
            });
        }
    });
});
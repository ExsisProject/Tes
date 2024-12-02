define('works/models/calendar_view', function (require) {

    return Backbone.Model.extend({

        initialize: function (options) {
            options = options || {};
            this.appletId = options.appletId;
        },

        url: function () {
            return GO.contextRoot + 'api/works/applet/' + this.appletId + '/calendarview';
        },

        getName: function () {
            return this.name;
        }
    });
});
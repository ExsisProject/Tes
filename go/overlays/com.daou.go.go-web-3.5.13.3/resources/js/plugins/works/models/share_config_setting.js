define('works/models/share_config_setting', function (require) {

    return Backbone.Model.extend({
    	
        defaults: {
            share: [],
            baseFilterConfig: []
        },

        initialize: function (options) {
            options = options || {};
            this.appletId = options.appletId;
        },

        url: function () {
            return GO.contextRoot + 'api/works/applets/' + this.appletId + '/settings/share';
        }
    });
});
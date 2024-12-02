define('works/models/applet_field_mapping', function(require) {
    return Backbone.Model.extend({
        initialize: function(options) {
            this.sourceAppletId = options.sourceAppletId;
            this.targetAppletId = options.targetAppletId;
        },

        url: function() {
            return GO.contextRoot + 'api/works/applets/' + this.sourceAppletId + '/mapping/' + this.targetAppletId;
        }
    });
});
define('works/models/doc_activity_count', function(require) {
    var Backbone = require('backbone');

    var DocActivityCountModel = Backbone.Model.extend({
        url: function() {
            return GO.contextRoot + 'api/works/applets/'+this.appletId+'/docs/'+this.docId+'/activity/count';
        },

        initialize: function (appletId, docId) {
            this.appletId = appletId;
            this.docId = docId;
        }
    });

    return DocActivityCountModel;
});
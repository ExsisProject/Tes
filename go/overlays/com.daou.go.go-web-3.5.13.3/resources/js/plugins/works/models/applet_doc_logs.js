define('works/models/applet_doc_logs', function (require) {
    // dependency
    var Backbone = require('backbone');
    var GO = require('app');

    var DocLog = Backbone.Model.extend({
        initialize: function () {
        },

        contentParser: function () {
            var splits = this.get("message").split("\n");
            splits = _.map(splits, function (m) {
                return GO.util.escapeHtml(m);
            })
            return splits;
        }
    });

    var DocLogs = Backbone.Collection.extend({
        model: DocLog,
        initialize: function (options) {
            this.options = options || {};
            this.appletId = options.appletId;
            this.docId = options.docId;
            this.mainForm = options.mainForm;
        },

        url: function () {
            return GO.contextRoot + "api/works/applets/" + this.appletId + "/docs/" + this.docId + "/logs?" + $.param(this.options);
        },

        options: {
            page: 0,
            size: 10
        },

        setPage: function (page) {
            this.options.page = page;
        }
    });

    return DocLogs;
});

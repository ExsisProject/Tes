define('works/home/models/applet_folder', function (require) {

    return Backbone.Model.extend({

        initialize: function () {
        },

        urlRoot: function () {
            return GO.contextRoot + 'api/works/folders';
        },

        validate: function() {
            var name = this.get('name');
            if (name.length < 2 || name.length > 20) {
                return 'folder.name.length';
            }
        }
    });
});
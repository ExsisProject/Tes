define('works/models/applet_accessible', function (require) {
    // dependency
    var Backbone = require('backbone');
    var GO = require('app');

    var AppletCount = Backbone.Model.extend({

        url: function () {
            return GO.config('contextRoot') + 'api/works/applets/hasaccessible';
        }
    });


    return AppletCount;
});

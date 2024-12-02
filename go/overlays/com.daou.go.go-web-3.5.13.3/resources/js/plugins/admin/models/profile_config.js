/**
 * Created by JeremyJeon on 15. 11. 17..
 */
define('admin/models/profile_config', function(require) {
    // dependency
    var Backbone = require('backbone');
    var GO = require('app');

    var ProfileExposureModel = Backbone.Model.extend({
        url: function() {
            return GO.config('contextRoot') + 'ad/api/profile/config';
        }
    });

    return ProfileExposureModel;
});

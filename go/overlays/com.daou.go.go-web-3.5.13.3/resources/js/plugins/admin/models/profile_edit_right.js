/**
 * Created by JeremyJeon on 15. 11. 17..
 */
define('admin/models/profile_edit_right', function(require) {
    // dependency
    var Backbone = require('backbone');
    var GO = require('app');

    var UserProfileEditModel = Backbone.Model.extend({
        url: function() {
            return GO.config('contextRoot') + 'ad/api/company/profile/editright';
        }
    });

    return UserProfileEditModel;
});

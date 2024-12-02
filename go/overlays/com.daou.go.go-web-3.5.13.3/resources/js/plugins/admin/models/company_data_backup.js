/**
 * Created by JeremyJeon on 15. 11. 17..
 */
define('admin/models/company_data_backup', function (require) {
    // dependency
    var Backbone = require('backbone');
    var GO = require('app');

    var CompanyDataBackupModel = Backbone.Model.extend({
        url: function () {
            return GO.config('contextRoot') + 'ad/api/company/databackup/config';
        }
    });

    return CompanyDataBackupModel;
});

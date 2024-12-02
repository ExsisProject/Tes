define('works/personal_list_manager/collections/personal_list_settings', function (require) {

    var ListSetting = require('works/components/list_manager/models/list_setting');
    var BaseCollection = require('collections/base_collection');

    return BaseCollection.extend({

        model: ListSetting,

        initialize: function (models, options) {
            BaseCollection.prototype.initialize.apply(this, arguments);
            this.appletId = options.appletId;
        },

        url: function () {
            return GO.contextRoot + 'api/works/applets/' + this.appletId + '/listview/my';
        }
    });
});
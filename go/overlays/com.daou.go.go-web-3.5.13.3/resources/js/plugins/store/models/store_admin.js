define('store/models/store_admin', function (require) {
    var Backbone = require('backbone');
    var GO = require('app');

    var StoreAdmin = Backbone.Model.extend({
            url: function () {
                return GO.config('contextRoot') + 'api/store/checkadmin';
            },

            isAdmin: function () {
                return this.get('true') != null || this.get('true') !== undefined;
            }
        },
        {
            getInstance: function () {
                var instance = new StoreAdmin();
                instance.fetch({
                    async: false
                });

                return instance;
            }
        }
    );


    return StoreAdmin;
});
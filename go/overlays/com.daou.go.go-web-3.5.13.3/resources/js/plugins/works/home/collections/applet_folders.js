define('works/home/collections/applet_folders', function (require) {

    var AppletFolder = require('works/home/models/applet_folder');

    return Backbone.Collection.extend({

        model: AppletFolder,

        initialize: function (models, options) {
            options = options || {};
            this.orderBy = options.orderBy || 'name';
        },

        url: function () {
            var param = this._makeParam();
            return GO.contextRoot + 'api/works/folders' + (param ? '?' + param : '');
        },

        /** 목록이 없는 경우. 테스트용 */
        //parse: function(resp) {
        //    resp.data = [];
        //    return resp.data;
        //},

        setOrder: function(order) {
            this.orderBy = order;
        },

        sortByName: function() {
            this.comparator = 'name';
            this.sort();
            this.comparator = null;
        },

        _makeParam: function() {
            return $.param({
                orderBy: this.orderBy
            });
        }
    });
});
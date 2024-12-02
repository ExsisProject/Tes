define('system/models/site_control_option', function (require) {
    var Backbone = require('backbone');

    var Model = Backbone.Model.extend({
        url: function () {
            return "/ad/api/system/sitecontroloption";
        },

        isSiteControlOn: function () {
            return this.get('data'); // SaaS는 true 일 수 없음.
        }
    }, {
        get: function () {
            var instance = new Model();
            instance.fetch({async: false});
            return instance;
        }
    });

    return {
        read: function () {
            return Model.get();
        },
        init: function () {
            return new Model();
        }
    };

});
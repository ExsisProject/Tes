define([
        "backbone"
    ],

    function (Backbone) {

        var instance = null;
        var EcdConfig = Backbone.Model.extend({
            url: function () {
                return "/ad/api/ecdconfig";
            },
        }, {
            get: function () {
                if (instance == null) instance = new EcdConfig();
                instance.set({silent: true});
                instance.fetch({async: false});
                return instance;
            }
        });

        return {
            read: function () {
                return ecdConfig = EcdConfig.get();
            }
        };
    });
define(function (require) {
    var Backbone = require('backbone');

    var VacationStatusCollection = Backbone.Collection.extend({

        url: function () {
            return GO.contextRoot + "api/ehr/vacation/statuses/enable";
        }

    });

    return VacationStatusCollection;
})

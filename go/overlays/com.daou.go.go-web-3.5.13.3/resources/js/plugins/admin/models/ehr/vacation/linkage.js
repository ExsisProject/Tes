define("admin/models/ehr/vacation/linkage", function (require) {
    var Backbone = require("backbone");

    return Backbone.Model.extend({

        urlRoot : GO.contextRoot + 'ad/api/ehr/vacation/linkage/config',

        changeCalendarLinkageOn : function() {
            this.attributes.calendarLinkageOn = !this.attributes.calendarLinkageOn;
        },

        changeMessengerLinkageOn : function() {
            this.attributes.messengerLinkageOn = !this.attributes.messengerLinkageOn;
        },
    });

});
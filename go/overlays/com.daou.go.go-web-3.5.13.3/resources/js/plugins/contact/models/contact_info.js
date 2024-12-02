define([
        "backbone",
        "app"
    ],

    function (Backbone, GO) {

        var ContactInfo = Backbone.Model.extend({
            url: function () {
                return "/api/contact/personal/contact/" + this.contactId;
            },

            setContactId: function (opt) {
                this.contactId = opt.contactId;
            }

        });

        return {
            read: function (opt) {
                var contactInfo = new ContactInfo();
                contactInfo.setContactId(opt);
                contactInfo.fetch({
                    async: false,
                    error: function (model, error) {
                        if (GO.util.isMobile()) {
                            GO.util.linkToErrorPage(error);
                        } else {
                            var _error = JSON.parse(error.responseText);
                            $.goMessage(result.message);
                            GO.util.error(_error.code, _error.code === "500" ? {} : {"msgCode": "400-contact"})
                        }
                    }
                });
                return contactInfo;
            }
        };
    });

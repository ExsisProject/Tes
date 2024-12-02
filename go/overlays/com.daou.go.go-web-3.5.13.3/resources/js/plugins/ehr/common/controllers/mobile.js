define("ehr/common/controllers/mobile", function (require) {
    var Side               = require("ehr/common/models/side");
    var TimelineController    = require("timeline/controllers/mobile");

    var EhrController = (function () {
        var Controller = function () {

        };

        Controller.prototype = {
            render: function (userid) {
                var sideValue = new Side();
                sideValue.fetch({
                    async: false,
                    statusCode: {
                        400: function () {
                            GO.util.error('404', {"msgCode": "400-common"});
                        },
                        403: function () {
                            GO.util.error('403', {"msgCode": "400-common"});
                        },
                        404: function () {
                            GO.util.error('404', {"msgCode": "400-common"});
                        },
                        500: function () {
                            GO.util.error('500');
                        }
                    },
                    success: function (model, resp) {
                        if (sideValue.isTimelineActive()) {
                            TimelineController.renderUser();
                        }
                    }
                });
            }
        };

        return Controller;
    })();

    return new EhrController();
});
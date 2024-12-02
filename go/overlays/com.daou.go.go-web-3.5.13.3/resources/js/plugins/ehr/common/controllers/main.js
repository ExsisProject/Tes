define("ehr/common/controllers/main", function (require) {
    var Side               = require("ehr/common/models/side");
    var TimelineController    = require("timeline/controllers/main");
    var HrCardController   = require("hrcard/controllers/main");
    var VacationController = require("vacation/controllers/main");
    var WelfareController  = require("welfare/controllers/main");

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
                        } else if (sideValue.isVacationActive()) {
                            VacationController.renderMyVacation();
                        } else if (sideValue.isWelfareActive()) {
                            WelfareController.renderMyWelfare();
                        } else if (sideValue.isHrcardActive()) {
                            HrCardController.detailRender(userid);
                        }

                        /* TODO : side 초기값 설정 수정 필요.

                        else if (sideValue.useTimelineDeptSituationAndStats() && sideValue.getDepts().length) {
                            AttndController.deptList(model.get("depts")[0].id);
                        } else if (sideValue.get('timelineSide').manager) {
                            AttndController.companyList();
                        }*/
                    }
                });
            }
        };

        return Controller;
    })();

    return new EhrController();
});
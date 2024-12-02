define("timeline/models/integration_appr_link", function (require) {
    var Backbone = require("backbone");

    var IntegrationApprLinkModel = Backbone.Model.extend({

        initialize: function (param) {
            this.userId = param.userId;
        },

        url: function () {
            return GO.contextRoot + "api/ehr/timeline/integration/appr/link?" + $.param({'userId': this.userId});
        },

        getDeptId: function () {
            return this.get("deptId");
        },

        getFormId: function () {
            return this.get("formId");
        },

        getWriteMode: function () {
            return this.get("writeMode");
        },

        canApplyOvertimeAppr: function () {
            if (this.getDeptId() != undefined && this.getFormId() != undefined) {
                return true;
            } else {
                return false;
            }
        }

    });

    return IntegrationApprLinkModel;
});

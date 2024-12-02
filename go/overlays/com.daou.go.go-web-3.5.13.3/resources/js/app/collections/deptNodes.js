;define(function (require) {
    var App = require("app");
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    return GO.BaseCollection.extend({
        initialize: function (options) {
            this.options = options || {};
            this.type = options.type;
            this.deptid = options.deptid || {};
        },
        url: function () {
            var baseUrl = GO.contextRoot + 'api/organization/multi/list';
            var url;
            if (this.type === "docReferenceReaders") {
                url = _.isEmpty(this.deptid) ? baseUrl + '?type=mydept&useApprReference=true' : baseUrl + '?deptid=' + this.deptid + '&type=child&useApprReference=true';

            } else if (this.type === "docReceptionReaders") {
                url = _.isEmpty(this.deptid) ? baseUrl + '?type=mydept&useApprReception=true' : baseUrl + '?deptid=' + this.deptid + '&type=child&useApprReception=true';

            } else if ((this.type === "mydept" || this.type === "docReadingReaders") && _.isEmpty(this.deptid)) {
                url = baseUrl + '?type=mydept';

            } else if ((this.type === "mydept" || this.type === "docReadingReaders") && !_.isEmpty(this.deptid)) {
                url = baseUrl + '?deptid=' + this.deptid + '&type=child';

            } else if ((this.type === "custom")) {
                url = baseUrl + '?deptid=' + this.deptid + '&type=custom&scope=subdept';
            } else {
                url = baseUrl + '?type=mydept';
            }
            return url
        }
    });
});
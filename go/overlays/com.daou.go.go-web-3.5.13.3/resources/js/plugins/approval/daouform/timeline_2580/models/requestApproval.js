define(function(require) {

    var $ = require('jquery');
    var Backbone = require('backbone');

    // getHistories & total time 계산 API 연동 부분
    var RequestApprovalModel = Backbone.Model.extend({
        getTimeStr: function () {
            return moment(this.startTime).format('HH:mm') + " ~ " + moment(this.endTime).format('HH:mm');
        }
    });

    return RequestApprovalModel;
})

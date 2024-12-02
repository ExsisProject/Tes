define(function(require) {

    var $ = require('jquery');
    var Backbone = require('backbone');

    // getHistories & total time 계산 API 연동 부분
    var TimelineApprovalModel= Backbone.Model.extend({
        url : GO.contextRoot + "api/timeline/approval/validate",
    });

    return TimelineApprovalModel;
})

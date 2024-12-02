define(function(require) {
	var Backbone = require('backbone');

	// 사용 일수 계산 API 연동 부분
	var NonHolidayCountModel = Backbone.Model.extend({
		url : GO.contextRoot + "api/ehr/timeline/nonholiday/count"
	});

	return NonHolidayCountModel;
})

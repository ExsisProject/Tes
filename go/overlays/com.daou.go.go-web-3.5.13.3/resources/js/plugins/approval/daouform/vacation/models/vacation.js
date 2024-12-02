define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');

	// 사용 일수 계산 API 연동 부분
	var VacationModel = Backbone.Model.extend({
		url : GO.contextRoot + "api/ehr/vacation/count",
	});

	return VacationModel;
})

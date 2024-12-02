define([
	"backbone"
],

function(
	Backbone
) {
	var instance = null;
	var AttndGroup = Backbone.Model.extend({
		urlRoot : GO.contextRoot + "ad/api/ehr/attnd/group",
	}, {
		get: function() {
			if(instance == null) instance = new AttndGroup();
            instance.fetch({async:false});
			instance.set({
				"accessSetting": "WHITE",
					"accessTarget": {nodes: []},
					"clockInTime": "07:10:00",
					"clockOutTime": "19:10:00",
					"createdAt": "2015-06-02T18:51:56.772+09:00",
					"description": "설명",
					"endDate": "2015-06-02",
					"exceptionTarget": {nodes: []},
					"id": 10,
					"name": "이름임다",
					"sortOrder": 3,
					"startDate": "2015-06-02",
					"updatedAt": "2015-06-02T18:51:56.772+09:00",
					"useFlexibleTime": true,
					"usePeriodSetting": false
            });
            return instance;
        }
	});
	
	return AttndGroup;
});

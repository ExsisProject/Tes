define([
	"backbone",
	"admin/models/attnd_status"
],

function(
	Backbone,
	Status
) {
	var instance = null;
	var AttndDefaultModel = Backbone.Model.extend({
		model : Status,
		urlRoot : GO.contextRoot + "ad/api/ehr/attnd/config/basic",
	}, {
		get: function() {
			if(instance == null) instance = new AttndDefaultModel();
            instance.fetch({async:false});
//			instance.set({
//				"workDay": "{\"Mon\":true, \"Tue\":true, \"Wed\" : true, \"Thu\" : true , \"Fri\" : true, \"Sat\" : false, \"Sun\" : false}",
//		        "group": {
//		            "id": 1,
//		            "createdAt": "2015-06-02T10:48:15.627+09:00",
//		            "updatedAt": "2015-06-02T10:48:15.627+09:00",
//		            "useFlexibleTime": false,
//		            "usePeriodSetting": false,
//		            "accessSetting": "BLACK",
//		            "clockInTime": "09:00:00",
//		            "clockOutTime": "18:00:00",
//		            "sortOrder": 0
//		        },
//		        "status": [{
//		            "name": "휴가",
//		            "type": "DATE"
//		        }, {
//		            "name": "교육",
//		            "type": "TIME"
//		        }]
//            });
            return instance;
        },
        getWorkDays : function() {
        	return instance;
        },
        addStatus : function(option) {
        	instance.get('status');
        },
        findWhere : function(name) {
        	return this.findWhere(new Status({name : name}));
        }
	});
	
	return AttndDefaultModel;
});

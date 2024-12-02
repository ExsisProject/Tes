define([
    "backbone"
],

function(Backbone) {
	
	
	var instance = null;
	var DeviceVersion = Backbone.Model.extend({
		url: function() {
			return "/ad/api/system/device/version/" + this.deviceId;//changed.
		}
	}, {
		get: function(deviceId) {
			if(instance == null) instance = new DeviceVersion();
			instance.deviceId = deviceId;
			instance.fetch({async:false});
			return instance;
		}
	}); 
	
	return DeviceVersion;
});
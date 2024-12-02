define([
    "backbone"
],

function(
		Backbone
) {	
	var AssetCalendar = Backbone.Collection.extend({
		model : Backbone.Model,
		
		initialize : function(options) {
			this.type = options.type;
			this.eventId = options.eventId;
		},
		
		url: function() {
			var url = GO.contextRoot + "api/asset/"; 
			
			if (this.type == "assetList") { //자산목록, 캘린더등록시 예약리스트
				url += "calendar"; 
			} else if (this.type == "current") { //현재 캘린더 예약 현황
				url += "my/reservation/calendar/" + this.eventId;
			}
			
			return url;
		}
	}); 
	
	return AssetCalendar;
});
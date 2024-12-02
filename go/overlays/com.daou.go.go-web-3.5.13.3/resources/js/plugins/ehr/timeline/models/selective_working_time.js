
define("timeline/models/selective_working_time", function (require) {

    var Backbone = require("backbone");

	var SelectiveWorkingTime= Backbone.Model.extend({
		defaults : {
        },
            
        initialize : function(){
        },
        getAverageMaximumWorkingTime:function(){
		    return this.get("averageMaximumWorkingTime");
        },
        getAverageMinimumWorkingTime:function(){
            return this.get("averageMinimumWorkingTime");
        },
        getDutyWorkingTime:function(){
            return this.get("dutyWorkingTime");
        },
        getFurtureWorkingDayCnt:function(){
            return this.get("furtureWorkingDayCnt");
        },
        getHoliDayCnt:function(){
            return this.get("holiDayCnt");
        },
        getMaximumExtensionWorkingTime:function(){
            return this.get("maximumExtensionWorkingTime");
        },
        getMaximumTotalWorkingTime:function(){
            return this.get("maximumTotalWorkingTimeStr");
        },
        getMinimumTotalWorkingTime:function(){
            return this.get("minimumTotalWorkingTimeStr");
        },
        getPastWorkingDayCnt:function(){
            return this.get("pastWorkingDayCnt");
        },
        getRemainingMaximumWorkingTime:function(){
            return this.get("remainMaximumWorkingTimeStr");
        },
        getRemainingMinimumWorkingTime:function(){
            return this.get("remainMinimumWorkingTimeStr");
        },
        getTotalWorkingTime:function(){
            return this.get("totalWorkingTime");
        },
        getWorkingDayCnt:function(){
            return this.get("workingDayCnt");
        }
	});

	return SelectiveWorkingTime;
	
});

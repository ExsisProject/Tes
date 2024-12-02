define([
        "backbone",
        "app",
        "admin/libs/recurrence_parser",
        "GO.util"
    ],
    
    function(
        Backbone,
        GO,
        RecurrenceParser
    ) {
		var DATE_FORMAT = 'YYYY-MM-DD';
		
        var Notice = Backbone.Model.extend({
            urlRoot : GO.contextRoot + "ad/api/notice",
            
            initialize : function(){
            	this.recrurrenceHelper = new RecurrenceParser();
            },
            
            setInitData : function(){
                var startDate = GO.util.now().format('YYYY-MM-DD'),
                    endDate = GO.util.now().add('days', 7).startOf('days').format('YYYY-MM-DD');
                
                this.set({
                    title : "",
                    width : 400,
                    height : 600,
                    showWeb : true,
                    showMobile : true,
                    startTime : startDate,
                    endTime : endDate,
                    option : "none",
                    targetAll : true,
                    wrappedState : false
                });
            },
            
            hasRecurrence : function() {
            	return this.get("recurrence") != undefined && this.get("recurrence")  != "";
            },
            
            hasByMonthDay : function() {
            	if(this.hasRecurrence()){
            		return this.recrurrenceHelper.parse(this.get("recurrence"))._hasByMonthDay();
            	}else{
            		return false;
            	}
            },
            
            hasByDay : function() {
            	if(this.hasRecurrence()){
            		return this.recrurrenceHelper.parse(this.get("recurrence"))._hasByDay();
            	}else{
            		return false;
            	}
            },
            
            isNormalState : function() {
            	return this.get('state') == "normal" ?  true : false;
            },
            
            getConvertStartTime : function(){
            	var mdate = moment(this.get("startTime"), DATE_FORMAT);
                return mdate.format(DATE_FORMAT);
            },
            
            getConvertEndTime : function(){
            	var mdate = moment(this.get("endTime"), DATE_FORMAT);
                return mdate.format(DATE_FORMAT);
            },

            isShowAll : function(){
                return this.get("showWeb") == true && this.get("showMobile") == true;
            },

            isShowWeb : function(){
                return this.get("showWeb") == true && this.get("showMobile") == false;
            },

            isShowMobile : function(){
                return this.get("showWeb") == false && this.get("showMobile") == true;
            },
            
            isSize400_600 : function(){
                return this.get("width") == 400 && this.get("height") == 600;
            },
            
            isSize520_600 : function(){
                return this.get("width") == 520 && this.get("height") == 600;
            },
            
            isSize800_600 : function(){
                return this.get("width") == 800 && this.get("height") == 600;
            },
            
            isAlwaysMode : function(){
                return this.get("option") == "always";
            },
            
            isDayMode : function(){
                return this.get("option") == "day";
            },

            isWeekMode : function(){
                return this.get("option") == "week";
            },
            
            isNoneMode : function(){
                return this.get("option") == "none";
            },
            
            getFiles : function() {
                return _.filter(this.getIconAttaches(), function(attach) {
                    return !GO.util.isImage(attach.extention);
                });
            },
            
            getImages : function() {
                return _.filter(this.getIconAttaches(), function(attach) {
                    return GO.util.isImage(attach.extention);
                });
            },
            
            getIconAttaches : function() {
                return _.each(this.get("attaches"), function(attach) {
                    attach["icon"] = GO.util.getFileIconStyle(attach);
                });
            },
        });
    
        return Notice;
    }
);
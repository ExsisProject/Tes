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
            urlRoot : GO.contextRoot + "ad/api/notice/front",
            
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
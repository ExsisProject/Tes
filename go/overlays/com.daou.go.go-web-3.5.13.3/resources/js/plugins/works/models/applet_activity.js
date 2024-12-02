define('works/models/applet_activity', function(require) {
	// dependency
	var Backbone = require('backbone');
	var GO = require('app');
	
	/**
	 * 애플릿 Activity 모델(AppletActivity)
	 * 참고: http://wiki.daou.co.kr/display/go/AppletActivity
	 * 
	 */
    var ActivityModel = Backbone.Model.extend({
    	initialize : function(options) {
    		this.appletId = options.appletId;
    		this.id = options.activityId || options.id || null;
    		this.docId = options.docId
    	},
    	
    	defaults : {
    		commentCount : 0
    	},
    	
    	url : function(){
    		if(this.isNew()){
        		return "/api/works/applets/" + this.get('appletId') + "/docs/" + this.get('docId') + '/activity';
    		}else{
        		return "/api/works/applets/" + this.get('appletId') + "/docs/" + this.get('docId') + '/activity/' + this.id ;    			
    		}

    	},
    	
    	setAppletId : function(appletId) {
    		this.appletId = appletId;
    	},
    	
    	
    	commentPresent : function() {
    		return this.get("commentCount") > 0;
    	},
    	
    	
    	createdAt : function() {
    		return GO.util.basicDate3(this.get("createdAt"));
    	},
    	
    	
    	isModify : function() {
    		return this.get("createdAt") != this.get("updatedAt");
    	},
    	
    	
    	modifyTime : function() {
    		return this.isModify() ? this.get("updatedAt") : this.get("createdAt");
    	},
    	
    	
    	hasAttach : function() {
    		return this.has("attaches") && this.get("attaches").length > 0;
    	},
    	
    	
    	hasMobileContent : function() {
    		return this.mobileContent() === "" ? false : true;
    	},
    	
    	
    	mobileContent : function() {
    		var content = this.get("content").replace(/[<][^>]*[>]/gi, "").replace(/&nbsp;/gi, "").trim();
    		return content;
    	},
    	
    	hasMoreComment : function() {
    		return this.get("commentCount") > this.get("comments").length;
    	}
    }); 
	
	return ActivityModel;
});
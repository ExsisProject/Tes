define('works/collections/applet_activities', function(require) {
	var Backbone = require('backbone');
	var GO = require('app');
	var ActivityModel = require('works/models/applet_activity');
	
	/**
	 * 애플릿 Activity 모델(AppletActivity)
	 * 참고: http://wiki.daou.co.kr/display/go/AppletActivity
	 */
	
	return Backbone.Collection.extend({

		model: ActivityModel,

        initialize: function(options) {
        	this.options = options || {};
    		this.appletId = options.appletId;
    		this.docId = options.docId;
    		this.reqAppletId = options.reqAppletId;
        },

		url: function() {
			return this.reqAppletId ? 
				GO.config('contextRoot') + 'api/works/applets/' + this.reqAppletId + '/refer/' + this.appletId + '/doc/' + this.docId + '/activity' :
				GO.config('contextRoot') + 'api/works/applets/' + this.appletId + '/docs/' + this.docId + '/activity'; 
		}
	});
});
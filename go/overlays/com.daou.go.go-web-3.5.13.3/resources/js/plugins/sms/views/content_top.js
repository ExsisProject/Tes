define('sms/views/content_top', function(require) {
    
    
    var ContentTopTmpl = require('hgn!sms/templates/content_top');
    
	var smsLang = require("i18n!sms/nls/sms");
	var lang = {
			"발송 문자 내역" : smsLang["발송 문자 내역"]
	}
    
    var ContentTopView = Backbone.View.extend({
    	
        tagName: 'header', 
        className: 'content_top', 
        
        events: {

        },
        
        initialize: function(options) {
            options = options || {};
        }, 
        
        render: function() {
        	
            this.$el.html(ContentTopTmpl({
            	lang : lang
            }));
        }                
    });
    
    return ContentTopView;
});
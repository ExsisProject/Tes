define([
	"backbone"
],

function(
	Backbone
) {
	var instance = null;
	var Auth = Backbone.Model.extend({
		defaults : {
		},
		initialize : function(options) {
			this.options = options || {};
    	},
    	url : function() {
        	return GO.contextRoot + 'api/ehr/attnd/user/' + this.options.userid+'/auth';
        }, 
        hasTimeEditAuth : function() {
        	return this.get('hasTimeEditAuth');
        },
        hasStatusEditAuth : function() {
        	return this.get('hasStatusEditAuth');
        }
	});
	
	return Auth;
});

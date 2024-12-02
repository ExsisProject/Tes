define([
    "backbone"
],

function(Backbone) {
	
	var GroupInfo = Backbone.Model.extend({
		url : function() {
			return [ "/api/contact/personal/group", this.groupId].join('/');
		},		
		
		setGroupId : function(opt){
			this.groupId = opt.groupId;
		}
		
	});
	
	return {
		read : function(opt){
			var groupInfo = new GroupInfo();
			groupInfo.setGroupId(opt);
			groupInfo.fetch({async:false,
				statusCode: {
					400: function() { GO.util.error('404', { "msgCode": "400-contact"}); }, 
                    403: function() { GO.util.error('403', { "msgCode": "400-contact"}); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-contact"}); }, 
                    500: function() { GO.util.error('500'); }
                },
				error : function(model, response) {
					var result = JSON.parse(response.responseText);
					$.goMessage(result.message);
				}});
			return groupInfo;
		}
	};
});
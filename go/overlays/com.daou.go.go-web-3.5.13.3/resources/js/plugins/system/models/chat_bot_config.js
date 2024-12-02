define([
    "backbone"
],

function(Backbone) {
	var ChatBotConfig = Backbone.Model.extend({
		url: function() {
			return "/ad/api/system/chatbotconfig";
		}
	},
	{
		get: function() {
			var instance = new ChatBotConfig();
			instance.fetch({async:false});
			return instance;
		}
	});

	return {
		get : function(){
			return ChatBotConfig.get();
		}
	};
});
define([
    "backbone"
],

function(Backbone) {
	var OpenApiConfig = Backbone.Model.extend({
		url: function() {
			return "/ad/api/system/openapiconfig";
		}
	},
	{
		get: function() {
			var instance = new OpenApiConfig();
			instance.fetch({async:false});
			return instance;
		}
	});

	return {
		get : function(){
			return OpenApiConfig.get();
		}
	};
});
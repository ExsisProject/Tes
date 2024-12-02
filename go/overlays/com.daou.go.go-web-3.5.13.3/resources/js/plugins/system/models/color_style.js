define([
    "backbone"
],

function(Backbone) {
	
	var instance = null;
	var ColorStyle = Backbone.Model.extend({
		url: function() {
			return "/ad/api/company/colorstyle";
		},
	}, {
		get: function() {
			instance = new ColorStyle();
			instance.set({silent:true});
			instance.fetch({async:false});
			return instance;
		}
	}); 
	
	return {
		read : function(){
			return colorStyle = ColorStyle.get();
		}
	};
});
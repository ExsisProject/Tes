// URL만 가지고 있는 모델 정리.
define([
    "backbone"
],

function(Backbone) {
	var model = Backbone.Model.extend({
		initialize : function(options) {
			if (options.url) {
				this.url = options.url;
			}
			if (options.urlRoot) {
				this.urlRoot = options.urlRoot;
			}
		}
	}); 
	return model;
});
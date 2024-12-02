define([ "backbone" ],

function(Backbone) {

	var instance = null;
	var LogConfig = Backbone.Model.extend({
		url : function() {
			return "/ad/api/log/level";
		},
	}, {
		get : function() {
			if (instance == null)
				instance = new LogConfig();
			instance.fetch({
				async : false
			});
			return instance;
		},
		create : function() {
			return new LogConfig();
		}
	});

	return {
		read : function() {
			return logConfig = LogConfig.get();
		},
		create : function() {
			return LogConfig.create();
		}
	};
});

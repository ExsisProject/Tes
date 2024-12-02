define([
        "backbone"
    ],
function (
	Backbone
) {
	var instance = null;
	var BoardConfig = Backbone.Model.extend({
		url: function () {
			if (this.get('admin')) {
				return "/ad/api/boardconfig";
			} else {
				return "/api/boardconfig";
			}
		},
	}, {
		get: function (opt) {
			if (instance == null) instance = new BoardConfig();
			instance.set({admin: opt.admin ? opt.admin : false});
			instance.fetch({async: false});
			return instance;
		}
	});

	return {
		read: function (opt) {
			return boardConfigdModel = BoardConfig.get(opt);
		}
	};
});
define('docs/views/mobile/home', function(require) {

	var BaseDocsView = require("docs/views/base_docs");
	var Template = require('hgn!docs/templates/mobile/home');
	var TitleToolbarView = require('views/mobile/title_toolbar');

	return BaseDocsView.extend({

		render: function() {

			var self = this;
			var titleToolbarOption = {
				name : "asdf",
				isIscroll : false,
				isPrev : false
			};

			this.titleToolbarView = TitleToolbarView;
			this.titleToolbarView.render(titleToolbarOption);

			this.$el.html(Template({
				lang: this.lang
			}));
			return this;
		}
	});
});
define('docs/views/layouts/default', function(require) {
	
	var DefaultLayout = require('views/layouts/default');

	return DefaultLayout.extend({

		className: 'go_skin_default',

		sideView: null,
		contentTopView: null,

		initialize: function () {
			DefaultLayout.prototype.initialize.apply(this, arguments);
			this.sideView = null;
			this.contentTopView = null;
		},

		render: function () {

			var self = this;
			self.appName = 'docs';

			DefaultLayout.prototype.render.call(this, arguments);
			self.getContentElement().empty();
			//self.getSideElement().empty();

			return this;
		}
	});
});
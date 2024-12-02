define('docs/views/base_docs', function(require) {
	
	var Backbone = require('backbone');
	var LayoutView = require('docs/views/layouts/default');
	var ContentTopView = require('docs/views/content_top');
	var HomeSide = require("docs/views/side");

	var docsLang = require('i18n!docs/nls/docs');

	return Backbone.View.extend({

		className: 'content_page',

		initialize: function (options) {
			options = options || {};
			this.layoutView = new LayoutView();
		},

		render: function () {

			var self = this;
			var layoutView = this.layoutView;

			layoutView.render();
			self._renderSide(layoutView);
            self.renderContentTop(layoutView);

			return this;
		},

        renderContentTop: function(layoutView){
            var self = this;
            var contentTopView = new ContentTopView({});

            layoutView.getContentElement().html(contentTopView.el);
            contentTopView.render();
            layoutView.setContent(self);

            contentTopView.setTitle(docsLang["문서관리홈"]);
        },

		_renderSide: function (layoutView) {
            this.sideView = new HomeSide({});
            if(!layoutView.getSideElement().find(".docs_side").length){

                layoutView.getSideElement().empty().append(this.sideView.el);
                this.sideView.render();
            }else{
			    this.sideView.refreshWaitingCount();
			}
		}
	});
});
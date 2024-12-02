define('works/components/formbuilder/core/views/base_detail', function(require) {
    var BaseComponentView = require('works/components/formbuilder/core/views/base_component');

	return BaseComponentView.extend({
	    viewType: 'detail',

	    /**
	     * @return {Boolean|String} false이면 에러없음. 그외 에러메시지 반환
	     */
		validate: function() {
		    return false;
		},

		afterRender: function () {
			this._renderColor();
			this._renderBold();
		},

		_renderColor: function () {
			if (this.model.get('color')) {
				this.$('.box_label_wrap').find('label').removeClass(function (index, className) {
					return (className.match(/(^|\s)bgcolor\S+/g) || []).join(' ');
				}).addClass('bgcolor' + this.model.get('color'));
			}
		},

		_renderBold: function () {
			var isBold = !!this.model.get('bold');
			if (isBold) this.$('.box_label_wrap').find('label').addClass('st');
		}
	});
});

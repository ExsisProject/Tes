define('works/views/mobile/side_item', function(require) {
	
	var Backbone = require('backbone');
	var App = require('app');
	var Hogan = require('hogan');
	
	var SideItemTmpl = Hogan.compile(
			'<a>' +
				'<span data-id="{{model.id}}" name="sideItem" class="btn_wrap">' +
					'<span class="ic_side {{className}}"></span>' +
					'<span class="txt_ellipsis">{{model.name}}</span>' +
				'</span>' +
			'</a>'
	);
	
	var SideItemView = Backbone.View.extend({
		tagName : "li",
		
		initialize : function(options) {
			this.options = options || {};
			this.model = options.model;
			this.className = options.className;
		},
		
		render : function() {
			this.$el.html(SideItemTmpl.render({
				model : this.model.toJSON(),
				className : this.className
			}));
			return this;
		}
		
	});
	return SideItemView;
});
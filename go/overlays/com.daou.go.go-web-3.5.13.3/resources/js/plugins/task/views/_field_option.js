;(function() {
	define([
			"backbone",
			"hogan"
	], 
	function(
			Backbone,
			Hogan
	) {
		var OptionTmpl = Hogan.compile(
			'<td class="subject">' +
				'<span class="wrap_txt">' +
					'<label></label>' +
					'<input data-tag="optionInput" id="option" class="txt wfix_large" type="text" value="{{name}}">' +
				'</span>' +
			'</td>' +	
			'<td class="default">' +
				'<span class="wrap_single_form">' +
					'<input type="checkbox" name="option">' +
				'</span>' +
			'</td>' +	
			'<td class="delete">' +
				'<span class="wrap_btn_m">' +
					'<span class="ic_side ic_basket_bx">' +
					'</span>' +
				'</span>' +
			'</td>'
		);
		
		
		var OptionItemView = Backbone.View.extend({
			tagName : "tr",
			events : {
				"click span.ic_basket_bx" : "destroy"
			},
			initialize : function(data) {
				this.dataSet = data;
				this.render();
			},
			render : function(type) {
				this.$el.html(OptionTmpl.render(this.dataSet));
			},
			
			destroy : function() {
				this.$el.remove();
			}
		});
		return OptionItemView;
	});
}).call(this);
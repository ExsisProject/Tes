;(function() {
	define([
			"backbone",
			"hogan"
	], 
	function(
			Backbone,
			Hogan
	) {
		var TagTmpl = Hogan.compile(
				'<td class="subject">' + 
					'<span class="wrap_txt">' +
						'<label></label>' +
						'<input class="txt wfix_max" type="text" value="{{name}}">' +
					'</span>' +
				'</td>' +	
				'<td class="delete">' +
					'<span class="btn">' +
						'<span class="ic_side ic_basket_bx"></span>' +
					'</span>' +
				'</td>'					
		);
		
		var lang = {
		};
		
		var TagItemView = Backbone.View.extend({
			tagName : "tr",
			events : {
				"click span.ic_basket_bx" : "destroy"
			},
			initialize : function(data) {
				this.dataSet = data;
				this.render();
			},
			render : function() {
				this.$el.html(TagTmpl.render(this.dataSet));
				this.$el.attr("id", this.dataSet.id);
			},
			
			destroy : function() {
				this.$el.remove();
			}
		});
		return TagItemView;
	});
}).call(this);
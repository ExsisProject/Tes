;(function() {
	define([
			"backbone",
			"hogan"
	], 
	function(
			Backbone,
			Hogan
	) {
		var DomainCodeLabelTmpl = Hogan.compile(
				'<span class="major">[{{codeLabel}} : {{nodeValue}}]</span>' +
				'<span class="wrap_btn_m">' + 
					'<span class="ic_side ic_basket_bx"></span>' +
				'</span>'
		);
		
		var DomainCodeLabelView = Backbone.View.extend({
			tagName : "li",
			events : {
				"click span.ic_basket_bx" : "destroy"
			},
			initialize : function(data) {
				this.dataSet = data;
				this.render();
			},
			render : function() {
				this.$el.html(DomainCodeLabelTmpl.render(this.dataSet));
				this.$el.attr("data-id", this.dataSet.nodeId);
				this.$el.data("instance", this.dataSet);
			},
			
			destroy : function() {
				this.$el.remove();
			}
		});
		return DomainCodeLabelView;
	});
}).call(this);
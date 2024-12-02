define("works/components/filter/views/filter_text_form", function(require) {
	var TextFormTmpl = Hogan.compile([
        '<div class="wrap_box_small">',
        	'<input class="txt_mini w_max" type="text" value="{{model.values.text}}">',
        '</div>'
    ].join(""));
	
	var TextFormView = Backbone.View.extend({
		
		className : "box_basic_inner",
		
		initialize : function(options) {
		},
		
		render : function() {
			this.$el.html(TextFormTmpl.render({
				model : this.model.toJSON()
			}));
			
			return this;
		},
		
		resetView : function() {
			if(this.model.get("values")) {
				this.$("input").val(this.model.get("values").text);
			}
		},
		
		/**
		 * 뷰 데이터를 모델에 set 하는 함수
		 */
		setModel : function() {
			this.model.set("values", {
				text : this.$("input").val()
			});
		}
	});
	
	return TextFormView;
});
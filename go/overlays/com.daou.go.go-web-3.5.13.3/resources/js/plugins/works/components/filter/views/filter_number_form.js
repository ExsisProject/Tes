define("works/components/filter/views/filter_number_form", function(require) {

	var _ = require('underscore');
	var worksLang = require("i18n!works/nls/works");
	var lang = {
		"최소" : worksLang["최소"],
		"최대" : worksLang["최대"]
	};
	
	var NumberFormView = require("components/number_form/number_form");
	
	var Tmpl = require("hgn!works/components/filter/templates/filter_number_form");

	require('jquery.go-popup');

	var defaultValues = {
		"minValue": 0,
		"maxValue": 0
	};

	var View = Backbone.View.extend({
		
		initialize : function(options) {
		},
		
		render : function() {
			this.$el.html(Tmpl({
				lang : lang
			}));
			
			this.minValueView = new NumberFormView();
			this.minValueView.setElement(this.$("[el-min-wrapper]"));

			this.maxValueView = new NumberFormView();
			this.maxValueView.setElement(this.$("[el-max-wrapper]"));

			this.resetView();
			this.minValueView.render();
			this.maxValueView.render();

			return this;
		},
		
		/**
		 * 모델 데이터를 뷰에 set 하는 함수
		 */
		resetView : function() {
			var minValue = 0;
			var maxValue = 0;

			if(this.model.get("values")) {
				minValue = this.model.get("values").minValue || defaultValues.minValue;
				maxValue = this.model.get("values").maxValue || defaultValues.maxValue;
			}

			this.minValueView.setValue(minValue);
			this.maxValueView.setValue(maxValue);
		},
		
		/**
		 * 뷰 데이터를 모델에 set 하는 함수
		 */
		setModel : function() {
			this.model.set("values", {
				minValue : this.minValueView.getValue(),
				maxValue : this.maxValueView.getValue()
			});
		},

		isValid: function() {
			var minValue = parseFloat(this.minValueView.getValue());
			var maxValue = parseFloat(this.maxValueView.getValue());

			if(!_.isNumber(minValue)) {
				minValue = defaultValues.minValue;
			}

			if(!_.isNumber(maxValue)) {
				maxValue = defaultValues.maxValue;
			}

			if(minValue > maxValue) {
				$.goSlideMessage(worksLang['최소값이 최대값보다 큽니다'], 'caution');
				return false;
			}

			return true;
		}
	});
	
	return View;
});
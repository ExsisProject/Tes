define(function(require) {

	var GO = require('app');

	var EXCEPTED_KEY_CODE = [
        16, // shift
        35, // end
        36, // home
        37, // left
        38, // up
        39, // right
        46, // delete
        189, // minus
        190 // dot
    ];
	
	var worksLang = require("i18n!works/nls/works");
	var lang = {
		"숫자만 입력이 가능합니다." : worksLang["숫자만 입력이 가능합니다."],
		"16자리까지 입력 가능합니다." : worksLang["16자리까지 입력 가능합니다."]
	};
	
	var NumberFormTmpl = Hogan.compile("<input class='{{inputClass}}' type='text' />");
	
	var NumberFormView = Backbone.View.extend({
		
		initialize : function(options) {
			this.options = options || {};
			this.inputClass = this.options.inputClass || "txt w_min";
			this.inputSelector = this.options.inputSelector || {id : this.cid};
			this.model = new Backbone.Model();
		},
		
		events : {
			"keyup input" : "_onKeydownInput",
			"keyup input" : "_onKeyupInput"
		},
		
		render : function() {
			this.$el.html(NumberFormTmpl.render({
				inputClass : this.inputClass
			}));
			
			this.$("input").attr(this.inputSelector);
			
			return this;
		},
		
		getValue : function() {
			return this.$("input").val().split(",").join("") || 0;
		},
		
		setValue : function(value) {
			this.$("input").val(GO.util.formatNumber(value));
		},
		
		_onKeyupInput : function(e) {
//			console.log(e.keyCode);
			if (_.contains(EXCEPTED_KEY_CODE, e.keyCode)) return;
			
			var $target = $(e.currentTarget); 
			var value = $target.val();
			if (value.split(".")[0].split(",").join("").length > 16) {
				$.goError(lang["16자리까지 입력 가능합니다."], this.$("input"), false, true);
				this.setValue(this.model.get("value"));
				return
			}
			if (/[^0-9,.-]/gi.test(value)) {
				$.goError(lang["숫자만 입력이 가능합니다."], this.$("input"), false, true);
			}
			value = GO.util.formatNumber(value);
			
			$target.val(value);
			this.model.set("value", value);
		}
	});
	
	return NumberFormView;
});
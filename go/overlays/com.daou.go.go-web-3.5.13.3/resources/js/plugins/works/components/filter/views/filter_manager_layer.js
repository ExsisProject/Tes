define("works/components/filter/views/filter_manager_layer", function(require) {
	
	var commonLang = require("i18n!nls/commons");
	var worksLang = require("i18n!works/nls/works");
	var lang = {
		"새 필터 저장" : worksLang["새 필터 저장"],
		"이름 변경" : worksLang["이름 변경"],
		"삭제" : commonLang["삭제"]
	};
	
	var BackdropView = require("components/backdrop/backdrop");
	
	var Tmpl = require("hgn!works/components/filter/templates/filter_manager_layer");
	
	var View = BackdropView.extend({
		
		initialize : function(options) {
			this.parentCid = options.parentCid;
			
			this.backdropToggleEl = this.$el;
			this.bindBackdrop();
		},
		
		render : function() {
			this.$el.html(Tmpl({
				lang : lang
			}));
			
			return this;
		}
	});
	
	return View;
});
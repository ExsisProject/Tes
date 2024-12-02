/**
 * 입력항목 관리 도움말
 */

define("works/views/app/inter_app_help", function(require) {
	
	var Tmpl = require('hgn!works/templates/app/inter_app_help');
	var View = Backbone.View.extend({
		
		className: 'layer_normal layer_mail_print popup',
		
		render : function() {
			this.$el.html(Tmpl);
			
			return this;
		}
	});
	
	return View;
});
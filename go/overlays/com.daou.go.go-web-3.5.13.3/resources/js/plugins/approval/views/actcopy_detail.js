// 시행문 전환 Layer
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "hgn!approval/templates/actcopy_detail",
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	ActCopyDetailTpl,
    commonLang,
    approvalLang
) {
	var ActCopyDetailView = Backbone.View.extend({
		tag : "actcopy_detail",
		el : ".content",
		
		initialize: function(options) {
		    this.options = options || {};
		},
		
    	render: function() {
			var tpl = ActCopyDetailTpl();
			this.$el.html(tpl);
		},
		
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return ActCopyDetailView;
});
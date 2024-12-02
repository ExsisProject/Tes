// 결재 진행 사이드 > 문서정보
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "hgn!approval/templates/document_info",
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	SideInfoTpl,
    commonLang,
    approvalLang
) {
	var SideInfoView = Backbone.View.extend({
		
		el: '#sideContent',
		
    	render: function() {
			this.$el.html(SideInfoTpl());
		},
		
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return SideInfoView;
});
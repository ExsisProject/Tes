// 결재이력
define([
    // 필수
	"jquery",
	"underscore", 
    "backbone", 
    "app", 
    "hgn!approval/templates/changePwdForm",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
], 

function(
    $,  
	_, 
    Backbone, 
    App, 
    ChangePwdFormTbl,
    commonLang,
	approvalLang
) {	
		
	var changePwdFormView = Backbone.View.extend({
		tagName: 'div',
		className: 'content',	
		initialize: function() {
		},
	
    	render : function(){
			var tpl = ChangePwdFormTbl({
				lang : { '현재 비밀번호' :approvalLang['현재 비밀번호'], 
					'새 비밀번호' : approvalLang['새 비밀번호'],
					'비밀번호 확인' : approvalLang['비밀번호 확인']}
			});
			this.$el.html(tpl);
			return this;
		},
		
    	release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});

	return changePwdFormView;
});

define([ 
    "jquery",
    "backbone",
	"views/mobile/layer_toolbar",
    "hgn!approval/templates/mobile/document/m_action_document",
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	Backbone,
	LayerToolbarView,
	DocumentActionTpl,
    commonLang,
    approvalLang
) {
	var lang = {
			"취소" : commonLang['취소'],
			"결재" : approvalLang['결재'],
			"반려" : approvalLang['반려'],
			"합의" : approvalLang['합의'],
			"반대" : approvalLang['반대'],
			"회수" : approvalLang['회수'],
			"접수" : approvalLang['접수'],
		    "후열" : approvalLang['후열'],
		    "전결" : approvalLang['전결'],
		    "결재 비밀번호" : approvalLang['결재 비밀번호'],
		    "결재 의견 등록 양식" : approvalLang['결재 의견 등록 양식'],
		    "의견을 작성해 주세요" : approvalLang['의견을 작성해 주세요'],
	        '다음문서로이동' : approvalLang['다음문서로이동'],
	        '다음문서로이동설명' : approvalLang['다음문서로이동설명'],
	        '반려옵션' : approvalLang['반려옵션'],
	        '반려옵션설명' : approvalLang['반려옵션설명'],
			"기안의견" : approvalLang['기안의견'],
			"긴급문서설명" : approvalLang['긴급문서설명'],
			"긴급": approvalLang['긴급']
	};
	var DocumentActionView = Backbone.View.extend({
		title : '',
		buttons : [],
		initialize : function(options){
			_.bindAll(this, 'render');
		    this.options = options || {};
		    this.toolBarData = this.options.toolBarData;
		    if(_.isArray(this.options.buttons)){
		    	this.buttons = this.options.buttons; 
		    };
		},
		events: {
			"keyup textarea" : "_expandTextarea",
			"keypress #apprPassword" : "unbindEnter"
		},
		render: function() {
			var tpl;
			this.headerToolbarView = LayerToolbarView;
			this.headerToolbarView.render(this.toolBarData);
			var headerModel = this.options.headerModel;
			this.$el.html(DocumentActionTpl({
				isDraft : this.options.isDraft ? this.options.isDraft : false,
				headerModel : headerModel,
				isPassword : this.options.isPassword,
				isCancel : this.options.isCancel,
				lang : lang,
				nextApproval : this.options.nextApproval,
				useNextApproval : this.options.useNextApproval,
				showPreviousReturn : this.options.showPreviousReturn,
				isEmergency : this.options.isEmergency || false
			}));
		},
		_expandTextarea : function(e) {
		    GO.util.textAreaExpand(e);
		},
		unbindEnter : function(e) {
			if(e.keyCode == 13){
				return false;
			}
		},
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		},
	
	});
	
	return DocumentActionView;
});
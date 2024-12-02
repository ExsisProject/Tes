define([
    "jquery",
    "underscore",
    "backbone",
    "hgn!approval/templates/official_document/toolbar",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function(
	$,
	_,
	Backbone,
	ToolbarTpl,
    commonLang,
    approvalLang
) {
	var lang = {
		"삭제" : approvalLang['삭제'],
		"취소" : commonLang['취소'],
		"저장" : commonLang['저장'],
		"반려" : approvalLang['반려'],
		"공문서 수신처" : approvalLang['공문서 수신처'],
		"원문 보기" : "원문 보기",
		"승인" : approvalLang['승인'],
	    "팝업보기" : commonLang['팝업보기'],
	    "도움말" : commonLang['도움말'],
	    "다운로드" : commonLang['다운로드'],
	    "공문 발송 취소" : "공문 발송 취소",
	    "공문 재발송" : "공문 재발송",	    
		"목록" : commonLang['목록'],
		"인쇄" : commonLang['인쇄'],
	    "미리보기" : commonLang['미리보기']
	};
	
	var ToolbarView = Backbone.View.extend({
		initialize: function(options) {
		    this.options = options || {};
		    this.model = this.options.model;
			_.bindAll(this, 'render');
		},
		events: {
			'click #officialFlow' : 'officialFlow',
			'click #show_popup' : 'showPopup',
			'click #actApprove' : 'actApprove',
			'click #actReturn' : 'actReturn',
			'click #actRetractable' : 'actRetractable',
			'click #actReRequestable' : 'actReRequestable',
			'click #doPrint' : 'doPrint',
			'click #show_document_popup' : 'showDocumentPopup',
			'click #act_list' : 'actList'			
		},
		
		officialFlow : function(){
			this.trigger('officialFlow');
		},
		
		showPopup : function(){
			this.trigger('showPopup');
		},
		
		showDocumentPopup : function(){
			this.trigger('showDocumentPopup');
		},

		render: function() {
			this.$el.html(ToolbarTpl({
				lang : lang,
				data : this.model.toJSON(),
				isPopup : this.options.isPopup
			}));
		},
		
		actApprove : function(){
			this.trigger('actApprove');
		},
		actReturn : function(){
			this.trigger('actReturn');
		},
		
		actRetractable : function(){
			this.trigger('actRetractable');
		},
		
		actReRequestable : function(){
			this.trigger('actReRequestable');
		},
		
		doPrint : function(){
			this.trigger('doPrint');
		},
		
		actList : function(){
			this.trigger('actList');
		}
	});

	return ToolbarView;
});
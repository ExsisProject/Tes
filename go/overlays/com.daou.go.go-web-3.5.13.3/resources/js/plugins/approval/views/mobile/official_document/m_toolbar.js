define([
    "jquery",
    "backbone",
    
    "hgn!approval/templates/mobile/official_document/m_toolbar",
	
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    "jquery.go-preloader"
],
function(
	$,
	Backbone,
	
	ToolbarTpl,
    
	commonLang,
    approvalLang
) {
	var lang = {
		"댓글" : approvalLang['댓글'],
		"목록" : commonLang['목록'],
		"승인" : approvalLang["승인"],
		"반려" : approvalLang['반려'],
		"승인선택" : approvalLang["승인선택"],
		"공문 발송 취소" : approvalLang["공문 발송 취소"],
	    "공문 재발송" : approvalLang["공문 재발송"],
	    "본문" : approvalLang["본문"],
	    "공문발송" : approvalLang["공문발송"]
	};
	var ToolbarView = Backbone.View.extend({
		initialize: function(options) {
		    this.options = options || {};
		    this.model = this.options.model;
			_.bindAll(this, 'render');
		},
		events: {
			'click [name=document_action]' : 'actApprAction',
			'click #act_list' : 'actList'
		},
		render: function() {
			var showSelectAction = (this.model.get('approvable') || this.model.get('retractable') || this.model.get('reRequestable')) ? true : false;
			this.$el.html(ToolbarTpl({
				lang : lang,
				data : this.model.toJSON(),
				showSelectAction : showSelectAction
			}));
		},
		show_document: function(){
			this.trigger('show_document');
		},
		show_official_doc_receiver: function(){
			this.trigger('show_official_doc_receiver');
		},
		actApprAction: function(e){
			this.trigger($(e.currentTarget).attr('id'));
		},

		actList: function(e){
			e.preventDefault();
			e.stopPropagation();
			this.trigger('actList', e);
		}
	});
	return ToolbarView;
});
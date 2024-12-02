define([
    "jquery",
    "underscore",
    "backbone",
    "hgn!approval/templates/document/dochistory",
    "approval/views/document/docbody_history",
    "approval/views/document/apprflow_history",
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	DocHistoryTpl,
	DocBodyHistoryView,
	ApprFlowHistoryView,
    commonLang,
    approvalLang
) {
	var lang = {
		    "결재선 변경" : approvalLang['결재선 변경'],
		    "버전" : approvalLang['버전'],
		    "날짜" : approvalLang['날짜'],
		    "사용자" : approvalLang['사용자'],
		    "결재문서 변경" : approvalLang['결재문서 변경']
	};
	var DocHistoryView = Backbone.View.extend({
		tagName: 'div',
		className: 'aside_wrapper_body',
		initialize: function(options) {
		    this.options = options || {};
		    if(_.isObject(this.options.model)){
		    	this.apprFlowHistories = this.options.model.get('apprFlowVersions');
				this.docBodyHistories = this.options.model.get('actionLogs');
				this.isSiteAdmin = this.options.model.isAdmin
		    }
		},
		events: {
			'click .apprflowHistoryView' : 'apprflowHistoryView',
			'click .showApprChangeLog' : 'showApprChangeLog'
    	},
		render: function() {
			this.$el.html(DocHistoryTpl({
				lang : lang
			}));
			this.docBodyHistoryView = new DocBodyHistoryView({
				actionLogs : this.docBodyHistories,
				isSiteAdmin : this.isSiteAdmin
			});
			this.apprFlowHistoryView = new ApprFlowHistoryView({
				apprFlowHistories: this.apprFlowHistories
			});
			this.docBodyHistoryView.setElement($(this.el).find('#docbody_history')).render();
			this.apprFlowHistoryView.setElement($(this.el).find('#apprflow_history')).render();
			return this;
		},
		apprflowHistoryView: function(e){
			this.apprFlowHistoryView.showApprChangeLog(e);
		},
		showApprChangeLog: function(e){
			var versionDoc = this.docBodyHistoryView.showApprChangeLog(e);
            var url = location.protocol + '//' + window.location.host + GO.contextRoot + 'app/approval/document/' + this.model.get('id') + '/' + versionDoc.version + '/popup/print';
            window.open(url, '','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
		},
		show: function() {
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        }
	});
	
	return DocHistoryView;
});
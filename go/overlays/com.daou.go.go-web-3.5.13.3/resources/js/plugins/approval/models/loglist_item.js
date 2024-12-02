define([
    'underscore',
    'backbone',
    "i18n!approval/nls/approval"
], function(
    _,
    Backbone,
    approvalLang
) {
	var LogListItemModel = Backbone.Model.extend({
		
		initialize: function() {

		},
		toJSON: function() {
			
		},
		getAccessType: function() {
			var accessType = this.attributes.accessType;
			if (accessType == "LIST") {
				return approvalLang['목록'];
			} else if (accessType == "VIEW") {
				return approvalLang['조회'];
			} else if (accessType == "BODYMODIFY") {
				return approvalLang['내용 수정'];
			} else if (accessType == "FLOWMODIFY") {
				return approvalLang['결재선 수정'];
			} else if (accessType == "FORCERETURN") {
				return approvalLang['강제반려'];
			} else if (accessType == "FORCERECVRETURNED") {
				return approvalLang['강제반송'];
			} else if (accessType == "WITHDRAW") {
				return approvalLang['접수취소'];
			} else if (accessType == "DELETE") {
				return approvalLang['삭제'];
			}
		},
		getDocStatusName: function() {
			return this.attributes.docStatusName;
		},
		// 결재문서ID
		getDocumentId: function() {
			return this.attributes.documentId;
		},
		getAccessAt: function() {
			var accessAt = this.attributes.accessAt;
			if ( accessAt ) {
				return GO.util.basicDate(accessAt);
			} else {
				return '-';
			}
		}
	}); 
	return LogListItemModel;
});
define([
    'underscore',
    'backbone',
    "i18n!approval/nls/approval"
], function(
    _,
    Backbone,
    approvalLang
) {
	var DocListItemModel = Backbone.Model.extend({
		initialize: function() {

		},
		toJSON: function() {
			
		},
		getId: function() {
			return this.attributes.id;
		},
		getStartAt: function() {
			return GO.util.shortDate(this.attributes.startAt);
		},
		getEndAt: function() {
			return GO.util.shortDate(this.attributes.endAt);
		},
		getTitle: function() {
			return this.attributes.title;
		},
		getUseFlag: function() {
			if (this.attributes.useFlag) {
				return approvalLang['사용'];
			} else {
				return approvalLang['미사용'];
			}
		},
		getDeputyUserId: function() {
			return this.attributes.deputyUserId;
		},
		getDeputyUserName: function() {
			return this.attributes.deputyUserName;
		},
		getDeputyUserPosition: function() {
			return this.attributes.deputyUserPosition;
		},
		getDeputyUserDeptName: function() {
			return this.attributes.deputyUserDeptName;
		},
		getAbsenceContent: function() {
			return this.attributes.absenceContent;
		},
		getShowUrl: function() {
			return "/approval/document/" + this.attributes.documentId;
		}
	}); 
	return DocListItemModel;
});
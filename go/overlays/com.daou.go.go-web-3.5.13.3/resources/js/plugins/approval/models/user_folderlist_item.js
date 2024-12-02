define([
    'underscore',
    'backbone',
    "i18n!approval/nls/approval"
], function(
    _,
    Backbone,
    approvalLang
) {
	var FolderListItemModel = Backbone.Model.extend({
		initialize: function() {

		},
		
		url : function() {
			return GO.contextRoot + "api/approval/userfolder/" + this.id + "/folder/" + this.get("folderId");
		},
		
		// 부서ID
		getFolderId: function() {
			return this.attributes.folderId;
		},
		getCreatedAt: function() {
			return GO.util.shortDate(this.attributes.createdAt);
		}
	}); 
	return FolderListItemModel;
});
(function() {
	define(function(require) {
		var $ = require("jquery");
		var _ = require("underscore");

		var type = null,
			mode = null;

		var TYPE_TO_URL = {'USER' : 'personal', 'COMPANY' : 'company', "DEPARTMENT" : 'dept'};
		var CONTACT_TYPE = {"USER" : "USER", "COMPANY" : "COMPANY", "DEPARTMENT" : "DEPARTMENT"};
		var CONTACT_MODE = {'DETAIL' : 'detail', 'MODIFY' : 'modify', 'CREATE' : 'create'};
		return {

			init : function(opt) {
				type = opt.type;
				mode = opt.viewMode;
			},

			isUser : function() {
				return _.isEqual(CONTACT_TYPE['USER'], type);
			},

			isCompany : function() {
				return _.isEqual(CONTACT_TYPE['COMPANY'], type);
			},

			isDept : function() {
				return _.isEqual(CONTACT_TYPE['DEPARTMENT'], type);
			},

			isCreateMode : function(){
				return _.isEqual(CONTACT_MODE['CREATE'], mode);
			},

			isModifyMode : function(){
				return _.isEqual(CONTACT_MODE['MODIFY'], mode);
			},

			isDetailMode : function(){
				return _.isEqual(CONTACT_MODE['DETAIL'], mode);
			},

			getURL : function() {
				return TYPE_TO_URL[type];
			}
		}
	});
}).call(this)
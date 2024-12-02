(function() {
	define(function(require) {
		var _ = require('underscore');
		var PersonalGroupCollection = require("contact/collections/personal_group");
		var CompanyGroupCollection = require("contact/collections/company_group");
		var DeptGroupCollection = require("contact/collections/dept_group");
		var ContactHelper = require("contact/helpers/contacts");

		var getCompanyCollection = function() {
			return CompanyGroupCollection.getCollection();
		};

		var getDeptCollection = function(deptId) {
			return DeptGroupCollection.get(deptId);
		}

		var getPersonalCollection = function() {
			return PersonalGroupCollection.getCollection();
		};

		return {
			getCollection: function(type, deptId) {
				if(ContactHelper.isUser(type)) {
					return getPersonalCollection();
				} else if(ContactHelper.isCompany(type)) {
					return getCompanyCollection();
				} else {
					return getDeptCollection(deptId);
				}
			}
		};
	});
}());
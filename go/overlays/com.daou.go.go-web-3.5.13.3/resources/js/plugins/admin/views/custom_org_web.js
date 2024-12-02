define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var App = require('app');

	var customOrgWebTmpl = require("hgn!admin/templates/custom_org_web");
	var adminLang = require("i18n!admin/nls/admin");

	var langs = {
		label_additional_setting:adminLang["추가 설정"],
		label_org_pull_up:adminLang["조직도 풀업 메뉴"],
		label_use: adminLang["사용함"],
		label_notuse: adminLang["사용하지 않음"]
	};

	var CustomOrgWebConfig = Backbone.View.extend({
		el : '#customConfigArea',

		render : function() {
			var tmpl = customOrgWebTmpl({
				lang : langs
			});
			this.$el.html(tmpl);
			var orgPullUpConfig = this.getOrgPullUpConfig();
			$('input[name=orgPullUp][value='+orgPullUpConfig+']').attr('checked', true)
		},

		getOrgPullUpConfig : function() {
			var orgPullUpConfig = null;
			var url = GO.contextRoot + "ad/api/company/displayconfig";
			var param = {"companyId" : GO_Session.attributes.companyId};
			$.go(url, param, {
				contentType : 'application/json',
				async : false,
				qryType : 'GET',
				responseFn : function(response) {
					if(response.code == '200') {
						orgPullUpConfig = response.data.orgPullUp;
					}
				},
				error: function(response){
					var responseData = JSON.parse(response.responseText);
					$.goMessage(responseData.message);
				}
			});
			return orgPullUpConfig;
		},

		save : function(){
			var result = {
				success : false,
				message : null
			};
			var url = GO.contextRoot + "ad/api/company/displayconfig";

			var orgPullUpStatus = true;
			if($('#stop').is(':checked') || $("#orgPullUpOff").is(':checked')){
				orgPullUpStatus = false;
			}

			var param = {
					companyId : GO_Session.attributes.companyId,
					key : "org_pull_up",
					value: orgPullUpStatus
					};

			$.go(url, param,{
				async : false,
				qryType : 'POST',
				responseFn : function(response) {
					if(response.code == '200') {
						result.success = true;
						result.message = null;
					}
				},
				error: function(response){
					var responseData = JSON.parse(response.responseText);
					result.success = false;
					result.message = responseData.message;
				}
			});

			return result;
		}

	});

	return CustomOrgWebConfig;
})
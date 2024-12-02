define("system/views/custom_profile_config", function(require) {

	var Backbone = require("backbone");
	var GO = require("app");

	var CustomProfileConfigCollection = require("system/collections/custom_profile_config");
	var CustomProfileConfigModel = require("system/models/custom_profile_config");
	var CustomProfileConfigTmpl = require("hgn!system/templates/custom_profile_config");

	var commonLang = require("i18n!nls/commons");
	var adminLang = require("i18n!admin/nls/admin");

	require("jquery.go-sdk");

	var lang = {
		label_custom_profile_config : adminLang['커스텀 프로필 관리'],
		label_edit: commonLang["수정"],
		label_ok: commonLang["저장"],
		label_cancel: commonLang["취소"],
		label_fail: commonLang["실패"],
		label_failDesc: commonLang["실패했습니다."],
		label_sucess: commonLang["저장되었습니다."],
		label_company_name: adminLang["회사명"],
		label_field_name: adminLang["필드이름"],
		label_ko: adminLang["KO"],
		label_en: adminLang["EN"],
		label_jp: adminLang["JP"],
		label_zhcn: adminLang["ZH-CN"],
		label_zhtw: adminLang["ZH-TW"],
		label_usage : adminLang["사용여부"],
		label_order : adminLang["정렬여부"],
		label_display : adminLang["유저 프로필 노출 여부"],
		label_data_type : adminLang["데이터 타입"],
		label_use : commonLang["사용"],
		label_no_use : commonLang["사용하지 않음"],
		label_field : adminLang["필드"]
		};

	var CustomProfileConfig = Backbone.View.extend({

		events : {
			"click .ic_edit" : "editText",
			"click #btn_ok" : "saveConfig",
			"click #btn_cancel" : "resetConfig",
			"change #companyList" : "changeCompanyConfigs"
		},

		initialize : function() {
			this.collection = CustomProfileConfigCollection.getList(GO.session("companyId"));
			this.model = CustomProfileConfigModel.create();
		},

		render : function() {
			var self = this;
			this.$el.html(CustomProfileConfigTmpl({
				lang : lang,
				data : this.collection.toJSON()
			}));

			$('.breadcrumb .path').html('커스텀 프로필 관리'/*adminLang['커스텀 프로필 관리']*/);

			self.getCompanyList();
			$('#companyList').val(GO.session("companyId"));
			// return this.$el;
		},

		editText : function(e) {
			var targetEl = $(e.currentTarget).closest("td");
			targetEl.find(".editable").hide();
			targetEl.find("input:text").show();
		},

		saveConfig : function(e) {
			var self = this,
				form = $('#formCustomProfileConfig'),
				validate = true;

			var saveConfigName = $(e.currentTarget).attr("data-name");
			var saveConfigId = $(e.currentTarget).attr("data-id");

			self.model.set("id", saveConfigId, {silent: true});
			self.model.set("profileName", saveConfigName, {silent: true});
			$.each(form.serializeArray(), function(k,v){
				var category = v.name.split("_")[0];
				if(saveConfigName == category){
					if(v.name.split("_")[1] == "koLabel" && v.value == ""){
						self.showValidateMsg(v.name, commonLang["필수항목을 입력하지 않았습니다."]);
						validate = false;
						return false;
					}

					if(v.name.split("_")[1] == "useOrder" && v.value == "false" && $("#"+v.name + "_false").attr('data-used-dept-order') == "true"){
						$('#' + v.name + 'Validate').html(adminLang["부서원 정렬 순서에 사용중입니다"]);
						validate = false;
						return false;
					}

					if(v.name.split("_")[1] == "dataType" && v.value == ""){
						self.showValidateMsg(v.name, commonLang["필수항목을 입력하지 않았습니다. 부서 정렬"]);
						validate = false;
						return false;
					}
					self.model.set(v.name.split("_")[1], v.value,{silent: true});
				}
			});

			if(!validate){
				return false;
			}

			self.model.save({}, {
				success : function(model, response) {
					if(response.code == '200') {
						$.goMessage(lang['label_sucess']);
						var selectedCompany = $('#companyList').val();
						self.collection = CustomProfileConfigCollection.getList(selectedCompany);
						self.render();
						$('#companyList').val(selectedCompany);
					}
				},
				error : function(model, response) {
					$.goAlert(lang['label_fail'],lang['label_failDesc']);
				}
			});
		},

		showValidateMsg : function(targetId, msg) {
			$('#' + targetId).focus();
			$('#' + targetId + 'Validate').html(msg);
		},

		getCompanyList : function(){
			var url = GO.contextRoot + "ad/api/system/companies?offset=999";

			$.go(url, "", {
				qryType : 'GET',
				async : false,
				responseFn : function(response) {
					$.each(response.data, function(i, item){
						$('#companyList').append('<option value="' +item.id+ '">' + item.name +'</option>');
					});
					return response.data
				},
				error: function(response){
					var responseData = JSON.parse(response.responseText);
					$.goMessage(responseData.message);
				}
			});
		},

		changeCompanyConfigs : function(e){
			console.log($(e.currentTarget).val());

			this.collection = CustomProfileConfigCollection.getList($(e.currentTarget).val());
			this.render();
			$('#companyList').val($(e.currentTarget).val());

		},

		resetConfig : function() {
			this.render();
		}
	},{
		__instance__: null
	});

	function privateFunc(view, param1, param2) {
	}

	return CustomProfileConfig;
});
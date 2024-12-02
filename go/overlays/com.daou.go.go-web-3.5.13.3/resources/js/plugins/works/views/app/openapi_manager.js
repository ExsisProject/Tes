/**
 * 외부데이터 가져오기 설정 메인 뷰
 */

define('works/views/app/openapi_manager', function(require) {
	var Backbone = require('backbone');
	var when = require('when');
	var AppletBaseConfigModel = require('works/models/applet_baseconfig');
	var OpenApiModel = require('works/models/applet_openapi');
	var WorksHomeLayout = require('works/views/app/home/works_home_layout');
	var OpenApiManagerTpl = require('hgn!works/templates/app/openapi_manager');
	var WorksUtil = require('works/libs/util');
	var commonLang = require('i18n!nls/commons');
	var worksLang = require("i18n!works/nls/works");
	var ManageContentTopView = require('works/views/app/layout/manage_content_top');
	var Fields = require("works/collections/fields");
	
    var lang = {
		'사용여부' : worksLang['API 연동 사용여부'],
		'사용여부설명' : worksLang['API 연동 사용여부설명'],
		'사용안함알림' : worksLang['API 연동 사용안함알림'],
		'사용' : commonLang['사용'],
		'사용안함' : commonLang['사용안함'],
		'키관리' : worksLang['인증키 관리'],
		'키관리설명' : worksLang['인증키 관리설명'],
		'키없음' : worksLang['발급된 키가 없습니다'],
		'발급' : worksLang['발급'],
		'재발급': worksLang['재발급'],
		'키발급': worksLang['인증키 발급'],
		'인증키재발급': worksLang['인증키 재발급'],
		'인증키재발급확인': worksLang['인증키 재발급확인'],
		'연동항목관리': worksLang['연동항목관리'],
		'연동항목관리설명': worksLang['연동항목관리설명'],
		'유효기간': worksLang['유효기간'],
		'인증키 유효기간': worksLang['인증키 유효기간'],
		'인증키 유효기간 만료': worksLang['인증키 유효기간 만료'],
		'컴포넌트명': worksLang['컴포넌트명'],
		'컴포넌트 타입': worksLang['컴포넌트 타입'],
		'컴포넌트없음': worksLang['컴포넌트없음'],
		'파라미터명': worksLang['파라미터명'],
		'수정삭제연동설정': worksLang['수정삭제연동설정'],
		'수정삭제연동설정설명': worksLang['수정삭제연동설정설명'],
		'컴포넌트선택': worksLang['컴포넌트선택'],
		'외부 데이터 가져오기': worksLang['외부 데이터 가져오기'],
        '외부 데이터 가져오기 설명': worksLang['외부 데이터 가져오기 설명'],
		'validate.empty.token': worksLang['API 연동을 사용하시려면 인증키를 발급받으세요'],
		'validate.check.field': worksLang['연동항목을 선택하세요'],
		'validate.empty.field': worksLang['파라미터명을 입력하세요'],
		"validate.invalid.field": worksLang['파라미터 입력값 체크'],
		"validate.empty.update": worksLang['수정삭제 연동 컴포넌트 선택'],
		"validate.notmatch.update": worksLang['수정삭제 연동 컴포넌트 선택 필수'],
		'validate.field.length': GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {'arg1': 1, 'arg2': 20}),
		'text': worksLang['텍스트'],
		'textarea': worksLang['멀티 텍스트'],
		'number': worksLang['숫자'],
		'select': worksLang['드롭 박스'],
		'checkbox': worksLang['체크박스'],
		'radio': worksLang['단일 선택'],
		'listbox': worksLang['리스트박스'],
		'date': worksLang['날짜'],
		'time': worksLang['시간'],
		'datetime': worksLang['날짜와 시간'],
		'regist': commonLang['저장'],
		'cancel' : commonLang['취소'],
		'gosettinghome' : worksLang['관리 홈으로 이동'],
		'goapphome' : worksLang['해당 앱으로 이동'],
		'삭제': commonLang['삭제'],
		'확인': commonLang['확인'],
		'취소': commonLang['취소']
    };
	
	return Backbone.View.extend({
		className : 'go_content go_renew go_works_home app_temp',

		events : {
			'click #generationKeyLink' : "onGenerationKey",
			'click #reGenerationKeyLink' : "onReGenerationKey",
			'click #useApiBtnWrap button' : "onChangeApiUse",
			'click #fieldParamAllCheck' : "onFieldParamAllCheck",
			'click [name="cidCheckbox"]' : "onFieldParamCheck",
			"click #btn-confirm" : "onSave",
			"click #btn-cancel" : "onCancel",
			"click #btn-gosettinghome" : "gosettinghome",
			"click #btn-goapphome" : "goapphome",
			'click #goAppHomeNav' : "goapphome"
		},

		initialize: function(options) {
			options = options || {};
			this.layoutView = WorksHomeLayout.create();
			if(options.hasOwnProperty('appletId')) {
				this.model = new OpenApiModel({"appletId": options.appletId});
				this.config = new AppletBaseConfigModel({"id": options.appletId});
				this.fields = new Fields([], {appletId: options.appletId, includeProperty: true});
				this.model.on('invalid', this.handleError, this);
			}
		},

		handleError: function(model, errors) {
			if (_.isArray(errors)) {
				_.each(errors, function(error) {
					if (error.name == "fieldParam" && error.item) {
						var $paramEl = $("#param" + error.cid);
						$.goError(lang[error.message], $paramEl.parent());
						if($paramEl) {
							$paramEl.addClass('error');
						}
					}
				});
			} else {
				$.goError(lang[errors.message]);
			}
		},

		render: function() {
			return when.all([renderLayout.call(this), this.fields.fetch()])
				.then(_.bind(fetchConfigModel, this))			
				.then(_.bind(fetchModel, this))
				.then(_.bind(renderMain, this))
				.otherwise(function printError(err) {
	                console.log(err.stack);
	            });
		},

		onGenerationKey: function() {
			this.popupView = $.goPopup({
				pclass: 'layer_normal',
				header: lang['키발급'],
				contents: '<table class="form_type go_form_basic">' +
							'<tr>' +
								'<th><span class="title">'+lang['유효기간']+'</span></th>' +
								'<td>' +
									'<span class="wrap_date">' +
										'<input id="keyExpireDate" class="txt wfix_small txt_mini" type="text" name="keyExpireDate" value="" readonly="readonly">' +
										'<span class="ic ic_calendar"></span>' +
									'</span>' +
								'</td>' +
							'</tr>' +
						 '</table>',
				openCallback: $.proxy(function() {
					this.initDatePicker();
				}, this),
				buttons : [{
					btext: lang["확인"],
					btype: 'confirm',
					callback: $.proxy(function() {
						var self = this;
						var param = {"expireDate": $("#keyExpireDate").val()};
						$.ajax({
							type: "POST",
							dataType: "json",
							url: GO.contextRoot + "api/works/applets/" + this.model.appletId + "/openapi/token",
							data: param,
							success: function(resp) {
								var data = resp.data;
								self.makeApiKeyDesc(data);
							},
							error: function(resp) {
								$.goError(resp.message);
							}
						});
					}, this)
				},
				{
					btext: lang["취소"],
					callback: $.proxy(function() {}, this)
				}]
			});
		},

		makeApiKeyDesc: function(data) {
			var $apiKeyExpireDateDesc = $("#apiKeyExpireDateDesc");
			if (!data.token || data.token.length == 0) {
				$apiKeyExpireDateDesc.removeClass("info").addClass("caution");
				$apiKeyExpireDateDesc.find("span.txt").text(lang['키없음'])
			} else {
				$("#apiKeyInput").val(data.token);
				var description = lang['인증키 유효기간 만료'];
				if(data.valid) {
					description = GO.i18n(lang['인증키 유효기간'], {arg1: data.expireDate, arg2: data.remainingDays});
				}
				$apiKeyExpireDateDesc.removeClass("caution").addClass("info");
				$apiKeyExpireDateDesc.find("span.txt").text(description)
			}
		},

		onReGenerationKey: function() {
			var useApi = $("#useApiOn").hasClass("on");
			if (useApi) {
				$.goConfirm(lang["인증키재발급"], lang["인증키재발급확인"], $.proxy(function() {
					this.onGenerationKey();
				}, this));
			}
		},

		onChangeApiUse: function(e) {
			var btnId = $(e.currentTarget).attr("id");
			if (btnId == "useApiOff") {
				var usingApi = $("#useApiBtnWrap").data("useapi");
				if (usingApi) {
					$.goConfirm(lang["사용여부"], lang["사용안함알림"], $.proxy(function() {
						selectApiUse(e);
					}, this));
				} else {
					selectApiUse(e);
				}
			} else {
				selectApiUse(e);
			}

			function selectApiUse(e) {
				$("#useApiBtnWrap button").removeClass("on");
				$(e.currentTarget).addClass("on");
			}
		},

		onFieldParamAllCheck: function(e) {
			var $fieldParamCheckboxes = $("input[name='cidCheckbox']");
			var isChecked = $(e.currentTarget).is(":checked");
			$fieldParamCheckboxes.attr("checked", isChecked);
		},

		onFieldParamCheck: function() {
			this.fieldParamCheck();
		},

		fieldParamCheck: function() {
			var totalCheckboxCount = $("input[name='cidCheckbox']").length;
			var checkedCheckboxCount = $("input[name='cidCheckbox']:checked").length;
			var $fieldParamAllCheck = $("#fieldParamAllCheck");
			if (totalCheckboxCount > 0 && totalCheckboxCount == checkedCheckboxCount) {
				$fieldParamAllCheck.attr("checked", true);
			} else {
				$fieldParamAllCheck.attr("checked", false);
			}
		},

		initDatePicker: function() {
			var $datePicker = $("#keyExpireDate");
			$datePicker.val(GO.util.now().add(1, 'months').format("YYYY-MM-DD"));
			$datePicker.datepicker({
				dateFormat: "yy-mm-dd",
				changeMonth: true,
				changeYear: true,
				yearSuffix: "",
				minDate: "+1d"
			});
		},

		getSupportFields: function() {
			var fields = this.fields.getOpenApiFields();
			var supportFields = fields.toJSON();
			_.each(supportFields, function(field) {
				field.fieldName = lang[field.fieldType];
			});
			return supportFields;
		},

		settingConfigValue: function(model) {
			var apiKeyDescData = {"valid": model.validKey, "token": model.apiKey,
				"expireDate": model.expireDate, "remainingDays": model.remainingDays};
			this.makeApiKeyDesc(apiKeyDescData);

			_.each(model.fieldParamMap, function(value, key) {
				$("#check"+key).attr("checked", true);
				$("#param"+key).val(value);
			});

			if (model.useUpdate) {
				$("#updateFieldSelect").val(model.updateFieidCid);
			}
		},
        
		onSave : function(e) {
			e.preventDefault();
			this.model.set({'appletId': this.model.appletId});
			this.model.set({'useApi': $('#useApiOn').hasClass("on")});
			this.model.set({'apiKey': $('#apiKeyInput').val()});
			var fieldParam = {};
			$("#fieldParamTbody tr").each(function(index) {
				var $checkbox = $(this).find("input[name='cidCheckbox']");
				if(($checkbox).is(":checked")) {
					fieldParam[$checkbox.val()] = $.trim($(this).find("input[name='paramName']").val());
				}
			});
			this.model.set({'fieldParamMap': fieldParam});
			this.model.set({'useUpdate': $('#useApiUpdateOn').is(":checked")});
			this.model.set({'updateFieidCid': $('#updateFieldSelect').val()});

			if (!this.validateForm()) {
				return;
			}

			this.model.save({},{
				success:function() {
					$.goMessage(commonLang["저장되었습니다."]);
				},
				error:function(model,resp) {
					$.goError(resp.responseJSON.message);
				}
			});
		},

		validateForm : function() {
			WorksUtil.errorDescRemover({targets: [this.$('input[name="paramName"]')]}, this);
			return this.model.isValid();
		},

		onCancel : function(e){
			var self = this;
			e.preventDefault();
			$.goConfirm(commonLang['취소하시겠습니까?'],
				commonLang['입력하신 정보가 초기화됩니다.'],
				function() {
					renderMain.call(self);
				}
			);
		},
		
		gosettinghome : function(){
			WorksUtil.goSettingHome(this.model.appletId);
		},
		
		goapphome : function(){
			WorksUtil.goAppHome(this.model.appletId);
		},
	});
	
    function renderMain(){
    	var self = this;
		WorksUtil.checkAppManager(this.config.get('admins'));
		var supportFields = this.getSupportFields();
		var modelJson = this.model.toJSON();
		var isModify = modelJson.id && modelJson.id > 0;
		this.$el.html(OpenApiManagerTpl({
			lang: lang,
			model: modelJson,
			config: this.config.toJSON(),
			supportFields: supportFields,
			hasSupportFields: supportFields.length > 0,
			isModify: isModify
		}));

		this.settingConfigValue(modelJson);
		this.fieldParamCheck();

	    var contentTopView = new ManageContentTopView({
            baseConfigModel: self.config,
            pageName: lang['외부 데이터 가져오기'],
            useActionButton: true,
            infoDesc: lang['외부 데이터 가져오기 설명']
        });
	    contentTopView.setElement(this.$('#worksContentTop'));
	    contentTopView.render();

        return this;
    }
    
	function renderLayout(){
		return when(this.layoutView.render())
		.then(this.layoutView.setContent(this));
	}
	
	function fetchConfigModel(){
		var defer = when.defer();
		this.config.fetch({
			success : defer.resolve,
			error : defer.reject
		});
		return defer.promise;
	}
    
	function fetchModel(){
		var defer = when.defer();
		this.model.fetch({
			success : defer.resolve,
			error : defer.reject
		});
		return defer.promise;
	}
});
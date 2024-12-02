define('admin/views/loginout_config', function (required) {
	var $ = require("jquery");
	var Backbone = require("backbone");
	var App = require("app");
	var configTmpl = require("hgn!admin/templates/loginout_config");
	var adminLang = require("i18n!admin/nls/admin");
	var commonLang = require("i18n!nls/commons");

	require("jquery.go-popup");
	require("jquery.go-sdk");
	require("jquery.go-validation");

	var tmplVal = {
			label_id: commonLang["이메일"],
			label_use: adminLang["사용함"],
			label_notuse: commonLang["사용하지 않음"],
			label_config: adminLang["로그인 설정"],
			label_loginout_config: adminLang["로그인 / 로그아웃 환경"],
			label_mode: adminLang["로그인 방법"],
			label_employeenum: adminLang["인식번호(사번/학번)"],
			label_ok: commonLang["저장"],
			label_cancel: commonLang["취소"],
			label_concurrent_ok: adminLang["동시접속 허용"],
			label_concurrent_no: adminLang["동시접속 제한"],
			label_fail: commonLang["실패"],
			label_key_length8: adminLang["키는 8자리여야합니다."],
			label_key_length16: adminLang["키는 16자리여야합니다."],
			label_sso_title: adminLang["통합 로그인 (SSO) 기능"],
			label_sso_setting: adminLang["통합 로그인 설정"],
			label_use_notuse: adminLang["사용여부"],
			label_method: adminLang["연동 방식"],
			label_cookie: adminLang["쿠키"],
			label_param: adminLang["파라미터"],
			label_sso_key: adminLang["연동 키"],
			label_id: adminLang["아이디"],
			label_empno: adminLang["인식번호(사번/학번)"],
			label_cryptoAlgorithm: adminLang["암호화 방식"],
			label_select_none: adminLang["사용 안함"],
			label_cryptoAlgorithm_test: adminLang["암호화 테스트"],
			label_btn_test: adminLang["테스트"],
			label_aes: adminLang["AES"],
			label_des: adminLang["DES"],
			label_desede: adminLang["DESede"],
			label_blowfish: adminLang["Blowfish"],
			label_twofish: adminLang["Twofish"],
			label_aria: adminLang["ARIA"],
			label_fail_test: adminLang["암호화 테스트에 실패하였습니다."],
			label_test_wods: adminLang["테스트 문장을 입력해 주세요."],
			label_encoding: adminLang["암호화 결과"],
			label_decoding: adminLang["복호화 결과"],
			label_auto_logout: adminLang["자동 로그아웃"],
			label_mins: adminLang["분"],
			label_time_out_direct: adminLang["직접 입력"]
	};
	var LoginoutConfig = App.BaseView.extend({

		el : '#loginOutConfig',

		events : {
			"click span#loginConfigSaveBtn" : "loginoutConfigSave",
			"click span#loginConfigCancelBtn" : "loginoutConfigCancel",
			"click div#loginoutConfigTmpl input:radio" :  "toggleRadio",
			"click select#cryptoAlgorithm" :  "selectcryptoAlgorithm",
			"click span#btn_test" : "testSso",
			"click select#autoLogoutTime" :  "changeTimeOutMins"
		},

		initialize: function() {
			this.model = new Backbone.Model();
			this.model.url = "/ad/api/loginoutconfig";
			this.model.fetch({async : false});

			this.ssoModel = new Backbone.Model();
			this.ssoModel.url = "/ad/api/sso/config";
			this.ssoModel.fetch({async : false});
		},

		toggleRadio : function(e) {
			if($(e.currentTarget).attr('value') == "true"){
				if($(e.currentTarget).is(':radio[name="loginUrlAutoChange"]')){
					$('#preLoginUrl').attr('disabled', false);
					$('#postLoginUrl').attr('disabled', false);
				}else if($(e.currentTarget).is(':radio[name="afterLogoutMove"]')){
					$('#logoutUrl').attr('disabled', false);
				}else if($(e.currentTarget).is(':radio[name="apply"]')){
					$('.sso-content').show();
					$('input:radio[name="method"]').attr('disabled',false);
					$('input:radio[name="ssoKey"]').attr('disabled',false);
					$('#cryptoAlgorithm').attr('disabled',false);
					if($('#cryptoAlgorithm').attr("value")!="NONE"){
						$('#cryptoKey').attr('disabled',false);
						$('#testValue').attr('disabled',false);
						$('#encodingValue').attr('disabled',false);
						$('#decodingValue').attr('disabled',false);
						this.$el.on("click", "span#btn_test", $.proxy(this.testSso, this));
					}
				}else if($(e.currentTarget).is(':radio[name="autoLogout"]')){
					$('#autoLogoutTime').show();
					this.changeTimeOutMins();
				}
			} else if($(e.currentTarget).attr('value') == "false"){
				if($(e.currentTarget).is(':radio[name="loginUrlAutoChange"]')){
					$('#preLoginUrl').attr('disabled', true);
					$('#preLoginUrl').val('');
					$('#postLoginUrl').attr('disabled', true);
					$('#postLoginUrl').val('');
				}else if($(e.currentTarget).is(':radio[name="afterLogoutMove"]')){
					$('#logoutUrl').attr('disabled', true);
					$('#logoutUrl').val('');
				}else if($(e.currentTarget).is(':radio[name="apply"]')){
					$('.sso-content').hide();
					$('input:radio[name="method"]').attr('disabled',true);
					$('input:radio[name="ssoKey"]').attr('disabled',true);
					$('#cryptoAlgorithm').attr('disabled',true);
					$('#cryptoKey').attr('disabled',true);
					$('#testValue').attr('disabled',true);
					$('#encodingValue').attr('disabled',true);
					$('#decodingValue').attr('disabled',true);
					this.$el.off("click", "span#btn_test");
				}else if($(e.currentTarget).is(':radio[name="autoLogout"]')){
					$('#autoLogoutTime').hide();
					$('#timeOutDirect').hide();
				}
			}
		},
		changeTimeOutMins : function(e) {
			if($('select#autoLogoutTime option:selected').val() == -1){
				$('#timeOutDirect').show();
			}else{
				$('#timeOutDirect').hide();
			}
		},
		render : function() {
			var self = this;
			this.$el.empty();
			var tmpl = configTmpl({
				lang: tmplVal,
				model : this.model.toJSON(),
				ssoModel: this.ssoModel.toJSON(),
				sessionTimeOutMins: [
								{"value": "5"}, {"value": "15"}, {"value": "30"}, {"value": "60"}
							]
			});
			this.$el.html(tmpl);
			//self.$el.find('#loginMode').val(self.model.get('loginMode'));
			self.$el.find('#autoLogoutTime').val(self.model.get('autoLogoutTime'));
			self.$el.find('#cryptoAlgorithm').val(self.ssoModel.get('cryptoAlgorithm'));

			if(self.ssoModel.get('cryptoAlgorithm') == "NONE"){
				$('input:radio[name="cryptoKey"]').attr('disabled',true);
				$('#cryptoKey').attr('disabled',true);
				$('#testValue').attr('disabled',true);
				$('#encodingValue').attr('disabled',true);
				$('#decodingValue').attr('disabled',true);
				this.$el.off("click", "span#btn_test");
			}
			if(self.ssoModel.get('cryptoAlgorithm') == "cryptoAlgorithm"){
				$('#cryptoKey').attr('disabled',true);
			}
			self.$el.find('#method_'+self.ssoModel.get('method')).attr('checked',true);
			self.$el.find('#ssoKey_'+self.ssoModel.get('ssoKey')).attr('checked',true);

			if(!self.ssoModel.get('apply')){
				$('.sso-content').hide();
				$('input:radio[name="method"]').attr('disabled',true);
				$('input:radio[name="ssoKey"]').attr('disabled',true);
				$('#cryptoAlgorithm').attr('disabled',true);
				$('#cryptoKey').attr('disabled',true);
				$('#testValue').attr('disabled',true);
				$('#encodingValue').attr('disabled',true);
				$('#decodingValue').attr('disabled',true);
				this.$el.off("click", "span#btn_test");
			}
			var autoLogoutTime = self.model.get('autoLogoutTime');
			if(autoLogoutTime != "5" && autoLogoutTime != "15" && autoLogoutTime != "30" && autoLogoutTime != "60"){
				$('#autoLogoutTime option[value="-1"]').attr('selected','selected');
				$('#timeOutDirectValue').attr('value', autoLogoutTime);
				$('#timeOutDirect').show();
			}else{
				$('#timeOutDirect').hide();
			}
			if(!self.model.get('autoLogout')){
				$('#autoLogoutTime').hide();
				$('#timeOutDirect').hide();
			}

			if(GO.session().serviceAdminMode) {
				$('#divSsoConfig').hide();
			}

			// validator
			this._validateLengthEncryptionKey();

			return this.$el;
		},

		_validateLengthEncryptionKey : function() {
			var self = this;

			$('#cryptoAlgorithm').on("propertychange change", function() {
				self._checkLengthEncryptionKey();
			});
			$('#cryptoKey').on('propertychange change keyup paste input', function() {
				self._checkLengthEncryptionKey();
			});
		},

		_checkLengthEncryptionKey : function() {
			var self = this,
				tcryptoAlgorithm = $('#cryptoAlgorithm').attr('value'),
				currentVal = $('#cryptoKey').val();

			$('#cryptoKeyValidate').show();
			if(tcryptoAlgorithm == "DES" && currentVal.length != 8){
				self.showValidateMsg("cryptoKey", adminLang["키는 8자리여야합니다."]);
				return;
			} else if(!(tcryptoAlgorithm == "DES") && currentVal.length != 16) {
				self.showValidateMsg("cryptoKey", adminLang["키는 16자리여야합니다."]);
				return;
			} else {
				$('#cryptoKeyValidate').hide();
			}
		},

		selectcryptoAlgorithm : function(e) {
			e.stopPropagation();
			if($('#cryptoAlgorithm').attr("value") == "NONE") {
				$('#cryptoKey').attr('disabled',true);
				$('#testValue').attr('disabled',true);
				$('#encodingValue').attr('disabled',true);
				$('#decodingValue').attr('disabled',true);
				this.$el.off("click", "span#btn_test");
			} else {
				$('#cryptoKey').attr('disabled',false);
				$('#testValue').attr('disabled',false);
				$('#encodingValue').attr('disabled',false);
				$('#decodingValue').attr('disabled',false);
				this.$el.on("click", "span#btn_test", $.proxy(this.testSso, this));
				this._checkLengthEncryptionKey();
			}
		},
		testSso : function(e) {

			var self = this,
				url = GO.contextRoot + "ad/api/sso/test/encrypt",
				tcryptoAlgorithm = $('#cryptoAlgorithm').attr('value'),
				tcryptoKey = $('#cryptoKey').attr('value'),
				ttestValue = $('#testValue').attr('value');

			if(ttestValue == ""){
				self.showValidateMsg("testValue", adminLang["테스트 문장을 입력해 주세요."]);
				return;
			}

			if(tcryptoAlgorithm == "DES" && tcryptoKey.length != 8){
				self.showValidateMsg("cryptoKey", adminLang["키는 8자리여야합니다."]);
				return;
			}else if(!(tcryptoAlgorithm == "DES") && tcryptoKey.length != 16) {
				self.showValidateMsg("cryptoKey", adminLang["키는 16자리여야합니다."]);
				return;
			}

			var testParams = {
					cryptoAlgorithm : tcryptoAlgorithm,
					cryptoKey : tcryptoKey,
					plainText : ttestValue
				};

			$.go(url, testParams, {
				qryType : 'GET',
				contentType : 'text/plain',
				responseFn : function(response) {
					if(response.code == 200){
						$('#encodingValue').attr('value', response.data.encodingValue);
						$('#decodingValue').attr('value', response.data.decodingValue);
					}
				},
				error: function(response){
					var responseData = JSON.parse(response.responseText);
					$.goMessage(adminLang["암호화 테스트에 실패하였습니다."]);
				}
			});
		},

		showValidateMsg : function(targetId, msg) {
			$('#' + targetId).focus();
			$('#' + targetId + 'Validate').html(msg);
		},


		loginoutConfigSave: function(e){
			e.stopPropagation();

			var self = this,
				form = this.$el.find('form[name=formLoginoutConfig]'),
				ssoForm = this.$el.find('form[name=formSsoConfig]'),
				validate = true;
			$.each(form.serializeArray(), function(k,v) {
				if(v.name == "autoLogoutTime" && v.value ==-1){
					if($('input:radio[name="autoLogout"]:checked').val() == 'true'){
						if($('#timeOutDirectValue').val() == "" || $('#timeOutDirectValue').val() == null){
							self.showValidateMsg("timeOutDirectValue", adminLang["자동 로그아웃 시간을 입력해주세요."]);
							validate = false;
							return false;
						}
						var directValue = $('#timeOutDirectValue').val();
						if(!$.goValidation.isNumber(directValue)){
							self.showValidateMsg("timeOutDirectValue", adminLang["숫자를 입력해주세요."]);
							validate = false;
							return false;
						}

						if(directValue < 1 || directValue > 7200){
							self.showValidateMsg("timeOutDirectValue", App.i18n(adminLang["입력값은 0~0이어야 합니다."], {"arg1":"1","arg2":"7200"}));
							validate = false;
							return false;
						}
					}
					v.value = $('#timeOutDirectValue').val();
				}
				self.model.set(v.name, v.value, {silent: true});
			});

			if(!validate) return false;

			var tcryptoAlgorithm = "";

			$.each(ssoForm.serializeArray(), function(k,v) {

				if(v.name == "cryptoAlgorithm"){
					tcryptoAlgorithm = v.value;
				}

				if(v.name == "cryptoKey" && tcryptoAlgorithm == "DES" && v.value.length != 8){
					self.showValidateMsg("cryptoKey", adminLang["키는 8자리여야합니다."]);
					validate = false;
					return false;
				}else if(v.name == "cryptoKey" && !(tcryptoAlgorithm == "DES") && v.value.length != 16) {
					self.showValidateMsg("cryptoKey", adminLang["키는 16자리여야합니다."]);
					validate = false;
					return false;
				}

				self.ssoModel.set(v.name, v.value, {silent: true});
			});
			if(!validate){
				return false;
			}

			GO.util.preloader(self.model.save({}, {
				type : 'PUT',
				success : function(model, response) {
					if(response.code == '200') {
						self.ssoModel.save({}, {
							type : 'PUT',
							success : function(ssoModel, response) {
								if(response.code == '200') {
									$.goMessage(commonLang["저장되었습니다."]);
								}
							},
							error : function(ssoModel, response) {
								self._errorFunction(response);
								var responseData = JSON.parse(response.responseText);
							}
						});
					}
				},
				error : function(model, response) {
					self._errorFunction(response);
				}
			}));

		},
		_errorFunction : function(response){
			var responseData = JSON.parse(response.responseText);
			if(responseData != null){
				$.goAlert(tmplVal['label_fail'],responseData.message);
			}else{
				$.goMessage(commonLang["실패했습니다."]);
			}
		},
		_errorMessage : function(id, message){
			$('#'+id).focus();
			$.goAlert(tmplVal['label_fail'],message);
		},
		loginoutConfigCancel: function(e){
			e.stopPropagation();

			var self = this;
			$.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function() {
				self.render();
				$.goMessage(commonLang["취소되었습니다."]);
			}, commonLang["확인"]);
		}
	}, {
		__instance__: null
	});

	return LoginoutConfig;
});

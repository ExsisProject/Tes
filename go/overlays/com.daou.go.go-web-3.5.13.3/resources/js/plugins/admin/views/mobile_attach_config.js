define(function(require){
	var App = require("app");
	var commonLang = require("i18n!nls/commons");
	var adminLang = require("i18n!admin/nls/admin");
	var mobileAttachConfigTmpl = require("hgn!admin/templates/mobile_attach_config");
	var MobileConfig = require("models/mobile_config");
	
	var tmpVal = {
		label_ok: commonLang["저장"],
        label_cancel: commonLang["취소"],
        label_not_use: adminLang["사용안함"],
        label_use: commonLang["사용"],
        label_attachment_download: adminLang["첨부파일 다운로드"],
        label_mobile_attach_config: adminLang["모바일 첨부파일 설정"],
        label_pc_attach_config: adminLang["PC메신저 첨부파일 설정"],
        file_preview: adminLang["첨부파일 미리보기"],
        label_chat_exclude_file: adminLang["대화 업로드 불가 파일"],
        label_chat_upload_size_limit : adminLang["대화 업로드 용량 제한"],
        label_common_config : adminLang["공통 설정"],
        label_desc: adminLang["업로드 제한"],
        label_mb: adminLang["MB"],
		label_non_limit: adminLang["제한없음"],
		label_limit_size: adminLang["용량제한"],
		label_under: adminLang["이하"],
		label_attach_limit_desc: adminLang["파일1개"],
	}
	
	var MobileAttachConfigView = Backbone.View.extend({
		events : {
			"click span#btn_ok": "_mobileAttachConfigSave",
            "click span#btn_cancel": "_mobileAttachConfigCancel",
 			"click span.btn_box[data-btntype='changeform']": "_changeExcludeExtensionInput",
 			"click #size_false" : "_hideSizeLimitForm",
 			"click #size_true" : "_showSizeLimitForm",
 			"keyup span#maxAttachSize input" : "_keyUpMaxAttachSize",
 			
 			"keyup span#pcExcludeExtension input":"_keyUpExcludeExtension",
 			"keyup span#mobileExcludeExtension input":"_keyUpExcludeExtension"
		},
		
		initialize : function() {
			this.mobileConfigModel = new MobileConfig({
                adminContext: true
            });
			this.mobileConfigModel.fetch({async:false});
			
			this.chatConfigModel = new Backbone.Model();
			this.chatConfigModel.url = "/ad/api/chatconfig";
			this.chatConfigModel.fetch({async:false});
			
		},
		
		render : function() {
			var self = this;
			var data = {"mobileConfig":{},"chatConfig":{}};
			data.mobileConfig = this.mobileConfigModel.toJSON();
			data.chatConfig = this.chatConfigModel.toJSON();
			
			this.$el.html(mobileAttachConfigTmpl({
				lang: tmpVal,
                model: data,
				hasMobileExcludeExtension : function(){
					return (data.mobileConfig.excludeExtension == null || data.mobileConfig.excludeExtension == "") ? false : true;
				},
				hasPcExcludeExtension : function() {
					return (data.chatConfig.excludeExtension == null || data.chatConfig.excludeExtension == "") ? false : true;
				}
            }));
			
			if(!this.chatConfigModel.get('attachSizeLimit')){
				self._hideSizeLimitForm();
			}
		},
		
		_mobileAttachConfigSave : function(e) {
			e.stopPropagation();
			
            var self = this;
            var mobileAttachConfigData = {
                useMobilePreview : $("form[name='formMobileAttachConfig'] input[name='mobilePreviewOption']:checked").val(),
                useMobileSecurity : $("form[name='formMobileAttachConfig'] input[name='mobileSecurityOption']:checked").val(),
                excludeExtension : self._getExcludeExtension("mobileExcludeExtension")
            };
            var chatConfigData = {
        		attachSizeLimit : $("form[name='formCommonConfig'] input[name='attachSizeLimit']:checked").val(),
        		maxAttachSize : self._getMaxAttachSize(),
        		excludeExtension : self._getExcludeExtension("pcExcludeExtension")
            };
            
            self.mobileConfigModel.save(mobileAttachConfigData, {
                success: function (model, response) {
                    self.chatConfigModel.save(chatConfigData, {
                    		success : function(model, response){
                    			$.goMessage(commonLang["저장되었습니다."]);
        						self.render();
                    		},
                    		error : function(model, response) {
            					var responseData = JSON.parse(response.responseText);
            					if(responseData.message != null){
            						$.goMessage(responseData.message);
            					}else{
            						$.goMessage(commonLang["실패했습니다."]);
            					}
            				}
                    });
                },
                error: function (model, response) {
                    var responseData = JSON.parse(response.responseText);
                    if (responseData.message != null) {
                        $.goMessage(responseData.message);
                    } else {
                        $.goMessage(commonLang["실패했습니다."]);
                    }
                }
            });
		},
		
		_getExcludeExtension : function(type){
			if(type == 'mobileExcludeExtension'){
				return $('#mobileExcludeExtension span[id=mobileData]').text()!="" ? 
						$('#mobileExcludeExtension span[id=mobileData]').text() :
						$("form[name='formMobileAttachConfig'] input[name='mobileExcludeExtension']").val();
			} else if (type == 'pcExcludeExtension'){
				return $('#pcExcludeExtension span[id=pcData]').text()!="" ? 
						$('#pcExcludeExtension span[id=pcData]').text() :
						$("form[name='formPcAttachConfig'] input[name='pcExcludeExtension']").val();
			} else{
				return "";
			}
		},
		
		_getMaxAttachSize : function() {
			var maxAttachSize = $("form[name='formCommonConfig'] input[name='maxAttachSize']").val();
			if(maxAttachSize != ''){
				return maxAttachSize;
			}else{
				return this.chatConfigModel.get('maxAttachSize');
			}
		},

		_mobileAttachConfigCancel : function(e) {
			e.stopPropagation();

            var self = this;
            $.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function () {
                self.render();
                $.goMessage(commonLang["취소되었습니다."]);
            }, commonLang["확인"]);
		},
		
		_keyUpMaxAttachSize : function(e) {
			if(!e.key.match(new RegExp("^[0-9]$")) && e.keyCode !=8 && e.keyCode != 46){
				$('span#maxAttachSizeAlert').text(adminLang["숫자만 입력하세요."]);
				$("form[name='formCommonConfig'] input[name='maxAttachSize']").val('');
				return;
			}
			
			if(e.currentTarget.value <1 || e.currentTarget.value > 999) {
				$('span#maxAttachSizeAlert').text(adminLang["1~999"]);
				$("form[name='formCommonConfig'] input[name='maxAttachSize']").val('');
				return;
			}
			$('span#maxAttachSizeAlert').text('');
		},
		
		_keyUpExcludeExtension : function(e) {
			var excludeExtensionAlertEl = $('#'+e.currentTarget.name+'Alert');
			
			if(e.currentTarget.value.match(new RegExp("^[a-zA-Z0-9,]*$")) == null){
				excludeExtensionAlertEl.html(adminLang["영어, 쉼표, 숫자만 입력가능"]);
				e.currentTarget.focus();
				e.currentTarget.value = '';
				return false;
			}else{
				excludeExtensionAlertEl.html('');
			}
		},
		
		_showSizeLimitForm : function(e) {
			$('#maxAttachSize').show();
			$('input[name="maxAttachSize"]').focus();
		},
		
		_hideSizeLimitForm : function(e) {
			$('#maxAttachSize').hide();
			$('#maxAttachSizeAlert').html('');
		},
		
		_changeExcludeExtensionInput : function(e) {
			var targetEl = $(e.currentTarget).parent();
			$(e.currentTarget).hide();
			targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '" class="input w_large" value="', targetEl.attr('data-value'), '" />'].join(''))
			.find('input').focusin();
		}
	});
	return MobileAttachConfigView;
});
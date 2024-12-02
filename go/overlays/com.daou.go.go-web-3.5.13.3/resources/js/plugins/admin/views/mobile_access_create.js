define([
        "app",

        "i18n!nls/commons",
	    "i18n!admin/nls/admin",
		
		"hgn!board/templates/board_create_manager",
	    "hgn!admin/templates/mobile_access_create",
		
	    "jquery.go-orgslide",
	    "jquery.go-sdk",
	    "jquery.go-validation"
],
function(
		App,
		commonLang,
		adminLang,
	
		TplBoardCreateManager,
		deviceIdCreateTmpl
) {
	var tmplVal = {
		label_create_tilte : adminLang["모바일 기기 정보"],
		label_deviceid : adminLang["DeviceId"],
		label_account : adminLang["계정"],
		label_account_select : adminLang["계정 선택"],
		label_ok: commonLang["저장"],
		label_cancel: commonLang["취소"]
	};
	
	var MobileAccessManagerView = Backbone.View.extend({
		initialize : function() {
		},
		
		events : {
			"click span#btn_ok" : "_devicdIdVersionSave",
			"click span#btn_cancel" : "_deviceIdVersionCancel",
			"click #selectAccount" : "_addAccount",
			"click span.ic_del" : "_deleteAccount",
			"keyup input#deviceId" : "_validationDeviceId"
		},
		
		render : function() {
			this.$el.html(deviceIdCreateTmpl({
				lang : tmplVal,
			}));
		},
		
		_deleteAccount : function(e) {
			e.stopPropagation();
			
			$(e.currentTarget).parents('li').remove();
		},
		
		_validationDeviceId : function(e) {
			e.stopPropagation();
			if(e.keyCode >= 0 && e.keyCode <= 7 || e.keyCode >= 9 && e.keyCode<= 15 || e.keyCode >= 18 && e.keyCode <= 26 || e.keyCode >= 28 && e.keyCode <= 31 || e.keyCode == 127 || e.keyCode == 220){
				$.goMessage(adminLang["입력할 수 없는 문자"]);
				e.currentTarget.value = '';
				return false;
			}
		},
		
		_devicdIdVersionSave : function(e) {
			e.stopPropagation();
			
			var deviceId = $('#deviceId').val();
			if($.trim(deviceId) == ''){
				$.goMessage(adminLang["DeviceId는 필수"]);
				$('#deviceId').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(1,40,deviceId)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"40"}));
				$('#deviceId').focus();
				return;
			}
			
			if($('#accountList').find('li').length < 2){
				$.goMessage(adminLang["계정 등록 필수"]);
				return;
			}
			
			var userId = $('#accountList').find('li[data-id]').attr('data-id');
			var url = GO.contextRoot + "ad/api//mobile/access";
			var data = {
					userId : userId,
					deviceId : deviceId
			};
			$.go(url, JSON.stringify(data), {
				qryType : 'POST',					
				contentType : 'application/json',
				responseFn : function(response) {
					if(response.code == 200) {
						App.router.navigate('mobile', true);
					}
				},
				error : function(response){
				var responseData = JSON.parse(response.responseText);
				var message = responseData.message,
					responseName = responseData.name;
					if(responseName == 'over.deviceid.count'){
						$.goAlert(message);
					}else if(responseName == 'invalid.deviceid.format'){
						$.goAlert(message);
						$('#deviceId').focus();
					}
					else{
						$.goMessage(commonLang["실패했습니다."]);
					}
                }
			});
		
		},
		_deviceIdVersionCancel : function(e) {
			e.stopPropagation();
			
			App.router.navigate('mobile', true);
		},
		_addAccount : function(e) {
			e.stopPropagation();
			
			var _this = this;
			var popupEl = $.goOrgSlide({
				header : adminLang['조직도'],
				desc : '',
				callback : _this._setAccount,
				target : e,
				isAdmin : true,
				contextRoot : GO.contextRoot
			});
		},
		_setAccount : function(managers){
			var targetEl = $('#accountList');
			if(targetEl.children().length >= 2){
				$.goAlert(adminLang["계정등록수제한"]);
			}else if(managers && !targetEl.find('li[data-id="'+managers.id+'"]').length) {
				targetEl.find('li.creat').before(TplBoardCreateManager($.extend(managers, { lang : tmplVal })));
			}
		}
	}, {
		attachTo: function(targetEl) {
			var contentView = new MobileAccessManagerView();
			
			targetEl
				.empty()
				.append(contentView.el);
			
			contentView.render();
			
			return contentView;
		}
	});
	
	return MobileAccessManagerView;
});
define([
	"jquery",
	"backbone", 	
	"app",
	
	"admin/models/install_info",
    "hgn!system/templates/domain_create",
    "hgn!system/templates/domain_modify",
    
    "system/models/mailDomainModel",
    "system/models/licenseModel",
    "system/models/installInfoModel",
    
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    
    "jquery.go-orgslide",
    "jquery.go-sdk",
    "jquery.go-validation",
    "swfupload",
	"swfupload.plugin"
], 

function(
	$, 
	Backbone,
	App,
	
	InstallInfoModel,
	domainCreateTmpl,
	domainModifyTmpl,
	
	MailDomainModel,
	LicenseModel,
	InstallInfoModel,
	
	commonLang,
	adminLang
) {
	var tmplVal = {
			label_domain_info : adminLang["도메인 기본정보"],
			label_domain : adminLang["도메인 명"],
			label_add : commonLang["추가"],
			label_delete : commonLang["삭제"],
			label_virtual_domain : adminLang["가상도메인"],
			label_modify : commonLang["수정"],
			label_cancel : commonLang["취소"],
			label_save : commonLang["저장"],
			//label_site_url : adminLang["도메인 웹 주소"],
			//label_siteUrl_desc : adminLang["사이트 웹 주소 도움말"],
			label_user_virtual_domain : adminLang['사용자 별 가상도메인'],
			label_mode: adminLang["로그인 방법"],
			label_id: adminLang["아이디"],
			label_employeenum: adminLang["인식번호(사번/학번)"],
			label_prev : commonLang["이전"],
			label_save_next : adminLang["저장 후 다음"],
			label_domain_name_help : adminLang["도메인 명 설명"],
			label_web_address_help : adminLang["웹주소 설명"],
			label_virtual_domain_help : adminLang["가상 도메인 설명"],
			label_user_virtual_domain_help : adminLang["사용자별 가상 도메인 설명"]
		};
	var instance = null;
	var domainCreate = App.BaseView.extend({
		initialize : function(options) {
			this.options = options || {};
			this.domainId = this.options.domainId;
			this.modUserCount = 0;
			this.licenseModel = LicenseModel.read();
			this.installInfoModel = InstallInfoModel.read();
			this.unbindEvent();
			this.bindEvent();
		},				
		unbindEvent : function() {
			this.$el.off("click", "#btn_ok");
			this.$el.off("click", "#btn_modify");
			this.$el.off("click", "#btn_cancel");
			this.$el.off("click", "span#btn_add_virtualDomain");
			this.$el.off("click", "span#btn_add_user_virtualDomain");
			this.$el.off("click", "span#btn_delete_virtualDomain");
			this.$el.off("click", "span#btn_delete_user_virtualDomain");
			this.$el.off("click", "span.editable");
			this.$el.off("keyup", "#mailDomain");
		},
		bindEvent : function() {
			this.$el.on("click", "#btn_ok", $.proxy(this.domainSave, this));
			this.$el.on("click", "#btn_modify", $.proxy(this.domainModify, this));
			this.$el.on("click", "#btn_cancel", $.proxy(this.domainCancel, this));
			this.$el.on("click", "span#btn_add_virtualDomain", $.proxy(this.addVirtualDomain, this));
			this.$el.on("click", "span#btn_add_user_virtualDomain", $.proxy(this.addUserVirtualDomain, this));
			this.$el.on("click", "span#btn_delete_virtualDomain", $.proxy(this.deleteVirtualDomains, this));
			this.$el.on("click", "span#btn_delete_user_virtualDomain", $.proxy(this.deleteUserVirtualDomains, this));
			this.$el.on("click", "span.editable", $.proxy(this.changeInput, this));
			this.$el.on("keyup", "#mailDomain", $.proxy(this.avilableMailDomain, this));
		},
		render : function() {
			var tmpl;
			var installInfo = this.installInfoModel.toJSON();
			var canSelectEmpNoLoginMode = this._canSelectEmpNoLoginMode();
			this.$el.empty();
			if(this.domainId){
				this.mailDomainModel = MailDomainModel.get(this.domainId);
				this.domainData = this.mailDomainModel.toJSON();
				$('.breadcrumb .path').html(adminLang["도메인/사이트 관리 > 도메인 수정"]);
				tmpl = domainModifyTmpl({
					domainInfo : this.domainData,
					lang : tmplVal,
					isInstalled : installInfo.installed,
					canSelectEmpNoLoginMode : canSelectEmpNoLoginMode,
				});
				this.$el.html(tmpl);
				this.setDomainModifyData(this.domainData);
			}else{
				if(installInfo.installedDomainSeq != null && (installInfo.installState == "site" || installInfo.installState == "domain")){
					App.router.navigate('domain/modify/' + installInfo.installedDomainSeq, {trigger: true,replace: true});
				}
				$('.breadcrumb .path').html(adminLang["도메인/사이트 관리 > 도메인 추가"]);
				tmpl = domainCreateTmpl({
					lang : tmplVal,
					isInstalled : installInfo.installed,
					canSelectEmpNoLoginMode: canSelectEmpNoLoginMode,
				});	
				this.$el.html(tmpl);
			}
			if(!installInfo.installed){
				this.setDominMultiBox("virtualDomains");
				this.setDominMultiBox("userVirtualDomains");
			}
		},
		setDomainModifyData: function(data){
			this.$el.find('#loginMode').val(data.loginMode);
			var virtualDomains = data.virtualDomains;
			var userVirtualDomains = data.userVirtualDomains;
			for(var i=0;i<virtualDomains.length;i++){
				$('#virtualDomains').append('<OPTION value="'+virtualDomains[i]+'">'+virtualDomains[i]+'</OPTION>');
			}
			for(var i=0;i<userVirtualDomains.length;i++){
				$('#userVirtualDomains').append('<OPTION value="'+userVirtualDomains[i]+'">'+userVirtualDomains[i]+'</OPTION>');
			}
		},
		setDominMultiBox : function(boxId){
			if($('#'+boxId+' > option').length > 0){
				$('#'+boxId).show();
			}else{
				$('#'+boxId).hide();
			}
		},
		changeInput : function(e){
			e.stopPropagation();
			
            var $toggleEl = $(e.target),
                hideTarget;
            
            if($toggleEl.hasClass("ic_edit")){
                hideTarget = $toggleEl.parent().parent();
                hideTarget.hide();
                hideTarget.next().show();
            }else{
                $toggleEl.hide();
                $toggleEl.next().show();
            }
        },
        makeConfirmMsg : function(message, callback, cancelCallback){
        	$.goConfirm(message, "", callback, commonLang['확인'], cancelCallback);
        },
		avilableMailDomain : function(e){
			e.stopPropagation();
			
			if(!this.chackAddedDomains($('#mailDomain').val().toLowerCase(), true)){
				this.showValidateMsg("mailDomain", adminLang["동일한 도메인이 존재합니다."]);
			}
		},
		addVirtualDomain : function(e){
			e.stopPropagation();
			
			var addVirtualDomain = $('#addVirtualDomain').attr('value').toLowerCase();
			var installInfo = this.installInfoModel.toJSON();
			$('#virtualDomains > option').attr('selected',false);
			this.validateVirtualDomains(addVirtualDomain, "addVirtualDomain", "virtualDomains");
			if(!installInfo.installed){
				this.setDominMultiBox('virtualDomains');
			}
		},
		addUserVirtualDomain : function(e){
			e.stopPropagation();
			
			var addUserVirtualDomain = $('#addUserVirtualDomain').attr('value').toLowerCase();
			var installInfo = this.installInfoModel.toJSON();
			$('#userVirtualDomains > option').attr('selected',false);
			this.validateVirtualDomains(addUserVirtualDomain, "addUserVirtualDomain", "userVirtualDomains");
			if(!installInfo.installed){
				this.setDominMultiBox('userVirtualDomains');
			}
		},
		validateVirtualDomains : function(value, name, multiBox){
			
			var self = this,
			validate = true;
			
			if(value == ""){
				self.showValidateMsg(name, adminLang["가상도메인을 입력하세요."]);
				return;
			}
				
			if((!$.goValidation.isCheckLength(1,128,value))){
				self.showValidateMsg(name, adminLang["가상도메인의 형식이 잘못되었습니다."]);
				return;
			}
			
			if(!$.goValidation.isValidDomain(value)){
				self.showValidateMsg(name, adminLang["가상도메인의 형식이 잘못되었습니다."]);
				return;
			}
			
			$('#'+multiBox+' option').each(function(){
				if($(this).val() == value){
					self.showValidateMsg(name, adminLang["이미 존재하는 가상 도메인 입니다."]);
					$(this).attr('selected', true);
					validate = false;
					return false;
				}
			});
			
			if(!this.chackAddedDomains(value, false)){
				self.showValidateMsg(name, adminLang["이미 존재하는 가상 도메인 입니다."]);
				return;
			}
			
			var isDuplicated = this.checkDuplicated(value, "");
			if(isDuplicated){
				self.showValidateMsg(name, adminLang["이미 존재하는 가상 도메인 입니다."]);
				$('#'+name+'').focus();
				return false;
			}
			
			if(validate == true){
				$('#'+multiBox+'').append('<OPTION value="'+value+'">'+value+'</OPTION>');
				$('#'+name+'').val("");
			}
		},
		deleteVirtualDomains : function(e){
			e.stopPropagation();
			
			var virtualDomains = document.formDomainConfig.virtualDomains;
			for(var i = 0; i < virtualDomains.options.length;){		
				if(virtualDomains.options[i].selected){
					if(this.isErasableVirtualDomain(virtualDomains.options[i].value)){
						virtualDomains.removeChild(virtualDomains.options[i]);
					}else{
						$.goAlert(adminLang['가상도메인 삭제 못함'], "", "");
						break;
					}
				} else {
					i++;
				}
			}
		},
		deleteUserVirtualDomains : function(e){
			e.stopPropagation();
			
			var userVirtualDomains = document.formDomainConfig.userVirtualDomains;
			for(var i = 0; i < userVirtualDomains.options.length;){		
				if(userVirtualDomains.options[i].selected){
					if(this.isErasableUserVirtualDomain(userVirtualDomains.options[i].value)){
						userVirtualDomains.removeChild(userVirtualDomains.options[i]);
					}else{
						$.goAlert(adminLang['가상도메인 삭제 못함'], "", "");
						break;
					}
				} else {
					i++;
				}
			}
		},
		checkValidation : function(form, mode) {
			var self = this, 
				excludeDomain = "",
				validate = true;
			
			if(mode == "mod") {
				excludeDomain = this.domainData.mailDomain;
			}
			$.each(form.serializeArray(), function(k,v) {
				if(v.name == 'mailDomain' && (!$.goValidation.isCheckLength(1,128,v.value))){
					self.showValidateMsg(v.name, adminLang["도메인 명을 입력하세요."]);
					validate = false;
					return false;
				}else if(v.name == 'mailDomain' && !$.goValidation.isValidDomain(v.value)){
					self.showValidateMsg(v.name, adminLang["도메인 형식이 잘못되었습니다."]);
					validate = false;
					return false;
				}else if(v.name == 'mailDomain' && self.checkDuplicated(v.value, excludeDomain)){
					self.showValidateMsg(v.name, adminLang["동일한 도메인이 존재합니다."]);
					validate = false;
					return false;
				}
				
				/*if(v.name == 'siteUrl' && (!$.goValidation.isCheckLength(1,128,v.value))){
					self.showValidateMsg(v.name, adminLang["사이트 웹 주소를 입력하세요."]);
					validate = false;
					return false;
				}else if(v.name == 'siteUrl' && !$.goValidation.charValidation("\\",v.value)){
					self.showValidateMsg(v.name, adminLang["입력할 수 없는 문자"]);
					validate = false;
					return false;
				}else if(v.name == 'siteUrl' && v.value.match(/http:\/\//)){
					self.showValidateMsg(v.name, adminLang["http://는 입력할 수 없습니다."]);
					validate = false;
					return false;
				}*/
				
			});
			if(!validate){
				return false;
			}else{
				return true;
			}
			
		},
		makeModel : function(form, model) {
			model.set("virtualDomains", [], {silent: true});
			model.set("userVirtualDomains", [], {silent: true});

			$.each(form.serializeArray(), function(k,v) {
				if(v.name == "mailDomain"){
					v.value = $('#mailDomain').val().toLowerCase();
				}
				if(v.name == "virtualDomains"){
					v.value = $('#virtualDomains').val();
				}
				
				if(v.name == "userVirtualDomains"){
					v.value = $('#userVirtualDomains').val();
				}
				
				if(v.name == "loginMode"){
					v.value = $('#loginMode option:checked').val();
				}
				model.set(v.name, v.value, {silent: true});
				
			});
			
			
			return model;
		},
		domainSave : function(e) {
			e.stopPropagation();
			
			var installInfo = this.installInfoModel.toJSON();
			$('.go_alert').empty();
			this.model = MailDomainModel.create();
			this.model.clear();
			var self = this,
				validate = true,
				form = this.$el.find('form[name=formDomainConfig]');
			
			$('#virtualDomains > option').attr('selected','selected');
			$('#userVirtualDomains > option').attr('selected','selected');
			
			validate = self.checkValidation(form, "new");
			if(!validate){
				return false;
			}
			this.model = this.makeModel(form, this.model);
			GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
			this.model.save({}, {
				type : 'POST',
				success : function(model, response) {
					if(response.code == '200') {
						$.goMessage(commonLang["저장되었습니다."]);
						if(!installInfo.installed){
							self.changeInstallState();
							App.router.navigate('site/create', {trigger: true});
						}else{
							App.router.navigate('system/domain', {trigger: true});
						}
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					}
				},
				error : function(model, response) {
					var responseData = JSON.parse(response.responseText);
					$.goMessage(responseData.message);
					$('#WEBMAIL').attr('disabled', true);
					GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
				}
			});
		},
		domainModify: function(e) {
			e.stopPropagation();
			
			var installInfo = this.installInfoModel.toJSON();
			$('.go_alert').empty();
			var self = this,
				validate = true,
				form = this.$el.find('form[name=formDomainConfig]'),
				url = GO.contextRoot + "ad/api/system/domain/"+this.domainId;
			
			$('#virtualDomains > option').attr('selected','selected');
			$('#userVirtualDomains > option').attr('selected','selected');
			
			validate = self.checkValidation(form, "mod");
			if(!validate){
				return false;
			}
			var params = this.makeModel(form, this.mailDomainModel);
			GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
			$.go(url, JSON.stringify(params), {
				qryType : 'PUT',					
				contentType : 'application/json',
				responseFn : function(response) {
					if(response.code == 200){
						$.goMessage(commonLang["수정되었습니다."]);
						if(!installInfo.installed){
							App.router.navigate('site/create', {trigger: true});
						}else{
							App.router.navigate('system/domain', {trigger: true});
						}
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					}
				},
				error: function(response){
					var responseData = JSON.parse(response.responseText);
					$.goMessage(responseData.message);
					$('#WEBMAIL').attr('disabled', true);
					GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
				}
			});
		},
		domainCancel : function(e) {
			e.stopPropagation();
			this.render();
		},
		checkDuplicated : function(domain, exclude) {
			var url = GO.contextRoot + "ad/api/system/domain/duplicated";
			var isDuplicated = true;
			var param = {
						domain : domain,
						exclude : exclude
					};
		
			$.go(url, param, {
				qryType : 'GET',
				async : false,
				responseFn : function(response) {
					if(response.code == 200 && response.data.duplicated){
						this.showValidateMsg("mailDomain", adminLang["동일한 도메인이 존재합니다."]);
						isDuplicated = true;
					}else{
						isDuplicated = false;
					}
					
				},
				error: function(response){
					var responseData = JSON.parse(response.responseText);
					$.goMessage(responseData.message);
				}
			});
			return isDuplicated;
		},
		changeInstallState : function() {
			var url = GO.contextRoot + "ad/api/system/change/state/site";
			$.go(url, "", {
				qryType : 'GET',
				responseFn : function(response) {
					
				},
				error: function(response){
				}
			});
		},
		isErasableUserVirtualDomain : function(deleteVirtualId){
			if(this.domainId == "") return true;
			var result;
			var url = GO.contextRoot + "ad/api/system/uservirtualdomain";
			var param = {
					domainId : this.domainId,
					deleteVirtualId : deleteVirtualId
				};
			$.go(url,param, {
				qryType : 'GET',
				async : false,
				responseFn : function(response) {
					if(response.code == 200){
						result = response.data;
					}
				},
				error: function(response){
					result = false;
				}
			});
			return result;
		},
		isErasableVirtualDomain : function(deleteVirtualId){
			if(this.domainId == "" || this.domainId == undefined) return true;
			var result;
			var url = GO.contextRoot + "ad/api/system/virtualdomain";
			var param = {
					domainId : this.domainId,
					deleteVirtualId : deleteVirtualId
				};
			$.go(url,param, {
				qryType : 'GET',
				async : false,
				responseFn : function(response) {
					if(response.code == 200){
						result = response.data;
					}
				},
				error: function(response){
					var responseData = JSON.parse(response.responseText);
					$.goMessage(responseData.message);
				}
			});
			return result;
		},
		showValidateMsg : function(targetId, msg) {
			$('#' + targetId).focus();
			$('#' + targetId + 'Validate').html(msg);
		},
		chackAddedDomains : function(checkDomain, isMailDomain){
			var domains = [];
			var checkOk = true;
			if(!isMailDomain){
				var defaultDomain = $('#mailDomain').val().toLowerCase();
				domains.push(defaultDomain);
			}
			
			$.each($('#virtualDomains option'), function(i){
				domains.push($(this).val());
			});
			$.each($('#userVirtualDomains option'), function(i){
				domains.push($(this).val());
			});
			
			$.each(domains, function(i){
				if(domains[i] == checkDomain){
					checkOk = false;
				}
			});
			return checkOk;
		},
		_canSelectEmpNoLoginMode : function(){
			var canSelectEmpNoLoginMode = true;
			$.ajax({
				type : "GET",
				async : false,
				dataType : "json",
				url : GO.contextRoot + "ad/api/system/domain/setting",
				success : function(resp) {
					if(resp.code == 200){
						canSelectEmpNoLoginMode = resp.data == "off";
					}
				},
				error : function(resp) {
					$.goError(resp.responseJSON.message);
				}
			});
			
			return canSelectEmpNoLoginMode;
		},
	},{
		create: function(opt) {
			instance = new domainCreate({el : opt.el ? opt.el : '#layoutContent',domainId:opt ? opt.domainId : ''});
			instance.domainId = opt ? opt.domainId : '';
			return instance.render();
		}
	});
	
	return {
		render: function(opt) {
			var layout = domainCreate.create(opt);
			return layout;
		}
	};
});

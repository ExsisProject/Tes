
(function() {
    define([
            "jquery",
            "backbone",
            "app",
            "views/layouts/admin_default",
            
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "i18n!approval/nls/approval",
            
            "admin/views/account/account_form",
            "admin/views/account/account_detail_appr_absence",
            
            "hgn!admin/templates/account_detail",
            "hgn!admin/templates/account_detail_appr_absence_list",
            "admin/models/base_model",
            
            "admin/models/mail_domain_group",
            "hgn!admin/templates/_add_sender_email"
            ],
   function(
       $,
       BackBone,
       App,
       Layout,
       
       CommonLang,
       AdminLang,
       ApprovalLang,

       AccountForm,
       ApprAbsenceSetting,
       
       DetailTmpl,
       AbsenceListTmpl,
       AccountMailInfo,
       
       MailDomainGroup,
       _addSenderEmail
   ) {
        var ApprInfoModel = Backbone.Model.extend({
            urlRoot: GO.contextRoot+"ad/api/user/apprinfo"
        });
        

        var AvailableMailModel = Backbone.Collection.extend({
            url : function(){
                return App.contextRoot + "ad/api/user/available/emails/" + this.userId
            },
            
            setUserId : function(userId){
                this.userId = userId;
            }
        });
        
        var __super__ = AccountForm.prototype;
        var approvalDelDeputies = [];
        
        var AccountDetail = AccountForm.extend({
            passwordValidation : false,
            status : {
                "online" : "0",
                "wait" : "1",
                "stop" : "2",
                "delete" : "3"
            },
            type : function(){
                return _.extend({}, __super__.type, {
                    title : AdminLang["계정 목록"] + " > " + AdminLang["계정 상세"],
                    return_list : AdminLang["목록으로 돌아가기"],
                    confirm: CommonLang["확인"],
                    last_login: AdminLang["최종 로그인"],
                    modify : CommonLang["수정"],
                    status_close : AdminLang["중지하기"],
                    status_nomal : AdminLang["정상으로 복구하기"],
                    alertStatusClose: AdminLang["계정을 중지하면..."],
                    mail_store_path : AdminLang["메일 저장소 경로"],
                    sender_mail_address : AdminLang["보내는 메일 주소 표시"],
                    grade: AdminLang["직급"],
                    webmail: AdminLang["WEBMAIL"],
                    imap: AdminLang["IMAP"],
                    pop: AdminLang["POP"],
                    approval_date: ApprovalLang["결재일"],
                    dont_change_status : AdminLang["상태 변경이 불가능합니다. 라이선스 계정수를 확인하세요."],
                    multi_lang : AdminLang["다국어"],
                    open : CommonLang["열기"],
                    fixed_ip:AdminLang['근태관리 접속인증 IP'],
                    "부재위임설정" : AdminLang["부재위임설정"],
                    "부재추가" : AdminLang["부재추가"],
                    "부재기간" : AdminLang["부재기간"],
                    "대결자" : ApprovalLang["대결자"],
                    "부재사유" : AdminLang["부재사유"],
                    "사용여부" : AdminLang["사용여부"],
                    "삭제" : CommonLang["삭제"],
                    "멤버사진 일괄등록" : AdminLang["멤버사진 일괄등록"],
                    forwarding_tooltip : AdminLang["전달 툴팁"],
                });
            }(),
            ids : [],
            
            initialize : function(options){
                console.info("AccountDetail call !!!!");
                __super__.initialize.call(this, options);
                Layout.render();
                _.extend(this.options, options || {});
                this.accountId = this.options.userId;
                this.mailInfo = new AccountMailInfo({
                	id : this.accountId,
                	urlRoot : GO.contextRoot + "ad/api/user/mailinfo"
                });
                this.mailInfo.fetch({async : false});
                
                this.updateMode(this.mailInfo);
                this.mailDomainGroup = MailDomainGroup.read(this.mailInfo.get("mailGroup"));
                
                var systemInfo = new Backbone.Model();
                systemInfo.url = GO.contextRoot + "ad/api/systeminfo"; 
                systemInfo.fetch({async : false});
                this.systemInfo = systemInfo.toJSON();
                
                this.systemMailSetting = new Backbone.Model();
                this.systemMailSetting.url = GO.contextRoot + "ad/api/mailsetting";
                this.systemMailSetting.fetch({async : false});
                
                this.companyMailService = new Backbone.Model();
                this.companyMailService.url = GO.contextRoot + "ad/api/company/mailservice";
                this.companyMailService.fetch({async : false});
                
                var mailDomainConfigModel = new Backbone.Model();
                mailDomainConfigModel.url = GO.contextRoot + "ad/api/siteconfig"; 
                mailDomainConfigModel.fetch({async : false});
                this.mailDomainConfigModel = mailDomainConfigModel.toJSON();
                
            },
            
            addSenderEmail : function(event){
                var parentTd = $(event.target).parents("td");
                var emailEl = parentTd.find("#availableEmails");
                var nameEl = parentTd.find("input:text.name");
                var listEl = parentTd.find("#mailSenderListTbody");
                var emailSelectedEl = parentTd.find("#availableEmails option:selected");
                
                if(!$.goValidation.isValidChar($.trim(nameEl.val()))){
                    $.goMessage(CommonLang["사용할 수 없는 문자입니다."]);
                    $(nameEl).focus();
                    return;
                }
                
                if($.trim(nameEl.val()) == ""){
                    $.goMessage(AdminLang["이름을 입력하세요."]);
                    $(nameEl).focus();
                    return;
                }
                
                if($.trim(emailEl.val()) == ""){
                    $.goMessage(AdminLang['추가할 이메일을 입력하세요.']);
                    $(emailEl).focus();
                    return;
                }
                
                if($.goValidation.isInvalidEmail(emailEl.val())){
                    $.goMessage(AdminLang['사용할 수 없는 이메일입니다.']);
                    $(emailEl).focus();
                    return;
                }
                
                var senderEmails = [];
                
                listEl.find("span.senderItem").each(function(){
                    var senderEmail = GO.util.get_email($(this).data("email"));
                    senderEmails.push(senderEmail);
                });
                
                if(senderEmails.indexOf(emailEl.val()) >= 0){
                    $.goMessage(AdminLang['이미 사용중인 이메일입니다.']);
                    return;
                }
                
                var options = {
                    emailInfo : "\"" + nameEl.val() + "\"" + " <" + emailEl.val() + ">",
                    alias: emailSelectedEl.attr('userType') == 'AliasUser',
                    type : this.type
                };
                
                $(listEl.append(_addSenderEmail(options)));
            },
            removeSenderEmail : function(e){
                var currentEl = $(e.currentTarget);
                var parentEl = currentEl.closest("tr");
                if(parentEl.find("input:radio").prop("checked")){
                    // 선택된 이메일이 삭제될 경우 기본 값으로 셋팅
                    this.$el.find("#mailSenderListTbody").find("input:radio:first").prop("checked", true);
                }
                
                currentEl.closest("tr").remove();
            },
            toggleSenderEmail : function(e){
                var $currentEl = $(e.currentTarget);
                var isOn = false;
                var selectedVal = $currentEl.val();
                
                if(selectedVal == ""){
                    isOn = $currentEl.closest("span").find("#groupMailSenderMode").data("use") == "on" ? true : false;
                }else if(selectedVal == "on"){
                    isOn = true;
                }else{  // off
                    isOn = false;
                }
                
                var $mailSenderList = this.$el.find("#mailSenderList");
                
                if(isOn){
                    $mailSenderList.show();
                }else{
                    $mailSenderList.hide();
                }
                
            },
            toggleMultiLang : function() {
                var $targetBtn = this.$el.find("span#btnMultiLang i");
                if($targetBtn.hasClass('ic_accordion_s')) {
                    $targetBtn.removeClass('ic_accordion_s').addClass('ic_accordion_c').attr('title', CommonLang["닫기"]);
                    this.$el.find('tr[id$="NameInput"]').show();
                } else {
                    $targetBtn.removeClass('ic_accordion_c').addClass('ic_accordion_s').attr('title', this.type.open);
                    this.$el.find('tr[id$="NameInput"]').hide();
                }
            },
            goToBatchRegisterLink : function() {
                $.goPopup({
                    width : 500,
                    title : "",
                    pclass : "layer_confim",
                    contents : "<p class='q'>" + GO.i18n(AdminLang['메뉴로 이동하시겠습니까'], {"menuName":AdminLang['일괄 등록']}) + "</p>",
                    buttons : [{
                        btext : CommonLang["확인"],
                        btype : "confirm",
                        autoclose : true,
                        callback : function() {
                            GO.router.navigate("account/batch/regist/member_picture", true);
                        }
                    }, {
                        btext : CommonLang["취소"]
                    }]
                })
            },
            __getUserMainInfo : function(){
                var url = GO.config('mailRoot') + 'api/readUserApi.jsp?';
                
                $.go(url, '', {
                    qryType : 'GET',
                    async : false,
                    contentType : 'application/json',
                    responseFn : $.proxy(function(response) {
                        location.href = GO.contextRoot + "admin/accounts";
                    },this),
                    error : function(error){
                        $.goAlert(self.type.error);
                    }
                });
            },
            statusOnline : function(){
                this.__changeStatus(this.status["online"]);
            },
            __changeStatus : function(status){
                var url = GO.contextRoot + "ad/api/user/status",
                    params = { ids : [this.accountId], id : status },
                    self = this;
                
                $.go(url, JSON.stringify(params), {
                    qryType : 'PUT',
                    async : false,
                    contentType : 'application/json',
                    responseFn : $.proxy(function(response) {
                        location.href = GO.contextRoot + "admin/accounts";
                    },this),
                    error : function(error){
                        $.goAlert(self.type.error);
                    }
                });
            },
            toggle : function(e){
                var $toggleEl = $(e.target),
                    hideTarget;
                var value = $.trim($(e.currentTarget).text());
                var parentEl = $(e.currentTarget).parents('td');
                if(parentEl.find('span.textarea')){
                    parentEl.find('span.textarea').show().find('textarea').text(value).focus();
                }
                
                if($toggleEl.hasClass("password")){
                    $("#password").show();
                    $("#password_confirm").show();
                    $toggleEl.parents("tr").hide();
                    this.passwordValidation = true;
                }else if($toggleEl.hasClass("appr_password")){
                    $toggleEl.parents("td").find("span.user_data").toggle();
                    this.apprPasswordValidation = true;
                }else if($toggleEl.hasClass("ic_edit")){
                    hideTarget = $toggleEl.parent().parent();
                    hideTarget.hide();
                    hideTarget.next().show();
                }else{
                    $toggleEl.hide();
                    $toggleEl.next().show();
                }
            },
            save: function (callback) {
                var self = this;
                try {
                    this.isFormInvalid({password : this.passwordValidation, apprPassword : this.apprPasswordValidation});
                    var accountInfoModel = this.accountBuilder();
                    if(!accountInfoModel) {
                        return;
                    }
                    this.mailInfo.attributes = $.extend({}, this.mailInfo.attributes, accountInfoModel);
                    this.mailInfo.set({delGroups : {ids : this.deleteGroupIds}});
                }catch (e){
                    return console.log("accountBuilder Error :: " + e);
                }
                
                GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
                
                this.mailInfo.save(null,{
                    success:function(){
                        $.goMessage(self.type.saveSuccess);
                        callback();
                    },error:function(model, error){
                         __super__.errorMessage(error);
                         GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    }
                }).done(function(){
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                });
            },
            saveAction : function(){
                this.save($.proxy(this.reload, this, this.accountId));
            },
            cancel : function(){
                this.goList();
            },
            returnList : function(){
                this.goList();
            },
            reload : function( accountId ) {
            	var url = "account/" + accountId;
            	GO.router.navigate(url, {trigger: true});
            },
            render : function() { 
            	var profileVisibleInfos = this.mailDomainConfigModel.profileVisibleInfos;
            	
                var userInfo = this.mailInfo.toJSON(),
                    positions =  this.positions.toJSON(),
                    grades = this.grades.toJSON(),
                    duties = userInfo.deptMembers,
                    mailGroups = this.mailDomainGroups.toJSON(),
                    mailInfo = this.mailInfo.toJSON(),
                    userVirtualDomains = this.userVirtualDomains.toJSON(),
                    systemMailSetting = this.__setSystemMailSetting(),
                    locale = [
                        {value:"ko", text: this.type.ko}, 
                        {value:"en", text: this.type.en}, 
                        {value:"ja", text: this.type.jp},
                        {value:"zh_CN", text: this.type.zh_cn},
                        {value:"zh_TW", text: this.type.zh_tw},
                        {value:"vi", text: this.type.vi}
                        ],
                    tmpl = "",
                    fullEmail = userInfo.email.split('@'),
                    instalLocale = this.systemInfo.language,
                    self = this;
                
                if(userInfo.lastLoginedAt != undefined){
                    userInfo.lastLoginedAt = GO.util.basicDate(userInfo.lastLoginedAt);
                }
                if(userInfo.lastImapLoginedAt != undefined) {
                	userInfo.lastImapLoginedAt = GO.util.basicDate(userInfo.lastImapLoginedAt);
                }
                if(userInfo.lastPopLoginedAt != undefined) {
                	userInfo.lastPopLoginedAt = GO.util.basicDate(userInfo.lastPopLoginedAt);
                }
                
                if(userInfo.status == "online"){
                    userInfo["isOnline?"] = true;
                }else if(userInfo.status == "stop"){
                    userInfo["isStop?"] = true;
                }else if(userInfo.status == "dormant"){
                    userInfo["isDormant?"] = true;
                }else{
                    userInfo["isOnline?"] = true;
                }
                
                this.__setPosition(userInfo.positionId, positions);
                this.__setGrade(userInfo.gradeId, grades);
                this.__setDuty(duties);
                this.__setLocale(locale);
                this.__setTimeZone();
                this.__setMailGroup(mailGroups);
                this.__setMailInfo(mailInfo);
                
                if(userInfo.birthday != undefined && userInfo.birthday.length > 0){
                    userInfo["birthdayText"] = App.util.shortDate(userInfo.birthday);
                }
                
                if(userInfo.anniversary != undefined && userInfo.anniversary.length > 0){
                    userInfo["anniversaryText"] = App.util.shortDate(userInfo.anniversary);
                }
                if(userInfo.memo){
                    var val = userInfo.memo;
                    if(typeof val === 'string' && !val) {
                        userInfo.memo = null;
                    } else {
                        val = val.replace(/(\n)/gi, "<br>");   val = val.replace(/ /gi, "&nbsp;");
                        userInfo.memo = val;
                    }
                }
                if(userInfo.selfInfo){
                    var val = userInfo.selfInfo;
                    if(typeof val === 'string' && !val) {
                        userInfo.selfInfo = null;
                    } else {
                        val = val.replace(/(\n)/gi, "<br>");   val = val.replace(/ /gi, "&nbsp;");
                        userInfo.selfInfo = val;
                    }
                }
                
                var availableMailModel = new AvailableMailModel();
                availableMailModel.setUserId(this.accountId);
                availableMailModel.fetch({async : false});

                var tmpl = DetailTmpl({
                        type: this.type,
                        locales : locale,
                        timeZone : this.timeZone,
                        members : userInfo.deptMembers,
                        groups : userInfo.groupMembers,
                        mailGroup : mailGroups,
                        userInfo : userInfo,
                        positions : positions,
                        grades : grades,
                        email : fullEmail[0],
                        companyInfo : this.companyInfo,
                        mailInfo : mailInfo,
                        addAlternateEmail : this._addAlternateEmail,
                        instalLocale : instalLocale,
                        isJpInstall : instalLocale == 'ja',
                        systemMailSetting : systemMailSetting,
                        isOrgServiceOn : GO.util.isUseOrgService(true),
                        hasApproval : this.hasApproval,
                        userVirtualDomains : userVirtualDomains,
                        isKoLocale : instalLocale == 'ko',
                        isEnLocale : instalLocale == 'en',
                        isJpLocale : instalLocale == 'ja',
    					isZhcnLocale : instalLocale == 'zhcn',
    					isZhtwLocale : instalLocale == 'zhtw',
                        isViLocale : instalLocale == 'vi',
    					additions :userInfo.additions,
    					availableMail : availableMailModel.toJSON(),
                        profileExposures: userInfo.profileExposureInfoModel,
                        profileVisibleInfos : profileVisibleInfos
                    });
                this.$el.html(tmpl);
                this.enableDeptMembersDraggable();

                this.datePickerInit();
                this.initProfileUpload();
                if(this.hasApproval){
                    this.initApprovalUpload();
                    
                    var apprInfoModel = new ApprInfoModel();
                    apprInfoModel.set("id", this.accountId,{silent:true});
                    apprInfoModel.fetch({
                        async : true,
                        success : function(model){
                            self.setApprovalConfig(model.toJSON());
                            self._renderApprAbsenceList(model.attributes.approvalDeputies);
                        }
                    });
                }
                this.inheritMailGroupConfig(this.mailDomainGroup.toJSON());
                this.inheritDomainMailServiceConfig(this.companyMailService.toJSON());
                this.setMailServiceCheckbox(this.mailInfo.attributes, function (targetEl, isUsed) {
                    if (!targetEl.prop("disabled")) {
                        targetEl.prop("checked", isUsed);
                    }
                });
                if(this.mailDomainConfigModel.otpService == 'on'){
           		   $('tr#otp').show();
           	   	}
                if(this.mailDomainConfigModel.useAbbroadIpCheck == 'on'){
            	   $('tr#useAbbroadIpCheck').show();
            	}
                this.changeRepresentationEmail();
                this.$el.find('#repUserEmail').val(mailInfo.repUserEmail);
                this.setRepEmailMsg(mailInfo.repUserEmail);
                if(mailInfo.maxSendMailCountUse != "on"){
                	$("#maxSendMailCount").hide();
                }
                this.__deleteSendAllowGroupList(this.mailDomainGroup.toJSON().sendAllowList);
                this.customFieldRender(this.mailInfo);
                this.setBirthday(userInfo.birthdayText);
                
                return this;
            },
            
            _renderApprAbsenceList: function(list){
            	if(list.length == 0){
            		$("#apprAbsenceList").html('<tr><td valign="top" colspan="5" class="dataTables_empty align_c"><p class="data_null"> <span class="ic_data_type ic_no_data"></span><span class="txt">'+ AdminLang["등록된 설정이 없습니다"] +'</span></p></tr></td>');
            	}else{
            		$("#apprAbsenceList").find('.data_null').remove();
            		_.each(list, function(model){
                		$("#apprAbsenceList").append(AbsenceListTmpl({
                			model:model,
                			startAt: model.startAt.slice(0,10),
                			endAt: model.endAt.slice(0,10),
                			useFlag: (model.useFlag) ? ApprovalLang["사용"] : ApprovalLang["미사용"]
                		}));
                	});
            	}
            },
            
            _getApprAbsenceList: function(){
            	var self = this;
            	if(this.hasApproval){
                    var apprInfoModel = new ApprInfoModel();
                    apprInfoModel.set("id", self.accountId,{silent:true});
                    apprInfoModel.fetch({
                        async : true,
                        success : function(model){
                        	$("#apprAbsenceList").html('');
                            self._renderApprAbsenceList(model.attributes.approvalDeputies);
                        },error:function(model, error){
                            __super__.errorMessage(error);
                        }
                    });
                }
            },
            
            formSubmit : function(e) {
                e.preventDefault();
                return;
            },
            delegateEvents: function(events) {
                this.undelegateEvents();
                AccountForm.prototype.delegateEvents.call(this, events);
                this.$el.on("click.account", "#saveAction", $.proxy(this.saveAction, this));
                this.$el.on("click.account", "#cancel", $.proxy(this.cancel, this));
                this.$el.on("click.account", "span.editable", $.proxy(this.toggle, this));
                this.$el.on("click.account", "span.settingAbsence", $.proxy(this.settingAbsence, this));
                this.$el.on("click.account", "span.absence_delete", $.proxy(this.absenceDelete, this));
                this.$el.on("click.account", "#statusOnline", $.proxy(this.statusOnline, this));
                this.$el.on("click.account", "#statusClose", $.proxy(this.statusClose, this));
                this.$el.on("click.account", "#returnList", $.proxy(this.returnList, this));
                this.$el.on("click.account", "#addMailSenderEmail", $.proxy(this.addSenderEmail, this));
                this.$el.on("click.account", "span.sender_remove", $.proxy(this.removeSenderEmail, this));
                this.$el.on("click.account", "span#btnMultiLang", $.proxy(this.toggleMultiLang, this));
                this.$el.on("click.account", "span#goToBatchRegisterLink", $.proxy(this.goToBatchRegisterLink, this))
                this.$el.on("change.account", "#mailSenderMode input:radio[name='mailSenderUse']", $.proxy(this.toggleSenderEmail, this));
                this.$el.on("submit", "form", $.proxy(this.formSubmit, this));
                
                return this;
            }, 
            undelegateEvents: function() {
                AccountForm.prototype.undelegateEvents.call(this);
                this.$el.off("submit", "form");
                this.$el.off(".account");
                return this;
            },             
            updateMode : function(data){
                var jsonData = data.toJSON();
                this.isDuplicateEmail = false;
                this.isinvalidEmailFormat = false;
                if(jsonData.loginId != "") this.isDuplicateLoginId = false; 
                if(jsonData.employeeNumber != "") this.isDuplicateEmployeeNo = false; 
            },
            statusClose : function(){
                $.goConfirm(
                    "", 
                    this.type.alertStatusClose, 
                    $.proxy(function(){
                        this.__changeStatus(this.status["stop"]);
                    }, this)
                );
            },
            __getUserMainInfo : function(){
                var url = GO.config('mailRoot') + 'api/readUserApi.jsp?';
                
                $.go(url, '', {
                    qryType : 'GET',
                    async : false,
                    contentType : 'application/json',
                    responseFn : $.proxy(function(response) {
                        location.href = GO.contextRoot + "admin/accounts";
                    },this),
                    error : function(error){
                        $.goAlert(self.type.error);
                    }
                });
            },
            statusOnline : function(){
                this.__changeStatus(this.status["online"]);
            },
            __changeStatus : function(status){
                var url = GO.contextRoot + "ad/api/user/status",
                    params = { ids : [this.accountId], id : status },
                    self = this;
                
                $.go(url, JSON.stringify(params), {
                    qryType : 'PUT',
                    async : false,
                    contentType : 'application/json',
                    responseFn : $.proxy(function(response) {
                        location.href = GO.contextRoot + "admin/accounts";
                    },this),
                    error : function(error){
                        $.goAlert(self.type.error);
                    }
                });
            },
            toggle : function(e){
                var $toggleEl = $(e.target),
                    hideTarget;
                var value = $.trim($(e.currentTarget).text());
                var parentEl = $(e.currentTarget).parents('td');
                if(parentEl.find('span.textarea')){
                    parentEl.find('span.textarea').show().find('textarea').text(value).focus();
                }
                
                if($toggleEl.hasClass("password")){
                    $("#password").show();
                    $("#password_confirm").show();
                    $toggleEl.parents("tr").hide();
                    this.passwordValidation = true;
                }else if($toggleEl.hasClass("appr_password")){
                    $toggleEl.parents("td").find("span.user_data").toggle();
                    this.apprPasswordValidation = true;
                }else if($toggleEl.hasClass("ic_edit")){
                    hideTarget = $toggleEl.parent().parent();
                    hideTarget.hide();
                    hideTarget.next().show();
                }else{
                    $toggleEl.hide();
                    $toggleEl.next().show();
                }
            },
            
            settingAbsence : function(e){
            	var $toggleEl = $(e.target);
				if ($toggleEl.hasClass("openSetting")) {
					$toggleEl.parent().html('<span id="absenceSettingBtn" class="btn_s settingAbsence">'+AdminLang["부재추가"]+'</span>');
					this.$el.find("p.go_alert").remove();
				} else {
					new ApprAbsenceSetting({accountId : this.accountId}).render();
				}
            	$toggleEl.toggleClass ("openSetting") ;
            },
            
            absenceDelete : function(e){
            	var $target = $(e.target);
            	approvalDelDeputies.push({id: $($target).attr('data-id')});
            	this.mailInfo.attributes = $.extend(this.mailInfo.attributes, {
            		approvalDelDeputies: approvalDelDeputies
            	});
            	$($target).closest('tr').remove();
            },

            __deleteSendAllowGroupList : function(data){
            	var self = this;
            	$.each(data, $.proxy(function(i, v){
               		if(self.isSavedGroupAllowList(v)){
               			$('#sendAllowModeEmails li input[value="'+v+'"]').parent('li').find('span.ic_delete').hide();
               		}
                }, this));
            },
            __setSystemMailSetting : function() {
            	var mailSetting = this.systemMailSetting.toJSON();
            	var useLimitSendMailSize = mailSetting.limitSendmailSize;
            	if(useLimitSendMailSize == 'on'){
            		return true;
            	}else{
            		return false;
            	}
            },
            datePickerInit : function(){
                var mailExpireDate = $("#mailExpireDate"),
                birthdayDate = $("#birthdayDate"),
                anniversaryDate = $("#anniversaryDate");
               
                $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
                mailExpireDate.datepicker({
                    defaultDate: "+1w",
                    dateFormat : "yymmdd",
                    changeMonth: true,
                    changeYear : true,
                    yearSuffix: "",
                });
                birthdayDate.datepicker({
                    defaultDate: "+1w",
                    dateFormat : "yy-mm-dd",
                    changeMonth: true,
                    changeYear : true,
                    yearSuffix: "",
                 });
                anniversaryDate.datepicker({
                    defaultDate: "+1w",
                    dateFormat : "yy-mm-dd",
                    changeMonth: true,
                    changeYear : true,
                    yearSuffix: "",
                 });
           },
            __setMailGroup: function(mailGroups){
                for(var i = 0 ; i < mailGroups.length; i ++){
                    if(this.mailInfo.get("mailGroup") == mailGroups[i].mailGroup){
                        mailGroups[i]["isMailGroup?"] = true;
                        return;
                    }
                }
            },
            __setPosition : function(positionId, positions){
                for(var i = 0 ; i < positions.length; i ++){
                    if(positionId == positions[i].id){
                        positions[i]["isUserPosition?"] = true;
                        return;
                    }
                }
            },
            __setLocale : function(locale){
                for(var i=0 ; i<locale.length; i++){
                    if(this.mailInfo.get("locale") == locale[i].value){
                        locale[i]["isLocale?"] = true;
                        break;
                    }
                }
            },
            __setGrade : function(gradeId, grades){
                for(var i = 0 ; i < grades.length; i ++){
                    if(gradeId == grades[i].id){
                        grades[i]["isUserGrade?"] = true;
                        break;
                    }
                }
            },
            __setDuty : function(member){
                for(var i=0 ; i < member.length; i++){
                    if(member[i].dutyId != undefined && member[i].dutyId != 0){
                        member[i]["isExistDuty?"] = true;
                    }
                }
            },
            __setTimeZone : function(){
                for(var i=0 ; i<this.timeZone.length; i++){
                    if(this.mailInfo.get("timeZone") == this.timeZone[i].location){
                        this.timeZone[i]["isTimeZone?"] = true;
                    }
                }
            },
            __setMailInfo : function(mailInfo){
            	
                mailInfo["quotaWarningModeHide?"] = false;
                if(mailInfo.quotaWarningMode  == "on"){
                    mailInfo["quotaWarningModeOn?"] = true;
                }else if(mailInfo.quotaWarningMode == "off"){
                	mailInfo["quotaWarningModeHide?"] = true;
                    mailInfo["quotaWarningModeOff?"] = true;
                }else{
                    mailInfo["quotaWarningModeHide?"] = true;
                    mailInfo["quotaWarningModeGroup?"] = true;
                }
                
                mailInfo["violationHide?"] = false;
                if(mailInfo.quotaViolationAction == "return"){
                    mailInfo["ViolationReturn?"] = true;
                }else if(mailInfo.quotaViolationAction == "store"){
                    mailInfo["ViolationStore?"] = true;
                }else{
                    mailInfo["violationHide?"] = true;
                    mailInfo["ViolationGroup?"] = true;
                }
                
                mailInfo["alternateAddress"] = [];
                if(mailInfo.alternateAddr != undefined){
                    for(var i=0; i < mailInfo.alternateAddr.length ; i++){
                        var alternateAddr = {
                                alternateEmailId: mailInfo.alternateAddr[i],
                                domainName :  this.companyInfo.domainName
                        };
                        mailInfo["alternateAddress"].push(alternateAddr);
                    };
                }
                
                mailInfo["alternateUserDomains"] = [];
                if(mailInfo.alternateUserDomain != undefined){
                    for(var i=0; i < mailInfo.alternateUserDomain.length ; i++){
                        var alternateUserDomain = {
                        		alternateUserDomain: mailInfo.alternateUserDomain[i]
                        };
                        mailInfo["alternateUserDomains"].push(alternateUserDomain);
                    };
                }
                
                mailInfo["forwardingAddress"] = [];
                if(mailInfo.forwardingAddr != undefined){
                    for(var i=0; i < mailInfo.forwardingAddr.length ; i++){
                        var forwardingAddr = {
                                forwardingEmailId : mailInfo.forwardingAddr[i].split("@")[0],
                                domainName : (mailInfo.forwardingAddr[i].split("@")[1] == null || mailInfo.forwardingAddr[i].split("@")[1] == undefined) ? this.companyInfo.domainName : mailInfo.forwardingAddr[i].split("@")[1],
                                forwardingEmail : mailInfo.forwardingAddr[i]
                        };
                        mailInfo["forwardingAddress"].push(forwardingAddr);
                    }
                }
                
                if(mailInfo.forwardingUse == "off"){
                	mailInfo["forwardingUse_Off"] = true;
                }else if(mailInfo.forwardingUse == "on"){
                	mailInfo["forwardingUse_On"] = true;
                }else{
                	mailInfo["forwardingUse_Custom"] = true;
                	mailInfo["forwarding?"] = true;
                }
                
                if(mailInfo.forwardingMode == "forwarding"){
                    mailInfo["forwarding?"] = true;
                }else if(mailInfo.forwardingMode == "forwardingonly"){
                    mailInfo["forwardingOnly?"] = true;
                }else{
                	mailInfo["forwardingNone?"] = true;
                }
                
                mailInfo["sendAllowAddress"] = [];
                if(mailInfo.sendAllowAddr != undefined){
                	for(var i=0; i < mailInfo.sendAllowAddr.length; i++) {
                		var sendAllowAddr = {
                			sendAllowEmail : mailInfo.sendAllowAddr[i]
                		};
                		mailInfo["sendAllowAddress"].push(sendAllowAddr);	
                	}
                }
                if(mailInfo.sendAllowMode == undefined || mailInfo.sendAllowMode == "off"){
                	mailInfo["sendAllowMode_Off"] = true;
                }else if(mailInfo.sendAllowMode == "on"){
                	mailInfo["sendAllowMode_On"] = true;
                }else{
                	mailInfo["sendAllowMode_Custom"] = true;
                }
                
                mailInfo["hiddenForwardingAddress"] = [];
                if(mailInfo.hiddenForwardingAddr != undefined){
                    for(var i=0; i < mailInfo.hiddenForwardingAddr.length ; i++){
                        var hiddenForwardingAddr = {
                                hiddenForwardingEmail : mailInfo.hiddenForwardingAddr[i]
                        };
                        mailInfo["hiddenForwardingAddress"].push(hiddenForwardingAddr);
                    }
                }
                
                if(mailInfo.hiddenForwardingMode == undefined || mailInfo.hiddenForwardingMode == "none"|| mailInfo.hiddenForwardingMode == "off"){
                    mailInfo["hiddenForwardingNone?"] = true;
                }
                
                if(mailInfo.maxSendMailCountUse == undefined || mailInfo.maxSendMailCountUse == "off"){
                    mailInfo["maxSendMailCountUseOff"] = true;
                }else if(mailInfo.maxSendMailCountUse == "on"){
                    mailInfo["maxSendMailCountUseOn"] = true;
                }else if(mailInfo.maxSendMailCountUse == "group"){
                    mailInfo["maxSendMailCountUseGroup"] = true;
                }
                
                if(mailInfo.mailSenderUse == "off"){
                    mailInfo["mailSenderOff?"] = true;
                    mailInfo["mailSenderUse?"] = false;
                }else if(mailInfo.mailSenderUse == "on"){
                    mailInfo["mailSenderOn?"] = true;
                    mailInfo["mailSenderUse?"] = true;
                }else if(mailInfo.mailSenderUse == undefined || mailInfo.mailSenderUse == ""){
                    mailInfo["mailSenderGroup?"] = true;
                    if(this.mailDomainGroup.get("mailSenderUse") == "on"){
                        mailInfo["mailSenderUse?"] = true;
                    }else{  // off
                        mailInfo["mailSenderUse?"] = false;
                    }
                }
                
                mailInfo["mailSenderAddress"] = [];
                var existDefaultEmail = false;
                if(mailInfo.mailSenders != undefined){
                    for(var i=0; i < mailInfo.mailSenders.length ; i++){
                        
                        mailInfo["mailSenderAddress"].push({
                        	emailInfo : mailInfo.mailSenders[i].email,
                        	personal : mailInfo.mailSenders[i].personal,
                        	email : mailInfo.mailSenders[i].email,
                        	isLoginEmail : false,
                        	isSelected : mailInfo.mailSenders[i].defaultMail
                        });
                        
                        if(!existDefaultEmail){
                            continue;
                        }
                    }
                }
                
                mailInfo["mailSenderAddress"].splice(0,0, {
                    emailInfo : "\"" + mailInfo.name + "\" <" + mailInfo.email + ">",
                    personal : "",
                    email : "\"" + mailInfo.name + "\" <" + mailInfo.email + ">",
                    isLoginEmail : true,
                    isSelected : existDefaultEmail ? false : true
                });
                
                
                for(var i=0; i < mailInfo.configs.length; i++) {
            		if(mailInfo.configs[i].name == "otpService" && mailInfo.configs[i].value == "true") {
            			mailInfo["isOtpService?"] = true;
            		}else if(mailInfo.configs[i].name == "otpService" && mailInfo.configs[i].value == "false"){
            			mailInfo["isOtpService?"] = false;
            		}else if(mailInfo.configs[i].name == "useAbbroadIpCheck" && mailInfo.configs[i].value == "true"){
            			mailInfo["isUseAbbroadIpCheck?"] = true;
            		}else if(mailInfo.configs[i].name == "useAbbroadIpCheck" && mailInfo.configs[i].value == "false"){
            			mailInfo["isUseAbbroadIpCheck?"] = false;
            		}
            	}                
                this.__setSelectBox("inboxExpireDays", mailInfo);
                this.__setSelectBox("trashExpireDays", mailInfo);
                this.__setSelectBox("spamExpireDays", mailInfo);
            },
            __setSelectBox : function(entityName, mailInfo){
                var days = ["none", "0", "30", "60", "90", "120", "custom"],
                    options = [];
                
                mailInfo[entityName + "Options"] = {};
                mailInfo[entityName + "CustomHide?"] = true;
                
                for(var i = 0 ; i < days.length ; i++){
                    var option = {};
                    
                    if(days[i] == "none"){
                        option["text"] = AdminLang["그룹 설정에 따름"];
                        option["value"] = "none";
                    }else if(days[i] == 0){
                        option["text"] = AdminLang["무제한"];
                        option["value"] = 0;
                    }else if(days[i] == "custom"){
                        option["text"] = AdminLang["직접입력"];
                        option["value"] = "custom";
                    }else{
                        option["text"] = days[i] + AdminLang["일단위"];
                        option["value"] = days[i];
                    }
                    
                    if(i == 0 && mailInfo[entityName] == ""){
                        option["selected?"] = true;
                    }
                    
                    if(days[i] == mailInfo[entityName]){
                        option["selected?"] = true;
                    }
                    
                    if((i == (days.length-1)) && $.inArray(mailInfo[entityName], ["none", "", "0","30","60", "90","120"]) < 0){
                        option["selected?"] = true;
                        mailInfo[entityName + "CustomHide?"] = false;
                    }
                    options.push(option);
                }
                mailInfo[entityName + "Options"] = options;
                if(mailInfo[entityName] == "none"){
	        		mailInfo[entityName] = "";
	        	}
            },
            setRepEmailMsg : function(repEmail){
            	var email = repEmail.split("@");
            	var vDomain = $("#alternateEmails li");
            	$.each(vDomain, function(i){
            		if($(this).find('[name="alternateEmailId"]').val() == email[0]){
            			$(this).append(AdminLang['대표 이메일 주소로 사용중입니다.']);
            			return;
            		}
            	});

            	var uvDomain = $("#userVirtualDomains li");
            	$.each(uvDomain, function(i){
            		if($(this).find('[name="userVirtualDomain"]').val() == email[1]){
            			$(this).append(AdminLang['대표 이메일 주소로 사용중입니다.']);
	            		return;
            		}
            	});
            },
            customFieldRender : function(userInfo){
            	var _this = this;
 				$.go(GO.contextRoot + "ad/api/customprofile/use/config", {}, {
 					qryType : 'GET',
 					async : false,
 					responseFn : function(response) {
 						
 						if(response.data.length == 0){
							$('#customInfo').hide();
							return;
						}
 						
 						var tmp = "";
 						var dateIdList = [];
 						$.each(response.data, function(i, item){
 							var profileValue = userInfo.get(item.profileName) == undefined ? '' : userInfo.get(item.profileName);
 							if(item.dataType == "String"){
 								tmp += '<tr>'+
 					               '<th><span class="title">'+ item.name +'</span></th>'+
 					               '<td>';
 					               
 					               if(userInfo.get(item.profileName) == undefined || userInfo.get(item.profileName) == ""){
 					            	  tmp +='<input class="w200 input" type="text" name="'+item.profileName+'" id="'+item.profileName+'" value="'+ profileValue +'"/></td>';
 					               }else{
 					            	  tmp += '<span class="user_data editable">'+userInfo.get(item.profileName)+'<span class="btn_box"><span class="ic ic_edit" title="'+CommonLang["수정"]+'"></span></span></span>'+
 					            	   '<input class="w200 input" type="text" name="'+item.profileName+'" id="'+item.profileName+'" value="'+profileValue+'" style="display:none;"/></td>';
 					               }
 					              tmp += '</tr>';
 							}else{
 								tmp += '<tr>'+
 								'<th><span class="title">'+ item.name +'</span></th>'+
 								'<td><input class="w200 input" type="text" name="'+item.profileName+'" id="'+item.profileName+'" value="'+profileValue+'"/></td>'+
 								'</tr>';
 								dateIdList.push(item.profileName);
 							}
 						});
 						$('#customInfo table.detail').append(tmp);
 						
 						$.each(dateIdList, function(i, item){
 							$('#'+item).datepicker({
	 							defaultDate: "+1w",
	 							dateFormat : "yy-mm-dd",
	 							changeMonth: true,
	 							changeYear : true,
	 							yearSuffix: "",
	 						});
 						});
 						
 					},
 					error: function(response){
 						var responseData = JSON.parse(response.responseText);
 						$.goMessage(responseData.message);
 					}
 				});
            },

            removeSaveCancelBtn: function() {
                this.$el.find('div.page_action').remove();
            }
        });
        
        return AccountDetail;
    });
}).call(this);


(function() {
    define([
            "jquery",
            "backbone",
            "app",

            "views/layouts/admin_default",

            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "i18n!approval/nls/approval",

            "admin/collections/position_list",
            "admin/collections/grade_list",
            "admin/collections/duty_list",
            "admin/collections/usergroup_list",
            "admin/collections/time_zone",
            "admin/collections/mailgroup_list",
            "admin/collections/user_virtual_domain_list",
            "admin/collections/virtual_domain_list",

            "admin/models/mail_domain_group",
            "models/site_config",

            "hgn!admin/templates/_add_dept_member",
            "hgn!admin/templates/_select_duty",
            "hgn!admin/templates/_user_group_popup",
            "hgn!admin/templates/_add_group_member",
            "hgn!admin/templates/_add_alternate_email",
            "hgn!admin/templates/_add_user_virtual_domain",

            "file_upload",
            "jquery.go-validation",
            "jquery.go-orgslide",
            "jquery.go-popup",
            "jquery.go-sdk"
            ],
    function(
            $,
            BackBone,
            App,

            Layout,

            CommonLang,
            AdminLang,
            ApprovalLang,

            PositionCollection,
            GradeCollection,
            DutyCollection,
            UserGroup,
            TimeZoneModel,
            MailDomainGroups,
            UserVirtualDomains,
            VirtualDomains,

            MailDomainGroup,
            SiteConfigModel,

            _addDeptMemberTmpl,
            _selectDutyTmpl,
            _addUserGroupTmpl,
            _addGroupMember,
            _addAlternateEmail,
            _addUserVirtualDomain,

            FileUpload
        ) {

        var ApprovalSecurityModel = Backbone.Collection.extend({
            url : App.contextRoot + "ad/api/approval/securitylevel"
        });

        var AccountForm = Backbone.View.extend({
            type : {
            	locale_ko: AdminLang["KO"],
            	locale_en : AdminLang["EN"],
            	locale_jp : AdminLang["JP"],
            	locale_zhcn : AdminLang["ZH-CN"],
            	locale_zhtw : AdminLang["ZH-TW"],
                locale_vi : AdminLang["VI"],
                basic_info: AdminLang["기본정보"],
                photo: CommonLang["사진"],
                photo_upload: CommonLang["사진 올리기"],
                photo_profile: AdminLang["프로필 사진"],
                photo_size_info: AdminLang["100x100 사이즈"],
                name: CommonLang["이름"],
                lable_nomal_class: AdminLang["클래스"],
                position : AdminLang["직위"],
                position_select: AdminLang["직위 선택"],
                grade : AdminLang["직급"],
                grade_select: AdminLang["직급 선택"],
                mail: AdminLang["메일그룹"],
                mail_setting : AdminLang["메일그룹 개별설정"],
                dept: AdminLang["부서"],
                duty: AdminLang["직책"],
                duty_select: AdminLang["직책 선택"],
                dept_add: AdminLang["부서 추가"],
                dept_duty_add: AdminLang["부서-직책 추가"],
                user_group: CommonLang["사용자 그룹"],
                join_dept_select: AdminLang["조직도"],
                user_group_add: AdminLang["사용자 그룹 추가"],
                auth_info: AdminLang["인증정보"],
                id: AdminLang["아이디"],
                status : AdminLang["계정 상태"],
                normal : AdminLang["정상"],
                close : AdminLang["중지"],
                dormant : AdminLang["메일 휴면"],
                id_exist: AdminLang["아이디가 중복되었습니다."],
                email_at : AdminLang["@"],
                email_exist: AdminLang["이메일이 중복되었습니다."],
                password: AdminLang["비밀번호"],
                password_confirm: AdminLang["비밀번호 확인"],
                password_not_match: AdminLang["비밀번호 불일치"],
                employee_no: AdminLang["인식번호(사번/학번)"],
                employee_no_exist: AdminLang["사번이 중복되었습니다."],
                timezone: AdminLang["타임존"],
                language: AdminLang["언어"],
                more_info: AdminLang["부가정보"],
                direct_tel: AdminLang["직통전화"],
                phone: AdminLang["핸드폰"],
                representive_tel: AdminLang["대표전화"],
                fax : AdminLang["팩스"],
                selfInfo : AdminLang["자기소개"],
                info_add : AdminLang["항목추가"],
                info_add_select : AdminLang["추가할 항목을 선택하세요."],
                location: AdminLang["위치"],
                homepage: AdminLang["홈페이지"],
                messanger: AdminLang["메신저"],
                birthday: AdminLang["생일"],
                anniversary: AdminLang["기념일"],
                address: AdminLang["주소"],
                memo: AdminLang["메모"],
                self_info: AdminLang["자기소개"],
                job: AdminLang["직무"],               // TODO GO-19528 직무 다국어 스트링 추가
                save_and_continue : AdminLang["저장 후 계속해서 추가"],
                account_add: AdminLang["계정 추가 등록"],
                save: CommonLang["저장"],
                cancel: CommonLang["취소"],
                saveSuccess : CommonLang["저장되었습니다."],
                error : CommonLang["오류"],
                ko : CommonLang["한국어"],
                en : CommonLang["영어"],
                jp : CommonLang["일본어"],
                zh_cn : CommonLang["중국어 간체"],
                zh_tw : CommonLang["중국어 번체"],
                vi : CommonLang["베트남어"],
                addMember : AdminLang["부서 추가"],
                addMemberSelect : AdminLang["부서추가 안내메세지"],
                userGroup : CommonLang["사용자 그룹"],
                addUserGroup : AdminLang["사용자 그룹 추가"],
                duplicateId : AdminLang["아이디가 중복되었습니다."],
                duplicateEmployeeNo : AdminLang["사번이 중복되었습니다."],
                selectDeptError : AdminLang["부서를 선택해 주십시오."],
                confirm : CommonLang["확인"],
                isAlreadyExistMember : AdminLang["이미 소속된 부서입니다."],
                isAlreadyExistGroup : AdminLang["해당 사용자그룹은 이미 추가되어 있습니다."],
                requireData : CommonLang["필수항목을 입력하지 않았습니다."],
                saveFail : CommonLang["저장에 실패 하였습니다."],
                fail_mail_group : AdminLang["메일그룹 API연동 실패"],
                edit_password : AdminLang["비밀번호 변경"],
                approval_date : ApprovalLang["결재일"],
                upload_sign : ApprovalLang["서명 올리기"],
                mail_group_personal_config : AdminLang["메일그룹 개별설정"],
                add_mail_quota : AdminLang["메일함 추가 용량"],
                quota_excess_warning : AdminLang["용량 초과 경고발송"],
                quota_excess_warning_ratio : AdminLang["용량 초과 경고비율"],
                quota_excess_mode : AdminLang["용량 초과시 조치"],
                quota_excess_ratio : AdminLang["용량 초과 허용비율"],
                not_use : AdminLang["사용안함"],
                use : CommonLang["사용"],
                allow_group_config : AdminLang["그룹 설정에 따름"],
                add_webfolder_quota : AdminLang["자료실 추가 용량"],
                mail_service : AdminLang["메일 서비스"],
                default_mailbox_expired : AdminLang["기본메일함 유효기간"],
                trash_expired : AdminLang["휴지통 유효기간"],
                spam_expired : AdminLang["스펨메일함 유효기간"],
                maximum_message_size : AdminLang["송신메일 최대크기"],
                unlimited : AdminLang["무제한"],
                days : AdminLang["일단위"],
                not_select : AdminLang["그룹 설정에 따름"],
                input : AdminLang["직접입력"],
                alias_mail_id : AdminLang["가상 메일 아이디"],
                email_etc_config : AdminLang["부가 기능"],
                forwarding_mode : AdminLang["자동 전달 모드"],
                hidden_forwarding_mode : AdminLang["숨김 전달 모드"],
                save_mail_on_server : AdminLang["서버에 메일 원본 남겨두기"],
                delete_mail_on_server : AdminLang["서버에 메일 원본 삭제하기"],
                return_text : AdminLang["반송"],
                temporary_save : AdminLang["임시저장"],
                add : CommonLang["추가"],
                delete_text : CommonLang["삭제"],
                invalid_email_id : AdminLang['사용할 수 없는 이메일입니다.'],
                mail_expire_date : AdminLang['계정 사용 만료일'],
                user_virtual_domain : AdminLang['사용자 별 가상도메인'],
                mail_sender_mode : AdminLang['보내는 메일 주소 추가'],
                mail_sender_name : AdminLang['보내는 사람 이름'],
                email : CommonLang['이메일'],
                hurigana : AdminLang['이름 후리가나'],
                limit_send : AdminLang['송신제한'],
                no_select : AdminLang['선택안함'],
                apply_otp : AdminLang['OTP 사용 여부'],
                use_abbroad_ip_check : AdminLang["해외 로그인 차단"],
                rep_user_email : AdminLang["대표 이메일 주소"],
                max_send_mail_count : AdminLang["일일 송신 개수 제한"],
                max_trans_number : AdminLang["일일 최대 송신 개수"],
                count : AdminLang["개"],

                approval_info : AdminLang["전자결제 정보"],
                approval_sign_img : AdminLang["서명 이미지"],
                approval_password : AdminLang["결재 비밀번호"],
                approval_password_info : AdminLang["※ 결제 비밀번호를 설정하지 않을 경우, 계정 비밀번호로 적용됩니다."],
                approval_grade : AdminLang["보안등급"],
                modify : CommonLang["변경"],
                change_img : CommonLang["이미지 변경"],
                select : CommonLang["선택"],
                upload_img: CommonLang["이미지 올리기"],
                not_apply: AdminLang["적용하지 않음"],
                dont_change_status : AdminLang["상태 변경이 불가능합니다. 라이선스 계정수를 확인하세요."],
                custom_field_title : AdminLang["선택 정보"],
                sendMailAddrDisplay : AdminLang["보내는 메일 주소 표시"],
                select_desc : CommonLang['선택'],
                lunar_cal_desc : CommonLang['음력선택'],
                year : CommonLang['년'],
        		month : CommonLang['달'],
        		day : CommonLang['날'],
                appr_sign_desc : ApprovalLang['서명은 이미지 크기 안내'],

                id_tooltip : AdminLang["아이디 툴팁"],
                password_tooltip : AdminLang["비밀번호 툴팁"],
                usergroup_tooltip : AdminLang["사용자그룹 툴팁"],
                mailgroup_tooltip : AdminLang["메일그룹 툴팁"]
            },
            isDuplicateLoginId : false,
            isDuplicateEmployeeNo : false,
            isChangeStatus : true,

            initialize : function(options){
                this.options = options || {};
                this.positions = PositionCollection.getCollection();
                this.grades = GradeCollection.getCollection();
                this.duties = DutyCollection.getCollection();
                this.timeZone = $.extend(true, [], TimeZoneModel.read().toJSON());
                this.userGroup = UserGroup.getCollection();
                this.mailDomainGroups = MailDomainGroups.getCollection();
                this.userVirtualDomains = UserVirtualDomains.getCollection();
                this.virtualDomains = VirtualDomains.getCollection();
                this.deleteGroupIds = [];

                var companyInfo = new Backbone.Model();
                companyInfo.url = GO.contextRoot + "ad/api/company";
                companyInfo.fetch({async : false});
                this.companyInfo = companyInfo.toJSON();

                this.hasApproval = SiteConfigModel.read({isAdmin : true}).hasApproval();
                if(this.hasApproval){
                    var approvalSecurityModel = new ApprovalSecurityModel();
                    approvalSecurityModel.fetch({async : false});
                    this.approvalLevels = approvalSecurityModel;
                }
            },

            events: {
                "click.account #add_dept_member" : "onAddDeptMemberClicked",
                "click.account #add_user_group" : "onAddUserGroupClicked",
                "click.account #cancel" : "cancel",
                "click.account #dept_members .ic_del" : "deleteDeptEl",
                "click.account #addMembers .ic_del" : "deleteApprAbsenceEl",
                "click.account #group_members .ic_del" : "deleteGroupEl",
                "click.account #quotaWarningMode span input:radio" : "quotaWarningModeToggle",
                "click.account #quotaViolationActionMode span input:radio" : "quotaViolationActionModeToggle",
                "click.account input:radio[name='maxSendMailCountUse']" : "maxSendMailCountUseModeToggle",
                "click.account #addAlternateEmail" : "addAlternateEmail",
                "click.account #addUserVirtualDomain" : "addUserVirtualDomain",
                "click.account form tr td span.ic_delete" : "deleteAlternateEmail",
                "click.account input[name='forwardingUse']" : "forwardModeToggle",
                "click.account input[name='sendAllowMode']" : "sendAllowModeToggle",
                "click.account #hiddenForwardingMode span input:radio" : "hiddenForwardingModeToggle",
                "click.account #addForwardingEmail" : "addForwardingEmail",
                "click.account #addSendAllowEmail" : "addSendAllowEmail",
                "click.account #addHiddenForwardingEmail" : "addHiddenForwardingEmail",
                "mouseup #status_stop" : "rememberAccountStatus",
                "click.account #status_stop" : "confirmStatusStop",
            	"change.account #more_info" : "addMoreInfoEl",
        		"change.account #mail_config tr td select" : "mailSelectBoxToggle",
                "change.account #mailGroup" : "changeMailGroup",
                "change.account input:radio[name='status']" : "checkUserCount",
            	"keyup.account #loginId" : "loginIdCheck",
        		"keyup.account #employeeNo" : "employeeNoCheck",
            	"submit form" : "formSubmit"
            },

            formSubmit : function(e) {
                e.preventDefault();
                return;
            },
            quotaWarningModeToggle : function(event){
                var target = $(event.target);
                if(target.val() == "on"){
                    this.$el.find("#quotaWarningModeOnSetting").show();
                }else {
                    this.$el.find("#quotaWarningModeOnSetting").hide();
                }
            },
            hiddenForwardingModeToggle : function(event) {
                var target = $(event.target),
                    toggleTarget = target.parents("tr").find("#hiddenForwardingList");
                if(target.val() != "off"){
                    toggleTarget.show();
                }else{
                    toggleTarget.hide();
                }
            },
           forwardModeToggle : function(event){
                var target = $(event.target),
                toggleTarget = target.parents("td").find("#forwardingList");
                if(target.val() == "on"){
                    toggleTarget.show();
                    this.$el.find('#forwardingMode_forwarding').val("forwarding");
                    this.$el.find('#forwardingMode_forwardingonly').val("forwardingonly");
                    this.$el.find('#forwardingMode_none').val("none");
                    this.$el.find('#forwardingMode_none').prop('checked', true);
                }else if(target.val() == "off"){
                    toggleTarget.hide();
                }else{
                    if(this.mailDomainGroup.get("forwardingUse") == "on"){
                        toggleTarget.show();
                        this.$el.find('#forwardingMode_forwarding').val("forwarding");
                        this.$el.find('#forwardingMode_forwardingonly').val("forwardingonly");
                        this.$el.find('#forwardingMode_none').val("none");
                        this.$el.find('#forwardingMode_none').prop('checked', true);
                    }else{
                        toggleTarget.hide();
                    }
                }
            },
            sendAllowModeToggle : function(event){
                var target = $(event.target),
                toggleTarget = target.parents("td").find("#sendAllowModeList");
                if(target.val() == "on"){
                    toggleTarget.show();
                }else if(target.val() == "off"){
                    toggleTarget.hide();
                }else{
                    toggleTarget.hide();
                }
            },
            changeMailGroup : function(event){
            	this.deleteBeforeGroupSendAllow(this.mailDomainGroup.toJSON());
                this.mailDomainGroup = MailDomainGroup.read($(event.target).val());

                this.companyMailService = new Backbone.Model();
                this.companyMailService.url = GO.contextRoot + "ad/api/company/mailservice";
                this.companyMailService.fetch({async : false});

                this.inheritMailGroupConfig(this.mailDomainGroup.toJSON());
                this.inheritDomainMailServiceConfig(this.companyMailService.toJSON());
            },

            inheritDomainMailServiceConfig : function(data){
                var mailServiceItems = {
                    mailServiceDataList: ["webMail", "pop", "imap", "smtpauth"],
                    targetElIdList: ["webmailUsed", "popUsed", "imapUsed", "smtpAuthUsed"]
                };
                _.each(mailServiceItems.mailServiceDataList, function (mailService, index) {
                    if (!data[mailService]) {
                        this.$el.find('#' + mailServiceItems.targetElIdList[index]).prop('checked', false).parent().hide();
                    }
                }, this);
            },

            inheritMailGroupConfig : function(data){
                if(data.sendAllowUse == "on") {
                    this.$el.find("#sendAllowMode").text(" ( " + CommonLang["사용"] + " )");
                }else{
                    this.$el.find("#sendAllowMode").text(" ( " + AdminLang["사용안함"] + " )");
                }
                // 메일 그룹 설정이 송신 제한을 사용하더라도 추가 레이어는 보이지 않게 해달라는 기획팀의 요청.
                if(this.$el.find("input[name='sendAllowMode']:checked").val() == "group"){
                    this.$el.find("#sendAllowModeList").hide();
                }
                var sendAllowList = [];
                if(data.sendAllowList != undefined){
                    for(var i=0; i < data.sendAllowList.length; i++) {
                    	if(!this.isSavedGroupAllowList(data.sendAllowList[i])){
                        var options = {
                            type : {
                                name : "sendAllowEmail",
                                emailInfo : data.sendAllowList[i],
                                hideDeleteBtn : true
                            },
                            data : {
                                emailId : data.sendAllowList[i]
                            }
                        };
                        sendAllowList.push(_addAlternateEmail(options));
                    	}
                    }

                    this.$el.find('#sendAllowModeEmails').append(sendAllowList.join(''));
                }

                if(data.forwardingUse == "on"){
                    this.$el.find("#forwardingUse").text(" ( " + CommonLang["사용"] + " )");
                }else{
                    this.$el.find("#forwardingUse").text(" ( " + AdminLang["사용안함"] + " )");
                }
                if(this.$el.find("input[name='forwardingUse']:checked").val() == ""){
                   if(data.forwardingUse == "on"){
                       this.$el.find("#forwardingList").show();
                   }else{
                       this.$el.find("#forwardingList").hide();
                   }
               }

                var megaMailQuota = data.megaMailQuota == undefined ? 0 : data.megaMailQuota;
                this.$el.find("#groupMailQuota").text(" ( " + AdminLang["기본제공"] + " " + megaMailQuota + "MB )");
                this.$el.find("#groupMailQuota").attr('data-max', megaMailQuota);

                var megaWebFolderQuota = data.megaWebFolderQuota == undefined ? 0 : data.megaWebFolderQuota;
                this.$el.find("#groupWebFolderQuota").text(" ( " + AdminLang["기본제공"] + " " + megaWebFolderQuota + "MB )");
                this.$el.find("#groupWebFolderQuota").attr('data-max', megaWebFolderQuota);

                if(data.quotaWarningMode){
                    this.$el.find("#groupQuotaExcessWarning").text(" ( " + CommonLang["사용"] + " )");
                }else{
                    this.$el.find("#groupQuotaExcessWarning").text(" ( " + AdminLang["사용안함"] + " )");
                }

                if(data.quotaViolationAction == "return"){
                    this.$el.find("#groupQuotaViolationAction").text(" ( " + AdminLang["반송"] + " ) ");
                }else{
                    this.$el.find("#groupQuotaViolationAction").text(" ( " + AdminLang["임시저장"] + " ) ");
                }

                if(data.mailSenderUse == "on"){
                    this.$el.find("#groupMailSenderMode").text(" ( " + CommonLang["사용"] + " ) ").attr("data-use", "on");
                }else{
                    this.$el.find("#groupMailSenderMode").text(" ( " + AdminLang["사용안함"] + " ) ").attr("data-use", "off");
                }

                this.setMailServiceCheckbox(data, function(targetEl, isUsed){
                    targetEl.prop("disabled", isUsed).prop("checked", isUsed);
                });

               var megaMailMaxSendSize = data.megaMailMaxSendSize == undefined ? 0 : data.megaMailMaxSendSize;
                this.$el.find("#groupMailMaxSendSize").text(" ( " + megaMailMaxSendSize + "MB )");

               if(data.maxSendMailCountUse == "on"){
                   this.$el.find("#maxSendMailCountUseCustom").text(" ( " + CommonLang["사용"] + " )");
               }else{
                   this.$el.find("#maxSendMailCountUseCustom").text(" ( " + AdminLang["사용안함"] + " )");
               }
            },

            setMailServiceCheckbox: function (mailInfo, callback) {
                var mailServiceList = ["popUsed", "smtpAuthUsed", "imapUsed", "webmailUsed"];
                _.each(mailServiceList, function (mailService) {
                    var targetEl = $("#mailServices input[name='" + mailService + "']");
                    callback(targetEl, this[mailService]);
                }, mailInfo);
            },

            setApprovalConfig : function(data){
                var contentEl = this.$el.find("#approval_content"),
                    self = this;

                setSignImg.call(this, data);
                setLevels.call(this, data);

                function setSignImg(data){
                    var path = "";
                    if(data != undefined && data.approvalSignPath != undefined){
                        path = data.approvalSignPath;
                        self.mailInfo.set("approvalSignPath",  path);
                    }else{
                        path = GO.contextRoot + "resources/images/stamp_approved.png";
                    }
                    contentEl.find("#approval_sign_img").attr("src", path);
                }

                function setLevels(data){
                    var securityOptionsEl = contentEl.find("#approval_security_options"),
                        options = [], useFlagMsg;

                    options.push("<option value=''>" + AdminLang["보안등급을 선택"] + "</option>");
                    this.approvalLevels.each(function(model){
                    	if(!model.get('useFlag')){
                    		useFlagMsg = '('+ApprovalLang['미사용']+')';
                    	}else{
                    		useFlagMsg = '';
                    	}
                        if((data != undefined) && (data.approvalLevel == model.get("level"))){
                            options.push("<option value='"+ model.get("level") +"' selected>" + model.get("name") + useFlagMsg +"</options>");
                        }else{
                            options.push("<option value='"+ model.get("level") +"'>" + model.get("name") + useFlagMsg +"</options>");
                        }
                    });
                    securityOptionsEl.html(options);
                }
            },
            quotaViolationActionModeToggle : function(event){
                var target = $(event.target);
                if(target.val() == ""){
                    this.$el.find("#quotaViolationActionModeSetting").hide();
                }else{  // value is 'return' or 'store'
                    this.$el.find("#quotaViolationActionModeSetting").show();
                }
            },
            maxSendMailCountUseModeToggle : function(event){
                var target = $(event.target);
                if(target.val() == "on"){
                    this.$el.find("#maxSendMailCount").show();
                }else{
                    this.$el.find("#maxSendMailCount").hide();
                }
            },
            mailSelectBoxToggle : function(e){
                var target = $(e.currentTarget);
                if(target.val() == "custom"){
                    target.parent("td").find("span").show();
                }else{
                    target.parent("td").find("span").hide();
                }
            },
            onAddUserGroupClicked : function(){
                var self = this;

                if(this.userGroup == undefined){
                    this.userGroup = UserGroup.getCollection();
                }

                this.userGroupPopup = $.goPopup({
                    header : self.type.addUserGroup,
                    width : 260,
                    modal : false,
                    appendTarget : self.$el.find('form'),//'#userCreateForm',
                    allowPrevPopup : true,
                    buttons : [{
						btext : CommonLang["확인"],
						btype : "confirm",
						callback: $.proxy(this.addUserGroup, this)
					}, {
						btext : CommonLang["취소"]
					}],
                    contents : _addUserGroupTmpl({
                        type : this.type,
                        userGroup : this.userGroup.toJSON()})
                });
            },
            rememberAccountStatus : function() {
                this.statusBeforeClickStop = this.$el.find("#account_status input[type='radio']:checked").val();
            },
            confirmStatusStop : function() {
            	var self = this;
            	var isAdmin = self.mailInfo ? self.mailInfo.toJSON().admin : false;
            	var confirm;
            	if(isAdmin){
                    confirm = $.goAlert(AdminLang["계정 중지 오류"], AdminLang["관리자 중지 오류 설명"], function() {
                        var originStatus = self.mailInfo ? self.mailInfo.toJSON().status : self.statusBeforeClickStop;
                        self.$el.find("input[name='status'][value=" + originStatus + "]").prop("checked", true);
                    });

                }else{
                    confirm = $.goConfirm(AdminLang['계정중지시 부서정보삭제'], AdminLang["중지하시겠습니까?"], function(){
                        self.$el.find("#dept_members").children(".dept_member").remove();
                    }, function() {
                        var originStatus = self.mailInfo ? self.mailInfo.toJSON().status : self.statusBeforeClickStop;
                        self.$el.find("input[name='status'][value=" + originStatus + "]").prop("checked", true);
                    }, CommonLang['확인']);
                }
                confirm.css("width","420px");
            },
            addUserGroup : function(){
                var selectedEl = this.$el.find("#user_group_select :selected");
                if(selectedEl.val() == ""){
                    $.goMessage(AdminLang["추가할 항목을 선택하세요."]);
                    return;
                }

                if(this._isExistGroup(selectedEl.val())){
                    $.goMessage(this.type.isAlreadyExistGroup);
                }else{
                    this.$el.find("#group_members").prepend(_addGroupMember({id: selectedEl.val(), name: selectedEl.text(), del: CommonLang["삭제"]}));
                    this.userGroupPopup.remove();
                }

                return false;
            },
            onAddDeptMemberClicked : function(e){
                var self = this;

                if(this.$el.find("#status_stop").is(":checked")) {
                	$.goMessage(AdminLang["중지된계정 부서추가불가능"]);
                	return;
                }

                $.goOrgSlide({
                    header : self.type['dept_duty_add'],
                    isAdmin: true,
                    type : 'department',
                    externalLang : CommonLang,
                    contextRoot : GO.contextRoot,
                    desc : self.type['addMemberSelect'],
                    target : e,
                    zIndex : 200,
                    buttons: [{
                        btext : self.type.confirm,
                        bclass : 'btn_major_s',
                        autoClose : true,
                        callback : $.proxy(this.addDeptMember, this)
                    }]
                });

                $("#orgTree").after(_selectDutyTmpl({
                    data : this.duties.toJSON(),
                    selectDuty : AdminLang["직책 선택"],
                    nonCheck : AdminLang["미지정"]
                }));
            },

            addDeptMember: function (obj) {
                validate(obj.id);
                var self = this;
                var duty = getDuty();
                var dept = {
                    id: obj.id,
                    name: obj.name
                };
                if(!_.isEmpty(duty.name)){
                    dept.name = dept.name + " - " + duty.name;
                }
                addItem(dept, duty);
                this.enableDeptMembersDraggable();

                function validate(id){
                    if(!_.isUndefined(id)){
                        return;
                    }
                    $.goMessage(this.type.selectDeptError);
                    throw new Error(this.type.selectDeptError);
                }

                function addItem(dept, duty){
                    var member = {};
                    var $dept = self.$el.find("#dept_members input[name=deptId][value="+dept.id+"]");
                    if(!_.isEmpty($dept)){
                        var $li = $dept.closest("li");
                        member.id = $li.find("input[name=memberId]").attr("value");
                        $li.replaceWith(makeTmpl(member, dept, duty));
                    }else{
                        self.$el.find("#dept_members > li:last").before(makeTmpl(member, dept, duty));
                    }

                    function makeTmpl(member , dept, duty){
                        return _addDeptMemberTmpl({
                            member : member,
                            dept: dept,
                            duty: duty,
                            del: CommonLang["삭제"]
                        })
                    }
                }

                function getDuty(){
                    var $duty = this.$("#duty").find(":selected");
                    var duty = {
                        name : ""
                    };

                    if (!_.isEmpty($duty.val())) {
                        duty.name = $duty.text();
                        duty.id = $duty.val();
                    }

                    return duty;
                }
            },
            enableDeptMembersDraggable: function() {
                this.$el.find("#dept_members")
                    .disableSelection()
                    .sortable({
                        axis: "x",
                        items: "> li.dept_member"
                    });
            },
            deleteDeptEl: function (e) {
                var deleteDept = $(e.target),
                    deleteMemberId = deleteDept.attr("value");
                deleteDept.parent().parent().remove();
            },
            deleteApprAbsenceEl: function(e) {
            	$(e.currentTarget).parents('li').remove();
            },
            deleteGroupEl : function(e){
                var deleteGroup = $(e.target),
                    deleteGroupId = deleteGroup.attr("value");
                if (deleteGroupId != undefined) {
                    this.deleteGroupIds.push(deleteGroup.attr("value"));
                }
                deleteGroup.parent().parent().remove();
            },
            _isExistGroup : function(id){
                var groups = this.$("#group_members").find("input[name=userGroupId]"),
                groupIds = [];

                for(var i = 0 ; i < groups.length ; i++){
                    groupIds.push(groups[i].value);
                }

                if(groupIds.length == 0 || _.indexOf(groupIds, id.toString()) < 0){
                    return false;
                }else{
                    return true;
                }
            },
            _isExistDept : function(id){
                var depts = this.$("#dept_members").find("input[name=deptId]"),
                deptIds = [];

                for(var i = 0 ; i < depts.length ; i++){
                    deptIds.push(depts[i].value);
                }

                if(deptIds.length == 0 || _.indexOf(deptIds, id.toString()) < 0){
                    return false;
                }else{
                    return true;
                }
            },
            loginIdCheck : function(){
                this.isDuplicateLoginId = false;
                var self = this,
                    loginId = this.$el.find("#loginId").val(),
                    params = {
                        "emailId" : loginId,
                        "userId" : this.options == undefined ? "" : this.options.userId
                };

                if($.trim(loginId) == ""){
                    this.$el.find("#id_error_message").hide();
                    return;
                }

                try{
                    this.__validateLoginId(params.emailId);
                }catch(e){
                    console.info("invalid login id !!");
                    return;
                }

                this.isDuplicateEmailId(params,
                    function(){
                        self.isDuplicateLoginId = false;
                        self.$el.find("#id_error_message").hide();
                    },
                    function(){
                        self.isDuplicateLoginId = true;
                        self.$el.find("#id_error_message").show();
                    }
                );
                this.changeRepresentationEmail();
            },
            addAlternateEmail : function(){
            	var self = this;
                var emailId = this.$el.find("#alternateEmail").val().toLowerCase(),
                    domainName = this.companyInfo.domainName,
                    params = {
                        emailId : emailId,
                        domainName : domainName
                };

                if($.trim(emailId) == ""){
                    $.goMessage(AdminLang['추가할 이메일을 입력하세요.']);
                    this.$el.find("#alternateEmail").focus();
                    return;
                }
                if($.goValidation.isInvalidEmailId(emailId)){
                    $.goMessage(AdminLang['사용할 수 없는 이메일입니다.']);
                    this.$el.find("#alternateEmail").focus();
                    return;
                }

            	var vDomain = this.$el.find("#alternateEmails li");
            	var isDuplicated = false;
            	$.each(vDomain, function(i){
            		if($(this).find('[name="alternateEmailId"]').val() == emailId){
	            		isDuplicated = true;
	            		return;
            		}
            	});

            	if(isDuplicated){
            		return;
            	}


                this.isDuplicateEmailId(params,
                    function(){
                        var options = {
                            type : {
                                name : "alternateEmailId",
                                emailInfo : emailId,
                                del: CommonLang["삭제"]
                            },
                            data : {
                                emailId : emailId
                            }
                        };

                        self.$el.find("#alternateEmail").val("");
                        self.$el.find("#alternateEmails").append(_addAlternateEmail(options));
                        self.changeRepresentationEmail();
                    }
                );
            },
            addSendAllowEmail : function(event) {
                var parentTd = $(event.target).parents("td"),
                    emailEl = parentTd.find("input:text"),
                    listEl = parentTd.find("ul.list_option");

                if($.trim(emailEl.val()) == ""){
                    $.goMessage(AdminLang['추가할 이메일을 입력하세요.']);
                    $(emailEl).focus();
                    return;
                }

                if($.goValidation.isInvalidEmail(emailEl.val()) && !this.validateAllowDomain(emailEl.val())){
                	$.goMessage(AdminLang['도메인 혹은 이메일 형식이 잘못되었습니다.']);
	            	$(emailEl).focus();
	            	return;
                }

                var options = {
                    type : {
                        name : emailEl.attr("id"),
                        emailInfo : emailEl.val()
                    },
                    data : {
                        emailId : emailEl.val()
                    }
                };

                emailEl.val("");
                $(listEl.append(_addAlternateEmail(options)));
            },
            validateAllowDomain : function(domain) {
            	if(!('@' === domain.charAt(0))) { // @으로 시작하지 않으면 false
            		return false;
            	}

            	if(!$.goValidation.isValidDomain(domain.substring(1))) { // Domain 형식에 맞지 않으면 false
            		return false;
            	}
            	return true;
            },
            addUserVirtualDomain : function(e){
            	var selectedOptions = this.$el.find("#userVirtualDomain option:selected").val();
            	var uvDomain = this.$el.find("#userVirtualDomains li");
            	var isDuplicated = false;
            	$.each(uvDomain, function(i){
            		if($(this).find('[name="userVirtualDomain"]').val() == selectedOptions){
	            		isDuplicated = true;
	            		return;
            		}
            	});

            	if(isDuplicated){
            		return;
            	}

            	if($.trim(selectedOptions) == ""){
                    $.goMessage(AdminLang['추가할 이메일을 입력하세요.']);
                    this.$el.find('select#userVirtualDomain').focus();
                    return;
                }

            	var options = {
                        type : {
                        	name : "userVirtualDomain",
                        	userVirtualDomain : selectedOptions
                        },
                        data : {
                        	userVirtualDomain : selectedOptions
                        }
                    };
                this.$el.find("ul#userVirtualDomains").append(_addUserVirtualDomain(options));
                this.changeRepresentationEmail();
            },
            addHiddenForwardingEmail : function(event){
                var parentTd = $(event.target).parents("td");
                var emailEl = parentTd.find("input:text");
                var listEl = parentTd.find("ul.list_option");

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

                var options = {
                    type : {
                        name : emailEl.attr("id"),
                        emailInfo : emailEl.val().toLowerCase()
                    },
                    data : {
                        emailId : emailEl.val().toLowerCase()
                    }
                };

                emailEl.val("");
                $(listEl.append(_addAlternateEmail(options)));
            },
            addForwardingEmail : function(event){
                var parentTd = $(event.target).parents("td");
                var emailEl = parentTd.find("input:text");
                var listEl = parentTd.find("ul.list_option");

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

                var options = {
                    type : {
                        name : emailEl.attr("id") + "Id",
                        emailInfo : emailEl.val().toLowerCase()
                    },
                    data : {
                        emailId : emailEl.val().toLowerCase()
                    }
                };

                emailEl.val("");
                $(listEl.append(_addAlternateEmail(options)));
            },
            isDuplicateEmailId : function(option, callback, errorCallback){
                var url = GO.contextRoot + "ad/api/user/idcheck";

                $.go(url,option, {
                    qryType : 'GET',
                    contentType : 'application/json',
                    responseFn : function(response) {
                        if(response.code === "200"){
                            callback();
                        }
                    },
                    error : function(jqXHR, textStatus, errorThrown){
                        if(errorCallback != undefined ){
                            errorCallback();
                        }else{
                            $.goMessage(AdminLang["아이디가 중복되었습니다."]);
                        }
                    }
                });
            },
            employeeNoCheck : function(){
                var value = {
                        "employeeNo" : this.$el.find("#employeeNo").val(),
                        "userId" : this.options == undefined ? "" : this.options.userId
                    },
                    url = GO.contextRoot+"ad/api/user/employeenocheck",
                    self = this;
                if($.trim(value["employeeNo"]) == ""){
                    this.$el.find("#employee_no_exist").hide();
                    return;
                };
                $.go(url,value, {
                    qryType : 'GET',
                    contentType : 'application/json',
                    responseFn : function(response) {
                        if(response.code === "200"){
                            self.isDuplicateEmployeeNo = false;
                            self.$el.find("#employee_no_exist").hide();
                        }
                    },
                    error : function(error, response){
                        self.isDuplicateEmployeeNo = true;
                        self.$el.find("#employee_no_exist").show();
                    }
                });
            },
            __dummyGetMailGroup : function(groupName, callback){
               var params = {
                   "mailQuota" : "1024",
                   "webFolderQuota" : "2048"
               };
               callback(params);
            },
            __getMailGroup : function(groupName, callback){
                var url = GO.contextRoot + "ad/api/mailgroup",
                    params = {
                       "name" : groupName
                    },
                    resultData = {};

                $.go(url,params, {
                    qryType : 'GET',
                    async : true,
                    contentType : 'application/json',
                    responseFn : function(response) {
                        if(response.code === "200"){
                            callback(response.data);
                        }
                    },
                    error : function(){
                        $.goMessage("defaultGroupInfo Error");
                    }
                });
                return resultData;
            },
            isFormInvalid : function(option){
                var errors = new UserValidate();

                this.$el.find("p.go_alert").remove();

                this.__validateName(errors);
                this.__validateMultiName(errors);
                this.__validateNameHurigana(errors);
                this.__validateFormLoginId(errors);
                this.__validateEmployeeNo(errors);
                this.__validationStatus(errors);
                this.__validationMailGroup(errors);
                if(option.password) this.__validatePassword(errors);
                this.__validationMailInfo(errors);

                if(option.apprPassword) this.__validateApprPassword(errors);
                if(this.hasApproval){
                	this.__validationApprGrade(errors);
                }

                this.__validationMailExpireDate(errors);
                this.__validateApprAbsence(errors);
                this.__validateJob(errors);

                if(errors.hasError()){
                	$.each(errors.getErrors(), function(i, error){
                		if(i == 0){
                			error.el.focus();
                		}
                		error.el.parents(":first").append("<p class='go_alert'>" + error.message + "</p>");
                	});

                	throw new Error(400, "");
                }
            },
            __validationApprGrade : function(errors){
                var gradeSelectEl = this.$el.find("#approval_security_options");

                if($.trim(gradeSelectEl.val()) == ""){
                	errors.add(gradeSelectEl, AdminLang["보안등급을 선택해 주세요."]);
                }
            },
            __validationMailExpireDate : function(errors) {
                var mailExpireDate = this.$el.find('#mailExpireDate').val();
                var today = new Date(),
                    year = today.getFullYear()+"",
                    month = (today.getMonth()+1) < 10 ? "0" + (today.getMonth()+1) : ""+(today.getMonth()+1),
                    day = today.getDate()< 10 ? "0" + today.getDate() : today.getDate(),
                    date = year + month + day;
                var status = this.$el.find('input[name="status"]:checked').val();
                if(this.$el.find('#mailExpireDate').val() != "" && mailExpireDate < date && status != "stop"){
                    errors.add(this.$el.find('input[name="status"]:radio[value="stop"]'), AdminLang["계정만료일인경우상태경고"]);
                }

            },
            __validateApprAbsence: function(errors){
            	if(this.$('#absenceSettingBtn').hasClass('openSetting')){
            		if(this.$('#startDate').val() == '' || this.$('#endDate').val() == ''){
                		errors.add(this.$('#absenceSetting'), AdminLang["부재 기간을 설정해 주세요"]);
                	}
                	if(this.$('[name=absenceContent]').val() == ''){
                		errors.add(this.$('#absenceSetting'), AdminLang["부재 사유를 설정해 주세요"]);
                	}
                	if(this.$('#addMembers').find('li').not('.creat').length == 0){
                		errors.add(this.$('#absenceSetting'), AdminLang["대결자를 선택해 주세요"]);
                	}
            	}
            },
            __validateNameHurigana : function(errors){
                var hurigana = this.$el.find("#user_name_hurigana");
                if($.trim(hurigana.val()) != "" && !$.goValidation.isCheckLength(1,64,hurigana.val())){
                   	errors.add(hurigana, App.i18n(CommonLang["0자이상 0이하 입력해야합니다."],{arg1 : 1, arg2 : 64}));
                }
            },
            __validateName : function(errors){
                var nameEl = this.$el.find("input[name='name']");
                if($.trim(nameEl.val()) == ""){
                	errors.add(nameEl, this.type.requireData);
                }
            },
            __validateJob : function(errors){
                var nameEl = this.$el.find("input[name='job']");
                if (nameEl.length == 0) {
                    return;
                }

                var jobVal = nameEl.val();
                if(!$.goValidation.isCheckLength(0, 150, jobVal)){
                    errors.add(nameEl, App.i18n(AdminLang['0자이하 입력해야합니다.'], {"arg1":"150"}));
                }
            },
            __validateMultiName : function(errors) {
                var self = this;
                var nameList = ["koName", "enName", "jpName", "zhcnName", "zhtwName"];
                _.forEach(nameList, function (name) {
                    var nameEl = self.$el.find("input[name='" + name + "']"),
                        nameValue = nameEl.val();
                    if(nameValue != undefined && nameValue.length > 0){
                        if(!$.goValidation.isCheckLength(1,64,nameValue)){
                            errors.add(nameEl, App.i18n(AdminLang['{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다.'],
                                {"arg1":self.type.name + "(" + self.type.locale_ko +")","arg2":"1","arg3":"64"}));
                        }
                    }
                });
    		},
            __validatePassword : function(errors){
                var $password = this.$("#password").find("input[type=password]");
                var $passwordConfirm = this.$("#password_confirm").find("input[type=password]");

                if($password.val() == ""){
                    errors.add($password, this.type.requireData);
                }else if($passwordConfirm.val() == ""){
                    errors.add($passwordConfirm, this.type.requireData);
                }else if($password.val() !== $passwordConfirm.val()){
                    errors.add($passwordConfirm, this.type.password_not_match);
                }
            },
            __validateApprPassword : function(errors){
                var $password = this.$("#approval_content").find("input[type=password]");

                if($password.val() == ""){
                	errors.add($password, this.type.requireData);
                }
            },
            __validateFormLoginId : function(errors){
                this.__validateLoginId(errors);
                if(this.isDuplicateLoginId) {
                	errors.add(this.$el.find("#loginId"), this.type.duplicateId);
                }
            },
            __validateLoginId : function(errors){
                var loginId = this.$el.find("#loginId").val();
                if($.trim(loginId) == ""){
                	errors.add(this.$el.find("#loginId"), this.type.requireData);
                }else if($.goValidation.isInvalidEmailId(loginId)){
                	errors.add(this.$el.find("#loginId"), this.type.invalid_email_id);
                }
            },
            __validateEmployeeNo : function(errors){
                var empNo = this.$el.find("#employeeNo").val();
                if($.trim(empNo) == ""){
                    return;
                }else if(this.isDuplicateEmployeeNo){
                    errors.add(this.$el.find("#employeeNo"), this.type.duplicateEmployeeNo);
                }
            },
            __validationMailGroup : function(errors){
                if(this.$el.find("#mailGroup").val() == null){
                    errors.add(this.$el.find("#mailGroup"), this.type.fail_mail_group);
                }
            },
            __validationStatus : function(errors){
                if(!this.isChangeStatus){
                    errors.add(this.$el.find("#status_dormant").parent('span'), this.type.dont_change_status);
                    this.$el.find('#status_stop').focus();
                }
            },
            __validationMailInfo : function(errors){
                var mailAddQuotaEl = this.$el.find("input:text[name='mailAddQuota']"),
                    webfolderAddQuotaEl = this.$el.find("input:text[name='webFolderAddQuota']"),
                    mailMaxSendSizeEl =  this.$el.find("#mailMaxSendSize"),
                    quotaWarningRatioEl = this.$el.find("input:text[name='quotaWarningRatio']"),
                    quotaOverlookRatioEl = this.$el.find("input:text[name='quotaOverlookRatio']"),
                    inboxExpireDaysEl = this.$el.find("#inboxExpireDaysCustom"),
                    trashExpireDaysEl = this.$el.find("#trashExpireDaysCustom"),
                    spamExpireDaysEl = this.$el.find("#spamExpireDaysCustom"),
                    inboxExpireDays = this.$el.find("select[name='inboxExpireDays'] option:selected").val(),
                    trashExpireDays = this.$el.find("select[name='trashExpireDays'] option:selected").val(),
                    spamExpireDays = this.$el.find("select[name='spamExpireDays'] option:selected").val(),
                    maxSendMailCountEl = this.$el.find("input:text[name='maxSendMailCount']");

                	repTelEl = this.$el.find("input:text[name='repTel']");
                	directTelEl = this.$el.find("input:text[name='directTel']");
                	mobileNoEl = this.$el.find("input:text[name='mobileNo']");
                	faxEl = this.$el.find("input:text[name='fax']");
                	birthdayEl = this.$el.find("input:text[name='birthday']");
                	anniversaryEl = this.$el.find("input:text[name='anniversary']");

                    ADD_MAX_MAIL_QUATA = 122880,
                    ADD_MIN_MAIL_QUATA = 0,
                    ADD_MAX_WEBFOLDER_QUATA = 10240,
                    ADD_MIN_WEBFOLDER_QUATA = 0,
                    ADD_MAX_DAYS = 365,
                    ADD_MIN_DAYS = 1;

                if($.trim(mailAddQuotaEl.val()) == ""){
                	errors.add(mailAddQuotaEl, CommonLang["필수항목을 입력하지 않았습니다."]);
                }else if(!$.goValidation.isNumber(mailAddQuotaEl.val())){
                	errors.add(mailAddQuotaEl, AdminLang["숫자만 입력하세요."]);
                }else if(mailAddQuotaEl.val() > ADD_MAX_MAIL_QUATA || mailAddQuotaEl.val() < ADD_MIN_MAIL_QUATA){
                	errors.add(mailAddQuotaEl, App.i18n(AdminLang["입력범위알림"], {"arg1":ADD_MIN_MAIL_QUATA,"arg2":ADD_MAX_MAIL_QUATA}));
                }

                if($.trim(webfolderAddQuotaEl.val())  == ""){
                	errors.add(webfolderAddQuotaEl, CommonLang["필수항목을 입력하지 않았습니다."]);
                }else if(!$.goValidation.isNumber(webfolderAddQuotaEl.val())){
                	errors.add(webfolderAddQuotaEl, AdminLang["숫자만 입력하세요."]);
                }else if(webfolderAddQuotaEl.val() > ADD_MAX_WEBFOLDER_QUATA || webfolderAddQuotaEl.val() < ADD_MIN_WEBFOLDER_QUATA){
                	errors.add(webfolderAddQuotaEl, App.i18n(AdminLang["입력범위알림"], {"arg1":ADD_MIN_WEBFOLDER_QUATA,"arg2":ADD_MAX_WEBFOLDER_QUATA}));
                }

                if(this.$el.find('input:radio[name="quotaWarningMode"]:checked').val() == "on"){
                    if($.trim(quotaWarningRatioEl.val()) == ""){
                    	errors.add(quotaWarningRatioEl, CommonLang["필수항목을 입력하지 않았습니다."]);
                    }else if(!$.goValidation.isNumber(quotaWarningRatioEl.val())){
                        errors.add(quotaWarningRatioEl, AdminLang["숫자만 입력하세요."]);
                    }else if(quotaWarningRatioEl.val() > 100 || quotaWarningRatioEl.val() < 0){
                        errors.add(quotaWarningRatioEl, App.i18n(AdminLang["입력범위알림"], {"arg1": 0,"arg2" : 100}));
                    }
                }

                if(this.$el.find('input:radio[name="quotaViolationAction"]:checked').val() == "return"){
                    if($.trim(quotaOverlookRatioEl.val()) == ""){
                    	errors.add(quotaOverlookRatioEl, CommonLang["필수항목을 입력하지 않았습니다."]);
                    }else if(!$.goValidation.isNumber(quotaOverlookRatioEl.val())){
                    	errors.add(quotaOverlookRatioEl, AdminLang["숫자만 입력하세요."]);
                    }else if(quotaOverlookRatioEl.val() > 100 || quotaOverlookRatioEl.val() < 0){
                        errors.add(quotaOverlookRatioEl, App.i18n(AdminLang["입력범위알림"], {"arg1": 0,"arg2" : 100}));
                    }
                }

                if(this.$el.find('input:radio[name="maxSendMailCountUse"]:checked').val() == "on"){
                	if(maxSendMailCountEl.val() == ""){
                    	errors.add(maxSendMailCountEl, CommonLang["필수항목을 입력하지 않았습니다."]);
                	}else if(!$.goValidation.isNumber(maxSendMailCountEl.val())){
                		errors.add(maxSendMailCountEl, AdminLang["숫자만 입력하세요."]);
                	}else if(maxSendMailCountEl.val() > 1000000 || maxSendMailCountEl.val() < 1){
                		errors.add(maxSendMailCountEl, App.i18n(AdminLang["입력범위알림"], {"arg1": 1,"arg2" : 1000000}));
                	}
                }

                if(inboxExpireDays == "custom" && $.trim(inboxExpireDaysEl.val()) == ""){
                	errors.add(inboxExpireDaysEl, CommonLang["필수항목을 입력하지 않았습니다."]);
                }else if(inboxExpireDays == "custom" && !$.goValidation.isNumber(inboxExpireDaysEl.val())){
                	errors.add(inboxExpireDaysEl, AdminLang["숫자만 입력하세요."]);
                }else if(inboxExpireDays == "custom" && (inboxExpireDaysEl.val() > ADD_MAX_DAYS || inboxExpireDaysEl.val() < ADD_MIN_DAYS)){
                    errors.add(inboxExpireDaysEl, App.i18n(AdminLang["입력범위알림"], {"arg1":ADD_MIN_DAYS,"arg2":ADD_MAX_DAYS}));
                }

                if(trashExpireDays == "custom" && $.trim(trashExpireDaysEl.val()) == ""){
                	errors.add(trashExpireDaysEl, CommonLang["필수항목을 입력하지 않았습니다."]);
                }else if(trashExpireDays == "custom" && !$.goValidation.isNumber(trashExpireDaysEl.val())){
                    errors.add(trashExpireDaysEl, AdminLang["숫자만 입력하세요."]);
                }else if(trashExpireDays == "custom" && (trashExpireDaysEl.val() > ADD_MAX_DAYS || trashExpireDaysEl.val() < ADD_MIN_DAYS)){
                    errors.add(trashExpireDaysEl, App.i18n(AdminLang["입력범위알림"], {"arg1":ADD_MIN_DAYS,"arg2":ADD_MAX_DAYS}));
                }

                if(spamExpireDays == "custom" && $.trim(spamExpireDaysEl.val()) == ""){
                	errors.add(spamExpireDaysEl, CommonLang["필수항목을 입력하지 않았습니다."]);
                }else if(spamExpireDays == "custom" && !$.goValidation.isNumber(spamExpireDaysEl.val())){
                	errors.add(spamExpireDaysEl, AdminLang["숫자만 입력하세요."]);
                }else if(spamExpireDays == "custom" && (spamExpireDaysEl.val() > ADD_MAX_DAYS || spamExpireDaysEl.val() < ADD_MIN_DAYS)){
                	errors.add(spamExpireDaysEl, App.i18n(AdminLang["입력범위알림"], {"arg1":ADD_MIN_DAYS,"arg2":ADD_MAX_DAYS}));
                }

                if($.trim(repTelEl.val()) && !$.goValidation.isPhoneType(repTelEl.val())){
                    errors.add(repTelEl, AdminLang["전화번호허용문자"]);
                }

                if($.trim(directTelEl.val()) && !$.goValidation.isPhoneType(directTelEl.val())){
                    errors.add(directTelEl, AdminLang["전화번호허용문자"]);
                }

                if($.trim(mobileNoEl.val()) && !$.goValidation.isPhoneType(mobileNoEl.val())){
                    errors.add(mobileNoEl, AdminLang["전화번호허용문자"]);
                }

                if($.trim(faxEl.val()) && !$.goValidation.isPhoneType(faxEl.val())){
                    errors.add(faxEl, AdminLang["전화번호허용문자"]);
                }

                if(_.isEmpty(mailMaxSendSizeEl.val())){
                    return;
                }else if(!$.goValidation.isNumber(mailMaxSendSizeEl.val())){
                    errors.add(mailMaxSendSizeEl, AdminLang["숫자만 입력하세요."]);
                }else if(Number(mailMaxSendSizeEl.val()) > this.mailDomainGroup.get("megaMailMaxSendSize")){
                    errors.add(mailMaxSendSizeEl, AdminLang["송신메일 크기 알림"]);
                }
            },
            cancel : function(){
                this.goList();
            },
            addMoreInfoEl : function(e){
                $("#"+e.target.value).show();
                $(e.target).find(":selected").remove();
                if(this.$el.find('#more_info option').size() == 1){
                    this.$el.find('#addMoreInfo').hide();
                    this.$el.find('#memo').addClass("last");
                }
            },

            // else if 퍼레이드
            errorMessage : function(error){
                var errorData = JSON.parse(error.responseText),
                errorNames = errorData.name.split('.'),
                errorName = errorNames[errorNames.length - 1];

                if(errorName == 'name'){
                	$("input[name='name']").focus();
                }else if(errorName == 'empno'){
                    $('#employeeNo').focus();
                }else if(errorName == 'mailgroup'){
                    $('mailGroup').focus();
                }else if(errorName == 'id'){
                    $('#loginId').focus();
                }else if(errorName == 'directtel'){
                    $('input[name="directTel"]').focus();
                }else if(errorName == 'reptel'){
                    $('input[name="repTel"]').focus();
                }else if(errorName == 'fax'){
                    $('input[name="fax"]').focus();
                }else if(errorName == 'mobile'){
                    $('input[name="mobileNo"]').focus();
                }else if(errorName == 'location'){
                    $('input[name="location"]').focus();
                }else if(errorName == 'homepage'){
                    $('input[name="homePage"]').focus();
                }else if(errorName == 'messanger'){
                    $('input[name="messanger"]').focus();
                }else if(errorName == 'address'){
                    $('input[name="address"]').focus();
                }else if(errorName == 'memo'){
                    $('input[name="memo"]').focus();
                }else if(errorName == 'info'){
                    $('input[name="selfInfo"]').focus();
                }else if(errorName == 'password'){
                    $('input[name="password"]').focus();
                }else if(errorName == 'namehurigana'){
                    $('input[name="user_name_hurigana"]').focus();
                }else if(errorName == 'job'){
                    $('input[name="job"]').focus();
                }
                $.goMessage(errorData.message);
            },
            deleteAlternateEmail : function(event){
                $(event.target).parents("li").remove();
                this.changeRepresentationEmail();
            },
            accountBuilder : function(selectedDeptId){
                var self = this;
                var form = this.$el.find('form'),//this.$el.find("#userCreateForm"),
                    model = {},
                    deptMembers = [],
                    groupMembers = [],
                    alternateAddress = [],
                    userVirtualDomains = [],
                    forwardingAddress = [],
                    sendAllowAddress = [],
                    hiddenForwardingAddress = [],
                    mailSenders = [],
                    deptMember = {},
                    configs = [],
                    additions = {},
                    config = {},
                    $thumbnail = this.$el.find("#thumbnail_image"),
                    thumbnail_image = {
                        filePath : $thumbnail.attr("data-filepath"),
                        fileName : $thumbnail.attr("data-filename"),
                        hostId : $thumbnail.attr("host-id")
                    },
                    $approval_thumbnail = this.$el.find("#approval_sign_img"),
                    approval_sign_image = {
                        filePath : $approval_thumbnail.attr("data-filepath"),
                        fileName : $approval_thumbnail.attr("data-filename"),
                        hostId : $approval_thumbnail.attr("host-id")
                    },
                    approvalDeputies = [];

                if(thumbnail_image["filePath"] == undefined && thumbnail_image["fileName"] == undefined){
                    thumbnail_image = null;
                }

                if(approval_sign_image["filePath"] == undefined && approval_sign_image["fileName"] == undefined){
                    approval_sign_image = null;
                }

                // ...... else if 의 향연
                $(form.serializeArray()).each($.proxy(function(k,v) {
                    var value = $.trim(v.value);
                    if(v.name == "koName") {
                    	additions[v.name] = value;
                    }else if(v.name == "enName") {
                    	additions[v.name] = value;
                    }else if(v.name == "jpName") {
                    	additions[v.name] = value;
                    }else if(v.name == "zhcnName") {
                    	additions[v.name] = value;
                    }else if(v.name == "zhtwName") {
                    	additions[v.name] = value;
                    }else if(v.name == "viName") {
                        additions[v.name] = value;
                    }else if(v.name == "memberId"){
                        if (value && value > 0) {
                            deptMember["id"] = value;
                        }
                    }else if(v.name == "deptId"){
                        deptMember["deptId"] = value;
                    }else if(v.name == "dutyId"){
                        if (value && value > 0) {
                            deptMember["dutyId"] = value;
                        }
                        if(selectedDeptId && !deptMember["deptId"]) {
                            deptMember["deptId"] = selectedDeptId;
                        }
                        deptMembers.push(deptMember);
                        deptMember = {};
                    }else if(v.name == "groupId"){
                        groupMembers.push({"groupId" : value});
                    }else if(v.name == "alternateEmailId"){
                        alternateAddress.push(v.value);
                    }else if(v.name == "userVirtualDomain"){
                    	userVirtualDomains.push(v.value);
                    }else if(v.name == "forwardingEmailId"){
                        forwardingAddress.push(v.value);
                    }else if(v.name == "sendAllowEmail"){
                        sendAllowAddress.push(v.value);
                    }else if(v.name == "hiddenForwardingEmail"){
                        hiddenForwardingAddress.push(v.value);
                    }else if(v.name == "inboxExpireDays"){
                        if(v.value == "custom"){
                            model[v.name] = $.trim(self.$el.find("#inboxExpireDaysCustom").val());
                        }else{
                            model[v.name] = value;
                        }
                    }else if(v.name == "trashExpireDays"){
                        if(v.value == "custom"){
                            model[v.name] = $.trim(self.$el.find("#trashExpireDaysCustom").val());
                        }else{
                            model[v.name] = value;
                        }
                    }else if(v.name == "spamExpireDays"){
                        if(v.value == "custom"){
                            model[v.name] = $.trim(self.$el.find("#spamExpireDaysCustom").val());
                        }else{
                            model[v.name] = value;
                        }
                    }else if(v.name == "anniversary" && v.value.length > 0){
                        model[v.name] = App.util.toISO8601(v.value);
                    }else if(v.name == 'memo' || v.name == 'selfInfo'){
                        v.value = v.value.replace(/<br>/gi, "");   v.value = v.value.replace(/&nbsp;/gi, " ");
                        model[v.name] = v.value;
                    }else if(v.name == "mailSenderName"){
                        return true;   //continue
                    }else if(v.name == "mailSenderEmailId"){
                        return true;   //continue
                    }else if(v.name == "password"){
                        model[v.name] = form.find("input:password[name='password']").val();
                    }else if(v.name == "otpService"){
                        config["name"] = v.name;
                        config["value"] = v.value;
                        config["valueType"] = "boolean";
                        configs.push(config);
                        config = {};
                    }else if(v.name == "useAbbroadIpCheck"){
                        config["name"] = v.name;
                        config["value"] = v.value;
                        config["valueType"] = "boolean";
                        configs.push(config);
                        config = {};
                    }else if(v.name == "startDate"){
                    	approvalDeputies[0] = $.extend(approvalDeputies[0], {
                    		"startAt" : App.util.toISO8601(v.value)
                    	});
                    }else if(v.name == "endDate"){
                    	approvalDeputies[0] = $.extend(approvalDeputies[0], {
                    		"endAt" : App.util.toISO8601(App.util.toMoment(v.value).add('days',1).subtract('seconds',1))
                    	});
                    }else if(v.name == "absenceContent"){
                    	approvalDeputies[0] = $.extend(approvalDeputies[0], {
                    		"absenceContent" : v.value
                    	});
                    }else if(v.name == "directTel"){
                    	value = value.replace(/\s/gi,"");
                    	model[v.name] = value;
                    }else if(v.name == "mobileNo"){
                    	value = value.replace(/\s/gi,"");
                    	model[v.name] = value;
                    }else if(v.name == "job") {
                        model[v.name] = value;
                    }else{
                        model[v.name] = value;
                    }
                }, this));

                this.$el.find("#mailSenderListTbody tr.customSenderEmail").each(function(){
                    var $customSenderEmail = $(this);

                    mailSenders.push({
                        "email" : $customSenderEmail.find("span.senderItem").data('email'),
                        "defaultMail" : $customSenderEmail.find("input:radio[name='defaultMail']").prop("checked"),
                        "aliasUser": $customSenderEmail.find("span.senderItem").data('alias')
                    });
                });

                model["webmailUsed"] = this.$el.find('#webmailUsed').prop('checked');
                model["popUsed"] = this.$el.find('#popUsed').prop('checked');
                model["imapUsed"] = this.$el.find('#imapUsed').prop('checked');
                model["smtpAuthUsed"] = this.$el.find('#smtpAuthUsed').prop('checked');
                model["additions"] = additions;
                model["groupMembers"] = groupMembers;
                model["deptMembers"] = deptMembers;
                model["attPhoto"] = thumbnail_image;
                model["approvalAttPhoto"] = approval_sign_image;
                model["alternateAddr"] = alternateAddress;
                model["alternateUserDomain"] = userVirtualDomains;
                model["forwardingAddr"] = forwardingAddress;
                model["sendAllowAddr"] = sendAllowAddress;
                model["hiddenForwardingAddr"] = hiddenForwardingAddress;
                model["mailSenders"] = mailSenders;
                model["configs"] = configs;

                var birthdayYear = form.find('#birthdayYear').val(),
                    birthdayMonth = form.find('#birthdayMonth').val(),
                    birthdayDay = form.find('#birthdayDay').val();
                var atLeastOneBlankBirthDay = birthdayYear == '' || birthdayMonth == '' || birthdayDay == '';
                var allBlankBirthDay = birthdayYear == '' && birthdayMonth == '' && birthdayDay == '';
                if(birthdayYear == undefined || atLeastOneBlankBirthDay){
                	if(birthdayYear != undefined && this.mailInfo && this.mailInfo.attributes.birthday != "" && !allBlankBirthDay){
                        $.goAlert(AdminLang["생일 연월일 모두 입력"]);
                        return false;
                	}else{
                		model['birthday'] = '';
                		model['lunarCal'] = false;
                	}
                }else{
                	var birthdayStr = birthdayYear + "-" + birthdayMonth + "-" + birthdayDay;
                    // GO-26092 [서경방송] 음력 생일 표기 오류
                    model['birthday'] = App.util.toISO8601(App.util.toMoment(birthdayStr).add(1, 'hours'));
                    model['lunarCal'] = this.$el.find('#lunarCal').is(':checked');
                }

                if(this.$el.find('#absenceSettingBtn').hasClass("openSetting")){
                	approvalDeputies[0] = $.extend(approvalDeputies[0], {
                    	"title" : GO.i18n(ApprovalLang["{{name}}님의 부재정보 입니다."], { 'name': model["name"] }),
                    	"useFlag" : true,
                    	"deputyUserId" : self.$('#addMembers').find('li').attr('data-userid'),
                    	"deputyUserName" : self.$('#addMembers').find('li').attr('data-username'),
                    	"deputyUserPosition" : self.$('#addMembers').find('li').attr('data-userposition')
                	});
                    model["approvalDeputies"] = approvalDeputies;
                }

                return model;
            },
            initProfileUpload : function(){
                var _this = this;
                var options = {
                        el : this.$("#swfupload-control"),
                        context_root : GO.contextRoot ,
                        mode : "IMAGE",
                        imgTmpl : ["<span class='wrap_btn wrap_file_upload'><span class='fileinput-button'>",
                        "<span class='ic_adm ic_edit'></span>",
                        "<input type='file' name='file' title='{title}' style='height:inherit;' multiple=''/>",
                        "</span></span>"].join(""),
                        button_title : CommonLang['수정'],
                        button_width : 25,
                        button_height : 25,
                        progressBarUse : false,
                        url : "ad/api/file?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
                    };

                (new FileUpload(options))
                .queue(function(e, data){})
                .start(function(e, data){})
                .progress(function(e, data){})
                .success(function(e, serverData, fileItemEl){
                    if(GO.util.fileUploadErrorCheck(serverData)){
                        $.goMessage(GO.util.serverMessage(serverData));
                        return false;
                    }

                    var data = serverData.data,
                        fileName = data.fileName,
                        filePath = data.filePath,
                        hostId = data.hostId,
                        thumbnail = data.thumbnail,
                        fileExt = data.fileExt.toLowerCase(),
                        re =  new RegExp("(jpeg|jpg|gif|png|bmp)","gi");
                    var test = re.test(fileExt);
                    if(test){
                        _this.$el.find("#thumbnail_image")
                            .attr("src",thumbnail)
                            .attr("data-filepath",filePath)
                            .attr("data-filename",fileName)
                            .attr("host-id", hostId);
                    }else{
                        $.goMessage(CommonLang["포멧 경고"]);
                    }
                })
                .complete(function(e, data){})
                .error(function(e, data){});
            },

            initApprovalUpload: function () {
                var _this = this,
                    options = {
                        el: this.$("#approval_img_upload"),
                        context_root: GO.contextRoot,
                        button_text: "<span class='buttonText'>" + this.type['upload_sign'] + "</span>",
                        button_height: 26,
                        button_width: 78,
                        progressBarUse: false,
                        url: "ad/api/file?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
                    };

                (new FileUpload(options))
                    .queue(function (e, data) {

                    })
                    .start(function (e, data) {

                })
                .progress(function(e, data){

                })
                .success(function(e, serverData, fileItemEl){
                    if(GO.util.fileUploadErrorCheck(serverData)){
                        $.goMessage(GO.util.serverMessage(serverData));
                        return false;
                    }

                    var data = serverData.data,
                        fileName = data.fileName,
                        filePath = data.filePath,
                        hostId = data.hostId,
                        thumbnail = data.thumbnail,
                        fileExt = data.fileExt.toLowerCase(),
                        re =  new RegExp("(jpeg|jpg|gif|png|bmp)","gi");
                    var test = re.test(fileExt);
                    if(test){
                        _this.$el.find("#approval_sign_img")
                            .attr("src",thumbnail)
                            .attr("data-filepath",filePath)
                            .attr("data-filename",fileName)
                            .attr("host-id",hostId);
                    }else{
                        $.goMessage(CommonLang["포멧 경고"]);
                    }
                })
                .complete(function(e, data){
                })
                .error(function(e, data){
                });
            },
            goList : function(){
            	GO.router.navigate("/accounts", {trigger: true, replace: true});
            },
            changeRepresentationEmail : function(){
                var self = this;
            	var checkedRepEmail = this.$el.find('#repUserEmail option:selected').val();
            	var userEmails = this.makeRepresentationEmail();
                this.$('#repUserEmail').find('option').remove();
            	if(userEmails == undefined) return;
            	$.each(userEmails, $.proxy(function(i){
            		self.$el.find('#repUserEmail').append("<option value="+userEmails[i] + ((userEmails[i] == checkedRepEmail) ? " selected" : "") +">"+userEmails[i]+"</option>");
            	}, this));
            },
            makeRepresentationEmail : function(mailinfo){
            	var ids = new Array();
            	var domains = new Array();
            	var userEmail = new Array();

            	ids.push(this.getDefaultID());
	            ids = ids.concat(this.getVirtualEmail());

	            if(ids.length == 1 && ids[0] == ""){
                    this.$el.find('#repUserEmail').append("<option value=''>"+AdminLang['대표 이메일 주소']+"</option>");
	            	return;
	            }

	            domains.push(this.getDefaultDomain());
	            domains = domains.concat(this.virtualDomainsToArray());
	            domains = domains.concat(this.userVirtualDomainsToArray());

	            $.each(ids, function(i){
	            	$.each(domains, function(j){
	            		userEmail.push(ids[i]+"@"+domains[j]);
	            	});
	            });
	            return userEmail;
            },
            getDefaultID : function(){
            	return loginId = this.$el.find("#loginId").val().toLowerCase();
            },
            getDefaultDomain : function(){
            	return domainName = this.companyInfo.domainName;
            },
            getVirtualEmail : function(){
            	var virtualId = new Array();
            	$.each(this.$el.find('#alternateEmails li'), function(i,v){
            		virtualId.push($(this).find('input[name="alternateEmailId"]').val());
            	});
            	return virtualId;
            },
            virtualDomainsToArray : function(){
            	var virtualDomains = this.virtualDomains.toJSON();
            	var virtualDomainList = new Array();
            	$.each(virtualDomains, function(i){
            		virtualDomainList.push(virtualDomains[i].virtualDomain);
            	});
            	return virtualDomainList;
            },
            userVirtualDomainsToArray : function(){
            	var userVirtualDomains = new Array();
            	$.each(this.$el.find('#userVirtualDomains li'), function(i,v){
            		userVirtualDomains.push($(this).find('input[name="userVirtualDomain"]').val());
            	});
            	return userVirtualDomains;
            },
            isSavedGroupAllowList : function(data){
            	var returnValue = false;
                $.each(this.$el.find('ul#sendAllowModeEmails li'), function(i){
                	if(data == $.trim($(this).find('input').val())){
                		returnValue = true;
                	}
                });
                return returnValue;
            },
            deleteBeforeGroupSendAllow : function(data){
            	var self = this;
            	$.each(data.sendAllowList, function(i, v){
               		if(self.isSavedGroupAllowList(v)){
               			self.$el.find('#sendAllowModeEmails li input[value="'+v+'"]').parent('li').remove();
               		}
                });
            },
            checkUserCount : function(e){
            	var userInfo = this.mailInfo.toJSON();
            	var targetEl = $(e.currentTarget);
                if (userInfo.status == "stop" && (targetEl.attr('id') == "status_online" || targetEl.attr('id') == "status_dormant")) {
            		var licenseInfo = this.getAccountCnt();
            		var avaliableCnt = licenseInfo.userCount - licenseInfo.usedCount + licenseInfo.stopUserCount;
            		if(avaliableCnt < 1){
            			targetEl.parents('td').find('p.go_alert').show();
            			this.isChangeStatus = false;
            		}else{
            			targetEl.parents('td').find('p.go_alert').hide();
            			this.isChangeStatus = true;
            		}
            	}else{
            		targetEl.parents('td').find('p.go_alert').hide();
            		this.isChangeStatus = true;
            	}
            },
            getAccountCnt : function(){
                var cnt = {},
                    url = GO.contextRoot + "ad/api/company/license";
                $.go(url,"", {
                    async : false,
                    qryType : 'GET',
                    contentType : 'application/json',
                    responseFn : function(response) {
                        if(response.code === "200"){
                            cnt = response.data;
                        } else{

                        }

                    },
                    error : function(error){
                        $.goAlert(type.error);
                    }
                });
                return cnt;
            },
            setBirthday : function(birthday){
            	var MINYEAR = 1900;
                var MAXYEAR = moment().format('YYYY');
                var MINMONTH = 1;
                var MAXMONTH =12;
                var MINDAY = 1;
                var MAXDAY = 31;
                var yearOptions ='';
                var monthOptions ='';
                var dayOptions ='';

                var birthdayArray = [];
                if(birthday != undefined && birthday != ""){
                	birthdayArray = birthday.split('-');
                }

                for(i = MAXYEAR; i >= MINYEAR; i--){
                	if(parseInt(birthdayArray[0]) == i){
                		yearOptions += "<option value="+i+" selected = 'selected'>" + i + this.type.year + "</option>"
                	}else{
                		yearOptions += "<option value="+i+">" + i + this.type.year + "</option>"
                	}
                }
                for(i = MINMONTH; i <= MAXMONTH; i++){
                	if(parseInt(birthdayArray[1]) == i){
                		monthOptions += "<option value="+App.util.leftPad(i, 2, "0")+" selected = 'selected'>" + i + this.type.month + "</option>"
                	}else{
                		monthOptions += "<option value="+App.util.leftPad(i, 2, "0")+">" + i + this.type.month + "</option>"
                	}
                }
                for(i = MINDAY; i <= MAXDAY; i++){
                	if(parseInt(birthdayArray[2]) == i){
                		dayOptions += "<option value="+App.util.leftPad(i, 2, "0")+" selected = 'selected'>" + i + this.type.day + "</option>"
                	}else{
                		dayOptions += "<option value="+App.util.leftPad(i, 2, "0")+">" + i + this.type.day + "</option>"
                	}
                }
                this.$el.find('#birthdayYear').append(yearOptions);
                this.$el.find('#birthdayMonth').append(monthOptions);
                this.$el.find('#birthdayDay').append(dayOptions);
	        }
        });

        var UserValidate = Backbone.View.extend({
        	initialize : function(){
        		this.errors = [];
        	},

        	add : function(el, message){
        		var $el = (typeof el == "string") ? $(el) : el;

        		this.errors.push({"el" : $el, "message" : message});
        	},

        	hasError : function(){
        		return this.errors.length > 0;
        	},

        	getErrors : function(){
        		return this.errors;
        	}
        });

        return AccountForm;
    });
}).call(this);

define([
        "jquery",
        "backbone",
        "app",
        "admin/models/install_info",
        "hgn!system/templates/site_create",
        "hgn!system/templates/site_modify",
        "system/collections/companies",
        "system/models/companyBaseModel",
        "system/models/siteConfigModel",
        "system/models/directedApproverModel",
        "system/models/indexfssModel",
        "system/models/licenseModel",
        "system/models/tmwCollaborationModel",
        "system/models/installInfoModel",
        "system/models/site_control_option",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "jquery.go-orgslide",
        "jquery.go-sdk",
        "jquery.go-validation",
        "swfupload",
        "swfupload.plugin"
    ],

    function ($,
              Backbone,
              App,
              InstalledInfoModel,
              siteCreateTmpl,
              siteModifyTmpl,
              CompanyCollection,
              CompanyBaseModel,
              SiteConfigModel,
              DirectedApproverModel,
              IndexfssModel,
              LicenseModel,
              TmwCollaborationModel,
              InstallInfoModel,
              SiteControlOptionModel,
              commonLang,
              adminLang) {
        var tmplVal = {
            label_domain_info: adminLang["사이트 기본정보"],
            label_domain: adminLang["도메인 명"],
            label_company_name: adminLang["사이트명"],
            label_domain_indexfs: adminLang["도메인 Indexfs"],
            label_select_host: adminLang["메일 Host를 선택하세요."],
            label_add: commonLang["추가"],
            label_delete: commonLang["삭제"],
            label_password_method: adminLang["비밀번호 암호화"],
            label_clear_text: adminLang["[Clear Text]"],
            label_unix_crypt: adminLang["[Unix Crypt]"],
            label_md5: adminLang["[MD5]"],
            label_sha: adminLang["[SHA]"],
            label_sha256: adminLang["[SHA256]"],
            label_sha512: adminLang["[SHA512]"],
            label_towfish: adminLang["[TWOFISH]"],
            label_ssha: adminLang["[SSHA]"],
            label_bcrypt: adminLang["[BCRYPT]"],
            label_max_user_count: adminLang["최대 사용자 수"],
            label_admin_info: adminLang["관리자 추가정보"],
            label_admin_name: adminLang["이름 (한글)"],
            label_admin_id: adminLang["아이디"],
            label_admin_id_exist: adminLang["아이디가 중복되었습니다."],
            label_admin_id_null: adminLang["아이디를 입력하세요."],
            label_admin_name_null: adminLang["이름을 입력하세요."],
            label_admin_id_invalid: adminLang["사용할 수 없는 아이디입니다."],
            label_service: adminLang["제공 서비스"],
            label_mail_service: adminLang["메일 서비스"],
            label_pop: adminLang["POP"],
            label_imap: adminLang["IMAP"],
            label_webmail: adminLang["WEBMAIL"],
            label_smtp_auth: adminLang["SMTP AUTH"],
            label_home: adminLang["홈"],
            label_use: commonLang["사용"],
            label_not_use: adminLang["사용 안함"],
            label_contact: adminLang["주소록"],
            label_file: commonLang["자료실"],
            label_calendar: commonLang["캘린더"],
            label_board: commonLang["게시판"],
            label_community: commonLang["커뮤니티"],
            label_reserve: adminLang["예약"],
            label_chat: adminLang["대화"],
            label_pcapp: adminLang["PC 메신저"],
            label_Mobile: adminLang["모빌리티"],
            label_mobile_app: adminLang["모바일 앱"],
            label_otp: adminLang['OTP 연동'],
            label_report: adminLang['보고'],
            label_task: adminLang['업무'],
            label_works: 'Works',
            label_todo: adminLang['ToDO+'],
            label_survey: adminLang['설문'],
            label_approval: commonLang['전자결재'],
            label_docfolder: commonLang['전사 문서함'],
            label_org: adminLang['조직도'],
            label_in_charge: adminLang["담당자"],
            label_phone_num: adminLang["전화"],
            label_modify: commonLang["수정"],
            label_cancel: commonLang["취소"],
            label_save: commonLang["저장"],
            label_breadcrumb_mod: adminLang["사이트 관리 > 사이트 수정"],
            label_breadcrumb_add: adminLang["사이트 관리 > 사이트 추가"],
            label_return_list: adminLang["목록으로 돌아가기"],
            label_domain_more_info: adminLang["사이트 추가정보"],
            label_total_account_quota: adminLang["총 할당 계정 용량"],
            label_total_company_quota: adminLang["공용 용량"],
            label_send_warning: adminLang["공용 용량 초과 경고 발송"],
            label_warning_rate: adminLang["공용 용량 초과 경고 비율"],
            label_restriction: adminLang["공용 용량 초과시 제재"],
            label_limitless: adminLang["무제한"],
            label_direct_input: adminLang["직접 입력"],
            label_help_account_quota: adminLang["총 할당 계정 용량 도움말"],
            label_help_company_quota: adminLang["공용 용량 도움말"],
            label_help_restrict_quota: adminLang["공용 용량 초과시 제재 도움말"],
            label_use_abbroad_ip_check: adminLang["해외 로그인 차단"],
            label_allow_encrypted_file: adminLang["암호화된 파일 업로드 허용"],
            label_allow_sync_history: adminLang["동기화 이력관리"],
            label_allow_encrypted_file_description: adminLang["※ 보안설정 >공통 >안티 바이러스의 설정에서 [사이트 별 설정] 시에만  동작합니다."],
            label_directed_approver: adminLang["승인자 직접 지정"],
            label_user_indexfs_datafs: adminLang['사이트 Indexfs / Datafs'],
            label_prev: commonLang["이전"],
            label_save_next: adminLang["저장 후 완료"],
            label_domain_name_help: adminLang["사이트에서 도메인 명 설명"],
            label_site_name_help: adminLang["사이트명 설명"],
            label_algorithm_name_help: adminLang["암호화 설명"],
            label_max_user_help: adminLang["최대 사용자 수 설명"],
            label_site_url: adminLang["접속 URL"],
            label_siteUrl_desc: adminLang["접속 URL 도움말"],
            label_ehr_config: adminLang['근태관리'],
            label_welfare_config: adminLang['복지포인트'],
            label_sms_config: adminLang['문자발송'],
            label_security: adminLang['보안센터'],
            label_smartFilter: adminLang['스마트 분류'],
            label_docs: adminLang['문서관리'],
            label_store: commonLang['Link+'],
            label_period: adminLang['사용 기간'],
            label_period_ment: adminLang['사용기간 중에만 접근 가능합니다.'],
            label_task_guide: adminLang['업무서비스안내문구'],
            label_channel: adminLang['외부 시스템'],
            기본: adminLang['기본'],
            신규: adminLang['신규'],
            label_alliance_system: '시스템 연동',
            label_alliance_system_guide: '※ 제휴 시스템과 연동할 수 있습니다.',
            메신저타입설정: adminLang['메신저 타입 설정'],
            label_password: adminLang['비밀번호'],
            label_password_confirm: adminLang['비밀번호 확인'],
            label_password_creation_rule: adminLang['비밀번호 변경 기본규칙'],
            label_otp_in_admin: adminLang["관리자 페이지에서 구글 OTP 사용"]
        };
        var instance = null;
        var siteCreate = App.BaseView.extend({
            initialize: function (options) {
                this.options = options || {};
                this.siteId = this.options.siteId;
                this.modUserCount = 0;
                this.meetingRoomCount = 0;
                this.licenseModel = LicenseModel.read();
                this.installInfoModel = InstallInfoModel.read();
                this.tmwCollaborationModel = TmwCollaborationModel.read();
                this.siteControlOptionModel = SiteControlOptionModel.read();
                this.isSiteControlOn = this.siteControlOptionModel.isSiteControlOn();
                this.isSaaS = GO.session().brandName == "DO_SAAS";
                this.unbindEvent();
                this.bindEvent();
            },
            unbindEvent: function () {
                this.$el.off("click", "#btn_site_ok");
                this.$el.off("click", "#btn_site_modify");
                this.$el.off("click", "#btn_site_cancel");
                this.$el.off("click", "#btn_site_prev");
                this.$el.off("click", "span#btn_return_list");
                this.$el.off("click", "span#btn_add_indexFs");
                this.$el.off("click", "span#btn_delete_indexFs");
                this.$el.off("click", "span#btn_add_dataFs");
                this.$el.off("click", "span#btn_delete_dataFs");
                this.$el.off("click", "select#hostName");
                this.$el.off("click", "span.editable");
                this.$el.off("click", "form[name='formSiteConfig'] input:radio");
                this.$el.off("keyup", "input#totalAccountQuota");
                this.$el.off("keyup", "input#companyQuota");
            },
            bindEvent: function () {
                this.$el.on("click", "#btn_site_ok", $.proxy(this.siteSave, this));
                this.$el.on("click", "#btn_site_modify", $.proxy(this.siteModify, this));
                this.$el.on("click", "#btn_site_cancel", $.proxy(this.siteCancel, this));
                this.$el.on("click", "#btn_site_prev", $.proxy(this.siteMovePrev, this));
                this.$el.on("click", "span#btn_return_list", $.proxy(this.siteReturnList, this));
                this.$el.on("click", "span#btn_add_indexFs", $.proxy(this.addIndexFs, this));
                this.$el.on("click", "span#btn_delete_indexFs", $.proxy(this.deleteIndexFs, this));
                this.$el.on("click", "span#btn_add_dataFs", $.proxy(this.addDataFs, this));
                this.$el.on("click", "span#btn_delete_dataFs", $.proxy(this.deleteDataFs, this));
                this.$el.on("change", "select#hostName", $.proxy(this.changeSelectBox, this));
                this.$el.on("click", "span.editable", $.proxy(this.changeInput, this));
                this.$el.on("click", "form[name='formSiteConfig'] input:radio", $.proxy(this.toggle, this));
                this.$el.on("keyup", "input#totalAccountQuota", $.proxy(this._validateNumber, this));
                this.$el.on("keyup", "input#companyQuota", $.proxy(this._validateNumber, this));
            },
            render: function () {
                var tmpl;
                var installInfo = this.installInfoModel.toJSON();
                $('#site').addClass('on');
                this.$el.empty();
                if (this.siteId) {
                    $('.breadcrumb .path').html(adminLang["사이트 관리 > 사이트 수정"]);
                    this.siteConfigModel = SiteConfigModel.get(this.siteId);
                    this.siteData = this.siteConfigModel.toJSON();
                    tmpl = siteModifyTmpl({
                        siteInfo: this.siteData,
                        lang: tmplVal,
                        isSaaS: this.isSaaS,
                        isSiteControlOn: this.isSiteControlOn,
                        isInstalled: installInfo.installed
                    });
                    this.$el.html(tmpl);
                    this.chackLicense();
                    this.checkTmwConfig();
                    initDatepicker.call(this);
                    this.setSiteModifyData(this.siteData);
                } else {
                    $('.breadcrumb .path').html(adminLang["사이트 관리 > 사이트 추가"]);
                    tmpl = siteCreateTmpl({
                        lang: tmplVal,
                        isSaaS: this.isSaaS,
                        isInstalled: installInfo.installed
                    });
                    this.$el.html(tmpl);
                    this.chackLicense();
                    this.checkTmwConfig();
                    initDatepicker.call(this);
                }
                this.getHostName();
                this.getDomains(this.siteId);
                this.directedApproverModel = DirectedApproverModel.get();
                this.directedApproverData = this.directedApproverModel.toJSON();
                if (!installInfo.installed) {
                    $('#indexfsTr').hide();
                    $('#datafsTr').hide();
                }

                if ("on" != this.directedApproverData.directedApprover) {
                    $('#directedApprover').hide();
                }
            },
            setSiteModifyData: function (data) {
                this.$el.find('#indexFss').val(data.indexFss);
                this.$el.find('#passwordMethod').val(data.algorithmName);
                this.modUserCount = data.userCount;
                this.meetingRoomCount = data.config.meetingRoomCount;
                this.$el.find('input[name="serviceModel_pop"]').attr('checked', data.serviceModel.pop);
                this.$el.find('input[name="serviceModel_imap"]').attr('checked', data.serviceModel.imap);
                this.$el.find('input[name="serviceModel_webMail"]').attr('checked', data.serviceModel.webMail);
                this.$el.find('input[name="serviceModel_smtpauth"]').attr('checked', data.serviceModel.smtpauth);
                this.$el.find('input[name="config_homeService"][value="' + data.config.homeService + '"]').attr('checked', true);
                this.$el.find('input[name="config_contactService"][value="' + data.config.contactService + '"]').attr('checked', true);
                this.$el.find('input[name="config_webfolderService"][value="' + data.config.webfolderService + '"]').attr('checked', true);
                this.$el.find('input[name="config_calendarService"][value="' + data.config.calendarService + '"]').attr('checked', true);
                this.$el.find('input[name="config_boardService"][value="' + data.config.boardService + '"]').attr('checked', true);
                this.$el.find('input[name="config_communityService"][value="' + data.config.communityService + '"]').attr('checked', true);
                this.$el.find('input[name="config_assetService"][value="' + data.config.assetService + '"]').attr('checked', true);
                this.$el.find('input[name="config_reportService"][value="' + data.config.reportService + '"]').attr('checked', true);
                this.$el.find('input[name="config_taskService"][value="' + data.config.taskService + '"]').attr('checked', true);
                this.$el.find('input[name="config_worksService"][value="' + data.config.worksService + '"]').attr('checked', true);
                this.$el.find('input[name="config_todoService"][value="' + data.config.todoService + '"]').attr('checked', true);
                this.$el.find('input[name="config_surveyService"][value="' + data.config.surveyService + '"]').attr('checked', true);
                this.$el.find('input[name="config_approvalService"][value="' + data.config.approvalService + '"]').attr('checked', true);
                this.$el.find('input[name="config_docfolderService"][value="' + data.config.docfolderService + '"]').attr('checked', true);
                this.$el.find('input[name="config_chatService"][value="' + data.config.chatService + '"]').attr('checked', true);
                this.$el.find('input[name="config_pcappService"][value="' + data.config.pcappService + '"]').attr('checked', true);
                this.$el.find('input[name="config_mobileService"][value="' + data.config.mobileService + '"]').attr('checked', true);
                this.$el.find('input[name="config_mobileAppService"][value="' + data.config.mobileAppService + '"]').attr('checked', true);
                this.$el.find('input[name="config_orgService"][value="' + data.config.orgService + '"]').attr('checked', true);
                this.$el.find('input[name="config_otpService"][value="' + data.config.otpService + '"]').attr('checked', true);
                this.$el.find('input[name="config_useAbbroadIpCheck"][value="' + data.config.useAbbroadIpCheck + '"]').attr('checked', true);
                this.$el.find('input[name="config_allowEncryptedFileUploadCheck"][value="' + data.config.allowEncryptedFileUploadCheck + '"]').attr('checked', true);
                this.$el.find('input[name="config_allowSyncHistory"][value="' + data.config.allowSyncHistory + '"]').attr('checked', true);
                this.$el.find('input[name="config_directedApprover"][value="' + data.config.directedApprover + '"]').attr('checked', true);
                this.$el.find('input[name="config_ehrService"][value="' + data.config.ehrService + '"]').attr('checked', true);
                this.$el.find('input[name="config_smsService"][value="' + data.config.smsService + '"]').attr('checked', true);
                this.$el.find('input[name="config_docsService"][value="' + data.config.docsService + '"]').attr('checked', true);
                this.$el.find('input[name="config_smartFilter"][value="' + data.config.smartFilter + '"]').attr('checked', true);
                this.$el.find('input[name="config_securityCenter"][value="' + data.config.securityCenter + '"]').attr('checked', true);
                this.$el.find('input[name="config_channelService"][value="' + data.config.channelService + '"]').attr('checked', true);
                this.$el.find('input[name="config_messengerType"][value="' + data.config.messengerType + '"]').prop('checked', true);
                this.$el.find('input[name="config_zoomChat"][value="' + data.config.zoomChat + '"]').prop('checked', true);
                this.$el.find('input[name="config_allianceSystemService"][value="' + data.config.allianceSystemService + '"]').attr('checked', true);
                this.$el.find('input[name="config_storeService"][value="' + data.config.storeService + '"]').attr('checked', true);

                if ($('[name="config_ehrService"]:radio:checked').val() == "off") {
                    $('#welfareConfig').hide();
                } else {
                    this.$el.find('input[name="config_welfareConfig"][value="' + data.config.welfareConfig + '"]').prop('checked', true);
                }


                if (data.baseCompanyConfig.totalAccountQuota > 1) {
                    this.$el.find('input[name="baseCompanyConfig_totalAccountQuota"][value="self"]').attr('checked', true);
                    this.$el.find('#totalAccountQuota').attr('value', data.baseCompanyConfig.totalAccountQuota / 1024 / 1024 / 1024);
                    this._hideIfSiteControlOn(this.$el.find(".totalAccountQuotaLimitless"));
                    this._removeMarginIfSiteControlOn(this.$el.find(".totalAccountQuotaDirectInput"));
                } else {
                    this.$el.find('input[name="baseCompanyConfig_totalAccountQuota"][value="' + data.baseCompanyConfig.totalAccountQuota + '"]').attr('checked', true);
                    $('#totalAccountQuota').attr('disabled', true);
                    this._hideIfSiteControlOn(this.$el.find(".totalAccountQuotaDirectInput"));
                }
                if (data.baseCompanyConfig.companyQuota > 1) {
                    this.$el.find('input[name="baseCompanyConfig_companyQuota"][value="self"]').attr('checked', true);
                    this.$el.find('#companyQuota').attr('value', data.baseCompanyConfig.companyQuota / 1024 / 1024 / 1024);
                    this._hideIfSiteControlOn(this.$el.find(".companyQuotaLimitless"));
                    this._removeMarginIfSiteControlOn(this.$el.find(".companyQuotaDirectInput"));
                } else {
                    this.$el.find('input[name="baseCompanyConfig_companyQuota"][value="' + data.baseCompanyConfig.companyQuota + '"]').attr('checked', true);
                    $('#sendWarningMode').hide();
                    $('#warningRate').hide();
                    $('#restrict').hide();
                    $('#companyQuota').attr('disabled', true);
                    $('#companyQuota_on').parents('tr').addClass("last");
                    this._hideIfSiteControlOn(this.$el.find(".companyQuotaDirectInput"));
                }
                this.$el.find('input[name="baseCompanyConfig_sendWarningExceedCompanyQuota"][value="' + data.baseCompanyConfig.sendWarningExceedCompanyQuota + '"]').attr('checked', true);
                if (!data.baseCompanyConfig.sendWarningExceedCompanyQuota) {
                    $('#companyQuotaWarningRate').attr('disabled', true);
                }
                this.$el.find('input[name="baseCompanyConfig_companyQuotaWarningRate"]').attr('value', data.baseCompanyConfig.companyQuotaWarningRate == 0 ? 90 : data.baseCompanyConfig.companyQuotaWarningRate);
                this.$el.find('input[name="baseCompanyConfig_restrictCompanyQuota"][value="' + data.baseCompanyConfig.restrictCompanyQuota + '"]').attr('checked', true);
                this.$el.find('input[name="baseCompanyConfig_restrictCompanyPeriod"][value="' + data.baseCompanyConfig.restrictCompanyPeriod + '"]').attr('checked', true);
                if (data.baseCompanyConfig.restrictCompanyPeriod == true) {
                    this._hideIfSiteControlOn(this.$el.find(".restrictCompanyPeriod_on"));
                    this._removeMarginIfSiteControlOn(this.$el.find(".restrictCompanyPeriod_false"));
                    $('#baseCompanyConfig_restrictCompanyPeriodStart').attr('disabled', this.isSiteControlOn);
                    $('#baseCompanyConfig_restrictCompanyPeriodEnd').attr('disabled', this.isSiteControlOn);

                    $('#baseCompanyConfig_restrictCompanyPeriodStart').val(data.baseCompanyConfig.restrictCompanyPeriodStart);
                    $('#baseCompanyConfig_restrictCompanyPeriodEnd').val(data.baseCompanyConfig.restrictCompanyPeriodEnd);
                } else {
                    this._hideIfSiteControlOn(this.$el.find(".restrictCompanyPeriod_false"));
                    $('#baseCompanyConfig_restrictCompanyPeriodStart').attr('disabled', true);
                    $('#baseCompanyConfig_restrictCompanyPeriodEnd').attr('disabled', true);
                }

                var indexfss = data.indexFss == null ? 0 : data.indexFss;
                for (var i = 0; i < indexfss.length; i++) {
                    $('#indexFss').append('<OPTION value="' + indexfss[i] + '">' + indexfss[i] + '</OPTION>');
                }
                var datafss = data.dataFss == null ? 0 : data.dataFss;
                for (var i = 0; i < datafss.length; i++) {
                    $('#dataFss').append('<OPTION value="' + datafss[i] + '">' + datafss[i] + '</OPTION>');
                }
            },
            _hideIfSiteControlOn: function ($el) {
                if (this.isSiteControlOn) {
                    $el.css("display", "none");
                } else {
                    $el.css("display", "inline-block");
                }
            },
            _removeMarginIfSiteControlOn: function ($el) {
                if (this.isSiteControlOn) {
                    $el.css("margin-left", "0px");
                }
            },
            changeInput: function (e) {
                var $toggleEl = $(e.target),
                    hideTarget;

                if ($toggleEl.hasClass("ic_edit")) {
                    hideTarget = $toggleEl.parent().parent();
                    hideTarget.hide();
                    hideTarget.next().show();
                } else {
                    $toggleEl.hide();
                    $toggleEl.next().show();
                }
            },
            toggle: function (e) {
                var targetEl = $(e.currentTarget);

                if (targetEl.attr('name').indexOf("config_") !== -1) {
                    this.checkServicesState(targetEl);
                } else {
                    this.changeBaseCompanyConfig(targetEl);
                }

            },
            checkServicesState: function (targetEl) {
                var message = '',
                    callback = '',
                    cancelCallback = '';

                if (targetEl.attr('name') == "config_chatService" &&
                    $('[name="config_chatService"]:radio:checked').val() == "off") {

                    message = adminLang['대화를 사용하지 않으면 PC 메신저를 사용할 수 없습니다.'];
                    callback = function () {
                        $('#pcappService_off').attr('checked', true);
                    };
                    cancelCallback = function () {
                        $('#chatService_on').attr('checked', true);
                    };

                } else if ((targetEl.attr('name') == "config_pcappService") &&
                    $('[name="config_chatService"]:radio:checked').val() == "off") {

                    message = adminLang['대화를 사용하지 않으면 PC 메신저를 사용할 수 없습니다.'];
                    callback = function () {
                        $('#chatService_on').attr('checked', true);
                        $('#pcappService_on').attr('checked', true);
                    };
                    cancelCallback = function () {
                        $('#pcappService_off').attr('checked', true);
                    };

                } else if (targetEl.attr('name') == "config_orgService" &&
                    $('[name="config_orgService"]:radio:checked').val() == "off") {

                    message = adminLang['조직도를 사용하지 않으면 업무, 보고, 결재를 사용할 수 없습니다.'];
                    callback = function () {
                        $('#reportService_off').attr('checked', true);
                        $('#taskService_off').attr('checked', true);
                        $('#worksService_off').attr('checked', true);
                        $('#approvalService_off').attr('checked', true);
                    };
                    cancelCallback = function () {
                        $('#orgService_on').attr('checked', true);
                    };

                } else if (targetEl.attr('name') == "config_reportService" &&
                    $('[name="config_orgService"]:radio:checked').val() == "off") {

                    message = adminLang['조직도를 사용하지 않으면 업무, 보고, 결재를 사용할 수 없습니다.'];
                    callback = function () {
                        $('#orgService_on').attr('checked', true);
                    };
                    cancelCallback = function () {
                        $('#reportService_off').attr('checked', true);
                    };

                } else if (targetEl.attr('name') == "config_taskService" &&
                    $('[name="config_orgService"]:radio:checked').val() == "off") {

                    message = adminLang['조직도를 사용하지 않으면 업무, 보고, 결재를 사용할 수 없습니다.'];
                    callback = function () {
                        $('#orgService_on').attr('checked', true);
                    };
                    cancelCallback = function () {
                        $('#taskService_off').attr('checked', true);
                    };

                } else if (targetEl.attr('name') == "config_worksService" &&
                    $('[name="config_orgService"]:radio:checked').val() == "off") {

                    message = adminLang['조직도를 사용하지 않으면 업무, 보고, 결재를 사용할 수 없습니다.'];
                    callback = function () {
                        $('#orgService_on').attr('checked', true);
                    };
                    cancelCallback = function () {
                        $('#worksService_off').attr('checked', true);
                    };

                } else if (targetEl.attr('name') == "config_approvalService" &&
                    $('[name="config_orgService"]:radio:checked').val() == "off") {

                    message = adminLang['조직도를 사용하지 않으면 업무, 보고, 결재를 사용할 수 없습니다.'];
                    callback = function () {
                        $('#orgService_on').attr('checked', true);
                    };
                    cancelCallback = function () {
                        $('#approvalService_off').attr('checked', true);
                    };

                } else if (targetEl.attr('name') == "config_mobileService" &&
                    $('[name="config_mobileService"]:radio:checked').val() == "off") {

                    message = adminLang['모빌리티를 사용하지 않으면 모바일 앱과 OTP 연동을 사용할 수 없습니다.'];
                    callback = function () {
                        $('#mobileAppService_off').attr('checked', true);
                        $('#otpService_off').attr('checked', true);
                    };
                    cancelCallback = function () {
                        $('#mobileService_on').attr('checked', true);
                    };

                } else if (targetEl.attr('name') == "config_mobileAppService" &&
                    $('[name="config_mobileService"]:radio:checked').val() == "off") {

                    message = adminLang['모빌리티를 사용하지 않으면 모바일 앱을 사용할 수 없습니다.'];
                    callback = function () {
                        $('#mobileService_on').attr('checked', true);
                    };
                    cancelCallback = function () {
                        $('#mobileAppService_off').attr('checked', true);
                    };

                } else if (targetEl.attr('name') == "config_otpService" &&
                    $('[name="config_mobileService"]:radio:checked').val() == "off") {

                    message = adminLang['모빌리티를 사용하지 않으면 OTP 연동을 사용할 수 없습니다.'];
                    callback = function () {
                        $('#mobileService_on').attr('checked', true);
                    };
                    cancelCallback = function () {
                        $('#otpService_off').attr('checked', true);
                    };

                } else if (targetEl.attr('name') == "config_ehrService") {
                    if ($('[name="config_ehrService"]:radio:checked').val() == "on") {
                        $('#welfareConfig').show();
                    } else {
                        message = adminLang['e-HR를 사용하지 않으면 근태관리,인사카드를 사용할 수 없습니다.'];
                        callback = function () {
                            $('#ehrService_off').attr('checked', true);
                            $('#welfareConfig').hide();
                        };
                        cancelCallback = function () {
                            $('#ehrService_on').attr('checked', true);
                        };
                    }
                }

                if (message != '') {
                    this.makeConfirmMsg(message, callback, cancelCallback);
                }
            },
            makeConfirmMsg: function (message, callback, cancelCallback) {
                $.goConfirm(message, "", callback, cancelCallback, commonLang['확인']);
            },
            changeBaseCompanyConfig: function (targetEl) {
                if (targetEl.attr('name') == "baseCompanyConfig_companyQuota" && targetEl.val() == "0") {
                    $('#sendWarningMode').hide();
                    $('#warningRate').hide();
                    $('#restrict').hide();
                    $('#companyQuota').attr('disabled', true);
                    $('#companyQuota_on').parents('tr').addClass("last");
                } else if (targetEl.attr('name') == "baseCompanyConfig_companyQuota" && targetEl.val() != "0") {
                    $('#sendWarningMode').show();
                    $('#warningRate').show();
                    $('#restrict').show();
                    $('#companyQuota').attr('disabled', false);
                    if ($('#companyQuota').val() == "") {
                        $('#companyQuota').attr('value', '10');
                    }
                    $('#companyQuota_on').parents('tr').removeClass("last");
                } else if (targetEl.attr('name') == "baseCompanyConfig_restrictCompanyPeriod" && targetEl.val() == "true") {
                    $('#baseCompanyConfig_restrictCompanyPeriodStart').attr('disabled', false);
                    $('#baseCompanyConfig_restrictCompanyPeriodEnd').attr('disabled', false);
                } else if (targetEl.attr('name') == "baseCompanyConfig_restrictCompanyPeriod" && targetEl.val() == "false") {
                    $('#baseCompanyConfig_restrictCompanyPeriodStart').attr('disabled', true);
                    $('#baseCompanyConfig_restrictCompanyPeriodEnd').attr('disabled', true);
                } else if (targetEl.attr('name') == "baseCompanyConfig_totalAccountQuota" && targetEl.val() == "0") {
                    $('#totalAccountQuota').attr('disabled', true);
                } else if (targetEl.attr('name') == "baseCompanyConfig_totalAccountQuota" && targetEl.val() != "0") {
                    $('#totalAccountQuota').attr('disabled', false);
                    if ($('#totalAccountQuota').val() == "") {
                        $('#totalAccountQuota').attr('value', '2');
                    }
                } else if (targetEl.attr('name') == "baseCompanyConfig_sendWarningExceedCompanyQuota" && targetEl.val() == "true") {
                    $('#companyQuotaWarningRate').attr('disabled', false);
                } else if (targetEl.attr('name') == "baseCompanyConfig_sendWarningExceedCompanyQuota" && targetEl.val() == "false") {
                    $('#companyQuotaWarningRate').attr('disabled', true);
                }
            },
            getHostName: function () {
                var installInfo = this.installInfoModel.toJSON();
                url = GO.contextRoot + "ad/api/system/host";
                var self = this;
                $.go(url, '', {
                    qryType: 'GET',
                    responseFn: function (response) {
                        if (response.code == 200) {
                            for (var i = 0; i < response.data.length; i++) {
                                if (!installInfo.installed) {
                                    $('#hostName').append('<OPTION value="' + response.data[i].hostName + '" selected>' + response.data[i].hostName + '</OPTION>');
                                    self.changeSelectBox();
                                } else {
                                    $('#hostName').append('<OPTION value="' + response.data[i].hostName + '">' + response.data[i].hostName + '</OPTION>');
                                }
                            }
                        }
                    },
                    error: function (response) {

                    }
                });
            },
            chackLicense: function () {
                var self = this;

                if (!(self.licenseModel.get('socialServicePack'))) {
                    $('#boardService').hide();
                    $('#communityService').hide();
                    $('#assetService').hide();
                    $('#surveyService').hide();
                }
                if (!(self.licenseModel.get('mobileServicePack'))) {
                    $('#chatService').hide();
                    $('#pcappService').hide();
                    $('#mobileService').hide();
                    $('#mobileAppService').hide();
                }
                if (!(self.licenseModel.get('collaborationServicePack'))) {
                    $('#worksService').hide();
                    $('#taskService').hide();
                    $('#reportService').hide();
                    $('#todoService').hide();
                }
                if (!(self.licenseModel.get('approvalServicePack'))) {
                    $('#approvalService').hide();
                    $('#docfolderService').hide();
                }
                if (!(self.licenseModel.get('ehrServicePack'))) {
                    $('#ehrService').hide();
                }
                if (!(self.licenseModel.get('smsServicePack'))) {
                    $('#smsService').hide();
                }
                if (!(self.licenseModel.get('useTaskService'))) {
                    $('#taskService').hide();
                }
                if (!(self.licenseModel.get('storeServicePack'))) {
                    $('#storeService').hide();
                }
                if (!(self.licenseModel.get('allianceSystemServicePack'))) {
                    $('#allianceSystemService').hide();
                }
            },
            checkTmwConfig: function () {
                var self = this;
                if (!(self.tmwCollaborationModel.get('useSmartFilter'))) {
                    $('#smartFilter').hide();
                }
                if (!(self.tmwCollaborationModel.get('useSecurityCenter'))) {
                    $('#securityCenter').hide();
                }
            },
            addIndexFs: function () {
                var self = this,
                    hostName = $('#hostName').attr('value'),
                    indexFs = hostName + ":" + $('#indexFs').attr('value'),
                    validate = true;
                $('#indexFss > option').attr('selected', false);

                if (hostName == "") {
                    self.showValidateMsg("indexFss", adminLang["메일 Host를 선택하세요."]);
                    return;
                }

                $('#indexFss option').each(function () {
                    if ($(this).val() == indexFs) {
                        self.showValidateMsg("indexFss", adminLang["이미 존재하는 도메인 Indexfs 입니다."]);
                        $(this).attr('selected', true);
                        validate = false;
                        return false;
                    }
                });

                if (validate == true) {
                    $('#indexFss').append('<OPTION value="' + indexFs + '">' + indexFs + '</OPTION>');
                }

            },
            deleteIndexFs: function () {
                var indexFss = document.formSiteConfig.indexFss;
                for (var i = 0; i < indexFss.options.length;) {
                    if (indexFss.options[i].selected) {
                        indexFss.removeChild(indexFss.options[i]);
                    } else {
                        i++;
                    }
                }
            },
            addDataFs: function () {
                var self = this,
                    hostName = $('#hostName').attr('value'),
                    dataFs = hostName + ":" + $('#dataFs').attr('value'),
                    validate = true;
                $('#dataFss > option').attr('selected', false);

                if (hostName == "") {
                    self.showValidateMsg("dataFss", adminLang["메일 Host를 선택하세요."]);
                    return;
                }

                $('#dataFss option').each(function () {
                    if ($(this).val() == dataFs) {
                        self.showValidateMsg("dataFss", adminLang["이미 존재하는 도메인 datafs 입니다."]);
                        $(this).attr('selected', true);
                        validate = false;
                        return false;
                    }
                });

                if (validate == true) {
                    $('#dataFss').append('<OPTION value="' + dataFs + '">' + dataFs + '</OPTION>');
                }

            },
            deleteDataFs: function () {
                var dataFss = document.formSiteConfig.dataFss;
                for (var i = 0; i < dataFss.options.length;) {
                    if (dataFss.options[i].selected) {
                        dataFss.removeChild(dataFss.options[i]);
                    } else {
                        i++;
                    }
                }
            },
            changeSelectBox: function () {
                if ($('#hostName').attr('value') != "") {
                    this.getIndexfss("indexFs");
                    this.getIndexfss("dataFs");

                    $('#indexFs').show();
                    $('#dataFs').show();
                } else {

                    $('#indexFs').hide();
                    $('#dataFs').hide();
                }
            },
            getIndexfss: function (type) {
                var url = "";
                var installInfo = this.installInfoModel.toJSON();
                var self = this;
                if (type == "indexFs") {
                    url = GO.contextRoot + "ad/api/system/indexfss";
                } else {
                    url = GO.contextRoot + "ad/api/system/datafss";
                }
                $.go(url, {hostname: $('#hostName').attr('value')}, {
                    qryType: 'GET',
                    responseFn: function (response) {
                        if (response.code == 200) {
                            $('#' + type).find('option').remove();
                            for (var i = 0; i < response.data.length; i++) {
                                if (type == "indexFs") {
                                    $('#indexFs').append('<OPTION value="' + response.data[i].indexFs + '">' + response.data[i].indexFs + '</OPTION>');
                                    if (!installInfo.installed) {
                                        self.addIndexFs();
                                    }
                                } else {
                                    $('#dataFs').append('<OPTION value="' + response.data[i] + '">' + response.data[i] + '</OPTION>');
                                    if (!installInfo.installed) {
                                        self.addDataFs();
                                    }
                                }
                            }
                        }
                    }
                });
            },

            checkValidation: function (form, mode) {
                var self = this,
                    validate = true,
                    availableUserCount = self.isExceedLicenseUser() + self.modUserCount,
                    defaultUsedUserCount = self.siteData == undefined ? 1 : self.siteData.usedCount - self.siteData.stopUserCount,
                    sendWarningMode = $('input[name="baseCompanyConfig_sendWarningExceedCompanyQuota"]:radio:checked').val(),
                    usedTotalAccountQuota = self.siteData == undefined ? 0 : self.siteData.totalAccountQuota,
                    usedCompanyQuota = self.siteData == undefined ? 0 : self.siteData.companyQuota;

                var adminPassword;
                var adminPasswordConfirm;

                $.each(form.serializeArray(), function (k, v) {

                    if (v.name == 'name' && (!$.goValidation.isCheckLength(1, 128, v.value))) {
                        self.showValidateMsg(v.name, adminLang["회사 명을 입력하세요."]);
                        validate = false;
                        return false;
                    }

                    if (v.name == 'siteUrl' && (!$.goValidation.isCheckLength(1, 128, $.trim(v.value)))) {
                        self.showValidateMsg(v.name, adminLang["사이트 웹 주소를 입력하세요."]);
                        validate = false;
                        return false;
                    } else if (v.name == 'siteUrl' && !$.goValidation.charValidation("\\", v.value)) {
                        self.showValidateMsg(v.name, adminLang["입력할 수 없는 문자"]);
                        validate = false;
                        return false;
                    } else if (v.name == 'siteUrl' && v.value.match(/http:\/\//)) {
                        self.showValidateMsg(v.name, adminLang["http://는 입력할 수 없습니다."]);
                        validate = false;
                        return false;
                    }

                    if ($('#indexFss').val() == null) {
                        self.showValidateMsg("indexFss", adminLang["메일 Indexfs는 하나 이상 추가되어야 합니다."]);
                        validate = false;
                        return false;
                    }

                    if ($('#dataFss').val() == null) {
                        self.showValidateMsg("dataFss", adminLang["메일 Indexfs는 하나 이상 추가되어야 합니다."]);
                        validate = false;
                        return false;
                    }

                    if (v.name == "userCount" && v.value <= 0) {
                        self.showValidateMsg(v.name, adminLang["최대 사용자 수를 입력하세요."]);
                        validate = false;
                        return false;
                    } else if (v.name == "userCount" && (!$.goValidation.isNumber(v.value))) {
                        self.showValidateMsg(v.name, adminLang["최대 사용자 수는 숫자만 입력하세요."]);
                        validate = false;
                        return false;
                    } else if (v.name == "userCount" && (availableUserCount - v.value < 0 || v.value < defaultUsedUserCount)) {
                        self.showValidateMsg(v.name, App.i18n(adminLang["최대 사용자 수의 설정 가능 범위는 0 ~ 00까지입니다."], {
                            "arg0": defaultUsedUserCount,
                            "arg1": availableUserCount
                        }));
                        validate = false;
                        return false;
                    }

                    if (mode == "new") {
                        if (v.name == "info_contactPerson" && (!$.goValidation.isCheckLength(1, 128, v.value))) {
                            self.showValidateMsg(v.name, adminLang["이름을 입력하세요."]);
                            validate = false;
                            return false;
                        }

                        if (v.name == "info_adminId" && (!$.goValidation.isCheckLength(1, 128, v.value))) {
                            self.showValidateMsg(v.name, adminLang["아이디를 입력하세요."]);
                            validate = false;
                            return false;
                        } else if (v.name == "info_adminId" && ($.goValidation.isInvalidEmailId(v.value))) {
                            self.showValidateMsg(v.name, adminLang["사용할 수 없는 아이디입니다."]);
                            validate = false;
                            return false;
                        }

                        if (v.name == "info_adminPassword" || v.name == "info_adminPasswordConfirm") {
                            if (v.name == "info_adminPassword") {
                                adminPassword = v.value;
                            }

                            if (v.name == "info_adminPasswordConfirm") {
                                adminPasswordConfirm = v.value;
                            }

                            if (!$.goValidation.isCheckLength(8, 16, v.value) ||
                                !v.value.match(/[A-Za-z]/) ||
                                !v.value.match(/[0-9]/) ||
                                !v.value.match(/[-~!@#$%^&*(_)<>;+={}\[\]\|:"',.?/`]/)) {
                                self.showValidateMsg(v.name, adminLang['비밀번호 변경 기본규칙']);
                                validate = false;
                                return false;
                            }
                        }
                    }

                    var splitName = v.name.split("_");
                    v.name = splitName[1];

                    if (v.name == 'totalAccountQuota' && v.value != "0") {
                        if ($('#totalAccountQuota').val() < 2 || $('#totalAccountQuota').val() > 102400) {
                            self.showValidateMsg(v.name, App.i18n(adminLang["{{quota}}의 설정 가능 범위는 {{arg1}} ~ {{arg2}}까지입니다."], {
                                "quota": adminLang["총 할당 계정 용량"],
                                "arg1": 2,
                                "arg2": 102400
                            }));
                            validate = false;
                            return false;
                        } else if (!$.goValidation.isNumber($('#totalAccountQuota').val())) {
                            self.showValidateMsg(v.name, App.i18n(adminLang["{{quota}}에 숫자를 입력해주세요."], {"quota": adminLang["총 할당 계정 용량"]}));
                            validate = false;
                            return false;
                        } else if (usedTotalAccountQuota != 0 && $('#totalAccountQuota').val() * 1024 * 1024 * 1024 < usedTotalAccountQuota) {
                            self.showValidateMsg(v.name, App.i18n(adminLang["현재 사용량은 {{arg1}}입니다. {{arg1}}이상으로 설정해주세요."], {"arg1": App.util.getHumanizedFileSize(usedTotalAccountQuota)}));
                            validate = false;
                            return false;
                        }
                    }

                    if (v.name == 'companyQuota' && v.value != "0") {
                        if ($('#companyQuota').val() < 1 || $('#companyQuota').val() > 102400) {
                            self.showValidateMsg(v.name, App.i18n(adminLang["{{quota}}의 설정 가능 범위는 {{arg1}} ~ {{arg2}}까지입니다."], {
                                "quota": adminLang["공용 용량"],
                                "arg1": 1,
                                "arg2": 102400
                            }));
                            validate = false;
                            return false;
                        } else if (!$.goValidation.isNumber($('#companyQuota').val())) {
                            self.showValidateMsg(v.name, App.i18n(adminLang["{{quota}}에 숫자를 입력해주세요."], {"quota": adminLang["공용 용량"]}));
                            validate = false;
                            return false;
                        } else if (usedCompanyQuota != 0 && $('#companyQuota').val() * 1024 * 1024 * 1024 < usedCompanyQuota) {
                            self.showValidateMsg(v.name, App.i18n(adminLang["현재 사용량은 {{arg1}}입니다. {{arg1}}이상으로 설정해주세요."], {"arg1": App.util.getHumanizedFileSize(usedCompanyQuota)}));
                            validate = false;
                            return false;
                        }
                    }

                    if (v.name == 'companyQuotaWarningRate' && sendWarningMode == "false") {
                        v.value = "";
                    }

                    if (sendWarningMode == "true" && v.name == 'companyQuotaWarningRate' && v.value == "") {
                        self.showValidateMsg(v.name, App.i18n(adminLang["{{quota}}의 설정 가능 범위는 {{arg1}} ~ {{arg2}}까지입니다."], {
                            "quota": adminLang["공용 용량 초과 경고 비율"],
                            "arg1": 1,
                            "arg2": 99
                        }));
                        validate = false;
                        return false;
                    } else if (sendWarningMode == "true" && v.name == 'companyQuotaWarningRate' && (v.value < 1 || v.value > 99)) {
                        self.showValidateMsg(v.name, App.i18n(adminLang["{{quota}}의 설정 가능 범위는 {{arg1}} ~ {{arg2}}까지입니다."], {
                            "quota": adminLang["공용 용량 초과 경고 비율"],
                            "arg1": 1,
                            "arg2": 99
                        }));
                        validate = false;
                        return false;
                    } else if (sendWarningMode == "true" && v.name == 'companyQuotaWarningRate' && !$.goValidation.isNumber(v.value)) {
                        self.showValidateMsg(v.name, App.i18n(adminLang["{{quota}}에 숫자를 입력해주세요."], {"quota": adminLang["공용 용량 초과 경고 비율"]}));
                        validate = false;
                        return false;
                    }
                });

                if (mode == "new" && adminPassword && adminPasswordConfirm && adminPassword != adminPasswordConfirm) {
                    self.showValidateMsg("info_adminPassword", adminLang["비밀번호 불일치"]);
                    validate = false;
                    return false;
                }

                if (!validate) {
                    $('#WEBMAIL').attr('disabled', true);
                    return false;
                } else {
                    return true;
                }
            },

            makeModel: function (form, model) {
                var installLocale = InstalledInfoModel.read().toJSON().language;
                var info = {},
                    baseCompanyConfig = {},
                    config = {},
                    serviceModel = {},
                    indexFssList = [];
                dataFssList = [];

                $.each(form.serializeArray(), function (k, v) {
                    var splitName = v.name.split("_");
                    if (v.name == "indexFss") {
                        indexFssList = $('#indexFss').val();
                    }

                    if (v.name == "dataFss") {
                        dataFssList = $('#dataFss').val();
                    }
                    if (splitName[0] == "config") {
                        v.name = splitName[1];
                        config[v.name] = v.value;
                    } else if (splitName[0] == "serviceModel") {
                        v.name = splitName[1];
                        if (v.value == "on") {
                            v.value = true;
                        } else {
                            v.value = false;
                        }
                        serviceModel[v.name] = v.value;
                    } else if (splitName[0] == "info") {
                        v.name = splitName[1];
                        info[v.name] = v.value;
                    } else if (splitName[0] == "baseCompanyConfig") {
                        v.name = splitName[1];
                        if (v.name == "totalAccountQuota" && v.value == "self") {
                            v.value = $("#totalAccountQuota").val() * 1024 * 1024 * 1024;
                        }
                        if (v.name == "companyQuota" && v.value == "self") {
                            v.value = $("#companyQuota").val() * 1024 * 1024 * 1024;
                        }
                        if (v.name == "restrictCompanyPeriod" && v.value == "true") {
                            baseCompanyConfig["restrictCompanyPeriodStart"] = $("#baseCompanyConfig_restrictCompanyPeriodStart").val();
                            baseCompanyConfig["restrictCompanyPeriodEnd"] = $("#baseCompanyConfig_restrictCompanyPeriodEnd").val();
                        }
                        baseCompanyConfig[v.name] = v.value;
                    } else {
                        model.set(v.name, $.trim(v.value), {silent: true});
                    }
                });

                serviceModel['webMail'] = true;
                config["meetingRoomCount"] = this.meetingRoomCount;

                model.set("baseCompanyConfig", baseCompanyConfig, {silent: true});
                model.set("config", config, {silent: true});
                model.set("serviceModel", serviceModel, {silent: true});
                model.set("info", info, {silent: true});
                model.set("indexFss", indexFssList, {silent: true});
                model.set("dataFss", dataFssList, {silent: true});
                model.set("managerName", info.contactPerson, {silent: true});
                model.set("managerId", info.adminId, {silent: true});
                model.set("managerPassword", info.adminPassword, {silent: true});
                model.set("managerPasswordConfirm", info.adminPasswordConfirm, {silent: true});
                model.set("locale", installLocale, {silent: true});

                return model;
            },
            siteSave: function (e) {
                e.stopPropagation();

                var installInfo = this.installInfoModel.toJSON();
                $('.go_alert').empty();
                this.model = CompanyBaseModel.create();
                var self = this,
                    validate = true,
                    form = this.$el.find('form[name=formSiteConfig]');

                $('#indexFss > option').attr('selected', 'selected');
                $('#dataFss > option').attr('selected', 'selected');

                validate = self.checkValidation(form, "new");
                if (!validate) {
                    return false;
                }
                this.model = this.makeModel(form, this.model);
                this.model.set("mailDomainSeq", $('#mailDomains option:selected').val(), {silent: true});
                this.model.set("domainName", $('#mailDomains option:selected').text(), {silent: true});

                this.$el.off("click", "span#btn_ok");//여러번 호출 되는 것 방지
                GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
                this.model.save({}, {
                    type: 'POST',
                    timeout: 120000,
                    success: function (model, response) {
                        if (response.code == '200') {
                            $.goMessage(commonLang["저장되었습니다."]);
                            if (!installInfo.installed) {
                                self.changeInstallState();
                                App.router.navigate('complete', {trigger: true});
                            } else {
                                App.router.navigate('system/site', {trigger: true});
                            }
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                        }
                    },
                    error: function (model, response) {
                        var responseData = JSON.parse(response.responseText);
                        if (responseData.name == 'duplicated.login.id') {
                            self.showValidateMsg("info_adminId", adminLang["아이디가 중복되었습니다."]);
                        }

                        $.goMessage(responseData.message);
                        $('#WEBMAIL').attr('disabled', true);
                        self.$el.on("click", "span#btn_ok", $.proxy(self.siteSave, self));
                        GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    }
                });
            },
            siteModify: function (e) {
                e.stopPropagation();

                $('.go_alert').empty();
                this.model = CompanyBaseModel.create();
                var self = this,
                    validate = true,
                    form = this.$el.find('form[name=formSiteConfig]'),
                    url = GO.contextRoot + "ad/api/system/company/" + this.siteId;

                $('#indexFss > option').attr('selected', 'selected');
                $('#dataFss > option').attr('selected', 'selected');

                validate = self.checkValidation(form, "mod");
                if (!validate) {
                    return false;
                }
                var params = this.makeModel(form, this.model);
                GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
                $.go(url, JSON.stringify(params), {
                    qryType: 'PUT',
                    timeout: 120000,
                    contentType: 'application/json',
                    responseFn: function (response) {
                        if (response.code == 200) {
                            $.goMessage(commonLang["수정되었습니다."]);
                            App.router.navigate('system/site', {trigger: true});
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                        }
                    },
                    error: function (response) {
                        var responseData = JSON.parse(response.responseText);
                        $.goMessage(responseData.message);
                        $('#WEBMAIL').attr('disabled', true);
                        GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    }
                });
            },
            siteCancel: function (e) {
                e.stopPropagation();

                this.render();
            },
            siteReturnList: function () {
                App.router.navigate('system/site', {trigger: true});
            },
            isExceedLicenseUser: function () {
                var availableUserCount = 0;
                var url = GO.contextRoot + "ad/api/system/company/userstat";
                $.go(url, "", {
                    qryType: 'GET',
                    async: false,
                    responseFn: function (response) {
                        if (response.code == 200) {
                            availableUserCount = response.data.licenseUserCount - response.data.companiesUserCount;
                        }
                    },
                    error: function (response) {
                        var responseData = JSON.parse(response.responseText);
                        $.goMessage(responseData.message);
                    }
                });
                return availableUserCount;
            },
            showValidateMsg: function (targetId, msg) {
                $('#' + targetId).focus();
                $('#' + targetId + 'Validate').html(msg);
            },
            getDomains: function (siteId) {
                var url = GO.contextRoot + "ad/api/system/domainlist";
                $.go(url, "", {
                    qryType: 'GET',
                    responseFn: function (response) {
                        if (response.code == 200) {
                            $('#mailDomains').find('option').remove();
                            for (var i = 0; i < response.data.length; i++) {
                                $('#mailDomains').append('<OPTION value="' + response.data[i].mailDomainSeq + '">' + response.data[i].mailDomain + '</OPTION>');
                            }
                        }
                    }
                });
            },
            siteMovePrev: function (e) {
                e.stopPropagation();

                var installInfo = this.installInfoModel.toJSON();
                App.router.navigate('domain/modify/' + installInfo.installedDomainSeq, {trigger: true});
            },
            changeInstallState: function () {
                var url = GO.contextRoot + "ad/api/system/change/state/done";
                $.go(url, "", {
                    qryType: 'GET',
                    responseFn: function (response) {

                    }
                });
            },
            _validateNumber: function (e) {
                $('.go_alert').html('');
                var $target = $(e.currentTarget);
                if (!$.goValidation.isNumber($target.val())) {
                    this.showValidateMsg($target.attr('id'), App.i18n(adminLang["{{quota}}에 숫자를 입력해주세요."], {"quota": adminLang["총 할당 계정 용량"]}));
                }
            }
        }, {
            create: function (opt) {
                instance = new siteCreate({el: opt.el ? opt.el : '#layoutContent', siteId: opt ? opt.siteId : ''});
                instance.siteId = opt ? opt.siteId : '';
                return instance.render();
            }
        });

        function initDatepicker() {
            var startDate = $("#baseCompanyConfig_restrictCompanyPeriodStart"),
                endDate = $("#baseCompanyConfig_restrictCompanyPeriodEnd");

            startDate.val(GO.util.customDate(date, "YYYY-MM-DD"));
            endDate.val(GO.util.customDate(date, "YYYY-MM-DD"));

            $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
            var date = new Date();
            startDate.datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                minDate: GO.util.customDate(date, "YYYY-MM-DD"),
                onSelect: function (selectedDate) {
                    endDate.datepicker("option", "minDate", selectedDate);
                }
            });

            endDate.datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                minDate: GO.util.customDate(date, "YYYY-MM-DD")
            });
        };

        return {
            render: function (opt) {
                var layout = siteCreate.create(opt);
                return layout;
            }
        };
    });

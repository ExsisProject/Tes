<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html>
<style>
    div.otp_number span.wrap_txt input { font-size: 20px; ont-family: century gothic, Applegothic; color: #02a1c0; vertical-align: middle; width: 135px; text-align: center;}
    div.layer_otp span.wrap_txt input { font-size: 20px; ont-family: century gothic, Applegothic; color: #02a1c0; vertical-align: middle; width: 70px; text-align: center;}
</style>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="virwport" content="width=device-width,initial-scale=1">
    <title>${lang.head_title}</title>
    <base href="${baseUrl}">
    <link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/ta_style.css?rev=${revision}" media="screen"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/adm_style.css?rev=${revision}" media="screen"/>

    <%
        String currentLocale = (String) request.getAttribute("currentLocale");
        if (!"ko".equals(currentLocale)) {
    %>
    <link rel="stylesheet" href="${baseUrl}resources/css/ta_${currentLocale}.css?rev=${revision}" media="screen, print"/>
    <%
        }
    %>

    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/lodash.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/backbone/backbone.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/moment/moment.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/hogan.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-util.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-popup.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-login.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-placeholder.js?rev=${revision}"></script>
    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
    <![endif]-->
</head>

<body class="go_skin_default tLoginWrap">
<div class="tWrap">
    <div class="tBody">
        <div class="go_intro">
            <!--기본 로그인 화면-->
            <section class="login_box">
                <div class="custom_visual">
                    <img src="${middleImage}" title="${lang.logoTitle}">
                </div>
                <div class="login_msg" style="display: none">
                    <span class="ic_error">!</span>
                    <span class="txt"></span>
                </div>
                <input type="submit" style="visibility:hidden">
                <div class="otp_title">
                    <p class="title_s">${lang.daouoffice_otp_auth}</p>
                    <div class="more_info" id="otpRegistMenu">
                        <span class="desc">${lang.registration}</span>
                        <span class="help">
                            <span class="tool_tip">${lang.registration_tip}<i class="tail_left"></i></span>
                        </span>
                    </div>
                    <div class="more_info" id="otpResetMenu">
                        <span class="desc">${lang.daouoffice_otp_reset}</span>
                        <span class="help">
                            <span class="tool_tip">${lang.reset_tip}<i class="tail_left"></i></span>
                        </span>
                    </div>
                </div>
                <fieldset>
                    <legend>login</legend>
                    <div id="input_otp_auth_code" class="login_otp">
                        <input id="otp_code" type="text" class="ipt_login ipt_wide" placeholder="${lang.enter_otp_authcode}" onkeyup="javascript:clearAlert(event)" style="ime-mode:inactive;">
                    </div>
                    <div id="input_dev_auth_code" class="otp_number" style="text-align: center; display:none;">
                        <span class="desc">${lang.enter_otp_in_app_description_1}</span><br>
                        <span class="wrap_txt"><input id="cert_01" class="txt comp" type="text" value="---" readonly=""></span>
                        <span> - </span>
                        <span class="wrap_txt"><input id="cert_02" class="txt comp" type="text" value="---" readonly=""></span>
                        <span> - </span>
                        <span class="wrap_txt"><input id="cert_03" class="txt comp" type="text" value="---" readonly=""></span>
                    </div>
                    <div class="login_otp">
                        <div id="mail_auth_result" style="display:none">
                            <span id="mail_auth_result_info" style="color:red">${lang.fail}</span>
                        </div>
                    </div>
                    <div class="btn_wide">
                        <a id="otpCodeSubmit" class="btn_bk">${lang.confirm}</a>
                    </div>
                    <span id="auth_code_validate_time" style="color: red; position:absolute; top:0px; left:0px; visibility:hidden;">NULL</span>
                </fieldset>
            </section>
        </div>
    </div>
</div>

<script type="text/javascript">
    function clearAlert(event) {
        if (event.keyCode != 13) {
            var isDisplayAlert = $('.login_msg').css('display');
            if (isDisplayAlert != 'none') {
                $('.login_msg').css('display', 'none');
            }
        }
    }
    isLogined = false

    /**
     * OTP 등록 상태를 가져온다.
     *      - isMailVerified: 메일 인증 여부 (boolean)
     *      - isMailOtpKeyRegistered : Mail OTP 등록 여부  (boolean)
     *      - isMobileOtpKeyRegistered : Mobile OTP 등록 여부 (boolean)
     *      - mediaType : "MAIL" or "MOBILE" (String)
     */
    function checkOTPKeyRegistered() {
        var api_response = null;
        $.ajax('${baseUrl}' + 'ad/api/otp/admin/check', {
            type: 'GET',
            async: false,
            contentType: 'application/json',
        }).done(function (response) {
            if (response.code == 200) {
                api_response = response.data;
            }
        }).fail(function (e, response) {
            window.location.href = 'login'
        });
        return api_response;
    }

    /**
     * 사용자가 입력한 OTP를 이용하여 로그인을 시도 한다.
     */
    function otpLogin(otp_code, result_view, result_text) {
        $.ajax('${baseUrl}' + 'ad/api/otp/admin/code', {
            type: 'POST',
            async: false,
            contentType: 'application/json',
            data : JSON.stringify({
                userCode: otp_code,
                redirectUrl: null,
            })
        }).done(function (response) {
            if (response.code === "200") {
                isLogined = true;
                result_text.css("color", "blue");
                result_text.text('${lang.success}');
                result_view.css("display", "block");
            }else {
                result_view.css("display", "block");
            }
        }).fail(function (e, response) {
            result_view.css("display" ,"block");
        });
    }

    /**
     * 활성화 된 인증코드 유효시간 타이머 제거.
     */
    function clearAuthCodeTimer() {
        if (typeof(authCodeTimer) !== 'undefined') {
            $("#auth_code_validate_time").css("visibility", "hidden");
            $("#popup_auth_code_validate_time").css("visibility", "hidden");
            clearInterval(authCodeTimer)
        }
    }


    function setTimerPos(add_left, validateTime) {
        add_left_last = add_left
        var verifyBoxPos = $('#external_email_verify')
        if (verifyBoxPos.position() === undefined){
            verifyBoxPos = $('#otp_code')
        }
        verifyBoxPos = verifyBoxPos.position()
        var top = verifyBoxPos.top + 5;
        var left = verifyBoxPos.left + add_left;
        validateTime.text("NULL");
        validateTime.css("top", top)
        validateTime.css("left", left)

    }

    /**
     * 인증코드 유효시간 타이머 설치.
     */
    function startAuthCodeTimer(certificationValidityTime, xPos, validateTimeId) {
        clearAuthCodeTimer()
        setTimerPos(xPos, validateTimeId)
        var ss = certificationValidityTime;
        validateTime = validateTimeId
        authCodeTimer = setInterval(function() {
            var now_remain_hhmm = validateTime.text();
            if(now_remain_hhmm !== "NULL") {
                ss = Number(now_remain_hhmm.substring(0, 2)) * 60;
                ss += Number(now_remain_hhmm.substring(3, 5)) - 1;
            }
            if (ss === 0) {
                clearInterval(authCodeTimer)
                setTimerPos(add_left_last - 20, validateTimeId)
                validateTime.text('${lang.notice_status_expired}')
                return
            }
            validateTime.css("visibility" ,"visible");
            validateTime.text(new Date(ss * 1000).toISOString().substr(14, 5));
        }, 1000);

    }
    /**
     * 메인 화면 뷰
     */
    var OTPInAdminView = Backbone.View.extend({
        events: {
            'click #otpRegistMenu': 'otpRegistrationPopup',
            'click #otpResetMenu': 'otpResetPopup',
            'click #otpCodeSubmit': 'otpCodeSubmit',
        },

        initialize: function () {
            //$("#otpResetMenu").css("visibility", "hidden");
            //$("#otpRegistMenu").css("visibility", "hidden");
            this.$el = $(".go_intro");
            this.status = checkOTPKeyRegistered()
            this.otpMenuConfig()
            $(document).ready(function () {
                setTimeout(function () {
                    _self.otpSyncData()
                }, 500);

            })
            _self=this
        },

        /**
         * 메일 인증 OTP일 경우, OTP 코드가 담긴 메일을 보내고, 모바일 인증일 경우 DB에 OTP코드를 동기화 해준다.
         */
        otpSyncData: function () {
            if (this.status === null || this.status.isMailVerified !== true) {
                return
            }
            if ((this.status.isMailOtpKeyRegistered === true && this.status.mediaType === "MAIL") ||
                (this.status.isMobileOtpKeyRegistered === true && this.status.mediaType === "MOBILE") ) {
                var rsp = $.ajax('${baseUrl}' + 'ad/api/otp/admin/send/otp-mail', {
                    type: 'GET',
                    async: false,
                    contentType: 'application/json',
                }).done(function (response) {
                    if (checkOTPKeyRegistered().mediaType === "MAIL") {
                        startAuthCodeTimer(response.data.certificationValidityTime, 390, $("#auth_code_validate_time"))
                    }
                });
                if (this.status.mediaType === "MAIL") {
                    rsp.done(function () {
                        alert('${lang.send_otp_via_mail}')
                    });
                }
            }
        },

        /**
         * 사용자의 상태에 따라 Main화면 출력 메뉴를 결정.
         */
        otpMenuConfig: function (e) {
            /* case 1. OTP가 정상적으로 등록 되어 있는 경우 : 초기화 메뉴를 보여준다. */
            if ((this.status.isMailOtpKeyRegistered === true && this.status.mediaType === "MAIL" && this.status.isMailVerified === true) ||
                (this.status.isMobileOtpKeyRegistered === true && this.status.mediaType === "MOBILE" && this.status.isMailVerified === true)) {
                $("#otpResetMenu").css("visibility", "visible");
                $("#otpRegistMenu").css("visibility", "hidden");
            }
            /* case 2. Mobile 인증인데, Device가 등록 되어 있지 않은 경우 (주로 단말서 Logout 했을 경우) : 재등록 절차 진행 */
            else if(this.status.isMobileOtpKeyRegistered === false && this.status.mediaType === "MOBILE" && this.status.isMailVerified === true) {
                $("#otpRegistMenu").css("visibility", "hidden");
                $("#otpResetMenu").css("visibility", "visible");
                $("#input_dev_auth_code").css("display", "block");
                $("#input_otp_auth_code").css("display", "none");
                $("#mail_auth_result").css("display" ,"none");
                $("#otpCodeSubmit").on( "click", this.otpDeviceReRegistered);
                this.getMobileOtpRegistCode(e)
            }
            else {
                /* case 3. OTP 등록이 안되어 있는 경우 : 전부 가려준다. */
                $("#mail_auth_result").css("display" ,"none");
                $("#otpResetMenu").css("display" ,"none");
            }
            $("#otpRegistMenu").css("cursor", "pointer");
            $("#otpResetMenu").css("cursor", "pointer");
        },

        /**
         * 모바일 OTP 등록코드를 9자리를 받아서 3글짜씩 잘라 화면에 출력해준다.
         */
        getMobileOtpRegistCode: function (e) {
            $.ajax('${baseUrl}' + 'ad/api/otp/regist/code', {
                type: 'GET',
                async: false,
                contentType: 'application/json',
            }).done(function (response) {
                if (response.code == 200) {
                    certValue = response.data;
                    $('#cert_01').val(certValue.substring(0,3))
                    $('#cert_02').val(certValue.substring(3,6))
                    $('#cert_03').val(certValue.substring(6,9))
                }
            }).fail(function (e) {
                alert('${lang.init_device_fail}')
            });
        },

        /**
         * 모바일 OTP 등록이 완료 되었으면, 로그인 페이지를 새로고침 한다. (그러면 OTP 입력창이 출력)
         */
        otpDeviceReRegistered: function (e) {
            e.stopPropagation();
            if (checkOTPKeyRegistered().isMobileOtpKeyRegistered === false) {
                /* 아직 등록이 완료 되지 않은 상태로 '확인' 버튼을 클릭 한 경우 (사용자가 모바일에서 인증코드를 정상적으로 입력 하지 않았다.) */
                alert("${lang.init_device_ongoing}")
                return;
            }
            window.location.reload();
        },

        /**
         * OTP 로그인 버튼 클릭, 로그인 성공 시 홈페이지로 리다이렉션
         */
        otpCodeSubmit: function (e) {
            e.stopPropagation();
            otpLogin(
                $('#otp_code').val(),
                $('#mail_auth_result'),
                $('#mail_auth_result_info')
            )
            if (isLogined === true) {
                var check_status = checkOTPKeyRegistered()
                location.href = check_status.redirect
            }
        },

        /**
         * OTP 등록 버튼 클릭, popup 화면 출력
         */
        otpRegistrationPopup: function (e) {
            e.stopPropagation();
            var step1 = true
            var step2 = false
            var step3 = false
            if (checkOTPKeyRegistered().isMailVerified === true) {
                step1 = false
                step2 = true
            }
            this.popupView = new OTPInAdminRegisterPopupView();
            this.popupView.render({step1: step1, step2: step2, step3: step3});
            $("#external_email").val(this.status.originExternalAddrs)

        },

        /**
         * OTP 초기화 버튼 클릭, popup 화면 출력
         */
        otpResetPopup: function (e) {
            e.stopPropagation();
            this.popupView = new OTPInAdminResetPopupView();
            this.popupView.render();
        },
    });

    /**
     * OTP 초기화 popup
     */
    var OTPInAdminResetPopupView = Backbone.View.extend({
        render: function () {
            this.$el.html(this.getTemplate());
            this.popupEl = $.goPopup({
                pclass: 'layer_normal layer_otp',
                draggable: false,
                isLock: true,
                closeIconVisible: true,
                width: '460px',
                modal: true,
                header : '${lang.daouoffice_otp_reset}',
                contents: this.$el
            });
            $("#btn_send_reset_mail").on( "click", this.onSendResetMail);
            return this;
        },

        /**
         * OTP 초기화 메일 발송
         */
        onSendResetMail: function () {

            var status = checkOTPKeyRegistered()
            if (status.mediaType !== "MOBILE") { //status.isMailVerified === false || status.isMobileOtpKeyRegistered === false ||
                $("#reset_link_sent").css("color" ,"red");
                $("#reset_link_sent").css("visibility" ,"visible");
                $("#reset_link_sent").text("${lang.not_mobile_user_alert}");
                return
            }

            $.ajax('${baseUrl}' + 'ad/api/otp/admin/send/reset-mail', {
                type: 'GET',
                async: false,
                contentType: 'application/json'}
            ).done(function () {
                $("#reset_link_sent").css("visibility" ,"visible");
                $("#btn_send_reset_mail").text("${lang.resend_mail}");
            });
        },

        /**
         * popup 화면 HTML
         */
        getTemplate: function () {
            var reset_description = "${lang.reset_description}".replace(/(<br>)/gi," ");
            var reset_alert = "${lang.reset_alert}".replace(/(<br>)/gi," ");

            return `
                <div class="content">
                    <p id="popup_reset_description" class="desc">` + reset_description + `</p>
                    <a class="btn_major_s btn_otp_mail">
                        <span id="btn_send_reset_mail" class="txt">${lang.send_mail}</span>
                        <div id="reset_link_sent" style="color:blue; visibility:hidden; font-weight:bold;">${lang.link_sent}</div>
                    </a>
                    <ul class="list_desc">
                        <li>
                            <p id="popup_reset_alert" class="desc_s">
                                - ` + reset_alert + `
                            </p>
                        </li>
                        <li>
                            <p class="desc_s">
                                - ${lang.forget_help_1} <a class="txt_link" href="https://care.daouoffice.co.kr/hc/ko">${lang.forget_help_2}</a> ${lang.forget_help_3}
                            </p>
                        </li>
                    </ul>
                </div>        `
        },
    });

    /**
     * OTP 등록 popup
     */
    var OTPInAdminRegisterPopupView = Backbone.View.extend({
        events: {
            'click #btu_send_mail_auth': 'sendOtpMailAuth',
            'click #btu_verify_mail_auth' : 'verifyOtpMailAuth',
            'click #btu_step_next' : 'onStepNext',
            'click #step_previous' : 'onStepPrevious',
            'click #opt_certify_mobile' : 'onMediaTypeMobileSelected',
            'click #opt_certify_mail' : 'onMediaTypeMailSelected',
        },

        initialize: function () {
            isSendMail = false;
            isMailAuthed = false;
            mailAuthCode = null
            self = this;
        },

        /**
         * 이메일 인증 후, 뒤로가기 버튼 클릭 시, 재인증 수행
         */
        resetMailAuth: function () {
            $.ajax('${baseUrl}' + 'ad/api/otp/reset/mail-auth', {
                type: 'GET',
                async: false,
                contentType: 'application/json',
            })
        },

        /**
         * OTP 인증 방법 설정 (모바일 or 메일)
         */
        changeMediaType: function (e, mediaType) {
            $.ajax('${baseUrl}' + 'ad/api/otp/admin/change/auth-type', {
                type: 'POST',
                async: false,
                contentType: 'application/json',
                data : JSON.stringify({
                    "mediaType":  mediaType
                })
            })
        },

        /**
         * 외부메일로 인증 코드 발송
         */
        sendOtpMailAuth: function (e) {
            $.ajax('${baseUrl}' + 'ad/api/otp/admin/send/auth-mail', {
                type: 'POST',
                async: false,
                contentType: 'application/json',
                data : JSON.stringify({
                    "email":  $('#external_email').val()
                })
            }).done(function (response) {
                if (response.code === "200") {
                    $("#external_mail_verify_box").css("visibility" ,"visible");
                    startAuthCodeTimer(300, 135, $('#popup_auth_code_validate_time'));

                    if (false === isSendMail) {
                        isSendMail = true;
                        document.getElementById('btu_send_mail_auth').innerText = '${lang.resend_mail}';
                    }
                    else {
                        alert("${lang.resend_mail_complete}")
                    }
                } else if(response.data.code === "ALREADY_EXIST_SUBSCIRBER"){
                    alert('${lang.already_exist_subscriber}');
                }
                else  {
                    alert('${lang.invalid_mail_addr}');
                }
            }).fail(function(){
                alert('${lang.invalid_mail_addr}');
            });
        },

        /**
         * 외부메일로 보낸 인증 코드 검증
         */
        verifyOtpMailAuth: function (e) {
            if (isMailAuthed === true) {
                return;
            }
            $.ajax('${baseUrl}' + 'ad/api/otp/admin/verify/auth-mail', {
                type: 'POST',
                async: false,
                contentType: 'application/json',
                data : JSON.stringify({
                    "verifyCode":  $('#external_email_verify').val()
                })
            }).done(function (response) {
                if (response.code === "200") {
                    $("#popup_mail_auth_result").css("display" ,"none");
                    clearInterval(authCodeTimer)
                    setTimerPos(115, $('#popup_auth_code_validate_time'))
                    $('#popup_auth_code_validate_time').text('${lang.verification_completed}')
                    $('#popup_auth_code_validate_time').css("display" ,"none");
                    $('#btu_verify_mail_auth').text('${lang.verification_completed}')
                    isMailAuthed = true
                    mailAuthCode = $('#external_email_verify').val()
                }
                else  {
                    $("#popup_mail_auth_result").css("display" ,"block");
                }
            }).fail(function(data, textStatus, errorThrown){
                $("#popup_mail_auth_result").css("display" ,"block");
            });
        },

        /**
         * 메일 OTP 일 경우 DeviceID를 자체 생성하도록 서버에 요청
         */
        mailOtpKeyGen: function (e) {
            if (isMailAuthed === false) {
                return;
            }
            $.ajax('${baseUrl}' + 'ad/api/otp/admin/keygen', {
                type: 'POST',
                async: false,
                contentType: 'application/json',
                data : JSON.stringify({
                    redirectUrl: null,
                    userCode: mailAuthCode,
                })
            });
        },

        /**
         * 화면 렌더링
         */
        render: function (data) {
            this.$el.html(this.getTemplate(data));
            this.popupEl = $.goPopup({
                pclass: 'layer_normal layer_otp',
                draggable: false,
                isLock: true,
                closeIconVisible: true,
                width: '460px',
                modal: true,
                contents: this.$el
            });
            $("#external_mail_verify_box").css("visibility" ,"hidden");

            nowStage = data
            return this;
        },

        /**
         * 모바일 OTP 등록코드 화면에 출력
         */
        getMobileOtpRegistCode: function (e) {
            $('#popup_cert_1').attr("readonly",true);
            $('#popup_cert_2').attr("readonly",true);
            $('#popup_cert_3').attr("readonly",true);
            $.ajax('${baseUrl}' + 'ad/api/otp/regist/code', {
                type: 'GET',
                async: false,
                contentType: 'application/json',
            }).done(function (response) {
                if (response.code == 200) {
                    certValue = response.data;
                    $('#popup_cert_1').val(certValue.substring(0,3))
                    $('#popup_cert_2').val(certValue.substring(3,6))
                    $('#popup_cert_3').val(certValue.substring(6,9))
                }
            }).fail(function (e) {
                $('#popup_cert_1').val("")
                $('#popup_cert_2').val("")
                $('#popup_cert_3').val("")
                alert('${lang.init_device_fail}')
            });
        },

        /**
         * OTP 코드 서버와 동기화 (메일 인증일 경우 OTP 코드가 담긴 메일 발송, 모바일 인증일 경우 현 시간의 OTP 생성)
         */
        timesync: function () {
            $.ajax('${baseUrl}' + 'ad/api/otp/admin/send/otp-mail', {
                type: 'GET',
                async: false,
                contentType: 'application/json',
            }).fail(function (e) {
                alert('${lang.sync_code_fail}')
            }).done(function (response) {
                startAuthCodeTimer(response.data.certificationValidityTime, 390, $("#auth_code_validate_time"))
            });
        },

        renderStep: function (e, param) {
            e.stopPropagation();
            this.render(param);
            $("#btu_step_next").on( "click", this.onStepNext);
            $("#step_previous").on( "click", this.onStepPrevious);
            $("#btu_send_mail_auth").on( "click", this.sendOtpMailAuth);
            $("#btu_verify_mail_auth").on( "click", this.verifyOtpMailAuth);
            $("#btn_send_link").on( "click", this.sendAppInstallLink);
            $("#otp_auth_confirm").on( "click", this.inOtpLogin);
            $("#opt_certify_mobile").on( "click", this.onMediaTypeMobileSelected);
            $("#opt_certify_mail").on( "click", this.onMediaTypeMailSelected);
        },

        onMediaTypeMobileSelected: function () {
            $("input:radio[name=otpMediaTypeSelecter]:input[value=mobile]").attr("checked", true);
            $("#opt_certify_mobile").addClass("on");
            $("#opt_certify_mail").removeClass("on");
        },

        onMediaTypeMailSelected : function () {
            $("input:radio[name=otpMediaTypeSelecter]:input[value=mail]").attr("checked", true);
            $("#opt_certify_mail").addClass("on");
            $("#opt_certify_mobile").removeClass("on");
        },

        /**
         * OTP 로그인 수행
         */
        inOtpLogin: function (e) {
            return otpLogin(
                $('#popup_otp_code').val(),
                $('#popup_mail_auth_result'),
                $('#popup_mail_auth_result_info')
            )
        },

        /**
         * APP 설치 알림 메일 보내기
         */
        sendAppInstallLink: function (e) {
            $.ajax('${baseUrl}' + 'ad/api/otp/send/app-down-mail', {
                type: 'GET',
                async: false,
                contentType: 'application/json',
            }).done(function (response) {
                if (response.code == 200) {
                    alert('${lang.send_appdown_mail_complete}')
                }
            });
        },

        /**
         * 다음 STEP 으로 이동
         */
        onStepNext: function (e) {
            var param = {step1 : false, step2 : false, step3 : false, step4 : false, step5 : false, step6 : false}
            if (nowStage.step1 === true) {
                if (isMailAuthed === false) {
                    alert('${lang.unauthenticated_concurrent}')
                    return;
                }
                clearAuthCodeTimer()
                param.step2 = true;
                self.renderStep(e, param)
            }
            else if (nowStage.step2 === true) {
                if ($("input[name='otpMediaTypeSelecter']:checked").val() === "mobile") {
                    param.step3 = true;
                    if (checkOTPKeyRegistered().isClientMobileOtpExist === true) {
                        param.step5 = true;
                        param.step3 = false;
                    }
                    self.changeMediaType(e, "mobile")
                } else {
                    param.step6 = true;
                    self.changeMediaType(e, "mail")
                    self.mailOtpKeyGen(e)
                }
                self.renderStep(e, param)
            }
            else if (nowStage.step3 === true) {
                param.step4 = true;
                self.renderStep(e, param)
                self.getMobileOtpRegistCode(e);

            }
            else if (nowStage.step4 === true) {
                var response = checkOTPKeyRegistered();
                if (response.isMobileOtpKeyRegistered !== true) {
                    $("#device_registration_noti").css("visibility", "visible");
                    return;
                }
                $("#device_registration_noti").css("visibility" ,"hidden");
                self.timesync()
                param.step5 = true;
                self.renderStep(e, param)
            }
            else if (nowStage.step5 === true) {
                if(isLogined === false) {
                    alert('${lang.unauthenticated_concurrent}')
                    return;
                }
                var check_status = checkOTPKeyRegistered()
                location.href = check_status.redirect
            }
            else if (nowStage.step6 === true) {
                var check_status = checkOTPKeyRegistered()
                location.href = check_status.redirect
            }
        },

        /**
         * 이전 STEP 으로 이동
         */
        onStepPrevious: function (e) {
            var param = {step1 : false, step2 : false, step3 : false, step4 : false, step5 : false, step6 : false}
            if (nowStage.step2 === true) {
                self.resetMailAuth()
                param.step1 = true;
                isSendMail = false;
                isMailAuthed = false;
                self.renderStep(e, param)
            }
            else if (nowStage.step3 === true) {
                param.step2 = true;
                self.renderStep(e, param)
            }
            else if (nowStage.step4 === true) {
                param.step3 = true;
                self.renderStep(e, param)
            }
            else if (nowStage.step5 === true) {
                param.step4 = true;
                self.renderStep(e, param)
                self.getMobileOtpRegistCode()
            }
            else if (nowStage.step6 === true) {
                param.step2 = true;
                self.renderStep(e, param)
            }

        },

        /**
         * STEP 별 HTML 템플릿
         */
        getTemplate: function (data) {
            var html = [];

            html.push('{{#step1}}');
            html.push(`
                <header>
                    <h1>${lang.registration}</h1>
                </header>
                <div class="content">
                    <%--<p class="tit">${lang.registration}</p>--%>
                    <p class="desc">${lang.registration_description}</p>
                    <div class="wrap_ipt_area">
                        <label>${lang.external_mail}</label>
                        <input id="external_email" class="" type="text" value="">
                        <span class="btn_minor_s">
                            <span class="buttonText" input id="btu_send_mail_auth">${lang.send_mail}</span>
                        </span>
                    </div>
                    <div class="wrap_code" id="external_mail_verify_box">
                        <p class="desc">${lang.confirmation_mail_sent}</p>
                        <input id="external_email_verify" class="" type="text">
                        <span class="btn_minor_s">
                            <span class="buttonText" id="btu_verify_mail_auth">${lang.mail_auth_confirm}</span>
                        </span>
                            <div id="popup_mail_auth_result" class="desc" style="display:none">
                                    <span style="color: red">${lang.fail}</span>
                            </div>
                    </div>
                    <span id="popup_auth_code_validate_time" style="color: red; position:absolute; top:0px; left:0px; visibility:hidden;">NULL</span>
                </div>
                <footer class="btn_layer_wrap">
                    <a id="btu_step_next" class="btn_major_s"><span class="txt">${lang.next}</span></a>
                </footer>
			`);
            html.push('{{/step1}}');

            html.push('{{#step2}}');
            /* step2. 모바일/메일 OTP 선택 */
            html.push(`
                <header>
                    <h1>${lang.registration}</h1>
                </header>
                <div class="content">
                    <p class="desc">${lang.registration_success_description}</p>
                    <div class="opt_option"></div>
                    <div id="opt_certify_mobile" class="box on opt_certify">
                        <span class="ic48 ic_mobile"></span>
                        <div class="tit">${lang.mobile_otp}</div>
                        <div class="desc">${lang.mobile_otp_description}</div>
                        <input type="radio" checked name="otpMediaTypeSelecter" value="mobile">
                    </div>
                    <div id="opt_certify_mail" class="box opt_certify">
                        <span class="ic48 ic_mail"></span>
                        <div class="tit">${lang.mail_otp}</div>
                        <div class="desc">${lang.mail_otp_description}</div>
                        <input type="radio" name="otpMediaTypeSelecter" value="mail">
                    </div>
                </div>
                <footer class="btn_layer_wrap">
                    <%--<a id="step_previous" class="btn_minor_s"><span class="txt">${lang.previous}</span></a>--%>
                    <a id="btu_step_next" class="btn_major_s"><span class="txt">${lang.next}</span></a>
                </footer>
                `
            );
            html.push('{{/step2}}');

            html.push('{{#step3}}');
            /* step3. 다우오피스 APP 다운로드 메일 발송 */
            html.push(`
                <header>
                <div class="otp_title">
                <p class="title_s">${lang.registration}</div>
                </div>
                </header>
                <div class="layer_otp">
                    <p style="font-weight:bold; text-align:center; font-size:18px; color: #0065ff;">${lang.registration_complete}</p>
                    <br>
                    <div class="content">${lang.app_download_description}</div>
                    <br>
                    <span class="btn_tool" id="btn_send_link">
			            <span class="txt">${lang.send_link}</span>
		            </span>
		            <br>
                    <div class="content">${lang.click_send_link}</div>
                </div>
                <div class="page_action">
                    <a class="btn_nega" id="step_previous">${lang.previous}</a>
                    <a class="btn" id="btu_step_next">${lang.next}</a>
                </div>
                `
            );
            html.push('{{/step3}}');

            html.push('{{#step4}}');
            /* step4. 모바일 OTP 기기 등록 */
            html.push(`
                <header>
                <div class="otp_title">
                <p class="title_s">${lang.registration}</p>
                </div>
                </header>

                <div class="layer_otp">
                    <br>
                    <div class="content">${lang.device_registration}</p>
                    <br>
                    <span class="wrap_txt">
                        <input id="popup_cert_1" name="device_auth_from_1" type="text" size="4" maxlength="3">
                        -
                        <input id="popup_cert_2" name="device_auth_from_2" type="text" size="4" maxlength="3">
                        -
                        <input id="popup_cert_3" name="device_auth_from_3" type="text" size="4" maxlength="3">
                    </span>
                </div>

                <div id="device_registration_noti" class="desc", style="visibility:hidden">
                    <span style="color: red">${lang.init_device_ongoing}</span>
                </div>
                <div class="page_action">
                    <a class="btn_nega" id="step_previous">${lang.previous}</a>
                    <a class="btn" id="btu_step_next">${lang.next}</a>
                </div>
                `
            );
            html.push('{{/step4}}');

            html.push('{{#step5}}');
            /* step5. 모바일 OTP 등록 후, OTP 입력 테스트 */
            html.push(`
                <header>
                <div class="otp_title">
                <p class="title_s">${lang.registration}</p>
                </div>
                </header>
                <div class="layer_otp">
                    <br>
                    <div class="content">${lang.device_registration_description}</p>
                    <br>
                    <div class="wrap_txt">
                        <input id="popup_otp_code" type="text" maxlength="6" size="40" placeholder="${lang.enter_otp_authcode}" onfocus="this.placeholder=''" onblur="this.placeholder='${lang.enter_otp_authcode}'">
                        <span id="otp_auth_confirm" class="btn_tool">
                            <span class="txt">${lang.mail_auth_confirm}</span>
                        </span>
                    </div>
                    <div id="popup_mail_auth_result" class="desc" style="display:none;">
                        <span id="popup_mail_auth_result_info" style="color: red">${lang.fail}</span>
                    </div>
                </div>
                <div class="page_action">
                    <a class="btn_nega" id="step_previous">${lang.previous}</a>
                    <a class="btn" id="btu_step_next">${lang.confirm}</a>
                </div>
                `
            );
            html.push('{{/step5}}');

            html.push('{{#step6}}');
            /* step6. 메일 OTP 등록 완료 */
            html.push(`
                <header>
                <div class="otp_title">
                <p class="title_s">${lang.registration}</p>
                </div>
                </header>
                <div class="layer_otp">
                    <br>
                    <p style="font-weight:bold; text-align:center; font-size:18px; color: #0065ff;">${lang.registration_complete}</p>
                    <br>
                    <div class="content">${lang.goto_admin_page}</div>
                    <br>
                    <div id="mail_auth_result" class="desc" style="visibility:hidden">
                        <span style="color: red">${lang.fail}</span>
                    </div>
                </div>
                <div class="page_action">
                    <a class="btn_nega" id="step_previous">${lang.previous}</a>
                    <a class="btn" id="btu_step_next">${lang.confirm}</a>
                </div>
                `
            );
            html.push('{{/step6}}');

            return Hogan.compile(html.join("\n")).render(data);
        },
    });

    $(function () {
        new OTPInAdminView();
    });
</script>
</body>
</html>

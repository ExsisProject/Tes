<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="virwport" content="width=device-width,initial-scale=1">
    <meta name="version" content="${ver}">
    <meta name="brandName" content="${brandName}">
    <title>${lang.title}</title>
    <link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/fonts/notosans.css?rev=${revision}" media="all">
    <link rel="stylesheet" href="${baseUrl}resources/css/go_style.css?rev=${revision}" media="screen" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_login.css?rev=${revision}" media="screen" />
  	<link rel="stylesheet" href="${baseUrl}resources/css/go_color_${systemcolorstyle}.css?rev=${revision}" media="screen, print" />
    <%
  	String currentLocale =  (String)request.getAttribute("currentLocale");
  	if(!"ko".equals(currentLocale)){
  	%>  
    <link rel="stylesheet" href="${baseUrl}resources/css/go_${currentLocale}.css?rev=${revision}" media="screen, print" />
  	<%
  	}
  	%>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery-ui/js/jquery-ui-1.10.0.custom.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/hogan.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/lodash.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/backbone/backbone.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/moment/moment.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-util.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-popup.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-login.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/app/views/IEInfoView.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-placeholder.js?rev=${revision}"></script>
    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
    <![endif]-->
   <style type="text/css">
	div.ie_warp {position: relative;padding:20px 20px;margin:80px auto;width:670px; margin-bottom: 30px;background: #fff;border: 1px solid #babbbb;}
	h1.bi_do {position: absolute; left: 50px; top: 30px; width: 158px; height: 33px;background: url(${baseUrl}resources/images/etc/ie_do.gif) no-repeat 0 0;font-size:0; line-height:0}
	h1.bi_tms {position: absolute; left: 5px; top: -3px; width: 150px; height: 150px;background: url(${baseUrl}resources/images/etc/ie_tms.gif) no-repeat 0 0;font-size:0; line-height:0}
	h2.ci {position: absolute;right:20px;top:15px;width: 110px;height:30px;background: url(${baseUrl}resources/images/etc/ie_logo_daou.png) no-repeat 0 0;font-size:0; line-height:0}
	.btn_ie8_up:hover {opacity:0.9; filter: Alpha(Opacity=90);}
	.browser_box span {display:inline-block; width:67px; height:67px; background: url(${baseUrl}resources/images/etc/ie_3.gif) no-repeat 0 0;}
	.browser_box span.ie8{background-position:0 0}
	.browser_box span.chorme{background-position:-95px 0}
	.browser_box span.firefox{background-position:-194px 0}
	.browser_box span.safari{background-position:-300px 0}
	table {background-color:transparents!importnat}
	table td,table th {text-align:center; padding:10px 0}
	table th {width:25%;}
	table td {padding-top:0px; text-align:left; font-size:11px; color:#989aa0; font-weight:bold; letter-spacing:-1px;}
	</style>
	<script>
		// image preload
		var img = new Image();
		img.src = "/resources/images/img_loader_w.gif";
	</script>
</head>
<body class="user_front" id="bodyPart" style="min-width: 400px; background-image: none;">
<form id="loginForm" method="post" data-pagetype="simplelogin">
    <div class="layer_normal popup_pw_change popup simple_login">
        <div class="go_wrap go_skin_default go_intro_wrap mint_theme">
            <div class="go_intro wrap_pw_sync">
                <div class="glad_msg">
                    <p class="title">${lang.title}</p>
                    <p class="desc">${lang.simpleLoginDesc}</p>
                </div>
                <div class="glad_box">
                    <div class="login_msg" style="display:none;">
                        <span class="ic_error">!</span>
                        <span class="txt"></span>
                    </div>
                    <div class="change_pw pw_space">
                        <input class="ipt_login" name="username" type="text" id="username"
                               placeholder="${lang.account}">
                    </div>
                    <div class="change_pw">
                        <input class="ipt_login" autocomplete="off"  name="password" type="password" id="password"
                               placeholder="${lang.password}">
                    </div>
                    <input type="checkbox" name="saveEmail" id="saveLoginId" tabindex="5" style="display:none;">
                    <div class="captchaContents" style="display:none">
                        <span class="txt">${lang.descriptionCaptcha}</span>
                        <img id="captchaImg" src="" data-pin-nopin="true">
                        <input name="captcha" id="captcha" type="text" placeholder="${lang.inputCaptcha}">
                        <a title="${lang.imageRefresh}" class="ic ic_refresh_tyep2" id="refreshBtn"></a>
                    </div>
                    <div id="language_select" class="language" style="margin-left: 16px;">
                        <select>
                            <option value="language">${lang.loginLanguage}</option>
                            <c:forEach items="${availableLanguages}" var="l">
                                <option value="${l.key}" ${selectedLocale == l.key ? 'selected' : ''}>${l.value}</option>
                            </c:forEach>
                        </select>
                    </div>
                    <div class="btn_wrap">
                        <a class="btn_major_s" data-role="button" id="login_submit">
                            <span class="txt">${lang.title}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>


<script type="text/javascript">
    $.removeCookie("IsCookieActived", {path: "/"});

    function clearAlert(event) {
        if (event.keyCode != 13) {
            var isDisplayAlert = $('.login_msg').css('display');
            if (isDisplayAlert != 'none') {
                $('.login_msg').css('display', 'none');
            }
        }
    }

    function checkIEUa(agent) {
        if (agent.indexOf("msie") > -1) {
            if (agent.indexOf("trident") > -1) {
                return false;
            } else if (agent.indexOf("msie 8.0") > -1) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

    var ua = window.navigator.userAgent.toLowerCase();
    //if(ua.indexOf('msie') >= 0 && (ua.indexOf('msie 6.0') >= 0 && ua.indexOf('msie 8.0') < 0  ||  ua.indexOf('msie 7.0') >= 0 ) ){
    if (checkIEUa(ua)) {
        jQuery.goIEInfoView({root: '${baseUrl}', locale: '${currentLocale}'});
    } else {
        var Login = $(function (window, global) {

            var loginView,
                alarmLoginLock,
                LanguageSelectView;
            var adviceChangePassword = "${lang.adviceChangePassword}",
                passwordConfirm = "${lang.passwordConfirm}";
            var changeNow = "${lang.changeNow}";
            var changeLater = "${lang.changeLater}";

            LanguageSelectView = Backbone.View.extend({
                el: '#language_select',
                events: {
                    'change': 'changePageLanguage'
                },

                changePageLanguage: function () {
                    var selected = $('option:selected').val();
                    if (selected == 'language') {
                        document.location = 'simplelogin';
                    } else {

                        document.location = 'simplelogin?lang=' + selected;
                    }
                }
            });

            alarmLoginLock = function (message) {
                var goPopup = $.goPopup({
                    width: '280',
                    modal: true,
                    pid: 'login_lock_alarm_box',
                    pclass: 'layer_confim_front layer_access_error',
                    contents: "<p class='q'>${lang.loginLockMessage}</p><p class='info'>" + message + "</p>",
                    buttons: [{
                        btext: "${lang.confirm}",
                        btype: "confirm",
                        autoclose: true
                    }]
                });
                goPopup.css({"top": "2px", "left": "70px"});
            };

            new LanguageSelectView();

            loginView = new LoginView({
                loginType: 'user',
                loginLockAlarmCallback: alarmLoginLock,
                el: $('form#loginForm'),
                idLabel: $('label#login_id_label'),
                idSaveLabel: $('label#login_id_save_label'),
                idInput: $('input[name="username"]'),
                pwInput: $(':password'),
                saveIdCheckbox: $('#saveLoginId'),
                companyOptions: $('.select_list li.option'),
                selectedCompanyOption: $('.select_list li.on > a'),
                failMessageLabel: $('.login_msg'),
                loginOptions: $('.login_check'),
                adviceChangePassword: adviceChangePassword,
                passwordConfirm: passwordConfirm,
                changeNow: changeNow,
                changeLater: changeLater
            });
            loginView.render();

        }(window, this));
    }
</script>


<script>
    GO = GO || {};
    GO["contextRoot"] = "${baseUrl}";
</script>

</body>
</html>
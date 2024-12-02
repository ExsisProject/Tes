<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width, target-densitydpi=medium-dpi" />
<title>${lang.title}</title>
<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
<link rel="stylesheet" href="${baseUrl}resources/css/go_m_style.css?rev=${revision}" media="all" />
<link rel="stylesheet" href="${baseUrl}resources/css/go_m_customize.css?rev=${revision}" media="all" />
<script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/libs/go-jssdk.js?rev=${revision}"></script>
<style type="text/css">
html, body { width:100%;  overflow:hidden; }
</style>
</head>
<body>
<div class="go_wrap">
    <section class="login_wrap">
        <header>
            <img src="${mobileImg}" title="${lang.logoTitle}">
            <c:if test="${oauthLogin}">
                <p class="do_logo">${lang.logoTitle}</p>
                <p class="service_tit">${clientName}</p>
            </c:if>
        </header>
        <c:if test="${oauthLogin}">
            <form action="${baseUrl}oauth-authorize" name="oauthForm" method="post">
                <input type="hidden" name="client_id" value="${param.client_id}"/>
                <input type="hidden" name="scope" value="${param.scope}"/>
                <input type="hidden" name="response_type" value="${param.response_type}"/>
                <input type="hidden" name="redirect_uri" value="${param.redirect_uri}"/>
                <input type="hidden" name="state" value="${param.state}"/>
                <input type="hidden" name="email" value="${param.email}"/>
                <input type="hidden" name="device_id" value="${param.device_id}"/>
            </form>
        </c:if>
        <form class="login_form" id="loginForm" method="post">
            <fieldset>
                <legend>${lang.loginId}</legend>

               	<div class="div_ipt">
               		<input id="loginId" class="input" type="email" title="id" maxlength="" placeholder="${lang.loginIdLabel}"/>
					<button class="btn btn_del_type1" type="button" title="delete" style="display: none;"></button>
               	</div>
               	<div class="div_ipt">
               		<input id="password" class="input" type="password" autocomplete="off" title="password" maxlength="" placeholder="${lang.password}" />
					<button class="btn btn_del_type1" type="button" title="delete" style="display: none;"></button>
               	</div>
                <div class="captchaContents" style="display:none">
                    <span class="txt">${lang.descriptionCaptcha}</span>
                    <img id="captchaImg" src="" data-pin-nopin="true">
                    <input name="captcha" id="captcha" type="text" placeholder="${lang.inputCaptcha}">
                    <a title="${lang.imageRefresh}" class="btn_refresh" id="refreshBtn"><span class="ic_nav ic_nav_refresh"></span></a>
                </div>
				<span class="option_wrap">
					<div>
						<a href="#">
							<span id="keepLonginStatus" class="ic_check_p" id="stay_sign"></span>
							<span class="txt">${lang.keepLogin}</span>
						</a>
					</div>

                    <c:if test="${passwordSearch eq true}">
                        <div>
                            <a href="#">
                                <span class="ic_search"></span>
                                <span class="txt" id="findPwd">${lang.passwordFind}</span>
                            </a>
                        </div>
                    </c:if>
				</span>
                <div class="btn_enter">
					<input class="btn_major_otp" type="submit" id="loginSubmit" title="${lang.title}" value="${lang.title}" />
				</div>
                <div class="app_download">
                    <a href="${downloadLink}" class="app_download_enter">
                        <span class="ic_v2 ic_app_download"></span>
                        <span class="txt">${lang.appDownload}</span>
                    </a>
                    <c:if test="${os eq 'IOS'}">
                        <span class="ios_download_description">
                            <strong>${lang.appDownload}</strong>
                            <c:choose>
                                <c:when test="${marketType eq 'market'}">
                                    ${lang.linkDescription}
                                </c:when>
                                <c:otherwise>
                                    ${lang.downloadDescription}
                                </c:otherwise>
                            </c:choose>
                        </span>
                    </c:if>
                </div>
            </fieldset>
        </form>
    </section>
    <!-- 
    <footer>
        <div class="btn_footer">
            <a href="#"><span class="btn_type2">${lang.pcVersion}</span></a>
        </div>
    </footer>
     -->
    <!-- layer -->
    <div class="layer_alarm" style="display:none" id="errorDiv">
        <span class="ic ic_alarm"></span><span class="txt" id="errorMsg">${lang.passwordNotMatch}</span>
    </div>

    <script type="text/javascript">
        GO = {};
        GO["contextRoot"] = "${baseUrl}";
    </script>

    <script type="text/javascript">
    
        $(function($){
    	    $.urlParam = function(name){
    	        var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
    	        if (results) {
    	            return results[1] || 0;
    	        } else {
    	            return 0;
    	        }
    	    };
        
            if ($.urlParam('cause') == 'concurrent') {
                alert("${lang.unauthenticatedConcurrent}");
            }
            
            function checkOS (){
            	var ua = window.navigator.userAgent.toLowerCase();
                if(ua.indexOf("android") > -1) {
                	return "android";
                } else if(ua.indexOf("iphone") > -1){
                	return "iphone";
                } else {
                	return -1;
                };
            }

            function refreshCaptcha() {
                $.ajax({
                    url : GO.contextRoot + "api/captcha",
                    type: 'GET',
                    success: function(response){
                        $('#captchaImg').attr('src', response.data);
                        $('#captcha').val('');
                    }
                });
            }

            function showCaptcha() {
                self = this;
                $('.captchaContents').show();
                $('#refreshBtn').unbind('click');
                $('#refreshBtn').bind('click', function(){
                    refreshCaptcha();
                });
                refreshCaptcha();
            }

            if(!navigator.cookieEnabled){
                if(checkOS() == "iphone"){
	                alert("${lang.iphoneCookieDisableMsg}");
                }else{
                    alert("${lang.androidCookieDisableMsg}");
                }
            }
            
            $("#keepLonginStatus").click(function(){
            	if ($("#keepLonginStatus").hasClass("ic_check_p")) {
            		$("#keepLonginStatus").removeClass("ic_check_p");
            		$("#keepLonginStatus").addClass("ic_check_n");
            	} else {
            		$("#keepLonginStatus").removeClass("ic_check_n");
            		$("#keepLonginStatus").addClass("ic_check_p");            		
            	}
            });

            $("#findPwd").click(function(){
                $.ajax({
                    url : "findPassword",
                    type: 'GET',
                    success: function(response){
                        var myWindow = window.open("", "findPAssword", "width=320,height=480");
                        myWindow.document.write(response);
                    }
                });
            });

            var oauthLogin = ${oauthLogin ? true : false};
            if (oauthLogin) {
                var oauthEmail = $('form[name="oauthForm"] > input[name="email"]').val();
                if ($.trim(oauthEmail) != '') {
                    $("#loginId").val(oauthEmail);
                }
            }

            $("#loginSubmit").click(function(){
                var url = "api/login",
                    options = {
                        username: $("#loginId").val(),
                        password: $("#password").val(),
                        captcha: $('input[name="captcha"]').val(),
                        keepLoginStatus : $("#keepLonginStatus").hasClass("ic_check_p"),
                        returnUrl: XSSFilter(getParameterByName('returnUrl'))
                    };
                
                if(options.password == ""){
                    $("#password").focus();
                    return false;
                }

                $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(options),
                    success: function(response){
                        if (oauthLogin) {
                            document.oauthForm.submit();
                        } else {
                            window.location.href = decodeURIComponent("http://" + location.host + response.data.redirect);
                        }
                    },
                    error: function(response){
						var responseData = JSON.parse(response.responseText);
                        $("#errorMsg").text(responseData.message);
                        $("#errorDiv").show();
                        setTimeout(function() {
                            $("#errorDiv").hide();
                        }, 2000);
                        if(responseData.name == 'login.captcha'){
                            //캡차
                            showCaptcha();
                        }
                    }
                });
                return false;
            });

            function XSSFilter(str) {
                if( !str ) return str;

                str = str.replace(/[\"\'][\s]*javascript:(.*)[\"\']/gi, "\"\"");
                str = str.replace(/[<]*[\s]*script(.*)/gi, "");
                str = str.replace(/eval\((.*)\)/gi, "");

                if( !!str ) {
                    str = str.replace(/</gi, "&lt;");
                    str = str.replace(/>/gi, "&gt;");
                }

                return str;
            }

            function getParameterByName(name) {

                name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]"),
                        regexS = "[\\?&]" + name + "=([^&#]*)",
                        regex = new RegExp(regexS),
                        results = regex.exec(window.location.search);

                if (results) {
                    return decodeURIComponent(results[1].replace(/\+/g, " "));
                } else {
                    return "";
                }
            }

            $("button.btn_del_type1").click(function(){
                var parentEl = $(this).parents("div.div_ipt");
                parentEl.find("input").val("");
                parentEl.find("button.btn_del_type1").hide();
            });
            
            $("#loginForm input").keyup(function(){
                var targetEl = $(this);
                	toggleEl = targetEl.parents("div.div_ipt").find("button.btn_del_type1");
                
                if(targetEl.val() == ""){
                    toggleEl.hide();
                }else{
                    toggleEl.show();
                }
            });
        }(jQuery));
    </script>
</div>
</body>
</html>
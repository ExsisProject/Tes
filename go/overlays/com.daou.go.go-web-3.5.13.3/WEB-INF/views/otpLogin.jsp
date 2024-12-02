<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions"  prefix="fn"%>
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
    <link rel="stylesheet" href="${baseUrl}resources/css/go_style.css?rev=${revision}" media="screen" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_app_style2.css?rev=${revision}" media="screen" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_color_mint.css?rev=${revision}" media="screen" /> <!--//테마 추가-->
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
</head>
<body class="user_front">
	<div class="go_wrap go_intro_wrap mint_theme">
	
		<header class="go_header">
		</header>	
	
		<div class="go_intro otp_confirm">
		    <section class="login_box" style="min-height:365px">
		    	<div class="sticker">
					<span class="go" title="groupoffice"></span>
				</div>
		    	
				<div class="custom_visual">
					<img src="${middleImage}" title="${logoTitle}" alt="${logoTitle}">
				</div>
				<form id="otpLogin" action="${baseUrl}${actionUrl}" method="post">
	                <div class="login_check">
	                    <p class="title_s">${lang.otp_enabled_guide}
	                        <span class="wrap_ic_s">
	                            <span class="help">
	                                <span class="tool_tip">
	                                    ${lang.otp_enabled_message}
	                                    <i class="tail_left"></i>
	                                </span>
	                            </span>
	                        </span>
	                    </p>
	                </div>
					<fieldset>
						<legend>login</legend>
						<div class="login_pw">
							<input type="text" class="ipt_login login_wide" id="userOTP" placeholder="${lang.input_otp}">
						</div>
						<a href="#" id="submit" class="btn_confirm">${lang.submit}</a>				
					</fieldset>
	                <div class="login_check">
	                    <p>${lang.otp_step_guide}</p>
	                </div>
					<input type="submit" style="visibility:hidden" />
				</form>
			</section>
	    </div>
    </div>
    <script type="text/javascript">
    
    $(function () {
        var OtpLogin = Backbone.View.extend({
        	
            el: '#otpLogin',
            
            events: {
                'click #submit': 'submitPassword',
                'submit': 'submitPassword',
                'keyup' : 'clearAlert'
            },
            
            initialize: function() {
                this.$el.find('input[placeholder]').placeholder();
                this.$el.find("#userOTP").focus();
            },
            
            submitPassword: function() {
            	if (!this.verifyPasswordValidation()) {
            		this._showInvalidOTPMessage();
            		return false;
            	}
            	
            	$.ajax({
                    url: this.$el.attr('action'),
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: this.generateSubmitData(),
                    success: this.onSubmitSuccess,
                    error: this.onSubmitError,
                    context: this
                }); 
            	
                return false;
            },
            
            verifyPasswordValidation: function() {
            	if($('#userOTP').val() == ''){
            		return false;
            	}
            	return true;
            },
            
            generateSubmitData: function() {
                return JSON.stringify({
                	userOTP: $('#userOTP').val()
                });
            },
            
            onSubmitSuccess: function(resp) {
            	location.href = decodeURIComponent(resp.data.redirectUrl);
            },
            
            onSubmitError: function(xhr, status, error) {
            	this._showInvalidOTPMessage($.parseJSON(xhr.responseText).message);
            },
            
            _showInvalidOTPMessage: function(message) {
            	$.goPopup({
                    width: '400',
                    modal : true,
                    pid: 'otp_error_box',
                    pclass : 'layer_confim_front layer_otp_error',
                    contents: "<p class='q'>${lang.invalid_otp}</p><p class='info'></p>",
                    buttons : [{
                        btext : "${lang.confirm}",
                        btype : "normal2",
                        autoclose : true
                    }]
                });
            }
        });
        
        new OtpLogin();
    });
    </script>
</body>
</html>
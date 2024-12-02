<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="virwport" content="width=device-width,initial-scale=1">
    <title>${lang.head_title}</title>
    <link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/ta_style.css?rev=${revision}" media="screen" />
	<link rel="stylesheet" href="${baseUrl}resources/css/adm_style.css?rev=${revision}" media="screen" />
    
    <%
  	String currentLocale =  (String)request.getAttribute("currentLocale");
  	if(!"ko".equals(currentLocale)){
  	%>  
    <link rel="stylesheet" href="${baseUrl}resources/css/ta_${currentLocale}.css?rev=${revision}" media="screen, print" />
  	<%
  	}
  	%>
  	
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/lodash.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/backbone/backbone.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-placeholder.js?rev=${revision}"></script>
    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
    <![endif]-->
</head>
<body class="tLoginWrap">
    <div class="go_intro">
	    <section class="login_box msg_box" style="display:;">
			<div class="glad_msg">
                <p class="desc">${lang.desc}</p>
			</div>
	
			<form id="passwordInit" action="${baseUrl}${actionUrl}" method="post">
				<div class="glad_box">
					<div id="fail_message" class="login_msg" style="display:none">
						<span class="ic_error">!</span>
						<span class="txt not_matching">${lang.password_not_matching}</span>
						<span class="txt no_password" style="display:none">${lang.no_password}</span>
					</div>		
					<div class="change_pw">			
						<input type="password" autocomplete="off" name="password" id="password" class="ipt_login ipt_wide" placeholder="${lang.new_password}">
						<span class="msg_wrap" style="display:">
							<span class="msg_false" style="display:none">${lang.valid_password}</span>
							<span class="msg_true" style="display:none">${lang.invalid_password}</span>
						</span>
					</div>
					<div class="change_pw">			
						<input type="password" autocomplete="off" name="confirm" id="confirm" class="ipt_login ipt_wide" placeholder="${lang.confirm_password}">
					</div>
				</div>
				<div class="btn_box">
					<a id="submit" class="btn_bk">${lang.submit}</a>
					<a id="notChangePassword" class="btn_bk"  data-value="${baseUrl}${notChangeActionUrl}">${lang.not_change_password}</a>
				</div>
			</form>
		</section>
	</div>
    
    <script type="text/javascript">
    
        $(function () {
            var PasswordInit = Backbone.View.extend({
            	
                el: '#passwordInit',
                failMessage: $('#fail_message'),
                notMatchingMessage: $('#fail_message').find('span.not_matching').text(),
                noPasswordMessage: $('#fail_message').find('span.no_password').text(),
                
                events: {
                    'click #submit': 'submitPassword',
                    'keyup' : 'clearAlert',
                    'click #notChangePassword' : 'moveHome'
                },
                
                initialize: function() {
                    this.$el.find('input[placeholder]').placeholder();
                  	//IE8,9 placeholder 비밀번호로 인식되는 것 처리
                    this.passwordPlaceHolder = $('#password').val();
                    this.confirmPlaceHolder = $('#confirm').val();
                    this.$el.find("#password").focus();
                },
                
                submitPassword: function(e) {
                	e.stopPropagation();
                	
                	//IE8,9 placeholder 비밀번호로 인식되는 것 처리
                	if(this.passwordPlaceHolder == $('#password').val() && this.confirmPlaceHolder == $('#confirm').val()){
                		this.showFailMessage(this.noPasswordMessage);
                		return false;
                	}
                	
                	if (!this.verifyPasswordMatching()) {
                		this.showFailMessage(this.notMatchingMessage);
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
                
				verifyPasswordMatching: function() {
                	return $('#password').val() == $('#confirm').val();
                },
                
                showFailMessage: function(message) {
                	this.failMessage.show().find('span.txt').text(message);
                },
                
                generateSubmitData: function() {
                    return JSON.stringify({
                    	password: $('#password').val(),
                    	confirm: $('#confirm').val()
                    });
                },
                
                onSubmitSuccess: function(resp) {
                	location.href = resp.data.redirectUrl;
                },
                
                onSubmitError: function(xhr, status, error) {
               		this.showFailMessage($.parseJSON(xhr.responseText).message);
                },
                
                clearAlert: function(event){
                	if(event.keyCode != 13){
        		    	var isDisplayAlert = $('#fail_message').css('display');
        		    	if(isDisplayAlert != 'none'){
        		    		$('#fail_message').css('display', 'none');
        		    	}
        	    	}
                },
                
                moveHome : function(){
                	$.ajax({
                        url: $('#notChangePassword').attr('data-value'),
                        type: 'POST',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: this.generateSubmitData(),
                        success: this.onSubmitSuccess,
                        error: this.onSubmitError,
                        context: this
                    });
                	
                }
            });
            
            new PasswordInit();
        });
    </script>
</body>
</html>
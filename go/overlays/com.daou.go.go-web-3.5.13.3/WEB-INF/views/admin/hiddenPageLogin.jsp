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
	<link rel="stylesheet" href="${baseUrl}resources/css/adm_style.css?rev=${revision}" media="screen, print" />

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
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-util.js?rev=${revision}"></script>
    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
    <![endif]-->
</head>
<body class="tLoginWrap">
    <div class="go_intro">
	    <section class="login_box msg_box" style="display:;">
			<div class="glad_msg">
                <p class="desc">${lang.title}</p>
			</div>
	
			<form id="hiddenPageLogin" action="${baseUrl}${actionUrl}" method="POST">
				<div class="glad_box">
					<div id="fail_message" class="login_msg" style="display:none">
						<span class="ic_error">!</span>
						<span class="txt not_matching">${lang.password_not_matching}</span>
					</div>		
					<div class="change_pw">			
						<input type="password" autocomplete="off" name="password" id="password" class="ipt_login ipt_wide" placeholder="${lang.password}">
					</div>
				</div>
				<div class="btn_box">
					<a id="submit" class="btn_bk">${lang.confirm_password}</a>
					<a id="reset" class="btn_bk">${lang.cancel_password}</a>
				</div>
			</form>
		</section>
	</div>
    
    <script type="text/javascript">
    
        $(function () {
            var HiddenPageLogin = Backbone.View.extend({
            	
                el: '#hiddenPageLogin',
                failMessage: $('#fail_message'),
                notMatchingMessage: $('#fail_message').find('span.not_matching').text(),
                noPasswordMessage: $('#fail_message').find('span.no_password').text(),
                
                events: {
                    'submit' : 'submitPassword',
                    'click #submit': 'submitPassword',
                    'click #reset': 'resetPassword',
                    'keyup' : 'clearAlert'
                },
                
                initialize: function() {
                    this.$el.find('input[placeholder]').placeholder();
                    this.$el.find("#password").focus();
                },
                
                submitPassword: function() {

                	$.ajax({
                        url: this.$el.attr('action'),
                        type: 'POST',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: this.generateSubmitData(),
                        success: this.redirect,
                        error: this.onSubmitError,
                        context: this
                    });
                	
                    return false;
                },
                
                resetPassword : function(){
                	this.$el.find("#password").val("");
                	this.$el.find("#password").focus();
                },
                
                showFailMessage: function(message) {
                	this.failMessage.show().find('span.txt').text(message);
                },
                
                generateSubmitData: function() {
                    return JSON.stringify({
                    	password: $('#password').val(),
                    	redirectUrl : this.XSSFilter(this.getParameterByName('returnUrl'))
                    });
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
                
                XSSFilter: function( str ) {
        		    if( !str ) return str;
        		    
        		    str = str.replace(/[\"\'][\s]*javascript:(.*)[\"\']/gi, "\"\"");
        		    str = str.replace(/[<]*[\s]*script(.*)/gi, "");
        		    str = str.replace(/eval\((.*)\)/gi, "");
        		    
                    if( !!str ) {
                        str = str.replace(/</gi, "&lt;");
                        str = str.replace(/>/gi, "&gt;");
                    }
        		    
        		    return str;
        		}, 
                
                getParameterByName: function(name) { 
                	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]"),
                  		 regexS = "[\\?&]" + name + "=([^&#]*)",
                  		 regex = new RegExp(regexS),
                  		 results = regex.exec(window.location.search);

            		if (results) {
            			return decodeURIComponent(results[1].replace(/\+/g, " "));
            		} else {
            			return "";
            		}
                },
                
                getReturnURL : function(resp) {
                	var url = decodeURIComponent(resp.data.redirectUrl);
                	if (url == "undefined") url = GO.contextRoot + "/";
                	
                	return url;
                },
                
                redirect : function(resp) {
                	document.location = location.protocol + "//" + location.host + this.getReturnURL(resp);
                }
            });
            
            new HiddenPageLogin();
        });
    </script>
</body>
</html>
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
    <base href="${baseUrl}">
    <link rel="stylesheet" href="${baseUrl}resources/css/ta_style.css?rev=${revision}" media="screen" />
    
    <%
  	String currentLocale =  (String)request.getAttribute("currentLocale");
  	if(!"ko".equals(currentLocale)){
  	%>  
    <link rel="stylesheet" href="${baseUrl}resources/css/ta_${currentLocale}.css?rev=${revision}" media="screen, print" />
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
    
</head>
<body class="admin_setting">
    <div class="twrap">
	    <div class="progress">
		    <ul>
				<li class="pro_step">
					<span class="pro01_ing"></span>
					<span class="pro_txt">${lang.start}</span>
				</li>
				<li class="pro_dot1">
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot last"></span>
				</li>
				<li class="pro_step">
					<span class="pro06_ing"></span>
					<span class="pro_txt">${lang.license}</span>
				</li>
				<li class="pro_dot2">
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot last"></span>
				</li>
				
				<li class="pro_step">
					<span class="pro06_ing"></span>
					<span class="pro_txt">${lang.domain}</span>
				</li>
				<li class="pro_dot3">
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot last"></span>
				</li>
				<li class="pro_step">
					<span class="pro06_ing"></span>
					<span class="pro_txt">${lang.site}</span>
				</li>
				<li class="pro_dot4">
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot last"></span>
				</li>
				<li class="pro_step">
					<span class="pro06_ing"></span>
					<span class="pro_txt">${lang.done}</span>
				</li>
			</ul>
		</div>
		
		<form id="loginForm" method="post">
		<div class="contents">
			<div class="txt">
				<span class="txt_big">${lang.welcome}</span>
				<span class="txt_small">${lang.welcomeMessage}</span>
			</div>
			<div class="s_btn_g">
				<div class="s_btn start">
					<a id="login_submit">${lang.start}</a>
				</div>
			</div>
		</div>
		</form>
		
		<div class="tFooter footer_color">
			<section class="meta">
				<small class="copyright">Copyright ⓒ <strong>DAOU Tech</strong> Inc. All rights reserved.</small>
			</section>
		</div>
        
    </div>
    
    <script type="text/javascript">
	    function clearAlert(event){
	    	if(event.keyCode != 13){
		    	var isDisplayAlert = $('.login_msg').css('display');
		    	if(isDisplayAlert != 'none'){
		    		$('.login_msg').css('display', 'none');
		    	}
	    	}
	    }
    
		function checkIEUa(agent){
 		if(agent.indexOf("msie") > -1){
 			if(agent.indexOf("trident")>-1){
 				return false;        
 			}else if(agent.indexOf("msie 8.0")>-1){
 				return false;        
 			} 
 			return true;   
 		}else {
 			return false;    
 		}
 	}
		var ua = window.navigator.userAgent.toLowerCase();
		if(checkIEUa(ua)){
			jQuery.goIEInfoView({root : '${baseUrl}', locale : '${currentLocale}' });
		}else{
            var Login = $(function (window, global) {
                var LoginView;
                
                LoginView = Backbone.View.extend({
                	el : '#loginForm',
                    events: {
                    	'click #login_submit': 'processLoginByApiCall',
                    },
                    processLoginByApiCall: function() {
                    	var url = 'ad/api/login';
                        $.ajax({
                            url: url,
                            type: 'POST',
                            dataType: 'json',
                            contentType: 'application/json',
                            data: this.generateSubmitData(),
                            success: $.proxy(this.onSubmitSuccess, this),
                            error: this.onSubmitError,
                            context: this
                        });
                    },
                    generateSubmitData: function() {
                        var data = {
                            username: "installtempuser",
                            password: "installtempuser"
                        };
                        return JSON.stringify(data);
                    },
                    onSubmitSuccess: function(resp) {
                    	var self = this;
                        setTimeout(function(){
                            var redirectUrl = decodeURIComponent(resp.data.redirect);
                            document.location = GO.util.XSSFilter(self.getProtocol() + location.host + redirectUrl);
                        }, 1000);
                        return false;
                    },
                    getProtocol : function() {
                    	var isAdmin = this.loginType == "admin";
                    	var destProtocol = "http://";
                    	if (isAdmin && location.protocol == "https:") destProtocol = "https://";
                	    return destProtocol;
                    }
                });
                
                new LoginView();
                
            }(window, this));
		}
    </script>
</body>
</html>
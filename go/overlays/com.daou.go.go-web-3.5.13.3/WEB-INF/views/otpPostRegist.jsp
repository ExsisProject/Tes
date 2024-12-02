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
<body class="user_front" id="bodyPart">
    <div class="go_wrap go_skin_default go_intro_wrap mint_theme">
		<div class="go_intro otp_process">
			<section id="otp_post_regist" class="login_box msg_box" >
				<form id="otpPostRegist" method="post">				
					<div class="otp_process_msg">
						<p class="title">${lang.title}</p>
						<p class="desc">${lang.subtitle}</p>
					</div>
					<div class="custom_visual">
					</div>
					<div class="process_bar">
						<ul>
							<li>
								<p class="step">${lang.step01}</p>
								<p class="title">${lang.step01_title}</p>
							</li>
							<li class="arrow">
							</li>
							<li>
								<p class="step">${lang.step02}</p>
								<p class="title">${lang.step02_title}</p>
							</li>
							<li class="arrow">
							</li>
							<li class="active">
								<p class="step">${lang.step03}</p>
								<p class="title">${lang.step03_title}</p>
							</li>
						</ul>
					</div>
					<div class="content">
						<p class="desc">${lang.post_regist_desc01}</p>
						<p class="desc"><span>${lang.post_regist_desc02}</span></p>
						<br>
						<p class="title_s">${lang.post_regist_desc03}</p>
						<div class="otp_step">
							<ul>
								<li class="otp_step1">
									<p class="title">${lang.step01_name}</p>
									<p class="txt">${lang.post_regist_desc04}</p>
								</li>
								<li class="otp_step_arrow">
								</li>
								<li class="otp_step2">
									<p class="title">${lang.step02_name}</p>
									<p class="txt">${lang.post_regist_desc05}</p>
								</li>
								<li class="otp_step_arrow">
								</li>
								<li class="otp_step3">
									<p class="title">${lang.step03_name}</p>
									<p class="txt">${lang.post_regist_desc06}</p>
								</li>
							</ul>
						</div>
					</div>
					<fieldset>
						<div class="btn_box">
							<a id="submit" class="btn_bk">${lang.post_regist_confirm}</a>
						</div>
					</fieldset>
					<input type="submit" style="visibility:hidden" />
				</form>
			</section>
		</div>
	</div>
	
    <script type="text/javascript">
	$(function () {
			
		var postOtpRegistView = Backbone.View.extend({
			el: '#otpPostRegist',
			
			events: {
				'click #submit': 'goNext',
				'submit': 'goNext'
			},
			
			initialize: function() {
				var $el = this.$el;
			},
			
			goNext: function() {
				location.href = "/";
			}
		});
		new postOtpRegistView();

	});
    </script>
</body>
</html>
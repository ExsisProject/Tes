<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width, target-densitydpi=medium-dpi" />
	<title>${lang.title}</title>
	<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
	<link rel="stylesheet" href="${baseUrl}resources/css/go_m_style.css?rev=${revision}" media="all" />
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/libs/go-jssdk.js?rev=${revision}"></script>	<style type="text/css">
	html, body { width:100%;  overflow:hidden; }
</style>
</head>
	<body>
	<div class="go_wrap">
		<section class="login_wrap otp_regist">
			<form id="mobileOTPGuide" method="post">	
				<div class="ic ic_otp_lock"></div>
				<div class="otp_status">${lang.mobile_msg01}</div>
				<div class="txt">${lang.mobile_msg02}</div>
				<fieldset>
					<a class="btn_major_otp" href="${downloadLink}">${lang.app_down}</a>
				</fieldset>
				<div class="des">${lang.mobile_msg03}</div>
			</form>
			<input type="submit" style="visibility:hidden" />
		</section>
	</div>

	<script type="text/javascript">
		$(function($) {
			window.androidHistoryBack = function(){
				window.GOMobile.pressBackKey();
			};

			function setBodyHeight(){
				$("#content").css({
					'height' : 'auto',
					'width' :'auto'
				});
			};

			$(window).on('resize' , function(){
				setBodyHeight();
			});
		}(jQuery));
	</script>	
	</body>
</html>
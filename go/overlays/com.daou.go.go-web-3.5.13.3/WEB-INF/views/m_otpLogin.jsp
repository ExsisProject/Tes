<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width, target-densitydpi=medium-dpi" />
<title></title>
<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
<link rel="stylesheet" href="${baseUrl}resources/css/go_m_style.css?rev=${revision}" media="all" />
<script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/libs/go-jssdk.js?rev=${revision}"></script>
<style type="text/css">
html, body { width:100%;  overflow:hidden; }
</style>
</head>
<body>
	<div class="go_wrap">
		<section class="login_wrap otp_confirm">
			<header>
                <img src="${mobileImg}" title="Logo">
			</header>
			<div class="otp_status">${lang.otp_msg01}</div>
			<!-- <div class="otp_status">OTP Auth Use</div> -->
			<form id="otpLogin" class="login_form" action="${baseUrl}${actionUrl}" method="post">
				<fieldset class="step_otp">

					<legend>${certification_otp}</legend>
					<div class="div_ipt">
						<input id="userOTP" type="password" autocomplete="off" class="input" title="password" maxlength="6" placeholder="${lang.input_otp}">
						<button class="btn btn_del_type1" type="button" title="delete" style="display: none;"></button>
					</div>
					<div class="btn_enter">
						<input id="submit" class="btn_major_otp" type="submit" title="${lang.confirm}" value="${lang.confirm}">
					</div>

				</fieldset>
			</form>
			<div class="des">
				<%-- <span class="txt">${lang.mobile_msg03}</span> --%>
				<span class="txt">${lang.otp_msg02}</span>
			</div>
		</section>
		
		<!-- layer -->
		<div class="layer_alarm" style="display:none" id="errorDiv">
			<span class="ic ic_alarm"></span><span class="txt" id="errorMsg">${lang.invalid_otp}</span>
		</div>
	</div>
    
    <script type="text/javascript">
    
    $(function($){
        $("#userOTP").focus();
        
        $("#submit").click(function(){
            var url = $("#otpLogin").attr('action'),
                options = {
                    userOTP: $("#userOTP").val(),
                };
            
            if($('#userOTP').val().length != 6){
            	$('.layer_alarm').show();
        		return false;
        	}else{
        		$('.layer_alarm').hide();
        	}
            
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(options),
                success: function(response){
                    window.location.href = decodeURIComponent(response.data.redirectUrl);
                },
                error: function(response){
					var responseData = JSON.parse(response.responseText);
                    $("#errorMsg").text(responseData.message);
                    $("#errorDiv").show();
                    setTimeout(function() {
                        $("#errorDiv").hide();
                    }, 2000);
                }
            });
            return false;
        });
        
        $("button.btn_del_type1").click(function(){
            var parentEl = $(this).parents("div.div_ipt");
            parentEl.find("input").val("");
            parentEl.find("button.btn_del_type1").hide();
        });
        
        $("#userOTP").keyup(function(){
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
   
</body>
</html>
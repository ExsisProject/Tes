
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>${lang.title}</title>
<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
<link rel="stylesheet" href="${baseUrl}resources/css/go_style.css?rev=${revision}" media="screen" />
</head>

<body class="user_front" onload="certLogin()">
    <div id="contentArea" class="go_wrap go_skin_default go_intro_wrap">
        <header class="go_header">
        </header>
    	<div class="go_intro">
            <section class="login_box msg_box log_confirm">
                <div class="sleeping_msg">
                    <p class="title">${lang.mainTitle}</p>
                    <p class="desc">${lang.content}</p>
                </div>
                
                <div class="btn_wrap" style="text-align: center;">
                    <a class="btn_log_major" id="regist" href="${baseRul}resources/app/SecukitInstaller_full.exe">
                    	<span class="txt">${lang.buttonText}</span>
                   	</a>
                </div>
            </section>
        </div>
    </div>
</body>             
</html>

<%@ include file="./signgate_common.jsp" %>

<script language="JavaScript">
	var search = searchToObject();
	
	function searchToObject() {
		var pairs = window.location.search.substring(1).split("&");
	    var obj = {};
	    var pair;
	    var i;

	  	for ( i in pairs ) {
	    	if ( pairs[i] === "" ) continue;

	    	pair = pairs[i].split("=");
	    	obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
	  	}

	  return obj;
	}
	
	function certLogin(onloadFlag) {
		// parentView 에서 certInstall(true) 로 호출하거나, 
		// iframe 에 param 으로 onload=true 를 주는경우가 아니면 자동 실행하지 않는다.
		if (!onloadFlag && search.onload != "true") return;
		
		var strCertID = "GroupOffice";
		var userSignCert = "";
		
		if (navigator.userAgent.indexOf('MSIE') > 0 || navigator.userAgent.indexOf('Trident/7.0') > 0) {
			var secuCert = null;
			// 보통 공인인증서 모듈을 사용하는 페이지는 페이지를 rendering 할때 모듈을 호출한다.
			// 하지만 DO 에선 사용자 설정에 따라 동적으로 모듈 사용 여부를 결정하기 때문에
			// 정보인증에서 제공하는 모듈 로드 방식을 사용 할 수 없다.
			// cab 이 설치되기 전엔 object 가 정상적으로 init 이 되지 않기 때문이다. 
			// 그러므로 secukit.js 는 잘못된 코드이며, 아래처럼 모듈을 호출하기 전에 object init 을 해준다.
			var openModule = function() {
				if (!onloadFlag) {
					document.write('<object id=SecuToolObject classid="clsid:B789767A-4553-4F78-BA2F-D025C0E646B4"></object>');
					document.write('<object id=SecuDialogObject classid="clsid:E05A42AC-20B3-4BE1-B6E1-702924FCC27C"></object>');
				}
			    secuCert = SecuDialogObject.Open();
			};
			try {
				openModule();
			} catch (e) {
				// catch 는 보험
				console.log("catch");
				openModule();
			}
		    
		    if (!secuCert) {
		    	if (parent != window) parent.$("#popOverlay").remove();
		    	return;
		    }
		    
		    var signCert = secuCert.GetCert(1);
			if(null == signCert) {
				alert("Error: " + secuCert.GetLastError());
				return;
			}
		    
		    userSignCert = signCert.GetCertString(3, 1);
			if("" == userSignCert) {
				alert("Error: " + secuCert.GetLastError());
				return;
			}
		} else { // applet
			SGJ_removeSession(strCertID);
		
			var retval = SGJ_selectCertificate(strCertID);
			if(!retval) {
				if (parent != window) parent.$('#popOverlay').remove();
				return;
			}

			userSignCert = SGJ_getCert(strCertID, "SIGN");
		}
		
	    parent.certSubmit({
	    	certStr : userSignCert
	    });
	}
</script>
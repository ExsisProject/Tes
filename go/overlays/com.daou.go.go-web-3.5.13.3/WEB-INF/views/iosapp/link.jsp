<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%
response.setHeader("cache-control","no-cache"); 
response.setHeader("expires","0"); 
response.setHeader("pragma","no-cache");
%>
<!DOCTYPE html> 
<html> 
<head>
<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
<meta charset="euc-kr">
<style type="text/css">
* {padding: 0; margin: 0; font-family:Tahoma,Dotum,AppleSDGothicNeo; font-size:14px}
body {background: #fff url(${baseUrl}resources/images/bg_oblique_dark.png) repeat 0 0}
ul {list-style:none}
a {text-decoration:none}

.content{padding:15px 15px 10px}
.bottom {text-align:center; padding-bottom:20px}
.copyright{color:gray; font-size:12px; text-align:center}
.top {height:15px; background:#333}
.content .icon {margin-bottom:5px}
.content .info .name {margin-bottom:10px}

div.info_wrap {position:relative; height:80px}
div.info_wrap span.icon {position:absolute; top:0; left:0 ;display:block; background:url(${baseUrl}resources/images/mobile/${icon}) no-repeat 0 0; background-size:70px 70px; width:70px; height:70px}
div.info_wrap div.info {margin-left:82px; padding-top:10px}
div.info_wrap div.info p.title {font-size:23px; font-weight:bold}
div.info_wrap div.info p.company {font-size:16px}
div.box {border:1px solid #c8c8c8; border-radius:6px; padding:12px; background:#fff}
div.box ul li {color:#666; font-size:12px}

.btn_major_f {display: block; margin-top:10px; border:1px solid #1e8d98; border-radius:10px; padding:10px 0; background: -webkit-gradient(linear, left top, left bottom, from(#5ab2bb), to(#2297a3)); background: -moz-linear-gradient(top,  #5ab2bb,  #2297a3); text-align:center; box-shadow: 0 1px 2px 1px rgba(0,0,0,0.1)}
.btn_major_f span.txt	{font-size:17px; color:#fff; font-weight:bold; text-shadow:0 -1px 0 #666}

.appDownDescription {margin:0 auto 30px; text-align:center; font-size:14px; color:#4c4c4c;}
.appDownDescription strong {font-size:14px;}

@media screen and (-webkit-device-pixel-ratio:1.5){
	div.info_wrap span.icon {background:url(${baseUrl}resources/images/mobile/${icon15});background-size:70px 70px}
}

@media screen and (-webkit-device-pixel-ratio:2){
	div.info_wrap span.icon {background:url(${baseUrl}resources/images/mobile/${iconx2});background-size:70px 70px}
}
</style>

<script type="text/javascript">
function checkOs() {
	var agent = window.navigator.userAgent.toLowerCase();
	if (agent.indexOf("android") > -1) {
		document.getElementById("android_link").style.display = "inline-block";
	} else if (agent.indexOf("iphone") > -1) {
		document.getElementById("iphone_link").style.display = "inline-block";
	} else {
		document.getElementById("android_link").style.display = "inline-block";
		document.getElementById("iphone_link").style.display = "inline-block";
	}
}
</script>
</head>
<title>${title}</title>
<body onload="checkOs()">
	<div class="top"></div>
	
	<div class="content">
		<div class="info_wrap">
            <span class="icon"></span>
            <div class="info">
                <p class="title">${title}</p>
                <p class="company">${companyInfo}</p>
            </div>
        </div>
        <div class="box">
            <ul>
				<li>${updateContents}</li>
			</ul>
        </div>
        <a href="${plistUrl}"><span class="btn_major_f" data-role="button"><span class="txt">${iphoneAppDown}</span></span></a>
	</div>
	<div class="appDownDescription">
		<strong>${iphoneAppDown}</strong>
		${appDownDescription}
	</div>
	<div class="copyright">
		${copyright}
	</div>
</body>
</html>

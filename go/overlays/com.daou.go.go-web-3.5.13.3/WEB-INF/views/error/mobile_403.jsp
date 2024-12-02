<%@page import="com.daou.go.core.component.MessageSourceHelper"%>
<%@page import="org.eclipse.core.runtime.internal.adaptor.MessageHelper"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width, target-densitydpi=medium-dpi" />
<title>Group Office</title>
<%
	String contextRoot = request.getContextPath();
%>
<style>
body {
font-size: 15px;
color: #4E4E4E;
background: #f6f6f6;
-webkit-tap-highlight-color: rgba(0,0,0,0);
}
* {font-family: malgun gothic, dotum, sans-serif;-webkit-text-size-adjust: none;margin: 0;padding: 0;line-height: 1.2;
letter-spacing: -1px;word-break: break-all;}
div.go_wrap header.go_header {height: 44px;display: block}
div.go_wrap header.go_header div.nav {position: absolute;top: 0;left: 0;z-index: 100;width: 100%;}
div.nav h1 {height: 44px;font-size:18px; line-height: 44px;text-align: center;color: #fff;text-shadow: 0 -1px 2px #000;background: -webkit-gradient(linear, left top, left bottom, from(#4e4e4e), to(#323232));}

div.go_wrap div.go_body {position: relative;overflow: hidden}
div.go_wrap div.go_body div.go_content {position: relative;background: #fff;min-height: 100%}
div.go_content {z-index: 2}

span.ic_notice {display: block;background: url(<%=contextRoot%>/resources/images/mobile/ic_notice.png) no-repeat;background-size: 300px 300px}
span.ic_network_error {background-position: 0 -100px;width: 70px;height: 65px}
div.notice span.ic_notice {margin: 30px auto 10px}
div.notice h2.title {padding: 0 20px;margin-bottom: 6px;font-size:18px}
.desc {color: #999;}
a {text-decoration: none;color: #4E4E4E;}
.btn_major {cursor: pointer;display: inline-block;height: 36px;line-height: 1.2;border: 1px solid #1e8d98;border-radius: 4px;padding: 0 12px;background: -webkit-gradient(linear, left top, left bottom, from(#5ab2bb), to(#2297a3));}
div.notice span.btn_major {margin: 30px;}
.btn_major span.txt {display:inline-block; font-size: 16px;color: #fff;font-weight: bold;letter-spacing: 0;text-shadow: 0 -1px 0 #666; vertical-align:top; padding-top:8px}
div.notice {text-align: center;padding: 30px 0;}
div.content {border-bottom:0}

@media screen and (-webkit-device-pixel-ratio:1.5) { 
span.ic_notice	{display:block; background:url(<%=contextRoot%>/resources/images/mobile/ic_notice15.png) no-repeat; background-size:300px 300px}
span.ic_network_error	{background-position:0 -100px}
}
@media screen and (-webkit-device-pixel-ratio:2){ 
span.ic_notice {display:block; background:url(<%=contextRoot%>/resources/images/mobile/ic_noticex2.png) no-repeat; background-size:300px 300px}
span.ic_network_error	{background-position:0 -100px}
}
</style>
<script type="text/javascript" src="<%=contextRoot%>/resources/js/vendors/jquery/jquery.js"></script>
</head>
<body style="border:0; background:white">

<%
	MessageSourceHelper messageSourceHelper = new MessageSourceHelper();
%>
<div class="go_wrap">
	<div class="go_body">
		<div class="go_content" style="left:0">
  
			<div class="content_page">
				<div class="content">
					<div class="notice" style="margin-top:0">
						<span class="ic_notice ic_network_error"></span>
						<h2 class="title"><%= messageSourceHelper.getMessage("error.403.title") %></h2>
						<span class="desc"><%= messageSourceHelper.getMessage("error.403.content") %></span>
						<br />
						<a class="btn_major_s" onclick="javascript:GOMobile403ErrorPage.back403Error();" style="cursor: pointer;"><span class="btn_major" data-role="button"><span class="txt"><%= messageSourceHelper.getMessage("common.page.back") %></span></span></a>							
					</div>
				</div>
			</div>			
		</div>
	</div>
</div>

<script type="text/javascript">
var GOMobile403ErrorPage = {};

GOMobile403ErrorPage.back403Error = function() {
    var ua = "${faviconPath}";
    ua = ua ? ua.toLowerCase() : "";
    
    if(ua.indexOf("android") > -1) {
        window.GOMobile.moveTab();
    } else if(ua.indexOf("iphone") > -1) {
        // window.location 의 연속 호출시 무효화 되는 이슈로 대기 처리함.
        setTimeout(function(){
            window.location = "gomobile://moveTab";
        }, 300);
    } else {
        history.back();
    }
};
</script>

</body>
</html>
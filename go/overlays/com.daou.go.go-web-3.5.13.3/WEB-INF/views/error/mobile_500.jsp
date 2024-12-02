<%@page import="org.springframework.context.i18n.LocaleContextHolder"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions"  prefix="fn"%>
<%@taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html>
<head>
<%
	String contextRoot = request.getContextPath();
%>
	<meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width" />
    <script type="text/javascript" src="<%=contextRoot%>/resources/js/vendors/jquery/jquery.js"></script>
	<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
    <![endif]-->
</head>
<style>
body {
font-size: 15px;
color: #4E4E4E;
background: #f6f6f6;
-webkit-tap-highlight-color: rgba(0,0,0,0)}
* {font-family: malgun gothic, dotum, sans-serif;-webkit-text-size-adjust: none;margin: 0;padding: 0;line-height: 1.2;
letter-spacing: -1px;word-break: break-all;}
div.go_wrap header.go_header {height: 44px;display: block}
div.go_wrap header.go_header div.nav {position: absolute;top: 0;left: 0;z-index: 100;width: 100%;}
div.nav h1 {height: 44px;font-size:18px; line-height: 44px;text-align: center;color: #fff;text-shadow: 0 -1px 2px #000;background: -webkit-gradient(linear, left top, left bottom, from(#4e4e4e), to(#323232));}

div.go_wrap div.go_body {position: relative; overflow: hidden}

div.go_wrap div.go_body div.go_content {position: relative; background: #fff; min-height: 100%}
div.go_content {z-index: 2;}

span.ic_notice {display: block;background: url(<%=contextRoot%>/resources/images/mobile/ic_notice.png) no-repeat;background-size: 300px 300px}
span.ic_network_error {background-position: 0 -100px;width: 70px;height: 65px}
div.notice span.ic_notice {margin: 30px auto 10px}
div.notice h2.title {padding: 0 20px;margin-bottom: 6px;font-size:18px}
.desc {color: #999;}
a {text-decoration: none;color: #4E4E4E;}
.btn_major {cursor: pointer;display: inline-block;height: 36px;line-height: 36px;border: 1px solid #1e8d98;border-radius: 4px;padding: 0 12px;background: -webkit-gradient(linear, left top, left bottom, from(#5ab2bb), to(#2297a3));}
div.notice span.btn_major {margin: 30px;}
.btn_major span.txt {font-size: 16px;color: #fff;font-weight: bold;letter-spacing: 0;text-shadow: 0 -1px 0 #666;}
div.notice {text-align: center;padding: 10px 0;}
div.content {border-bottom:0}
div.task_type {border: 7px solid #ddd; margin: 20px 10px 0; padding: 10px; text-align: left}
div.bar {border: 1px solid #ddd; margin: 10px 0}
</style>
<fmt:setLocale value="<%= LocaleContextHolder.getLocale().toString() %>" />
<fmt:setBundle basename="messages/message" />

<body style="border:0; background:white">
<%
	String title = request.getParameter("title") == null ? "" : (String)request.getParameter("title");
	String message = request.getParameter("msg") == null ? "" : (String)request.getParameter("msg");
	Boolean hasBackButton =  request.getParameter("hasBackButton") == null ? true : false; 
%>
	<div class="go_wrap">
		<header class="go_header">
			<div class="nav">
				<h1><fmt:message key="common.internal.error" /></h1>
			</div>
		</header>
		<div class="go_body">
			<div class="go_content" style="left:0">
				<div class="content_page">
					<div class="content">
						<div class="notice" style="margin-top:0">
							<span class="ic_notice ic_network_error"></span>
							<h2 class="title">
		                    	<% if(title == ""){ %>
		                    	<fmt:message key="common.page.internal.error" />
		                    	<% }else{ %>
		                    		<%= title %>
		                    	<% } %>
							</h2>
							<div>
							<span class="desc">
							<%= message %>
							</span>
							</div>
							<% if(hasBackButton){ %>
							<a id="back">
								<span class="btn_major" data-role="button">
									<span class="txt"><fmt:message key="common.page.back" />
									</span>
								</span>
							</a>
							<% } %>
						</div>
					</div>
				</div>			
			</div>
		</div>
	</div>
	<script type="text/javascript">
        $("#back").click(function() {
            history.back();
        });
    </script>
</body>
</html>
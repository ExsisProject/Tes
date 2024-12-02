<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<% 
	String locale = (String)request.getAttribute("locale");
%>
<!DOCTYPE html>

<html>
<head>
<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
<link rel="stylesheet" href="${baseUrl}resources/css/fonts/notosans.css?rev=${revision}" media="all" />
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<script src="/resources/js/vendors/jquery/jquery.js" type="text/javascript"></script>
<title></title>
<style>
body {
	margin: 0px; 
	padding: 0px; 
	line-height: 1.5; 
	font-size: 12px;
<%
	if("jp".equals(locale)) {
%>
	font-family: MS PGothic,Osaka,arial,sans-serif
<%
	} else {
%>
	font-family: '돋움',dotum,AppleGothic,arial,Helvetica,sans-serif;
<%		
	}
%>
}
P {
	margin: 0px; 
	padding: 0px; 
	line-height: 1.5;
}
td {
    word-break:break-all;
}

</style>
<base target="_blank">
</head>
<body>
	<div id="content"></div>
</body>
</html>

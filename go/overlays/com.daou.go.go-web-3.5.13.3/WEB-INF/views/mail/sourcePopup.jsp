<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<%@include file="header.jsp"%>
<style type="text/css">
div.layer_original_view div.content div.original_wrap {padding:0px;background:none;line-height:0;}
</style>
<script type="text/javascript">
CURRENT_PAGE_NAME = "popup";
var param = ${data};
</script>
<%@include file="mailScript.jsp" %>
<script type="text/javascript">
jQuery(document).ready(function() {
	initMailFunction();
	mailControl.mailSource(param);
});
</script>
</head>
<body class="popup">
<div id="popupBodyWrap" class="layer_normal layer_original_view popup" style="width:100%;">
<header>
	<h1><tctl:msg key="mail.sourceview"/></h1>		
	<a class="btn_layer_x" href="javascript:this.close();"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close"/></span></a>
</header>
<div class="content" style="width:auto;">
	<div class="original_wrap">
		<iframe name="sourceFrame" id="sourceFrame" src="about:blank" frameborder="0" width="100%" height="480px" style="height:480px;"></iframe>
	</div>
</div>
<footer class="btn_layer_wrap">
	<a class="btn_minor_s" href="javascript:this.close();"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close"/></span></a>
</footer>
</div>
<%@include file="mailTemplate.jsp"%>
<%@include file="mailModalTemplate.jsp"%>
</body>
</html>
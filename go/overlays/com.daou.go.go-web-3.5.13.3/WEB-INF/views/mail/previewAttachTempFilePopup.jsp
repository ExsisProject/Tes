<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<%@include file="header.jsp"%>
<script type="text/javascript">
CURRENT_PAGE_NAME = "popup";
var param = ${data};
</script>
<%@include file="mailScript.jsp" %>
<script type="text/javascript">
jQuery(document).ready(function() {
	makeProcessLoader();
	ActionLoader.postGoLoadAction("/api/preview/tempFile",param,function(data) {
		removeProcessLoader();
		window.location = data.str;
    },"json", function() {
    	jQuery.goAlert(mailMsg.mail_attach_convert_error1,"",function() {
        	window.close();
        });
    });
});
</script>
</head>
<body style="width:100%;height:100%;"></body>
</html>
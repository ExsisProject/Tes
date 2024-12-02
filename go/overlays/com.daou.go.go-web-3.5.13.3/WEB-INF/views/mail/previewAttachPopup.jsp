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
	ActionLoader.postGoLoadAction("/api/mail/message/attach/preview",param,function(data) {
		if (!data.convert) {
			jQuery.goAlert(mailMsg.mail_attach_convert_error1,"",function() {
	        	window.close();
	        });
			return;
		}
		
		if (data.image) {
       		window.location = data.previewPath;        		
    	} else {
    		window.location = BASEURL+"resources/synap/skin/doc.html?fn="+data.previewPath+"&rs=/api/preview/rs/"+data.previewPath;
    	}
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
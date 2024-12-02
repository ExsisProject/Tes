<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<%@include file="../mail/header.jsp"%>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.util.js?rev=${revision}"></script>
<script type="text/javascript">
CURRENTMENU = "webfolder";
var param = ${data};
</script>
<script type="text/javascript">
jQuery(document).ready(function() {
	makeProcessLoader();
	ActionLoader.postGoLoadAction("/api/webfolder/file/preview",param,function(data) {
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
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
<!--[if IE]>
<script src="${baseUrl}resources/js/vendors/html5shiv-printshiv.js"></script>
<![endif]-->
<script type="text/javascript">
jQuery(document).ready(function() {
	initMailFunction();
	if(param.actionType == "preview") {
		mailControl.mailPreviewPrint(param);
	} else {
		mailControl.mailPrint(param);
	}
	
});

function initStyle() {
	var fontFamily = "돋움,dotum,AppleGothic,arial,Helvetica,sans-serif";
	if(LOCALE === 'jp') {
		fontFamily = "MS PGothic,Osaka,arial,sans-serif";
	}
	
	jQuery("body").css("font-family", fontFamily);
}

</script>
</head>
<body class="popup">
<div id="popupBodyWrap" class="layer_normal layer_mail_print popup" style="width:100%;"></div>
<%@include file="mailTemplate.jsp"%>
<%@include file="mailModalTemplate.jsp"%>
<script type="text/javascript">
	jQuery(function() {
		initStyle();
	});
</script>
</body>
</html>
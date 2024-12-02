<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<%@include file="../mail/header.jsp"%>
<script type="text/javascript">
	CURRENTMENU = "webfolder";
</script>
<script type="text/javascript">
var data = {};
var _this = this;
jQuery(document).ready(function() {
	if (opener && opener.getPopupData) {
		data = opener.getPopupData();
		initDataParse();
	} else {
		jQuery.goAlert(mailMsg.error_msg_title,mailMsg.error403_001,function() {
			_this.close();
		});
	}
});

function initDataParse() {
	var popupForm = document.popupForm;
	popupForm.data.value = JSON.stringify(data);
	popupForm.path.value = (!data.action || data.action == 'undefined') ? "selectFolder" : data.action;
	popupForm.action = "/app/webfolder/popup/process";
	popupForm.submit();
}
</script>
</head>
<body>
<form name="popupForm" method="post" onsubmit="return false;">
	<input type="hidden" name="path"/>
	<input type="hidden" name="data"/>
</form>
</body>
</html>

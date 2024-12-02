<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<%@include file="header.jsp"%>
<%
    String rawData = request.getParameter("data");
    String escapedData = rawData.replace("<script>", "&lt;script&gt;").replace("</script>", "&lt;/script&gt;");
%>
<script type="text/javascript">
CURRENT_PAGE_NAME = "popup";
getGoUserConfigForPopup();
var param = <%=escapedData%>;

</script>
<%@include file="mailScript.jsp" %>
<script type="text/javascript">
jQuery(document).ready(function() {
	initMailFunction();
	mailControl.mailPreview(param);
	
	jQuery("#popupBodyWrap").on("click", "a,span", function(event) {
		var type = jQuery(this).attr("evt-rol");
		if (!type) return;
		event.preventDefault();
		var part = jQuery(this).closest("li").attr("part");
		var folderName = jQuery("#folderName").val();
		var uid = jQuery("#msgUid").val();
		if (type == "print-message") {
			//downLoadNestedAttach(folderName, uid, part);
			param.viewImg = true;
    		param.action = "print";
    		param.actionType = "preview";
    		POPUPDATA = param;
			window.open("/app/mail/popup","printPopup","scrollbars=yes,width=650,height=640,resizable=yes");
		}
	});
});
</script>
</head>
<body class="popup">
<div id="popupBodyWrap" class="layer_normal popup layer_mail_print" style="width:100%;"></div>
<%@include file="mailTemplate.jsp"%>
<%@include file="mailModalTemplate.jsp"%>
</body>
</html>

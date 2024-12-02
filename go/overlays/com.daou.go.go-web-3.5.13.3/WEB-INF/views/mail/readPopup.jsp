<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<%@include file="header.jsp"%>
<script type="text/javascript">
CURRENT_PAGE_NAME = "popup";
layoutMode = "n";
var param = ${data};
</script>
<%@include file="mailScript.jsp" %>
<script type="text/javascript">
var isAllFolder = false;
var isPopupWrite = ("true" == param.popupWrite);
var isMailBadgeUse = false;

getGoUserConfigForPopup();

POPUPREAD = true;
setTitleBar(TITLENAME);
jQuery(document).ready(function() {
	initMailFunction();
	mailControl.makeMailEvent();
	
	folderControl.getTagListAfterFunc(function(data) {
		folderControl.setTagData(data);
		mailControl.makeListToolbar(param);
		mailControl.setListParam(param);
		mailControl.readMessage(param,true);
		mailControl.currentFolder = opener.mailControl.getCurrentFolder();
	});
	folderControl.getFolderInfoData(function(data) {
		folderControl.setUserFolderList(data.userFolders);
	});
});
</script>
</head>
<body class="popup">
<div id="popupBodyWrap" class="layer_normal layer_mail_popup popup" style="width:100%;">
	<header>
		<h1><tctl:msg key="mail.popupview"/></h1>		
		<a class="btn_layer_x" href="javascript:window.close();"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close" /></span></a>
	</header>
	<div class="content">
		<div id="mainContentWrap" class="content_page content_mail">
			<div class="dataTables_wrapper">
				<div id="toolbar_wrap" class="tool_bar"></div>			
				<div id="mainContent" class="column_wrap_block">
				<c:if test="${device eq 'tablet'}">
					<div id="mailReadArea" style="overflow:scroll !important;-webkit-overflow-scrolling:touch !important;"></div>
				</c:if>
				<c:if test="${device ne 'tablet'}">
					<div id="mailReadArea"></div>
				</c:if>
				</div>
			</div>
		</div>
	</div>
	<footer class="btn_layer_wrap">
		<a href="javascript:this.close();" class="btn_minor_s"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close" /></span></a>
	</footer>
</div>
<%@include file="mailTemplate.jsp"%>
<%@include file="mailModalTemplate.jsp"%>
<iframe name="hidden_frame" id="reqFrame" src="about:blank" frameborder="0" width="0" height="0" style="display:none;"></iframe>
</body>
</html>
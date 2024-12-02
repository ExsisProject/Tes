<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<%@include file="header.jsp"%>
<style type="text/css">
div.layer_normal table.massrcpt th {
    padding-left: 12px;
}
table.mail_write td.option {
	padding: 0;
}
table#mailWriteAreaTable {margin:0;}

div.layer_normal select:hover {border-color: #1c99a0}

</style>
<script type="text/javascript">
CURRENT_PAGE_NAME = "popup";

layoutMode = "n";
var param = ${data};
var data = ${data};
var work = "${work}";
var wtype = "${wtype}";
var folder = "${folder}";
var wfolderType = "${wfolderType}";
var wuid = "${wuid}";
var wfolderShareSeq = "${wfolderShareSeq}";

var notiMode = "mail";
var isPopupWrite = true;

POPUPWRITE = true;
</script>
<%@include file="mailScript.jsp" %>
<script type="text/javascript">
var isAllFolder = false;
var isMailBadgeUse = false;

getGoUserConfigForPopup();

jQuery(document).ready(function() {
	initMailFunction();
	folderControl.getFolderInfoData(function(data) {
		folderControl.setQuotaInfo(data.quotaInfo);
	});

	if(data.dataType == "sendMailForWebfolder") {	
		param = {};
		
		param.work = work;
		param.wtype = wtype;
		param.folderName = folder;
		param.wfolderType = wfolderType;
		param.wuid = wuid;
		param.wfolderShareSeq = wfolderShareSeq;
	}
	
	mailControl.makeMailEvent();
	mailControl.writeMessage(param);
	if (opener && opener.isPopupView) {
		if (opener.isPopupView()) {
			opener.close();
		}
	}
});
</script>
</head>
<body class="popup">
<div id="popupBodyWrap" class="layer_normal layer_mailWrite_popup popup" style="width:100%;">
	<header>
		<h1><tctl:msg key="mail.popup.write"/> <span class="meta"><span id="processMessageWrap" class="num" style="display:none;"><strong id="processMessageContent"></strong></span></span></h1>		
		<a class="btn_layer_x" href="javascript:closeMailWritePopup()"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close"/></span></a>
	</header>
	<div class="content">
		<div id="mainContentWrap" class="content_page mail_write">
			<div class="dataTables_wrapper">
				<div id="toolbar_wrap" class="tool_bar"></div>
				<div id="write_toolbar_wrap" data-tag="write_toolbar_wrap" class="tool_bar" style="display:none;"></div>			
				<div id="mainContent" class="column_wrap_block">
					<div id="mailWriteArea"></div>
					<div id="mailSendArea"></div>
				</div>
				<div data-tag="write_toolbar_wrap" class="tool_bar tool_bar_button" style="display:none;"></div>			
			</div>
		</div>
	</div>
	<footer class="btn_layer_wrap">
		<a class="btn_minor_s" href="javascript:closeMailWritePopup()"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close"/></span></a>
	</footer>
</div>
<iframe name="hidden_frame2" id="reqFrame" src="about:blank" frameborder="0" width="0" height="0" style="display:none;"></iframe>
<%@include file="mailTemplate.jsp"%>
<%@include file="mailModalTemplate.jsp"%>
</body>
</html>

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
var isMailBadgeUse = false;
getGoUserConfigForPopup();
jQuery(document).ready(function() {
	initMailFunction();
	mailControl.readNestedMessage(param);
	
	var nestedEvent = new EventControl("#popupBodyWrap", "click", "a,span");
	nestedEvent.add("nested-attach-download", function(target) {
		var part = jQuery(target).closest("li").attr("part");
		var folderName = jQuery("#folderName").val();
		var uid = jQuery("#msgUid").val();
		downLoadNestedAttach(folderName, uid, part);
	});
	nestedEvent.add("nested-message-read", function(target) {
		var part = jQuery(target).closest("li").attr("part");
		var folderName = jQuery("#folderName").val();
		var uid = jQuery("#msgUid").val();
		readNestedPopupMessage(folderName, uid, part);
	});
	nestedEvent.add("nested-preview-attach", function(target) {
		var part = jQuery(target).closest("li").attr("part");
		var folderName = jQuery("#folderName").val();
		var uid = jQuery("#msgUid").val();
		readNestedPreviewAttach(folderName, uid, part);
	});
	nestedEvent.add("nested-save-webfolder", function(target) {
		var part = jQuery(target).closest("li").attr("part");
		var folderName = jQuery("#folderName").val();
		var uid = jQuery("#msgUid").val();
		readNestedSaveWebfolder(folderName, uid, part);
	});
	nestedEvent.add("read-view-img", function(target) {
		param.viewImg = true;
		mailControl.readNestedMessage(param);
	});
});

function downLoadNestedAttach(folderName, uid, part) {
	var npart = jQuery("#nestedPart").val();
	npart = (npart !="")? npart+"|"+part:part;
	var orgPart = jQuery("#orgPart").val();
	var param = {"folderName":folderName, "uid":uid, "part":orgPart, "nestedPart":npart, "type":"normal"};
	param = mailControl.getSharedFolderParam(param);
	mailControl.downloadAttachFile(param);
}

function readNestedPopupMessage(folderName, uid, part){
	var npart = jQuery("#nestedPart").val();
	npart = (npart !="")? npart+"|"+part:part;
	var param = {};
	param.folderName = folderName;
	param.uid = uid;
	param.nestedPart = npart;
	param.action = "nread";
	POPUPDATA = param;
	
	var wname = "popupRead"+makeRandom();
	
	window.open("/app/mail/popup",wname,"scrollbars=yes,resizable=yes,width=800,height=640");
}

function readNestedPreviewAttach(folderName, uid, part) {
	var npart = jQuery("#nestedPart").val();
	npart = (npart !="")? npart+"|"+part:part;
	var orgPart = jQuery("#orgPart").val();
	var param = {"folder":folderName, "uid":uid, "part":orgPart, "nestedPart":npart, "type":"normal"};
    param = mailControl.getSharedFolderParam(param);
    
    ActionLoader.postGoLoadAction("/api/mail/message/attach/preview",param,function(data) {
		if (!data.convert) {
			jQuery.goAlert(mailMsg.mail_attach_convert_error1);
			return;
		}
		
		var convertResultUrl = data.previewPath;
		if (!data.image) {
			convertResultUrl = BASEURL+"resources/synap/skin/doc.html?fn="+data.previewPath+"&rs=/api/preview/rs/"+data.previewPath;
    	}
		window.open(convertResultUrl,"previewAttach","resizable=yes,scrollbars=yes,status=yes,width=800,height=640");
    },"json", function() {
    	jQuery.goAlert(mailMsg.mail_attach_convert_error1);
    });
}

function readNestedSaveWebfolder(folderName, uid, part) {
	var npart = jQuery("#nestedPart").val();
	npart = (npart !="")? npart+"|"+part:part;
	var orgPart = jQuery("#orgPart").val();
	var param = {"folder":folderName, "uid":uid, "part":orgPart, "nestedPart":npart, "type":"normal"};
    param = mailControl.getSharedFolderParam(param);
    
    openWebfolderPopup(param);
}
</script>
</head>
<body class="popup">
<div id="popupBodyWrap" class="layer_normal layer_mail_print popup" style="width:100%;"></div>
<%@include file="mailTemplate.jsp"%>
<%@include file="mailModalTemplate.jsp"%>
<iframe name="hidden_frame" id="reqFrame" src="about:blank" frameborder="0" width="0" height="0" style="display:none;"></iframe>
</body>
</html>
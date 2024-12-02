<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page isELIgnored="false"%>
<%@ taglib prefix="c"  uri="/WEB-INF/tld/c.tld"%>
<%@ taglib prefix="fn"  uri="/WEB-INF/tld/fn.tld"%>
<%@ taglib prefix="fmt"  uri="/WEB-INF/tld/fmt.tld"%>
<%@ taglib prefix="tctl"  uri="/WEB-INF/tld/message.tld"%>

<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width, target-densitydpi=medium-dpi" />
	
	<link rel="stylesheet" href="${baseUrl}resources/css/go_m_customize.css?rev=${revision}" media="all" />
	<link rel="stylesheet" href="${baseUrl}resources/css/go_iscroll.css?rev=${revision}" media="all" />
	<link rel="stylesheet" href="${baseUrl}resources/css/mail.css?rev=${revision}" media="all" />
	<link rel="stylesheet" href="${baseUrl}resources/doc_editor.css?rev=${revision}" media="all" />
	<link rel="stylesheet" href="${baseUrl}resources/css/go_m_style.css?rev=${revision}" media="all" />

	<script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery-1.7.2.min.js?rev=${revision}"></script>

	<script>
		var mailMsg = {};
		jQuery.ajax({
			type:"GET",
			url : "/resources/js/lang/${fn:toLowerCase(fn:replace(locale, '_', '-'))}/mail.json",
			async : false,
			success : function(result) {
				mailMsg = result;
			},
			dataType:"json"
		});
</script>

	<script type="text/javascript">
		var data = {};
		var _this = this;
		jQuery(document).ready(function() {
			if (opener && opener.getPopupData) {
				data = opener.getPopupData();
				jQuery("#mainContent").append(data);
			} else {
				jQuery.goAlert(mailMsg.error_msg_title,mailMsg.error403_001,function() {
					_this.close();
				});
			}
		});
	</script>
</head>

<body ontouchstart>
	<div id="popupBodyWrap" class="wrap_zoom" style="width:100%;">
		<header class="go_header">
	
			<div class="nav">
				<h1><tctl:msg key="mail.popupview"/></h1>
				<div class="critical">
					<a href="javascript:window.close();" class="ic_nav_wrap"><span class="ic_nav ic_nav_back"></span></a>
				</div>
			</div>
	
		</header>
		<div class="content">
			<div id="mainContentWrap" class="content_page content_mail">
				<div class="dataTables_wrapper">
					<div id="mainContent" class="column_wrap_block">
					</div>
				</div>
			</div>
		</div>
	</div>
	<iframe name="hidden_frame" id="reqFrame" src="about:blank" frameborder="0" width="0" height="0" style="display:none;"></iframe>
</body>
</html>
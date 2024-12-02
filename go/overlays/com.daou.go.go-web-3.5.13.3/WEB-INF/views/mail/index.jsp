<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="${locale}">
	<head>
		<%@include file="header.jsp"%>
		<script type="text/javascript">
			var isPopupWrite = ${popupWrite};
			var isWriteNoti = ${writeNoti};
			var notiMode = "${notiMode}";
			var smartFilter = ${smartFilter};
			var securityCenter = ${securityCenter};
			var workAction = "${fn:escapeXml(work)}";
            var isShareFolder = "${fn:escapeXml(share)}";
			var writeToList = "${fn:escapeXml(toAddr)}";
			var workFolder = "${fn:escapeXml(folder)}";
			var workUid = "${fn:escapeXml(uid)}";
			var storeLayoutMode = "${fn:escapeXml(readMode)}";
			var searchAllFolder = "${fn:escapeXml(searchAllFolder)}";
			var wtype = "${fn:escapeXml(wtype)}";
			var wuid = "${fn:escapeXml(wuid)}";
			var folder = "${fn:escapeXml(folder)}";
			var wfolderType = "${fn:escapeXml(wfolderType)}";
			var wfolderShareSeq = "${fn:escapeXml(wfolderShareSeq)}";
			var mailMenuStatus = "mail";
			var isNotFoundError = "${fn:escapeXml(isNotFoundError)}";
			var initPage = "${fn:escapeXml(initPage)}";
			var quickType = "${fn:escapeXml(quickType)}";
			var isMailBadgeUse = false;
			var receiveNoti = ${fn:escapeXml(receiveNoti)};
			var companyDomainList = [];
			<c:if test="${!empty companyDomainList}">
				<c:forEach var="companyDomain" items="${companyDomainList}">
					companyDomainList.push("${companyDomain}");
				</c:forEach>
			</c:if>
			CURRENTMENU = "mail";
			IS_ERROR=false;
		</script>
	</head>
	<body style="position:fixed;width:100%">
		<div class="go_wrap">
			<%@include file="topmenu.jsp"%>
			<div class="go_body">
				<%@include file="mailLeftMenu.jsp"%>
				<div id="mailWrap" class="go_content">
					<header id="mailHeaderWrap" class="content_top">
						<h1 id="mail_header_msg"></h1>
						<section class="combine_search">
							<div class="c_search_wrap"><!--focus되면 "search_focus" multi class로 추가해주세요.-->
								<select class="search_op" id="searchType">
									<option value="appSearch"><tctl:msg key="mail.title"/></option>
									<option value="totalSearch"><tctl:msg key="mail.total.search"/></option>
								</select>
								<input class="c_search" type="text"  id="mailSearchKeyWord" placeholder="<tctl:msg key="mail.search"/>">
								<a class="c_btn_detail" id="mailDetailSearchBtn" title="<tctl:msg key="mail.adsearch"/>" evt-rol="mail-detail-search"><span class="txt"><tctl:msg key="mail.search.advanced"/></span><span class="ic ic_cs_detail_arrow  "></span></a>
								<input class="btn_c_search btn_search" type="button" value="<tctl:msg key="mail.search"/>" title="<tctl:msg key="mail.search"/>" evt-rol="mail-search">
							</div>
							<div id="detailSearchLayerWrap" style="position:relative;display:none;z-index:60"></div>
						</section>
					</header>
					<div id="mainContentWrap" class="content_page content_mail">
						<div class="dataTables_wrapper">
							<div id="toolbar_wrap" class="tool_bar"></div>
							<div id="write_toolbar_wrap" data-tag="write_toolbar_wrap" class="tool_bar" style="display:none;"></div>

							<div id="mainContent" class="column column_block">
								<div id="mailListArea" class="column_first">
									<div id="mail_list_content" class="mail_list_wrap div_scroll"></div>
									<div id="messageNaviWrap"></div>
								</div>
								<div id="xbar" class="xbar" style="top:0;display:none;"></div>
								<div id="ybar" class="ybar" style="top:0;display:none;"></div>
								<div id="mailReadArea" class="column_second" style="overflow:scroll !important; -webkit-overflow-scrolling:touch !important;display:none;"></div>
								<div id="mailWriteArea"></div>
								<div id="mailSendArea"></div>
							</div>

							<!-- div data-tag="write_toolbar_wrap" class="tool_bar tool_bar_button" style="display:none;"></div-->
						</div>
					</div>
					<div id="mailSettingWrap" class="content_page" style="display:none;">
						<div class="tab_menu_wrap">
							<ul class="tab_menu">
								<li class="active" evt-rol = "basic-setting"><span class="txt"><tctl:msg key="menu_conf.profile" /></span></li>
								<li evt-rol="sign-setting"><span class="txt"><tctl:msg key="menu_conf.sign" /></span></li>
								<li evt-rol="folder-setting"><span class="txt"><tctl:msg key="conf.profile.55" /></span></li>
								<li evt-rol="spam-setting"><span class="txt"><tctl:msg key="menu_conf.spam" /></span></li>
								<li evt-rol="auto-filter"><span class="txt"><tctl:msg key="menu_conf.filter" /></span></li>
								<li id="auto-forward-menu" evt-rol="auto-forward"><span class="txt"><tctl:msg key="menu_conf.forward" /></span></li>
								<li id="auto-reply-menu"  evt-rol="auto-reply"><span class="txt"><tctl:msg key="menu_conf.reply" /></span></li>
								<li id="auto-extMail-setting" evt-rol="extMail-setting"><span class="txt"><tctl:msg key="menu_conf.external" /></span></li>
								<li evt-rol="last-rcpt"><span class="txt"><tctl:msg key="conf.lastrcpt.menu" /></span></li>
							</ul>
						</div>
						<div id="mailSettingContent"></div>
					</div>
					<div id="mailBottom"></div>
				</div>
				<%@include file="orgLeft.jsp"%>
			</div>
			<%@include file="bottom.jsp" %>
		</div>
		<c:if test="${hasMobileLicense}">
			<c:if test="${device eq 'mobile' || device eq 'tablet'}">
			<a id="changeToMobileWeb" href="javascript:returnToMobileVersionView();" class="btn_mobile" data-bypass>
		    	<span class="ic_mobileVer"></span>
		    	<span class="txt"><tctl:msg key="comn.footer.mobile" /></span>
			</a>
			</c:if>
		</c:if>

 		<iframe name="hidden_frame" id="reqFrame" src="about:blank" frameborder="0" width="0" height="0" style="display:none;"></iframe>

		<form name="popupReadForm" id="popupReadForm">
			<input type="hidden" name="uid"/>
			<input type="hidden" name="folder"/>
			<input type="hidden" name="readType"/>
			<input type="hidden" name="sharedFlag"/>
			<input type="hidden" name="sharedUserSeq"/>
			<input type="hidden" name="sharedFolderName"/>
			<input type="hidden" name="part"/>
			<input type="hidden" name="nestedPart"/>
		</form>

		<%@include file="mailScript.jsp" %>

	    <script type="text/javascript">
			jQuery(document).ready(function() {
				if(USE_OAUTH_LOGIN) {
					jQuery('body').addClass("channel");
				}

				if (USE_LAB_FEEDBACK && HAS_LAB_FEEDBACK_CONFIG) {
					jQuery('body').addClass("lab");
				}
				setMailAppName();
				initMailFunction();
				initService();
				initSettingFunction();
				securityCetnerFolderInfo();
//				orgLeftInit();
				resizeLeftMenu();
				preventDrop();
			});
		</script>

<%if(isMsie){ %>
		<script language=javascript  for="TPOWERUPLOAD" event="OnFileAttached(key, idx)">
			var ocx = document.uploadForm.powerupload;
			jQuery("#ocx_normal_size").html(printSize(ocx.GetAttachedSize("NORMAL")));
			jQuery("#ocx_huge_size").html(printSize(ocx.GetAttachedSize("HUGE")));
			hugeMailCheck();
		</script>

		<script language=javascript  for="TPOWERUPLOAD" event="OnFileUploaded(key, idx)">
			var ocx = document.uploadForm.powerupload;
			if(ocx.GetAttachedFileAttr2(key, "UPKEY") == ""){
				uploadAttachFilesError = true;
				setTimeout(function(){ocx.RemoveAttachFile(key);},500);
			}
			jQuery("#ocx_normal_size").html(printSize(ocx.GetAttachedSize("NORMAL")));
			jQuery("#ocx_huge_size").html(printSize(ocx.GetAttachedSize("HUGE")));
		</script>

		<script language=javascript  for="TPOWERUPLOAD" event="OnFileDeleted(key, idx)">
			var ocx = document.uploadForm.powerupload;
			jQuery("#ocx_normal_size").html(printSize(ocx.GetAttachedSize("NORMAL")));
			jQuery("#ocx_huge_size").html(printSize(ocx.GetAttachedSize("HUGE")));
			hugeMailCheck();
		</script>

		<script language=javascript  for="TPOWERUPLOAD" event="OnChAttachMethod(key, idx)">
			var ocx = document.uploadForm.powerupload;
			jQuery("#ocx_normal_size").html(printSize(ocx.GetAttachedSize("NORMAL")));
			jQuery("#ocx_huge_size").html(printSize(ocx.GetAttachedSize("HUGE")));
			hugeMailCheck();
		</script>
<%} %>
<%@include file="mailTemplate.jsp"%>
<%@include file="mailModalTemplate.jsp"%>
<%@include file="mailSettingTemplate.jsp"%>
	</body>
</html>

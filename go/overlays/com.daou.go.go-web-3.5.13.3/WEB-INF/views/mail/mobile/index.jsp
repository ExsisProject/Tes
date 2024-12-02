<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<%@include file="header.jsp"%>

<script type="text/javascript">
	var isWriteNoti = ${fn:escapeXml(writeNoti)};
	var notiMode = "${fn:escapeXml(notiMode)}";
	var workAction = "${fn:escapeXml(work)}";
	var writeToList = "${fn:escapeXml(toAddr)}";
	var workFolder = "${fn:escapeXml(folder)}";
	var workUid = "${fn:escapeXml(uid)}";
	var searchAllFolder = "${fn:escapeXml(searchAllFolder)}";
	var isNotFoundError = "${fn:escapeXml(isNotFoundError)}";
	var companyDomainList = [];
	<c:if test="${!empty companyDomainList}">
		<c:forEach var="companyDomain" items="${companyDomainList}">
			companyDomainList.push("${companyDomain}");
		</c:forEach>
	</c:if>
</script>
</head>
<body>
<div class="go_wrap">
	<%@include file="bodyTop.jsp"%>
    <form action="" onsubmit="return false;">
		<div id="goSearch" class="go_search" style="display:none">
			<div class="nav con_nav check_nav" id="searchResultNav" style="display: none">
				<div class="critical">
					<a href="javascript:;" evt-rol="checked-cancel"><span class="ic_nav ic_nav_cancel"></span></a>
				</div>
				<div class="optional">
					<ul class="toolbar_list">
						<li class="moreItemLi" style="display:none">
						<span class="wrap_btn_m_more">
							<a class="btn_m_more" id="more_btn" evt-rol="toolbar" evt-act="search-toggle-more-layout" ignore="on" menu="seen">
								<span class="ic_v2 ic_m_more"></span>
							</a>
							<div class="array_option" style="display:none">
								<ul class="array_type moreMenuItem">

								</ul>
							</div>
						</span>
						</li>
					</ul>
				</div>
			</div>
			<div class="nav" id="searchNav">
				<section class="search_wrap">
					<div class="search" evt-rol="simpleSearchTitle" id="simpleSearchTitle">
						<span class="ic_cmm ic_cmm_search"></span>
						<input id="commonSearchInput" class="input search" type="search" placeholder="<tctl:msg key="mail.mobile.search.message"/>">
						<a evt-rol="deleteSearchText" id="deleteSearchText"><span class="btn btn_del_type1"></span></a>
					</div>
					<a  evt-rol="detailSearchTitle" id="detailSearchTitle" class="btn_search_wrap" style="display:none"></a>
				</section>
				<div class="critical">
					<a evt-rol="searchCloseButton"><span class="ic_nav ic_nav_cancel"></span></a>
				</div>
				<div class="optional">
					<ul class="toolbar_list">
						<li>
							<a evt-rol="detailSearchToggle" id="detailSearchToggle" class="check_detail">
								<span class="txt"><tctl:msg key="mail.search.advanced"/></span>
							</a>
						</li>
					</ul>
				</div>
			</div>
			<div id="searchDetail" class="search_detail"></div>
		</div>
    </form>
	<div id="go_body" class="go_body">
		<%@include file="mailSide.jsp"%>
		<div id="go_content" class="go_content" style="left:0px;">
			<div class="content_page">
				<div id="main_content" class="content"></div>
			</div>
		</div>
		<%@include file="mailMoveFolder.jsp" %>
		<%@include file="mailTagMessage.jsp" %>
		<%@include file="mailWriteAddr.jsp" %>
		<%@include file="mailWebFolder.jsp" %>
	</div>
	<%@include file="footer.jsp" %>
</div>
<%@include file="mailTemplate.jsp"%>
</body>
</html>
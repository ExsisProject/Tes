<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<c:if test="${profile ne 'development'}">
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/ext-mail-all.min.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/swfupload/swf-all.min.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mail-all.min.js?rev=${revision}"></script>
</c:if>
<c:if test="${profile eq 'development'}">
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.util.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.autocomplete.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.swfupload.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.progressbar.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/swfupload/swfupload.js?rev=${revision}"></script>

	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/handlebars-mail-helper.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mailCommon.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mailAction.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mailSetting.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mailAttach.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mailBasicAttach.js?rev=${revision}"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mailManager.js?rev=${revision}"></script>
</c:if>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/ocx/ocx_load.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/js/HuskyEZCreator.js?rev=${revision}"></script>
<c:if test="${useMiniGnb eq true}">
	<script type="text/javascript" charset="utf-8" src="${miniGnbUrl}resources/js/gnb/mini_gnb.js"></script>
</c:if>

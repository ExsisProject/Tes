<%@page import="org.springframework.context.i18n.LocaleContextHolder"%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<!DOCTYPE HTML>
<html>
<head>
    <title>${logoTitle}</title>
    <link rel="stylesheet" href="${baseUrl}resources/css/go_style.css" media="screen" />
    <link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <style type="text/css">
        div.error_page .desc {font-size: 16px;}
        a.btn_major_s {display:inline-block; cursor:pointer; color:#fff; height: auto;font-weight:bold; font-size:12px; line-height:18px; border-radius:2px; background:#2197a3; border:1px solid #1e8d98}
        a.btn_major_s:hover {background-color:#1c8691; border-color:#18808a}
    </style>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
    <script>
        function isJson(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }

        $(document).ready(function() {
            var error = $("#errorInput").val();
            if (isJson(error)) {
                var errorJson = JSON.parse(error);
                $("#error_code").text(errorJson.error);
                $("#error_desc").text(errorJson.error_description);
            }
        });
    </script>
</head>
<fmt:setLocale value="<%= LocaleContextHolder.getLocale().toString() %>" />
<fmt:setBundle basename="messages/message" />
<body>
<div class="go_body">
    <div class="view_content">
        <div class="error_page">
            <input type="hidden" id="errorInput" value="${fn:escapeXml(error)}"/>
            <hgroup>
                <span class="ic_data_type ic_error_page"></span>
                <h2><fmt:message key="common.bad.request"/></h2>
            </hgroup>
            <p class="desc">error_code : <span id="error_code"></span></p>
            <p class="desc">error_description : <span id="error_desc"><fmt:message key="common.internal.error"/></span></p>
            <div class="wrap_btn">
                <a data-role="button" href="javascript:history.back()" class="btn_major_s">
                    <span class="txt"><fmt:message key="common.page.back"/></span>
                </a>
            </div>
        </div>
    </div>
</div>
</body>
</html>
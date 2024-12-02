<%@page import="com.daou.go.core.component.MessageSourceHelper"%>
<%@page import="org.springframework.context.i18n.LocaleContextHolder"%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<link rel="stylesheet" href="${baseUrl}resources/css/go_style.css" media="screen" />
<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
<!--[if IE]>
<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
</head>
<body  class="full_page go_full_screen">
<%
    MessageSourceHelper messageSourceHelper = new MessageSourceHelper(); 
%>
    
    <!-- 오류페이지 -->  
    <div class="view_content">
        <div class="error_page">
            <hgroup>
                <span class="ic_data_type ic_error_page"></span>
                <!-- 인증을 진행할 수 없습니다. -->
                <h2><%= messageSourceHelper.getMessage("externalemail.error.auth.title") %></h2>
            </hgroup>
            <!-- 아래의 이유로 인증이 진행되지 않을 수 있습니다. 다시 한번 확인하여 주시기 바랍니다. -->
            <p class="desc"><%= messageSourceHelper.getMessage("externalemail.error.auth.summary") %></p>
            <!-- 이미 인증이 완료된 경우 -->
            <p class="desc">1. <%= messageSourceHelper.getMessage("externalemail.error.auth.cause1") %></p>
            <!-- 새로 발송된 인증 메일이 있을 경우 -->    
            <p class="desc">2. <%= messageSourceHelper.getMessage("externalemail.error.auth.cause2") %></p>                  
        </div>  
    </div><!-- //오류페이지 -->  

</body>
</html>





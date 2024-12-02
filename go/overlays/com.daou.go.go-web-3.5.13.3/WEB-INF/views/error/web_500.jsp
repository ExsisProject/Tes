<%@page import="org.springframework.context.i18n.LocaleContextHolder"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions"  prefix="fn"%>
<%@taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="virwport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="${baseUrl}resources/css/go_style.css" media="screen" />
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js"></script>
	<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
    <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
</head>

<fmt:setLocale value="<%= LocaleContextHolder.getLocale().toString() %>" />
<fmt:setBundle basename="messages/message" />
<%
	String title = request.getParameter("title") == null ? "" : (String)request.getParameter("title");
	String message = request.getParameter("msg") == null ? "" : (String)request.getParameter("msg");
	Boolean hasBackButton =  request.getParameter("hasBackButton") == null ? true : false; 
%>
<body  class="full_page">
    <div class="go_wrap go_skin_default">
        <div class="go_body">
            <div class="view_content">
                <div class="error_page">
                    <hgroup>
                        <span class="ic_data_type ic_error_page"></span>
                        <h2>
                        	<% if(title == ""){ %>
                        	<fmt:message key="common.internal.error" />
                        	<% }else{ %>
                    		<%= title %><br/>
                    	<% } %>
                        </h2>
                    </hgroup>
                    <p class="desc">
                    	<% if(message == ""){ %>
                    	<fmt:message key="common.page.internal.error" />
                    	<% }else{ %>
                    		<%= message %><br/>
                    	<% } %>
                    </p>
                    <% if(hasBackButton){ %>
                    <a class="btn_major_s" data-role="button" style="display: none;">
                        <span class="ic"></span>
                        <span class="txt"><fmt:message key="common.page.back" /></span>
                    </a>
                    <% } %>
                </div>  
            </div>
        </div>
    </div>
    <script type="text/javascript">
        $(".btn_major_s").click(function() {
            history.back();
        });
        
        window.onload = function(){
            if(history.length > 1){
                $(".btn_major_s").show();
            }
        };
    </script>
</body>
</html>
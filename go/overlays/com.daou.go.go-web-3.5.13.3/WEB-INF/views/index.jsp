<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0,minimum-scale=1.0,user-scalable=yes,width=device-width,height=device-height" />
        
    <meta name="base" content="${baseUrl}">
    <meta name="locale" content="${locale}">
    <meta name="revision" content="${revision}">
    <meta name="profile" content="${profile}">

    <title>${logoTitle}</title>
    
    <link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
	
	<c:forEach var="stylesheet" items="${stylesheets}">
		<link rel="stylesheet" href="${stylesheet.href}?rev=${revision}" media="${stylesheet.media}">
	</c:forEach>
    
    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js?rev=${revision}"></script>
    <![endif]-->
    
    <!--[if lte IE 8]>
	<script src="${baseUrl}resources/js/vendors/respond.min.js?rev=${revision}"></script>
    <![endif]-->
    
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/requirejs/require.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/boot.js?rev=${revision}"></script>
</head>

<body id="main" data-role="main">
</body>
</html>

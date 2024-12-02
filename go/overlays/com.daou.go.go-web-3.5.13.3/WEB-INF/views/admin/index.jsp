<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html lang="${locale}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="virwport" content="width=device-width,initial-scale=1">
    <meta name="base" content="${baseUrl}">
    <meta name="locale" content="${locale}">
    <meta name="revision" content="${revision}">
    <meta name="profile" content="${profile}">
    <meta name="brandName" content="${brandName}">
    <meta name="serviceType" content="${serviceType}">
    <meta name="useOauthLogin" content="${useOauthLogin}">
    <meta name="useMiniGnb" content="${useMiniGnb}">
    <meta name="useLabFeedback" content="${useLabFeedback}">
    <meta name="hasLabFeedbackConfig" content="${hasLabFeedbackConfig}">
    <title></title>
    <link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <link rel="preload" href="${baseUrl}resources/fonts/notosans/noto-sans-kr-v25-latin_korean-regular.woff2" as="font" type="font/woff2" >
    <link rel="stylesheet" href="${baseUrl}resources/css/fonts/notosans.css?rev=${revision}" media="all">
    <link rel="stylesheet" href="${baseUrl}resources/css/go_admin_body.css?rev=${revision}" media="screen" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_prototype.css?rev=${revision}" media="screen" />
    <link rel="stylesheet" href="${baseUrl}resources/css/ta_style.css?rev=${revision}" media="screen" />
    <link rel="stylesheet" href="${baseUrl}resources/css/adm_style.css?rev=${revision}" media="screen" />
    <link rel="stylesheet" href="${baseUrl}resources/css/doc_editor.css?rev=${revision}" media="screen" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_admin_customize.css?rev=${revision}" media="screen, print" />
    <link rel="stylesheet" href="${baseUrl}resources/css/prefix.css?rev=${revision}" media="screen" />
    <link rel="stylesheet" type="text/css" href="${baseUrl}resources/js/vendors/simplebar/simplebar.css"/>
  <%
  	String locale =  (String)request.getAttribute("locale");
  	if("ja".equals(locale)){
  %>
    <link rel="stylesheet" href="${baseUrl}resources/css/ta_ja.css?rev=${revision}" media="screen" />
  <%
  	}
  %>

    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
	<script src="${baseUrl}resources/js/vendors/css3-mediaqueries.js"></script>
    <![endif]-->
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/simplebar/simplebar.min.js"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/requirejs/require.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/conf/config.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/conf/env.js?rev=${revision}"></script>
    <%
        String serviceType = (String) request.getAttribute("serviceType");
        if ("cloud".equals(serviceType)) {
    %>
    <script async type="text/javascript" src="https://doad.daouoffice.com/resources/advertisement.min.js?rev=${revision}" data-uuid="${uuid}" data-user-id="${userId}" data-ad-placement="admin"></script>
    <%
        }
    %>
</head>

<body id="main" data-role="main" class="adm_skin">
</body>
</html>

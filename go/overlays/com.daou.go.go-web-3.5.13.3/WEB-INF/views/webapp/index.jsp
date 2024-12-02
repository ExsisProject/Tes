<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html lang="${locale}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=1024"/>
    <meta name="base" content="${baseUrl}">
    <meta name="locale" content="${locale}">
    <meta name="device" content="${device}">
    <meta name="revision" content="${revision}">
    <meta name="profile" content="${profile}">
    <meta name="brandName" content="${brandName}">
    <meta name="serviceType" content="${serviceType}">
    <meta name="gaTrackerId" content="${gaTrackerId}">
    <meta name="useOauthLogin" content="${useOauthLogin}">
    <meta name="useMiniGnb" content="${useMiniGnb}">
    <meta name="miniGnbUrl" content="${miniGnbUrl}">
    <meta name="useLabFeedback" content="${useLabFeedback}">
    <meta name="hasLabFeedbackConfig" content="${hasLabFeedbackConfig}">
    <title>${logoTitle}</title>

    <link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <link rel="preload" href="${baseUrl}resources/fonts/notosans/noto-sans-kr-v25-latin_korean-regular.woff2" as="font" type="font/woff2"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/fonts/notosans.css?rev=${revision}" media="all" />
    <link rel="stylesheet" href="${baseUrl}resources/css/master_style.css?rev=${revision}" media="all" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_style.css?rev=${revision}" media="all" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_app_style2.css?rev=${revision}" media="all" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_app_style3.css?rev=${revision}" media="all" />
    <link rel="stylesheet" href="${baseUrl}resources/css/doc_editor.css?rev=${revision}" media="all" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_home_dashboard.css?rev=${revision}" media="all" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_print.css?rev=${revision}" media="print" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_color_${colorstyle}.css?rev=${revision}" media="all" />
    <link rel="stylesheet" href="${baseUrl}resources/css/doc_editor.css?rev=${revision}" media="screen" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_prototype.css?rev=${revision}" media="screen" />
    <link rel="stylesheet" type="text/css" href="${baseUrl}resources/js/vendors/jquery/plugins/jstree/themes/default/style.css" media="all" />
    <link rel="stylesheet" type="text/css" href="${baseUrl}resources/js/vendors/jquery/plugins/fancybox/helpers/jquery.fancybox-buttons.css" media="all" />
    <link rel="stylesheet" type="text/css" href="${baseUrl}resources/js/vendors/jquery/plugins/fancybox/jquery.fancybox.css" media="all" />
    <link rel="stylesheet" type="text/css" href="${baseUrl}resources/js/vendors/jquery/plugins/fancybox/helpers/jquery.fancybox-thumbs.css" />
    <link rel="stylesheet" type="text/css" href="${baseUrl}resources/js/vendors/jquery/plugins/tooltipster/tooltipster.min.css"/>
    <link rel="stylesheet" type="text/css" href="${baseUrl}resources/js/vendors/simplebar/simplebar.css"/>
    <link rel="stylesheet" type="text/css" href="${baseUrl}resources/js/vendors/gridStack/gridstack.min.css"/>
    <link rel="stylesheet" type="text/css" href="${baseUrl}resources/js/vendors/realgrid/realgrid-style.css"/>


    <%
  	String locale =  (String)request.getAttribute("locale");
  	if(!"ko".equals(locale)){
	%>
    <link rel="stylesheet" href="${baseUrl}resources/css/go_${locale}.css?rev=${revision}" media="all" />
	<%
  	}
	%>

    <link rel="stylesheet" href="${baseUrl}resources/css/go_customize.css?rev=${revision}" media="all" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_customize_print.css?rev=${revision}" media="print" />
    <%@include file="custom_index_header.jsp"%>

    <!--[if lte IE 8]>
	<script src="${baseUrl}resources/js/vendors/html5.js"></script>
	<script src="${baseUrl}resources/js/vendors/css3-mediaqueries.js"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/plugins/flot/excanvas.js"></script>
    <![endif]-->
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/simplebar/simplebar.min.js"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/echarts/echarts.min.js"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/realgrid/realgrid.2.4.2.min.js"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/realgrid/realgrid-lic.js"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jsPdf/es6-promise.auto.min.js"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/requirejs/require.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/conf/config.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/conf/env.js?rev=${revision}"></script>

    <%
        Boolean useMiniGnb =  (Boolean)request.getAttribute("useMiniGnb");
        if(useMiniGnb){
    %>
    <script type="text/javascript" charset="utf-8" src="${miniGnbUrl}resources/js/gnb/mini_gnb.js"></script>
    <%
        }
    %>
    <%
        String serviceType = (String) request.getAttribute("serviceType");
        if ("cloud".equals(serviceType)) {
    %>
    <script async type="text/javascript" src="https://doad.daouoffice.com/resources/advertisement.min.js?rev=${revision}" data-uuid="${uuid}" data-user-id="${userId}" data-ad-placement="user"></script>
    <%
        }
    %>
</head>
<body id="main" data-role="main">
</body>
</html>

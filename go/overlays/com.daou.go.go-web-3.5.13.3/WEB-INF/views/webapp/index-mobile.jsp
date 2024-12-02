<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width, target-densitydpi=medium-dpi, minimal-ui" />
    <meta name="base" content="${baseUrl}">
    <meta name="locale" content="${locale}">
    <meta name="device" content="${device}">
    <meta name="goAgent" content="${goAgent}">
    <meta name="revision" content="${revision}">
    <meta name="profile" content="${profile}">
    <meta name="gaTrackerId" content="${gaTrackerId}">
    <title>${logoTitle}</title>
    <link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/go_m_style.css?rev=${revision}" media="all"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/doc_editor.css?rev=${revision}" media="all"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/go_m_customize.css?rev=${revision}" media="all"/>
    <link rel="stylesheet" type="text/css" href="${baseUrl}resources/js/vendors/gridStack/gridstack.min.css"/>

    <%
        String fontsize = (String) request.getAttribute("fontsize");
        if ("BIG".equals(fontsize)) {
    %>
    <link id="systemBigStyle" rel="stylesheet" href="${baseUrl}resources/css/go_m_style_big.css?rev=${revision}"
          media="all"/>
    <link id="systemBiggerStyle" rel="stylesheet" href="${baseUrl}resources/css/go_m_style_bigger.css?rev=${revision}"
          media="all" disabled/>
    <%
    } else if ("BIGGER".equals(fontsize)) {
    %>
    <link id="systemBigStyle" rel="stylesheet" href="${baseUrl}resources/css/go_m_style_big.css?rev=${revision}"
          media="all" disabled/>
    <link id="systemBiggerStyle" rel="stylesheet" href="${baseUrl}resources/css/go_m_style_bigger.css?rev=${revision}"
          media="all"/>
    <%
    } else {
    %>
    <link id="systemBigStyle" rel="stylesheet" href="${baseUrl}resources/css/go_m_style_big.css?rev=${revision}"
          media="all" disabled/>
    <link id="systemBiggerStyle" rel="stylesheet" href="${baseUrl}resources/css/go_m_style_bigger.css?rev=${revision}"
          media="all" disabled/>
    <%
        }
    %>

    <%
        String locale = (String) request.getAttribute("locale");
        if (!"ko".equals(locale)) {
    %>
    <link rel="stylesheet" href="${baseUrl}resources/css/go_m_${locale}.css?rev=${revision}" media="all"/>
    <%
        }
    %>
    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
    <![endif]-->
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/echarts/echarts.min.js"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/requirejs/require.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/conf/config.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/conf/env.js?rev=${revision}"></script>
</head>
<body id="main" data-role="mobile">
</body>
</html>

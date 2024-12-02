<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <%
        String contextRoot = request.getContextPath();
    %>
    <meta http-equiv="content-type" content="text/html;charset=UTF-8" />
    <title>${lang.title}</title>
    <link rel="stylesheet" href="${contextRoot}/resources/css/fonts/notosans.css" media="all">
    <link rel="stylesheet" href="${contextRoot}/resources/css/go_app_style3.css" media="all">
</head>
<body>
<div class="vm_connect">
    <span class="ic_vm_connect"></span>
    <p class="vm_connect_tit">${lang.message}</p>
    <p class="vm_connect_desc">
        ${lang.sub_message1}<br>
        ${lang.sub_message2}
    </p>
</div>
</body>
</html>




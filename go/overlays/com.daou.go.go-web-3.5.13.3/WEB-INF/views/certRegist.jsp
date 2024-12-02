<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions"  prefix="fn"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html>
	<head>
	    <meta charset="utf-8">
	    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	    <meta name="virwport" content="width=device-width,initial-scale=1">
	    <title>${lang.title}</title>
	    <link rel="stylesheet" href="${baseUrl}resources/css/go_style.css?rev=${revision}" media="screen" />
        
	    <%
			String currentLocale =  (String)request.getAttribute("currentLocale");
			if(!"ko".equals(currentLocale)){
		%>  
			<link rel="stylesheet" href="${contextPath}resources/css/go_${currentLocale}.css?rev=${revision}" media="screen, print" />
		<%
			}
		%>
		<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
	    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery-ui/js/jquery-ui-1.10.0.custom.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/vendors/hogan.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/vendors/lodash.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/vendors/backbone/backbone.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/vendors/moment/moment.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-util.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-popup.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-login.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/app/views/IEInfoView.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-placeholder.js?rev=${revision}"></script>
	    
	    <object id=SecuToolObject classid="clsid:B789767A-4553-4F78-BA2F-D025C0E646B4"></object>
		<object id=SecuDialogObject classid="clsid:E05A42AC-20B3-4BE1-B6E1-702924FCC27C"></object>
	</head>
	
	<%@ include file="./signgate_common.jsp" %>
	
	<body class="user_front" onLoad="javascript:ok();">
	    <div id="contentArea" class="go_wrap go_skin_default go_intro_wrap">
	        <header class="go_header">
	        </header>
	    	<div class="go_intro">
	            <section class="login_box msg_box log_confirm">
	                <div class="sleeping_msg">
	                    <p class="title">${lang.mainTitle}</p>
	                    <p class="desc">${lang.content}</p>
	                </div>
	                
	                <div class="btn_wrap" style="text-align: center;">
	                    <a class="btn_log_major" id="regist">
	                    	<span class="txt">${lang.buttonText}</span>
                    	</a>
	                </div>
	            </section>
	        </div>
	    </div>
	    <div id="iframeWrap"></div>
	</body>
	
	<script>
    	GO = GO || {};
    	GO["contextRoot"] = "${baseUrl}";
    	
		function ok() {
			$("#regist").on("click", function() {
				$("#cert_login_iframe")[0].contentWindow.certLogin(true);
			});
		}
	</script>
	
	<script language="javascript">
		$("#iframeWrap").append('<iframe id="cert_login_iframe" width="0px" height="0px" name="cert_login_iframe" src="${baseUrl}certInstall" style="border:0;"></iframe>');
		
		var search = searchToObject();
		
		function certSubmit(data) {
			data.currentPage = location.href;
			
			$.ajax({
				type : "POST",
				url : GO.contextRoot + "api/certLogin",
				data : JSON.stringify(data),
				dataType : "json",
				contentType: "application/json",
				success : function(resp) {
					var url = search.returnUrl ? XSSFilter(decodeURIComponent(search.returnUrl)) : decodeURIComponent(resp.data.redirect);
					location.href = url;
				},
				error : function(resp, error) {
					alert(JSON.parse(resp.responseText).message);
				}
			});
		}
		
		function searchToObject() {
			var pairs = window.location.search.substring(1).split("&");
			var obj = {};
			var pair;
			var i;
			
			for ( i in pairs ) {
				if ( pairs[i] === "" ) continue;
				
				pair = pairs[i].split("=");
				obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
			}
			
			return obj;
		}
		
		function XSSFilter( str ) {
		    if( !str ) return str;
		    
		    str = str.replace(/[\"\'][\s]*javascript:(.*)[\"\']/gi, "\"\"");
		    str = str.replace(/[<]*[\s]*script(.*)/gi, "");
		    str = str.replace(/eval\((.*)\)/gi, "");
		    
            if( !!str ) {
                str = str.replace(/</gi, "&lt;");
                str = str.replace(/>/gi, "&gt;");
            }
		    
		    return str;
		}
	</script>
</html>
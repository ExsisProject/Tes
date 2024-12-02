<%@page import="java.util.ArrayList"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html class="home_menu">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width, target-densitydpi=medium-dpi" />
    <meta name="base" content="${baseUrl}">
    <meta name="locale" content="${locale}">
    <meta name="device" content="${device}">
    <meta name="goAgent" content="${goAgent}">
    <meta name="revision" content="${revision}">
    <title>${logoTitle}</title>
	<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/go_m_style.css?${revision}" media="all" />
    <link rel="stylesheet" href="${baseUrl}resources/css/go_m_customize.css?rev=${revision}" media="all" />
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/plugins/jquery.cookie.js?rev=${revision}"></script>
    <%
    String locale =  (String)request.getAttribute("locale");
    if(!"ko".equals(locale)){
	%>  
   		<link rel="stylesheet" href="${baseUrl}resources/css/go_m_${locale}.css?rev=${revision}" media="all" />
    <%
    }
    %>
    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
    <![endif]-->
</head>
<body ontouchstart="">
<div class="home_wrap type2"> <!--  id="bodyHome" style="padding-bottom: 0px"> -->
	<header class="home_header">
		<div class="info_wrap">
			<span class="info_pic"><img src="${thumbNail}" alt="" /></span> 
			<div class="logo_wrap">
				<h1 class="logo">${title}</h1>
				<c:if test="${hasMoreThan2Companies == true}">
				<a class="ic_works2 ic_multiCompany" href="#" data-bypass></a>
					<div class="layer_m layer_m_multiCompany" style="display:none;"> 
						<div class="content">
							<c:forEach var="company" items="${companies}">
								<div class="row_wrap">
									<div class="row_tit">
										<a class="changeCompany row" href="#" class="row" data-siteurl="${company['siteUrl']}" data-id="${company['id']}" data-bypass><span class="txt">${company['name']}</span></a>
									</div>
								</div>
							</c:forEach>
						</div>
					</div>
				</c:if>	
			</div>
			<p>
				<span class="name">${name} ${fillMenuEmptyCount}</span> 
			</p>
		</div>
	</header>
	
	<div class="wrap_home_menu">
		<div>
		    <ul>
					<%
			    		int menuCount = 0;
			    		ArrayList menuList = (ArrayList)request.getAttribute("menus");
			    		ArrayList menuNames = (ArrayList)request.getAttribute("menuNames");
			    		ArrayList menuClass = (ArrayList)request.getAttribute("menuClass");
			    		ArrayList menuUrl = (ArrayList)request.getAttribute("menuUrl");
			    		
			    		for(int i = 0 ; i < menuList.size(); i++){
							out.print("<li");
							if("mail".equals(menuList.get(i))){
							        out.print(" id='mailSpan'>");
							} else {
							        out.print(">");
							}

				    		if("mail".equals(menuList.get(i))){
			    	%>
					    		<c:if test="${status == 'dormant'}">
			    					<span class="badge sleep_mode">${sleep}</span>
			    				</c:if>
					<%
							} else if("board".equals(menuList.get(i))){
					%>
					    		<c:if test="${boardCount > 0}">
			                        <span class="badge">N</span>
			                    </c:if>
					<%
							} else if("community".equals(menuList.get(i))){
					%>
					    		<c:if test="${communityCount > 0}">
			                        <span class="badge">N</span>
			                    </c:if>
					<%
							} else if("survey".equals(menuList.get(i))){
					%>
			                    <c:if test="${surveyCount > 0}">
			                        <span class="badge">
			                            <c:choose>
			                                <c:when test="${surveyCount > 9999}">+9,999</c:when>
			                                <c:otherwise>${surveyCount}</c:otherwise>
			                            </c:choose>
			                        </span>
			                    </c:if>
					<%
							} else if("approval".equals(menuList.get(i))){
					%>
			                    <c:if test="${approvalCount > 0}">
			                        <span class="badge">
			                            <c:choose>
			                                <c:when test="${approvalCount > 9999}">+9,999</c:when>
			                                <c:otherwise>${approvalCount}</c:otherwise>
			                            </c:choose>
			                        </span>
			                    </c:if>
					<%
			    			}

							out.print("<a href='");
							out.print(menuUrl.get(i));
							out.print("' class='m_img_wrap'>");
							out.print("     <i class='ic_works2 ic_home_");
							out.print(menuClass.get(i));
							out.print("'></i>");
							
				    		if("mail".equals(menuList.get(i))){
					    		out.print("<p class='m_tit' id='mailText'>");
				    		}else{
					    		out.print("<p class='m_tit'>");
				    		}
				    		out.print(menuNames.get(i));
				    		out.print("</p>");
				    		
							out.print("</a>");			    		
				    		out.print("</li>");
				    		menuCount += 1;
				    	}
					%>
					<% 	for(int i =0 ; i < 15 - menuCount ; i++) {	%>
						<li>     
							<a></a>
						</li>
					<% 
						}
					%>
			    </ul>				
			</div>
		</div>
	</div>
	<footer>
		<div class="btn_footer">
		    <a id="go_to_pc_version" href="#">
		        <span class="btn_type2">${pcversion}</span>
		    </a>
			<a href="${baseUrl}logout">
				<span class="btn_type2"> ${logout} </span>
			</a>
			<c:if test="${useMobileAppService == true}">
	              <c:if test="${downloadLink != null}">
	  				<a href="${downloadLink}">
	  					<span class="btn_type2 appDown">
	  						<span class="ic ic_appDown"></span> 
	  						${download}
	  					</span>
	  				</a>
	              </c:if>
			</c:if>
		</div>
	</footer>

   <script type="text/javascript">
        contextRoot = "${baseUrl}";
    </script>	
	
	<script type="text/javascript">
	    window.androidHistoryBack = function(){
	        window.GOMobile.pressBackKey();
	    };
	    
	    function isMobileApp() {
        	var ua =$('meta[name="goAgent"]').attr('content');
        	ua = ua ? ua.toLowerCase() : "";
        	return ua.indexOf("go-android") > -1 || ua.indexOf("go-iphone") > -1;
        }
	    
	    function checkOS(){
        	var ua = window.navigator.userAgent.toLowerCase();
            if(ua.indexOf("android") > -1) {
            	return "android";
            } else if(ua.indexOf("iphone") > -1){
            	return "iphone";
            } else if(ua.indexOf("ipad") > -1){
            	return "ipad";
            } else {
            	return -1;
            };
        }
	    
	    function goHome(){
   			if(checkOS() == "android"){
   				window.GOMobile.goHome();
   			} else {
   				window.location = "gomobile://goHome";
   			}
		}
	    
	    setBodyHeight = function(){
	        $("#content").css({
	            'height' : 'auto',
	            'width' :'auto'
	        });
	    };
	    
        function getCookie(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            return (parts.length == 2) ? parts.pop().split(";").shift() : "";
        }
	    
	    bindEvents = function(){
	        $('#go_to_pc_version').click(function() {
	            $.cookie('pcVersion', 'true', {path: '/'});
	            var isHomeUrl = location.href.indexOf("app/home") > -1;
                if(isHomeUrl){
                	//현재 페이지가 홈이면 initMenu확인후 그곳으로 리다이렉트
                	$.ajax(contextRoot + 'api/menu/init/mobile', {
    	        		method: 'GET', 
    	        		dataType: 'json', 
    	        		contentType: 'application/json'
    	        	}).done(function(response) {
                        location.href = response.data.str;
    	        	}).fail(function() {
    	        	});
                }else{
                	location.reload();
                }
                return false;
	        });
	        
	        $('.ic_multiCompany').click(function(e) {
	            e.preventDefault();
	            var $el = $('.layer_m_multiCompany');
	            if ($el.is(':visible')) {
	                $el.hide();
	            } else {
	                $el.show();
	            }
	        });
	        
	        $('a.changeCompany').click(function(e) {
	            e.preventDefault();
	            var $el = $(e.currentTarget),
                    token = getCookie('GOSSOcookie'),
                    siteUrl = $el.attr('data-siteurl'),
                    siteId = $el.attr('data-id'),
                    redirectUrl = document.location.protocol + '//' + siteUrl + ':' + document.location.port + '/tokenlogin?';
                
                document.location.href = redirectUrl + $.param({
                	companyId: siteId,
                	token: token
                });
	        });
	    };
	    
	    $(document).ready(function(){
	    	
	    	if(isMobileApp()) {
	    		goHome();
	    	} else {
	    		setBodyHeight();
		        bindEvents();
		        var param = {};
		        param.flag = "U";
		        param.folder = "Inbox";
		        
		        $.ajax("/api/mail/message/count", {
	        		method: 'POST', 
	        		data: param, 
	        		dataType: 'json', 
	        		contentType: 'application/json'
	        	}).done(function(response) {
					var unreadCount = response.data;
					if(unreadCount > 0){
						if(unreadCount > 9999){
							$("#mailSpan").prepend("<span class='badge'>+9,999</span>");
						}else {
							$("#mailSpan").prepend("<span class='badge'>"+unreadCount+"</span>");
						}
					}
	        	}).fail(function() {
	        	});
	    	}
	        
	    });
	    
        $(window).on('resize' , function(){
            setBodyHeight();
        });
    </script>
</body>
</html>

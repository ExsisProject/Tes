<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<%@include file="header.jsp"%>
 <script type="text/javascript">
     var workAction="error";
     function backPage(){
         history.back(); 
     }
     
     function changeUserAccount() {
     	var userIds = new Array();
     	userIds.push(parseInt(SESSION_ID));
     	var param = { ids : userIds, id : 0 };
     	jQuery.ajax({
     		type: "PUT",
     		url: "/api/user/status",
     		data: JSON.stringify(param),
     		async: false,
     		success: function(data){
     			window.location = '${redirectURL}';
     		},
     		dataType: "json",
     		contentType : "application/json"
     	});
     }
     
     jQuery(document).ready(function() {
    	 pageDone();
     });
 </script>
 </head>
<body>
<div class="go_wrap">
    <%@include file="bodyTop.jsp"%>
    <div id="go_body" class="go_body">
        <div id="go_content" class="go_content" style="left:0">
            <header  class="nav_s" style="z-index: 21">
            <div id="mail_list_header" class="mailHeaderWrap">
			    <h2><tctl:msg key="mobile.dormant.title" /></h2>
            </header>
            <div class="content_page">
                <div id="main_wrap">
                    <div id="content_wrap" class="content">
						<div id="main_content" class="content">
                            <div style="margin-top:0" class="notice">
			                 	<span class="ic_notice ic_network_error"></span>
								<h2 class="title"><tctl:msg key="mobile.dormant.content" /></h2>
								<ul class="msg">
									<li><span class="desc">1. <tctl:msg key="mobile.dormant.service.title" /></span></li>
			                    	<li><span class="desc">2. <tctl:msg key="mobile.dormant.pop.title" /></span></li>
			                   		<li><span class="desc">3. <tctl:msg key="mobile.dormant.imap.title" /></span></li>
			                 	</ul>
			               		<a onclick="changeUserAccount();"><span data-role="button" class="btn_major"><span class="txt"><tctl:msg key="dormant.account.009" /></span></span></a>
		                		<a data-role="button" class="btn_minor" onclick="gotoHistoryBack();">
					              	<span class="ic"></span>
					              	<span class="txt"><tctl:msg key="error.msg.004" /></span>
					           	</a>                
			              	</div>
                   		</div>
                       
    				</div>
				</div>
			</div>
		</div>
	</div>
</div> 
</body>
</html>
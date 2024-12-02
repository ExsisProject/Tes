<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <%@include file="header.jsp"%>
        <script type="text/javascript">
            CURRENTMENU ='${currentMenu}';
            IS_ERROR=true;
            isDormant = true;
            function backPage(){
            	setTimeout(function(){
            		  history.back(); 
                },100);
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
            	jQuery("#userInfo").text(msgArgsReplace(mailMsg.dormant_account_002,[USERNAME]));
            });
        </script>
    </head>
    <body>
        <div class="go_wrap">
            <%@include file="topmenu.jsp"%>
            <div class="go_body">
                <div class="view_content">
		            <div class="error_page">
		                <hgroup>
		                    <span class="ic_data_type ic_error_page"></span>
		                    <h2 id="userInfo"></h2>
		                </hgroup>
		                <p class="desc"><tctl:msg key="dormant.account.004" /></p>
		                <ul>
			                <li>1. <tctl:msg key="dormant.account.005" /></li>   
			                <li>2. <tctl:msg key="dormant.account.006" /></li>  
		    	            <li>3. <tctl:msg key="dormant.account.007" /></li>                 
		                </ul>
		                <div class="wrap_btn">
			                <a data-role="button" onclick="changeUserAccount();" class="btn_major_s">
			                    <span class="ic"></span>
			                    <span class="txt"><tctl:msg key="dormant.account.009" /></span>
			                </a>
			                <a data-role="button" class="btn_minor_s" onclick="backPage();">
			                    <span class="ic"></span>
			                    <span class="txt"><tctl:msg key="error.msg.004" /></span>
			                </a>
		                </div>                                
		            </div>  
		        </div>
            </div>
            <%@include file="bottom.jsp" %>
        </div>
    </body>
</html>
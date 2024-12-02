<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <%@include file="../mail/header.jsp"%>
        <style type="text/css">
        	body {min-width:100px;}
        	#webfolderListWrap section.lnb h1:hover{cursor:default;}
        	#webfolderListWrap section.lnb h1 > span.txt{cursor:default;}
        </style>
    </head>
    <body>
    	<div id="webfolderListArea"></div>
	    
	    <%@include file="webfolderModalTemplate.jsp"%>

	    <script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.layout-latest.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.util.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/handlebars-mail-helper.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/plugins/webfolder/webfolderCommon.js?rev=${revision}"></script>
		<script type="text/javascript" src="${baseUrl}resources/js/plugins/webfolder/webfolderAction.js?rev=${revision}"></script>

        <script type="text/javascript">
        jQuery(document).ready(function() {
        	initList();
        	initEvent();
        });
        function initList(){
        	
        	jQuery("#webfolderListArea").html(getHandlebarsTemplate("webfolder_list_popup_wrap_tmpl"));
        	
        	ActionLoader.getSyncGoLoadAction("/api/webfolder/folder/tree", {"type":"user"}, function(data){resultUserFolderList(data); }, "json");
        	ActionLoader.getSyncGoLoadAction("/api/webfolder/folder/tree", {"type":"share"}, function(data){resultSharedFolderList(data); }, "json");
        	ActionLoader.getSyncGoLoadAction("/api/webfolder/folder/tree", {"type":"public"}, function(data){resultCompanyFolderList(data); }, "json");
        }
        function initEvent(){
            jQuery("#webfolderListWrap ul.side_depth").on("click","span ", function(event) {
                event.preventDefault();
                jQuery("#webfolderListWrap p").removeClass("on");
                jQuery(this).closest("p").addClass("on");
            });
        }
        function resultUserFolderList(data){
        	 jQuery("#userFolderArea").handlebars("webfolder_list_popup_tmpl",data);
        }
        function resultSharedFolderList(data) {
        	jQuery("#privateWebfolderList").append(getHandlebarsTemplate("webfolder_list_share_popup_tmpl",data));
        }
        function resultCompanyFolderList(data) {
        	jQuery("#companyFolderArea").handlebars("webfolder_list_public_popup_tmpl",data);
        }
       
        function selectFileList(){
        	var selectFolder= jQuery("#webfolderListWrap p.on");
        	if(selectFolder.length < 1){
        		jQuery.goMessage(mailMsg.no_select_folder_title);
                return;
        	}
            var param = {};
        	var targetPath = selectFolder.attr("real-path");
            var sroot= selectFolder.attr("sroot");
            var userSeq= selectFolder.attr("user-seq");
            var type= selectFolder.attr("type");
            var auth= selectFolder.attr("auth");
            if(auth=="R"){
                jQuery.goMessage(mailMsg.no_right_folder_message);
                return;
            }
            if(targetPath){
            	param.path = targetPath;
            }
            if(sroot){
            	param.sroot = sroot;
            }
            if(userSeq){
            	param.sharedUserSeq = userSeq;
            }
            if(type){
            	param.type=type;
            }
            return param;
        }
        </script>
</body>
</html>





<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <%@include file="../mail/header.jsp"%>
          <script type="text/javascript">
            CURRENTMENU = "webfolder";
            var sideTop = "${fn:escapeXml(sideTop)}";
        </script>
    </head>
    <body> 
    <div  class="layer_import_file">
    <c:if test="${sideTop eq 'private' }">
            <section id="webfolderLeft" class="lnb">
                <h1 class="user">
                    <a evt-rol="toggleFolder" type="webfolderLeft">
                        <ins class="ic"></ins>
                        <span  class="ic_side ic_hide_up"></span>
                    </a>
                    <span class="txt" real-path="WEBFOLDERROOT" type="user" evt-rol="viewFolderLeft"><tctl:msg key="webfolder.title"/></span>
                </h1>
                <ul class="side_depth webfolderLeft" id="webFolderList"></ul>
                <ul class="side_depth webfolderLeft" id="webShareFolderList"></ul>
                
                <h1 class="company">
                    <a evt-rol="toggleFolder" type="publicFolderLeft">
                        <ins class="ic"></ins>
                        <span class="ic_side ic_hide_up"></span>
                    </a>
                    <span class="txt" real-path="WEBFOLDERROOT" type="public" evt-rol="viewFolderLeft"><tctl:msg key="webfolder.public.title"/></span>
                </h1>
                
                <ul class="side_depth publicFolderLeft" id="publicWebFolderList"></ul>
            </section>
        </c:if>
        
        <c:if test="${sideTop ne 'private'}">
           <section id="webfolderLeft" class="lnb">
                <h1 class="company">
                    <a evt-rol="toggleFolder" type="publicFolderLeft">
                        <ins class="ic"></ins>
                        <span class="ic_side ic_hide_up"></span>
                    </a>
                    <span class="txt" real-path="WEBFOLDERROOT" type="public" evt-rol="viewFolderLeft"><tctl:msg key="webfolder.public.title"/></span>
                </h1>
                
                <ul class="side_depth publicFolderLeft" id="publicWebFolderList"></ul>

               <h1 class="user">
                    <a evt-rol="toggleFolder" type="webfolderLeft">
                        <ins class="ic"></ins>
                        <span class="ic_side ic_hide_up"></span>
                    </a>
                   <span class="txt" real-path="WEBFOLDERROOT" type="user" evt-rol="viewFolderLeft"><tctl:msg key="webfolder.title"/></span>
                </h1>
                <ul class="side_depth webfolderLeft"  id="webFolderList"></ul>
                <ul class="side_depth webfolderLeft"   id="webShareFolderList"></ul>
            </section>
        </c:if>
     <div class="dataTables_wrapper" id="webFolderContent">

       <!-- <table class="type_normal tb_file_list" id="viewFolder"> 
                  
       </table> -->
       <div id="viewFolder"> </div>
    </div>
    </div>
          
<div id="workHiddenFrame" style="display: none"></div>
        <%@include file="webfolderTemplate.jsp"%>
        <script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/waypoints.min.js?rev=${revision}"></script>
        <script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.layout-latest.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.util.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/handlebars-mail-helper.js?rev=${revision}"></script>
	    <script type="text/javascript" src="${baseUrl}resources/js/plugins/webfolder/webfolderCommonPopup.js?rev=${revision}"></script>
		
        <script type="text/javascript">
        jQuery(document).ready(function() {
        	webfolderPopupControl = new WebfolderPopupControl();
        	webfolderPopupControl.loadWebfolderList();
        	webfolderPopupControl.loadShareWebfolderList();
        	webfolderPopupControl.loadPublicWebfolderList();
            var param = {"path":"/","fullPath":"/"};
            if(sideTop != "private"){
               param.type="public";    
            }
            webfolderPopupControl.loadViewWebFolder(param); 
            webfolderPopupControl.makeLeftEvent();
            webfolderPopupControl.makeContentEvent();
            
        });
        function goFolder(param){

            if(param.fullPath){
                param.path = param.fullPath.substring(14);
            }
            webfolderPopupControl.loadViewWebFolder(param);
        }
        function toggleWebfolderList(type,displayType){
            var displayFlag = "show";
            var $toggleType = jQuery("a[type='"+type+"']");
            var $toggleArea = jQuery("ul."+type);
            if ($toggleType.closest("h1").hasClass("folded") || (displayType && displayType=="show")){
                $toggleArea.slideDown();
                $toggleType.closest("h1").removeClass("folded").attr("title", mailMsg.common_menu_hide);
            }else{
                $toggleArea.slideUp();
                $toggleType.closest("h1").addClass("folded").attr("title", mailMsg.common_menu_show);
                displayFlag = "hide";
            }
       	}
        function writeAttachFile(){
        	var uids= jQuery('#viewFolder input:checkbox:checked').map(function () {
                var uid = jQuery(this).parent().parent().attr("uid");
                if(!uid) return;
                return uid;
            }).get();
        	if(uids==""){
        		jQuery.goMessage(webfolderMsg.no_select_file_title);
        		return 0;
        	}
        	var param = {};
        	param.type = webfolderPopupControl.type;
        	param.path = webfolderPopupControl.currentFolder;
        	param.uids = uids;
        	param.sroot = webfolderPopupControl.listParam.sroot || "";
        	param.sharedUserSeq = webfolderPopupControl.listParam.userSeq || 0;
            return param;
        }
        </script>
</body>
</html>





<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="${locale}">
	<head>
        <%@include file="../mail/header.jsp"%>
		<style type="text/css">
        	#webfolderListWrap section.lnb h1:hover{cursor:default;}
        	#webfolderListWrap section.lnb h1 > span.txt{cursor:default;}
        	#basicAttachList{border:1px solid #ededed;}
			#basicAttachList td{padding:0px 5px;}
			#basicAttachTitle th{padding:0px 5px;}
			#webfolderFilePopup div.tool_bar a.btn_minor_s {padding:2px 8px 3px;}
        </style>
          <script type="text/javascript">
            CURRENTMENU = "webfolder";
            IS_ERROR=false;
            isDormant = ${dormant};
            var sideTop = "${fn:escapeXml(sideTop)}";
            var searchFolder = "${fn:escapeXml(searchFolder)}";
            var sroot = "${fn:escapeXml(sroot)}";
            var userSeq = "${fn:escapeXml(userSeq)}";
            var fullPath = "${fn:escapeXml(fullPath)}";
            var type = "${fn:escapeXml(type)}";
            var path = "${fn:escapeXml(path)}";
        </script>
    </head>
    <body>
		<div class="go_wrap">
		    <%@include file="../mail/topmenu.jsp"%>
			<div class="go_body">
			    <%@include file="webfolderLeftMenu.jsp"%>
			    <div class="go_content">
	        		<!-- 자료실 목록: 기본 -->
			        <header class="content_top">
			            <h1 id="headerTitle"></h1>
			            <section class="combine_search" id="webfolderSearch">
							<div class="c_search_wrap"><!--focus되면 "search_focus" multi class로 추가해주세요.-->
								<select class="search_op" id="searchType" evt-rol="file-search-select">
									<option value="appSearch"><tctl:msg key="webfolder.title.01"/></option>
									<option value="totalSearch"><tctl:msg key="webfolder.total.search"/></option>
								</select>
								<input class="c_search" type="text"  placeholder='<tctl:msg key="webfolder.search" />' id="webfolderInput" evt-rol="webfolderInput" style="width: 155px;">
								<a class="c_btn_detail" id="fileDetailSearchBtn" title="<tctl:msg key="webfolder.detail.search" />" style="display:none" evt-rol="file-detail-search">
									<span class="txt"><tctl:msg key="webfolder.search.advanced"  /></span>
									<span class="ic ic_cs_detail_arrow "></span>
								</a>
								<input class="btn_c_search" type="submit" value='<tctl:msg key="webfolder.search"  />' evt-rol="webfoderSearchSubmit">
							</div>
							<div id="detailSearchLayerWrap" style="position:relative;display:none;z-index:60"></div>
						</section>
			        </header>
			        <!-- 자료실 목록 시작  -->
			        <div class="content_page data_share" id="webFolderContent">
			            <div class="dataTables_wrapper" >
			                <!-- 상단 메뉴바 START  -->
			                <div class="tool_bar">
			                    <div class="critical" id="toolbar">
			                        <!-- 커스텀 버튼 편집 가능  -->
			                        <a class="btn_tool disable" data-role="button" evt-rol="createFolderView"><!-- 폴더 혹은 파일이 아무것도 체크되어 있지 않으면 새 폴더를 제외하고 비활성 -->
                                        <span class="ic_toolbar folder"></span>
                                        <span class="txt"><tctl:msg key="webfolder.newfolder" /> </span>
                                    </a>
			                        <a class="btn_tool disable" data-role="button" evt-rol="downloadFolderList">
                                        <span class="ic_toolbar download"></span>
                                        <span class="txt"><tctl:msg key="file.download.title" /></span
                                    </a>
			                        <a class="btn_tool disable" data-role="button" evt-rol="removeFolder">
                                        <span class="ic_toolbar del"></span>
                                        <span class="txt_caution"><tctl:msg key="webfolder.delete" /></span>
                                    </a>
			                        <a class="btn_tool disable" data-role="button" evt-rol="copyFolder">
                                        <span class="ic_toolbar copy"></span>
                                        <span class="txt"><tctl:msg key="webfolder.copy" /></span>
                                    </a>
			                        <a class="btn_tool disable" data-role="button" evt-rol="moveFolder">
                                        <span class="ic_toolbar move"></span>
                                        <span class="txt"><tctl:msg key="webfolder.move" /></span>
                                    </a>
			                        <a class="btn_tool disable" data-role="button" evt-rol="sendMail" id="sendMailButton" style="display:none">
                                        <span class="ic_toolbar mail"></span>
                                        <span class="txt"><tctl:msg key="webfolder.writeMail"  /></span>
                                    </a>

									<div class="btn_submenu">
										<a class="btn_tool btn_tool_multi" id="downloadBtn" evt-rol="listDownload">
											<span class="ic_toolbar download"></span>
											<span class="txt"><tctl:msg key="webfolder.listdownload"  /></span>
										</a>
										<span class="btn_func_more" id="submenuBtn" backdrop-toggle="true" el-backdrop-link="view311" evt-rol="listDownload">
											<span class="ic ic_arrow_type3"></span>
										</span>
										<div class="array_option list_download" id="list_download" style="display: none">
											<ul class="array_type">
												<li id="currentDownload" evt-rol="currentDownload"><span><tctl:msg key="webfolder.currentdownload"  /></span></li>
												<li id="totalDownload" evt-rol="totalDownload"><span><tctl:msg key="webfolder.totaldownload"  /></span></li>
											</ul>
										</div>
									</div>
			                    </div>
								<div class="optional">
									<select id="webfolder_list_offset" data-el-grid-page-size="" evt-rol="change-offset">
										<option value="20">20</option>
										<option value="40">40</option>
										<option value="60">60</option>
										<option value="80">80</option>
									</select>
								</div>
			                </div>
			                <!-- 상단 메뉴바 END  -->
			                <div id="createFolderWrap" class="create_form option_display" style="display: none;">
			                    <h1><tctl:msg key="webfolder.newname" /></h1>
			                    <span class="txt_form"><input class="txt_mini wfix_max" id="fNameInput" type="text" placeholder="<tctl:msg key="alert.nofile"  />" evt-rol="fNameInput" /></span>
			                    <span class="btn_fn7" evt-rol="createFolder"><span class="txt"><tctl:msg key="button.ok" /></span></span>
			                    <span class="btn_fn7" evt-rol="cancelCreateFolder"><span class="txt"><tctl:msg key="button.cancel" /></span></span>
			                    <span id="folderNameError" class="error_msg" style="display: none;">
			                        <ins class="ic ic_"></ins>
			                        <span class="txt"><tctl:msg key="error.folderexists" /></span>
			                    </span>
			                </div>
			                <!-- 테이블 -->
			                <table class="type_normal" id="viewFolder">
			                </table>
			                <!-- //테이블 -->
	                        <!-- 페이징 (마크업&클래스명 유지) -->
	                        <footer id="webfolderListFooter"></footer>
			            </div>
			        <!-- 테이블 목록 검색 -->
			        </div>
	                <!-- 자료실 목록 끝 -->
		        </div>
	            <%@include file="../mail/orgLeft.jsp"%>
		    </div>
            <%@include file="../mail/bottom.jsp" %>
        </div>

		<iframe name="hidden_frame" id="reqFrame" src="about:blank" frameborder="0" width="0" height="0" style="display:none;"></iframe>
		<form id="downloadForm" method="post">
		<input type="hidden" name="dwuids" id="dwuids">
		<input type="hidden" name="type" id="type">
		<input type="hidden" name="path" id="path">
		<input type="hidden" name="sroot" id="sroot">
		<input type="hidden" name="userSeq" id="userSeq">
		</form>
        <div id="workHiddenFrame" style="display: none"></div>
        <%@include file="webfolderTemplate.jsp"%>
        <%@include file="webfolderModalTemplate.jsp"%>

		<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.layout-latest.js?rev=${revision}"></script>
		<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/waypoints.min.js?rev=${revision}"></script>
		<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.util.js?rev=${revision}"></script>
		<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.swfupload.js?rev=${revision}"></script>
       	<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.progressbar.js?rev=${revision}"></script>
		<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mailBasicAttach.js?rev=${revision}"></script>
        <script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/handlebars-mail-helper.js?rev=${revision}"></script>
		<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/swfupload/swfupload.js?rev=${revision}"></script>
		<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/ocx/ocx_load.js?rev=${revision}"></script>
		<script type="text/javascript" src="${baseUrl}resources/js/plugins/webfolder/webfolderCommon.js?rev=${revision}"></script>
		<script type="text/javascript" src="${baseUrl}resources/js/plugins/webfolder/webfolderAction.js?rev=${revision}"></script>
		<script type="text/javascript" src="${baseUrl}resources/js/plugins/webfolder/webfolderAttach.js?rev=${revision}"></script>

        <script type="text/javascript">
        jQuery(document).ready(function() {
			if(USE_OAUTH_LOGIN) {
				jQuery('body').addClass("channel");
			}

			if (USE_LAB_FEEDBACK && HAS_LAB_FEEDBACK_CONFIG) {
				jQuery('body').addClass("lab");
			}
        	setWebfolderAppName();
            initWebFolderFunction();
            initService();
            //orgLeftInit();
        });
        </script>
<%if(isMsie){ %>
<script language=javascript for="TPOWERUPLOAD" event="OnFileAttached(key, idx)">

    var ocx = document.uploadForm.powerupload;
    document.getElementById("basic_normal_size").innerHTML = printSize(ocx.GetAttachedSize("NORMAL"));
</script>

<script language=javascript for="TPOWERUPLOAD" event="OnFileUploaded(key, idx)">

    var ocx = document.uploadForm.powerupload;
    if(ocx.GetAttachedFileAttr2(key, "UPKEY") == ""){
        uploadAttachFilesError = true;
        setTimeout(function(){
            ocx.RemoveAttachFile(key);
        },500);
    }
    document.getElementById("basic_normal_size").innerHTML =
        printSize(ocx.GetAttachedSize("NORMAL"));
</script>

<script language=javascript for="TPOWERUPLOAD" event="OnFileDeleted(key, idx)">

    var ocx = document.uploadForm.powerupload;

</script>

<script language=javascript for="TPOWERUPLOAD" event="OnChAttachMethod(key, idx)">

    var ocx = document.uploadForm.powerupload;
    document.getElementById("basic_normal_size").innerHTML =
        printSize(ocx.GetAttachedSize("NORMAL"));
</script>
<%} %>

    </body>
</html>





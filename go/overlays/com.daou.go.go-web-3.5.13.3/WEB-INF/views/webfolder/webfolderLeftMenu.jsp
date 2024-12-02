<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<div class="go_side" id="webfolderLeft" style="padding-bottom: 55px;">
		<section class="gnb_title">
			<h1><a id="webfolderAppNameLink" real-path="WEBFOLDERROOT" type="user" evt-rol="webfolder-home">&nbsp;</a></h1>
		</section>

        <section class="function">
            <a class="btn_function" evt-rol="uploadFileView"><span class="ic_side ic_app_file"></span><span class="txt"><tctl:msg key="list.fileattaching"/></span></a>
        </section>
        
        
        <section id="quotaInfo" class="lnb personal_data">
        </section>
        <c:if test="${sideTop eq 'private'}">
	        <section class="lnb">
	            <h1 class="user">
                    <a evt-rol="toggleFolder" type="webfolderLeft">
                        <ins class="ic"></ins>
                        <span class="ic_side ic_hide_up"></span>
                    </a>
                    <span class="txt" real-path="WEBFOLDERROOT" type="user" evt-rol="viewFolderLeft"><tctl:msg key="webfolder.title"/></span>
                </h1>
	            <ul class="side_depth webfolderLeft" id="webFolderList" style="display:none;"></ul>
	            <ul class="side_depth webfolderLeft" id="webShareFolderList" style="display:none;"></ul>
	        </section>
	
	        <section class="lnb">
	            <h1 class="company">
	                <a evt-rol="toggleFolder" type="publicFolderLeft">
	                    <ins class="ic"></ins>
                        <span class="ic_side ic_hide_up"></span>
                    </a>
                    <span class="txt" real-path="WEBFOLDERROOT" type="public" evt-rol="viewFolderLeft"><tctl:msg key="webfolder.public.title"/></span>
                </h1>
	            
	            <ul class="side_depth publicFolderLeft" id="publicWebFolderList" style="display:none;"></ul>
	        </section>
        </c:if>
        
        <c:if test="${sideTop ne 'private' }">
            <section class="lnb">
                <h1 class="company">
                    <a evt-rol="toggleFolder" type="publicFolderLeft">
                        <ins class="ic"></ins>
                        <span class="ic_side ic_hide_up"></span>
                    </a>
                    <span class="txt" real-path="WEBFOLDERROOT" type="public" evt-rol="viewFolderLeft"><tctl:msg key="webfolder.public.title"/></span>
                </h1>

                <ul class="side_depth publicFolderLeft" id="publicWebFolderList" style="display:none;"></ul>
            </section>
            <section class="lnb">
                <h1 class="user">
                    <a evt-rol="toggleFolder" type="webfolderLeft">
                        <ins class="ic"></ins>
                        <span class="ic_side ic_hide_up"></span>
                    </a>
                    <span class="txt" real-path="WEBFOLDERROOT" type="user" evt-rol="viewFolderLeft"><tctl:msg key="webfolder.title"/></span>
                </h1>
                <ul class="side_depth webfolderLeft" id="webFolderList" style="display:none;"></ul>
                <ul class="side_depth webfolderLeft" id="webShareFolderList" style="display:none;"></ul>
            </section>
        </c:if>
        <div class="bar"></div>
    </div>

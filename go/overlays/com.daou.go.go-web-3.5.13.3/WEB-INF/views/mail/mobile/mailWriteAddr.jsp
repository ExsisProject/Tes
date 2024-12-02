<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<div id="addr_content" class="go_content" style="display:none;left: 0px; z-index: 3000; margin-top: 0px;">
	<div class="nav con_nav">
		<div class="critical">
			<a href="javascript:;" evt-rol="write-addr-cancel"><span class="ic_nav ic_nav_cancel"></span></a>
		</div>
		<div class="optional">
			<ul class="toolbar_list">
				<li>
					<a href="javascript:;" evt-rol="add-addr-write" data-type="to"><tctl:msg key="mail.to"/></a>
				</li>
				<li>
					<a href="javascript:;" evt-rol="add-addr-write" data-type="cc"><tctl:msg key="mail.cc"/></a>
				</li>
				<li>
					<a href="javascript:;" evt-rol="add-addr-write" data-type="bcc"><tctl:msg key="mail.bcc"/></a>
				</li>
			</ul>
		</div>
	</div>

    <div class="go_content go_addr_list" style="left:0">
    <div class="content_page">
        <div class="tool_depth addr_main">
            <a id="writeAddrLink" class="btn_tool btn_slt" data-role="button" href="javascript:;">
                <span class="txt"></span><span class="space_ic"></span><span class="ic ic_arrow_down"></span>
                <select id="writeAddrSelect" class="sit_move addr_select" style="display:block">
                    <option value="user"><tctl:msg key="addr.search.result.type.private.title" /></option>
                    <option value="company"><tctl:msg key="addr.search.result.type.public.title" /></option>
                    <option value="department"><tctl:msg key="addr.search.result.type.dept.title" /></option>
                    <option value="emp"><tctl:msg key="comn.top.org"/></option>
                </select>
            </a>
        </div>
        <div class="content">
            <div id="addr_search_wrap" class="docu_search">
                <div class="wrap_search">
                    <form action="" onsubmit="return false;">
                        <input id="addrSearchText" type="search" placeholder="<tctl:msg key="alert.search.nostr"/>" class="input">
                    </form>
                    <a href="javascript:;" id="addrSearchCancel"><span class="btn btn_del_type1"></span></a>
                    <a href="javascript:;" id="addrSearchBtn" ><span class="ic_cmm ic_cmm_search"></span></a>
                </div>
            </div>
            <div class="docu_body">
                <div class="bcr" id="userCheckedScroll"></div>
                <!-- 목록 -->
                <p class="list_title" id="dept_list_title"><tctl:msg key="mail.search.name.department"/></p>
                <ul id="addr_dept_list" class="list_normal list_photo list_photo_ipt"></ul>
                <p class="list_title" id="users_list_title"><tctl:msg key="common.org.dept.staff"/></p>
                <ul id="addr_member_list" class="list_normal list_photo list_photo_ipt"></ul>
            </div>

        </div>
<!-- // 주소록 목록 -->
    </div>
    </div>
</div>
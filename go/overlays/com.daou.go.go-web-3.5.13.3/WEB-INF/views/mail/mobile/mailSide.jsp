<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<div id="mail_folder_side_background"
     style="height:100%;position:absolute;background-color:#333333;width:280px;display:none;"></div>
<div id="mail_folder_side" class="go_side" style="display:none;">
    <div id="side_content" style="min-height:100%">
        <!-- 즐겨찾기 -->
        <h3>
			<span class="btn_wrap">
				<span class="txt_ellipsis"><tctl:msg key="mail.bookmark"/></span>
			</span>
        </h3>
        <ul id="mail_bookmark_list"></ul>
        <c:if test="${securityCenter}">
            <h3>
			<span class="btn_wrap">
				<a href="javascript:;" evt-rol="move-security-center" evt-data-url="${securityCenterUrl}"><span
                        class="txt_ellipsis"><tctl:msg key="mail.securityceter.title"/></span></a>
			</span>
            </h3>
        </c:if>
        <c:if test="${sideTop ne 'mail'}">
            <!-- 태그 -->
            <h3>
				<span class="btn_wrap">
					<span class="txt_ellipsis"><tctl:msg key="folder.tag"/></span>
				</span>
            </h3>
            <ul id="mail_tag_list_area"></ul>
        </c:if>
        <!-- 메일함 -->
        <h3>
			<span class="btn_wrap">
				<span class="txt_ellipsis"><tctl:msg key="mail.folder"/></span>
			</span>
        </h3>
        <ul class="side_depth">
            <li class="folder">
                <p class="title">
                    <a href="javascript:;" evt-rol="folder" fname="Inbox">
						<span class="btn_wrap">
							<span class="ic_side ic_mail_receive"></span>
							<span class="txt_ellipsis"><tctl:msg key="folder.inbox"/></span>
							<span id="defaultFolder0_num" class="count"></span>
						</span>
                    </a>
                </p>
                <ul id="inbox_folder_area"></ul>
            </li>
            <li class="folder">
                <p class="title">
                    <a href="javascript:;" evt-rol="folder" fname="Sent">
						<span class="btn_wrap">
							<span class="ic_side ic_mail_send"></span>
							<span class="txt_ellipsis"><tctl:msg key="folder.sent"/></span>
						</span>
                    </a>
                </p>
            </li>
            <c:if test="${notiMode ne 'mail'}">
                <li class="folder">
                    <p class="title">
                        <a href="javascript:;" evt-rol="receive-noti-list">
						<span class="btn_wrap">
							<span class="ic_side ic_mail_send"></span>
							<span class="txt_ellipsis"><tctl:msg key="menu.receivenoti"/></span>
						</span>
                        </a>
                    </p>
                </li>
            </c:if>
            <li class="folder">
                <p class="title">
                    <a href="javascript:;" evt-rol="folder" fname="Drafts">
						<span class="btn_wrap">
							<span class="ic_side ic_mail_temp"></span>
							<span class="txt_ellipsis"><tctl:msg key="folder.drafts"/></span>
							<span id="defaultFolder2_num" class="count"></span>
						</span>
                    </a>
                </p>
            </li>
            <li class="folder">
                <p class="title">
                    <a href="javascript:;" evt-rol="folder" fname="Reserved">
						<span class="btn_wrap">
							<span class="ic_side ic_mail_reserve"></span>
							<span class="txt_ellipsis"><tctl:msg key="folder.reserved"/></span>
							<span id="defaultFolder3_num" class="count"></span>
						</span>
                    </a>
                </p>
            </li>
            <c:if test="${useSpamFolder}">
                <li class="folder">
                    <p class="title">
                        <a href="javascript:;" evt-rol="folder" fname="Spam">
						<span class="btn_wrap">
							<span class="ic_side ic_mail_spam"></span>
							<span class="txt_ellipsis"><tctl:msg key="folder.spam"/></span>
							<span id="defaultFolder4_num" class="count"></span>
						</span>
                        </a>
                        <span class="optional">
						<a href="javascript:;" evt-rol="empty-spam-folder"><span class="btn btn_garbage"></span></a>
					</span>
                    </p>
                </li>
            </c:if>
            <li class="folder">
                <p class="title">
                    <a href="javascript:;" evt-rol="folder" fname="Trash">
						<span class="btn_wrap">
							<span class="ic_side ic_mail_basket"></span>
							<span class="txt_ellipsis"><tctl:msg key="folder.trash"/></span>
							<span id="defaultFolder5_num" class="count"></span>
						</span>
                    </a>
                    <span class="optional">
						<a href="javascript:;" evt-rol="empty-trash-folder"><span class="btn btn_garbage"></span></a>
					</span>
                </p>
            </li>
            <li id="folder_quotaviolate" class="folder" style="display:none;">
                <p class="title">
                    <a href="javascript:;" evt-rol="folder" fname="Quotaviolate">
						<span class="btn_wrap">
							<span class="ic_side ic_mail_over"></span>
							<span class="txt_ellipsis"><tctl:msg key="folder.quotaviolate"/></span>
							<span id="defaultFolder6_num" class="count"></span>
						</span>
                    </a>
                </p>
            </li>
            <ul id="uf_folder_area"></ul>
            <ul class="side_depth">
                <li id="shared_folder_title" class="folder" style="display:none;">
                    <p class="title">
						<span class="btn_wrap">
							<span class="txt_ellipsis">&lt;<tctl:msg key="mail.shared.title"/>&gt;</span>
						</span>
                    </p>
                </li>
            </ul>
            <ul id="shared_folder_wrap" class="side_depth"></ul>
        </ul>
        <h3 id="smart_menu">
		<span class="btn_wrap">
			<span class="txt_ellipsis"><tctl:msg key="menu.smart"/></span>
		</span>
        </h3>
        <ul id="uf_smart_area">

        </ul>
        <h3>
			<span class="btn_wrap">
				<span class="txt_ellipsis"><tctl:msg key="menu.quick"/></span>
			</span>
        </h3>
        <ul>
            <li>
                <a href="javascript:;" evt-rol="folder-execute" type="flaged">
					<span class="btn_wrap">
						<span class="ic_side  ic_mail_important "></span>
						<span class="txt_ellipsis"><tctl:msg key="mail.folder.all.flaged"/></span>
					</span>
                </a>
            </li>
            <li>
                <a href="javascript:;" evt-rol="folder-execute" type="unseen">
					<span class="btn_wrap">
						<span class="ic_side ic_mail_noread"></span>
						<span class="txt_ellipsis"><tctl:msg key="mail.folder.all.unseen"/></span>
					</span>
                </a>
            </li>
            <li>
                <a href="javascript:;" evt-rol="folder-execute" type="seen">
					<span class="btn_wrap">
						<span class="ic_side ic_mail_read"></span>
						<span class="txt_ellipsis"><tctl:msg key="mail.folder.all.seen"/></span>
					</span>
                </a>
            </li>
            <li>
                <a href="javascript:;" evt-rol="folder-execute" type="today">
					<span class="btn_wrap">
						<span class="ic_side ic_mail_today"></span>
						<span class="txt_ellipsis"><tctl:msg key="mail.folder.all.today"/></span>
					</span>
                </a>
            </li>
            <li>
                <a href="javascript:;" evt-rol="folder-execute" type="yesterday">
					<span class="btn_wrap">
						<span class="ic_side ic_mail_yesterday"></span>
						<span class="txt_ellipsis"><tctl:msg key="mail.folder.all.yesterday"/></span>
					</span>
                </a>
            </li>
            <li>
                <a href="javascript:;" evt-rol="folder-execute" type="attach">
					<span class="btn_wrap">
						<span class="ic_side ic_mail_file"></span>
						<span class="txt_ellipsis"><tctl:msg key="mail.folder.all.attach"/></span>
					</span>
                </a>
            </li>
            <li>
                <a href="javascript:;" evt-rol="folder-execute" type="reply">
					<span class="btn_wrap">
						<span class="ic_side ic_mail_reply"></span>
						<span class="txt_ellipsis"><tctl:msg key="mail.folder.all.reply"/></span>
					</span>
                </a>
            </li>
            <li>
                <a href="javascript:;" evt-rol="folder-execute" type="myself">
					<span class="btn_wrap">
						<span class="ic_side ic_mail_me"></span>
						<span class="txt_ellipsis"><tctl:msg key="mail.folder.all.myself"/></span>
					</span>
                </a>
            </li>
        </ul>
        <c:if test="${sideTop eq 'mail'}">
            <!-- 태그 -->
            <h3>
				<span class="btn_wrap">
					<span class="txt_ellipsis"><tctl:msg key="folder.tag"/></span>
				</span>
            </h3>
            <ul id="mail_tag_list_area"></ul>
        </c:if>
    </div>
</div>
<div class="dim" style="display:none;"></div>
<!-- // side > mail -->
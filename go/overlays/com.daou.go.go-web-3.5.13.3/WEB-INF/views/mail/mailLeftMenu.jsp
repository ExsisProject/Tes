<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!-- mail-->
	<div id="mailLeftMenuWrap" class="go_side">
		<section class="gnb_title">
			<h1><a id="mailAppNameLink" evt-rol="mail-home" fname="Inbox">&nbsp;</a></h1>
		</section>
		<section class="function">
			<a class="btn_function" evt-rol="write-mail"><span class="ic_side ic_app_mail"></span><span class="txt"><tctl:msg key="mail.write"/></span></a>
		</section>
		<div id="leftMenuSectionWrap" class="scroll_wrap">
			<!-- 즐겨찾기 -->
			<section id="mail_bookmark_wrap" class="lnb">
				<h1 class="star">
					<ins class="ic"></ins>
					<span id="bookmark_menu_collapse" evt-rol="change-menu-collapse" data-id="mail_bookmark_list" data-icon="bookmark_menu_collapse" class="ic_side ic_hide_up" title="<tctl:msg key="common.menu.hide" />"></span>
					<span class="txt" evt-rol="change-menu-collapse" data-id="mail_bookmark_list" data-icon="bookmark_menu_collapse"><tctl:msg key="mail.bookmark"/></span>
					<span id="mail_bookmark_btn_normal" class="btn_wrap">
						<span class="ic_side ic_list_reorder" evt-rol="bookmark-modify" title="<tctl:msg key="comn.modfy" />"></span>

					</span>
					<span id="mail_bookmark_btn_modify" class="btn_wrap" style="display:none;">
						<span class="ic_side ic_done" evt-rol="bookmark-submit" title="<tctl:msg key="common.modify.complate" />"></span>
						<span class="ic_side ic_cancel" evt-rol="bookmark-cancel" title="<tctl:msg key="comn.cancel" />"></span>
					</span>
				</h1>
				<ul id="mail_bookmark_list" class="side_depth"></ul>
			</section>
			<c:if test="${securityCenter}">
			<section class="lnb">
				<h1 class="security" evt-data-url="${securityCenterUrl}">
					<ins class="ic"></ins>
					<span class="txt" evt-rol="move-security-center"><tctl:msg key="mail.securityceter.title"/></span>
					<span class="sub_txt approver" style="display:none;">(<tctl:msg key="mail.approval.wait"/></span>
					<span class="num approver" style="display:none;" evt-rol="move-security-center" evt-data="Todo"></span>
					<span class="sub_txt approver" style="display:none;">)</span>
				</h1>
			</section>
			</c:if>
			<c:if test="${sideTop ne 'mail'}">
				<section class="lnb">
					<h1 class="tag">
						<ins class="ic"></ins>
						<span id="tag_menu_collapse" evt-rol="change-menu-collapse" data-id="mail_tag_wrap" data-icon="tag_menu_collapse" class="ic_side ic_hide_up" title="<tctl:msg key="common.menu.hide" />"></span>
						<span class="txt" evt-rol="change-menu-collapse" data-id="mail_tag_wrap"  data-icon="tag_menu_collapse"><tctl:msg key="folder.tag"/></span>
						<span class="btn_wrap"></span>
					</h1>
					<!--data_display_control-->
					<ul id="mail_tag_wrap" style="display:none;" class="side_depth">
						<ul id="mail_tag_list_area"></ul>
						<ul>
							<li class="new">
								<p class="title">
									<a evt-rol="tag-add" id="sideTop_tag"><ins class="ic"></ins><span class="txt"><tctl:msg key="mail.tag.add"/></span></a>
								</p>
							</li>
						</ul>
					</ul>
					<!--//data_display_control-->			
				</section>
			</c:if>
			
			<section class="lnb">
				<h1 class="mail">
					<ins class="ic"></ins>
					<span id="mail_menu_collapse" class="ic_side ic_hide_up" evt-rol="change-menu-collapse" data-id="left_mail_box_wrap" data-icon="mail_menu_collapse" title="<tctl:msg key="common.menu.hide" />"></span>
					<span class="txt" evt-rol="change-menu-collapse" data-id="left_mail_box_wrap"  data-icon="mail_menu_collapse"><tctl:msg key="mail.folder"/></span>
					<span class="btn_wrap">
						<span class="ic_side ic_side_setting" evt-rol="go-folder-manager" title="<tctl:msg key="mail.foldermgnt"/>"></span>
					</span>
				</h1>
				<div id="left_mail_box_wrap" style="display:none;">
					<!--data_display_control-->
					<ul class="side_depth">
						<li class="mail_inbox default_folder" depth="0">
							<p id="folder_link_Inbox" class="title">
								<span id="inbox_toggle_btn" evt-rol="toggle-mail-folder" style="display:none;" class="close" status="open" fid="defaultFolder0" title="<tctl:msg key="comn.close" />"></span>
								<a evt-rol="folder" fname="Inbox" title="<tctl:msg key="folder.inbox"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.inbox"/></span></a>
								<span id="defaultFolder0_num"></span>
								<span fname="Inbox" data-depth="0" evt-rol="mail-folder-option" class="btn_wrap"><span title="<tctl:msg key="mail.foldermgnt"/>" class="ic_side ic_more_option"></span></span>
							</p>
							<ul id="inbox_folder_area" depth="1"></ul>
						</li>
						<li class="mail_sent default_folder">
							<p id="folder_link_Sent" class="title">
								<a evt-rol="folder" fname="Sent" title="<tctl:msg key="folder.sent"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.sent"/></span></a>
								<span id="defaultFolder1_num"></span>
								
								<c:if test="${notiMode ne 'mail'}">
								<span class="btn_wrap"><span class="btn_side3" evt-rol="receive-noti-list"><tctl:msg key="menu.receivenoti"/></span></span>
								</c:if>
								
							</p>
						</li>
						<li class="mail_draft default_folder">
							<p id="folder_link_Drafts" class="title">
								<a evt-rol="folder" fname="Drafts" title="<tctl:msg key="folder.drafts"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.drafts"/></span></a>
								<span id="defaultFolder2_num"></span>
							</p>
						</li>
						<li class="mail_reserved default_folder">
							<p id="folder_link_Reserved" class="title">
								<a evt-rol="folder" fname="Reserved" title="<tctl:msg key="folder.reserved"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.reserved"/></span></a>
								<span id="defaultFolder3_num"></span>
							</p>
						</li>
						<c:if test="${useSpamFolder}">
						<li class="mail_spam default_folder">
							<p id="folder_link_Spam" class="title">
								<a evt-rol="folder" fname="Spam" title="<tctl:msg key="folder.spam"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.spam"/></span></a>
								<span id="defaultFolder4_num"></span>
								<span class="btn_wrap" evt-rol="empty-spam-folder"><span class="btn_side3"><tctl:msg key="menu.empty"/></span></span>
							</p>
						</li>
						</c:if>
						
						<c:if test="${useTMWFolder}">
						<li class="mail_spam default_folder">
							<p class="title">
								<a evt-rol="tmw-folder" title="<tctl:msg key="folder.spam"/>"><ins class="ic"></ins><span class="txt">${tmwFolderName}</span></a>
							</p>
						</li>
						</c:if>
						
						<li class="trash default_folder">
							<p id="folder_link_Trash" class="title">
								<a evt-rol="folder" fname="Trash" title="<tctl:msg key="folder.trash"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.trash"/></span></a>
								<span id="defaultFolder5_num"></span>
								<span class="btn_wrap" evt-rol="empty-trash-folder"><span class="btn_side3"><tctl:msg key="menu.empty"/></span></span>
							</p>
						</li>
						<li id="df_quotaviolate" style="display:none;" class="mail_inbox_full">
							<p id="folder_link_Quotaviolate" class="title">
								<a evt-rol="folder" fname="Quotaviolate" title="<tctl:msg key="folder.quotaviolate"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.quotaviolate"/></span></a>
								<span id="defaultFolder6_num"></span>
							</p>
						</li>
						<ul id="uf_folder_area"></ul>
						<ul class="side_depth">
							<li id="shared_folder_title" class="delimiter" style="display:none;">
								<p class="title">
								<ins class="ic"></ins><span class="txt">&lt;<tctl:msg key="mail.shared.title"/>&gt;</span>
								</p>
							</li>
						</ul>
						<ul id="shared_folder_wrap" class="side_depth"></ul>
						<c:if test="${useArchive}">
				            <li class="folder">
	    						<p class="title">
		       				        <a href="${archiveSSOUrl}"><ins class="ic"></ins><span class="txt"><tctl:msg key="mail.achive.link"/></span></a>
				     		    </p>
				            </li>               
				        </c:if>
					</ul>
					<div class="list_action">
						<span class="btn_wrap">
							<span class="btn_side2" evt-rol="more-folder"><tctl:msg key="mail.folder.more"/></span>
							<span class="btn_side2" evt-rol="add-folder"><tctl:msg key="mail.folder.add"/></span>
						</span>
					</div>
				</div>
			</section>

			<section class="lnb" id="smart_menu" style="display: none;">
				<h1 class="mail">
					<ins class="ic"></ins>
					<span id="smart_menu_collapse" class="ic_side ic_hide_up" evt-rol="change-menu-collapse" data-id="uf_smart_area" data-icon="smart_menu_collapse" title="<tctl:msg key="common.menu.hide" />"></span>
					<span class="txt" evt-rol="change-menu-collapse" data-id="uf_smart_area" data-icon="smart_menu_collapse" ><tctl:msg key="menu.smart"/></span>
					<span class="btn_wrap">
						<c:if test="${smartFilter}"><span class="ic_side ic_side_setting" evt-rol="go-filter-manager" title="<tctl:msg key="menu.rule"/>"></span></c:if>
					</span>
				</h1>
				<ul class="side_depth" id="uf_smart_area">
				</ul>
			</section>

			<section class="lnb">
				<h1 class="mail">
					<ins class="ic"></ins>
					<span id="quicksearch_menu_collapse" class="ic_side ic_hide_up" evt-rol="change-menu-collapse" data-id="left_quicksearch_box_wrap" data-icon="quicksearch_menu_collapse" title="<tctl:msg key="common.menu.hide" />"></span>
					<span class="txt" evt-rol="change-menu-collapse" data-id="left_quicksearch_box_wrap"  data-icon="quicksearch_menu_collapse"><tctl:msg key="menu.quick"/></span>
					<span class="btn_wrap">
					</span>
				</h1>
				<div id="left_quicksearch_box_wrap" style="display:none;">
					<!--data_display_control-->
					<ul class="side_depth">
						<li class="mail_important">
							<p id="ext_folder_link_flaged" class="title">
								<a evt-rol="folder-execute" type="flaged"><ins class="ic"></ins><span class="txt"><tctl:msg key="mail.folder.all.flaged"/></span></a>
							</p>
						</li>
						<li class="mail_noread">
							<p id="ext_folder_link_unseen" class="title">
								<a evt-rol="folder-execute" type="unseen"><ins class="ic"></ins><span class="txt"><tctl:msg key="mail.folder.all.unseen"/></span></a>
							</p>
						</li>
						<li class="mail_read">
							<p id="ext_folder_link_seen" class="title">
								<a evt-rol="folder-execute" type="seen"><ins class="ic"></ins><span class="txt"><tctl:msg key="mail.folder.all.seen"/></span></a>
							</p>
						</li>
						<li class="mail_today">
							<p id="ext_folder_link_today" class="title">
								<a evt-rol="folder-execute" type="today"><ins class="ic"></ins><span class="txt"><tctl:msg key="mail.folder.all.today"/></span></a>
							</p>
						</li>
						<li class="mail_yesterday">
							<p id="ext_folder_link_yesterday" class="title">
								<a evt-rol="folder-execute" type="yesterday"><ins class="ic"></ins><span class="txt"><tctl:msg key="mail.folder.all.yesterday"/></span></a>
							</p>
						</li>
						<li class="mail_file">
							<p id="ext_folder_link_attach" class="title">
								<a evt-rol="folder-execute" type="attach"><ins class="ic"></ins><span class="txt"><tctl:msg key="mail.folder.all.attach"/></span></a>
							</p>
						</li>
						<li class="mail_reply">
							<p id="ext_folder_link_reply" class="title">
								<a evt-rol="folder-execute" type="reply"><ins class="ic"></ins><span class="txt"><tctl:msg key="mail.folder.all.reply"/></span></a>
							</p>
						</li>
						<li class="mail_me">
							<p id="ext_folder_link_myself" class="title">
								<a evt-rol="folder-execute" type="myself"><ins class="ic"></ins><span class="txt"><tctl:msg key="mail.folder.all.myself"/></span></a>
							</p>
						</li>
					</ul>
				</div>
			</section>
			<c:if test="${sideTop eq 'mail'}">
				<section class="lnb">
					<h1 class="tag">
						<ins class="ic"></ins>
						<span id="tag_menu_collapse" evt-rol="change-menu-collapse" data-id="mail_tag_wrap" data-icon="tag_menu_collapse" class="ic_side ic_hide_up" title="<tctl:msg key="common.menu.hide" />"></span>
						<span class="txt" evt-rol="change-menu-collapse" data-id="mail_tag_wrap" data-icon="tag_menu_collapse"><tctl:msg key="folder.tag"/></span>
						<span class="btn_wrap"></span>
					</h1>
					<!--data_display_control-->
					<ul id="mail_tag_wrap" style="display:none;" class="side_depth">
						<ul id="mail_tag_list_area"></ul>
						<ul>
							<li class="new">
								<p class="title">
									<a evt-rol="tag-add" id="sideTop_mail"><ins class="ic"></ins><span class="txt"><tctl:msg key="mail.tag.add"/></span></a>
								</p>
							</li>
						</ul>
					</ul>
					<!--//data_display_control-->			
				</section>
			</c:if>
			<section class="lnb last_lnb">
				<ul class="side_depth">
					<li class="import" id="extmail-download-menu">
						<p class="title">
							<a evt-rol="extmail-download">
								<ins class="ic"></ins><span class="txt"><tctl:msg key="conf.pop.44" /></span>
							</a>
						</p>
					</li>
					<li class="setting">
						<p class="title">
							<a evt-rol="setting-menu">
								<ins class="ic"></ins><span class="txt"><tctl:msg key="mail.setting.menu"/></span>
							</a>
						</p>
					</li>
				</ul>	
			</section>
		</div>
		<section class="lnb personal_data">
			<span class="gage_wrap">
				<span id="usagePercent" class="gage" style="width:0%"></span>
			</span>
			<span class="txt"><tctl:msg key="mail.quota"/></span>
			<span class="num"><strong id="usageQuota"></strong></span>
			<span class="part">/</span>
			<span id="limitQuota" class="num"></span>
		</section>
	</div>
<!--//mail-->	
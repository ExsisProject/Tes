<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<div id="mail_list_header" class="mailHeaderWrap">
	<h2>
		<span id="header_tag_title_wrap" style="display:none;">
			<span id="header_tag_color" class="ic_tag"><span class="tail_r"><span></span></span></span>
			<span id="header_tag_name" class="txt_ellipsis"></span>
		</span>
		<span id="header_title_wrap"></span>
	</h2>
	<div class="critical">
		<a id="search_back_btn" href="javascript:;" evt-rol="goto-prev-page" style="display:none;"><span class="ic_nav ic_nav_prev"></span></a>
		<a id="toggle_folder_side_btn" href="javascript:;" evt-rol="toggle-folder-side"><span class="ic_nav ic_nav_list"></span></a>
		<a id="mail_refresh_btn" href="javascript:;" evt-rol="mail-refresh"><span class="ic_nav ic_nav_refresh"></span></a>
	</div>
	<div class="optional">
		<a href="javascript:;" evt-rol="write-mail"><span class="btn_major_type2"><tctl:msg key="mail.write"/></span></a>
	</div>
</div>
<div id="mail_read_header" class="mailHeaderWrap" style="display:none;">
	<h2><tctl:msg key="mail.view"/></h2>
	<div class="critical">
		<a href="javascript:;" evt-rol="goto-prev-page"><span class="ic_nav ic_nav_prev"></span></a>
	</div>
	<div class="optional">
		<a href="javascript:;" evt-rol="write-mail"><span class="btn_major_type2"><tctl:msg key="mail.write"/></span></a>
	</div>
</div>
<div id="mail_write_header" class="mailHeaderWrap" style="display:none">
	<h2><tctl:msg key="mail.write"/></h2>
	<div class="critical">
		<span class="ic_nav_btn">
			<a href="javascript:;" evt-rol="write-cancel"><span class="btn_major_type2"><tctl:msg key="mail.cancel"/></span></a>
		</span>
	</div>
	<div class="optional">
		<a href="javascript:;" evt-rol="send-mail"><span class="btn_major_type2"><tctl:msg key="menu.send"/></span></a>
	</div>
</div>
<div id="mail_mdnlist_header" class="mailHeaderWrap" style="display:none">
	<h2><tctl:msg key="menu.receivenoti"/></h2>
	<div class="critical">
		<a href="javascript:;" evt-rol="toggle-folder-side"><span class="ic_nav ic_nav_list"></span></a>
	</div>
	<div class="optional">
		<a href="javascript:;" evt-rol="write-mail"><span class="btn_major_type2"><tctl:msg key="mail.write"/></span></a>
	</div>
</div>
<div id="mail_mdnread_header" class="mailHeaderWrap" style="display:none">
	<h2><tctl:msg key="menu.receivenoti"/></h2>
	<div class="critical">
		<a href="javascript:;" evt-rol="goto-prev-page"><span class="ic_nav ic_nav_prev"></span></a>
	</div>
	<div class="optional">
		<a href="javascript:;" evt-rol="write-mail"><span class="btn_major_type2"><tctl:msg key="mail.write"/></span></a>
	</div>
</div>
<div id="mail_send_header" class="mailHeaderWrap" style="display:none">
	<h2><tctl:msg key="mail.write"/></h2>
	<div class="optional">
		<a href="javascript:;" evt-rol="write-mail"><span class="btn_major_type2"><tctl:msg key="mail.write"/></span></a>
	</div>
</div>

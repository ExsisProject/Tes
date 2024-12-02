<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<div id="move_folder_page" class="go_content" style="left:0;display:none;z-index:3000;margin-top:0">
	<header class="nav_s" style="background-color:#fff;">
		<h2><tctl:msg key="mail.move.msg"/></h2>
		<div class="critical nav" style="width:0">
			<a evt-rol="move-folder-cancel"><span class="ic_nav ic_nav_cancel"></span></a>
		</div>
	</header>
	<div class="content_page">
		<div class="content">
			<div id="move_message_folder_wrap">
				<ul id="mail_move_folder_list" class="list_normal list_single"></ul>
			</div>
		</div>
	</div>
</div>
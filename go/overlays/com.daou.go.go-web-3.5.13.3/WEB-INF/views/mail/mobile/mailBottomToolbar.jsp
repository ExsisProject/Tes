<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<div id="mailReadBottomToolbarWrap" style="display:none;">
	<div class="critical">
		<a id="mail_bottom_toolbar_read_reply" href="javascript:;" class="btn_tool" data-role="button" evt-rol="toolbar" evt-act="mail-reply" style="display:none;"><span class="txt"><tctl:msg key="menu.reply"/></span></a>
		<a id="mail_bottom_toolbar_read_forward" href="javascript:;" class="btn_tool" data-role="button" evt-rol="toolbar" evt-act="mail-forward" style="display:none;"><span class="txt"><tctl:msg key="menu.forward"/></span></a>
		<a id="mail_bottom_toolbar_read_delete" href="javascript:;" class="btn_tool" data-role="button" evt-rol="toolbar" evt-act="mail-delete">
			<span title="<tctl:msg key="menu.delete"/>" class="ic ic_del"></span>
			<span class="txt"><tctl:msg key="menu.delete"/></span>
		</a>
		
	</div>
	<div class="optional">
		<a id="read_pre_message_btn" href="javascript:;" data-role="button" class="btn_tool" evt-rol="toolbar" evt-act="read-pre-message" style="display:none;"><span class="txt"><tctl:msg key="comn.prelist"/></span></a>
		<a id="read_next_message_btn" href="javascript:;" data-role="button" class="btn_tool" evt-rol="toolbar" evt-act="read-next-message" style="display:none;"><span class="txt"><tctl:msg key="comn.nextlist"/></span></a>
	</div>
</div>
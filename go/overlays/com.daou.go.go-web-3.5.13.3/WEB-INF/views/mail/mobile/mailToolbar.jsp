<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<div id="mailListToolbarWrap">
	<div class="critical">
	</div>
	<div class="optional">
		<span class="wrap_btn_m_more">
			<a class="btn_m_more" id="more_btn" evt-rol="toolbar" evt-act="toggle-more-layout" ignore="on" menu="seen">
				<span class="ic_v2 ic_m_more"></span>
			</a>
			<div class="array_option" id="more_layout_list" style="display: none;">
				<ul class="array_type" id="more_list_list" data-id="more_list">
				</ul>
			</div>
		</span>
	</div>
</div>

<div id="mailReadToolbarWrap" style="display:none;">
	<div class="critical">
	</div>
	<div class="optional">
		<span class="wrap_btn_m_more">
			<a class="btn_m_more" id="more_btn" evt-rol="toolbar" evt-act="toggle-more-layout" ignore="on" menu="seen">
				<span class="ic_v2 ic_m_more"></span>
			</a>
			<div class="array_option" id="more_layout_read" style="display: none;">
				<ul class="array_type" id="more_list_read" data-id="more_list">
				</ul>
			</div>
		</span>
	</div>
</div>

<div id="mailWriteToolbarWrap" style="display:none;">
	<div class="critical">
		<a class="btn_tool" data-role="button" href="javascript:;" evt-rol="toolbar" evt-act="send-draft"><span class="txt"><tctl:msg key="menu.draft"/></span></a>
		<a class="btn_tool" data-role="button" href="javascript:;" evt-rol="toolbar" evt-act="rewrite"><span class="txt"><tctl:msg key="mail.rewrite"/></span></a>
	</div>
	<div class="optional" id="contactButton">
		<a class="btn_tool" data-role="button" href="javascript:;" evt-rol="toolbar" evt-act="write-add-address"><span class="txt"><tctl:msg key="mail.searchaddr"/></span></a>
	</div>
</div>
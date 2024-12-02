<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<header class="go_header" id="toolbar_wrap">
	<div id="mailHomeToolbarWrap" class="nav">
		<h1 id="top_menu_title"></h1>
		<div class="critical">
			<a href="javascript:;" id="toggle_folder_side_btn" evt-rol="toggle-folder-side"><span class="ic_nav ic_nav_list"></span></a>
			<a class="ic_nav_wrap" href="javascript:;" evt-rol="goto-gohome"><span class="ic_nav ic_nav_home"></span></a>
		</div>
		<div class="optional">
			<c:if test="${!dormant}">
			<a href="javascript:;" evt-rol="toggle-search-message"><span class="ic_nav ic_nav_search"></span></a>
			</c:if>
		</div>
	</div>
	<div id="mailListToolbarWrap" class="nav con_nav check_nav" style="display:none">
		<div class="critical">
			<a href="javascript:;" evt-rol="checked-cancel"><span class="ic_nav ic_nav_cancel"></span></a>
		</div>
		<div class="optional">
			<ul class="toolbar_list">
				<li class="moreItemLi" style="display:none">
					<span class="wrap_btn_m_more">
						<a class="btn_m_more" id="more_btn" evt-rol="toolbar" evt-act="toggle-more-layout" ignore="on" menu="seen">
							<span class="ic_v2 ic_m_more"></span>
						</a>
						<div class="array_option" style="display:none">
							<ul class="array_type moreMenuItem">

							</ul>
						</div>
					</span>
				</li>
			</ul>
		</div>

		<%--<div class="optional">
		<span class="wrap_btn_m_more">
			<a class="btn_m_more" id="more_btn" evt-rol="toolbar" evt-act="toggle-more-layout" ignore="on" menu="seen">
				<span class="ic_v2 ic_m_more"></span>
			</a>
			<div class="array_option" id="more_layout_list" style="display: none;">
				<ul class="array_type" id="more_list_list" data-id="more_list">
				</ul>
			</div>
		</span>
		</div>--%>
	</div>
	<div class="nav con_nav" id="mailReadToolbarWrap" style="display:none;">
		<div class="critical">
			<a href="javascript:;" evt-rol="goto-prev-page"><span class="ic_nav ic_nav_prev"></span></a>
		</div>
		<div class="optional">
			<ul class="toolbar_list">
				<li class="moreItemLi" style="display:none">
					<span class="wrap_btn_m_more">
						<a class="btn_m_more" id="more_btn" evt-rol="toolbar" evt-act="toggle-more-layout" ignore="on" menu="seen">
							<span class="ic_v2 ic_m_more"></span>
						</a>
						<div class="array_option" style="display:none">
							<ul class="array_type moreMenuItem">

							</ul>
						</div>
					</span>
				</li>
			</ul>
		</div>
	</div>
	<div id="mailWriteToolbarWrap" class="nav con_nav" style="display:none;">
		<div class="critical">
			<a href="javascript:;" evt-act="write-cancel"><span class="ic_nav ic_nav_cancel"></span></a>
		</div>
		<div class="optional">
			<ul class="toolbar_list">
				<li>
					<a data-role="button" href="javascript:;" evt-act="write-add-address"><span class="txt"><tctl:msg key="mail.searchaddr"/></span></a>
				</li>
				<li>
					<a href="javascript:;" evt-act="send-mail"><tctl:msg key="menu.send"/></a>
				</li>
			</ul>
		</div>
	</div>
	<section id="search_wrap" style="top:44px;display:none;z-index:101;" class="search_wrap">
		<div class="search">
			<form name="searchForm" onsubmit="searchGoMessage();return false;">
				<input id="search_keyword" type="search" placeholder="<tctl:msg key="mail.mobile.search.message"/>" class="input search">
				<a id="search_cancel_btn" href="javascript:;" evt-rol="search-cancel"><span class="btn btn_del_type1"></span></a>
				<a href="javascript:;" evt-rol="search-message"><span class="btn btn_search"></span></a>
			</form>
		</div>
	</section>
	<div id="attachLayer" style="z-index:102;display:none;" class="modal_1_wrap">
		<div class="modal_1 modal_add" style="top:-11px;">
			<a id="callCamera" data-bypass="" evt-rol="attach-take-picture"><span class="btn_type6"><span class="retina_ic retina_ic_camera"></span><span class="txt"><tctl:msg key="mobile.camera"/></span><span></span></span></a>
			<a id="callAlbum" data-bypass="" evt-rol="attach-select-album"><span class="btn_type6"><span class="retina_ic retina_ic_gallery"></span><span class="txt"><tctl:msg key="mobile.album"/></span><span></span></span></a>
		</div>
	</div>
		
	<div id="sendCheckLayer" style="display:none;top:60px;" class="layer_normal layer_prevent_receiveError">
		<header>
			<h1><tctl:msg key="mail.rcptcheck"/></h1>
			<a class="btn_layer_close" href="javascript:;" title="" evt-rol="send-check-cancel"><span class="ic ic_del"></span></a>
		</header>
		<div class="content">
			<div id="sendInfoCheck"></div>	
			<div class="wrap_btn">
				<a href="javascript:;"><span class="btn_major" data-role="button" evt-rol="send-check-ok"><span class="txt"><tctl:msg key="menu.send"/></span></span></a>
				<a href="javascript:;" id="sendCheckLayerApply" style="display:none;"><span class="btn_minor" data-role="button" evt-rol="send-check-apply"><span class="txt"><tctl:msg key="comn.setting"/></span></span></a>
				<a href="javascript:;"><span class="btn_minor" data-role="button" evt-rol="send-check-cancel"><span class="txt"><tctl:msg key="comn.cancel"/></span></span></a>
			</div>
		</div>
	</div>
	
	<div id="downloadAttachConfirmLayer" style="display:none;top:60px;" class="layer_normal layer_attach_check">
		<header>
			<h1><tctl:msg key="mail.attach.check.layer.header"/></h1>
			<a class="btn_layer_close" href="javascript:;" title="" evt-rol="download-attach-confirm-close"><span class="ic ic_del"></span></a>
		</header>
		<div class="content">
			<div id="downloadAttachConfirmCheck"></div>	
			<div class="wrap_btn">
				<a href="javascript:;"><span data-role="button" class="btn_major" evt-rol="download-attach-confirm-close"><span class="txt"><tctl:msg key="comn.confirm"/></span></span></a>
			</div>
		</div>
	</div>
	
	<div id="attachOverlay" class="overlay" style="z-index:101;position:absolute;display:none;"></div>
	<div id="popSideOverlay" style="z-index:97;background:transparent;position:fixed;display:none;"></div>
	<a href="javascript:;" id="mailWriteBtn" evt-rol="write-mail" class="btn_write" style="display:none;-webkit-transition-duration: 0.2s;"><span class="ic_cmm ic_write"></span></a>
</header>
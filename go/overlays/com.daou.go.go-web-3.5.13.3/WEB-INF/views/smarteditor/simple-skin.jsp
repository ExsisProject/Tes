<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions"  prefix="fn"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="ko">
<head>
	<meta name="base" content="${baseUrl}"> <!-- base meta태그는 항상 첫번째로 와야함 SE2B_Configuration_Service.js -->
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta http-equiv="Content-Script-Type" content="text/javascript">
	<meta http-equiv="Content-Style-Type" content="text/css">
	<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>

	<!--[if lte IE 8]>
	<link rel="stylesheet" type="text/css" href="${baseUrl}resources/css/go_home_dashboard_ie8.css?rev=${revision}"/>
	<![endif]-->

	<link href="${baseUrl}resources/js/vendors/smartEditor/css/smart_editor2.css?rev=${revision}" rel="stylesheet" type="text/css">
	<link href="${baseUrl}resources/js/vendors/smartEditor/css/smart_editor2_${locale}.css?rev=${revision}" rel="stylesheet" type="text/css">
	<style type="text/css">
		body { margin: 10px; }
		.husky_se_fontSize_layer ul,
		.husky_se_fontSize_layer li,
		.husky_se_fontSize_layer button {width:216px !important }
		#smart_editor2 .se2_inputarea_controller {text-align:left;padding-left:5px}
		#smart_editor2 .se2_url2 {width:200px}
		#smart_editor2 .se2_url2 .input_ty1 {width:105px}

		/*editor*/
		.layout_fixed #smart_editor2 .se2_text_tool ul.last {margin:3px 0 0 7px!important}
		.layout_fixed #smart_editor2 .se2_inputarea_controller {text-align:left!important}
		.layout_fixed #smart_editor2 .se2_tool .se2_l_font_size li ,
		#smart_editor2 .se2_tool .se2_l_font_size {width:200px}

		#smart_editor2 .se2_text_tool .se2_multy {
			position: relative;
			top: 0;
			right: 0;
			padding-left: 0;
			margin-right: 0;
			white-space: nowrap;
		}

		#smart_editor2 .se2_text_tool .se2_multy .se2_icon {
			background-position: 0 -135px;
			display: inline-block;
			visibility: visible;
			overflow: visible;
			position: static;
			width: 16px;
			height: 29px;
			margin: -1px 2px 0 -1px;
			line-height: 30px;
			vertical-align: top;
		}

		#smart_editor2 .se2_text_tool .se2_multy button {
			height:22px;
		}

		@media screen and (max-width:228px){
			#smart_editor2 .se2_bx_find_revise ul {margin: 8px 0 0 5px!important;padding:0!important}
			#smart_editor2 .se2_bx_find_revise .se2_in_bx_find dl {margin:0 0 0 4px!important; padding: 7px 0 13px 7px!important;background: none!important}
			#smart_editor2 .se2_bx_find_revise .se2_in_bx_revise dl {margin:0 0 0 4px!important; padding: 7px 0 13px 7px!important;background: none!important}
			ul.tool_4 {margin-left: 4px!important; margin-top: 2px!important; }
			#smart_editor2 .husky_se2m_fontcolor_layer {width: 224px!important; top:48px!important}
			#smart_editor2 .husky_se2m_BGColor_layer {width: 224px!important; top:48px!important}

			#smart_editor2 .husky_se2m_replace_find_next {margin: 0 -3px 0 -29px!important}
			#smart_editor2 .husky_se2m_replace {margin: 0 1px 0 -2px!important}
			#smart_editor2 .husky_se2m_replace_all {margin: 0 -3px 0 -6px!important}
			#smart_editor2 .husky_se2m_cancel {margin-left: -2px!important}

			#smart_editor2 .se2_text_tool .se2_multy .se2_icon {
				background-position: 0 -133px;
				display: inline-block;
				visibility: visible;
				overflow: visible;
				position: static;
				width: 16px;
				height: 29px;
				margin: -1px 2px 0 -1px;
				line-height: 30px;
				vertical-align: top;
			}

		}


	</style>
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/js/jindo2.all.js?rev=${revision}" charset="utf-8"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/js/jindo_component.js?rev=${revision}" charset="utf-8"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/js/SE2B_Configuration_Service.js?rev=${revision}" charset="utf-8"></script>	<!-- 설정 파일 -->
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/js/SE2B_Configuration_General.js?rev=${revision}" charset="utf-8"></script>	<!-- 설정 파일 -->
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/js/SE2BasicCreator.js?rev=${revision}" charset="utf-8"></script>

	<script src='${baseUrl}resources/js/vendors/smartEditor/js/smarteditor2.js?rev=${revision}' charset='utf-8'></script>
	<script src='${baseUrl}resources/js/vendors/smartEditor/photo_uploader/plugin/hp_SE2M_AttachQuickPhoto.js?rev=${revision}' charset='utf-8'></script>
</head>
<body>

<!-- SE2 Markup Start -->
<div id="smart_editor2" style="background-color:#fff;">
	<div id="smart_editor2_content"><a href="#se2_iframe" class="blind">${lang.textarea}</a>
		<div class="se2_tool" id="se2_tool">

			<div class="se2_text_tool husky_seditor_text_tool">
				<ul class="se2_font_type">
					<li class="husky_seditor_ui_fontName"><button type="button" class="se2_font_family" title="${lang.fonts}"><span class="husky_se2m_current_fontName">${lang.fonts}</span></button>
						<!-- 글꼴 레이어 -->
						<div class="se2_layer husky_se_fontName_layer">
							<div class="se2_in_layer">
								<ul class="se2_l_font_fam">
									<li style="display:none"><button type="button"><span>@DisplayName@<span>(</span><em style="font-family:FontFamily;">@SampleText@</em><span>)</span></span></button></li>
									<li class="se2_division husky_seditor_font_separator"></li>
								</ul>
							</div>
						</div>
						<!-- //글꼴 레이어 -->
					</li>

					<li class="husky_seditor_ui_fontSize"><button type="button" class="se2_font_size" title="${lang.textsize}"><span class="husky_se2m_current_fontSize">${lang.size}</span></button>
						<!-- 폰트 사이즈 레이어 -->
						<div class="se2_layer husky_se_fontSize_layer">
							<div class="se2_in_layer">
								<ul class="se2_l_font_size">
									<li><button type="button" style="height:19px;"><span style="margin-top:4px; margin-bottom:3px; margin-left:5px; font-size:7pt;">${lang.alphabet}<span style=" font-size:7pt;">(7pt)</span></span></button></li>
									<li><button type="button" style="height:20px;"><span style="margin-bottom:2px; font-size:8pt;">${lang.alphabet}<span style="font-size:8pt;">(8pt)</span></span></button></li>
									<li><button type="button" style="height:20px;"><span style="margin-bottom:1px; font-size:9pt;">${lang.alphabet}<span style="font-size:9pt;">(9pt)</span></span></button></li>
									<li><button type="button" style="height:21px;"><span style="margin-bottom:1px; font-size:10pt;">${lang.alphabet}<span style="font-size:10pt;">(10pt)</span></span></button></li>
									<li><button type="button" style="height:23px;"><span style="margin-bottom:2px; font-size:11pt;">${lang.alphabet}<span style="font-size:11pt;">(11pt)</span></span></button></li>
									<li><button type="button" style="height:25px;"><span style="margin-bottom:1px; font-size:12pt;">${lang.alphabet}<span style="font-size:12pt;">(12pt)</span></span></button></li>
									<li><button type="button" style="height:27px;"><span style="margin-bottom:2px; font-size:14pt;">${lang.alphabet}<span style="margin-left:6px;font-size:14pt;">(14pt)</span></span></button></li>
									<li><button type="button" style="height:33px;"><span style="margin-bottom:1px; font-size:18pt;">${lang.ganadarama}<span style="margin-left:8px;font-size:18pt;">(18pt)</span></span></button></li>
									<li><button type="button" style="height:39px;"><span style="margin-left:3px; font-size:24pt;">${lang.ganada}<span style="margin-left:11px;font-size:24pt;">(24pt)</span></span></button></li>
									<li><button type="button" style="height:53px;"><span style="margin-top:-1px; margin-left:3px; font-size:36pt;">${lang.ga}<span style="font-size:36pt;">(36pt)</span></span></button></li>
								</ul>
							</div>
						</div>
						<!-- //폰트 사이즈 레이어 -->
					</li>
				</ul><ul>
				<li class="husky_seditor_ui_bold first_child"><button type="button" title="${lang.bold}[Ctrl+B]" class="se2_bold"><span class="_buttonRound tool_bg">${lang.bold}[Ctrl+B]</span></button></li>

				<li class="se2_pair husky_seditor_ui_fontColor"><span class="selected_color husky_se2m_fontColor_lastUsed" style="background-color:#4477f9"></span><span class="husky_seditor_ui_fontColorA"><button type="button" title="${lang.textColor}" class="se2_fcolor"><span>${lang.textColor}</span></button></span><span class="husky_seditor_ui_fontColorB"><button type="button" title="${lang.more}" class="se2_fcolor_more"><span class="_buttonRound">${lang.more}</span></button></span>
					<!-- 글자색 -->
					<div class="se2_layer husky_se2m_fontcolor_layer" style="display:none">
						<div class="se2_in_layer husky_se2m_fontcolor_paletteHolder">
							<div class="se2_palette husky_se2m_color_palette">
								<ul class="se2_pick_color">
									<li><button type="button" title="#ff0000" style="background:#ff0000"><span><span>#ff0000</span></span></button></li>
									<li><button type="button" title="#ff6c00" style="background:#ff6c00"><span><span>#ff6c00</span></span></button></li>
									<li><button type="button" title="#ffaa00" style="background:#ffaa00"><span><span>#ffaa00</span></span></button></li>
									<li><button type="button" title="#ffef00" style="background:#ffef00"><span><span>#ffef00</span></span></button></li>
									<li><button type="button" title="#a6cf00" style="background:#a6cf00"><span><span>#a6cf00</span></span></button></li>
									<li><button type="button" title="#009e25" style="background:#009e25"><span><span>#009e25</span></span></button></li>
									<li><button type="button" title="#00b0a2" style="background:#00b0a2"><span><span>#00b0a2</span></span></button></li>
									<li><button type="button" title="#0075c8" style="background:#0075c8"><span><span>#0075c8</span></span></button></li>
									<li><button type="button" title="#3a32c3" style="background:#3a32c3"><span><span>#3a32c3</span></span></button></li>
									<li><button type="button" title="#7820b9" style="background:#7820b9"><span><span>#7820b9</span></span></button></li>
									<li><button type="button" title="#ef007c" style="background:#ef007c"><span><span>#ef007c</span></span></button></li>
									<li><button type="button" title="#000000" style="background:#000000"><span><span>#000000</span></span></button></li>
									<li><button type="button" title="#252525" style="background:#252525"><span><span>#252525</span></span></button></li>
									<li><button type="button" title="#464646" style="background:#464646"><span><span>#464646</span></span></button></li>
									<li><button type="button" title="#636363" style="background:#636363"><span><span>#636363</span></span></button></li>
									<li><button type="button" title="#7d7d7d" style="background:#7d7d7d"><span><span>#7d7d7d</span></span></button></li>
									<li><button type="button" title="#9a9a9a" style="background:#9a9a9a"><span><span>#9a9a9a</span></span></button></li>
									<li><button type="button" title="#ffe8e8" style="background:#ffe8e8"><span><span>#9a9a9a</span></span></button></li>
									<li><button type="button" title="#f7e2d2" style="background:#f7e2d2"><span><span>#f7e2d2</span></span></button></li>
									<li><button type="button" title="#f5eddc" style="background:#f5eddc"><span><span>#f5eddc</span></span></button></li>
									<li><button type="button" title="#f5f4e0" style="background:#f5f4e0"><span><span>#f5f4e0</span></span></button></li>
									<li><button type="button" title="#edf2c2" style="background:#edf2c2"><span><span>#edf2c2</span></span></button></li>
									<li><button type="button" title="#def7e5" style="background:#def7e5"><span><span>#def7e5</span></span></button></li>
									<li><button type="button" title="#d9eeec" style="background:#d9eeec"><span><span>#d9eeec</span></span></button></li>
									<li><button type="button" title="#c9e0f0" style="background:#c9e0f0"><span><span>#c9e0f0</span></span></button></li>
									<li><button type="button" title="#d6d4eb" style="background:#d6d4eb"><span><span>#d6d4eb</span></span></button></li>
									<li><button type="button" title="#e7dbed" style="background:#e7dbed"><span><span>#e7dbed</span></span></button></li>
									<li><button type="button" title="#f1e2ea" style="background:#f1e2ea"><span><span>#f1e2ea</span></span></button></li>
									<li><button type="button" title="#acacac" style="background:#acacac"><span><span>#acacac</span></span></button></li>
									<li><button type="button" title="#c2c2c2" style="background:#c2c2c2"><span><span>#c2c2c2</span></span></button></li>
									<li><button type="button" title="#cccccc" style="background:#cccccc"><span><span>#cccccc</span></span></button></li>
									<li><button type="button" title="#e1e1e1" style="background:#e1e1e1"><span><span>#e1e1e1</span></span></button></li>
									<li><button type="button" title="#ebebeb" style="background:#ebebeb"><span><span>#ebebeb</span></span></button></li>
									<li><button type="button" title="#ffffff" style="background:#ffffff"><span><span>#ffffff</span></span></button></li>
								</ul>
								<ul class="se2_pick_color" style="width:156px;">
									<li><button type="button" title="#e97d81" style="background:#e97d81"><span><span>#e97d81</span></span></button></li>
									<li><button type="button" title="#e19b73" style="background:#e19b73"><span><span>#e19b73</span></span></button></li>
									<li><button type="button" title="#d1b274" style="background:#d1b274"><span><span>#d1b274</span></span></button></li>
									<li><button type="button" title="#cfcca2" style="background:#cfcca2"><span><span>#cfcca2</span></span></button></li>
									<li><button type="button" title="#cfcca2" style="background:#cfcca2"><span><span>#cfcca2</span></span></button></li>
									<li><button type="button" title="#61b977" style="background:#61b977"><span><span>#61b977</span></span></button></li>
									<li><button type="button" title="#53aea8" style="background:#53aea8"><span><span>#53aea8</span></span></button></li>
									<li><button type="button" title="#518fbb" style="background:#518fbb"><span><span>#518fbb</span></span></button></li>
									<li><button type="button" title="#6a65bb" style="background:#6a65bb"><span><span>#6a65bb</span></span></button></li>
									<li><button type="button" title="#9a54ce" style="background:#9a54ce"><span><span>#9a54ce</span></span></button></li>
									<li><button type="button" title="#e573ae" style="background:#e573ae"><span><span>#e573ae</span></span></button></li>
									<li><button type="button" title="#5a504b" style="background:#5a504b"><span><span>#5a504b</span></span></button></li>
									<li><button type="button" title="#767b86" style="background:#767b86"><span><span>#767b86</span></span></button></li>
									<li><button type="button" title="#951015" style="background:#951015"><span><span>#951015</span></span></button></li>
									<li><button type="button" title="#6e391a" style="background:#6e391a"><span><span>#6e391a</span></span></button></li>
									<li><button type="button" title="#785c25" style="background:#785c25"><span><span>#785c25</span></span></button></li>
									<li><button type="button" title="#5f5b25" style="background:#5f5b25"><span><span>#5f5b25</span></span></button></li>
									<li><button type="button" title="#4c511f" style="background:#4c511f"><span><span>#4c511f</span></span></button></li>
									<li><button type="button" title="#1c4827" style="background:#1c4827"><span><span>#1c4827</span></span></button></li>
									<li><button type="button" title="#0d514c" style="background:#0d514c"><span><span>#0d514c</span></span></button></li>
									<li><button type="button" title="#1b496a" style="background:#1b496a"><span><span>#1b496a</span></span></button></li>
									<li><button type="button" title="#2b285f" style="background:#2b285f"><span><span>#2b285f</span></span></button></li>
									<li><button type="button" title="#45245b" style="background:#45245b"><span><span>#45245b</span></span></button></li>
									<li><button type="button" title="#721947" style="background:#721947"><span><span>#721947</span></span></button></li>
									<li><button type="button" title="#352e2c" style="background:#352e2c"><span><span>#352e2c</span></span></button></li>
									<li><button type="button" title="#3c3f45" style="background:#3c3f45"><span><span>#3c3f45</span></span></button></li>
								</ul>
								<button type="button" title="${lang.more}" class="se2_view_more husky_se2m_color_palette_more_btn"><span>${lang.more}</span></button>
								<div class="husky_se2m_color_palette_recent" style="display:none">
									<h4>${lang.recentlyUseColors}</h4>
									<ul class="se2_pick_color">
										<li></li>
										<!-- 최근 사용한 색 템플릿 -->
										<!-- <li><button type="button" title="#e97d81" style="background:#e97d81"><span><span>#e97d81</span></span></button></li> -->
										<!-- //최근 사용한 색 템플릿 -->
									</ul>
								</div>
								<div class="se2_palette2 husky_se2m_color_palette_colorpicker">
									<!--form action="http://test.emoticon.naver.com/colortable/TextAdd.nhn" method="post"-->
									<div class="se2_color_set">
										<span class="se2_selected_color"><span class="husky_se2m_cp_preview" style="background:#e97d81"></span></span><input type="text" name="" class="input_ty1 husky_se2m_cp_colorcode" value="#e97d81"><button type="button" class="se2_btn_insert husky_se2m_color_palette_ok_btn" title="${lang.input}"><span>${lang.input}</span></button></div>
									<!--input type="hidden" name="callback" value="http://test.emoticon.naver.com/colortable/result.jsp" />
                                    <input type="hidden" name="callback_func" value="1" />
                                    <input type="hidden" name="text_key" value="" />
                                    <input type="hidden" name="text_data" value="" />
                                </form-->
									<div class="se2_gradation1 husky_se2m_cp_colpanel"></div>
									<div class="se2_gradation2 husky_se2m_cp_huepanel"></div>
								</div>
							</div>
						</div>
					</div>
					<!-- //글자색 -->
				</li>
				<li class="se2_pair husky_seditor_ui_BGColor last_child"><span class="selected_color husky_se2m_BGColor_lastUsed" style="background-color:#4477f9"></span><span class="husky_seditor_ui_BGColorA"><button type="button" title="${lang.backgroundColor}" class="se2_bgcolor"><span>${lang.backgroundColor}</span></button></span><span class="husky_seditor_ui_BGColorB"><button type="button" title="${lang.more}" class="se2_bgcolor_more"><span class="_buttonRound tool_bg">${lang.more}</span></button></span>
					<!-- 배경색 -->
					<div class="se2_layer se2_layer husky_se2m_BGColor_layer" style="display:none">
						<div class="se2_in_layer">
							<div class="se2_palette_bgcolor">
								<ul class="se2_background husky_se2m_bgcolor_list">
									<li><button type="button" title="${lang.backgroundColor}#ff0000 ${lang.textColor}#ffffff" style="background:#ff0000; color:#ffffff"><span><span>${lang.ganada}</span></span></button></li>
									<li><button type="button" title="${lang.backgroundColor}#6d30cf ${lang.textColor}#ffffff" style="background:#6d30cf; color:#ffffff"><span><span>${lang.ganada}</span></span></button></li>
									<li><button type="button" title="${lang.backgroundColor}#000000 ${lang.textColor}#ffffff" style="background:#000000; color:#ffffff"><span><span>${lang.ganada}</span></span></button></li>
									<li><button type="button" title="${lang.backgroundColor}#ff6600 ${lang.textColor}#ffffff" style="background:#ff6600; color:#ffffff"><span><span>${lang.ganada}</span></span></button></li>
									<li><button type="button" title="${lang.backgroundColor}#3333cc ${lang.textColor}#ffffff" style="background:#3333cc; color:#ffffff"><span><span>${lang.ganada}</span></span></button></li>
									<li><button type="button" title="${lang.backgroundColor}#333333 ${lang.textColor}#ffff00" style="background:#333333; color:#ffff00"><span><span>${lang.ganada}</span></span></button></li>
									<li><button type="button" title="${lang.backgroundColor}#ffa700 ${lang.textColor}#ffffff" style="background:#ffa700; color:#ffffff"><span><span>${lang.ganada}</span></span></button></li>
									<li><button type="button" title="${lang.backgroundColor}#009999 ${lang.textColor}#ffffff" style="background:#009999; color:#ffffff"><span><span>${lang.ganada}</span></span></button></li>
									<li><button type="button" title="${lang.backgroundColor}#8e8e8e ${lang.textColor}#ffffff" style="background:#8e8e8e; color:#ffffff"><span><span>${lang.ganada}</span></span></button></li>
									<li><button type="button" title="${lang.backgroundColor}#cc9900 ${lang.textColor}#ffffff" style="background:#cc9900; color:#ffffff"><span><span>${lang.ganada}</span></span></button></li>
									<li><button type="button" title="${lang.backgroundColor}#77b02b ${lang.textColor}#ffffff" style="background:#77b02b; color:#ffffff"><span><span>${lang.ganada}</span></span></button></li>
									<li><button type="button" title="${lang.backgroundColor}#ffffff ${lang.textColor}#000000" style="background:#ffffff; color:#000000"><span><span>${lang.ganada}</span></span></button></li>
								</ul>
							</div>
							<div class="husky_se2m_BGColor_paletteHolder"></div>
						</div>
					</div>
					<!-- //배경색 -->
				</li>
			</ul><ul class="tool_4">
				<li class="husky_seditor_ui_hyperlink first_child"><button type="button" title="${lang.link}" class="se2_url"><span class="_buttonRound tool_bg">${lang.link}</span></button>
					<!-- 링크 -->
					<div class="se2_layer" style="margin-left:-285px">
						<div class="se2_in_layer">
							<div class="se2_url2">
								<input type="text" class="input_ty1" value="http://">
								<button type="button" class="se2_apply"><span>${lang.apply}</span></button><button type="button" class="se2_cancel"><span>${lang.cancel}</span></button>
							</div>
						</div>
					</div>
					<!-- //링크 -->
				</li>

				<li class="husky_seditor_ui_table"><button type="button" title="${lang.table}" class="se2_table"><span class="_buttonRound">${lang.table}</span></button>
					<!--@lazyload_html create_table-->
					<!-- 표 -->
					<div class="se2_layer husky_se2m_table_layer" style="margin-left:-171px">
						<div class="se2_in_layer">
							<div class="se2_table_set">
								<fieldset>
									<legend>${lang.specifyCells}</legend>
									<dl class="se2_cell_num">
										<dt><label for="row">${lang.row}</label></dt>
										<dd><input id="row" name="" type="text" maxlength="2" value="4" class="input_ty2">
											<button type="button" class="se2_add"><span>${lang.addOneRow}</span></button>
											<button type="button" class="se2_del"><span>${lang.deleteOneRow}</span></button>
										</dd>
										<dt><label for="col">${lang.column}</label></dt>
										<dd><input id="col" name="" type="text" maxlength="2" value="4" class="input_ty2">
											<button type="button" class="se2_add"><span>${lang.addOneColumn}</span></button>
											<button type="button" class="se2_del"><span>${lang.deleteOneColumn}</span></button>
										</dd>
									</dl>
									<table border="0" cellspacing="1" class="se2_pre_table husky_se2m_table_preview">
										<tr>
											<td>&nbsp;</td>
											<td>&nbsp;</td>
											<td>&nbsp;</td>
											<td>&nbsp;</td>
										</tr>
										<tr>
											<td>&nbsp;</td>
											<td>&nbsp;</td>
											<td>&nbsp;</td>
											<td>&nbsp;</td>
										</tr>
										<tr>
											<td>&nbsp;</td>
											<td>&nbsp;</td>
											<td>&nbsp;</td>
											<td>&nbsp;</td>
										</tr>
									</table>
								</fieldset>
								<fieldset>
									<legend>${lang.directInputProperties}</legend>
									<dl class="se2_t_proper1">
										<dt><input type="radio" id="se2_tbp1" name="se2_tbp" checked><label for="se2_tbp1">${lang.directInputProperties}</label></dt>
										<dd>
											<dl class="se2_t_proper1_1">
										<dt><label>${lang.tableStyle}</label></dt>
										<dd><div class="se2_select_ty1"><span class="se2_b_style3 husky_se2m_table_border_style_preview"></span><button type="button" title="${lang.more}" class="se2_view_more"><span>${lang.more}</span></button></div>
											<!-- 레이어 : 테두리스타일 -->
											<div class="se2_layer_b_style husky_se2m_table_border_style_layer" style="display:none">
												<ul>
													<li><button type="button" class="se2_b_style1"><span class="se2m_no_border">${lang.noBorder}</span></button></li>
													<li><button type="button" class="se2_b_style2"><span><span>${lang.border02}</span></span></button></li>
													<li><button type="button" class="se2_b_style3"><span><span>${lang.border03}</span></span></button></li>
													<li><button type="button" class="se2_b_style4"><span><span>${lang.border04}</span></span></button></li>
													<li><button type="button" class="se2_b_style5"><span><span>${lang.border05}</span></span></button></li>
													<li><button type="button" class="se2_b_style6"><span><span>${lang.border06}</span></span></button></li>
													<li><button type="button" class="se2_b_style7"><span><span>${lang.border07}</span></span></button></li>
												</ul>
											</div>
											<!-- //레이어 : 테두리스타일 -->
										</dd>
									</dl>
									<dl class="se2_t_proper1_1 se2_t_proper1_2">
										<dt><label for="se2_b_width">${lang.borderThickness}</label></dt>
										<dd><input id="se2_b_width" name="" type="text" maxlength="2" value="1" class="input_ty1">
											<button type="button" title="1px ${lang.plus}" class="se2_add se2m_incBorder"><span>1px ${lang.plus}</span></button>
											<button type="button" title="1px ${lang.subtraction}" class="se2_del se2m_decBorder"><span>1px ${lang.subtraction}</span></button>
										</dd>
									</dl>
									<dl class="se2_t_proper1_1 se2_t_proper1_3">
										<dt><label for="se2_b_color">${lang.borderColor}</label></dt>
										<dd><input id="se2_b_color" name="" type="text" maxlength="7" value="#cccccc" class="input_ty3"><span class="se2_pre_color"><button type="button" style="background:#cccccc;"><span>${lang.findColor}</span></button></span>
											<!-- 레이어 : 테두리색 -->
											<div class="se2_layer se2_b_t_b1" style="clear:both;display:none;position:absolute;top:20px;left:-147px;">
												<div class="se2_in_layer husky_se2m_table_border_color_pallet">
												</div>
											</div>
											<!-- //레이어 : 테두리색-->
										</dd>
									</dl>
									<div class="se2_t_dim0"></div><!-- 테두리 없음일때 딤드레이어 -->
									<dl class="se2_t_proper1_1 se2_t_proper1_4">
										<dt><label for="se2_cellbg">${lang.cellBackgroudColor}</label></dt>
										<dd><input id="se2_cellbg" name="" type="text" maxlength="7" value="#ffffff" class="input_ty3"><span class="se2_pre_color"><button type="button" style="background:#ffffff;"><span>${lang.findColor}</span></button></span>
											<!-- 레이어 : 셀배경색 -->
											<div class="se2_layer se2_b_t_b1" style="clear:both;display:none;position:absolute;top:20px;left:-147px;">
												<div class="se2_in_layer husky_se2m_table_bgcolor_pallet">
												</div>
											</div>
											<!-- //레이어 : 셀배경색-->
										</dd>
									</dl>
									</dd>
									</dl>
								</fieldset>
								<fieldset>
									<legend>${lang.tableStyle}</legend>
									<dl class="se2_t_proper2">
										<dt><input type="radio" id="se2_tbp2" name="se2_tbp"><label for="se2_tbp2">${lang.selectStyle}</label></dt>
										<dd><div class="se2_select_ty2"><span class="se2_t_style1 husky_se2m_table_style_preview"></span><button type="button" title="${lang.more}" class="se2_view_more"><span>${lang.more}</span></button></div>
											<!-- 레이어 : 표템플릿선택 -->
											<div class="se2_layer_t_style husky_se2m_table_style_layer" style="display:none">
												<ul class="se2_scroll">
													<li><button type="button" class="se2_t_style1"><span>${lang.tableStyle01}</span></button></li>
													<li><button type="button" class="se2_t_style2"><span>${lang.tableStyle02}</span></button></li>
													<li><button type="button" class="se2_t_style3"><span>${lang.tableStyle03}</span></button></li>
													<li><button type="button" class="se2_t_style4"><span>${lang.tableStyle04}</span></button></li>
													<li><button type="button" class="se2_t_style5"><span>${lang.tableStyle05}</span></button></li>
													<li><button type="button" class="se2_t_style6"><span>${lang.tableStyle06}</span></button></li>
													<li><button type="button" class="se2_t_style7"><span>${lang.tableStyle07}</span></button></li>
													<li><button type="button" class="se2_t_style8"><span>${lang.tableStyle08}</span></button></li>
													<li><button type="button" class="se2_t_style9"><span>${lang.tableStyle09}</span></button></li>
													<li><button type="button" class="se2_t_style10"><span>${lang.tableStyle10}</span></button></li>
													<li><button type="button" class="se2_t_style11"><span>${lang.tableStyle11}</span></button></li>
													<li><button type="button" class="se2_t_style12"><span>${lang.tableStyle12}</span></button></li>
													<li><button type="button" class="se2_t_style13"><span>${lang.tableStyle13}</span></button></li>
													<li><button type="button" class="se2_t_style14"><span>${lang.tableStyle14}</span></button></li>
													<li><button type="button" class="se2_t_style15"><span>${lang.tableStyle15}</span></button></li>
													<li><button type="button" class="se2_t_style16"><span>${lang.tableStyle16}</span></button></li>
												</ul>
											</div>
											<!-- //레이어 : 표템플릿선택 -->
										</dd>
									</dl>
								</fieldset>
								<p class="se2_btn_area">
									<button type="button" class="se2_apply"><span>${lang.apply}</span></button><button type="button" class="se2_cancel"><span>${lang.cancel}</span></button>
								</p>
								<!-- 딤드레이어 -->
								<div class="se2_t_dim3"></div>
								<!-- //딤드레이어 -->
							</div>
						</div>
					</div>
					<!-- //표 -->
					<!--//@lazyload_html-->
				</li>

				<li class="husky_seditor_ui_findAndReplace last_child"><button type="button" title="${lang.findReplace}" class="se2_find"><span class="_buttonRound tool_bg">${lang.findReplace}</span></button>
					<!--@lazyload_html find_and_replace-->
					<!-- 찾기/바꾸기 -->
					<div class="se2_layer husky_se2m_findAndReplace_layer" style="margin-left:-238px;">
						<div class="se2_in_layer">
							<div class="se2_bx_find_revise">
								<button type="button" title="${lang.close}" class="se2_close husky_se2m_cancel"><span>${lang.close}</span></button>
								<h3>${lang.findReplace}</h3>
								<ul>
									<li class="active"><button type="button" class="se2_tabfind"><span>${lang.search}</span></button></li>
									<li><button type="button" class="se2_tabrevise"><span>바꾸기</span></button></li>
								</ul>
								<div class="se2_in_bx_find husky_se2m_find_ui" style="display:block">
									<dl>
										<dt><label for="find_word">${lang.wordsToFind}</label></dt><dd><input type="text" id="find_word" value="${lang.smarteditor}" class="input_ty1"></dd>
									</dl>
									<p class="se2_find_btns">
										<button type="button" class="se2_find_next husky_se2m_find_next"><span>${lang.findNext}</span></button><button type="button" class="se2_cancel husky_se2m_cancel"><span>${lang.cancel}</span></button>
									</p>
								</div>
								<div class="se2_in_bx_revise husky_se2m_replace_ui" style="display:none">
									<dl>
										<dt><label for="find_word2">${lang.wordsToFind}</label></dt><dd><input type="text" id="find_word2" value="${lang.smarteditor}" class="input_ty1"></dd>
										<dt><label for="revise_word">${lang.replaceWord}</label></dt><dd><input type="text" id="revise_word" value="${lang.smarteditor}" class="input_ty1"></dd>
									</dl>
									<p class="se2_find_btns">
										<button type="button" class="se2_find_next2 husky_se2m_replace_find_next"><span>${lang.findNext}</span></button><button type="button" class="se2_revise1 husky_se2m_replace"><span>바꾸기</span></button><button type="button" class="se2_revise2 husky_se2m_replace_all"><span>${lang.replaceAll}</span></button><button type="button" class="se2_cancel husky_se2m_cancel"><span>${lang.cancel}</span></button>
									</p>
								</div>
								<button type="button" title="${lang.close}" class="se2_close husky_se2m_cancel"><span>${lang.close}</span></button>
							</div>
						</div>
					</div>
					<!-- //찾기/바꾸기 -->
					<!--//@lazyload_html-->
				</li>
			</ul>
				<!-- ul class="se2_multy">
					<li class="se2_mn husky_seditor_ui_photo_attach"><button type="button" class="se2_photo ico_btn"><span class="se2_icon"></span><span class="se2_mntxt">${lang.photo}<span class="se2_new"></span></span></button></li>
				</ul-->
				<ul class="se2_multy">
					<li class="se2_mn husky_seditor_ui_photo_attach"><button type="button" class="se2_photo ico_btn"><span class="se2_icon notMail" title="${lang.photo}"></span><span class="se2_mntxt notMail">사진<span class="se2_new notMail"></span></span></button></li>
				</ul>
			</div>
			<!-- //704이상 -->
		</div>

		<!-- 접근성 도움말 레이어 -->
		<div class="se2_layer se2_accessibility" style="display:none;">
			<div class="se2_in_layer">
				<button type="button" title="${lang.close}" class="se2_close"><span>${lang.close}</span></button>
				<h3><strong>${lang.accessibilityHelp}</strong></h3>
				<div class="box_help">
					<div>
						<strong>${lang.toolbar}</strong>
						<p>${lang.helpShortcuts}</p>
						<strong>${lang.exit}</strong>
						<p>${lang.helpMovePreNext}</p>
						<strong>${lang.commandShortcuts}</strong>
						<ul>
							<li>CTRL+B <span>${lang.bold}</span></li>
							<li>SHIFT+TAB <span>${lang.oriel}</span></li>
							<li>CTRL+U <span>${lang.underscore}</span></li>
							<li>CTRL+F <span>${lang.search}</span></li>
							<li>CTRL+I <span>${lang.italicFont}</span></li>
							<li>CTRL+H <span>${lang.change}</span></li>
							<li>CTRL+D <span>${lang.strikethrough}</span></li>
							<li>CTRL+K <span>${lang.linking}</span></li>
							<li>TAB <span>${lang.indent}</span></li>
						</ul>
					</div>
				</div>
				<div class="se2_btns">
					<button type="button" class="se2_close2"><span>${lang.close}</span></button>
				</div>
			</div>
		</div>
		<!-- //접근성 도움말 레이어 -->

		<hr>
		<!-- 입력 -->
		<div class="se2_input_area husky_seditor_editing_area_container" id="iframeWrap">


			<iframe src="about:blank" id="se2_iframe" name="se2_iframe" class="se2_input_wysiwyg" width="400" height="300" title="${lang.helpTextarea}" frameborder="0" style="display:block;"></iframe>
			<textarea name="" rows="10" cols="100" title="${lang.htmlEditingMode}" class="se2_input_syntax se2_input_htmlsrc" style="display:none;outline-style:none;resize:none"> </textarea>
			<textarea name="" rows="10" cols="100" title="${lang.textEditingMode}" class="se2_input_syntax se2_input_text" style="display:none;outline-style:none;resize:none;"> </textarea>

			<!-- 입력창 조절 안내 레이어 -->
			<!-- div class="ly_controller husky_seditor_resize_notice" style="z-index:20;display:none;">
				<p>${lang.dragResizeArea}</p>
				<button type="button" title="${lang.close}" class="bt_clse"><span>${lang.close}</span></button>
				<span class="ic_arr"></span>
			</div-->
			<!-- //입력창 조절 안내 레이어 -->
			<div class="quick_wrap">
				<!-- 표/글양식 간단편집기 -->
				<!--@lazyload_html qe_table-->
				<div class="q_table_wrap" style="z-index: 150;">
					<button class="_fold se2_qmax q_open_table_full" style="position:absolute; display:none;top:340px;left:210px;z-index:30;" title="최대화" type="button"><span>${lang.maximizeQuickEditor}</span></button>
					<div class="_full se2_qeditor se2_table_set" style="position:absolute;display:none;top:135px;left:661px;z-index:30;">
						<div class="se2_qbar q_dragable"><span class="se2_qmini"><button title="${lang.minimize}" class="q_open_table_fold"><span>${lang.search}</span></button></span></div>
						<div class="se2_qbody0">
							<div class="se2_qbody">
								<dl class="se2_qe1">
									<dt>${lang.insert}</dt><dd><button class="se2_addrow" title="${lang.insertRow}" type="button"><span>${lang.insertRow}</span></button><button class="se2_addcol" title="${lang.insertColumn}" type="button"><span>${lang.insertColumn}</span></button></dd>
									<dt>${lang.split}</dt><dd><button class="se2_seprow" title="${lang.splitRow}" type="button"><span>${lang.splitRow}</span></button><button class="se2_sepcol" title="${lang.splitColumn}" type="button"><span>${lang.splitColumn}</span></button></dd>

									<dt>${lang.delete}</dt><dd><button class="se2_delrow" title="${lang.deleteRow}" type="button"><span>${lang.deleteRow}</span></button><button class="se2_delcol" title="${lang.deleteColumn}" type="button"><span>${lang.deleteColumn}</span></button></dd>
									<dt>${lang.merge}</dt><dd><button class="se2_merrow" title="${lang.mergeRows}" type="button"><span>${lang.mergeRows}</span></button></dd>
								</dl>
								<div class="se2_qe2 se2_qe2_3"> <!-- 테이블 퀵에디터의 경우만,  se2_qe2_3제거 -->
									<!-- 샐배경색 -->
									<dl class="se2_qe2_1">

										<dt><input type="radio" checked="checked" name="se2_tbp3" id="se2_cellbg2" class="husky_se2m_radio_bgc"><label for="se2_cellbg2">${lang.cellBackgroudColor}</label></dt>
										<dd><span class="se2_pre_color"><button style="background: none repeat scroll 0% 0% rgb(255, 255, 255);" type="button" class="husky_se2m_table_qe_bgcolor_btn"><span>${lang.findColor}</span></button></span>
											<!-- layer:셀배경색 -->
											<div style="display:none;position:absolute;top:20px;left:0px;" class="se2_layer se2_b_t_b1">
												<div class="se2_in_layer husky_se2m_tbl_qe_bg_paletteHolder">
												</div>
											</div>
											<!-- //layer:셀배경색-->

										</dd>
									</dl>
									<!-- //샐배경색 -->
									<!-- 배경이미지선택 -->
									<dl style="display: none;" class="se2_qe2_2 husky_se2m_tbl_qe_review_bg">
										<dt><input type="radio" name="se2_tbp3" id="se2_cellbg3" class="husky_se2m_radio_bgimg"><label for="se2_cellbg3">${lang.image}</label></dt>
										<dd><span class="se2_pre_bgimg"><button class="husky_se2m_table_qe_bgimage_btn se2_cellimg0" type="button"><span>배경이미지선택</span></button></span>
											<!-- layer:배경이미지선택 -->
											<div style="display:none;position:absolute;top:20px;left:-155px;" class="se2_layer se2_b_t_b1">
												<div class="se2_in_layer husky_se2m_tbl_qe_bg_img_paletteHolder">
													<ul class="se2_cellimg_set">
														<li><button class="se2_cellimg0" type="button"><span>배경없음</span></button></li>
														<li><button class="se2_cellimg1" type="button"><span>배경1</span></button></li>
														<li><button class="se2_cellimg2" type="button"><span>배경2</span></button></li>
														<li><button class="se2_cellimg3" type="button"><span>배경3</span></button></li>
														<li><button class="se2_cellimg4" type="button"><span>배경4</span></button></li>
														<li><button class="se2_cellimg5" type="button"><span>배경5</span></button></li>
														<li><button class="se2_cellimg6" type="button"><span>배경6</span></button></li>
														<li><button class="se2_cellimg7" type="button"><span>배경7</span></button></li>
														<li><button class="se2_cellimg8" type="button"><span>배경8</span></button></li>
														<li><button class="se2_cellimg9" type="button"><span>배경9</span></button></li>
														<li><button class="se2_cellimg10" type="button"><span>배경10</span></button></li>
														<li><button class="se2_cellimg11" type="button"><span>배경11</span></button></li>
														<li><button class="se2_cellimg12" type="button"><span>배경12</span></button></li>
														<li><button class="se2_cellimg13" type="button"><span>배경13</span></button></li>
														<li><button class="se2_cellimg14" type="button"><span>배경14</span></button></li>
														<li><button class="se2_cellimg15" type="button"><span>배경15</span></button></li>
														<li><button class="se2_cellimg16" type="button"><span>배경16</span></button></li>
														<li><button class="se2_cellimg17" type="button"><span>배경17</span></button></li>
														<li><button class="se2_cellimg18" type="button"><span>배경18</span></button></li>
														<li><button class="se2_cellimg19" type="button"><span>배경19</span></button></li>
														<li><button class="se2_cellimg20" type="button"><span>배경20</span></button></li>
														<li><button class="se2_cellimg21" type="button"><span>배경21</span></button></li>
														<li><button class="se2_cellimg22" type="button"><span>배경22</span></button></li>
														<li><button class="se2_cellimg23" type="button"><span>배경23</span></button></li>
														<li><button class="se2_cellimg24" type="button"><span>배경24</span></button></li>
														<li><button class="se2_cellimg25" type="button"><span>배경25</span></button></li>
														<li><button class="se2_cellimg26" type="button"><span>배경26</span></button></li>
														<li><button class="se2_cellimg27" type="button"><span>배경27</span></button></li>
														<li><button class="se2_cellimg28" type="button"><span>배경28</span></button></li>
														<li><button class="se2_cellimg29" type="button"><span>배경29</span></button></li>
														<li><button class="se2_cellimg30" type="button"><span>배경30</span></button></li>
														<li><button class="se2_cellimg31" type="button"><span>배경31</span></button></li>
													</ul>
												</div>
											</div>
											<!-- //layer:배경이미지선택-->
										</dd>
									</dl>
									<!-- //배경이미지선택 -->
								</div>
								<dl style="display: block;" class="se2_qe3 se2_t_proper2">
									<dt><input type="radio" name="se2_tbp3" id="se2_tbp4" class="husky_se2m_radio_template"><label for="se2_tbp4">${lang.tableStyle}</label></dt>
									<dd>
										<div class="se2_qe3_table">
											<div class="se2_select_ty2"><span class="se2_t_style1"></span><button class="se2_view_more husky_se2m_template_more" title="${lang.more}" type="button"><span>${lang.more}</span></button></div>
											<!-- layer:표스타일 -->
											<div style="display:none;top:33px;left:0;margin:0;" class="se2_layer_t_style">
												<ul>
													<li><button class="se2_t_style1" type="button"><span>${lang.tableStyle01}</span></button></li>
													<li><button class="se2_t_style2" type="button"><span>${lang.tableStyle02}</span></button></li>
													<li><button class="se2_t_style3" type="button"><span>${lang.tableStyle03}</span></button></li>
													<li><button class="se2_t_style4" type="button"><span>${lang.tableStyle04}</span></button></li>
													<li><button class="se2_t_style5" type="button"><span>${lang.tableStyle05}</span></button></li>
													<li><button class="se2_t_style6" type="button"><span>${lang.tableStyle06}</span></button></li>
													<li><button class="se2_t_style7" type="button"><span>${lang.tableStyle07}</span></button></li>
													<li><button class="se2_t_style8" type="button"><span>${lang.tableStyle08}</span></button></li>
													<li><button class="se2_t_style9" type="button"><span>${lang.tableStyle09}</span></button></li>
													<li><button class="se2_t_style10" type="button"><span>${lang.tableStyle10}</span></button></li>
													<li><button class="se2_t_style11" type="button"><span>${lang.tableStyle11}</span></button></li>
													<li><button class="se2_t_style12" type="button"><span>${lang.tableStyle12}</span></button></li>
													<li><button class="se2_t_style13" type="button"><span>${lang.tableStyle13}</span></button></li>
													<li><button class="se2_t_style14" type="button"><span>${lang.tableStyle14}</span></button></li>
													<li><button class="se2_t_style15" type="button"><span>${lang.tableStyle15}</span></button></li>
													<li><button class="se2_t_style16" type="button"><span>${lang.tableStyle16}</span></button></li>
												</ul>
											</div>
											<!-- //layer:표스타일 -->
										</div>
									</dd>
								</dl>
								<div style="display:none" class="se2_btn_area">
									<button class="se2_btn_save" type="button"><span>My 리뷰저장</span></button>
								</div>
								<div class="se2_qdim0 husky_se2m_tbl_qe_dim1"></div>
								<div class="se2_qdim4 husky_se2m_tbl_qe_dim2"></div>
								<div class="se2_qdim6c husky_se2m_tbl_qe_dim_del_col"></div>
								<div class="se2_qdim6r husky_se2m_tbl_qe_dim_del_row"></div>
							</div>
						</div>
					</div>
				</div>
				<!--//@lazyload_html-->
				<!-- //표/글양식 간단편집기 -->
				<!-- 이미지 간단편집기 -->
				<!--@lazyload_html qe_image-->
				<div class="q_img_wrap">
					<button class="_fold se2_qmax q_open_img_full" style="position:absolute;display:none;top:240px;left:210px;z-index:30;" title="최대화" type="button"><span>${lang.maximizeQuickEditor}</span></button>
					<div class="_full se2_qeditor se2_table_set" style="position:absolute;display:none;top:140px;left:450px;z-index:30;">
						<div class="se2_qbar  q_dragable"><span class="se2_qmini"><button title="${lang.minimize}" class="q_open_img_fold"><span>${lang.search}</span></button></span></div>
						<div class="se2_qbody0">
							<div class="se2_qbody">
								<div class="se2_qe10">
									<label for="se2_swidth">가로</label><input type="text" class="input_ty1 widthimg" name="" id="se2_swidth" value="1024"><label class="se2_sheight" for="se2_sheight">세로</label><input type="text" class="input_ty1 heightimg" name="" id="se2_sheight" value="768"><button class="se2_sreset" type="button"><span>초기화</span></button>
									<div class="se2_qe10_1"><input type="checkbox" name="" class="se2_srate" id="se2_srate"><label for="se2_srate">가로 세로 비율 유지</label></div>
								</div>
								<div class="se2_qe11">
									<dl class="se2_qe11_1">
										<dt><label for="se2_b_width2">${lang.borderThickness}</label></dt>
										<dd class="se2_numberStepper"><input type="text" class="input_ty1 input bordersize" value="1" maxlength="2" name="" id="se2_b_width2" readonly="readonly">
											<button class="se2_add plus" type="button"><span>1px ${lang.plus}</span></button>
											<button class="se2_del minus" type="button"><span>1px ${lang.subtraction}</span></button>
										</dd>
									</dl>

									<dl class="se2_qe11_2">
										<dt>테두리 색</dt>
										<dd><span class="se2_pre_color"><button style="background:#000000;" type="button" class="husky_se2m_img_qe_bgcolor_btn"><span>${lang.findColor}</span></button></span>
											<!-- layer:테두리 색 -->
											<div style="display:none;position:absolute;top:20px;left:-209px;" class="se2_layer se2_b_t_b1">
												<div class="se2_in_layer husky_se2m_img_qe_bg_paletteHolder">
												</div>
											</div>
											<!-- //layer:테두리 색 -->
										</dd>
									</dl>
								</div>
								<dl class="se2_qe12">
									<dt>정렬</dt>
									<dd><button title="${lang.noSorting}" class="se2_align0" type="button"><span>${lang.noSorting}</span></button><button title="좌측정렬" class="se2_align1 left" type="button"><span>좌측정렬</span></button><button title="우측정렬" class="se2_align2 right" type="button"><span>우측정렬</span></button>
									</dd>
								</dl>
								<button class="se2_highedit" type="button"><span>${lang.advancedEditing}</span></button>
								<div class="se2_qdim0"></div>
							</div>
						</div>
					</div>
				</div>
				<!--//@lazyload_html-->
				<!-- 이미지 간단편집기 -->
			</div>
		</div>
		<!-- //입력 -->
		<!-- 입력창조절/ 모드전환 -->
		<div class="se2_conversion_mode">
			<button type="button" class="se2_inputarea_controller husky_seditor_editingArea_verticalResizer" title="${lang.resizeWindow}"><span>${lang.resizeWindow}</span></button>
			<ul class="se2_converter">
				<li class="active"><button type="button" class="se2_to_editor"><span>Editor</span></button></li>
				<li><button type="button" class="se2_to_html"><span>HTML</span></button></li>
				<li style="display:none"><button type="button" class="se2_to_text"><span>TEXT</span></button></li>
			</ul>
		</div>
		<!-- //입력창조절/ 모드전환 -->
		<hr>

	</div>
</div>
<!-- SE2 Markup End -->


</body>
<script>
	var ua = window.navigator.userAgent.toLowerCase();
	if(ua.indexOf("ipad") > -1){
		document.getElementById("iframeWrap").style.overflow = "scroll";
		document.getElementById("iframeWrap").style.webkitOverflowScrolling = "touch";
		document.getElementById("se2_iframe").style.overflow = "hidden";
	}
</script>
</html>
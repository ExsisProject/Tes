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

	<link href="${baseUrl}resources/js/vendors/smartEditor/css/smart_editor2.css?rev=${revision}" rel="stylesheet" type="text/css">
	<link href="${baseUrl}resources/js/vendors/smartEditor/css/smart_editor2_${locale}.css?rev=${revision}" rel="stylesheet" type="text/css">
	<link href="${baseUrl}resources/js/vendors/smartEditor/css/pallet.css?rev=${revision}" rel="stylesheet" type="text/css">
	<style type="text/css">
		body { margin: 10px; }
	</style>
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/js/jindo2.all.js?rev=${revision}" charset="utf-8"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/js/jindo_component.js?rev=${revision}" charset="utf-8"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/js/SE2B_Configuration_Service.js?rev=${revision}" charset="utf-8"></script>  <!-- 설정 파일 -->
	<!-- 관리자 사이트의 결재양식에서 스크롤이 2개 나타나는 현상때문에 에디터의 양식 템플릿이 별도로 존재해야함. -->
	<c:if test="${'Y' eq approvalAdmin}">
		<script>
			nhn.husky.SE2M_Configuration.SE_EditingAreaManager.sBlankPageURL_EmulateIE7 = window.goContext + "resources/js/vendors/smartEditor/smart_editor2_inputarea_ie8_appr_admin.html";
		</script>
	</c:if>
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/js/SE2B_Configuration_General.js?rev=${revision}" charset="utf-8"></script>  <!-- 설정 파일 -->
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/js/SE2BasicCreator.js?rev=${revision}" charset="utf-8"></script>

	<script src='${baseUrl}resources/js/vendors/smartEditor/js/smarteditor2.js?rev=${revision}' charset='utf-8'></script>
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/plugins/hp_SE_InitPallet.js?rev=${revision}" charset="utf-8"></script>
	<script type="text/javascript" src="${baseUrl}resources/js/vendors/smartEditor/plugins/hp_SE_FormEditor.js?rev=${revision}" charset="utf-8"></script>
	<script src='${baseUrl}resources/js/vendors/smartEditor/photo_uploader/plugin/hp_SE2M_AttachQuickPhoto.js?rev=${revision}' charset='utf-8'></script>
</head>
<body>

<!-- SE2 Markup Start -->
<div id="smart_editor2">
	<!--  보고서용 에디터 팔레트 -->
	<div id="nomalPallet" class="pallet formeditorLayer no_select" style="height:447px;display:none">
		<ul class="tab_pallet" id="tab_pallet">
			<li class="selected" data-tab="tab1">${lang.tabNormal}</li>
			<li data-tab="tab2">${lang.tabSystem}</li>
		</ul>
		<div class="pallet_item_wrap" class="husky_seditor_ui_FormEditor">
			<ul id="tab1" class="pallet_item">
				<li>
					<ul class="items">
						<li><button class="editor_dsl" data-type="{{text}}"><span class="ic_pallet ic_pallet_text"></span><span class="txt" class="editor_dsl" data-type="{{text}}">${lang.textNormal}(text)</span></button></li>
						<li><button class="editor_dsl" data-type="{{number}}"><span class="ic_pallet ic_pallet_num"></span><span class="txt" class="editor_dsl" data-type="{{number}}">${lang.number}(number)</span></button></li>
						<li><button class="editor_dsl" data-type="{{currency_0}}"><span class="ic_pallet ic_pallet_currency"></span><span class="txt" class="editor_dsl" data-type="{{currency_0}}">${lang.currency}(currency)</span></button></li>
						<li><button class="editor_dsl" data-type="{{textarea}}"><span class="ic_pallet ic_pallet_textarea"></span><span class="txt" class="editor_dsl" data-type="{{textarea}}">${lang.textarea}(textarea)</span></button></li>
						<li><button class="editor_dsl" data-type="{{editor}}"><span class="ic_pallet ic_pallet_editor"></span><span class="txt" class="editor_dsl" data-type="{{editor}}">${lang.editor}(editor)</span></button></li>
						<li><button class="editor_dsl" data-type="{{radio_A_B}}"><span class="ic_pallet ic_pallet_radio"></span><span class="txt" class="editor_dsl" data-type="{{radio_A_B}}">${lang.radio}(radio)</span></button></li>
						<li><button class="editor_dsl" data-type="{{check_A_B}}"><span class="ic_pallet ic_pallet_check"></span><span class="txt" class="editor_dsl" data-type="{{check_A_B}}">${lang.check}(check)</span></button></li>
					</ul>
				</li>
				<li>
					<ul class="items">
						<!-- li><span class="ic_pallet ic_pallet_title"></span><span class="txt">이름일 길어질 경우 연출된 모습입니다.</span></li-->
						<li><button class="editor_dsl" data-type="{{calendar}}"><span class="ic_pallet ic_pallet_calendar"></span><span class="txt" class="editor_dsl" data-type="{{calendar}}">${lang.date}(calendar)</span></button></li>
						<li><button class="editor_dsl" data-type="{{period}}"><span class="ic_pallet ic_pallet_peroid"></span><span class="txt" class="editor_dsl" data-type="{{period}}">${lang.period}(period)</span></button></li>
						<li><button class="editor_dsl" data-type="{{time}}"><span class="ic_pallet ic_pallet_time"></span><span class="txt" class="editor_dsl" data-type="{{time}}">${lang.time}(time)</span></button></li>
					</ul>
				</li>
			</ul>
			<ul id="tab2" class="pallet_item" style="display:none">
				<li>
					<ul class="items">
						<li><button class="editor_dsl" data-type="{{name_pos}}"><span class="ic_pallet ic_pallet_namepos"></span><span class="txt" class="editor_dsl" data-type="{{name_pos}}">${lang.namePosition}(name_pos)</span></button></li>
						<li><button class="editor_dsl" data-type="{{user_name}}"><span class="ic_pallet ic_pallet_name"></span><span class="txt" class="editor_dsl" data-type="{{user_name}}">${lang.name}(user_name)</span></button></li>
						<li><button class="editor_dsl" data-type="{{user_pos}}"><span class="ic_pallet ic_pallet_pos"></span><span class="txt" class="editor_dsl" data-type="{{user_pos}}">${lang.position}(user_pos)</span></button></li>
						<li><button class="editor_dsl" data-type="{{user_empno}}"><span class="ic_pallet ic_pallet_no"></span><span class="txt" class="editor_dsl" data-type="{{user_empno}}">${lang.empno}(user_empno)</span></button></li>
						<li><button class="editor_dsl" data-type="{{user_org}}"><span class="ic_pallet ic_pallet_org"></span><span class="txt" class="editor_dsl" data-type="{{user_org}}">${lang.department}(user_org)</span></button></li>
						<li><button class="editor_dsl" data-type="{{today}}"><span class="ic_pallet ic_pallet_today"></span><span class="txt" class="editor_dsl" data-type="{{today}}">${lang.today}(today)</span></button></li>
					</ul>
				</li>
			</ul>
		</div>
	</div>
	<!--  보고서용 에디터 팔레트 -->
	<!--  전자결재용 에디터 팔레트 -->
	<div id="approvalPallet" class="pallet formeditorLayer no_select" style="height:447px;display:none">
		<ul class="tab_pallet" id="tab_pallet">
			<li class="selected" data-tab="tab3">${lang.tabApproval}</li>
			<li data-tab="tab4">${lang.tabNormal}</li>
		</ul>
		<div class="pallet_item_wrap" class="husky_seditor_ui_FormEditor">
			<ul id="tab3" class="pallet_item">
				<li>
					<ul class="items" id="customApprovalWrap">

						<!-- li class="editor_dsl" data-type=""><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="">기안....type1</span></li>
						<li class="editor_dsl" data-type=""><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="">기안....type2</span></li-->

					</ul>
				</li>
				<li>
					<ul class="items" id="receptionApprovalWrap">

						<!-- li class="editor_dsl" data-type=""><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="">기안....type1</span></li>
                        <li class="editor_dsl" data-type=""><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="">기안....type2</span></li-->

					</ul>
				</li>
				<li>
					<ul class="items" id="customAgreementWrap">

						<!-- li class="editor_dsl" data-type=""><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="">기안....type1</span></li>
                        <li class="editor_dsl" data-type=""><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="">기안....type2</span></li-->

					</ul>
				</li>
				<li>
					<ul class="items">
						<!-- li class='custom_agreement'><span class='ic_pallet'></span><span class='txt' class='custom_agreement'>${lang.agreement}</span></li-->
						<!-- li><span class="ic_pallet ic_pallet_title"></span><span class="txt">이름일 길어질 경우 연출된 모습입니다.</span></li-->
						<li><button class="editor_dsl" data-type="{{text:subject}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{text:subject}}" data-dup="false">${lang.title}(subject)</span></button></li>
						<li><button class="editor_dsl" data-type="{{editor:appContent}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{editor:appContent}}" data-dup="false">${lang.content}(appContent)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:draftUser}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:draftUser}}" data-dup="false">${lang.draftingman}(draftUser)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:draftUserEmail}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:draftUserEmail}}" data-dup="false">${lang.draftUserEmail}(draftUserEmail)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:position}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:position}}" data-dup="false">${lang.position}(position)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:empNo}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:empNo}}" data-dup="false">${lang.empno}(empNo)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:mobileNo}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:mobileNo}}" data-dup="false">${lang.mobileno}(mobileNo)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:directTel}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:directTel}}" data-dup="false">${lang.directtel}(directTel)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:repTel}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:repTel}}" data-dup="false">${lang.reptel}(repTel)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:fax}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:fax}}" data-dup="false">${lang.fax}(fax)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:draftDept}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:draftDept}}" data-dup="false">${lang.draftingDepartment}(draftDept)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:draftDate}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:draftDate}}" data-dup="false">${lang.draftingDate}(draftDate)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:completeDate}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:completeDate}}" data-dup="false">${lang.completeDate}(completeDate)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:docNo}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:docNo}}" data-dup="false">${lang.docno}(docNo)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:recipient}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:recipient}}" data-dup="false">${lang.destination}(recipient)</span></button></li>
						<li><button class="editor_dsl" data-type="{{span:officialDocReceiver}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{span:officialDocReceiver}}" data-dup="false">${lang.officialDocReceiver}(officialDocReceiver)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:preserveDuration}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:preserveDuration}}" data-dup="false">${lang.preserveDuration}(preserveDuration)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:securityLevel}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:securityLevel}}" data-dup="false">${lang.securityLevel}(securityLevel)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:docClassification}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:docClassification}}" data-dup="false">${lang.docClassification}(docClassification)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:docReference}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:docReference}}" data-dup="false">${lang.docReference}(docReference)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:openOption}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:openOption}}" data-dup="false">${lang.openoption}(openOption)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:officialDocSender}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:officialDocSender}}" data-dup="false">${lang.officialDocSender}(officialDocSender)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:attachFile}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:attachFile}}" data-dup="false">${lang.attachFile}(attachFile)</span></button></li>
					</ul>
				</li>
			</ul>
			<ul id="tab4" class="pallet_item" style="display:none">
				<li>
					<ul class="items">
						<li><button class="editor_dsl" data-type="{{text}}"><span class="ic_pallet ic_pallet_text"></span><span class="txt" class="editor_dsl" data-type="{{text}}">${lang.textNormal}(text)</span></button></li>
						<li><button class="editor_dsl" data-type="{{number}}"><span class="ic_pallet ic_pallet_num"></span><span class="txt" class="editor_dsl" data-type="{{number}}">${lang.number}(number)</span></button></li>
						<li><button class="editor_dsl" data-type="{{currency_0}}"><span class="ic_pallet ic_pallet_currency"></span><span class="txt" class="editor_dsl" data-type="{{currency_0}}">${lang.currency}(currency)</span></button></li>
						<li><button class="editor_dsl" data-type="{{textarea}}"><span class="ic_pallet ic_pallet_textarea"></span><span class="txt" class="editor_dsl" data-type="{{textarea}}">${lang.textarea}(textarea)</span></button></li>
						<li><button class="editor_dsl" data-type="{{editor}}"><span class="ic_pallet ic_pallet_editor"></span><span class="txt" class="editor_dsl" data-type="{{editor}}">${lang.editor}(editor)</span></button></li>
						<li><button class="editor_dsl" data-type="{{radio_A_B}}"><span class="ic_pallet ic_pallet_radio"></span><span class="txt" class="editor_dsl" data-type="{{radio_A_B}}">${lang.radio}(radio)</span></button></li>
						<li><button class="editor_dsl" data-type="{{check_A_B}}"><span class="ic_pallet ic_pallet_check"></span><span class="txt" class="editor_dsl" data-type="{{check_A_B}}">${lang.check}(check)</span></button></li>
						<li><button class="editor_dsl" data-type="{{cSel_A_B}}"><span class="ic_pallet ic_pallet_select"></span><span class="txt" class="editor_dsl" data-type="{{cSel_A_B}}">${lang.radio}(select)</span></button></li>
						<li><button class="editor_dsl" data-type="{{radio$autotype$_A_B:apprLineRuleOption}}" data-dup="false"><span class="ic_pallet ic_pallet_radio"></span><span class="txt" class="editor_dsl" data-type="{{radio$autotype$_A_B:apprLineRuleOption}}" data-dup="false">${lang.radio} - ${lang.autoApprLine}(radio)</span></button></li>
						<li><button class="editor_dsl" data-type="{{currency$autotype$:apprLineRuleAmount}}" data-dup="false"><span class="ic_pallet ic_pallet_currency"></span><span class="txt" class="editor_dsl" data-type="{{currency$autotype$:apprLineRuleAmount}}" data-dup="false">${lang.currency} - ${lang.autoApprLine}(currency)</span></button></li>
						<li><button class="editor_dsl" data-type="{{cSel$autotype$:apprLineRuleOption_A_B}}" data-dup="false"><span class="ic_pallet ic_pallet_select"></span><span class="txt" class="editor_dsl" data-type="{{cSel$autotype$:apprLineRuleOption_A_B}}" data-dup="false">${lang.radio} - ${lang.autoApprLine}(select)</span></button></li>
						<li><button class="editor_dsl" data-type="{{cOrg}}" data-orgtype="" data-dup="true"><span class="ic_pallet ic_pallet_org"></span><span class="txt" class="editor_dsl" data-type="{{cOrg}}" data-orgtype="">${lang.org}(org)</span></button></li>
						<li><button class="editor_dsl" data-type="{{cOrg}}" data-orgtype="$department$" data-dup="true"><span class="ic_pallet ic_pallet_org"></span><span class="txt" class="editor_dsl" data-type="{{cOrg}}" data-orgtype="$department$">${lang.org}(department)</span></button></li>
						<li><button class="editor_dsl" data-type="{{span}}" style="display:none"><span class="ic_pallet ic_pallet_text"></span><span class="txt" class="editor_dsl" data-type="{{span}}">(span)</span></button></li>
					</ul>
				</li>
				<li>
					<ul class="items">
						<!-- li><span class="ic_pallet ic_pallet_title"></span><span class="txt">이름일 길어질 경우 연출된 모습입니다.</span></li-->
						<li><button class="editor_dsl" data-type="{{calendar}}"><span class="ic_pallet ic_pallet_calendar"></span><span class="txt" class="editor_dsl" data-type="{{calendar}}">${lang.date}(calendar)</span></button></li>
						<li><button class="editor_dsl" data-type="{{period}}"><span class="ic_pallet ic_pallet_peroid"></span><span class="txt" class="editor_dsl" data-type="{{period}}">${lang.period}(period)</span></button></li>
						<li><button class="editor_dsl" data-type="{{time}}"><span class="ic_pallet ic_pallet_time"></span><span class="txt" class="editor_dsl" data-type="{{time}}">${lang.time}(time)</span></button></li>
					</ul>
				</li>
			</ul>
		</div>
	</div>
	
		<!--  공문서 에디터 팔레트 -->
	<div id="officialPallet" class="pallet formeditorLayer no_select" style="height:447px;display:none">
		<ul class="tab_pallet tep_item1" id="tab_pallet">
			<li class="selected" data-tab="tab5">입력 요소</li>
		</ul>
		<div class="pallet_item_wrap" class="husky_seditor_ui_FormEditor">
			<ul id="tab5" class="pallet_item">
				<li>
					<ul class="items">
						<!-- li><span class="ic_pallet ic_pallet_title"></span><span class="txt">이름일 길어질 경우 연출된 모습입니다.</span></li-->
						<li><button class="editor_dsl" data-type="{{text:subject}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{text:subject}}" data-dup="false">${lang.title}(subject)</span></button></li>
						<li><button class="editor_dsl" data-type="{{editor:appContent}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{editor:appContent}}" data-dup="false">${lang.content}(appContent)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:draftUser}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:draftUser}}" data-dup="false">${lang.draftingman}(draftUser)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:draftUserEmail}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:draftUserEmail}}" data-dup="false">${lang.draftUserEmail}(draftUserEmail)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:position}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:position}}" data-dup="false">${lang.position}(position)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:empNo}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:empNo}}" data-dup="false">${lang.empno}(empNo)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:mobileNo}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:mobileNo}}" data-dup="false">${lang.mobileno}(mobileNo)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:directTel}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:directTel}}" data-dup="false">${lang.directtel}(directTel)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:repTel}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:repTel}}" data-dup="false">${lang.reptel}(repTel)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:fax}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:fax}}" data-dup="false">${lang.fax}(fax)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:draftDept}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:draftDept}}" data-dup="false">${lang.draftingDepartment}(draftDept)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:draftDate}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:draftDate}}" data-dup="false">${lang.draftingDate}(draftDate)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:completeDate}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:completeDate}}" data-dup="false">${lang.completeDate}(completeDate)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:docNo}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:docNo}}" data-dup="false">${lang.docno}(docNo)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:recipient}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:recipient}}" data-dup="false">${lang.destination}(recipient)</span></button></li>
						<li><button class="editor_dsl" data-type="{{span:officialDocReceiver}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{span:officialDocReceiver}}" data-dup="false">${lang.officialDocReceiver}(officialDocReceiver)</span></button></li>
						<li><button class="editor_dsl" data-type="{{span:officialDocVersionReceiver}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{span:officialDocVersionReceiver}}" data-dup="false">${lang.officialDocVersionReceiver}(officialDocVersionReceiver)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:preserveDuration}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:preserveDuration}}" data-dup="false">${lang.preserveDuration}(preserveDuration)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:securityLevel}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:securityLevel}}" data-dup="false">${lang.securityLevel}(securityLevel)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:docClassification}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:docClassification}}" data-dup="false">${lang.docClassification}(docClassification)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:docReference}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:docReference}}" data-dup="false">${lang.docReference}(docReference)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:openOption}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:openOption}}" data-dup="false">${lang.openoption}(openOption)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:officialDocSender}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:officialDocSender}}" data-dup="false">${lang.officialDocSender}(officialDocSender)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:officialDocSign}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:officialDocSign}}" data-dup="false">${lang.officialDocSign}(officialDocSign)</span></button></li>
						<li><button class="editor_dsl" data-type="{{label:attachFile}}" data-dup="false"><span class="ic_pallet"></span><span class="txt" class="editor_dsl" data-type="{{label:attachFile}}" data-dup="false">${lang.attachFile}(attachFile)</span></button></li>
					</ul>
				</li>
			</ul>
		</div>
	</div>
	<!--  공문서 에디터 팔레트 -->
	
	
	
	
	<div id="smart_editor2_content" class="editor_wrap"><a href="#se2_iframe" class="blind">${lang.textarea}</a>
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
									<li><button type="button" style="height:33px;"><span style="margin-bottom:1px; font-size:18pt;">${lang.alphabet}<span style="margin-left:8px;font-size:18pt;">(18pt)</span></span></button></li>
									<li><button type="button" style="height:39px;"><span style="margin-left:3px; font-size:24pt;">${lang.ganadarama}<span style="margin-left:11px;font-size:24pt;">(24pt)</span></span></button></li>
									<li><button type="button" style="height:53px;"><span style="margin-top:-1px; margin-left:3px; font-size:36pt;">${lang.ganada}<span style="font-size:36pt;">(36pt)</span></span></button></li>
								</ul>
							</div>
						</div>
						<!-- //폰트 사이즈 레이어 -->
					</li>
				</ul><ul>
				<li class="husky_seditor_ui_bold first_child"><button type="button" title="${lang.bold}[Ctrl+B]" class="se2_bold"><span class="_buttonRound tool_bg">${lang.bold}[Ctrl+B]</span></button></li>

				<li class="husky_seditor_ui_underline"><button type="button" title="${lang.underscore}[Ctrl+U]" class="se2_underline"><span class="_buttonRound">${lang.underscore}[Ctrl+U]</span></button></li>

				<li class="husky_seditor_ui_italic"><button type="button" title="${lang.italic}[Ctrl+I]" class="se2_italic"><span class="_buttonRound">${lang.italic}[Ctrl+I]</span></button></li>

				<li class="husky_seditor_ui_lineThrough"><button type="button" title="${lang.strikethrough}[Ctrl+D]" class="se2_tdel"><span class="_buttonRound">${lang.strikethrough}[Ctrl+D]</span></button></li>

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

				<li class="se2_pair husky_seditor_ui_BGColor"><span class="selected_color husky_se2m_BGColor_lastUsed" style="background-color:#4477f9"></span><span class="husky_seditor_ui_BGColorA"><button type="button" title="${lang.backgroundColor}" class="se2_bgcolor"><span>${lang.backgroundColor}</span></button></span><span class="husky_seditor_ui_BGColorB"><button type="button" title="${lang.more}" class="se2_bgcolor_more"><span class="_buttonRound">${lang.more}</span></button></span>
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

				<li class="husky_seditor_ui_superscript"><button type="button" title="${lang.superscript}" class="se2_sup"><span class="_buttonRound">${lang.superscript}</span></button></li>

				<li class="husky_seditor_ui_subscript last_child"><button type="button" title="${lang.subscript}" class="se2_sub"><span class="_buttonRound tool_bg">${lang.subscript}</span></button></li>
			</ul><ul>
				<li class="husky_seditor_ui_justifyleft first_child"><button type="button" title="${lang.leftAligned}" class="se2_left"><span class="_buttonRound tool_bg">${lang.leftAligned}</span></button></li>

				<li class="husky_seditor_ui_justifycenter"><button type="button" title="${lang.centerAligned}" class="se2_center"><span class="_buttonRound">${lang.centerAligned}</span></button></li>

				<li class="husky_seditor_ui_justifyright"><button type="button" title="${lang.rightAligned}" class="se2_right"><span class="_buttonRound">${lang.rightAligned}</span></button></li>

				<li class="husky_seditor_ui_justifyfull"><button type="button" title="${lang.Justification}" class="se2_justify"><span class="_buttonRound">${lang.Justification}</span></button></li>

				<li class="husky_seditor_ui_lineHeight last_child"><button type="button" title="${lang.lineSpacing}" class="se2_lineheight" ><span class="_buttonRound tool_bg">${lang.lineSpacing}</span></button>
					<!-- 줄간격 레이어 -->
					<div class="se2_layer husky_se2m_lineHeight_layer">
						<div class="se2_in_layer">
							<ul class="se2_l_line_height">
								<li><button type="button"><span>50%</span></button></li>
								<li><button type="button"><span>80%</span></button></li>
								<li><button type="button"><span>100%</span></button></li>
								<li><button type="button"><span>120%</span></button></li>
								<li><button type="button"><span>150%</span></button></li>
								<li><button type="button"><span>180%</span></button></li>
								<li><button type="button"><span>200%</span></button></li>
							</ul>
							<div class="se2_l_line_height_user husky_se2m_lineHeight_direct_input">
								<h3>${lang.directInput}</h3>
								<span class="bx_input">
								<input type="text" class="input_ty1" maxlength="3" style="width:75px">
								<button type="button" title="1% ${lang.plus}" class="btn_up"><span>1% ${lang.plus}</span></button>
								<button type="button" title="1% ${lang.subtraction}" class="btn_down"><span>1% ${lang.subtraction}</span></button>
								</span>
								<div class="btn_area">
									<button type="button" class="se2_btn_apply3"><span>${lang.apply}</span></button><button type="button" class="se2_btn_cancel3"><span>${lang.cancel}</span></button>
								</div>
							</div>
						</div>
					</div>
					<!-- //줄간격 레이어 -->
				</li>
			</ul><ul>
				<li class="husky_seditor_ui_orderedlist first_child"><button type="button" title="${lang.numbering}" class="se2_ol"><span class="_buttonRound tool_bg">${lang.numbering}</span></button></li>
				<li class="husky_seditor_ui_unorderedlist"><button type="button" title="${lang.bullets}" class="se2_ul"><span class="_buttonRound">${lang.bullets}</span></button></li>
				<li class="husky_seditor_ui_outdent"><button type="button" title="${lang.oriel}[Shift+Tab]" class="se2_outdent"><span class="_buttonRound">${lang.oriel}[Shift+Tab]</span></button></li>
				<li class="husky_seditor_ui_indent last_child"><button type="button" title="${lang.indent}[Tab]" class="se2_indent"><span class="_buttonRound tool_bg">${lang.indent}[Tab]</span></button></li>
			</ul><ul>
				<li class="husky_seditor_ui_quote single_child"><button type="button" title="${lang.quote}" class="se2_blockquote"><span class="_buttonRound tool_bg">${lang.quote}</span></button>
					<!-- 인용구 -->
					<div class="se2_layer husky_seditor_blockquote_layer" style="margin-left:-407px; display:none;">
						<div class="se2_in_layer">
							<div class="se2_quote">
								<ul>
									<li class="q1"><button type="button" class="se2_quote1"><span><span>${lang.quote01}</span></span></button></li>
									<li class="q2"><button type="button" class="se2_quote2"><span><span>${lang.quote02}</span></span></button></li>
									<li class="q3"><button type="button" class="se2_quote3"><span><span>${lang.quote03}</span></span></button></li>
									<li class="q4"><button type="button" class="se2_quote4"><span><span>${lang.quote04}</span></span></button></li>
									<li class="q5"><button type="button" class="se2_quote5"><span><span>${lang.quote05}</span></span></button></li>
									<li class="q6"><button type="button" class="se2_quote6"><span><span>${lang.quote06}</span></span></button></li>
									<li class="q7"><button type="button" class="se2_quote7"><span><span>${lang.quote07}</span></span></button></li>
									<li class="q8"><button type="button" class="se2_quote8"><span><span>${lang.quote08}</span></span></button></li>
									<li class="q9"><button type="button" class="se2_quote9"><span><span>${lang.quote09}</span></span></button></li>
									<li class="q10"><button type="button" class="se2_quote10"><span><span>${lang.quote10}</span></span></button></li>
								</ul>
								<button type="button" class="se2_cancel2"><span>${lang.applyCancel}</span></button>
							</div>
						</div>
					</div>
					<!-- //인용구 -->
				</li>
			</ul><ul>
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

				<li class="husky_seditor_ui_sCharacter"><button type="button" title="${lang.specialSymbols}" class="se2_character"><span class="_buttonRound">${lang.specialSymbols}</span></button>
					<!-- 특수기호 -->
					<div class="se2_layer husky_seditor_sCharacter_layer" style="margin-left:-448px;">
						<div class="se2_in_layer">
							<div class="se2_bx_character">
								<ul class="se2_char_tab">
									<li class="active"><button type="button" title="${lang.generalSymbols}" class="se2_char1"><span>${lang.generalSymbols}</span></button>
										<div class="se2_s_character">
											<ul class="husky_se2m_sCharacter_list">
												<li></li>
												<!-- 일반기호 목록 -->
												<!-- <li class="hover"><button type="button"><span>｛</span></button></li><li class="active"><button type="button"><span>｝</span></button></li><li><button type="button"><span>〔</span></button></li><li><button type="button"><span>〕</span></button></li><li><button type="button"><span>〈</span></button></li><li><button type="button"><span>〉</span></button></li><li><button type="button"><span>《</span></button></li><li><button type="button"><span>》</span></button></li><li><button type="button"><span>「</span></button></li><li><button type="button"><span>」</span></button></li><li><button type="button"><span>『</span></button></li><li><button type="button"><span>』</span></button></li><li><button type="button"><span>【</span></button></li><li><button type="button"><span>】</span></button></li><li><button type="button"><span>‘</span></button></li><li><button type="button"><span>’</span></button></li><li><button type="button"><span>“</span></button></li><li><button type="button"><span>”</span></button></li><li><button type="button"><span>、</span></button></li><li><button type="button"><span>。</span></button></li><li><button type="button"><span>·</span></button></li><li><button type="button"><span>‥</span></button></li><li><button type="button"><span>…</span></button></li><li><button type="button"><span>§</span></button></li><li><button type="button"><span>※</span></button></li><li><button type="button"><span>☆</span></button></li><li><button type="button"><span>★</span></button></li><li><button type="button"><span>○</span></button></li><li><button type="button"><span>●</span></button></li><li><button type="button"><span>◎</span></button></li><li><button type="button"><span>◇</span></button></li><li><button type="button"><span>◆</span></button></li><li><button type="button"><span>□</span></button></li><li><button type="button"><span>■</span></button></li><li><button type="button"><span>△</span></button></li><li><button type="button"><span>▲</span></button></li><li><button type="button"><span>▽</span></button></li><li><button type="button"><span>▼</span></button></li><li><button type="button"><span>◁</span></button></li><li><button type="button"><span>◀</span></button></li><li><button type="button"><span>▷</span></button></li><li><button type="button"><span>▶</span></button></li><li><button type="button"><span>♤</span></button></li><li><button type="button"><span>♠</span></button></li><li><button type="button"><span>♡</span></button></li><li><button type="button"><span>♥</span></button></li><li><button type="button"><span>♧</span></button></li><li><button type="button"><span>♣</span></button></li><li><button type="button"><span>⊙</span></button></li><li><button type="button"><span>◈</span></button></li><li><button type="button"><span>▣</span></button></li><li><button type="button"><span>◐</span></button></li><li><button type="button"><span>◑</span></button></li><li><button type="button"><span>▒</span></button></li><li><button type="button"><span>▤</span></button></li><li><button type="button"><span>▥</span></button></li><li><button type="button"><span>▨</span></button></li><li><button type="button"><span>▧</span></button></li><li><button type="button"><span>▦</span></button></li><li><button type="button"><span>▩</span></button></li><li><button type="button"><span>±</span></button></li><li><button type="button"><span>×</span></button></li><li><button type="button"><span>÷</span></button></li><li><button type="button"><span>≠</span></button></li><li><button type="button"><span>≤</span></button></li><li><button type="button"><span>≥</span></button></li><li><button type="button"><span>∞</span></button></li><li><button type="button"><span>∴</span></button></li><li><button type="button"><span>°</span></button></li><li><button type="button"><span>′</span></button></li><li><button type="button"><span>″</span></button></li><li><button type="button"><span>∠</span></button></li><li><button type="button"><span>⊥</span></button></li><li><button type="button"><span>⌒</span></button></li><li><button type="button"><span>∂</span></button></li><li><button type="button"><span>≡</span></button></li><li><button type="button"><span>≒</span></button></li><li><button type="button"><span>≪</span></button></li><li><button type="button"><span>≫</span></button></li><li><button type="button"><span>√</span></button></li><li><button type="button"><span>∽</span></button></li><li><button type="button"><span>∝</span></button></li><li><button type="button"><span>∵</span></button></li><li><button type="button"><span>∫</span></button></li><li><button type="button"><span>∬</span></button></li><li><button type="button"><span>∈</span></button></li><li><button type="button"><span>∋</span></button></li><li><button type="button"><span>⊆</span></button></li><li><button type="button"><span>⊇</span></button></li><li><button type="button"><span>⊂</span></button></li><li><button type="button"><span>⊃</span></button></li><li><button type="button"><span>∪</span></button></li><li><button type="button"><span>∩</span></button></li><li><button type="button"><span>∧</span></button></li><li><button type="button"><span>∨</span></button></li><li><button type="button"><span>￢</span></button></li><li><button type="button"><span>⇒</span></button></li><li><button type="button"><span>⇔</span></button></li><li><button type="button"><span>∀</span></button></li><li><button type="button"><span>∃</span></button></li><li><button type="button"><span>´</span></button></li><li><button type="button"><span>～</span></button></li><li><button type="button"><span>ˇ</span></button></li><li><button type="button"><span>˘</span></button></li><li><button type="button"><span>˝</span></button></li><li><button type="button"><span>˚</span></button></li><li><button type="button"><span>˙</span></button></li><li><button type="button"><span>¸</span></button></li><li><button type="button"><span>˛</span></button></li><li><button type="button"><span>¡</span></button></li><li><button type="button"><span>¿</span></button></li><li><button type="button"><span>ː</span></button></li><li><button type="button"><span>∮</span></button></li><li><button type="button"><span>∑</span></button></li><li><button type="button"><span>∏</span></button></li><li><button type="button"><span>♭</span></button></li><li><button type="button"><span>♩</span></button></li><li><button type="button"><span>♪</span></button></li><li><button type="button"><span>♬</span></button></li><li><button type="button"><span>㉿</span></button></li><li><button type="button"><span>→</span></button></li><li><button type="button"><span>←</span></button></li><li><button type="button"><span>↑</span></button></li><li><button type="button"><span>↓</span></button></li><li><button type="button"><span>↔</span></button></li><li><button type="button"><span>↕</span></button></li><li><button type="button"><span>↗</span></button></li><li><button type="button"><span>↙</span></button></li><li><button type="button"><span>↖</span></button></li><li><button type="button"><span>↘</span></button></li><li><button type="button"><span>㈜</span></button></li><li><button type="button"><span>№</span></button></li><li><button type="button"><span>㏇</span></button></li><li><button type="button"><span>™</span></button></li><li><button type="button"><span>㏂</span></button></li><li><button type="button"><span>㏘</span></button></li><li><button type="button"><span>℡</span></button></li><li><button type="button"><span>♨</span></button></li><li><button type="button"><span>☏</span></button></li><li><button type="button"><span>☎</span></button></li><li><button type="button"><span>☜</span></button></li><li><button type="button"><span>☞</span></button></li><li><button type="button"><span>¶</span></button></li><li><button type="button"><span>†</span></button></li><li><button type="button"><span>‡</span></button></li><li><button type="button"><span>®</span></button></li><li><button type="button"><span>ª</span></button></li><li><button type="button"><span>º</span></button></li><li><button type="button"><span>♂</span></button></li><li><button type="button"><span>♀</span></button></li> -->
											</ul>
										</div>
									</li>
									<li><button type="button" title="${lang.numbersUnits}" class="se2_char2"><span>${lang.numbersUnits}</span></button>
										<div class="se2_s_character">
											<ul class="husky_se2m_sCharacter_list">
												<li></li>
												<!-- 숫자와 단위 목록 -->
												<!-- <li class="hover"><button type="button"><span>½</span></button></li><li><button type="button"><span>⅓</span></button></li><li><button type="button"><span>⅔</span></button></li><li><button type="button"><span>¼</span></button></li><li><button type="button"><span>¾</span></button></li><li><button type="button"><span>⅛</span></button></li><li><button type="button"><span>⅜</span></button></li><li><button type="button"><span>⅝</span></button></li><li><button type="button"><span>⅞</span></button></li><li><button type="button"><span>¹</span></button></li><li><button type="button"><span>²</span></button></li><li><button type="button"><span>³</span></button></li><li><button type="button"><span>⁴</span></button></li><li><button type="button"><span>ⁿ</span></button></li><li><button type="button"><span>₁</span></button></li><li><button type="button"><span>₂</span></button></li><li><button type="button"><span>₃</span></button></li><li><button type="button"><span>₄</span></button></li><li><button type="button"><span>Ⅰ</span></button></li><li><button type="button"><span>Ⅱ</span></button></li><li><button type="button"><span>Ⅲ</span></button></li><li><button type="button"><span>Ⅳ</span></button></li><li><button type="button"><span>Ⅴ</span></button></li><li><button type="button"><span>Ⅵ</span></button></li><li><button type="button"><span>Ⅶ</span></button></li><li><button type="button"><span>Ⅷ</span></button></li><li><button type="button"><span>Ⅸ</span></button></li><li><button type="button"><span>Ⅹ</span></button></li><li><button type="button"><span>ⅰ</span></button></li><li><button type="button"><span>ⅱ</span></button></li><li><button type="button"><span>ⅲ</span></button></li><li><button type="button"><span>ⅳ</span></button></li><li><button type="button"><span>ⅴ</span></button></li><li><button type="button"><span>ⅵ</span></button></li><li><button type="button"><span>ⅶ</span></button></li><li><button type="button"><span>ⅷ</span></button></li><li><button type="button"><span>ⅸ</span></button></li><li><button type="button"><span>ⅹ</span></button></li><li><button type="button"><span>￦</span></button></li><li><button type="button"><span>$</span></button></li><li><button type="button"><span>￥</span></button></li><li><button type="button"><span>￡</span></button></li><li><button type="button"><span>€</span></button></li><li><button type="button"><span>℃</span></button></li><li><button type="button"><span>A</span></button></li><li><button type="button"><span>℉</span></button></li><li><button type="button"><span>￠</span></button></li><li><button type="button"><span>¤</span></button></li><li><button type="button"><span>‰</span></button></li><li><button type="button"><span>㎕</span></button></li><li><button type="button"><span>㎖</span></button></li><li><button type="button"><span>㎗</span></button></li><li><button type="button"><span>ℓ</span></button></li><li><button type="button"><span>㎘</span></button></li><li><button type="button"><span>㏄</span></button></li><li><button type="button"><span>㎣</span></button></li><li><button type="button"><span>㎤</span></button></li><li><button type="button"><span>㎥</span></button></li><li><button type="button"><span>㎦</span></button></li><li><button type="button"><span>㎙</span></button></li><li><button type="button"><span>㎚</span></button></li><li><button type="button"><span>㎛</span></button></li><li><button type="button"><span>㎜</span></button></li><li><button type="button"><span>㎝</span></button></li><li><button type="button"><span>㎞</span></button></li><li><button type="button"><span>㎟</span></button></li><li><button type="button"><span>㎠</span></button></li><li><button type="button"><span>㎡</span></button></li><li><button type="button"><span>㎢</span></button></li><li><button type="button"><span>㏊</span></button></li><li><button type="button"><span>㎍</span></button></li><li><button type="button"><span>㎎</span></button></li><li><button type="button"><span>㎏</span></button></li><li><button type="button"><span>㏏</span></button></li><li><button type="button"><span>㎈</span></button></li><li><button type="button"><span>㎉</span></button></li><li><button type="button"><span>㏈</span></button></li><li><button type="button"><span>㎧</span></button></li><li><button type="button"><span>㎨</span></button></li><li><button type="button"><span>㎰</span></button></li><li><button type="button"><span>㎱</span></button></li><li><button type="button"><span>㎲</span></button></li><li><button type="button"><span>㎳</span></button></li><li><button type="button"><span>㎴</span></button></li><li><button type="button"><span>㎵</span></button></li><li><button type="button"><span>㎶</span></button></li><li><button type="button"><span>㎷</span></button></li><li><button type="button"><span>㎸</span></button></li><li><button type="button"><span>㎹</span></button></li><li><button type="button"><span>㎀</span></button></li><li><button type="button"><span>㎁</span></button></li><li><button type="button"><span>㎂</span></button></li><li><button type="button"><span>㎃</span></button></li><li><button type="button"><span>㎄</span></button></li><li><button type="button"><span>㎺</span></button></li><li><button type="button"><span>㎻</span></button></li><li><button type="button"><span>㎼</span></button></li><li><button type="button"><span>㎽</span></button></li><li><button type="button"><span>㎾</span></button></li><li><button type="button"><span>㎿</span></button></li><li><button type="button"><span>㎐</span></button></li><li><button type="button"><span>㎑</span></button></li><li><button type="button"><span>㎒</span></button></li><li><button type="button"><span>㎓</span></button></li><li><button type="button"><span>㎔</span></button></li><li><button type="button"><span>Ω</span></button></li><li><button type="button"><span>㏀</span></button></li><li><button type="button"><span>㏁</span></button></li><li><button type="button"><span>㎊</span></button></li><li><button type="button"><span>㎋</span></button></li><li><button type="button"><span>㎌</span></button></li><li><button type="button"><span>㏖</span></button></li><li><button type="button"><span>㏅</span></button></li><li><button type="button"><span>㎭</span></button></li><li><button type="button"><span>㎮</span></button></li><li><button type="button"><span>㎯</span></button></li><li><button type="button"><span>㏛</span></button></li><li><button type="button"><span>㎩</span></button></li><li><button type="button"><span>㎪</span></button></li><li><button type="button"><span>㎫</span></button></li><li><button type="button"><span>㎬</span></button></li><li><button type="button"><span>㏝</span></button></li><li><button type="button"><span>㏐</span></button></li><li><button type="button"><span>㏓</span></button></li><li><button type="button"><span>㏃</span></button></li><li><button type="button"><span>㏉</span></button></li><li><button type="button"><span>㏜</span></button></li><li><button type="button"><span>㏆</span></button></li> -->
											</ul>
										</div>
									</li>
									<li style="display:none"><button type="button" title="${lang.wonParentheses}" class="se2_char3"><span>${lang.wonParentheses}</span></button>
										<div class="se2_s_character">
											<ul class="husky_se2m_sCharacter_list">
												<li></li>
												<!-- 원,괄호 목록 -->
												<!-- <li><button type="button"><span>㉠</span></button></li><li><button type="button"><span>㉡</span></button></li><li><button type="button"><span>㉢</span></button></li><li><button type="button"><span>㉣</span></button></li><li><button type="button"><span>㉤</span></button></li><li><button type="button"><span>㉥</span></button></li><li><button type="button"><span>㉦</span></button></li><li><button type="button"><span>㉧</span></button></li><li><button type="button"><span>㉨</span></button></li><li><button type="button"><span>㉩</span></button></li><li><button type="button"><span>㉪</span></button></li><li><button type="button"><span>㉫</span></button></li><li><button type="button"><span>㉬</span></button></li><li><button type="button"><span>㉭</span></button></li><li><button type="button"><span>㉮</span></button></li><li><button type="button"><span>㉯</span></button></li><li><button type="button"><span>㉰</span></button></li><li><button type="button"><span>㉱</span></button></li><li><button type="button"><span>㉲</span></button></li><li><button type="button"><span>㉳</span></button></li><li><button type="button"><span>㉴</span></button></li><li><button type="button"><span>㉵</span></button></li><li><button type="button"><span>㉶</span></button></li><li><button type="button"><span>㉷</span></button></li><li><button type="button"><span>㉸</span></button></li><li><button type="button"><span>㉹</span></button></li><li><button type="button"><span>㉺</span></button></li><li><button type="button"><span>㉻</span></button></li><li><button type="button"><span>ⓐ</span></button></li><li><button type="button"><span>ⓑ</span></button></li><li><button type="button"><span>ⓒ</span></button></li><li><button type="button"><span>ⓓ</span></button></li><li><button type="button"><span>ⓔ</span></button></li><li><button type="button"><span>ⓕ</span></button></li><li><button type="button"><span>ⓖ</span></button></li><li><button type="button"><span>ⓗ</span></button></li><li><button type="button"><span>ⓘ</span></button></li><li><button type="button"><span>ⓙ</span></button></li><li><button type="button"><span>ⓚ</span></button></li><li><button type="button"><span>ⓛ</span></button></li><li><button type="button"><span>ⓜ</span></button></li><li><button type="button"><span>ⓝ</span></button></li><li><button type="button"><span>ⓞ</span></button></li><li><button type="button"><span>ⓟ</span></button></li><li><button type="button"><span>ⓠ</span></button></li><li><button type="button"><span>ⓡ</span></button></li><li><button type="button"><span>ⓢ</span></button></li><li><button type="button"><span>ⓣ</span></button></li><li><button type="button"><span>ⓤ</span></button></li><li><button type="button"><span>ⓥ</span></button></li><li><button type="button"><span>ⓦ</span></button></li><li><button type="button"><span>ⓧ</span></button></li><li><button type="button"><span>ⓨ</span></button></li><li><button type="button"><span>ⓩ</span></button></li><li><button type="button"><span>①</span></button></li><li><button type="button"><span>②</span></button></li><li><button type="button"><span>③</span></button></li><li><button type="button"><span>④</span></button></li><li><button type="button"><span>⑤</span></button></li><li><button type="button"><span>⑥</span></button></li><li><button type="button"><span>⑦</span></button></li><li><button type="button"><span>⑧</span></button></li><li><button type="button"><span>⑨</span></button></li><li><button type="button"><span>⑩</span></button></li><li><button type="button"><span>⑪</span></button></li><li><button type="button"><span>⑫</span></button></li><li><button type="button"><span>⑬</span></button></li><li><button type="button"><span>⑭</span></button></li><li><button type="button"><span>⑮</span></button></li><li><button type="button"><span>㈀</span></button></li><li><button type="button"><span>㈁</span></button></li><li class="hover"><button type="button"><span>㈂</span></button></li><li><button type="button"><span>㈃</span></button></li><li><button type="button"><span>㈄</span></button></li><li><button type="button"><span>㈅</span></button></li><li><button type="button"><span>㈆</span></button></li><li><button type="button"><span>㈇</span></button></li><li><button type="button"><span>㈈</span></button></li><li><button type="button"><span>㈉</span></button></li><li><button type="button"><span>㈊</span></button></li><li><button type="button"><span>㈋</span></button></li><li><button type="button"><span>㈌</span></button></li><li><button type="button"><span>㈍</span></button></li><li><button type="button"><span>㈎</span></button></li><li><button type="button"><span>㈏</span></button></li><li><button type="button"><span>㈐</span></button></li><li><button type="button"><span>㈑</span></button></li><li><button type="button"><span>㈒</span></button></li><li><button type="button"><span>㈓</span></button></li><li><button type="button"><span>㈔</span></button></li><li><button type="button"><span>㈕</span></button></li><li><button type="button"><span>㈖</span></button></li><li><button type="button"><span>㈗</span></button></li><li><button type="button"><span>㈘</span></button></li><li><button type="button"><span>㈙</span></button></li><li><button type="button"><span>㈚</span></button></li><li><button type="button"><span>㈛</span></button></li><li><button type="button"><span>⒜</span></button></li><li><button type="button"><span>⒝</span></button></li><li><button type="button"><span>⒞</span></button></li><li><button type="button"><span>⒟</span></button></li><li><button type="button"><span>⒠</span></button></li><li><button type="button"><span>⒡</span></button></li><li><button type="button"><span>⒢</span></button></li><li><button type="button"><span>⒣</span></button></li><li><button type="button"><span>⒤</span></button></li><li><button type="button"><span>⒥</span></button></li><li><button type="button"><span>⒦</span></button></li><li><button type="button"><span>⒧</span></button></li><li><button type="button"><span>⒨</span></button></li><li><button type="button"><span>⒩</span></button></li><li><button type="button"><span>⒪</span></button></li><li><button type="button"><span>⒫</span></button></li><li><button type="button"><span>⒬</span></button></li><li><button type="button"><span>⒭</span></button></li><li><button type="button"><span>⒮</span></button></li><li><button type="button"><span>⒯</span></button></li><li><button type="button"><span>⒰</span></button></li><li><button type="button"><span>⒱</span></button></li><li><button type="button"><span>⒲</span></button></li><li><button type="button"><span>⒳</span></button></li><li><button type="button"><span>⒴</span></button></li><li><button type="button"><span>⒵</span></button></li><li><button type="button"><span>⑴</span></button></li><li><button type="button"><span>⑵</span></button></li><li><button type="button"><span>⑶</span></button></li><li><button type="button"><span>⑷</span></button></li><li><button type="button"><span>⑸</span></button></li><li><button type="button"><span>⑹</span></button></li><li><button type="button"><span>⑺</span></button></li><li><button type="button"><span>⑻</span></button></li><li><button type="button"><span>⑼</span></button></li><li><button type="button"><span>⑽</span></button></li><li><button type="button"><span>⑾</span></button></li><li><button type="button"><span>⑿</span></button></li><li><button type="button"><span>⒀</span></button></li><li><button type="button"><span>⒁</span></button></li><li><button type="button"><span>⒂</span></button></li> -->
											</ul>
										</div>
									</li>
									<li style="display:none"><button type="button" title="${lang.korean}" class="se2_char4"><span>${lang.korean}</span></button>
										<div class="se2_s_character">
											<ul class="husky_se2m_sCharacter_list">
												<li></li>
												<!-- 한글 목록 -->
												<!-- <li><button type="button"><span>ㄱ</span></button></li><li><button type="button"><span>ㄲ</span></button></li><li><button type="button"><span>ㄳ</span></button></li><li><button type="button"><span>ㄴ</span></button></li><li><button type="button"><span>ㄵ</span></button></li><li><button type="button"><span>ㄶ</span></button></li><li><button type="button"><span>ㄷ</span></button></li><li><button type="button"><span>ㄸ</span></button></li><li><button type="button"><span>ㄹ</span></button></li><li><button type="button"><span>ㄺ</span></button></li><li><button type="button"><span>ㄻ</span></button></li><li><button type="button"><span>ㄼ</span></button></li><li><button type="button"><span>ㄽ</span></button></li><li><button type="button"><span>ㄾ</span></button></li><li><button type="button"><span>ㄿ</span></button></li><li><button type="button"><span>ㅀ</span></button></li><li><button type="button"><span>ㅁ</span></button></li><li><button type="button"><span>ㅂ</span></button></li><li><button type="button"><span>ㅃ</span></button></li><li><button type="button"><span>ㅄ</span></button></li><li><button type="button"><span>ㅅ</span></button></li><li><button type="button"><span>ㅆ</span></button></li><li><button type="button"><span>ㅇ</span></button></li><li><button type="button"><span>ㅈ</span></button></li><li><button type="button"><span>ㅉ</span></button></li><li><button type="button"><span>ㅊ</span></button></li><li><button type="button"><span>ㅋ</span></button></li><li><button type="button"><span>ㅌ</span></button></li><li><button type="button"><span>ㅍ</span></button></li><li><button type="button"><span>ㅎ</span></button></li><li><button type="button"><span>ㅏ</span></button></li><li><button type="button"><span>ㅐ</span></button></li><li><button type="button"><span>ㅑ</span></button></li><li><button type="button"><span>ㅒ</span></button></li><li><button type="button"><span>ㅓ</span></button></li><li><button type="button"><span>ㅔ</span></button></li><li><button type="button"><span>ㅕ</span></button></li><li><button type="button"><span>ㅖ</span></button></li><li><button type="button"><span>ㅗ</span></button></li><li><button type="button"><span>ㅘ</span></button></li><li><button type="button"><span>ㅙ</span></button></li><li><button type="button"><span>ㅚ</span></button></li><li><button type="button"><span>ㅛ</span></button></li><li><button type="button"><span>ㅜ</span></button></li><li><button type="button"><span>ㅝ</span></button></li><li><button type="button"><span>ㅞ</span></button></li><li><button type="button"><span>ㅟ</span></button></li><li><button type="button"><span>ㅠ</span></button></li><li><button type="button"><span>ㅡ</span></button></li><li><button type="button"><span>ㅢ</span></button></li><li><button type="button"><span>ㅣ</span></button></li><li><button type="button"><span>ㅥ</span></button></li><li><button type="button"><span>ㅦ</span></button></li><li><button type="button"><span>ㅧ</span></button></li><li><button type="button"><span>ㅨ</span></button></li><li><button type="button"><span>ㅩ</span></button></li><li><button type="button"><span>ㅪ</span></button></li><li><button type="button"><span>ㅫ</span></button></li><li><button type="button"><span>ㅬ</span></button></li><li><button type="button"><span>ㅭ</span></button></li><li><button type="button"><span>ㅮ</span></button></li><li><button type="button"><span>ㅯ</span></button></li><li><button type="button"><span>ㅰ</span></button></li><li><button type="button"><span>ㅱ</span></button></li><li><button type="button"><span>ㅲ</span></button></li><li><button type="button"><span>ㅳ</span></button></li><li><button type="button"><span>ㅴ</span></button></li><li><button type="button"><span>ㅵ</span></button></li><li><button type="button"><span>ㅶ</span></button></li><li><button type="button"><span>ㅷ</span></button></li><li><button type="button"><span>ㅸ</span></button></li><li><button type="button"><span>ㅹ</span></button></li><li><button type="button"><span>ㅺ</span></button></li><li><button type="button"><span>ㅻ</span></button></li><li><button type="button"><span>ㅼ</span></button></li><li><button type="button"><span>ㅽ</span></button></li><li><button type="button"><span>ㅾ</span></button></li><li><button type="button"><span>ㅿ</span></button></li><li><button type="button"><span>ㆀ</span></button></li><li><button type="button"><span>ㆁ</span></button></li><li><button type="button"><span>ㆂ</span></button></li><li><button type="button"><span>ㆃ</span></button></li><li><button type="button"><span>ㆄ</span></button></li><li><button type="button"><span>ㆅ</span></button></li><li><button type="button"><span>ㆆ</span></button></li><li><button type="button"><span>ㆇ</span></button></li><li><button type="button"><span>ㆈ</span></button></li><li><button type="button"><span>ㆉ</span></button></li><li><button type="button"><span>ㆊ</span></button></li><li><button type="button"><span>ㆋ</span></button></li><li><button type="button"><span>ㆌ</span></button></li><li><button type="button"><span>ㆍ</span></button></li><li><button type="button"><span>ㆎ</span></button></li> -->
											</ul>
										</div>
									</li>
									<li><button type="button" title="${lang.greekLatin}" class="se2_char5"><span>${lang.greekLatin}</span></button>
										<div class="se2_s_character">
											<ul class="husky_se2m_sCharacter_list">
												<li></li>
												<!-- 그리스,라틴어 목록 -->
												<!-- <li><button type="button"><span>Α</span></button></li><li><button type="button"><span>Β</span></button></li><li><button type="button"><span>Γ</span></button></li><li><button type="button"><span>Δ</span></button></li><li><button type="button"><span>Ε</span></button></li><li><button type="button"><span>Ζ</span></button></li><li><button type="button"><span>Η</span></button></li><li><button type="button"><span>Θ</span></button></li><li><button type="button"><span>Ι</span></button></li><li><button type="button"><span>Κ</span></button></li><li><button type="button"><span>Λ</span></button></li><li><button type="button"><span>Μ</span></button></li><li><button type="button"><span>Ν</span></button></li><li><button type="button"><span>Ξ</span></button></li><li class="hover"><button type="button"><span>Ο</span></button></li><li><button type="button"><span>Π</span></button></li><li><button type="button"><span>Ρ</span></button></li><li><button type="button"><span>Σ</span></button></li><li><button type="button"><span>Τ</span></button></li><li><button type="button"><span>Υ</span></button></li><li><button type="button"><span>Φ</span></button></li><li><button type="button"><span>Χ</span></button></li><li><button type="button"><span>Ψ</span></button></li><li><button type="button"><span>Ω</span></button></li><li><button type="button"><span>α</span></button></li><li><button type="button"><span>β</span></button></li><li><button type="button"><span>γ</span></button></li><li><button type="button"><span>δ</span></button></li><li><button type="button"><span>ε</span></button></li><li><button type="button"><span>ζ</span></button></li><li><button type="button"><span>η</span></button></li><li><button type="button"><span>θ</span></button></li><li><button type="button"><span>ι</span></button></li><li><button type="button"><span>κ</span></button></li><li><button type="button"><span>λ</span></button></li><li><button type="button"><span>μ</span></button></li><li><button type="button"><span>ν</span></button></li><li><button type="button"><span>ξ</span></button></li><li><button type="button"><span>ο</span></button></li><li><button type="button"><span>π</span></button></li><li><button type="button"><span>ρ</span></button></li><li><button type="button"><span>σ</span></button></li><li><button type="button"><span>τ</span></button></li><li><button type="button"><span>υ</span></button></li><li><button type="button"><span>φ</span></button></li><li><button type="button"><span>χ</span></button></li><li><button type="button"><span>ψ</span></button></li><li><button type="button"><span>ω</span></button></li><li><button type="button"><span>Æ</span></button></li><li><button type="button"><span>Ð</span></button></li><li><button type="button"><span>Ħ</span></button></li><li><button type="button"><span>Ĳ</span></button></li><li><button type="button"><span>Ŀ</span></button></li><li><button type="button"><span>Ł</span></button></li><li><button type="button"><span>Ø</span></button></li><li><button type="button"><span>Œ</span></button></li><li><button type="button"><span>Þ</span></button></li><li><button type="button"><span>Ŧ</span></button></li><li><button type="button"><span>Ŋ</span></button></li><li><button type="button"><span>æ</span></button></li><li><button type="button"><span>đ</span></button></li><li><button type="button"><span>ð</span></button></li><li><button type="button"><span>ħ</span></button></li><li><button type="button"><span>I</span></button></li><li><button type="button"><span>ĳ</span></button></li><li><button type="button"><span>ĸ</span></button></li><li><button type="button"><span>ŀ</span></button></li><li><button type="button"><span>ł</span></button></li><li><button type="button"><span>ł</span></button></li><li><button type="button"><span>œ</span></button></li><li><button type="button"><span>ß</span></button></li><li><button type="button"><span>þ</span></button></li><li><button type="button"><span>ŧ</span></button></li><li><button type="button"><span>ŋ</span></button></li><li><button type="button"><span>ŉ</span></button></li><li><button type="button"><span>Б</span></button></li><li><button type="button"><span>Г</span></button></li><li><button type="button"><span>Д</span></button></li><li><button type="button"><span>Ё</span></button></li><li><button type="button"><span>Ж</span></button></li><li><button type="button"><span>З</span></button></li><li><button type="button"><span>И</span></button></li><li><button type="button"><span>Й</span></button></li><li><button type="button"><span>Л</span></button></li><li><button type="button"><span>П</span></button></li><li><button type="button"><span>Ц</span></button></li><li><button type="button"><span>Ч</span></button></li><li><button type="button"><span>Ш</span></button></li><li><button type="button"><span>Щ</span></button></li><li><button type="button"><span>Ъ</span></button></li><li><button type="button"><span>Ы</span></button></li><li><button type="button"><span>Ь</span></button></li><li><button type="button"><span>Э</span></button></li><li><button type="button"><span>Ю</span></button></li><li><button type="button"><span>Я</span></button></li><li><button type="button"><span>б</span></button></li><li><button type="button"><span>в</span></button></li><li><button type="button"><span>г</span></button></li><li><button type="button"><span>д</span></button></li><li><button type="button"><span>ё</span></button></li><li><button type="button"><span>ж</span></button></li><li><button type="button"><span>з</span></button></li><li><button type="button"><span>и</span></button></li><li><button type="button"><span>й</span></button></li><li><button type="button"><span>л</span></button></li><li><button type="button"><span>п</span></button></li><li><button type="button"><span>ф</span></button></li><li><button type="button"><span>ц</span></button></li><li><button type="button"><span>ч</span></button></li><li><button type="button"><span>ш</span></button></li><li><button type="button"><span>щ</span></button></li><li><button type="button"><span>ъ</span></button></li><li><button type="button"><span>ы</span></button></li><li><button type="button"><span>ь</span></button></li><li><button type="button"><span>э</span></button></li><li><button type="button"><span>ю</span></button></li><li><button type="button"><span>я</span></button></li> -->
											</ul>
										</div>
									</li>
									<li style="display:none"><button type="button" title="${lang.japanese}" class="se2_char6"><span>${lang.japanese}</span></button>
										<div class="se2_s_character">
											<ul class="husky_se2m_sCharacter_list">
												<li></li>
												<!-- 일본어 목록 -->
												<!-- <li><button type="button"><span>ぁ</span></button></li><li class="hover"><button type="button"><span>あ</span></button></li><li><button type="button"><span>ぃ</span></button></li><li><button type="button"><span>い</span></button></li><li><button type="button"><span>ぅ</span></button></li><li><button type="button"><span>う</span></button></li><li><button type="button"><span>ぇ</span></button></li><li><button type="button"><span>え</span></button></li><li><button type="button"><span>ぉ</span></button></li><li><button type="button"><span>お</span></button></li><li><button type="button"><span>か</span></button></li><li><button type="button"><span>が</span></button></li><li><button type="button"><span>き</span></button></li><li><button type="button"><span>ぎ</span></button></li><li><button type="button"><span>く</span></button></li><li><button type="button"><span>ぐ</span></button></li><li><button type="button"><span>け</span></button></li><li><button type="button"><span>げ</span></button></li><li><button type="button"><span>こ</span></button></li><li><button type="button"><span>ご</span></button></li><li><button type="button"><span>さ</span></button></li><li><button type="button"><span>ざ</span></button></li><li><button type="button"><span>し</span></button></li><li><button type="button"><span>じ</span></button></li><li><button type="button"><span>す</span></button></li><li><button type="button"><span>ず</span></button></li><li><button type="button"><span>せ</span></button></li><li><button type="button"><span>ぜ</span></button></li><li><button type="button"><span>そ</span></button></li><li><button type="button"><span>ぞ</span></button></li><li><button type="button"><span>た</span></button></li><li><button type="button"><span>だ</span></button></li><li><button type="button"><span>ち</span></button></li><li><button type="button"><span>ぢ</span></button></li><li><button type="button"><span>っ</span></button></li><li><button type="button"><span>つ</span></button></li><li><button type="button"><span>づ</span></button></li><li><button type="button"><span>て</span></button></li><li><button type="button"><span>で</span></button></li><li><button type="button"><span>と</span></button></li><li><button type="button"><span>ど</span></button></li><li><button type="button"><span>な</span></button></li><li><button type="button"><span>に</span></button></li><li><button type="button"><span>ぬ</span></button></li><li><button type="button"><span>ね</span></button></li><li><button type="button"><span>の</span></button></li><li><button type="button"><span>は</span></button></li><li><button type="button"><span>ば</span></button></li><li><button type="button"><span>ぱ</span></button></li><li><button type="button"><span>ひ</span></button></li><li><button type="button"><span>び</span></button></li><li><button type="button"><span>ぴ</span></button></li><li><button type="button"><span>ふ</span></button></li><li><button type="button"><span>ぶ</span></button></li><li><button type="button"><span>ぷ</span></button></li><li><button type="button"><span>へ</span></button></li><li><button type="button"><span>べ</span></button></li><li><button type="button"><span>ぺ</span></button></li><li><button type="button"><span>ほ</span></button></li><li><button type="button"><span>ぼ</span></button></li><li><button type="button"><span>ぽ</span></button></li><li><button type="button"><span>ま</span></button></li><li><button type="button"><span>み</span></button></li><li><button type="button"><span>む</span></button></li><li><button type="button"><span>め</span></button></li><li><button type="button"><span>も</span></button></li><li><button type="button"><span>ゃ</span></button></li><li><button type="button"><span>や</span></button></li><li><button type="button"><span>ゅ</span></button></li><li><button type="button"><span>ゆ</span></button></li><li><button type="button"><span>ょ</span></button></li><li><button type="button"><span>よ</span></button></li><li><button type="button"><span>ら</span></button></li><li><button type="button"><span>り</span></button></li><li><button type="button"><span>る</span></button></li><li><button type="button"><span>れ</span></button></li><li><button type="button"><span>ろ</span></button></li><li><button type="button"><span>ゎ</span></button></li><li><button type="button"><span>わ</span></button></li><li><button type="button"><span>ゐ</span></button></li><li><button type="button"><span>ゑ</span></button></li><li><button type="button"><span>を</span></button></li><li><button type="button"><span>ん</span></button></li><li><button type="button"><span>ァ</span></button></li><li><button type="button"><span>ア</span></button></li><li><button type="button"><span>ィ</span></button></li><li><button type="button"><span>イ</span></button></li><li><button type="button"><span>ゥ</span></button></li><li><button type="button"><span>ウ</span></button></li><li><button type="button"><span>ェ</span></button></li><li><button type="button"><span>エ</span></button></li><li><button type="button"><span>ォ</span></button></li><li><button type="button"><span>オ</span></button></li><li><button type="button"><span>カ</span></button></li><li><button type="button"><span>ガ</span></button></li><li><button type="button"><span>キ</span></button></li><li><button type="button"><span>ギ</span></button></li><li><button type="button"><span>ク</span></button></li><li><button type="button"><span>グ</span></button></li><li><button type="button"><span>ケ</span></button></li><li><button type="button"><span>ゲ</span></button></li><li><button type="button"><span>コ</span></button></li><li><button type="button"><span>ゴ</span></button></li><li><button type="button"><span>サ</span></button></li><li><button type="button"><span>ザ</span></button></li><li><button type="button"><span>シ</span></button></li><li><button type="button"><span>ジ</span></button></li><li><button type="button"><span>ス</span></button></li><li><button type="button"><span>ズ</span></button></li><li><button type="button"><span>セ</span></button></li><li><button type="button"><span>ゼ</span></button></li><li><button type="button"><span>ソ</span></button></li><li><button type="button"><span>ゾ</span></button></li><li><button type="button"><span>タ</span></button></li><li><button type="button"><span>ダ</span></button></li><li><button type="button"><span>チ</span></button></li><li><button type="button"><span>ヂ</span></button></li><li><button type="button"><span>ッ</span></button></li><li><button type="button"><span>ツ</span></button></li><li><button type="button"><span>ヅ</span></button></li><li><button type="button"><span>テ</span></button></li><li><button type="button"><span>デ</span></button></li><li><button type="button"><span>ト</span></button></li><li><button type="button"><span>ド</span></button></li><li><button type="button"><span>ナ</span></button></li><li><button type="button"><span>ニ</span></button></li><li><button type="button"><span>ヌ</span></button></li><li><button type="button"><span>ネ</span></button></li><li><button type="button"><span>ノ</span></button></li><li><button type="button"><span>ハ</span></button></li><li><button type="button"><span>バ</span></button></li><li><button type="button"><span>パ</span></button></li><li><button type="button"><span>ヒ</span></button></li><li><button type="button"><span>ビ</span></button></li><li><button type="button"><span>ピ</span></button></li><li><button type="button"><span>フ</span></button></li><li><button type="button"><span>ブ</span></button></li><li><button type="button"><span>プ</span></button></li><li><button type="button"><span>ヘ</span></button></li><li><button type="button"><span>ベ</span></button></li><li><button type="button"><span>ペ</span></button></li><li><button type="button"><span>ホ</span></button></li><li><button type="button"><span>ボ</span></button></li><li><button type="button"><span>ポ</span></button></li><li><button type="button"><span>マ</span></button></li><li><button type="button"><span>ミ</span></button></li><li><button type="button"><span>ム</span></button></li><li><button type="button"><span>メ</span></button></li><li><button type="button"><span>モ</span></button></li><li><button type="button"><span>ャ</span></button></li><li><button type="button"><span>ヤ</span></button></li><li><button type="button"><span>ュ</span></button></li><li><button type="button"><span>ユ</span></button></li><li><button type="button"><span>ョ</span></button></li><li><button type="button"><span>ヨ</span></button></li><li><button type="button"><span>ラ</span></button></li><li><button type="button"><span>リ</span></button></li><li><button type="button"><span>ル</span></button></li><li><button type="button"><span>レ</span></button></li><li><button type="button"><span>ロ</span></button></li><li><button type="button"><span>ヮ</span></button></li><li><button type="button"><span>ワ</span></button></li><li><button type="button"><span>ヰ</span></button></li><li><button type="button"><span>ヱ</span></button></li><li><button type="button"><span>ヲ</span></button></li><li><button type="button"><span>ン</span></button></li><li><button type="button"><span>ヴ</span></button></li><li><button type="button"><span>ヵ</span></button></li><li><button type="button"><span>ヶ</span></button></li> -->
											</ul>
										</div>
									</li>
								</ul>
								<p class="se2_apply_character">
									<label for="char_preview">${lang.selectedSymbol}</label> <input type="text" name="char_preview" id="char_preview" value="®º⊆●○" class="input_ty1"><button type="button" class="se2_confirm"><span>${lang.apply}</span></button><button type="button" class="se2_cancel husky_se2m_sCharacter_close"><span>${lang.cancel}</span></button>
								</p>
							</div>
						</div>
					</div>
					<!-- //특수기호 -->
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
				<ul class="se2_multy" style="right:auto">
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
			<button type="button" class="se2_inputarea_controller husky_seditor_editingArea_verticalResizer" title="${lang.resizeWindow}"><span style="display:none">${lang.resizeWindow}</span></button>
			<ul class="se2_converter">
				<li class="active"><button type="button" class="se2_to_editor"><span>Editor</span></button></li>
				<li><button type="button" class="se2_to_html"><span>HTML</span></button></li>
				<li style="display:none"><button type="button" class="se2_to_text"><span>TEXT</span></button></li>
			</ul>
		</div>
		<!-- //입력창조절/ 모드전환 -->


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
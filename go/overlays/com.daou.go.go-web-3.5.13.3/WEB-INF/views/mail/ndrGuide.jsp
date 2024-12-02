<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<%@include file="header.jsp"%>
<script type="text/javascript">

jQuery(document).ready(function() {
	initEvent();
});

function moveScroll(){
	var searchStr = jQuery("#searchNdrStr").val();
	if(jQuery(".smtp[data-code='"+searchStr+"']").length < 1){
		return;
	}
	var scrollPosition = jQuery(".smtp[data-code='"+searchStr+"']").offset().top;
	jQuery('html').animate({
		scrollTop: scrollPosition - 230
	}, 300);
}

function initEvent(){
	//이미지 레이어 닫기
	jQuery("#ndrLayerCloseBtn").off("click");
	jQuery("#ndrLayerCloseBtn").on("click",function(){
		jQuery("div.ndrLayer").hide();
	});
	
	jQuery("#ndrLayerOpenBtn").off("click");
	jQuery("#ndrLayerOpenBtn").on("click",function(){
		jQuery("div.ndrLayer").show();
	});
	
	
	//smtp 검색 버튼
	jQuery("#ndrSearchBtn").off("click");
	jQuery("#ndrSearchBtn").on("click",function(){
		moveScroll();
	});
	
	//smtp 엔터 검색
	jQuery("#searchNdrStr").off("keydown");
	jQuery("#searchNdrStr").on("keydown",function(key) {
		if (key.keyCode == 13) {
			moveScroll();
		}
	});
}

</script>
</head>
<body class="popup">
<div class="ndr_guide">
	 <div class="ndr_guide_header">
		<div  class="tit">
			<div><tctl:msg key="mail.ndr.title"/></div>
			<span class="btn_ndr_help" id="ndrLayerOpenBtn"><tctl:msg key="mail.ndr.help"/></span>
		</div>
		<div class="ndr_search">
			<input class="txt" type="text" id="searchNdrStr" name="" placeholder="<tctl:msg key='mail.ndr.placeholder'/>">
			<button type="button" id="ndrSearchBtn" class="ic_gnb_advanced btn_search_w" title="<tctl:msg key='mail.ndr.search'/>"></button>
		</div>
		<table class="type_normal list_ndr">
			<thead>
				<tr>
					<th class="smtp"><span><tctl:msg key="mail.ndr.smtp"/></span></th>
					<th class="status"><tctl:msg key="mail.ndr.status"/></th>
					<th class=""><tctl:msg key="mail.ndr.message"/></th>
					<th class=""><tctl:msg key="mail.ndr.phenomenon"/></th>
					<th class=""><tctl:msg key="mail.ndr.solution"/></th>
				</tr>
			</thead>
		</table>
	 </div>
	  <div class="ndr_guide_body">
	<table class="type_normal list_ndr">
		<tbody>
			<tr>
				<td class="smtp" data-code="421">421</td>
				<td class="status"></td>
				<td>Your sent too many messages to specific receiver</td>
				<td><tctl:msg key="mail.ndr.message.421.01"/></td>
				<td><tctl:msg key="mail.ndr.message.421.02"/></td>
			</tr>
			<tr>
				<td class="smtp">421</td>
				<td></td>
				<td>Your IP is filtered by IP Rate Control</td>
				<td><tctl:msg key="mail.ndr.message.421.03"/></td>
				<td><tctl:msg key="mail.ndr.message.421.04"/></td>
			</tr>
			<tr>
				<td class="smtp">421</td>
				<td></td>
				<td>Your IP is filtered by RBL</td>
				<td><tctl:msg key="mail.ndr.message.421.05"/></td>
				<td><tctl:msg key="mail.ndr.message.421.06"/></td>
			</tr>
			<tr>
				<td class="smtp" data-code="441">441</td>
				<td>4.4.1</td>
				<td>No answer from host</td>
				<td><tctl:msg key="mail.ndr.message.441.01"/></td>
				<td><tctl:msg key="mail.ndr.message.441.02"/></td>
			</tr>
			<tr>
				<td class="smtp" data-code="451">451</td>
				<td>4.2.2</td>
				<td>the email account that you tried to reach is over quota</td>
				<td><tctl:msg key="mail.ndr.message.451.01"/></td>
				<td><tctl:msg key="mail.ndr.message.451.02"/></td>
			</tr>
			<tr>
				<td class="smtp">451</td>
				<td>4.3.0</td>
				<td>Other or undefined mail system status</td>
				<td><tctl:msg key="mail.ndr.message.451.03"/></td>
				<td><tctl:msg key="mail.ndr.message.451.04"/></td>
			</tr>
			<tr>
				<td class="smtp">451</td>
				<td>4.4.0</td>
				<td>DNS resolving error</td>
				<td><tctl:msg key="mail.ndr.message.451.05"/></td>
				<td><tctl:msg key="mail.ndr.message.451.06"/></td>
			</tr>
			<tr>
				<td class="smtp">451</td>
				<td>4.4.2</td>
				<td>Bad connection(io timeout)</td>
				<td><tctl:msg key="mail.ndr.message.451.07"/></td>
				<td><tctl:msg key="mail.ndr.message.451.08"/></td>
			</tr>
			<tr>
				<td class="smtp">451</td>
				<td>4.4.2</td>
				<td>Bad connection(connection reset)</td>
				<td><tctl:msg key="mail.ndr.message.451.09"/></td>
				<td><tctl:msg key="mail.ndr.message.451.10"/></td>
			</tr>
			<tr>
				<td class="smtp">451</td>
				<td>4.2.0</td>
				<td>Get user info error</td>
				<td><tctl:msg key="mail.ndr.message.451.11"/></td>
				<td><tctl:msg key="mail.ndr.message.451.12"/></td>
			</tr>
			<tr>
				<td class="smtp">451</td>
				<td>4.2.0</td>
				<td>find userhost error</td>
				<td><tctl:msg key="mail.ndr.message.451.13"/></td>
				<td><tctl:msg key="mail.ndr.message.451.14"/></td>
			</tr>
			<tr>
				<td class="smtp">451</td>
				<td>4.2.0</td>
				<td>mailhosts are defered</td>
				<td><tctl:msg key="mail.ndr.message.451.15"/></td>
				<td><tctl:msg key="mail.ndr.message.451.16"/></td>
			</tr>
			<tr>
				<td class="smtp">451</td>
				<td>4.3.0</td>
				<td>Too many retry</td>
				<td><tctl:msg key="mail.ndr.message.451.17"/></td>
				<td><tctl:msg key="mail.ndr.message.451.18"/></td>
			</tr>
			<tr>
				<td class="smtp" data-code="452">452</td>
				<td>4.3.1</td>
				<td>Insufficient system resources</td>
				<td><tctl:msg key="mail.ndr.message.452.01"/></td>
				<td><tctl:msg key="mail.ndr.message.452.02"/></td>
			</tr>
			<tr>
				<td class="smtp" data-code="512">512</td>
				<td>5.1.2</td>
				<td>Bad destination system address</td>
				<td><tctl:msg key="mail.ndr.message.512.01"/></td>
				<td><tctl:msg key="mail.ndr.message.512.02"/></td>
			</tr>
			<tr>
				<td class="smtp" data-code="521">521</td>
				<td>5.7.1</td>
				<td><tctl:msg key="mail.ndr.message.521.01"/></td>
				<td><tctl:msg key="mail.ndr.message.521.02"/></td>
				<td><tctl:msg key="mail.ndr.message.521.03"/></td>
			</tr>
			<tr>
				<td class="smtp" data-code="550">550</td>
				<td>5.1.1</td>
				<td>No search user</td>
				<td><tctl:msg key="mail.ndr.message.550.01"/></td>
				<td><tctl:msg key="mail.ndr.message.550.02"/></td>
			</tr>
			<tr>
				<td class="smtp">550</td>
				<td>5.1.1</td>
				<td>User account is overquota</td>
				<td><tctl:msg key="mail.ndr.message.550.03"/></td>
				<td><tctl:msg key="mail.ndr.message.550.04"/></td>
			</tr>
			<tr>
				<td class="smtp">550</td>
				<td>5.7.1</td>
				<td>You are NOT allowed to RELAY. But can not return mail because of null reverse path</td>
				<td><tctl:msg key="mail.ndr.message.550.05"/></td>
				<td><tctl:msg key="mail.ndr.message.550.06"/></td>
			</tr>
			<tr>
				<td class="smtp">550</td>
				<td>5.7.1</td>
				<td>Your access to submit messages to this e-mail system has been rejected</td>
				<td><tctl:msg key="mail.ndr.message.550.07"/></td>
				<td><tctl:msg key="mail.ndr.message.550.08"/></td>
			</tr>
			<tr>
				<td class="smtp">550</td>
				<td>5.7.1</td>
				<td>Our system has detected that this message is likely unsolicited mail.</br>To reduce the amount of spam sent to Gmail</td>
				<td><tctl:msg key="mail.ndr.message.550.09"/></td>
				<td><tctl:msg key="mail.ndr.message.550.10"/></td>
			</tr>
			<tr>
				<td class="smtp">550</td>
				<td></td>
				<td>Please contact your Internet service provider since part of their network is on our block list</td>
				<td><tctl:msg key="mail.ndr.message.550.11"/></td>
				<td><tctl:msg key="mail.ndr.message.550.12"/></td>
			</tr>
			<tr>
				<td class="smtp">550</td>
				<td></td>
				<td>Service unavailable; Client host blocked using FBLW15;</td>
				<td><tctl:msg key="mail.ndr.message.550.13"/></td>
				<td><tctl:msg key="mail.ndr.message.550.14"/></td>
			</tr>
			<tr>
				<td class="smtp">550</td>
				<td>5.2.1</td>
				<td>Not mail user</td>
				<td><tctl:msg key="mail.ndr.message.550.15"/></td>
				<td><tctl:msg key="mail.ndr.message.550.16"/></td>
			</tr>
			<tr>
				<td class="smtp">550</td>
				<td>5.2.1</td>
				<td>Classified as SPAM, so returned</td>
				<td><tctl:msg key="mail.ndr.message.550.17"/></td>
				<td><tctl:msg key="mail.ndr.message.550.18"/></td>
			</tr>
			<tr>
				<td class="smtp" >550</td>
				<td>5.2.1</td>
				<td>Classified as VIRUS, so returned</td>
				<td><tctl:msg key="mail.ndr.message.550.19"/></td>
				<td><tctl:msg key="mail.ndr.message.550.20"/></td>
			</tr>
			<tr>
				<td class="smtp" data-code="552">552</td>
				<td>5.2.3</td>
				<td>Message length message exceeds maximum fixed size(22528000)</td>
				<td><tctl:msg key="mail.ndr.message.552.01"/></td>
				<td><tctl:msg key="mail.ndr.message.552.02"/></td>
			</tr>
			<tr>
				<td class="smtp">552</td>
				<td>5.2.1</td>
				<td>Have too many attached file</td>
				<td><tctl:msg key="mail.ndr.message.552.03"/></td>
				<td><tctl:msg key="mail.ndr.message.552.04"/></td>
			</tr>
			<tr>
				<td class="smtp">552</td>
				<td>5.2.1</td>
				<td>Have too long attached file name</td>
				<td><tctl:msg key="mail.ndr.message.552.05"/></td>
				<td><tctl:msg key="mail.ndr.message.552.06"/></td>
			</tr>
			<tr>
				<td class="smtp" data-code="553">553</td>
				<td></td>
				<td>Access Denied Please visit http://www.spamhaus.org for details.</td>
				<td><tctl:msg key="mail.ndr.message.553.01"/></td>
				<td><tctl:msg key="mail.ndr.message.553.02"/></td>
			</tr>
			<tr>
				<td class="smtp" data-code="554">554</td>
				<td></td>
				<td><tctl:msg key="mail.ndr.message.554.01"/></td>
				<td><tctl:msg key="mail.ndr.message.554.02"/></td>
				<td><tctl:msg key="mail.ndr.message.554.03"/></td>
			</tr>
			<tr>
				<td class="smtp">554</td>
				<td></td>
				<td>walipinc13 bizsmtp Connection rejected. Reverse DNS for 124.243.61.57 does not exist</td>
				<td><tctl:msg key="mail.ndr.message.554.04"/></td>
				<td><tctl:msg key="mail.ndr.message.554.05"/></td>
			</tr>
			<tr>
				<td class="smtp"><tctl:msg key="mail.ndr.message.etc.01"/></td>
				<td></td>
				<td></td>
				<td><tctl:msg key="mail.ndr.message.etc.02"/></td>
				<td><tctl:msg key="mail.ndr.message.etc.03"/></td>
			</tr>
		</tbody>
	</table>
</div>
</div>
<div class="overlay ndrLayer"></div>
<div class="layer_ndr ndrLayer">
	<div class="content">
		<img src="/resources/images/ndr_${locale}.png" alt=""/>
		<span id="ndrLayerCloseBtn" class="ic_gnb_advanced btn_x_b" title="<tctl:msg key='mail.ndr.close'/>"></span>
	</div>
</div>
</body>
</html>
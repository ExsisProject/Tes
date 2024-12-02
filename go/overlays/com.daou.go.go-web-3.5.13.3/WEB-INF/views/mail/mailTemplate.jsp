<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>

<script id="mail_list_header_tmpl" type="text/x-handlebars-template">
<table class="type_normal mail_list list_mail001">
<thead>
	<tr>
		<!--
			* sorting 			- 정렬을 지원하는 항목 배경
			* sorting_disabled 	- 정렬을 지원하지 않는 항목
			* sorting_desc 		- 내림차순 정렬 선택됨
			* sorting_asc 		- 오름차순 정렬 선택됨
		-->
		<th class="sorting_disabled align_c check"><!--input type="checkbox" id="mailListAllCheck" evt-rol="list-select-all" value="off"/--></th>
		<th class="sorting_disabled {{#if viewMeInCc}}action_cc{{else}}action{{/if}}">
			<div class="func_wrap">
				{{#notEqual folderEncName "Drafts"}}
				{{#notEqual folderEncName "Reserved"}}
				<span class="btn_wrap"><span class="ic ic_important_on" title="<tctl:msg key="mail.flag.flaged.message"/>"></span></span>
				{{/notEqual}}
				{{/notEqual}}
				<span class="ic ic_read_no" title="<tctl:msg key="mail.flag.seen.message"/>/<tctl:msg key="mail.flag.unseen.message"/>"></span>
				<span class="ic ic_file_s" title="<tctl:msg key="mail.attach"/>"></span>
				{{#if viewMeInCc}}<span class="btn_wrap"><span title="<tctl:msg key="mail.cc"/>" class="ic_con ic_cc"></span></span>{{/if}}
			</div>
		</th>
		{{#equal folderType 'all'}}
		<th class="sorting_disabled mailbox" style="padding-left:5px;">
			<span class="title_sort"><tctl:msg key="mail.folder"/></span>
		</th>
		{{/equal}}
		{{#if exceptFolder}}
			<th class="{{#equal sortBy 'to'}}{{#equal sortDir 'desc'}}sorting_desc{{else}}sorting_asc{{/equal}}{{else}}sorting{{/equal}} to">
				<span class="title_sort" evt-rol="list-sort" by="to"><tctl:msg key="mail.to"/><ins class="ic"></ins>{{#equal sortBy 'to'}}<span class="selected"></span>{{/equal}}</span>
			</th>
		{{else}}
			<th class="{{#equal sortBy 'from'}}{{#equal sortDir 'desc'}}sorting_desc{{else}}sorting_asc{{/equal}}{{else}}sorting{{/equal}} to">
				<span class="title_sort" evt-rol="list-sort" by="from"><tctl:msg key="mail.from"/><ins class="ic"></ins>{{#equal sortBy 'from'}}<span class="selected"></span>{{/equal}}</span>
			</th>
		{{/if}}
		<th class="{{#equal sortBy 'subj'}}{{#equal sortDir 'desc'}}sorting_desc{{else}}sorting_asc{{/equal}}{{else}}sorting{{/equal}} subject">
			<span class="title_sort" evt-rol="list-sort" by="subj"><tctl:msg key="mail.subject"/><ins class="ic"></ins>{{#equal sortBy 'subj'}}<span class="selected"></span>{{/equal}}</span>
		</th>
		<th class="{{#equal sortBy 'arrival'}}{{#equal sortDir 'desc'}}sorting_desc{{else}}sorting_asc{{/equal}}{{else}}sorting{{/equal}} redate">
			<span class="title_sort" evt-rol="list-sort" by="arrival">
				{{#equal folderFullName 'Sent'}}<tctl:msg key="mail.senddate"/>{{else}}{{#equal folderFullName 'Drafts'}}<tctl:msg key="mail.writedate"/>{{else}}{{#equal folderFullName 'Reserved'}}<tctl:msg key="mail.reserveddate"/>{{else}}<tctl:msg key="mail.receivedate"/>{{/equal}}{{/equal}}{{/equal}}
				<ins class="ic"></ins>{{#equal sortBy 'arrival'}}<span class="selected"></span>{{/equal}}
			</span>
		</th>
		<th class="{{#equal sortBy 'size'}}{{#equal sortDir 'desc'}}sorting_desc{{else}}sorting_asc{{/equal}}{{else}}sorting{{/equal}} size">
			<span class="title_sort" evt-rol="list-sort" by="size"><tctl:msg key="mail.size"/><ins class="ic"></ins>{{#equal sortBy 'size'}}<span class="selected"></span>{{/equal}}</span>
		</th>
	</tr>
</thead>
</table>
</script>

<script id="mail_list_tmpl" type="text/x-handlebars-template">
	<table class="type_normal mail_list list_mail001">
		<tbody>
			<tr id="allSelectTr" class="tb_option" style="display:none;">
				<td colspan="{{#equal folderType 'all'}}7{{else}}6{{/equal}}">
					<p id="allSelectMsg1" class="desc"></p>
					<p id="allSelectMsg2" class="desc"></p>
					<p id="allSelectMsg3" class="desc"></p>
				</td>
			</tr>
			{{#if messageList}}
			{{#each_with_index messageList}}
			{{#equal ../sortBy 'arrival'}}
			{{printDateDesc ../../folderType ../term ../../dateFormatUtc}}
			{{/equal}}
			<tr id="{{folderEncName}}_{{id}}" class="{{#if seen}} {{else}}read_no{{/if}}" folder="{{folderEncName}}" uid="{{id}}" {{#notEqual ../folderType 'quotaviolate'}}style="cursor: pointer;"{{/notEqual}}">
				<td class="align_c check"><input type="checkbox" name="msgId" evt-rol="check-list" value="{{id}}" data-femail="{{fromEscape}}" data-temail="{{toEscape}}"></td>
				<td class="{{#if ../viewMeInCc}}action_cc{{else}}action{{/if}}">
					<div class="func_wrap">
						{{#notEqual folderEncName "Drafts"}}
						{{#notEqual folderEncName "Reserved"}}
						<span class="btn_wrap"><span evt-rol="switch-flag" flag="F" {{#contains flag 'F'}}flaged="on" class="ic ic_important_on"{{else}}flaged="off" class="ic ic_important_off"{{/contains}} title="<tctl:msg key="mail.flag.flaged.message"/>"></span></span>
						{{/notEqual}}
						{{/notEqual}}
						{{flagClass flag}}
						{{#contains flag 'T'}}<span class="ic ic_file_s" title="<tctl:msg key="mail.attach"/>"></span>{{/contains}}
						{{#if existMeInCc}}<span class="ic_con ic_cc" title="<tctl:msg key="mail.cc"/>"></span>{{/if}}
					</div>
				</td>
				{{#equal ../folderType 'all'}}
				<td class="mailbox mailPadding"><span class="mailbox">{{folderDepthName folderDepthName}}</span></td>
				{{/equal}}
				<td class="to mailPadding" folder="{{folderEncName}}" uid="{{id}}" {{#notEqual ../folderType 'quotaviolate'}}evt-rol="{{#equal ../../folderType 'drafts'}}draft-message{{else}}read-message{{/equal}}{{/notEqual}}">
					<span class="btn_wrap" evt-rol="from-to-submenu" title="{{#if ../exceptFolder}}{{#if ../../mailExposure}}{{to}}{{else}}{{getEmailNotInCompanyDomain ../../../companyDomainList to}}{{/if}}{{else}}{{#if ../../mailExposure}}{{from}}{{else}}{{getEmailNotInCompanyDomain ../../../companyDomainList from}}{{/if}}{{/if}}" data-email="{{#if ../exceptFolder}}{{toEscape}}{{else}}{{fromEscape}}{{/if}}">
						<span class="name">
							{{#if ../exceptFolder}}
								{{#empty sendToSimple}}
									(<tctl:msg key="mail.to.empty"/>)
								{{else}}
									{{sendToSimple}}
								{{/empty}}
							{{else}}
								{{fromToSimple}}
							{{/if}}
						</span>
					</span>
					<div style="position:relative;display:none;" class="layerPop"></div>
				</td>
				<td class="subject mailPadding" folder="{{folderEncName}}" uid="{{id}}" {{#notEqual ../folderType 'quotaviolate'}}evt-rol="{{#equal ../../folderType 'drafts'}}draft-message{{else}}read-message{{/equal}}{{/notEqual}}">
                    {{#equal priority 'HIGH'}}<span class="ic_con ic_exclamation"></span>{{/equal}}
						{{#each tagList}}
							{{#equal ../../folderType 'shared'}}
							<span id="tag_{{../../folderEncName}}_{{../../id}}_{{id}}" class="txt_form" data-tagid="{{id}}">
								<span class="ic_tag {{color}}"><span class="tail_r"><span></span></span></span>
							</span>
							{{else}}
							<span id="tag_{{../../folderEncName}}_{{../../id}}_{{id}}" class="txt_form" evt-rol="self-remove-message-tagging" data-tagid="{{id}}">
								<span class="ic_tag {{color}}"><span class="tail_r"><span></span></span></span>
								<span class="tool_tip"><tctl:msg key="comn.clear" /><i class="tail"></i></span>
							</span>
							{{/equal}}
						{{/each}}
						<span class="subject preview" {{#notEqual ../folderType 'quotaviolate'}}data-preview="{{preview}}"{{/notEqual}}>
							{{#equal subject ""}}
								<tctl:msg key="header.nosubject"/>
							{{else}}
								{{#if ../exceptFolder}}
									{{subject}}
								{{else}}
									{{#lessThen spamRate 0}}<strike>{{subject}}<strike>{{else}}{{subject}}{{/lessThen}}
								{{/if}}
							{{/equal}}
						</span>
					{{#notEqual ../folderType 'drafts'}}
					{{#notEqual ../../folderType 'quotaviolate'}}
					<span class="btn_wrap">
						<span evt-rol="read-message-popup" title="<tctl:msg key="mail.popupview"/>" class="ic_classic ic_blank"></span>
					</span>
					{{/notEqual}}
					{{/notEqual}}
				</td>
				<td class="redate mailPadding"><span class="date">{{#equal ../folderType 'sent'}}{{printListDate sentDateUtc}}{{else}}{{printListDate dateUtc}}{{/equal}}</span></td>
				<td class="size mailPadding" style="width:68px;"><span class="num">{{size}}</span></td>
			</tr>
			{{/each_with_index}}
			{{else}}
			<tr>
				<td colspan="{{#equal folderType 'all'}}7{{else}}6{{/equal}}"><p class="data_null"><tctl:msg key="mail.notexist"/></p></td>
			</tr>
			{{/if}}
		</tbody>
	</table>
</script>
<script id="mail_list_horizon_header_tmpl" type="text/x-handlebars-template">
<table class="type_normal mail_list list_mail001_1">
<thead>
	<tr>
		<!--
			* sorting 			- 정렬을 지원하는 항목 배경
			* sorting_disabled 	- 정렬을 지원하지 않는 항목
			* sorting_desc 		- 내림차순 정렬 선택됨
			* sorting_asc 		- 오름차순 정렬 선택됨
		-->
		<th class="sorting_disabled align_c check"><input type="checkbox" id="mailListAllCheck" evt-rol="list-select-all" value="off"/></th>
		<th class="sorting_disabled {{#if viewMeInCc}}action_cc{{else}}action{{/if}}">
			<div class="func_wrap">
				{{#notEqual folderEncName "Drafts"}}
				{{#notEqual folderEncName "Reserved"}}
				<span class="btn_wrap"><span class="ic ic_important_on" title="<tctl:msg key="mail.flag.flaged.message"/>"></span></span>
				{{/notEqual}}
				{{/notEqual}}
				<span class="ic ic_read_no" title="<tctl:msg key="mail.flag.seen.message"/>/<tctl:msg key="mail.flag.unseen.message"/>"></span>
				<span class="ic ic_file_s" title="<tctl:msg key="mail.attach"/>"></span>
				{{#if viewMeInCc}}<span title="<tctl:msg key="mail.cc"/>" class="ic_con ic_cc"></span>{{/if}}
			</div>
		</th>
		{{#if exceptFolder}}
			<th class="{{#equal sortBy 'to'}}{{#equal sortDir 'desc'}}sorting_desc{{else}}sorting_asc{{/equal}}{{else}}sorting{{/equal}} to">
				<span class="title_sort" evt-rol="list-sort" by="to"><tctl:msg key="mail.to"/><ins class="ic"></ins>{{#equal sortBy 'to'}}<span class="selected"></span>{{/equal}}</span>
			</th>
		{{else}}
			<th class="{{#equal sortBy 'from'}}{{#equal sortDir 'desc'}}sorting_desc{{else}}sorting_asc{{/equal}}{{else}}sorting{{/equal}} to">
				<span class="title_sort" evt-rol="list-sort" by="from"><tctl:msg key="mail.from"/><ins class="ic"></ins>{{#equal sortBy 'from'}}<span class="selected"></span>{{/equal}}</span>
			</th>
		{{/if}}
		<th class="{{#equal sortBy 'subj'}}{{#equal sortDir 'desc'}}sorting_desc{{else}}sorting_asc{{/equal}}{{else}}sorting{{/equal}} subject">
			<span class="title_sort" evt-rol="list-sort" by="subj"><tctl:msg key="mail.subject"/><ins class="ic"></ins>{{#equal sortBy 'subj'}}<span class="selected"></span>{{/equal}}</span>
		</th>
		<th class="{{#equal sortBy 'arrival'}}{{#equal sortDir 'desc'}}sorting_desc{{else}}sorting_asc{{/equal}}{{else}}sorting{{/equal}} redate">
			<span class="title_sort" evt-rol="list-sort" by="arrival"><tctl:msg key="mail.date"/><ins class="ic"></ins>{{#equal sortBy 'arrival'}}<span class="selected"></span>{{/equal}}</span>
		</th>
		<th class="{{#equal sortBy 'size'}}{{#equal sortDir 'desc'}}sorting_desc{{else}}sorting_asc{{/equal}}{{else}}sorting{{/equal}} align_r size">
			<span class="title_sort" evt-rol="list-sort" by="size"><tctl:msg key="mail.size"/><ins class="ic"></ins>{{#equal sortBy 'size'}}<span class="selected"></span>{{/equal}}</span>
		</th>
	</tr>
</thead>
</table>
</script>
<script id="mail_list_horizon_tmpl" type="text/x-handlebars-template">
<table class="type_normal mail_list list_mail001_1">
	<tbody>
			<tr id="allSelectTr" class="tb_option" style="display:none;">
				<td colspan="{{#equal folderType 'all'}}5{{else}}4{{/equal}}">
					<p id="allSelectMsg1" class="desc"></p>
					<p id="allSelectMsg2" class="desc"></p>
					<p id="allSelectMsg3" class="desc"></p>
				</td>
			</tr>
			{{#if messageList}}
			{{#each_with_index messageList}}
			{{#equal ../sortBy 'arrival'}}
			{{printDateDesc ../../folderType ../term ../../dateFormatUtc}}
			{{/equal}}
			<tr id="{{folderEncName}}_{{id}}" class="{{#if seen}} {{else}}read_no{{/if}}" folder="{{folderEncName}}" uid="{{id}}">
				<td class="align_c check"><input type="checkbox" name="msgId" evt-rol="check-list" value="{{id}}" data-femail="{{fromEscape}}" data-temail="{{toEscape}}"></td>
				<td class="{{#if ../viewMeInCc}}action_cc{{else}}action{{/if}}">
					<div class="func_wrap">
						{{#notEqual folderEncName "Drafts"}}
						{{#notEqual folderEncName "Reserved"}}
						<span class="btn_wrap"><span evt-rol="switch-flag" flag="F" {{#contains flag 'F'}}flaged="on" class="ic ic_important_on"{{else}}flaged="off" class="ic ic_important_off"{{/contains}} title="<tctl:msg key="mail.flag.flaged.message"/>"></span></span>
						{{/notEqual}}
						{{/notEqual}}
						{{flagClass flag}}
						{{#contains flag 'T'}}<span class="ic ic_file_s" title="<tctl:msg key="mail.attach"/>"></span>{{/contains}}
						{{#if existMeInCc}}<span class="ic_con ic_cc" title="<tctl:msg key="mail.cc"/>"></span>{{/if}}
					</div>
				</td>
				<td class="subject">
					<span class="vertical_wrap" evt-rol="from-to-submenu" title="{{#if ../exceptFolder}}{{#if ../../mailExposure}}{{to}}{{else}}{{getEmailNotInCompanyDomain ../../../companyDomainList to}}{{/if}}{{else}}{{#if ../../mailExposure}}{{from}}{{else}}{{getEmailNotInCompanyDomain ../../../companyDomainList from}}{{/if}}{{/if}}" data-email="{{#if ../exceptFolder}}{{toEscape}}{{else}}{{fromEscape}}{{/if}}">
						<span class="name">{{#if ../exceptFolder}}{{sendToSimple}}{{else}}{{fromToSimple}}{{/if}}</span>
					</span>
					<div style="position:relative;display:none;" class="layerPop"></div>
                    {{#equal priority 'HIGH'}}<span class="ic_con ic_exclamation"></span>{{/equal}}
					<a evt-rol="{{#notEqual ../folderType 'quotaviolate'}}{{#equal ../../folderType 'drafts'}}draft-message{{else}}read-message{{/equal}}{{/notEqual}}">
						{{#equal ../folderType 'all'}}<span class="boxInfo">[{{folderDepthName folderDepthName}}]</span>{{/equal}}
						{{#each tagList}}
							<span id="tag_{{../folderEncName}}_{{../id}}_{{id}}" class="txt_form" evt-rol="self-remove-message-tagging" data-tagid="{{id}}">
								<span class="ic_tag {{color}}"><span class="tail_r"><span></span></span></span>
								<span class="tool_tip"><tctl:msg key="comn.clear" /><i class="tail"></i></span>
							</span>
						{{/each}}
						<span class="subject preview" {{#notEqual ../folderType 'quotaviolate'}}data-preview="{{preview}}"{{/notEqual}}>
							{{#equal subject ""}}
								<tctl:msg key="header.nosubject"/>
							{{else}}
								{{#if ../exceptFolder}}
									{{subject}}
								{{else}}
									{{#lessThen spamRate 0}}<strike>{{subject}}<strike>{{else}}{{subject}}{{/lessThen}}
								{{/if}}
							{{/equal}}
						</span>
					</a>
					{{#notEqual ../folderType 'drafts'}}
					{{#notEqual ../../folderType 'quotaviolate'}}
					<span class="btn_wrap">
						<span evt-rol="read-message-popup" title="<tctl:msg key="mail.popupview"/>" class="ic_classic ic_blank"></span>
					</span>
					{{/notEqual}}
					{{/notEqual}}
				</td>
				<td class="dateSize">
					<span class="date" style="display:block;text-align:right;">{{#equal ../folderType 'sent'}}{{printListDate sentDateUtc}}{{else}}{{printListDate dateUtc}}{{/equal}}</span>
					<span class="num" style="display:block;text-align:right;padding-top:8px;">{{size}}</span>
				</td>
			</tr>
			{{/each_with_index}}
			{{else}}
			<tr>
				<td colspan="{{#equal folderType 'all'}}5{{else}}4{{/equal}}"><p class="data_null"><tctl:msg key="mail.notexist"/></p></td>
			</tr>
			{{/if}}
		</tbody>
	</table>
</script>

<script id="mail_navi_tmpl" type="text/x-handlebars-template">
{{#with pageInfo}}
<div id="pageNaviWrap" class="dataTables_paginate paging_full_numbers {{#if out}}paging_out{{/if}}" style="{{#if out}}border-top:0px;{{/if}}" data-pagebase="{{../pageBase}}" data-total="{{total}}">
	<a tabindex="0" class="first paginate_button {{#if firstWindow}}paginate_button_disabled{{/if}}" {{#unless firstWindow}}page="{{preWindow}}" evt-rol="list-page-move"{{/unless}} title="<tctl:msg key="comn.page.first" />"></a>
	<a tabindex="0" class="previous paginate_button {{#if firstPage}}paginate_button_disabled{{/if}}" {{#unless firstPage}}page="{{prePage}}" evt-rol="list-page-move"{{/unless}} title="<tctl:msg key="comn.page.pre" />"></a>
	<span>
		{{#each pages}}
		<a tabindex="0" {{#equal ../page this}}class="paginate_active"{{else}}evt-rol="list-page-move" class="paginate_button"{{/equal}} page="{{printThis this}}">{{printThis this}}</a>
		{{/each}}
	</span>
	<a tabindex="0" class="next paginate_button {{#if lastPage}}paginate_button_disabled{{/if}}" {{#unless lastPage}}page="{{nextPage}}" evt-rol="list-page-move"{{/unless}} title="<tctl:msg key="comn.page.next" />"></a>
	<a tabindex="0" class="last paginate_button {{#if lastWindow}}paginate_button_disabled{{/if}}" {{#unless lastWindow}}page="{{nextWindow}}" evt-rol="list-page-move"{{/unless}} title="<tctl:msg key="comn.page.end" />"></a>
</div>
{{/with}}
</script>

<script id="mail_read_tmpl" type="text/x-handlebars-template">
{{#with msgContent}}
	<div id="mailViewContentWrap" class="view_content mail_view" style="height:300px;">
		<form name="readForm">
			<input type="hidden" id="folderName" name="folderName" value="{{folderFullName}}"/>
			<input type="hidden" id="msgUid" name="uid" value="{{uid}}"/>
			<input type="hidden" id="messageListId" value="{{folderEncName}}_{{uid}}" data-femail="{{from}}" data-temail="{{toHidden}}" subject="{{subject}}"/>
		</form>
		<div class="header">
			<h2>
				<span class="btn_wrap">
					<span id="readFlagedFlagIcon" evt-rol="switch-flag-read" flag="F" {{#if flaged}}flaged="on" class="ic ic_important_on"{{else}}flaged="off" class="ic ic_important_off"{{/if}} title="<tctl:msg key="mail.flag.flaged.message"/>"></span>
				</span>
				{{#equal priority 'HIGH'}}
					<span class="ic_con ic_exclamation"></span>
				{{/equal}}
				<span class="title" id="subjectTitle">
					{{#equal subject ""}}
						<tctl:msg key="header.nosubject"/>
					{{else}}
						{{subject}}
					{{/equal}}
				</span>

				<span class="btn_set_wrap">
					<span class="btn_fn13 btn_register btn_fn14" evt-rol="print-message"><span class="ic_gnb ic_pri_mini"></span><span class="txt"><tctl:msg key="menu.print"/></span></span>{{#if ../useCalendar}}<span class="btn_fn13 {{#if ../../mailExposure}}btn_fn15{{else}}btn_fn16{{/if}} btn_register" evt-rol="registration-schedule" id="resistration"><span class="ic_gnb ic_cal_mini"></span><span class="txt"><tctl:msg key="mail.registe.schedule"/></span></span>{{/if}}{{#if ../mailExposure}}<span class="btn_fn13 btn_register btn_fn16" evt-rol="view-message-source"><span class="ic_gnb ic_ori_mini"></span><span class="txt"><tctl:msg key="mail.sourceview"/></span></span>{{/if}}
				</span>

				<span id="readTagWrap"></span>
			</h2>
			<table class="list_report">
				<colgroup>
					<col width="85px" />
					<col width="" />
				</colgroup>
				<tbody>
				<tr>
					<th>
						<div class="default_info">
							<span class="btn_wrap">
								<span class="ic ic_arrow_up_type4" title="<tctl:msg key="comn.close" />" style="{{#if ../isRcptHidden}}display:none{{/if}}" evt-rol="mail-read-close-sender-list"></span>
								<span class="ic ic_arrow_down_type4" title="<tctl:msg key="comn.open" />" style="{{#unless ../isRcptHidden}}display:none{{/unless}}" evt-rol="mail-read-open-sender-list"></span>
							</span>
							<span class="title"><tctl:msg key="mail.from"/> :</span>
						</div>
					</th>
					<td>
						<ul class="name_tag">
							<li data-email="{{from}}">
								{{#if ../useContact}}
								<span class="ic_form ic_addlist2" evt-rol="layer-save-addr"></span>
								{{/if}}
								<span class="name" evt-rol="layer-write-email">
									{{#if ../addressVisible}}
										{{printEmailAddress from}}
									{{else}}
										{{fromPersonal}}
									{{/if}}
								</span>
							</li>
						</ul>
					</td>
				</tr>
				</tbody>
			</table>
			<div id="mailReadSenderListWrap" class="sub_report" style="{{#if ../isRcptHidden}}display:none{{/if}}">
			<table class="list_report">
			<colgroup>
				<col width="85px" />
				<col width="" />
			</colgroup>
			<tbody>
				<tr>
					<th><span class="title"><tctl:msg key="mail.to"/> :</span></th>
					<td>
						<ul class="name_tag">
							{{#each toList}}
							<li data-email="{{makeEmailAddress personal address}}" data-type="to">
								{{#if ../../useContact}}
								<span class="ic_form ic_addlist2" evt-rol="layer-save-addr"></span>
								{{/if}}
								<span class="name" evt-rol="layer-write-email">
									{{#empty personal}}
										{{address}}<span style="color:#e2f5f6">,</span>
									{{else}}
										{{#if ../../../addressVisible}}
											{{personal}}&lt;{{address}}&gt;<span style="color:#e2f5f6">,</span>
										{{else}}
											{{personal}}
										{{/if}}
									{{/empty}}
								</span>
							</li>
							{{/each}}
						</ul>
					</td>
				</tr>
				{{#if ccList}}
				<tr>
					<th><span class="title"><tctl:msg key="mail.cc"/> :</span></th>
					<td>
						<ul class="name_tag">
							{{#each ccList}}
							<li data-email="{{makeEmailAddress personal address}}"  data-type="cc">
								{{#if ../../../useContact}}
								<span class="ic_form ic_addlist2" evt-rol="layer-save-addr"></span>
								{{/if}}
								<span class="name" evt-rol="layer-write-email">
									{{#empty personal}}
										{{address}}<span style="color:#e2f5f6">,</span>
									{{else}}
										{{#if ../../../../addressVisible}}
											{{personal}}&lt;{{address}}&gt;<span style="color:#e2f5f6">,</span>
										{{else}}
											{{personal}}
										{{/if}}
									{{/empty}}
								</span>
							</li>
							{{/each}}
						</ul>
					</td>
				</tr>
				{{/if}}
				{{#if bccList}}
				<tr>
					<th><span class="title"><tctl:msg key="mail.bcc"/> :</span></th>
					<td>
						<ul class="name_tag">
							{{#each bccList}}
							<li data-email="{{makeEmailAddress personal address}}">
								{{#if ../../../useContact}}
								<span class="ic_form ic_addlist2" evt-rol="layer-save-addr"></span>
								{{/if}}
								<span class="name" evt-rol="layer-write-email">
									{{#empty personal}}
										{{address}}<span style="color:#e2f5f6">,</span>
									{{else}}
										{{#if ../../../../addressVisible}}
											{{personal}}&lt;{{address}}&gt;<span style="color:#e2f5f6">,</span>
										{{else}}
											{{personal}}
										{{/if}}
									{{/empty}}
								</span>
							</li>
							{{/each}}
						</ul>
					</td>
				</tr>
				{{/if}}
				{{#if approver}}
				<tr>
					<th><span class="title"><tctl:msg key="mail.approver"/> :</span></th>
					<td>
						<ul class="name_tag">
							<li data-email="{{approver}}">
								<span class="ic_form ic_addlist2" evt-rol="layer-save-addr"></span>
								<span class="name" evt-rol="layer-write-email">{{approver}}</span>
							</li>
						</ul>
					</td>
				</tr>
				{{/if}}
				<tr>
					<th><span class="title"><tctl:msg key="mail.senddate"/> :</span></th>
					<td><span class="date">{{printReadDate dateUtc}}</span></td>
				</tr>
			</tbody>
			</table>
			</div>
			{{#if nationList}}
			<table class="list_report">
			<colgroup>
				<col width="85px">
				<col width="">
			</colgroup>
			<tbody>
				<tr>
					<th><span class="title"><tctl:msg key="conf.profile.83" /> :</span></th>
					<td>
						<span class="wrap_nation">
						{{#each_with_index nationList}}
							{{#unless isFirst}}
							<span class="to">&gt;</span>
							{{/unless}}
							<span class="date" title="{{ip}}">
								<span class="ic_nation nation_{{code}}"></span>
								{{#printNationText code text}}{{/printNationText}}
							</span>
						{{/each_with_index}}
						</span>
					</td>
				</tr>
			</tbody>
			</table>
			{{/if}}
		</div>
		<!-- 관련메일 -->
		<div id="relationMessageWrapper" class="list_connect_wrap" style="display:none;">
			<table class="list_connect_mail">
				<tbody>
					<tr class="title">
						<th colspan="5">
							<span class="btn_wrap btn_slide_show" evt-rol="mail-read-open-relation-list">
								<span class="ic ic_arrow_down_type4" title="<tctl:msg key="mail.relation.open"/>"></span>
							</span>
							<span class="btn_wrap btn_slide_hide" evt-rol="mail-read-close-relation-list" style="display:none;">
								<span class="ic ic_arrow_up_type4" title="<tctl:msg key="mail.relation.close"/>"></span>
							</span>
							<span class="title"><tctl:msg key="mail.relation"/></span>
							<span id="relationMessageCount" class="num"></span>
							<span class="subject"><tctl:msg key="conf.profile.13" /></span>
						</th>
					</tr>
				</tbody>
			</table>
			<div id="relationContentWrap" class="div_scroll" style="display:none;"></div>
		</div>
		<!-- //관련메일 -->
		<!-- NDR 가이드 -->
		<div id="ndrGuide" class="ndr" style="display:none"></div>
		<!-- //NDR 가이드 -->
		<!-- 첨부파일 -->
		<div class="add_file" style="display:">
			<div class="add_file_header">
				<span class="subject">
					<span class="ic ic_file_s"></span>
					{{#greateThen attachFileCount 0}}
					<strong><tctl:msg key="mail.attach"/></strong>
					<span class="num" id="attachFileCount">{{../attachFileCount}}</span><tctl:msg key="mail.unit.count"/>
					{{else}}
					<strong><tctl:msg key="mail.noattach"/></strong>
					{{/greateThen}}
				</span>
				<span class="btn_area">
					{{#greateThen attachFileCount 0}}
					<span class="btn_wrap"><span class="help">&nbsp;<span class="tool_tip top"><tctl:msg key="mail.saveall.tooltip"/><i class="tail_top"></i></span></span><span class="txt" evt-rol="download-attach-all"><tctl:msg key="mail.saveall"/></span></span>
					{{#notEqual ../../sharedFlag 'shared'}}
						{{#notEqual ../../../folderType 'reserved'}}
							<span class="part">|</span>
							<span class="btn_wrap"><span class="txt_caution" evt-rol="delete-attach-all"><tctl:msg key="mail.deleteall"/></span></span>
						{{/notEqual}}
					{{/notEqual}}
					{{/greateThen}}
				</span>
			</div>
			{{#greateThen attachFileCount 0}}
			<ul id="attachListWrap" class="file_wrap">
				{{#each attachList}}
				<li part="{{path}}" class="{{#equal size 0}}deleted{{/equal}}">
					<span class="item_file">
						<span class="ic_file ic_{{fileType}}"></span>
						{{#greateThen size 0}}
							<span class="name" evt-rol="download-attach" evt-data="{{attachConfirm}}">{{fileName}}</span>
							<span class="size">({{fsize}})</span>

 							<span class="optional">
							{{#equal fileType 'eml'}}
								<span class="btn_fn4" evt-rol="read-nested-pop">
									<span class="txt"><tctl:msg key="menu.preview"/></span>
								</span>
							{{/equal}}
							{{#if ../../../../useHtmlConverter}}{{#acceptConverter fileType}}<span class="btn_fn4 {{#if ignorePreview}}disable{{/if}}" {{#unless ignorePreview}}evt-rol="preview-attach"{{/unless}}><span class="txt"><tctl:msg key="menu.preview"/></span></span>{{/acceptConverter}}{{/if}}{{#if ../../../../useWebfolder}}<span class="btn_fn4" evt-rol="save-webfolder" evt-data="{{attachConfirm}}"><span class="txt"><tctl:msg key="mail.attach.webfolder.save"/></span></span>{{/if}}</span>

							<span class="btn_wrap">
								{{#notEmpty path}}
								{{#notEqual ../../../../../sharedFlag 'shared'}}
									{{#notEqual ../../../../../../folderType 'reserved'}}
										<span class="ic_classic ic_del" title="<tctl:msg key="comn.del" />" evt-rol="delete-attach"></span>
									{{/notEqual}}
								{{/notEqual}}
								{{/notEmpty}}
							</span>
						{{else}}
							<span>{{fileName}} [<tctl:msg key="mail.deleteattach"/>]</span>
						{{/greateThen}}
					</span>
					{{#if tnef}}
					<div class="dat_wrap">
						<div class="dat_tit">
							<span class="ic_sub">ㄴ</span>
							<span class="txt"><tctl:msg key="file.dat"/></span>
							<span class="ic_help_cir on" title="<tctl:msg key="intro.mail.help.title" />" evt-rol="help-accordion-collapse" data-id="tnef-mail-help-accordion">?</span>
							<p id="tnef-mail-help-accordion" class="help_accordion" style="display: none;">
								<tctl:msg key="file.dat.desc"/>
							</p>
						</div>
						<ul class="dat_list">
							{{#each tnefList}}
							<li part="{{../path}}">
								<a href="#" class="name" evt-rol="download-tnef-attach" attKey="{{attachKey}}">[{{fileName}}]</a>
							</li>
							{{/each}}
						</ul>
					</div>
					{{/if}}
				</li>
				{{/each}}
				{{#each vcardList}}
				<li part="{{path}}">
					<span class="item_file">
						<img src='/resources/images/ic_vcard.png' style='vertical-align:middle;'>
						<span class="name" evt-rol="download-attach">vcard</span>
						<span class="size">({{fsize}})</span>
					</span>
				</li>
				{{/each}}
			</ul>
			{{/greateThen}}
		</div>
		<!-- //첨부파일 -->
		{{#greateThen ../spamRate "-1"}}
		<div class="noti_option">
			<p class="desc">SPAM RATE[<span style="color:#FF4040">{{../../spamRate}}</span>]</p>
			<a evt-rol="regist-bayesian-rule" data-type="{{#if ../../spamAdmin}}spam{{else}}white{{/if}}">
				<span class="btn_txt">{{#if ../../spamAdmin}}<tctl:msg key="bayesian.submitspam"/>{{else}}<tctl:msg key="bayesian.submitham"/>{{/if}}</span>
			</a>
		</div>
		{{/greateThen}}
		<!--이미지 표시 여부 설정-->
		{{#if ../hiddenImg}}
		<div class="noti_option">
			<p class="desc"><tctl:msg key="mail.noimage"/></p>
			<a evt-rol="read-view-img"><span class="btn_txt"><tctl:msg key="mail.viewimage"/></span></a>
			<span class="part">|</span>
			<a evt-rol="goto-basic-setting"><span class="btn_txt"><tctl:msg key="mail.setting"/></span></a>
		</div>
		{{/if}}
		{{#if ../integrityUse}}
		{{#notEqual ../../sharedFlag 'shared'}}
		<div class="noti_option">
			<p class="desc"><span id='integrityMsg'><tctl:msg key="mail.integrity.notcheck"/></span></p>
			<a id='integrityBtn' evt-rol="confirm-integrity"><span class="btn_txt"><tctl:msg key="mail.integrity"/></span></a>
		</div>
		{{/notEqual}}
		{{/if}}
		<div id="readContentMessageWrap">
			<textarea id="messageText" style="display:none;">{{htmlContent}}</textarea>
			<iframe frameborder='0' width='100%' height='300px' scrolling='no' src='${baseUrl}resources/js/plugins/mail/messageContent.html?rev=${revision}' id='messageContentFrame'></iframe>
		</div>
	</div>
{{/with}}
</script>

<script id="mail_read_default_tmpl" type="text/x-handlebars-template">
	<div class="view_content mail_view">
		<p class="data_null">
			<span class="txt"><tctl:msg key="mail.nomessage"/></span>
		</p>
	</div>
</script>

<script id="mail_read_checked_list_tmpl" type="text/x-handlebars-template">
	<div class="view_content mail_view">
		<p class="data_null">
			<span id="checkedListMessage" class="txt"></span>
		</p>
	</div>
</script>

<script id="mail_read_relation_tmpl" type="text/x-handlebars-template">
<table class="list_connect_mail">
	<tbody>
		{{#each messageList}}
		<tr id="relation_{{folderEncName}}_{{id}}" class="{{#unless seen}}read_no{{/unless}}">
			<td class="action">
				<div class="func_wrap">
					{{flagClass flag}}
					{{#contains flag 'T'}}<span class="ic ic_file_s" title="<tctl:msg key="mail.attach"/>"></span>{{/contains}}
				</div>
			</td>
			<td class="name">
				<span class="name" title="{{#equal folderName 'Sent'}}{{to}}{{else}}{{from}}{{/equal}}">
					{{#equal folderName 'Sent'}}
						{{sendToSimple}}
					{{else}}
						{{fromToSimple}}
					{{/equal}}
				</span>
			</td>
			<td class="subject">
				<a evt-rol="read-message-simple-relation" folder="{{folderEncName}}" uid="{{id}}">
					{{#equal priority 'HIGH'}}
						<span class="ic_con ic_exclamation"></span>
					{{/equal}}
					<span class="btn_wrap">
						<span class="desc">[{{folderDepthName folderDepthName}}]</span>
						<span class="txt">
							{{#equal subject ""}}
								<tctl:msg key="header.nosubject"/>
							{{else}}
								{{subject}}
							{{/equal}}
						</span>
					</span>
				</a>
				{{#unless ../isPopup}}
				<span class="btn_wrap">
					<span evt-rol="read-message-relation-popup" folder="{{folderEncName}}" uid="{{id}}" title="<tctl:msg key="mail.popupview"/>" class="ic_classic ic_blank"></span>
				</span>
				{{/unless}}
			</td>
			<td class="date">{{#equal folderName 'Sent'}}{{printListDate sentDateUtc}}{{else}}{{printListDate dateUtc}}{{/equal}}</td>
			<td class="action">{{size}}</td>
		</tr>
		{{/each}}
	</tbody>
</table>
</script>

<script id="mail_write_tmpl" type="text/x-handlebars-template">
<style type="text/css">
#cke_contents_ckeditor {
	padding:0px !important;
}
div.editor_wrap table.cke_editor tbody td {
	padding:0px;
	line-height:100%;
}
ul.layer_auto_complete li.ac_over {
background:#41c7ce;
background-image:-webkit-gradient(linear, left top, left bottom, from(#41c7ce), to(#2faeb5));/*old version*/
background-image:-webkit-linear-gradient(270deg,#41c7ce 0%, #2faeb5 100%);
background-image:-moz-linear-gradient(270deg,#41c7ce 0%, #2faeb5 100%);
background-image:-o-linear-gradient(270deg,#41c7ce 0%, #2faeb5 100%);
background-image: linear-gradient(top,#41c7ce 0%,#2faeb5 100%); /* W3C */
filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#41c7ce', endColorstr='#2faeb5',GradientType=0 ); /* IE6-9 */
border-top:1px solid #3eacb3;
color:#fff;
}
ul.layer_auto_complete li.ac_even {cursor:pointer;}
ul.layer_auto_complete li.ac_odd {cursor:pointer;}
#mailWriteArea{padding-bottom:10px;}
/*#basicAttachList{border:1px solid #ededed;}*/
#basicAttachList td{padding:0px 5px;}
#basicAttachTitle th{padding:0px 5px;}
span.ic_arrow_type{height:9px;}
#crtBtnPower,#crtBtnSimple span.txt{padding-bottom:5px;}
</style>
<span id="writeStrWidth" style="visibility:hidden; position:absolute; top:-10000;"></span>
{{#if sendAllowUsed}}
<div class="warp_caution_box">
                <p class="desc">
                    <span><tctl:msg key="sendallow.msg1"/></span><br>
                    <a evt-rol="view-popup-allow-list">[<tctl:msg key="sendallow.msg2"/>]</a>
                </p>
</div>
{{/if}}
<div class="grantor_wrap" id="approverAddrWrap" data="{{directedApprover}}" style="display:none;">
		<ins class="ic_con ic_alert"></ins>
		<span class="txt"><tctl:msg key="mail.approver"/></span>
		<ul class="name_tag"></ul>
</div>
<table id="mailWriteAreaTable" class="form_mail003 form_type mail_write" style="table-layout:fixed;">
	<colgroup>
		<col>
		<col>
	</colgroup>
	<tbody>
		{{#if useMailSender}}
		<tr id="useMailSenderTr">
			<th><span class="title send"><tctl:msg key="conf.basic.sender.email" /></span></th>
			<td>
				<span class="wrap_select signature">
					<input type="hidden" id="senderMode" value="on"/>
					<select id="senderUserEmail" sname="{{senderName}}" evt-rol="change-sender-mail"></select>
				</span>
			</td>
		</tr>
		{{/if}}
		{{#equal rcptMode 'searchaddr'}}
			{{#applyTemplate "mail_write_rcpt_search_tmpl" this}}{{/applyTemplate}}
		{{else}}
			{{#applyTemplate "mail_write_rcpt_auto_tmpl" this}}{{/applyTemplate}}
		{{/equal}}
		<tr>
			<th>
				<span class="title"><tctl:msg key="mail.subject"/></span>
				<span class="option_wrap priority"><input type="checkbox" id="priority"><label for="priority"><tctl:msg key="mail.importance"/><strong>!</strong></label></span>
			</th>
			<td><input id="subject" type="text" class="input w_max" value="{{subject}}"/></td>
		</tr>
		<tr>
			<th>
				<span class="title">
					<span class="txt"><tctl:msg key="comn.file.attachment"/></span>
					<span class="btn_wrap">
						<span class="ic ic_arrow_up_type4" evt-rol="attach-area-toggle"></span>
					</span>
				</span>
				<span id="att_btn_simple">
					<span id="bigattachBtn" onclick="bigAttachBtnCheck()" class="option_wrap" style="display:none;">
						<input id="bigAttachFlagCheck" type="checkbox" />
						<label for="bigAttachFlagCheck" class="bigfile"><tctl:msg key="mail.attach.bigattach.simple"/></label>
					</span>
				</span>
			</th>
			<td>
				<form name="uploadForm" method="post"
					  enctype="multipart/form-data">
					<input type="hidden" name=upldtype value='upld'>
					<input type="hidden" name="writeFile" value="true">
					<input type="hidden" name="attfile" value="true">
					<input type="hidden" name="attsize" value="0">
					<input type="hidden" name="uploadType">
					<input type="hidden" name="maxAttachFileSize" />
					<div id="write_attach_btn_wrap" class="tool_bar">
						<div class="critical">
							<a class="btn_minor_s btn_attach" id="simpleFileInit">
								<input type="file" id="mailSimpleUpload" name="theFile" multiple>
								<span class="txt"><tctl:msg key="comn.file.select.button" /></span>
							</a>
							<a id="att_btn_ocx" class="btn_minor_s btn_attach" onclick="ocx_file()">
								<span class="txt"><tctl:msg key="comn.file.select.button" /></span>
							</a>
							{{#if useWebfolder}}
							<a id="writeWebfolderBtn" class="btn_minor_s" evt-rol="open-write-webfolder">
								<span class="txt"><tctl:msg key="mail.attach.webfolder"/></span>
							</a>
							{{/if}}
							<a onclick="deletefile(true)" class="btn_minor_s">
								<span class="txt"><tctl:msg key="mail.delete.all"/></span>
							</a>
						</div>
						<div class="file_option_desc">
							<p class="desc">
								<span id="att_simple_quota_info"></span>
								<span id="att_ocx_quota_info"></span>
								<a class="deco">
									<span class="ic_attach ic_gear" evt-rol="bigattach-manage"></span>
								</a>
								<span id="bigattachMessageSpanBtn" class="help" style="display:none;">
									<span class="tool_tip top ">
										<span id="bigattachMessageSpan"></span>
										<i class="tail_top"></i>
									</span>
								</span>
								<a id="crtBtnPower" style="display:none;" onclick="chgAttachMod('ocx')">
									<span class="ic_classic ic_arrow_type"></span><span class="txt"><tctl:msg key="mail.attach.power"/></span>
								</a>
								<a id="crtBtnSimple" style="display:none;" onclick="chgAttachMod('simple')">
									<span class="ic_classic ic_arrow_type"></span><span class="txt"><tctl:msg key="mail.attach.simple"/></span>
								</a>
							</p>
						</div>
					</div>
					<div id="att_simple_area">
						<div class="dd_attach" id="dropZone">
							<p class="drag_txt"><tctl:msg key="mail.attach.drag"/></p>
							<div class="area_txt">
								<span class="ic_attach ic_upload"></span>
								<span class="msg"><tctl:msg key="mail.attach.drop"/>
									<span class="btn_file">
										<a class="txt" id="simpleFileInitSub"><tctl:msg key="comn.file.select.button" /></a>
									</span>
								</span>
							</div>
							<div id="basicUploadAttachList" class="dd_attach_list"></div>
						</div>
					</div>
					<div id="att_ocx_area" ><div id="ocxCompL"></div></div>
				</form>
			</td>
		</tr>

		<tr>
			<td colspan="2">
				<div id="writeEditorWrap" class="editor_wrap">
					<div class="editor">
						<div id="modeTextWrapper" style="{{#equal editorMode 'html'}}display:none;{{/equal}}">
							<textarea name="contentTemp" id="contentTemp" style="display: none">{{textContent}}</textarea>
							<iframe frameborder="0" width="100%" height="400px" scrolling='no' src="${baseUrl}resources/js/plugins/mail/textContent.html?rev=${revision}" id="textContentFrame" name="textContentFrame"></iframe>
						</div>
						<div id="modeHtmlWrapper" style="{{#equal editorMode 'text'}}display:none;{{/equal}}">
							<textarea id="smartEditor" name="smartEditor" style="width:100%; height:{{#if isPopupWrite}}300px{{else}}400px{{/if}}; display:none;">
									{{{htmlContent}}}
							</textarea>
						</div>
					</div>
					<div class="optional">
						<span id="writeChangeEditorWrap" class="btn_wrap" evt-rol="write-change-editor" style="{{#equal editorMode 'html'}}display:none;{{/equal}}">
							<span id="editorMode" class="txt" data-mode="{{editorMode}}">{{#equal editorMode 'text'}}TEXT{{else}}HTML{{/equal}}</span>
							<span class="ic ic_arrow_down_s"></span>
						</span>
						<span id="letterWrap" class="btn_wrap" evt-rol="letter-layer" style="display:none;">
							<span class="txt"><tctl:msg key="mail.letterpaper"/></span>
							<span class="ic ic_arrow_down_s"></span>
						</span>
						{{#if docTemplateApply}}
						<span id="templateWrap" evt-rol="template-layer" class="btn_wrap" style="display:none;">
							<span class="txt"><tctl:msg key="mail.template"/></span>
							<span class="ic ic_arrow_down_s"></span>
						</span>
						{{/if}}
						<div id="writeOptionLayer"></div>
						<div id="writeModeSelect" class="array_option" style="display:none;margin-left:-30px;position:absolute;">
							<ul class="array_type">
								<li evt-rol="write-mode-change" data-mode="html" style="padding:5px 15px;text-align:center;"><span>HTML</span></li>
								<li evt-rol="write-mode-change" data-mode="text" style="padding:5px 15px;text-align:center;" class="last"><span>TEXT</span></li>
							</ul>
						</div>
					</div>
				</div>
			</td>
		</tr>
		{{#if bannerDisplay}}
		<tr>
			<td colspan="2"><div class="mail_banner">{{{bannerContent}}}</div></td>
		</tr>
		{{/if}}
		<tr>
			<td colspan="2" class="option">
				<div id="secureReservedLayerWrap" style="position:relative"></div>
				<dl class="detail_option">
					<dt class="mail_option_wrap"><span class="btn_minor_s" evt-rol="check-reserved"><tctl:msg key="mail.reserve.send"/></span></dt>
					<dd id="reservation_setting_info" class="data_warp"></dd>
					<input id="reservation" type="hidden"/>
				</dl>
				<dl class="detail_option">
					<dt class="mail_option_wrap"><span class="btn_minor_s" evt-rol="check-securemail"><tctl:msg key="menu.secure"/></span></dt>
					<dd id="secure_setting_info" class="data_warp"></dd>
					<input id="securemail" type="hidden"/>
				</dl>
				<div class="user_signature_wrap">
					<span id="signListWrap" class="wrap_select signature" data-attach="{{signAttach}}"></span>
					<span class="wrap_option"><input id="vcardAttach" type="checkbox" {{#if vcardAttach}}checked="checked"{{/if}}/><label for="vcardAttach"><tctl:msg key="mail.vcard"/></label></span>
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2" class="option">
				<div class="detail_option_side">
					<span class="wrap_option"><input id="receivenoti" type="checkbox" {{#if receiveNoti}}checked="checked"{{/if}}/><label for="receivenoti"><tctl:msg key="menu.receivenoti"/></label></span>
					<span class="wrap_option"><input id="savesent" type="checkbox" {{#if saveSent}}checked="checked"{{/if}}/><label for="savesent"><tctl:msg key="menu.sentsave"/></label></span>
					<span class="wrap_option"><input id="onesend" type="checkbox" /><label for="onesend"><tctl:msg key="menu.onesend"/></label></span>
				</div>
			</td>
		</tr>
	</tbody>
</table>
<div id="tempTo"  class="TM_tempRcpt"></div>
<div id="tempCc"  class="TM_tempRcpt"></div>
<div id="tempBcc"  class="TM_tempRcpt"></div>
<input type="hidden" name="toTempVal" id="toTempVal"/>
<input type="hidden" name="ccTempVal" id="ccTempVal"/>
<input type="hidden" name="bccTempVal" id="bccTempVal"/>
</script>

<script id="mail_write_rcpt_auto_tmpl" type="text/x-handlebars-template">
<tr>
	<th>
		<span class="title"><tctl:msg key="mail.to"/></span>
		<span class="option_wrap">
			<input id="writeMyself" type="checkbox" evt-rol="write-myself"/><label for="writeMyself" class="sendme"><tctl:msg key="mail.myself"/></label>
			{{#if massRcptConfirm}}
				<span class="btn_wrap" style="padding-top:3px;">
					<span id="massRcptToggleBtn" class="ic ic_arrow_down_type4" evt-rol="write-toggle-massRcptwrap">
				</span>
			{{/if}}
		</span>
		</span>
	</th>
	<td>
		<div class="div_ipt_wrap">
			<!-- name_tag in input -->
			<div id="toAddrWrap" class="div_ipt">
				<ul class="name_tag" evt-rol="write-address-to" area="to">
					<li class="creat">
						<div class="addr_input">
							<textarea id="to" name="to" type="text" style="display:inline;white-space:nowrap;"></textarea>
						</div>
					</li>
				</ul>
			</div>
			<!-- // name_tag in input -->
			<select id="toRcptList" class="date_list" style="width:90px;" evt-rol="select-rcpt-email" data-rcpt="to">
				<option value="" selected="selected"><tctl:msg key="mail.lastrcpt"/></option>
			</select>
			{{#if useContact}}
			<span evt-rol="write-add-address" data-rcpt="to" class="btn_wrap btn_add">
				<a class="btn_minor_s">
					<span class="txt"><tctl:msg key="mail.searchaddr"/></span>
				</a>
			</span>
			{{/if}}
		</div>
	</td>
</tr>
{{#if massRcptConfirm}}
	{{#applyTemplate "mass_rcpt_area_tmpl" this}}{{/applyTemplate}}
{{/if}}
<tr>
	<th>
		<span class="title">
			<span class="txt">
				<tctl:msg key="mail.cc"/>
			</span>
			<span class="btn_wrap">
				<span id="writeToggleBccWrap" class="ic ic_arrow_down_type4" evt-rol="write-toggle-bccwrap"></span>
			</span>
		</span>
	</th>
	<td>
		<div class="div_ipt_wrap">
			<!-- name_tag in input -->
			<div id="ccAddrWrap" class="div_ipt">
				<ul class="name_tag" evt-rol="write-address-cc" area="cc">
					<li class="creat">
						<div class="addr_input">
							<textarea id="cc" name="cc" type="text" style="display:inline;white-space:nowrap;"></textarea>
						</div>
					</li>
				</ul>
			</div>
			<select id="ccRcptList" class="date_list" style="width:90px;" evt-rol="select-rcpt-email" data-rcpt="cc">
				<option value="" selected="selected"><tctl:msg key="mail.lastrcpt"/></option>
			</select>
			{{#if useContact}}
			<span evt-rol="write-add-address" data-rcpt="cc" class="btn_wrap btn_add">
				<a class="btn_minor_s">
					<span class="txt"><tctl:msg key="mail.searchaddr"/></span>
				</a>
			</span>
			{{/if}}
		</div>
	</td>
</tr>
<tr id="writeBccWrap" style="display:none;">
	<th><span class="title"><tctl:msg key="mail.bcc"/></span></th>
	<td>
		<div class="div_ipt_wrap">
			<!-- name_tag in input -->
			<div id="bccAddrWrap" class="div_ipt">
				<ul class="name_tag" evt-rol="write-address-bcc" area="bcc">
					<li class="creat">
						<div class="addr_input">
							<textarea id="bcc" name="bcc" type="text" style="display:inline;white-space:nowrap;"></textarea>
						</div>
					</li>
				</ul>
			</div>
			<select id="bccRcptList" class="date_list" style="width:90px;" evt-rol="select-rcpt-email" data-rcpt="bcc">
				<option value="" selected="selected"><tctl:msg key="mail.lastrcpt"/></option>
			</select>
			{{#if useContact}}
			<span evt-rol="write-add-address" data-rcpt="bcc" class="btn_wrap btn_add">
				<a class="btn_minor_s">
					<span class="txt"><tctl:msg key="mail.searchaddr"/></span>
				</a>
			</span>
			{{/if}}
		</div>
	</td>
</tr>
</script>

<script id="mail_write_rcpt_search_tmpl" type="text/x-handlebars-template">
<tr>
	<th>
		<span class="title"><tctl:msg key="mail.to"/></span>
		<span class="option_wrap">
			<input id="writeMyself" type="checkbox" evt-rol="write-myself"/><label for="writeMyself" class="sendme"><tctl:msg key="mail.myself"/></label>
		</span>
		{{#if massRcptConfirm}}
			<span class="btn_wrap" style="padding-top:3px;">
				<span id="massRcptToggleBtn" class="ic ic_arrow_down_type4" evt-rol="write-toggle-massRcptwrap">
			</span>
		{{/if}}
	</th>
	<td>
		<div class="div_ipt_wrap">
			<select id="writeRcptType" class="send_list" style="width:84px;">
				<option value="to" selected="selected"><tctl:msg key="mail.rcptto"/></option>
				<option value="cc"><tctl:msg key="mail.cc"/></option>
				<option value="bcc"><tctl:msg key="mail.bcc"/></option>
			</select>
			<div class="div_ipt div_ipt_l" style="margin-left:88px;">
				<ul class="name_tag">
					<li class="creat" style="width:100%">
						<div class="addr_input">
							<textarea id="writeRcptValue" style="width:100%" type="text"></textarea>
						</div>
					</li>
				</ul>
			</div>
			<a class="btn_minor_s" evt-rol="search-rcpt-address">
				<span class="ic"></span>
				<span class="txt"><tctl:msg key="comn.add" /></span>
			</a>
			<!-- // name_tag in input -->
			{{#if useContact}}
			<span evt-rol="write-add-address" class="btn_wrap btn_add">
				<a class="btn_minor_s">
					<span class="txt"><tctl:msg key="mail.searchaddr"/></span>
				</a>
			</span>
			{{/if}}
		</div>
	</td>
</tr>
{{#if massRcptConfirm}}
	{{#applyTemplate "mass_rcpt_area_tmpl" this}}{{/applyTemplate}}
{{/if}}
<tr>
	<th><span class="title"><tctl:msg key="mail.rcptlist"/></span></th>
	<td>
		<div class="div_ipt_wrap">
			<!-- name_tag in input -->
			<div class="div_ipt">
				<ul id="writeRcptList" class="list_receive" style="height:115px;overflow:auto;"></ul>
			</div>
			<select id="rcptList" class="date_list" style="width:90px;" evt-rol="select-rcpt-email" data-rcpt="bcc">
				<option value="" selected="selected"><tctl:msg key="mail.lastrcpt"/></option>
			</select>
		</div>
	</td>
</tr>
</script>

<script id="mail_write_last_rcpt_tmpl" type="text/x-handlebars-template">
{{#each this}}
	<option value="{{printThis this}}">{{printEmailAddress this}}</option>
{{/each}}
</script>

<script id="mail_write_sender_tmpl" type="text/x-handlebars-template">
{{#each this}}
	<option value="{{printAddress}}" {{#if defaultMail}}selected{{/if}} alias="{{aliasUser}}">{{printAddress}}</option>
{{/each}}
</script>

<script id="mass_rcpt_area_tmpl" type="text/x-handlebars-template">
<tr id="massRcptwrap" style="display:none;">
	<th><span class="title"> </span></th>
	<td>
		<table class="in_table massrcpt">
			<colgroup>
				<col style="width:130px">
				<col>
			</colgroup>
			<tbody>
			<tr>
				<th>
					<tctl:msg key="mail.massrcpt"/>
					<span id="mssRcptSpanBtn" class="help">
						<span class="tool_tip top ">
							<span id="mssRcptSpan"><tctl:msg key="mail.massrcpt.noti"/></span>
							<i class="tail_top"></i>
						</span>
					</span>
				</th>
				<td>
					<span id="uploadActor">
						<span class="attachPart">
							<span id="massUploadControl" class="btn_minor_s" style="margin-top: 3px; width: 73px;height: 25px;padding: 0px 0px 0px"><input type="button" id="massUploadBtn" /></span>
						</span>
						<span id="massSimpleFileInit" class="btn btn-success fileinput-button" style="display:none;">
							<a class="btn_minor_s">
								<span class="ic"></span>
								<span class="txt"><strong><tctl:msg key="comn.file.select.button" /></strong></span>
							</a>
							<input type="file" id="massSimpleUpload" name="theFile" style="width:85px;">
						</span>
					</span>
					<span id="massFileItem"></span>
				</td>
			</tr>
			</tbody>
		</table>
	</td>
</tr>
</script>

<script id="mail_send_tmpl" type="text/x-handlebars-template">
<div class="view_content mail_result">
	<div class="header">
		<h2 class="title">
			{{#if sendError}}
				<tctl:msg key="mail.send.fail"/>
			{{else}}
				{{#equal sendType "reserved"}}
					<tctl:msg key="mail.reserved.success"/>
				{{else}}
					{{#equal sendType "draft"}}
						<tctl:msg key="mail.drafts.success"/>
					{{else}}
						<tctl:msg key="mail.send.success"/>
					{{/equal}}
				{{/equal}}
			{{/if}}
		</h2>
		<p class="desc" style="text-align:center">
			{{#if sendError}}
				{{#unless saveError}}
					<tctl:msg key="mail.drafts.success"/><br/>
				{{/unless}}
				{{trimErrorMessage}}
			<br>
				{{trimErrorMessageExtra}}
			{{else}}
				{{#notEmpty saveFolderName}}
					<tctl:msg key="mail.send.success.msg" arg0="{{saveFolderName}}"/>
				{{/notEmpty}}
			{{/if}}
		</p>
	</div>
	<hr />
	<table class="list_report">
		<colgroup>
			<col width="110px" />
			<col width="" />
		</colgroup>
		<tbody>
			{{#unless sendError}}
				{{#if validTo}}
				<tr>
					<th class="default_info">
						<span class="title"><tctl:msg key="mail.to"/></span>
					</th>
					<td>
						<ul class="name_tag">
							{{#each validTo}}
							<li data-email="{{printThis this}}">
								{{#if ../useContact}}
								<span class="ic_form ic_addlist2" evt-rol="layer-save-addr" title="<tctl:msg key="menu.addaddr"/>"></span>
								{{/if}}
								<span class="name">{{printEmailAddress this}}</span></li>
							{{/each}}
						</ul>
					</td>
				</tr>
				{{/if}}
				{{#if validCc}}
				<tr>
					<th class="default_info">
						<span class="title"><tctl:msg key="mail.cc"/></span>
					</th>
					<td>
						<ul class="name_tag">
							{{#each validCc}}
							<li data-email="{{printThis this}}">
								{{#if ../useContact}}
								<span class="ic_form ic_addlist2" evt-rol="layer-save-addr" title="<tctl:msg key="menu.addaddr"/>"></span>
								{{/if}}
								<span class="name">{{printEmailAddress this}}</span></li>
							{{/each}}
						</ul>
					</td>
				</tr>
				{{/if}}
				{{#if validBcc}}
				<tr>
					<th class="default_info">
						<span class="title"><tctl:msg key="mail.bcc"/></span>
					</th>
					<td>
						<ul class="name_tag">
							{{#each validBcc}}
							<li data-email="{{printThis this}}">
								{{#if ../useContact}}
								<span class="ic_form ic_addlist2" evt-rol="layer-save-addr" title="<tctl:msg key="menu.addaddr"/>"></span>
								{{/if}}
								<span class="name">{{printEmailAddress this}}</span></li>
							{{/each}}
						</ul>
					</td>
				</tr>
				{{/if}}
			{{/unless}}
			{{#if invalidAddress}}
			<tr>
				<th class="default_info">
					<span class="title"><tctl:msg key="mail.send.fail.address"/></span>
				</th>
				<td>
					<ul class="name_tag">
						{{#each invalidAddress}}
						<li data-email="{{printThis this}}">
							{{#if ../useContact}}
							<span class="ic_form ic_addlist2" evt-rol="layer-save-addr" title="<tctl:msg key="menu.addaddr"/>"></span>
							{{/if}}
							<span class="name">{{printEmailAddress this}}</span></li>
						{{/each}}
					</ul>
				</td>
			</tr>
			{{/if}}
		</tbody>
	</table>
	<hr />
	<div class="page_action_wrap">
		{{#equal pageMode 'popup'}}
			<a class="btn_minor_s" evt-rol="write-mail-popup"><span class="txt"><tctl:msg key="mail.rewrite"/></span></a>
		{{else}}
			{{#if sendError}}
				<a class="btn_minor_s" fname="Drafts" evt-rol="folder"><span class="txt"><tctl:msg key="mail.godraft"/></span></a>
			{{else}}
				{{#equal sendType "reserved"}}
					<a class="btn_minor_s" fname="Reserved" evt-rol="folder"><span class="txt"><tctl:msg key="mail.goreserved"/></span></a>
				{{/equal}}
				{{#equal sendType "draft"}}
					<a class="btn_minor_s" fname="Drafts" evt-rol="folder"><span class="txt"><tctl:msg key="mail.godraft"/></span></a>
				{{/equal}}
			{{/if}}
			<a class="btn_minor_s" fname="Inbox" evt-rol="folder"><span class="txt"><tctl:msg key="mail.goinbox"/></span></a>
			<a class="btn_minor_s" evt-rol="write-mail"><span class="txt"><tctl:msg key="mail.rewrite"/></span></a>
			<a class="btn_minor_s" evt-rol="go-home"><span class="txt"><tctl:msg key="mail.gomailhome"/></span></a>
		{{/equal}}
	</div>
</div>
</script>

<script id="mail_user_folder_tmpl" type="text/x-handlebars-template">
	{{#each this}}
	{{#user_folder_inbox_check this ../isInbox}}
	{{#unless smartFolder}}
	<li class="{{#if share}}mail_share{{else}}folder{{/if}}" depth="{{depth}}">
		<p id="folder_link_{{encName}}" class="title">
			{{#if child}}{{makeTreeLink id}}{{/if}}
			<a evt-rol="folder" fname="{{fullName}}" title="{{name}}">
                {{#if share}}<span class="ic_side ic_shareboard"></span>{{/if}}
				<span class="txt">{{name}}</span>
			</a>
		<span id="{{id}}_num">
		{{#greateThen unseenCnt 0}}
			<a evt-rol="unseen-folder" fname="{{fullName}}" style="vertical-align:top;"><span class="num">{{unseenCnt}}</span></a>
		{{/greateThen}}
		</span>
			<span class="btn_wrap" evt-rol="mail-folder-option" data-depth="{{depth}}" fname="{{fullName}}" data-share="{{#if share}}on{{/if}}" data-shareseq="{{sharedUid}}"><span class="ic_side ic_more_option" title="<tctl:msg key="mail.foldermgnt"/>"></span></span>
		</p>
		{{#if child}}{{#applyTemplate "mail_user_subfolder_tmpl" child}}{{/applyTemplate}}{{/if}}
	</li>
	{{/unless}}
	{{/user_folder_inbox_check}}
	{{/each}}
</script>

<script id="mail_smart_folder_tmpl" type="text/x-handlebars-template">
	{{#each this}}
	{{#if smartFolder}}
	<li class="mail_{{#printSmartFolder fullName}}{{/printSmartFolder}}">
		<p id="folder_link_{{encName}}" class="title">
			<a evt-rol="folder" fname="{{fullName}}" title="{{name}}"><ins class="ic"></ins><span class="txt">{{name}}</span></a>
			<span id="{{id}}_num">
			{{#greateThen unseenCnt 0}}
				<a evt-rol="unseen-folder" fname="{{fullName}}" style="vertical-align:top;"><span class="num">{{unseenCnt}}</span></a>
			{{/greateThen}}
			</span>
		</p>
	</li>
	{{/if}}
	{{/each}}
</script>


<script id="mail_user_subfolder_tmpl" type="text/x-handlebars-template">
{{#each this}}

<div {{#greateThen depth 5}}style="display:none"{{/greateThen}}>
<ul style="{{#closeTreeLink parentId}}display:none{{/closeTreeLink}}" depth="{{depth}}">
	<li class="{{#if share}}mail_share{{else}}folder{{/if}}" depth="{{depth}}">
		<p id="folder_link_{{encName}}" class="title">
			{{#if child}}{{makeTreeLink id}}{{/if}}
			<a evt-rol="folder" fname="{{fullName}}" title="{{name}}"><ins class="ic"></ins><span class="txt">{{name}}</span></a>
			<span id="{{id}}_num">
			{{#greateThen unseenCnt 0}}
				<a evt-rol="unseen-folder" fname="{{fullName}}" style="vertical-align:top;"><span class="num">{{unseenCnt}}</span></a>
			{{/greateThen}}
			</span>
			<span class="btn_wrap" evt-rol="mail-folder-option" data-depth="{{depth}}" fname="{{fullName}}" data-share="{{#if share}}on{{/if}}" data-shareseq="{{sharedUid}}"><span class="ic_side ic_more_option"></span></span>
		</p>
		{{#if child}}{{#applyTemplate "mail_user_subfolder_tmpl" child}}{{/applyTemplate}}{{/if}}
	</li>
</ul>
</div>

{{#equal depth 6}}
<ul style="{{#closeTreeLink parentId}}display:none{{/closeTreeLink}}" depth="{{depth}}">
	<li class="{{#if share}}mail_share{{else}}folder{{/if}}" depth="{{depth}}">
		<p id="folder_link_{{encName}}" class="title">
			<a fname="" evt-rol="more-folder"><ins class="ic"></ins><span class="txt">...</span></a>
		</p>
	</li>
</ul>
{{/equal}}

{{/each}}
</script>

<script id="mail_toolbar_user_folder_tmpl" type="text/x-handlebars-template">
{{#each this}}
{{#user_folder_inbox_check this ../isInbox}}
<li class="{{#if share}}mail_share{{else}}folder{{/if}}" depth="{{depth}}">
	<p class="title" evt-rol="toolbar-folder" fname="{{fullName}}">
		{{#if child}}<span evt-rol="toggle-mail-folder" class="close" status="open" title="<tctl:msg key="comn.close" />"></span>{{/if}}
		<a><ins class="ic"></ins><span class="txt">{{name}}</span></a>
	</p>
	{{#if child}}{{#applyTemplate "mail_toolbar_user_subfolder_tmpl" child}}{{/applyTemplate}}{{/if}}
</li>
{{/user_folder_inbox_check}}
{{/each}}
</script>

<script id="mail_toolbar_user_subfolder_tmpl" type="text/x-handlebars-template">
{{#each this}}
<ul depth="{{depth}}">
	<li class="{{#if share}}mail_share{{else}}folder{{/if}}" depth="{{depth}}">
		<p class="title" evt-rol="toolbar-folder" fname="{{fullName}}">
			{{#if child}}<span evt-rol="toggle-mail-folder" class="close" status="open" title="<tctl:msg key="comn.close" />"></span>{{/if}}
			<a><ins class="ic"></ins><span class="txt">{{name}}</span></a>
		</p>
		{{#if child}}{{#applyTemplate "mail_toolbar_user_subfolder_tmpl" child}}{{/applyTemplate}}{{/if}}
	</li>
</ul>
{{/each}}
</script>

<script id="shared_folder_tmpl" type="text/x-handlebars-template">
{{#each this}}
<li class="folder_share">
	<p class="title" id="shared_link_{{encName}}">
		<a evt-rol="shared-folder" fname="{{encName}}" seq="{{userId}}" title="{{name}}[{{userName}}({{userUid}})]"><ins class="ic"></ins><span class="txt">{{name}}[{{userName}}({{userUid}})]</span></a>
	</p>
</li>
{{/each}}
</script>

<script id="mail_header_msg_tmpl" type="text/x-handlebars-template">
<span class="txt">
	{{#equal type 'tag'}}
		<span class="ic_tag {{tagInfo.color}}"><span class="tail_r"><span></span></span></span>
		{{tagInfo.name}}
	{{else}}
		{{#greateThen bookmarkSeq 0}}
			{{displayBookmark bookmarkType name}}
		{{else}}
			{{#if isAllFolder}}
				{{#equal extFolder 'on'}}
					{{displayBookmark bookmarkType}}
				{{else}}
					{{name}}
				{{/equal}}
			{{else}}
				{{name}}
			{{/if}}
		{{/greateThen}}
	{{/equal}}
</span>
{{#equal type 'setting'}}
<span class="meta"></span>
{{else}}
	{{#equal type 'write'}}
		<span class="meta"><span id="processMessageWrap" class="num" style="display:none;"><strong id="processMessageContent"></strong></span></span>
	{{else}}
		{{#notEqual type 'mdn'}}
			{{#if isAllFolder}}
				{{#equal extFolder 'on'}}
					{{#if isBookmark}}
						<ins class="ic_star" title="<tctl:msg key="mail.bookmark.del"/>" evt-rol="delete-bookmark"></ins>
					{{else}}
						<ins class="ic_star_off" title="<tctl:msg key="mail.bookmark.add"/>" evt-rol="add-bookmark"></ins>
					{{/if}}
				{{/equal}}
				{{#equal bookmarkType 'tag'}}
					{{#if isBookmark}}
						<ins class="ic_star" title="<tctl:msg key="mail.bookmark.del"/>" evt-rol="delete-bookmark"></ins>
					{{else}}
						<ins class="ic_star_off" title="<tctl:msg key="mail.bookmark.add"/>" evt-rol="add-bookmark"></ins>
					{{/if}}
				{{/equal}}
			{{else}}
				{{#notEqual folderType 'shared'}}
				{{#if isBookmark}}
					<ins class="ic_star" title="<tctl:msg key="mail.bookmark.del"/>" evt-rol="delete-bookmark"></ins>
				{{else}}
					<ins class="ic_star_off" title="<tctl:msg key="mail.bookmark.add"/>" evt-rol="add-bookmark"></ins>
				{{/if}}
				{{/notEqual}}
			{{/if}}
			{{#unless isAllFolder}}
			<span class="meta">
				<tctl:msg key="mail.all.message"/>
				<span class="num"><strong>{{totalCnt}}</strong></span>
				/ <tctl:msg key="mail.flag.unseen.message"/>
				<span class="num"><strong>{{unseenCnt}}</strong></span>
			</span>
			{{/unless}}
		{{/notEqual}}
	{{/equal}}
{{/equal}}
</script>



<script id="mail_toolbar_tmpl" type="text/x-handlebars-template">
<div class="critical">
	<input type="checkbox" id="mailListAllCheck" evt-rol="list-select-all" value="off">
	{{#if quick}}
	{{#unless isPopup}}
	<!--div class="btn_submenu">
		<a class="btn_tool" data-role="button" evt-rol="toolbar" val="quick_search" sub="on" ignore="on"><span class="txt"><tctl:msg key="menu.quick"/></span><span class="ic ic_arrow_down_s"></span></a>
		<div class="array_option fastSearch" style="display:none;">
			<ul id="toolbar_quick_search" class="array_type">
				<li evt-rol="toolbar-quick-search" data-type="F"><ins class="ic_side ic_mail_important"></ins><span><tctl:msg key="mail.flag.flaged.message"/></span></li>
				<li evt-rol="toolbar-quick-search" data-type="U"><ins class="ic_side ic_mail_noread"></ins><span><tctl:msg key="mail.flag.unseen.message"/></span></li>
				<li evt-rol="toolbar-quick-search" data-type="S"><ins class="ic_side ic_mail_read"></ins><span><tctl:msg key="mail.flag.seen.message"/></span></li>
				<li evt-rol="toolbar-quick-search" data-type="TODAY"><ins class="ic_side ic_today"></ins><span><tctl:msg key="mail.flag.today.message"/></span></li>
				<li evt-rol="toolbar-quick-search" data-type="YESTERDAY"><ins class="ic_side ic_mail_yesterday"></ins><span><tctl:msg key="mail.flag.yesterday.message"/></span></li>
				<li evt-rol="toolbar-quick-search" data-type="T"><ins class="ic_side ic_mail_file"></ins><span><tctl:msg key="mail.flag.attach.message"/></span></li>
				<li evt-rol="toolbar-quick-search" data-type="A"><ins class="ic_side ic_mail_reply"></ins><span><tctl:msg key="mail.flag.reply.message"/></span></li>
				<li evt-rol="toolbar-quick-search" data-type="L"><ins class="ic_side ic_mail_sent"></ins><span><tctl:msg key="mail.flag.myself.message"/></span></li>
			</ul>
		</div>
	</div-->
	{{/unless}}
	{{/if}}
	{{#if reply}}
	<div class="btn_submenu">
		<a class="btn_tool btn_tool_multi" data-role="button" evt-rol="toolbar" evt-act="toolbar-write-reply"><span class="ic_toolbar reply"></span><span class="txt"><tctl:msg key="menu.reply"/></span></a><span class="btn_func_more" evt-rol="toolbar" sub="on"><span class="ic ic_arrow_type3"></span></span>
		<div class="array_option reply" style="display:none;">
			<ul id="toolbar_reply" class="array_type">
				<li evt-rol="toolbar-write-reply"><span><tctl:msg key="menu.reply"/></span></li>
				<li evt-rol="toolbar-write-replyall"><span><tctl:msg key="menu.replyall"/></span></li>
			</ul>
		</div>
	</div>
	{{/if}}
	{{#if delete}}
	<div class="btn_submenu">
		<a class="btn_tool btn_tool_multi" data-role="button" evt-rol="toolbar" evt-act="toolbar-message-delete"><span class="ic_toolbar del"></span><span class="txt_caution"><tctl:msg key="comn.del" /></span></a><span class="btn_func_more" evt-rol="toolbar" sub="on"><span class="ic ic_arrow_type3"></span></span>
		<div class="array_option delete" style="display:none;">
			<ul id="toolbar_delete" class="array_type">
				<li evt-rol="toolbar-message-delete"><span><tctl:msg key="comn.del" /></span></li>
				{{#if erase}}<li evt-rol="toolbar-message-erase"><span><tctl:msg key="menu.deleteforever"/></span></li>{{/if}}
				{{#if attachdelete}}<li evt-rol="toolbar-attach-delete"><span><tctl:msg key="mail.del.attach"/></span></li>{{/if}}
			</ul>
		</div>
	</div>
	{{/if}}
	{{#if tag}}
	<div class="btn_submenu">
		<a class="btn_tool" data-role="button" evt-rol="toolbar" sub="on" menu="tag"><span class="ic_toolbar tag"></span><span class="txt"><tctl:msg key="folder.tag"/></span><span class="ic ic_arrow_down_s"></span></a>
		<div id="mailListTagBox" class="array_option tool_tag" style="display:none;max-height:255px;overflow-y:auto">
			<ul id="toolbar_tag_list" class="array_type tag"></ul>
		</div>
	</div>
	{{/if}}
	{{#if spam}}<a data-role="button" class="btn_tool" evt-rol="toolbar" evt-act="toolbar-add-spam"><span class="ic_toolbar spam"></span><span class="txt"><tctl:msg key="menu.spam"/></span></a>{{/if}}
	{{#if notspam}}<a data-role="button" class="btn_tool" evt-rol="toolbar" evt-act="toolbar-add-white"><span class="ic_toolbar spam"></span><span class="txt"><tctl:msg key="menu.white"/></span></a>{{/if}}
	{{#if forward}}
	<div class="btn_submenu">
		<a class="btn_tool btn_tool_multi" data-role="button" evt-rol="toolbar" evt-act="toolbar-forward-quick"><span class="ic_toolbar forwading"></span><span class="txt"><tctl:msg key="menu.forward"/></span></a><span class="btn_func_more" evt-rol="toolbar" sub="on" menu="forward"><span class="ic ic_arrow_type3"></span></span>
		<div class="array_option  forward" style="display:none;">
			<ul id="toolbar_forward" class="array_type">
				<li id="toolbarForwardParsedMenu" evt-rol="toolbar-forward-parsed"><span><tctl:msg key="menu.forward.parsed"/></span></li>
				<li evt-rol="toolbar-forward-attached"><span><tctl:msg key="menu.forward.attach"/></span></li>
			</ul>
		</div>
	</div>
	{{/if}}
	{{#if seen}}
	<div class="btn_submenu">
		<a class="btn_tool btn_tool_multi" data-role="button" evt-rol="toolbar" evt-act="change-flag-seen"><span class="ic_toolbar read"></span><span class="txt"><tctl:msg key="menu.flag.read"/></span></a><span class="btn_func_more" evt-rol="toolbar" sub="on"><span class="ic ic_arrow_type3"></span></span>
		<div class="array_option read" style="display:none;">
			<ul id="toolbar_seen_flag" class="array_type">
				<li evt-rol="change-flag-seen"><span><tctl:msg key="menu.flag.read"/></span></li>
				<li evt-rol="change-flag-unseen"><span><tctl:msg key="menu.flag.unread"/></span></li>
			</ul>
		</div>
	</div>
	{{/if}}
	{{#if move}}
	<div class="btn_submenu">
		<a class="btn_tool" data-role="button" evt-rol="toolbar" sub="on" menu="move"><span class="ic_toolbar move"></span><span class="txt"><tctl:msg key="menu.move"/></span><span class="ic ic_arrow_down_s"></span></a>
		<div class="array_option move context_depth context_mailbox_detail" style="display:none;background-color:#ffffff;">
			<div class="list_wrap">
				<ul id="toolbar_move_message" class="side_depth" auto-close="off">
					<li class="mail_inbox default_folder">
						<p class="title" evt-rol="toolbar-folder" fname="Inbox">
							<span id="inboxToggleFolder" evt-rol="toggle-mail-folder" class="close" status="open" title="<tctl:msg key="comn.close" />" style="display:none"></span>
							<a><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.inbox"/></span></a>
						</p>
						<ul id="toolbarInboxMoveMessageList"></ul>
					</li>
					<c:if test="${useSpamFolder}">
					<li class="mail_spam default_folder">
						<p class="title" evt-rol="toolbar-folder" fname="Spam"><a><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.spam"/></span></a></p>
					</li>
					</c:if>
					<li class="trash default_folder">
						<p class="title" evt-rol="toolbar-folder" fname="Trash"><a><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.trash"/></span></a></p>
					</li>
				</ul>
				<ul id="toolbarMoveMessageList" class="side_depth"></ul>
				{{#if copy}}
				<div class="add_option">
					<input type="checkbox" id="checkMessageCopy">
					<label for="checkMessageCopy"><tctl:msg key="menu.copy"/></label>
				</div>
				{{/if}}
			</div>
		</div>
	</div>
	{{/if}}
	{{#unless move}}
		{{#if copy}}
			<div class="btn_submenu">
				<a class="btn_tool" data-role="button" evt-rol="toolbar" sub="on" menu="move"><span class="ic_toolbar move"></span><span class="txt"><tctl:msg key="menu.copy"/></span><span class="ic ic_arrow_down_s"></span></a>
				<div class="array_option move context_depth context_mailbox_detail" style="display:none;background-color:#ffffff;">
					<div class="list_wrap">
						<ul id="toolbar_move_message" class="side_depth" auto-close="off">
							<li class="mail_inbox default_folder">
								<p class="title" evt-rol="toolbar-folder" fname="Inbox">
									<span id="inboxToggleFolder" evt-rol="toggle-mail-folder" class="close" status="open" title="<tctl:msg key="comn.close" />" style="display:none"></span>
									<a><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.inbox"/></span></a>
								</p>
								<ul id="toolbarInboxMoveMessageList"></ul>
							</li>
							<c:if test="${useSpamFolder}">
							<li class="mail_spam default_folder">
								<p class="title" evt-rol="toolbar-folder" fname="Spam"><a><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.spam"/></span></a></p>
							</li>
							</c:if>
							<li class="trash default_folder">
								<p class="title" evt-rol="toolbar-folder" fname="Trash"><a><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.trash"/></span></a></p>
							</li>
						</ul>
						<ul id="toolbarMoveMessageList" class="side_depth"></ul>
						<input type="checkbox" id="onlyMessageCopy" style="display:none;" checked="checked">
					</div>
				</div>
			</div>
		{{/if}}
	{{/unless}}
	{{#if thismail}}
	<div class="btn_submenu">
		<a class="btn_tool" data-role="button" evt-rol="toolbar" sub="on" ignore="on"><span class="ic_toolbar more"></span><span class="txt"><tctl:msg key="mail.thismessage"/></span><span class="ic ic_arrow_down_s"></span></a>
		<div class="array_option option" style="display:none;">
			<ul id="toolbar_etc" class="array_type">
				{{#if save}}<li evt-rol="toolbar-message-save"><span><tctl:msg key="menu.save"/></span></li>{{/if}}
				{{#if print}}<li evt-rol="toolbar-print"><span><tctl:msg key="menu.print"/></span></li>{{/if}}
				{{#if filter}}<li evt-rol="toolbar-message-filter"><span><tctl:msg key="menu.rule"/></span></li>{{/if}}
				{{#if reject}}<li evt-rol="toolbar-add-reject"><span><tctl:msg key="mail.receivreject"/></span></li>{{/if}}
				{{#if allow}}<li evt-rol="toolbar-add-allow"><span><tctl:msg key="mail.receivallow"/></span></li>{{/if}}
				{{#if resend}}<li evt-rol="toolbar-rewrite"><span><tctl:msg key="mail.resend"/></span></li>{{/if}}

			</ul>
		</div>
	</div>
	{{/if}}
</div>
<div id="mailOptionBoxWrap" class="optional"></div>
</script>

<script id="mail_list_option_tmpl" type="text/x-handlebars-template">
<div class="optional_type2 optional_mail">
	<div class="btn_submenu">
		<a class="btn_tool" data-role="button" title="<tctl:msg key="mail.sortselect"/>" evt-rol="sort-toolbar"><span class="ic_toolbar sort"></span><span class="ic ic_arrow_down_s"></span></a>
		<div class="array_option" style="display: none">
			<div class="column">
				<div class="tit"><tctl:msg key="mail.sortselect"/></div>
				<ul id="toolbar_sort_flag"  class="array_type">
					<li evt-rol="list-sort" by="from" class="">
						<span><tctl:msg key="mail.from"/></span>
						<span class="sort"></span>
					</li>
					<li evt-rol="list-sort" by="subj" class="">
						<span><tctl:msg key="mail.subject"/></span>
						<span class="sort"></span>
					</li>
					<li evt-rol="list-sort" by="arrival" class="sorting_desc">
						<span><tctl:msg key="mail.receivedate"/></span>
						<span class="sort ic_toolbar sort_down"></span>
					</li>
					<li evt-rol="list-sort" by="size" class="">
						<span><tctl:msg key="mail.size"/></span>
						<span class="sort"></span>
					</li>
				</ul>
			</div>
			<div class="column">
				<div class="tit"><tctl:msg key="menu.quick"/></div>
				<ul id="toolbar_quick_search" class="array_type">
					<li evt-rol="toolbar-quick-search" data-type="F">
						<span><tctl:msg key="mail.flag.flaged.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="U">
						<span><tctl:msg key="mail.flag.unseen.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="S">
						<span><tctl:msg key="mail.flag.seen.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="TODAY">
						<span><tctl:msg key="mail.flag.today.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="YESTERDAY">
						<span><tctl:msg key="mail.flag.yesterday.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="T">
						<span><tctl:msg key="mail.flag.attach.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="A">
						<span><tctl:msg key="mail.flag.reply.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="L">
						<span><tctl:msg key="mail.flag.myself.message"/></span>
					</li>
				</ul>
			</div>
		</div>
	</div>
    {{#unless isAllFolder}}
    {{#if isUseRefreshTime}}
    <div class="btn_submenu">
        <a class="btn_tool btn_tool_multi" title='<tctl:msg key="common.refresh" />'><span class="ic ic_refresh" evt-rol="refresh-mail-list"></span><span id="refresh_min_text" class="min">{{#notEqual refreshTime '-1'}}{{refreshTime}}{{/notEqual}}</span></a><span class="btn_func_more" evt-rol="refresh-toolbar"><span class="ic ic_arrow_type3"></span></span>
        <div class="array_option" style="width:90px; display: none">
            <ul id="toolbar_refresh_flag" class="array_type">
                <li evt-rol="select-refresh-time" data-value="-1"><span class="txt"><tctl:msg key="comn.disabled" /></span><span class="ic_board ic_check" style="display: {{#equal refreshTime '-1'}}block{{else}}none{{/equal}}"></span></li>
                <li evt-rol="select-refresh-time" data-value="5"><span class="txt">5<tctl:msg key="comn.min" /></span><span class="ic_board ic_check" style="display: {{#equal refreshTime '5'}}block{{else}}none{{/equal}}"></span></li>
                <li evt-rol="select-refresh-time" data-value="10"><span class="txt">10<tctl:msg key="comn.min" /></span><span class="ic_board ic_check" style="display: {{#equal refreshTime '10'}}block{{else}}none{{/equal}}"></span></li>
                <li evt-rol="select-refresh-time" data-value="15"><span class="txt">15<tctl:msg key="comn.min" /></span><span class="ic_board ic_check" style="display: {{#equal refreshTime '15'}}block{{else}}none{{/equal}}"></span></li>
            </ul>
        </div>
    </div>
    {{else}}
    <div class="btn_submenu">
        <a class="btn_tool" title='<tctl:msg key="common.refresh" />'><span class="ic ic_refresh" evt-rol="refresh-mail-list"></span></a>
    </div>
    {{/if}}
    {{/unless}}

    <div class="btn_submenu">
        <a class="btn_tool btn_tool_multi" data-role="button" evt-rol="layout-toolbar" title="{{#equal layoutMode 'n'}}<tctl:msg key="mail.pane.normal"/>{{else}}{{#equal layoutMode 'v'}}<tctl:msg key="mail.pane.vertical"/>{{else}}<tctl:msg key="mail.pane.horizon"/>{{/equal}}{{/equal}}"><span class="ic_con {{#equal layoutMode 'n'}}ic_layer1_active{{else}}{{#equal layoutMode 'v'}}ic_layer2_active{{else}}ic_layer3_active{{/equal}}{{/equal}}"></span><span class="ic ic_arrow_type3"></span></a>
        <div class="array_option array_option_layer" style="display: none; left:-55px">
            <div id="toolbar_layout_flag" class="wrap_btn_layout">
                <a title="<tctl:msg key="mail.pane.normal"/>" evt-rol="toolbar-change-mailmode"><span id="readMode_layer1" class="ic_con {{#equal layoutMode 'n'}}ic_layer1_active{{else}}ic_layer1{{/equal}}" title="<tctl:msg key="mail.pane.normal"/>" val="n"></span></a>
                <a title="<tctl:msg key="mail.pane.vertical"/>" evt-rol="toolbar-change-mailmode"><span id="readMode_layer2" class="ic_con {{#equal layoutMode 'v'}}ic_layer2_active{{else}}ic_layer2{{/equal}}" title="<tctl:msg key="mail.pane.vertical"/>" val="v"></span></a>
                <a title="<tctl:msg key="mail.pane.horizon"/>" evt-rol="toolbar-change-mailmode"><span id="readMode_layer3" class="ic_con {{#equal layoutMode 'h'}}ic_layer3_active{{else}}ic_layer3{{/equal}}" title="<tctl:msg key="mail.pane.horizon"/>" val="h"></span></a>
            </div>
        </div>
    </div>
    <select id="toolbar_list_pagebase" evt-rol="change-pagebase">
        <option value="20" {{#equal pageBase 20}}selected{{/equal}}>20</option>
        <option value="40" {{#equal pageBase 40}}selected{{/equal}}>40</option>
        <option value="60" {{#equal pageBase 60}}selected{{/equal}}>60</option>
        <option value="80" {{#equal pageBase 80}}selected{{/equal}}>80</option>
    </select>
</div>
</script>
<script id="mail_list_option_page_tmpl" type="text/x-handlebars-template">
<div class="optional_type2 optional_mail">
	<div class="btn_submenu">
		<a class="btn_tool" data-role="button" title="<tctl:msg key="mail.sortselect"/>" evt-rol="sort-toolbar"><span class="ic_toolbar sort"></span><span class="ic ic_arrow_down_s"></span></a>
		<div class="array_option" style="display: none">
			<div class="column">
				<div class="tit"><tctl:msg key="mail.sortselect"/></div>
				<ul id="toolbar_sort_flag"  class="array_type">
					<li evt-rol="list-sort" by="from" class="">
						<span><tctl:msg key="mail.from"/></span>
						<span class="sort"></span>
					</li>
					<li evt-rol="list-sort" by="subj" class="">
						<span><tctl:msg key="mail.subject"/></span>
						<span class="sort"></span>
					</li>
					<li evt-rol="list-sort" by="arrival" class="sorting_desc">
						<span><tctl:msg key="mail.receivedate"/></span>
						<span class="sort ic_toolbar sort_down"></span>
					</li>
					<li evt-rol="list-sort" by="size" class="">
						<span><tctl:msg key="mail.size"/></span>
						<span class="sort"></span>
					</li>
				</ul>
			</div>
			<div class="column">
				<div class="tit"><tctl:msg key="menu.quick"/></div>
				<ul id="toolbar_quick_search" class="array_type">
					<li evt-rol="toolbar-quick-search" data-type="F">
						<span><tctl:msg key="mail.flag.flaged.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="U">
						<span><tctl:msg key="mail.flag.unseen.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="S">
						<span><tctl:msg key="mail.flag.seen.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="TODAY">
						<span><tctl:msg key="mail.flag.today.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="YESTERDAY">
						<span><tctl:msg key="mail.flag.yesterday.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="T">
						<span><tctl:msg key="mail.flag.attach.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="A">
						<span><tctl:msg key="mail.flag.reply.message"/></span>
					</li>
					<li evt-rol="toolbar-quick-search" data-type="L">
						<span><tctl:msg key="mail.flag.myself.message"/></span>
					</li>
				</ul>
			</div>
		</div>
	</div>
    <div class="btn_submenu">
        <a class="btn_tool" title='<tctl:msg key="common.refresh" />'><span class="ic ic_refresh" evt-rol="refresh-mail-list"></span></a>
    </div>
    <select id="toolbar_list_pagebase" evt-rol="change-pagebase">
        <option value="20" {{#equal pageBase 20}}selected{{/equal}}>20</option>
        <option value="40" {{#equal pageBase 40}}selected{{/equal}}>40</option>
        <option value="60" {{#equal pageBase 60}}selected{{/equal}}>60</option>
        <option value="80" {{#equal pageBase 80}}selected{{/equal}}>80</option>
    </select>
</div>
</script>

<script id="mail_write_toolbar_tmpl" type="text/x-handlebars-template">
<div class="critical">
	<a class="btn_major_s" data-role="button" evt-rol="send-message">
		<span class="ic_toolbar send"></span>
		<span class="txt"><tctl:msg key="menu.send"/></span>
	</a>
	<a class="btn_tool" data-role="button" evt-rol="send-draft">
		<span class="ic_toolbar save"></span>
		<span class="txt"><tctl:msg key="menu.draft"/></span>
	</a>
	<a class="btn_tool" data-role="button" evt-rol="toolbar" evt-act="toolbar-write-preview">
		<span class="ic_toolbar preview"></span>
		<span class="txt"><tctl:msg key="mail.preview"/></span>
	</a>
	<a class="btn_tool" data-role="button" evt-rol="toolbar-write-cancel">
		<span class="ic_toolbar refresh"></span>
		<span class="txt"><tctl:msg key="mail.rewrite"/></span>
	</a>
</div>

<div class="optional_type2 optional_mail">
	<label>
		<select id="autoSaveSelect" evt-rol="auto-save">
			<option value="0" {{#equal autoSaveTerm 0}}selected="selected"{{/equal}}><tctl:msg key="autosave.option.nosave"/></option>
			<option value="30" {{#equal autoSaveTerm 30}}selected="selected"{{/equal}}><tctl:msg key="autosave.title"/>(30<tctl:msg key="autosave.option.sec"/>)</option>
			<option value="60" {{#equal autoSaveTerm 60}}selected="selected"{{/equal}}><tctl:msg key="autosave.title"/>(1<tctl:msg key="autosave.option.min"/>)</option>
			<option value="180" {{#equal autoSaveTerm 180}}selected="selected"{{/equal}}><tctl:msg key="autosave.title"/>(3<tctl:msg key="autosave.option.min"/>)</option>
		</select>
	</label>
</div>
</script>

<script id="mail_read_optionbox_tmpl" type="text/x-handlebars-template">

	{{#if preNavi}}
		{{#with preNavi}}
		<a class="btn_tool" evt-rol="read-message-simple" folder="{{folderName}}" uid="{{uid}}"><span class="ic_toolbar up" title="<tctl:msg key="comn.page.up" />"></span><span class="txt"><tctl:msg key="comn.page.up" /></span></a>
		{{/with}}
	{{/if}}
	{{#if nextNavi}}
		{{#with nextNavi}}
		<a class="btn_tool" evt-rol="read-message-simple" folder="{{folderName}}" uid="{{uid}}"><span class="ic_toolbar down" title="<tctl:msg key="comn.page.down" />"></span><span class="txt"><tctl:msg key="comn.page.down" /></span></a>
		{{/with}}
	{{/if}}
	{{#unless isPopup}}
		<a class="btn_tool" evt-rol="reload-list"><span class="ic_toolbar list" title="<tctl:msg key="comn.list" />"></span><span class="txt"><tctl:msg key="comn.list" /></span></a>
	{{/unless}}


</script>

<script id="mail_bookmark_tmpl" type="text/x-handlebars-template">
{{#each this}}
	<li id="bookmark_{{bookmarkSeq}}" class="{{bookmarkCss bookmarkType bookmarkValue}}" seq="{{bookmarkSeq}}" query="{{bookmarkValue}}" type="{{bookmarkType}}">
		<p id="bookmark_title_{{bookmarkSeq}}" class="title" title="{{displayBookmark bookmarkType bookmarkName}}">
			<a evt-rol="bookmark-execute"><ins class="ic"></ins><span class="txt">{{displayBookmark bookmarkType bookmarkName}}</span></a>
			<span id="bookmark_num_{{bookmarkSeq}}">
			</span>
			<span class="btn_wrap" style="display:none;"><span class="ic_side ic_list_del" evt-rol="bookmark-delete" title="<tctl:msg key="comn.del" />"></span></span>
		</p>
	</li>
{{/each}}
</script>

<script id="mail_tag_tmpl" type="text/x-handlebars-template">
{{#each this}}
<li class="tag">
	<p id="tag_link_{{id}}" class="title">
		<a evt-rol="tag-message" val="{{id}}">
			<span class="ic_tag {{color}}"><span class="tail_r"><span></span></span></span>
			<span class="txt" data-droptype="tag">{{name}}</span>
		</a>
		<span class="btn_wrap" evt-rol="mail-tag-option" tagid="{{id}}" tagname="{{name}}" tagcolor="{{color}}"><span class="ic_side ic_more_option" title="<tctl:msg key="mail.tag.job"/>"></span></span>
	</p>
</li>
{{/each}}
</script>

<script id="mail_preview_tmpl" type="text/x-handlebars-template">
<header>
	<h1><tctl:msg key="mail.preview"/></h1>
	<span class="btn_fn12 btn_print" evt-rol="print-message"><span class="ic_gnb ic_pri_mini"></span><span class="txt"><tctl:msg key="menu.print"/></span></span>
	<a class="btn_layer_x" href="javascript:this.close();"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close" /></span></a>
</header>
<div class="content">
	<div id="mailViewContentWrap" class="view_content mail_view">
		<div class="header">
			<h2>
				{{#equal subject ""}}
					<tctl:msg key="header.nosubject"/>
				{{else}}
					{{subject}}
				{{/equal}}
			</h2>
			<table class="list_report">
				<colgroup>
					<col width="85px" />
					<col width="" />
				</colgroup>
				<tbody>
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.from"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								<li><span class="name" title="{{printEmailAddress from}}">{{printEmailAddress from}}</span></li>
							</ul>
						</td>
					</tr>
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.to"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								{{#each toList}}
								<li>
									<span class="name" title="{{makeEmailAddress personal address}}">
										{{#empty personal}}
											{{address}}
										{{else}}
											{{personal}}&lt;{{address}}&gt;
										{{/empty}}
									</span>
								</li>
								{{/each}}
							</ul>
						</td>
					</tr>
					{{#if ccList}}
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.cc"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								{{#each ccList}}
								<li>
									<span class="name" title="{{makeEmailAddress personal address}}">
										{{#empty personal}}
											{{address}}
										{{else}}
											{{personal}}&lt;{{address}}&gt;
										{{/empty}}
									</span>
								</li>
								{{/each}}
							</ul>
						</td>
					</tr>
					{{/if}}
					{{#if bccList}}
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.bcc"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								{{#each bccList}}
								<li>
									<span class="name" title="{{makeEmailAddress personal address}}">
										{{#empty personal}}
											{{address}}
										{{else}}
											{{personal}}&lt;{{address}}&gt;
										{{/empty}}
									</span>
								</li>
								{{/each}}
							</ul>
						</td>
					</tr>
					{{/if}}
				</tbody>
			</table>
		</div>
		<!-- 첨부파일 -->
		<div class="add_file" style="display:">
			<div class="add_file_header">
				<span class="subject">
					<span class="ic ic_file_s"></span>
					{{#if attachList}}
					<strong><tctl:msg key="mail.attach"/></strong>
					<span class="num">{{attachList.length}}</span><tctl:msg key="mail.unit.count"/>
					{{else}}
					<strong><tctl:msg key="mail.noattach"/></strong>
					{{/if}}
					</span>
			</div>
			{{#if attachList}}
			<ul class="file_wrap">
				{{#each attachList}}
				<li>
					<span class="item_file">
						<span class="ic_file ic_{{fileType}}"></span>
						<span class="name">{{fileName}}</span>
						{{#notEqual fsize "0Byte"}}
						<span class="size">({{fsize}})</span>
						{{/notEqual}}
					</span>
				</li>
				{{/each}}
			</ul>
			{{/if}}
		</div>
		<div id="readContentMessageWrap">
			<textarea id="messageText" style="display:none;">{{htmlContent}}</textarea>
			<iframe frameborder='0' width='100%' height='300px' scrolling='no' src='${baseUrl}resources/js/plugins/mail/messageContent.html?rev=${revision}' id='messageContentFrame'></iframe>
		</div>
</div>
</div>
<footer class="btn_layer_wrap">
	<a class="btn_minor_s" href="javascript:this.close();"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close" /></span></a>
</footer>
</script>

<script id="mail_mdn_list_toolbar_tmpl" type="text/x-handlebars-template">
<div class="critical">
	<input type="checkbox" evt-rol="list-select-all">
	<div class="btn_submenu">
		<a class="btn_tool" data-role="button" evt-rol="toolbar" evt-act="toolbar-message-delete">
			<span class="ic_toolbar del"></span>
			<span class="txt"><tctl:msg key="comn.del" /></span>
		</a>
	</div>

	<div class="btn_submenu">
		<a class="btn_tool" data-role="button" evt-rol="toolbar" evt-act="toolbar-mdn-recall-all">
			<span class="ic_toolbar cancel"></span>
			<span class="txt_caution"><tctl:msg key="mail.mdn.recall"/></span>
		</a>
	</div>
	<div class="btn_submenu">
		<span class="txt_b_side">※<tctl:msg key="mail.mdn.info"/></span>
	</div>
</div>
<div class="optional_type2 optional_mail">
	<label>
		{{#with pageInfo}}
		<select id="toolbar_list_pagebase" evt-rol="change-pagebase">
			<option value="20" {{#equal pageSize 20}}selected{{/equal}}>20</option>
			<option value="40" {{#equal pageSize 40}}selected{{/equal}}>40</option>
			<option value="60" {{#equal pageSize 60}}selected{{/equal}}>60</option>
			<option value="80" {{#equal pageSize 80}}selected{{/equal}}>80</option>
		</select>
		{{/with}}
	</label>
</div>
</script>

<script id="mail_mdn_read_toolbar_tmpl" type="text/x-handlebars-template">
<div class="critical">
	<a class="btn_tool" data-role="button" evt-rol="toolbar" evt-act="toolbar-mdn-recall"><span class="txt_caution"><tctl:msg key="mail.mdn.recall"/></span></a>
	<a class="btn_tool" data-role="button" evt-rol="toolbar" evt-act="toolbar-mdn-sent-view" ignore="on"><span class="txt_caution"><tctl:msg key="mail.mdn.sent.view"/></span></a>
</div>

<div class="optional">
	<a class="btn_tool" evt-rol="reload-mdn-list"><span class="ic_gnb ic_list" title="<tctl:msg key="comn.list" />"></span><span class="txt"><tctl:msg key="comn.list" /></span></a>
</div>
</script>

<script id="mail_mdn_list_header_tmpl" type="text/x-handlebars-template">
<table class="type_normal mail_list">
	<colgroup>
		<col style="width:40px" />
		<col style="width:100px" />
		<col style="width:100px" />
		<col style="width:130px" />
		<col />
	</colgroup>
	<thead>
		<tr>
			<!--
				* sorting 			- 정렬을 지원하는 항목 배경
				* sorting_disabled 	- 정렬을 지원하지 않는 항목
				* sorting_desc 		- 내림차순 정렬 선택됨
				* sorting_asc 		- 오름차순 정렬 선택됨
			-->
			<th class="sorting_disabled align_c"><input type="checkbox" evt-rol="list-select-all"/></th>
			<th class="sorting_disabled"><span class="title_sort"><tctl:msg key="mail.senddate"/><ins class="ic"></ins></span></th>
			<th class="sorting_disabled"><span class="title_sort"><tctl:msg key="menu.receivenoti"/><ins class="ic"></ins></span></th>
			<th class="sorting_disabled"><span class="title_sort"><tctl:msg key="mail.to"/><ins class="ic"></ins></span></th>
			<th class="sorting_disabled"><span class="title_sort"><tctl:msg key="mail.subject"/><ins class="ic"></ins></span></th>
		</tr>
	</thead>
</table>
</script>

<script id="mail_mdn_list_tmpl" type="text/x-handlebars-template">
<table id="mail_mdn_list_content" class="type_normal mail_list">
	<colgroup>
		<col style="width:40px" />
		<col style="width:100px" />
		<col style="width:120px" />
		<col style="width:130px" />
		<col />
	</colgroup>
	<tbody>
		{{#if mdnList}}
		{{#each mdnList}}
		<tr id="{{folder}}_{{id}}" class="read_no">
			<td class="align_c"><input type="checkbox" value="{{messageId}}" name="msgId" evt-rol="check-list" subject="{{subject}}"></td>
			<td><span class="date">{{printMdnListDate dateUtc}}</span></td>
			<td>
				<span class="{{#notEqual mdnCode 1000}}reception_no{{/notEqual}}">
				{{#lessThen mdnCount 0}}
					<tctl:msg key="mail.mdn.notselect"/>
				{{/lessThen}}
				{{#equal mdnCount 1}}
					{{makeMdn mdnCode mdnTimeUtc}}
				{{/equal}}
				{{#greateThen mdnCount 1}}
					{{mdnReadCount}} / {{mdnCount}}
				{{/greateThen}}
				</span>
			</td>
			<td>
				{{#if ../mailExposure}}
				<span class="name" style="cursor:auto" title="{{to}}">{{toSimple}}</span>
				{{else}}
				<span class="name" style="cursor:auto" title="{{toSimple}}">{{toSimple}}</span>
				{{/if}}
			</td>
			<td>
				{{#greateThen mdnCount 0}}
					<a messageId="{{messageId}}" subject="{{subject}}" date="{{dateUtc}}" evt-rol="receive-noti-read">
						<span class="subject">
							{{#equal subject ""}}
								<tctl:msg key="header.nosubject"/>
							{{else}}
								{{subject}}
							{{/equal}}
						</span>
					</a>
				{{else}}
					<span class="subject">
						{{#equal subject ""}}
							<tctl:msg key="header.nosubject"/>
						{{else}}
							{{subject}}
						{{/equal}}
					</span>
				{{/greateThen}}
			</td>
		</tr>
		{{/each}}
		{{else}}
		<tr>
				<td colspan="{{#equal folderType 'all'}}7{{else}}6{{/equal}}"><p class="data_null"><tctl:msg key="mail.notexist"/></p></td>
			</tr>
		{{/if}}
	</tbody>
</table>
</script>

<script id="mail_mdn_read_tmpl" type="text/x-handlebars-template">
<div class="column">
	<div class="view_content mail_view mail_receipt">
		<div class="header">
			<h2>
				{{#equal subject ""}}
					<tctl:msg key="header.nosubject"/>
				{{else}}
					{{subject}}
				{{/equal}}
			</h2>
			<input type="hidden" id="mdnReadUid" value="{{uid}}"/>
			<input type="hidden" id="mdnMessageId" value="{{messageId}}"/>
			<input type="hidden" id="mdnMessageSubject" value="{{subject}}"/>
			<table class="list_report">
				<colgroup>
					<col width="65px" />
					<col width="" />
				</colgroup>
				<tbody>
					<tr style="display:">
						<th><span class="title"><tctl:msg key="mail.senddate"/> :</span></th>
						<td><span class="date">{{printReadDate dateUtc}}</span></td>
					</tr>
					<tr style="display:">
						<th><span class="title"><tctl:msg key="mail.to"/> :</span></th>
						<td><tctl:msg key="mail.mdn.total" arg0="{{mdnCount.totalCount}}"/></td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="mail_count">
			<span><tctl:msg key="mail.mdn.read"/></span><span class="num">{{mdnCount.readCount}}</span><tctl:msg key="mail.unit.count"/>,
			<span><tctl:msg key="mail.mdn.unread"/></span><span class="num">{{mdnCount.unseenCount}}</span><tctl:msg key="mail.unit.count"/>,
			<span><tctl:msg key="mail.mdn.fail"/></span><span class="num">{{mdnCount.failCount}}</span><tctl:msg key="mail.unit.count"/>,
			<span><tctl:msg key="mail.mdn.recall"/></span><span class="num">{{mdnCount.recallCount}}</span><tctl:msg key="mail.unit.count"/>,
			<span><tctl:msg key="mail.mdn.etc"/></span><span class="num">{{mdnCount.etcCount}}</span><tctl:msg key="mail.unit.count"/>
		</div>
		<span class="desc caution">※<tctl:msg key="mail.mdn.info"/></span>
		<table id="mail_mdn_read_content" class="type_normal list_simple">
			<colgroup>
				<col width="20px" />
				<col width="*" />
				<col width="150px" />
				<col width="150px" />
			</colgroup>
			<tbody>
				{{#if rcptList}}
				{{#each rcptList}}
				<tr>
					<td>
						{{#isMdnCheck localDomain code}}
						<input type="checkbox" name="msgId" value="{{address}}" evt-rol="check-list">
						{{else}}
						<input type="checkbox" disabled="disabled">
						{{/isMdnCheck}}
					</td>
					<td><span class="name" title="{{#if ../../mailExposure}}{{printAddress}}{{else}}{{getEmailNotInCompanyDomain ../../../companyDomainList printAddress}}{{/if}}">{{#if ../../mailExposure}}{{printAddress}}{{else}}{{getEmailNotInCompanyDomain ../../../companyDomainList printAddress}}{{/if}}</span></td>
					<td><span class="reception_no">{{status}}</span></td>
					<td><span>{{printMdnReadMessage message}}</span></td>
				</tr>
				{{/each}}
				{{/if}}
			</tbody>
		</table>
	</div>
</div>
</script>

<script id="mail_print_tmpl" type="text/x-handlebars-template">
{{#with msgContent}}
<header>
	<h1>
		<tctl:msg key="mail.print.preview"/>
		<span class="btn_wrap" onclick="javascript:window.print();" title="<tctl:msg key="mail.print.action"/>">
			<span class="btn_minor_s">
				<span class="ic_print"></span><span class="txt"><tctl:msg key="menu.print"/></span>
			</span>
		</span>
	</h1>
	<a class="btn_layer_x" href="javascript:this.close();"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close" /></span></a>
</header>
<div class="content">
	<div class="view_content mail_view mail_receipt">
		<div class="header">
			<h2>
				{{#equal subject ""}}
					<tctl:msg key="header.nosubject"/>
				{{else}}
					{{subject}}
				{{/equal}}
			</h2>
			<table class="list_report">
				<colgroup>
					<col width="65px" />
					<col width="" />
				</colgroup>
				<tbody>
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.from"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								<li>
									<span class="name">
										{{#if ../addressVisible}}
											{{from}}
										{{else}}
											{{fromPersonal}}
										{{/if}}
									</span>
								</li>
							</ul>
						</td>
					</tr>
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.to"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								{{#each toList}}
								<li data-type="to">
									<span class="name">
										{{#empty personal}}
											{{address}}
										{{else}}
											{{#if ../../../addressVisible}}
												{{personal}}&lt;{{address}}&gt;
											{{else}}
												{{personal}}
											{{/if}}
										{{/empty}}
									</span>
								</li>
								{{/each}}
							</ul>
						</td>
					</tr>
					{{#if ccList}}
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.cc"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								{{#each ccList}}
								<li data-type="cc">
									<span class="name">
										{{#empty personal}}
											{{address}}
										{{else}}
											{{#if ../../../addressVisible}}
												{{personal}}&lt;{{address}}&gt;
											{{else}}
												{{personal}}
											{{/if}}
										{{/empty}}
									</span>
								</li>
								{{/each}}
							</ul>
						</td>
					</tr>
					{{/if}}
					{{#if bccList}}
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.bcc"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								{{#each bccList}}
								<li>
									<span class="name">
										{{#empty personal}}
											{{address}}
										{{else}}
											{{#if ../../../addressVisible}}
												{{personal}}&lt;{{address}}&gt;
											{{else}}
												{{personal}}
											{{/if}}
										{{/empty}}
									</span>
								</li>
								{{/each}}
							</ul>
						</td>
					</tr>
					{{/if}}
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.senddate"/></span>
						</th>
						<td>
							<span class="date">{{printReadDate dateUtc}}</span>
						</td>
					</tr>
					{{#if nationList}}
					<tr>
						<th><span class="title"><tctl:msg key="conf.profile.83" /></span></th>
						<td>
							<span class="wrap_nation">
							{{#each_with_index nationList}}
								{{#unless isFirst}}
								<span class="to">&gt;</span>
								{{/unless}}
								<span class="date" title="{{ip}}">
									<span class="ic_nation nation_{{code}}"></span>
									{{#printNationText code text}}{{/printNationText}}
								</span>
							{{/each_with_index}}
							</span>
						</td>
					</tr>
					{{/if}}
				</tbody>
			</table>
		</div>
		<!-- 첨부파일 -->
		<div class="add_file" style="display:">
			<div class="add_file_header">
				<span class="subject">
					<span class="ic ic_file_s"></span>
					{{#if attachList}}
					<strong><tctl:msg key="mail.attach"/></strong>
					<span class="num">{{../attachFileCount}}</span><tctl:msg key="mail.unit.count"/>
					{{else}}
					<strong><tctl:msg key="mail.noattach"/></strong>
					{{/if}}
				</span>
			</div>
			{{#if attachList}}
			<ul class="file_wrap">
				{{#each attachList}}
				<li class="{{#equal size 0}}deleted{{/equal}}">
					<span class="item_file">
						<span class="ic_file ic_{{fileType}}"></span>
					{{#greateThen size 0}}
						<span class="name">{{fileName}}</span>
						<span class="size">({{fsize}})</span>
					{{else}}
						<span>{{fileName}} [<tctl:msg key="mail.deleteattach"/>]</span>
					{{/greateThen}}
					</span>
				</li>
				{{/each}}
			</ul>
			{{/if}}
		</div>
		<div id="mailViewArea" class="mail_view_area">{{{htmlContent}}}</div>
	</div>
</div>
<footer class="btn_layer_wrap">
	<a class="btn_major_s" href="javascript:window.print();"><span class="ic"></span><span class="txt"><tctl:msg key="menu.print"/></span></a>
	<a class="btn_minor_s" href="javascript:this.close();"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close" /></span></a>
</footer>
{{/with}}
</script>

<script id="mail_nested_read_tmpl" type="text/x-handlebars-template">
{{#with msgContent}}
<header>
	<h1><tctl:msg key="mail.popupview"/></h1>
	<a class="btn_layer_x" href="javascript:window.close();"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close" /></span></a>
</header>
<div class="content">
	<input type="hidden" id="folderName" name="folderName" value="{{../folderName}}"/>
	<input type="hidden" id="msgUid" name="uid" value="{{../uid}}"/>
	<input type="hidden" id="nestedPart" name="nestedPartTmp" id="nestedPartTmp" value="{{../nestedPart}}"/>
	<input type="hidden" id="orgPart" name="orgPart" id="orgPart" value="{{../orgPart}}"/>
	<div class="view_content mail_view">
		<div class="header">
			<h2>
				{{#equal subject ""}}
					<tctl:msg key="header.nosubject"/>
				{{else}}
					{{subject}}
				{{/equal}}
			</h2>
			<table class="list_report">
				<colgroup>
					<col width="85px" />
					<col width="" />
				</colgroup>
				<tbody>
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.from"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								<li>
									<span class="name">
										{{#if ../addressVisible}}
											{{from}}
										{{else}}
											{{fromPersonal}}
										{{/if}}
									</span>
								</li>
							</ul>
						</td>
					</tr>
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.to"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								{{#each toList}}
								<li>
									<span class="name">
										{{#empty personal}}
											{{address}}
										{{else}}
											{{#if ../../../addressVisible}}
												{{personal}}&lt;{{address}}&gt;
											{{else}}
												{{personal}}
											{{/if}}
										{{/empty}}
									</span>
								</li>
								{{/each}}
							</ul>
						</td>
					</tr>
					{{#if ccList}}
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.cc"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								{{#each ccList}}
								<li>
									<span class="name">
										{{#empty personal}}
											{{address}}
										{{else}}
											{{#if ../../../addressVisible}}
												{{personal}}&lt;{{address}}&gt;
											{{else}}
												{{personal}}
											{{/if}}
										{{/empty}}
									</span>
								</li>
								{{/each}}
							</ul>
						</td>
					</tr>
					{{/if}}
					{{#if bccList}}
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.bcc"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								{{#each bccList}}
								<li>
									<span class="name">
										{{#empty personal}}
											{{address}}
										{{else}}
											{{#if ../../../addressVisible}}
												{{personal}}&lt;{{address}}&gt;
											{{else}}
												{{personal}}
											{{/if}}
										{{/empty}}
									</span>
								</li>
								{{/each}}
							</ul>
						</td>
					</tr>
					{{/if}}
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.senddate"/></span>
						</th>
						<td>
							<span class="date">{{printReadDate dateUtc}}</span>
						</td>
					</tr>
					{{#if nationList}}
					<tr>
						<th><span class="title"><tctl:msg key="conf.profile.83" /></span></th>
						<td>
							<span class="wrap_nation">
							{{#each_with_index nationList}}
								{{#unless isFirst}}
								<span class="to">&gt;</span>
								{{/unless}}
								<span class="date" title="{{ip}}">
									<span class="ic_nation nation_{{code}}"></span>
									{{#printNationText code text}}{{/printNationText}}
								</span>
							{{/each_with_index}}
							</span>
						</td>
					</tr>
					{{/if}}
				</tbody>
			</table>
		</div>
		<!-- 첨부파일 -->
		<div class="add_file" style="display:">
			<div class="add_file_header">
				<span class="subject">
					<span class="ic ic_file_s"></span>
					{{#if attachList}}
					<strong><tctl:msg key="mail.attach"/></strong>
					<span class="num">{{../attachFileCount}}</span><tctl:msg key="mail.unit.count"/>
					{{else}}
					<strong><tctl:msg key="mail.noattach"/></strong>
					{{/if}}
				</span>
			</div>
			{{#if attachList}}
			<ul id="nested_file_wrap" class="file_wrap">
				{{#each attachList}}
				<li part="{{path}}" class="{{#equal size 0}}deleted{{/equal}}">
					<span class="item_file">
						<span class="ic_file ic_{{fileType}}"></span>
					{{#greateThen size 0}}
						<span class="name" evt-rol="nested-attach-download">{{fileName}}</span>
						<span class="size">({{fsize}})</span>
						<span class="optional">{{#equal fileType 'eml'}}<span class="btn_fn4" evt-rol="nested-message-read"><span class="txt"><tctl:msg key="menu.preview"/></span></span>{{/equal}}{{#if ../../../../useHtmlConverter}}{{#acceptConverter fileType}}<span class="btn_fn4 {{#if ignorePreview}}disable{{/if}}" {{#unless ignorePreview}}evt-rol="nested-preview-attach"{{/unless}}><span class="txt"><tctl:msg key="menu.preview"/></span></span>{{/acceptConverter}}{{/if}}{{#if ../../../../useWebfolder}}<span class="btn_fn4" evt-rol="nested-save-webfolder"><span class="txt"><tctl:msg key="mail.attach.webfolder.save"/></span></span>{{/if}}</span>
					{{else}}
						<span>{{fileName}} [<tctl:msg key="mail.deleteattach"/>]</span>
					{{/greateThen}}
					</span>
				</li>
				{{/each}}
			</ul>
			{{/if}}
		</div>
		{{#if ../hiddenImg}}
		<div class="noti_option">
			<p class="desc"><tctl:msg key="mail.noimage"/></p>
			<a evt-rol="read-view-img"><span class="btn_txt"><tctl:msg key="mail.viewimage"/></span></a>
		</div>
		{{/if}}
		<div class="mail_view_area">
			<div id="readContentMessageWrap">
				<textarea id="messageText" style="display:none;">{{htmlContent}}</textarea>
				<iframe frameborder='0' width='100%' height='300px' scrolling='no' src='${baseUrl}resources/js/plugins/mail/messageContent.html?rev=${revision}' id='messageContentFrame'></iframe>
			</div>
		</div>
	</div>
</div>
<footer class="btn_layer_wrap">
	<a class="btn_minor_s" href="javascript:this.close();"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close" /></span></a>
</footer>
{{/with}}
</script>

<script id="mail_dnd_tmpl" type="text/x-handlebars-template">
<div class="drag" style="width:auto; height:auto;">
	<span id="dragHelperIcon" class="ic_classic ic_disallow"></span>
	<span class="subject">{{message}}</span>
</div>
</script>

<script id="mail_list_date_tmpl" type="text/x-handlebars-template">
<tr id="dateDesc_{{term}}" class="dateDesc">
	<td class="title " colspan="{{#equal folderType 'all'}}8{{else}}7{{/equal}}">
		<span class="title_wrap title_type1">
		{{#notEmpty msg}}
		<span class="txt">{{msg}} </span>
		{{/notEmpty}}
		{{#lessThen term 7}}
		<span class="date">{{format}}</span>
		{{/lessThen}}
		</span>
	</td>
</tr>
</script>

<script id="mail_read_tag_tmpl" type="text/x-handlebars-template">
<span id="read_tag_{{messageId}}_{{tagInfo.id}}" class="txt_form" evt-rol="self-remove-message-tagging" data-tagid="{{tagInfo.id}}">
	<span class="ic_tag {{tagInfo.color}}"><span class="tail_r"><span></span></span></span>
	<span class="tool_tip"><tctl:msg key="comn.clear" /><i class="tail"></i></span>
</span>
</script>

<script id="secure_mail_tmpl" type="text/x-handlebars-template">
<div style="padding:0; max-width:600px; min-width:320px; margin:15px">
	<div style="background:#2EACB3; border:1px solid #1C99A0; color:#fff;  font:bold 16px/16px arial, gulim, dotum; text-align:left; padding:10px 12px"><tctl:msg key="mail.secure.title"/></div>
	<div style="border:1px solid #ddd; padding:20px">
		<img style="display:block; margin:0 auto; width:63px; margin-top:10px" src="images/ic_mail.gif">
		<h2 style="letter-spacing:-1px; text-align:center; margin-bottom:-5px"><tctl:msg key="mail.secure.content.001"/></h2>
		<p style="text-align:center; font-size:12px; color:#888; line-height:1.5"><tctl:msg key="mail.secure.content.002"/></p>
		<hr style="border:0; height:1px; background:#e3e3e3; margin:25px 0">
		<h3 style="font-size:14px; font-weight:bold">Q <tctl:msg key="mail.secure.content.003"/></h3>
		<p style="background:#E2F5F6; border:1px solid #C2DDE6; padding:10px; text-align:center; font-size:22px; font-weight:bold">1234</p>
	</div>
</div>
</script>



<script id="mail_move_folder_popup_tmpl" type="text/x-handlebars-template">
	<div class="list_wrap" id="selectMailFolderPopup">
	<section class="lnb">
		<h1 class="mail">
			<ins class="ic"></ins>
			<span class="txt" evt-rol="select-root"><tctl:msg key="mail.folder"/></span>
		</h1>
		<ul class="side_depth">
			<li class="mail_inbox default_folder" depth="0">
				<p id="folder_link_Inbox" class="title" evt-rol="folder" >
					<span id="inbox_toggle_popup_btn" evt-rol="toggle-mail-folder" style="display:none;" class="close" status="open" fid="defaultFolder0" title="<tctl:msg key="comn.close" />"></span>
					<a fname="Inbox"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.inbox"/></span></a>
					<span id="defaultFolder0_num"></span>
				</p>
				<ul id="inbox_folder_popup_area" depth="1"></ul>
			</li>
		<ul id="uf_folder_popup_area"></ul>
		</ul>
	</section>
	</div>
	<input type="hidden" id="preMailFolderName" name="preMailFolderName" value=""/>
	<input type="hidden" id="newMailFolderName" name="newMailFolderName" value=""/>
	<input type="hidden" id="isSettingPage" name="isSettingPage" value="false"/>
</script>

<script id="mail_user_folder_popup_tmpl" type="text/x-handlebars-template">
{{#each this}}
{{#user_folder_inbox_check this ../isInbox}}
{{#unless smartFolder}}
<li class="{{#if share}}mail_share{{else}}folder{{/if}}" depth="{{depth}}">
	<p id="folder_link_{{encName}}" class="title" evt-rol="folder">
		{{#if child}}{{makeTreeLink id}}{{/if}}
		<a fname="{{fullName}}"><ins class="ic"></ins><span class="txt">{{name}}</span></a>
	</p>
	{{#if child}}{{#applyTemplate "mail_user_subfolder_popup_tmpl" child}}{{/applyTemplate}}{{/if}}
</li>
{{/unless}}
{{/user_folder_inbox_check}}
{{/each}}
</script>

<script id="mail_user_subfolder_popup_tmpl" type="text/x-handlebars-template">
{{#each this}}
<ul style="{{#closeTreeLink parentId}}display:none{{/closeTreeLink}}" depth="{{depth}}">
	<li class="{{#if share}}mail_share{{else}}folder{{/if}}" depth="{{depth}}">
		<p id="folder_link_{{encName}}" class="title" evt-rol="folder">
			{{#if child}}{{makeTreeLink id}}{{/if}}
			<a fname="{{fullName}}"><ins class="ic"></ins><span class="txt">{{name}}</span></a>
		</p>
		{{#if child}}{{#applyTemplate "mail_user_subfolder_popup_tmpl" child}}{{/applyTemplate}}{{/if}}
	</li>
</ul>
{{/each}}
</script>


<script id="mail_more_folder_popup_tmpl" type="text/x-handlebars-template">
	<div class="list_wrap" id="selectMoreMailFolderPopup">
	<section class="lnb">
		<h1 class="mail">
			<ins class="ic"></ins>
			<span class="txt" evt-rol="select-root"><tctl:msg key="mail.folder"/></span>
		</h1>
		<ul class="side_depth">
			<li class="mail_inbox default_folder" depth="0">
				<p id="folder_link_Inbox" class="title">
					<span id="inbox_toggle_more_btn" evt-rol="toggle-mail-folder" style="display:none;" class="close" status="open" fid="defaultFolder0" title="<tctl:msg key="comn.close" />"></span>
					<a evt-rol="folder" fname="Inbox" title="<tctl:msg key="folder.inbox"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.inbox"/></span></a>
					<span id="defaultFolder0_more_num"></span>
					<span fname="Inbox" data-depth="0" evt-rol="mail-folder-option" class="btn_wrap"><span title="<tctl:msg key="mail.foldermgnt"/>" class="ic_side ic_more_option"></span></span>
				</p>
				<ul id="inbox_folder_popup_area" depth="1"></ul>
			</li>
			<li class="mail_sent default_folder">
				<p id="folder_link_Sent" class="title">
					<a evt-rol="folder" fname="Sent" title="<tctl:msg key="folder.sent"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.sent"/></span></a>
					<span id="defaultFolder1_more_num"></span>

					<c:if test="${notiMode ne 'mail'}">
						<span class="btn_wrap"><span class="btn_side3" evt-rol="receive-noti-list"><tctl:msg key="menu.receivenoti"/></span></span>
					</c:if>

				</p>
			</li>
			<li class="mail_draft default_folder">
				<p id="folder_link_Drafts" class="title">
					<a evt-rol="folder" fname="Drafts" title="<tctl:msg key="folder.drafts"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.drafts"/></span></a>
					<span id="defaultFolder2_more_num"></span>
				</p>
			</li>
			<li class="mail_reserved default_folder">
				<p id="folder_link_Reserved" class="title">
					<a evt-rol="folder" fname="Reserved" title="<tctl:msg key="folder.reserved"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.reserved"/></span></a>
					<span id="defaultFolder3_more_num"></span>
				</p>
			</li>

			<c:if test="${useSpamFolder}">
			<li class="mail_spam default_folder">
				<p class="title">
					<a evt-rol="folder" fname="Spam" title="<tctl:msg key="folder.spam"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.spam"/></span></a>
					<span id="defaultFolder4_more_num"></span>
					<span class="btn_wrap" evt-rol="empty-spam-folder"><span class="btn_side3"><tctl:msg key="menu.empty"/></span></span>
				</p>
			</li>
			</c:if>

			<c:if test="${useTMWFolder}">
			<li class="mail_spam default_folder">
				<p id="folder_link_Spam" class="title">
					<a evt-rol="tmw-folder" title="<tctl:msg key="folder.spam"/>"><ins class="ic"></ins><span class="txt">${tmwFolderName}</span></a>
				</p>
			</li>
			</c:if>

			<li class="trash default_folder">
				<p id="folder_link_Trash" class="title">
					<a evt-rol="folder" fname="Trash" title="<tctl:msg key="folder.trash"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.trash"/></span></a>
					<span id="defaultFolder5_more_num"></span>
					<span class="btn_wrap" evt-rol="empty-trash-folder"><span class="btn_side3"><tctl:msg key="menu.empty"/></span></span>
				</p>
			</li>
			<li id="more_df_quotaviolate" style="display:none;" class="mail_inbox_full">
				<p id="folder_link_Quotaviolate" class="title">
					<a evt-rol="folder" fname="Quotaviolate" title="<tctl:msg key="folder.quotaviolate"/>"><ins class="ic"></ins><span class="txt"><tctl:msg key="folder.quotaviolate"/></span></a>
					<span id="defaultFolder6_num"></span>
				</p>
			</li>
			<ul id="uf_more_folder_popup_area"></ul>
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
	</section>
	</div>
</script>

<script id="mail_more_user_folder_tmpl" type="text/x-handlebars-template">
{{#each this}}
{{#user_folder_inbox_check this ../isInbox}}
{{#unless smartFolder}}
<li class="{{#if share}}mail_share{{else}}folder{{/if}}" depth="{{depth}}">
	<p id="folder_link_{{encName}}" class="title">
		{{#if child}}{{makeTreeLink id}}{{/if}}
		<a evt-rol="folder" fname="{{fullName}}" title="{{name}}"><ins class="ic"></ins><span class="txt">{{name}}</span></a>
		<span id="{{id}}_num">
		{{#greateThen unseenCnt 0}}
			<a evt-rol="unseen-folder" fname="{{fullName}}" style="vertical-align:top;"><span class="num">{{unseenCnt}}</span></a>
		{{/greateThen}}
		</span>
		<span class="btn_wrap" evt-rol="mail-folder-option" data-depth="{{depth}}" fname="{{fullName}}" data-share="{{#if share}}on{{/if}}" data-shareseq="{{sharedUid}}"><span class="ic_side ic_more_option" title="<tctl:msg key="mail.foldermgnt"/>"></span></span>
	</p>
	{{#if child}}{{#applyTemplate "mail_more_user_subfolder_tmpl" child}}{{/applyTemplate}}{{/if}}
</li>
{{/unless}}
{{/user_folder_inbox_check}}
{{/each}}
</script>

<script id="mail_more_user_subfolder_tmpl" type="text/x-handlebars-template">
{{#each this}}
<ul style="{{#closeTreeLink parentId}}display:none{{/closeTreeLink}}" depth="{{depth}}">
	<li class="{{#if share}}mail_share{{else}}folder{{/if}}" depth="{{depth}}">
		<p id="folder_link_{{encName}}" class="title">
			{{#if child}}{{makeTreeLink id}}{{/if}}
			<a evt-rol="folder" fname="{{fullName}}" title="{{name}}"><ins class="ic"></ins><span class="txt">{{name}}</span></a>
			<span id="{{id}}_num">
			{{#greateThen unseenCnt 0}}
				<a evt-rol="unseen-folder" fname="{{fullName}}" style="vertical-align:top;"><span class="num">{{unseenCnt}}</span></a>
			{{/greateThen}}
			</span>
			<span class="btn_wrap" evt-rol="mail-folder-option" data-depth="{{depth}}" fname="{{fullName}}" data-share="{{#if share}}on{{/if}}" data-shareseq="{{sharedUid}}"><span class="ic_side ic_more_option"></span></span>
		</p>
		{{#if child}}{{#applyTemplate "mail_more_user_subfolder_tmpl" child}}{{/applyTemplate}}{{/if}}
	</li>
</ul>
{{/each}}
</script>


<script id="mail_preview_print_tmpl" type="text/x-handlebars-template">

<header>
	<h1>
		<tctl:msg key="mail.print.preview"/>
		<span class="btn_wrap" onclick="javascript:window.print();" title="<tctl:msg key="mail.print.action"/>">
			<span class="btn_minor_s">
				<span class="ic_print"></span><span class="txt"><tctl:msg key="menu.print"/></span>
			</span>
		</span>
	</h1>
	<a class="btn_layer_x" href="javascript:this.close();"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close" /></span></a>
</header>
<div class="content">
	<div class="view_content mail_view">
		<div class="header">
			<h2>
				{{#equal subject ""}}
					<tctl:msg key="header.nosubject"/>
				{{else}}
					{{subject}}
				{{/equal}}
			</h2>
			<table class="list_report">
				<colgroup>
					<col width="85px" />
					<col width="" />
				</colgroup>
				<tbody>
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.from"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								<li><span class="name" title="{{printEmailAddress from}}">{{printEmailAddress from}}</span></li>
							</ul>
						</td>
					</tr>
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.to"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								{{#each toList}}
								<li>
									<span class="name" title="{{makeEmailAddress personal address}}">
										{{#empty personal}}
											{{address}}
										{{else}}
											{{personal}}&lt;{{address}}&gt;
										{{/empty}}
									</span>
								</li>
								{{/each}}
							</ul>
						</td>
					</tr>
					{{#if ccList}}
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.cc"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								{{#each ccList}}
								<li>
									<span class="name" title="{{makeEmailAddress personal address}}">
										{{#empty personal}}
											{{address}}
										{{else}}
											{{personal}}&lt;{{address}}&gt;
										{{/empty}}
									</span>
								</li>
								{{/each}}
							</ul>
						</td>
					</tr>
					{{/if}}
					{{#if bccList}}
					<tr>
						<th class="default_info">
							<span class="title"><tctl:msg key="mail.bcc"/></span>
						</th>
						<td>
							<ul class="name_tag name_tag_s">
								{{#each bccList}}
								<li>
									<span class="name" title="{{makeEmailAddress personal address}}">
										{{#empty personal}}
											{{address}}
										{{else}}
											{{personal}}&lt;{{address}}&gt;
										{{/empty}}
									</span>
								</li>
								{{/each}}
							</ul>
						</td>
					</tr>
					{{/if}}
				</tbody>
			</table>
		</div>
		<!-- 첨부파일 -->
		<div class="add_file" style="display:">
			<div class="add_file_header">
				<span class="subject">
					<span class="ic ic_file_s"></span>
					{{#if attachList}}
					<strong><tctl:msg key="mail.attach"/></strong>
					<span class="num">{{attachList.length}}</span><tctl:msg key="mail.unit.count"/>
					{{else}}
					<strong><tctl:msg key="mail.noattach"/></strong>
					{{/if}}
					</span>
			</div>
			{{#if attachList}}
			<ul class="file_wrap">
				{{#each attachList}}
				<li>
					<span class="item_file">
						<span class="ic_file ic_{{fileType}}"></span>
						<span class="name">{{fileName}}</span>
						<span class="size">({{fsize}})</span>
					</span>
				</li>
				{{/each}}
			</ul>
			{{/if}}
		</div>
		<div id="mailViewArea" class="mail_view_area">{{{htmlContent}}}</div>
	</div>
</div>

<footer class="btn_layer_wrap">
	<a class="btn_major_s" href="javascript:window.print();"><span class="ic"></span><span class="txt"><tctl:msg key="menu.print"/></span></a>
	<a class="btn_minor_s" href="javascript:this.close();"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close" /></span></a>
</footer>

</script>

<script id="mail_icalendar_tmpl" type="text/x-handlebars-template">
{{#each this}}
<div style="padding:0; margin:15px;">
	<table cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse">
		<thead>
			<tr>
				<th style="width:60px; height:60px; background:#e9f5f6; border-top:1px solid #ccc; border-left: 1px solid #ccc; color:#333; border-bottom: 2px solid #2EACB3; font:bold 16px/16px arial, gulim, dotum; text-align:left; padding:15px 0; white-space:nowrap">
					<table align="center" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; border:1px solid #e9f5f6; padding:10px 20px; text-align:center">
						<tr><td style="padding:3px; text-align:center;font-size:12px; font-family:arial,dotum; background:#e9f5f6">{{printFullMonth icalStartTime}}</td></tr>
						<tr><td style="padding:3px; text-align:center;font-size:26px; font-family:arial,dotum; background:#e9f5f6">{{printSingleDayOfMonth icalStartTime}}</td></tr>
						<tr><td style="padding:3px; text-align:center;font-size:12px; font-family:arial,dotum; background:#e9f5f6">({{printDayOfWeek icalStartTime}})</td></tr>
					</table>

				</th>
				<th style="background:#fff; border-top:1px solid #ccc; border-right: 1px solid #ccc; color:#333; border-bottom: 2px solid #2EACB3; font:bold 16px/16px arial, gulim, dotum; text-align:left; padding:14px 20px">{{printThis icalSubject}}</th></tr>
		</thead>
		<tbody>
			<tr>
				<td width="55px" style="padding:20px 0 6px 20px; border-left:1px solid #ccc; font:bold 13px/1.4 gulim; color:#888; text-align:left; vertical-align:top; border-bottom: 1px dotted #ccc"><tctl:msg key="mail.subject"/></td>
				<td style="padding:20px 10px 6px 10px; border-right:1px solid #ccc; font: 13px/1.4 dotum; color:#555; margin:0; vertical-align:top; border-bottom: 1px dotted #ccc">{{printThis icalSubject}}</td>
			</tr>
			<tr>
				<td style="padding:6px 0 6px 20px; border-left:1px solid #ccc; font:bold 13px/1.4 gulim; color:#888; text-align:left; vertical-align:top; border-bottom: 1px dotted #ccc"><tctl:msg key="mail.registe.date"/></td>
				{{#empty icalRecurrenceMsg}}
				<td style="padding:6px 10px; border-right:1px solid #ccc; font: 13px/1.4 dotum; color:#555; margin:0; vertical-align:top; border-bottom: 1px dotted #ccc">{{#if icalIsAlldayType}}{{printFullDate icalStartDate}}{{else}}{{printFullDateTime icalStartTime}} ~ {{printFullDateTime icalEndTime}}{{/if}}</td>
				{{/empty}}
				{{#notEmpty icalRecurrenceMsg}}
				<td style="padding:6px 10px; border-right:1px solid #ccc; font: 13px/1.4 dotum; color:#555; margin:0; vertical-align:top; border-bottom: 1px dotted #ccc">{{printThis icalRecurrenceMsg}}{{#if icalIsAlldayType}}{{printFullDate icalStartDate}}{{else}}, {{printOnlyTime icalRecurStartTime}} ~ {{printOnlyTime icalRecurEndTime}}{{/if}}</td>
				{{/notEmpty}}
			</tr>
			<tr>
				<td style="padding:6px 0 6px 20px; border-left:1px solid #ccc; font:bold 13px/1.4 gulim; color:#888; text-align:left; vertical-align:top; border-bottom: 1px dotted #ccc"><tctl:msg key="mail.calendar.location"/></td>
				<td style="padding:6px 10px; border-right:1px solid #ccc; font: 13px/1.4 dotum; color:#555; margin:0; vertical-align:top; border-bottom: 1px dotted #ccc">{{printThis icalLocation}}</td>
			</tr>
			<tr>
				<td style="padding:6px 0 6px 20px; border-left:1px solid #ccc; font:bold 13px/1.4 gulim; color:#888; text-align:left; vertical-align:top; border-bottom: 1px solid #ccc"><tctl:msg key="mail.calendar.attendee"/></td>
				<td style="padding:6px 10px; border-right:1px solid #ccc; font: 13px/1.4 dotum; color:#555; margin:0; vertical-align:top; border-bottom: 1px solid #ccc">{{printThis icalAttendee}}</td>
			</tr>
			{{#notEmpty icalDescription}}
			<tr>
				<td style="padding:6px 0 6px 20px; border-left:1px solid #ccc; font:bold 13px/1.4 gulim; color:#888; text-align:left; vertical-align:top; border-bottom: 1px solid #ccc"><tctl:msg key="mail.calendar.description"/></td>
				<td style="padding:6px 10px; border-right:1px solid #ccc; font: 13px/1.4 dotum; color:#555; margin:0; vertical-align:top; border-bottom: 1px solid #ccc">{{{icalDescription}}}</td>
			</tr>
			{{/notEmpty}}
		</tbody>
	</table>
</div>
{{/each}}
</script>
<script id="mail_ndr_guide_tmpl" type="text/x-handlebars-template">
	<div class="tit"><tctl:msg key="mail.ndr.guide"/></div>
	<div class="disc">
		<tctl:msg key="mail.ndr.guide.content"/>
	</div>
	<a href="#" class="btn_ndr" evt-rol="view-ndr-guide"><tctl:msg key="mail.ndr.guide.button"/></a>
</script>

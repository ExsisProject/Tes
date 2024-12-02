<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<script id="mail_tag_add_tmpl" type="text/x-handlebars-template">
<div class="vertical_wrap_s">
	<p class="desc">
		{{#equal type 'modify'}}
			<tctl:msg key="mail.tag.modify.msg"/>
		{{else}}
			<tctl:msg key="mail.tag.add.msg"/>
		{{/equal}}
	</p>
	<input id="tag_name_input" class="txt_mini w_max" type="text" value="{{name}}"/>
	<input id="tag_id_hidden" type="hidden" value="{{id}}"/>
</div>
<hr />
<div class="vertical_wrap_s">
	<p class="desc">
		{{#equal type 'modify'}}
			<tctl:msg key="mail.tag.modify.color.msg"/>
		{{else}}
			<tctl:msg key="mail.tag.add.color.msg"/>
		{{/equal}}
	</p>			
	<div class="layer_pallete pallete_wrap">
		<a class="bgcolor1 {{#equal color 'bgcolor1'}}active{{/equal}}" color="bgcolor1">bgcolor1</a>
		<a class="bgcolor2 {{#equal color 'bgcolor2'}}active{{/equal}}" color="bgcolor2">bgcolor2</a>
		<a class="bgcolor3 {{#equal color 'bgcolor3'}}active{{/equal}}" color="bgcolor3">bgcolor3</a>
		<a class="bgcolor4 {{#equal color 'bgcolor4'}}active{{/equal}}" color="bgcolor4">bgcolor4</a>
		<a class="bgcolor5 {{#equal color 'bgcolor5'}}active{{/equal}}" color="bgcolor5">bgcolor5</a>
		<a class="bgcolor6 {{#equal color 'bgcolor6'}}active{{/equal}}" color="bgcolor6">bgcolor6</a>
		<a class="bgcolor7 {{#equal color 'bgcolor7'}}active{{/equal}}" color="bgcolor7">bgcolor7</a>
		<a class="bgcolor8 {{#equal color 'bgcolor8'}}active{{/equal}}" color="bgcolor8">bgcolor8</a>
		<a class="bgcolor9 {{#equal color 'bgcolor9'}}active{{/equal}} last" color="bgcolor9">bgcolor9</a>
		<br />
		<a class="bgcolor10 {{#equal color 'bgcolor10'}}active{{/equal}}{{#unless color}}active{{/unless}}" color="bgcolor10">bgcolor10</a>
		<a class="bgcolor11 {{#equal color 'bgcolor11'}}active{{/equal}}" color="bgcolor11">bgcolor11</a>
		<a class="bgcolor12 {{#equal color 'bgcolor12'}}active{{/equal}}" color="bgcolor12">bgcolor12</a>
		<a class="bgcolor13 {{#equal color 'bgcolor13'}}active{{/equal}}" color="bgcolor13">bgcolor13</a>
		<a class="bgcolor14 {{#equal color 'bgcolor14'}}active{{/equal}}" color="bgcolor14">bgcolor14</a>
		<a class="bgcolor15 {{#equal color 'bgcolor15'}}active{{/equal}}" color="bgcolor15">bgcolor15</a>
		<a class="bgcolor16 {{#equal color 'bgcolor16'}}active{{/equal}}" color="bgcolor16">bgcolor16</a>
		<a class="bgcolor17 {{#equal color 'bgcolor17'}}active{{/equal}}" color="bgcolor17">bgcolor17</a>
		<a class="bgcolor18 {{#equal color 'bgcolor18'}}active{{/equal}} last" color="bgcolor18">bgcolor18</a>
	</div>				
</div>
</script>
<script id="mail_tag_toolbar_tmpl" type="text/x-handlebars-template">
{{#each this}}
<li data-tid="{{id}}" evt-rol="add-message-tagging">
	<span class="ic_tag {{color}}"><span class="tail_r"><span></span></span></span>
	<span class="tag_name" title="{{name}}">{{name}}</span>
	<span class="btn_layer_wrap"> 
		<span class="btn_fn7"><span title="<tctl:msg key="comn.setting" />" class="ic ic_check"></span><span class="txt"><tctl:msg key="comn.setting" /></span></span>{{#if containsTag}}<span class="btn_fn7" evt-rol="remove-message-tagging"><span title="<tctl:msg key="comn.clear" />" class="ic_classic ic_del"></span><span class="txt"><tctl:msg key="comn.clear" /></span></span>{{/if}}
	</span>
</li>
{{/each}}
</script>
<script id="mail_detail_search_tmpl" type="text/x-handlebars-template">
<div class="detail_search_wrap layer_normal mail_search_wrap" data-layer style="right:-3px;top:15px;">
	<div class="detail_search">
		<header>
			<h1><tctl:msg key="mail.adsearch"/></h1>
			<a class="btn_layer_x" evt-rol="close-search-folder"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close" /></span></a>
		</header>
		<span class="layer_tail_top"><i></i></span>
		<div class="content">
		<form>
			<fieldset>
				<table class="form_type form_mail002">
					<tbody>
					<tr>
						<th class="label"><span class="title"><tctl:msg key="mail.sfolder.cond"/></span></th>
						<td class="form">
							<div class="array">
								<span class="title"><tctl:msg key="mail.sfolder.saved.cond"/><ins class="ic_bul2"></ins></span>
								<ul id="detail_search_cond_area" class="array_type array_condition">
									{{#if queryList}}
										{{#each queryList}}
											<li uid="{{id}}" query="{{query}}">
												<span evt-rol="select-saved-search">{{name}}</span>
												<span class="btn_wrap"><span class="ic_classic ic_del" title="<tctl:msg key="comn.del" />" evt-rol="delete-saved-search"></span></span>
											</li>
										{{/each}}
									{{else}}
										<li><span><tctl:msg key="mail.sfolder.empty.cond"/></span></li>
									{{/if}}
								</ul>
								
							</div>								
						</td>
					</tr>
					<tr>
						<th class="label"><span class="title"><tctl:msg key="mail.folder"/></span></th>
						<td class="form">
							<select id="adFolderName" class="w_max" evt-rol="select-search-folder">
								<option value="all"><tctl:msg key="folder.all"/></option>
								<option value="Inbox"><tctl:msg key="folder.inbox"/></option>
								<option value="Sent"><tctl:msg key="folder.sent"/></option>
								<option value="Spam"><tctl:msg key="folder.spam"/></option>
								<option value="Trash"><tctl:msg key="folder.trash"/></option>
								{{#applyTemplate "mail_folder_selectbox_tmpl" folderList}}{{/applyTemplate}}
							</select>
							{{#notEqual searchAllFolder 'on'}}
							<div class="vertical_wrap">
								<span id="searchIncludeExtFolderWrap" class="option_wrap">
									<input id="searchIncludeExtFolder" type="checkbox" name="" /><label for="searchIncludeExtFolder"><tctl:msg key="conf.profile.search.folder" /></label>
								</span>
							</div>
							{{/notEqual}}
						</td>
					</tr>
					<tr>
						<th class="label"><span class="title"><tctl:msg key="mail.from"/></span></th>
						<td class="form"><input id="adFrom" class="txt_mini w_max" type="text" /></td>
					</tr>					
					<tr>
						<th class="label"><span class="title"><tctl:msg key="mail.to"/></span></th>
						<td class="form"><input id="adTo" class="txt_mini w_max" type="text" /></td>
					</tr>
					<tr>
						<th class="label"><span class="title"><tctl:msg key="mail.sfolder.include.term"/></span></th>
						<td class="form">
							<div id="adSearchCondWrap" class="vertical_wrap">
								<span class="option_wrap"><input id="adSubjectCheck" type="checkbox" name="adSearchCond" value="s" checked="checked"/><label for="adSubjectCheck"><tctl:msg key="mail.subject"/></label></span>
								<span class="option_wrap"><input id="adContentCheck" type="checkbox" name="adSearchCond" value="b"/><label for="adContentCheck"><tctl:msg key="search.body"/></label></span>
								<span class="option_wrap"><input id="adAttachNameCheck" type="checkbox" name="adSearchCond" value="af"/><label for="adAttachNameCheck"><tctl:msg key="search.attname"/></label></span>
								<span id="adAttachContentSearch" class="option_wrap" style="display:none;"><input id="adAttachContentCheck" type="checkbox" name="adSearchCond" value="ab"/><label for="adAttachContentCheck"><tctl:msg key="search.attcontent"/></label></span>
							</div>
							<input id="adSearchKeyWord" class="txt_mini w_max" type="text" />
						</td>
					</tr>
					<tr>
						<th class="label"><span class="title"><tctl:msg key="mail.search.period"/></span></th>
						<td class="form">
							<div class="select_direct">
								<span class="noti_date_wrap option_wrap">
									<label>
									<input id="adStartDate" class="txt_mini wfix_small" type="text" readonly="readonly">
									<span class="ic ic_calendar"></span>
									</label>
								</span>
								~
								<span class="noti_date_wrap option_wrap">
									<label>
									<input id="adEndDate" class="txt_mini wfix_small" type="text" readonly="readonly">
									<span class="ic ic_calendar"></span>
									</label>
								</span>
							</div>
						</td>
					</tr>
					<tr>
						<th class="label"><span class="title"><tctl:msg key="mail.sfolder.addcond"/></span></th>
						<td id="addSearchFlagWrap" class="form">
							<div class="vertical_wrap">
								<span class="option_wrap"><input id="notSelectFlagRadio" type="radio" name="addSearchFlag" checked="checked" value=""/><label for="notSelectFlagRadio"><tctl:msg key="folder.aging.noaging"/></label></span>
								<span class="option_wrap"><input id="attachFlagRadio" type="radio" name="addSearchFlag" value="T"/><label for="attachFlagRadio"><tctl:msg key="menu.quick.attach"/></label></span>
								<span class="option_wrap"><input id="seenFlagRadio" type="radio" name="addSearchFlag" value="S"/><label for="seenFlagRadio"><tctl:msg key="menu.quick.read"/></label></span>
								<span class="option_wrap"><input id="unseenFlagRadio" type="radio" name="addSearchFlag" value="U"/><label for="unseenFlagRadio"><tctl:msg key="menu.quick.unread"/></label></span>
							</div>
							<div class="vertical_wrap">
								<span class="option_wrap"><input id="replyFlagRadio" type="radio" name="addSearchFlag" value="A"/><label for="replyFlagRadio"><tctl:msg key="menu.quick.reply"/></label></span>
								<span class="option_wrap"><input id="myselfFlagRadio" type="radio" name="addSearchFlag" value="L"/><label for="myselfFlagRadio"><tctl:msg key="menu.quick.myself"/></label></span>
								<span class="option_wrap"><input id="importFlagRadio" type="radio" name="addSearchFlag" value="F"/><label for="importFlagRadio"><tctl:msg key="menu.quick.flag"/></label></span>
							</div>
						</td>
					</tr>
					</tbody>
				</table>					
			</fieldset>
		</form>					
		</div>
		<footer class="btn_layer_wrap">
			<span class="btn_major_s" data-role="button" evt-rol="detail-mail-search">
				<span class="icon"></span>
				<span class="txt"><tctl:msg key="mail.search"/></span>
			</span>
			<span class="btn_minor_s" data-role="button" evt-rol="save-search-folder">
				<span class="icon"></span>
				<span class="txt"><tctl:msg key="mail.sfolder.save"/></span>
			</span>
			<span class="btn_minor_s" data-role="button" evt-rol="close-search-folder">
				<span class="icon"></span>
				<span class="txt"><tctl:msg key="comn.cancel" /></span>
			</span>	
		</footer>
	</div>
</div>
</script>

<script id="mail_unified_detail_search_tmpl" type="text/x-handlebars-template">
<div class="detail_search_wrap layer_normal mail_search_wrap" style="right:-3px;top:15px;">
	<div class="detail_search">
		<header>
			<h1><tctl:msg key="mail.adsearch"/></h1>
			<a class="btn_layer_x" evt-rol="close-unified-search-folder"><span class="ic"></span><span class="txt"><tctl:msg key="comn.close" /></span></a>
		</header>
		<span class="layer_tail_top"><i></i></span>
		<div class="content">
		<form>
			<fieldset>
				<table class="form_type form_mail002">
					<tbody>
					<tr>
						<th class="label"><span class="title"><tctl:msg key="mail.sword"/></span></th>
						<td class="form">
							<input id="keyword" class="txt_mini w_max" type="text" />
							<div class="vertical_wrap" style="display:none;">
								<span id="searchAttachContentsWrap" class="option_wrap">
									<input id="searchAttachContents" type="checkbox" name="" /><label for="searchAttachContents"><tctl:msg key="mail.search.attach.contents"/></label>
								</span>
							</div>
						</td>
					</tr>
					<tr>
						<th class="label"><span class="title"><tctl:msg key="mail.search.period"/></span></th>
						<td id="addSearchFlagWrap" class="form">
							<div class="vertical_wrap">
								<span class="option_wrap"><input id="radioAll" type="radio" name="searchPeriod" checked="checked" value="" evt-rol="search-period"/><label for="notSelectFlagRadio"><tctl:msg key="mail.search.all"/></label></span>
								<span class="option_wrap"><input id="radio1Week" type="radio" name="searchPeriod" value="-1" evt-rol="search-period"/><label for="attachFlagRadio"><tctl:msg key="mail.search.1week"/></label></span>
								<span class="option_wrap"><input id="radio2Week" type="radio" name="searchPeriod" value="-2" evt-rol="search-period"/><label for="seenFlagRadio"><tctl:msg key="mail.search.2weeks"/></label></span>
								<span class="option_wrap"><input id="radio1Month" type="radio" name="searchPeriod" value="month" evt-rol="search-period"/><label for="unseenFlagRadio"><tctl:msg key="mail.search.1month"/></label></span>
							</div>
							<div class="select_direct">
								<span class="option_wrap"><input id="radioDirectly" type="radio" name="searchPeriod" value="directly" evt-rol="search-directly"/><label for="unseenFlagRadio"><tctl:msg key="mail.search.self"/></label></span>
								<span class="noti_date_wrap option_wrap">
									<label>
									<input id="fromDate" class="txt_mini wfix_small" type="text" readonly="readonly" disabled="disabled">
									<span class="ic ic_calendar"></span>
									</label>
								</span>
								~
								<span class="noti_date_wrap option_wrap">
									<label>
									<input id="toDate" class="txt_mini wfix_small" type="text" readonly="readonly" disabled="disabled">
									<span class="ic ic_calendar"></span>
									</label>
								</span>
							</div>
						</td>
					</tr>
					</tbody>
				</table>					
			</fieldset>
		</form>					
		</div>
		<footer class="btn_layer_wrap">
			<span class="btn_major_s" data-role="button" evt-rol="detail-unified-search">
				<span class="icon"></span>
				<span class="txt"><tctl:msg key="mail.search"/></span>
			</span>
			<span class="btn_minor_s" data-role="button" evt-rol="close-unified-search-folder">
				<span class="icon"></span>
				<span class="txt"><tctl:msg key="comn.cancel" /></span>
			</span>	
		</footer>
	</div>
</div>
</script>

<script id="mail_detail_search_save_cond_name_tmpl" type="text/x-handlebars-template">
<p class="desc"><tctl:msg key="mail.sfolder.save.msg"/></p>
<input id="adSearchMessageCondName" class="txt_mini w_max" type="text" />
</script>

<script id="mail_add_folder_tmpl" type="text/x-handlebars-template">
<div class="vertical_wrap_s">
	<p class="desc"><tctl:msg key="mail.folder.add.msg"/></p>
	<input id="newMailFolderName" class="txt_mini w_max" type="text" />
</div>
<div class="vertical_wrap_s">
	<span class="wrap_option line16">
		<input id="newParentSelectCheck" type="checkbox" evt-rol="add-folder-select-parent"/>
		<label for="newParentSelectCheck"><tctl:msg key="mail.folder.parent.select"/>:</label>
	</span>
	<select id="addFolderParentSelect" class="w_max inactive" disabled="true">
		<option value="Inbox"><tctl:msg key="folder.inbox"/></option>
		{{#applyTemplate "mail_folder_add_selectbox_tmpl" this}}{{/applyTemplate}}
	</select>
</div>		
</script>

<script id="mail_folder_selectbox_tmpl" type="text/x-handlebars-template">
	{{#each this}}
		{{#startWidth fullName 'Inbox'}}
			<option value="{{fullName}}">{{replaceInboxChild fullName}}</option>
			{{#if child}}{{#applyTemplate "mail_folder_child_selectbox_tmpl" child}}{{/applyTemplate}}{{/if}}
		{{/startWidth}}
	{{/each}}
	{{#each this}}
		{{#notStartWidth fullName 'Inbox'}}
			{{#if smartFolder}}
				<option value="{{fullName}}">{{name}}</option>
			{{else}}
				<option value="{{fullName}}">{{fullName}}</option>
			{{/if}}
			{{#if child}}{{#applyTemplate "mail_folder_child_selectbox_tmpl" child}}{{/applyTemplate}}{{/if}}
		{{/notStartWidth}}
	{{/each}}
</script>

<script id="mail_folder_child_selectbox_tmpl" type="text/x-handlebars-template">
{{#each this}}	
	<option value="{{fullName}}">
		{{#startWidth fullName 'Inbox'}}
			{{replaceInboxChild fullName}}
		{{else}}
			{{replaceAll fullName '.' ' > '}}
		{{/startWidth}}
	</option>
	{{#if child}}{{#applyTemplate "mail_folder_child_selectbox_tmpl" child}}{{/applyTemplate}}{{/if}}
{{/each}}
</script>

<script id="mail_folder_add_selectbox_tmpl" type="text/x-handlebars-template">
	{{#each this}}
		{{#startWidth fullName 'Inbox'}}
			<option value="{{fullName}}" title="{{replaceAll fullName '.' ' > '}}">{{replaceInboxChild fullName}}</option>
			{{#if child}}{{#applyTemplate "mail_folder_add_child_selectbox_tmpl" child}}{{/applyTemplate}}{{/if}}
		{{/startWidth}}
	{{/each}}
	{{#each this}}
		{{#notStartWidth fullName 'Inbox'}}
			{{#unless smartFolder}}
				<option value="{{fullName}}" title="{{fullName}}">{{fullName}}</option>
			{{/unless}}
			{{#if child}}{{#applyTemplate "mail_folder_add_child_selectbox_tmpl" child}}{{/applyTemplate}}{{/if}}
		{{/notStartWidth}}
	{{/each}}
</script>

<script id="mail_folder_add_child_selectbox_tmpl" type="text/x-handlebars-template">
{{#each this}}
	<option value="{{fullName}}" title="{{replaceAll fullName '.' ' > '}}">
		{{#startWidth fullName 'Inbox'}}
			{{replaceInboxChild fullName}}
		{{else}}
			{{replaceAll fullName '.' ' > '}}
		{{/startWidth}}
	</option>
	{{#if child}}{{#applyTemplate "mail_folder_add_child_selectbox_tmpl" child}}{{/applyTemplate}}{{/if}}
{{/each}}
</script>

<script id="mail_modify_folder_tmpl" type="text/x-handlebars-template">
<div class="vertical_wrap_s">
	<p class="desc"><tctl:msg key="mail.folder.modify.msg"/></p>
	<input id="modifyMailFolderName" class="txt_mini w_max" type="text" value="{{displayFolderName folderName}}" folder="{{folderName}}" data-folder-name="{{displayFolderName folderName}}"/>
</div>
</script>

<script id="mail_add_subfolder_tmpl" type="text/x-handlebars-template">
<div class="vertical_wrap_s">
	<p class="desc"><tctl:msg key="mail.folder.add.child.msg"/></p>
	<input id="subMailFolderName" class="txt_mini w_max" type="text" folder="{{folderName}}"/>
</div>
</script>

<script id="mail_letter_layer_tmpl" type="text/x-handlebars-template">
<div id="mailLetterLayerWrap" class="layer_normal layer_select_paper layer_inside" style="position:absolute;left:-285px;top:20px;">
	<header>
		<h1><tctl:msg key="mail.letterpaper"/></h1>
		<a class="btn_layer_x" evt-rol="letter-layer-close"><span class="ic"></span></a>
	</header>
	<div class="content">
		<ul class="select_img">
			{{#each_with_index list}}
			<li id="letter_{{letterSeq}}" class="{{#calcMod index 3}}last{{/calcMod}}" data-letterseq="{{letterSeq}}" data-header="{{header}}" data-body="{{body}}" data-tail="{{tail}}">
				<span class="paper">
					<img src="{{thumbnail}}" width="74px" height="86px"/>
				</span>
			</li>
			{{/each_with_index}}
		</ul>
		{{#applyTemplate "mail_layer_navi_tmpl" this}}{{/applyTemplate}}			
	</div>
	<footer class="btn_layer_wrap">
		<span class="btn_major_s" data-role="button" evt-rol="apply-letter">				
			<span class="txt"><tctl:msg key="comn.confirm" /></span>
		</span>
		{{#equal letterMode 'on'}}
		<span class="btn_caution_s" data-role="button" evt-rol="cancel-letter">				
			<span class="txt"><tctl:msg key="comn.select.cancel" /></span>
		</span>
		{{/equal}}
		<span class="btn_minor_s" data-role="button" evt-rol="letter-layer-close">				
			<span class="txt"><tctl:msg key="comn.cancel" /></span>
		</span>		
	</footer>
</div>
</script>

<script id="mail_doctemplate_layer_tmpl" type="text/x-handlebars-template">
<div id="mailDocTmplLayerWrap" class="layer_normal layer_select_doc layer_inside" style="position:absolute;left:-285px;top:20px;">
	<header>
		<h1><tctl:msg key="mail.doctemplate"/></h1>
		<a class="btn_layer_x" evt-rol="doctmpl-layer-close"><span class="ic"></span><span class="txt"></span></a>
	</header>
	<div class="content">
		<ul class="doc">
			{{#if list}}
			{{#each list}}
			<li id="docTempate_{{seq}}" data-seq="{{seq}}">
				<ins class="ic_file ic_doc"></ins>
				<span class="txt">{{name}}</span>
			</li>
			{{/each}}
			{{/if}}
		</ul>
		{{#applyTemplate "mail_layer_navi_tmpl" this}}{{/applyTemplate}}
	</div>
	<footer class="btn_layer_wrap">
		<span class="btn_major_s" data-role="button" evt-rol="apply-doctmpl">				
			<span class="txt"><tctl:msg key="comn.confirm" /></span>
		</span>
		<span class="btn_minor_s" data-role="button" evt-rol="doctmpl-layer-close">				
			<span class="txt"><tctl:msg key="comn.cancel" /></span>
		</span>		
	</footer>
</div> 
</script>

<script id="mail_layer_navi_tmpl" type="text/x-handlebars-template">
{{#with pageInfo}}
<div id="pageNaviLayerWrap" class="dataTables_paginate paging_full_numbers" data-type="{{../type}}" style="text-align:center;">
	<a tabindex="0" class="first paginate_button {{#if firstWindow}}paginate_button_disabled{{/if}}" {{#unless firstWindow}}page="{{preWindow}}" evt-rol="layer-list-page-move"{{/unless}} title="<tctl:msg key="comn.page.first" />"></a>
	<a tabindex="0" class="previous paginate_button {{#if firstPage}}paginate_button_disabled{{/if}}" {{#unless firstPage}}page="{{prePage}}" evt-rol="layer-list-page-move"{{/unless}} title="<tctl:msg key="comn.page.pre" />"></a>
	<span>
		{{#each pages}}
		<a tabindex="0" {{#equal ../page this}}class="paginate_active"{{else}}evt-rol="layer-list-page-move" class="paginate_button"{{/equal}} page="{{printThis this}}">{{printThis this}}</a>
		{{/each}}
	</span>
	<a tabindex="0" class="next paginate_button {{#if lastPage}}paginate_button_disabled{{/if}}" {{#unless lastPage}}page="{{nextPage}}" evt-rol="layer-list-page-move"{{/unless}} title="<tctl:msg key="comn.page.next" />"></a>
	<a tabindex="0" class="last paginate_button {{#if lastWindow}}paginate_button_disabled{{/if}}" {{#unless lastWindow}}page="{{nextWindow}}" evt-rol="layer-list-page-move"{{/unless}} title="<tctl:msg key="comn.page.end" />"></a>
</div>
{{/with}}
</script>

<script id="mail_layer_reserved_tmpl" type="text/x-handlebars-template">
<div id="mailReservedLayerWrap" class="layer_normal layer_reservation_mail layer_inside" style="position:absolute;left:0px;top:-200px;" data-layer>
	<header>
		<h1><tctl:msg key="mail.reserve.send"/></h1>
		<a class="btn_layer_x" evt-rol="reserved-layer-close"><span class="ic"></span></a>
	</header>
	<div class="content">
		<div class="vertical_wrap_s">
			<span class="title"><tctl:msg key="mail.send.reserved.date.msg"/></span>
			<span class="noti_date_wrap option_wrap">
				<label>
				<input id="reservedDate" class="txt_mini wfix_medium align_r" type="text" evt-type="select-reserved-date" readonly="readonly" value="{{reservedDateInfo.todayDate}}" data-reservedUtc="{{reservedDateInfo.reservedUtc}}" data-todayDateUtc="{{reservedDateInfo.todayDateUtc}}" data-maxReservedDay="{{reservedDateInfo.maxReservedDay}}"/>	
				<span class="ic ic_calendar"></span>
				</label>
			</span>
		</div>
		<div class="vertical_wrap_s">
			<span class="title"><tctl:msg key="mail.send.reserved.time.msg"/></span>
			<select id="reservedHour">
				{{#each hourArray}}
				<option value="{{printThis this}}" {{#equal this ../reservedDateInfo.thour}}selected{{/equal}}>{{#lessThen this 10}}0{{printThis this}}{{else}}{{printThis this}}{{/lessThen}}</option>
				{{/each}}
			</select>	
			<tctl:msg key="comn.hour" />
			<select id="reservedMin">
				{{#each minArray}}
				<option value="{{printThis this}}" {{#equal this ../reservedDateInfo.tmin}}selected{{/equal}}>{{#equal this 0}}0{{printThis this}}{{else}}{{printThis this}}{{/equal}}</option>
				{{/each}}
			</select>
			<tctl:msg key="comn.min" />
		</div>
	</div>
	<footer class="btn_layer_wrap">
		<span class="btn_major_s" data-role="button" evt-rol="apply-reserved">				
			<span class="txt"><tctl:msg key="comn.confirm" /></span>
		</span>
		<span class="btn_minor_s" data-role="button" evt-rol="reserved-layer-close">				
			<span class="txt"><tctl:msg key="comn.cancel" /></span>
		</span>		
	</footer>
</div>
</script>

<script id="mail_layer_securemail_tmpl" type="text/x-handlebars-template">
<div id="mailSecureLayerWrap" class="layer_normal layer_secret layer_inside" style="position:absolute;left:0px;top:-200px;" data-layer>
	<header>
		<h1><tctl:msg key="menu.secure"/></h1>
		<a class="btn_layer_x" evt-rol="secure-layer-close"><span class="ic"></span></a>
	</header>
	<div class="content">
		<div class="vertical_wrap_s">
			<span class="title"><tctl:msg key="mail.secure.form.004"/></span>
			<input id="securemailPass" class="txt_mini wfix_large" type="password" autocomplete="off" />
		</div>
		<div class="vertical_wrap_s">		
			<span class="title"><tctl:msg key="mail.secure.hint"/></span>
			<input id="securemailHint" class="txt_mini wfix_large" type="text" />
		</div>
	</div>
	<footer class="btn_layer_wrap">
		<span class="btn_major_s" data-role="button" evt-rol="apply-secure">				
			<span class="txt"><tctl:msg key="comn.confirm" /></span>
		</span>
		<span class="btn_minor_s" data-role="button" evt-rol="secure-layer-close">				
			<span class="txt"><tctl:msg key="comn.cancel" /></span>
		</span>		
	</footer>
</div>
</script>

<script id="mail_layer_sign_tmpl" type="text/x-handlebars-template">
<select id="signSelect">
	{{#if this}}
		<option value="0" {{#unless useAttach}}selected{{/unless}}><tctl:msg key="comn.disabled" /></option>
		{{#each this}}
			<option value="{{signSeq}}" {{#if ../useAttach}}{{#if defaultSign}}selected{{/if}}{{/if}}>{{signName}}</option>
		{{/each}}
	{{else}}
		<option value="0"><tctl:msg key="mail.nosign"/></option>
	{{/if}}
</select>
</script>

<script id="mail_layer_bigattach_manager_tmpl" type="text/x-handlebars-template">
<table class="type_normal">	
	<colgroup>
		<col width="*" />
		<col width="100px" />
		<col width="100px" />
		<col width="100px" />
		<col width="50px" />
	</colgroup>
	<thead>
		<tr>
			<th style="cursor:default;"><tctl:msg key="bigattach.list.001"/></th>
			<th style="cursor:default;"><tctl:msg key="bigattach.list.002"/></th>
			<th style="cursor:default;"><tctl:msg key="bigattach.list.003"/></th>
			<th style="cursor:default;"><tctl:msg key="bigattach.list.004"/></th>
			<th style="cursor:default;"><tctl:msg key="comn.del" /></th>
		</tr>
	</thead>
</table>

<div style="height:200px;overflow-y:auto;">
<table class="type_normal">
	<colgroup>
		<col width="*" />
		<col width="100px" />
		<col width="100px" />
		<col width="100px" />
		<col width="50px" />
	</colgroup>
	<tbody>
		{{#if this}}
		{{#each this}}		
		<tr id="bigattach_item_{{messageUid}}">
			<td><span class="name">{{fileName}}</span></td>
			<td style="text-align:right;"><span class="size">{{printSize fileSize}}</span></td>
			<td style="text-align:center;"><span class="date">{{printDate '-' registTime}}</span></td>
			<td style="text-align:center;"><span class="date">{{printDate '-' expireTime}}</span></td>
			<td style="text-align:center;"><span class="btn_bdr" title="<tctl:msg key="comn.del" />" evt-rol="bigattach-delete" data-messageUid="{{messageUid}}"><span class="ic_classic ic_basket"></span></span></td>
		</tr>
		{{/each}}
		{{else}}
		<tr>
			<td colspan="5" style="text-align:center !important;"><tctl:msg key="bigattach.list.006"/></td>
		</tr>
		{{/if}}
	</tbody>
</table>
</div>
</script>

<script id="mail_layer_extmail_tmpl" type="text/x-handlebars-template">
<table class="type_normal">
	<colgroup>
		<col width="*">
		<col width="50px">
		<col width="120px">
		<col width="120px">
		<col width="120px">
		<col width="100px">
	</colgroup>
	<thead>
		<tr>
			<th><tctl:msg key="conf.pop.31" /></th>	
			<th><tctl:msg key="conf.pop.39" /></th>	
			<th><tctl:msg key="conf.pop.32" /></th>	
			<th><tctl:msg key="conf.pop.30" /></th>	
			<th><tctl:msg key="conf.pop.24" /></th>	
			<th><tctl:msg key="conf.pop.57" /></th>	
		</tr>
	</thead>
</table>
<div class="div_list" style="min-height:130px;max-height:200px;overflow-y:auto;">
	<table class="type_normal">
		<colgroup>
			<col width="*">
			<col width="50px">
			<col width="120px">
			<col width="120px">
			<col width="120px">
			<col width="100px">
		</colgroup>
		<tbody>
			{{#if this}}
			{{#each this}}
			<tr class="item" status="{{downloadStatus}}">
				<td>{{host}}</td>	
				<td>{{port}}</td>	
				<td>{{id}}</td>	
				<td>{{viewMoveFolderName decodeMailBox}}</td>	
				<td>{{#if delete}}<tctl:msg key="conf.pop.58"/>{{else}}<tctl:msg key="conf.pop.59"/>{{/if}}</td>	
				<td>
					{{#equal downloadStatus 'READY'}}
						<a evt-rol="extmail-download-start" host="{{host}}" userid="{{id}}"><span class="state finish"><tctl:msg key="common.16" /></span></a>
					{{/equal}}
					{{#equal downloadStatus 'WAIT'}}
						<a evt-rol="extmail-download-reset" host="{{host}}" userid="{{id}}"><span class="state wait"><tctl:msg key="comn.waiting" /></span></a>
					{{/equal}}
					{{#equal downloadStatus 'INPROGRESS'}}
						<span class="state ongoing"><tctl:msg key="comn.processing" /></span>
					{{/equal}}
					{{#equal downloadStatus 'ERROR'}}
						<a evt-rol="extmail-download-reset" host="{{host}}" userid="{{id}}"><span class="state cancel"><tctl:msg key="conf.pop.54" /></span></a>
					{{/equal}}
					{{#equal downloadStatus 'DONE'}}
						<a evt-rol="extmail-download-reset" host="{{host}}" userid="{{id}}"><span class="state finish"><tctl:msg key="comn.complate" /></span></a>
					{{/equal}}
				</td>	
			</tr>
			<tr class="process_wrap" style="{{#equal downloadStatus 'READY'}}display:none;{{/equal}}">
				<td colspan="6">
					<div class="process" style="padding:10px 0px">
						<span class="gage_wrap">
							<span class="gage bgcolor4" style="width:{{percent}}%"></span>
							<span class="gage bgcolor17" style="width:{{successPercent}}%"></span>
							<span style="position:absolute;right:48%;top:-3px">{{percent}}%</span>
						</span>
						<div class="status">
							<span class="txt"><tctl:msg key="conf.pop.61" /> <span>{{totalCount}}</span><tctl:msg key="mail.countunit"/></span>
							<span class="piece bgcolor17"></span>
							<span class="txt"><tctl:msg key="conf.pop.60" /> <span>{{downloadCount}}</span><tctl:msg key="mail.countunit"/></span>
							<span class="piece bgcolor4"></span>
							<span class="txt"><tctl:msg key="conf.pop.54" /> <span>{{failCount}}</span><tctl:msg key="mail.countunit"/></span>
						</div>
					</div>
					<div class="process" style="{{#notEqual downloadStatus 'ERROR'}}display:none;{{/notEqual}}">
						{{#equal failMessage 'CONN_FAIL'}}
							<tctl:msg key="conf.pop.55" />
						{{/equal}}
						{{#equal failMessage 'AUTH_FAIL'}}
							<tctl:msg key="conf.pop.47" />
						{{/equal}}
						{{#equal failMessage 'QUOTA_OVER'}}
							<tctl:msg key="conf.pop.48" />
						{{/equal}}
						{{#equal failMessage 'ERROR'}}
							<tctl:msg key="conf.pop.56" />
						{{/equal}}
					</div>
				</td>	
			</tr>
			{{/each}}
			{{else}}
			<tr>
				<td colspan="6" style="text-align:center;"><tctl:msg key="conf.pop.list.empty" /></td>
			</tr>
			{{/if}}
		</tbody>
	</table>
</div>
</script>

<script id="mail_layer_filter_tmpl" type="text/x-handlebars-template">
<ul class="normal">
	<li>
		<input type="checkbox" name="filterCondOption"	value="from"/>
		<label>
			<strong><tctl:msg key="conf.filter.48" /></strong>
			<input id="filterFrom" class="txt_mini" type="text" value="{{from}}"/> 
			<span class="txt"><tctl:msg key="conf.filter.23" /></span>
		</label>
	</li>
	<li>
		<input type="checkbox" name="filterCondOption"	value="to"/>
		<label>
			<strong><tctl:msg key="conf.filter.49" /></strong>
			<input id="filterTo" class="txt_mini" type="text" value="{{to}}"/>
			<span class="txt"><tctl:msg key="conf.filter.23" /></span>
		</label>					 
	</li>
	<li>
		<input type="checkbox" name="filterCondOption"	value="subject"/>
		<label>
			<strong><tctl:msg key="conf.filter.50" /></strong>
			<input id="filterSubject" class="txt_mini" type="text" value="{{subject}}"/>
			<span class="txt"><tctl:msg key="conf.filter.23" /></span>
		</label>					 
	</li>
</ul>
<div id="filterCondOperationWrap" style="display:none;">
	<hr />
	<ul class="normal">
		<li style="margin-bottom:0px;">
			<div class="title">
				<input type="radio" id="filterOperationAnd" name="filterOperation" value="and" checked="checked"/>
				<label for="filterOperationAnd" class="txt_radio">
					<tctl:msg key="conf.filter.66" /> - 
					<tctl:msg key="conf.filter.67" />
				</label>
			</div>
		</li>
		<li style="margin-bottom:0px;">
			<div class="title">
				<input type="radio" id="filterOperationOr" name="filterOperation" value="or"/>
				<label for="filterOperationOr" class="txt_radio">
					<tctl:msg key="conf.filter.68" /> - 
					<tctl:msg key="conf.filter.69" />
				</label>
			</div>
		</li>
	</ul>
</div>
<hr />
<ul class="normal">
	<li>
		<div class="title">
			<input type="radio" name="filterOption" value="extBox" checked="checked"/>
			<label class="txt_radio"><tctl:msg key="conf.filter.54" /></label>
		</div>
		<div class="data">		
			<select id="filterFolder">
				<option value="Inbox"><tctl:msg key="folder.inbox"/></option>
				<c:if test="${useSpamFolder}">
				<option value="Spam"><tctl:msg key="folder.spam"/></option>
				</c:if>
				<option value="Trash"><tctl:msg key="folder.trash"/></option>
				{{#applyTemplate "mail_folder_selectbox_tmpl" folderList}}{{/applyTemplate}}
			</select>		
		</div>	
	</li>
	<li>
		<div class="title">
			<input type="radio" name="filterOption" value="newBox"/>
			<label class="txt_radio"><tctl:msg key="conf.filter.55" /></label>
		</div>
		<div class="data">
			<select id="filterParentFolder">
				<option value=""><tctl:msg key="mail.folder.parent.select.msg"/></option>
				<option value="Inbox"><tctl:msg key="folder.inbox"/></option>
				{{#applyTemplate "mail_folder_add_selectbox_tmpl" folderList}}{{/applyTemplate}}
			</select>		
			<input id="filterNewMailBox" class="txt_mini" type="text" placeholder="<tctl:msg key="mail.folder.add.title"/>" />							
		</div>					
	</li>
	{{#if tagList}}
	<li>
		<div class="title">
			<input type="radio" name="filterOption" value="extTag"/>
			<label class=""><tctl:msg key="conf.filter.56" /></label>
		</div>
		<div class="data">	
			<select id="filterTagList">
				{{#each tagList}}
				<option value="{{id}}">{{name}}</option>
				{{/each}}
			</select>	
		</div>	
	</li>
	{{/if}}	
	<li>
		<div class="title">
			<input type="radio" name="filterOption" value="newTag"/>
			<label class=""><tctl:msg key="conf.filter.57" /></label>
		</div>
		<div class="data">	
			<input id="filterNewTagName" class="txt_mini" type="text" placeholder="<tctl:msg key="mail.tag.add.title"/>" />
			<div id="filterNewTagList" class="layer_pallete pallete_wrap">
				<a class="bgcolor1" color="bgcolor1">bgcolor1</a>
				<a class="bgcolor2" color="bgcolor2">bgcolor2</a>
				<a class="bgcolor3" color="bgcolor3">bgcolor3</a>
				<a class="bgcolor4" color="bgcolor4">bgcolor4</a>
				<a class="bgcolor5" color="bgcolor5">bgcolor5</a>
				<a class="bgcolor6" color="bgcolor6">bgcolor6</a>
				<a class="bgcolor7" color="bgcolor7">bgcolor7</a>
				<a class="bgcolor8" color="bgcolor8">bgcolor8</a>
				<a class="bgcolor9 last" color="bgcolor9">bgcolor9</a>
				<br />
				<a class="bgcolor10 active" color="bgcolor10">bgcolor10</a>
				<a class="bgcolor11" color="bgcolor11">bgcolor11</a>
				<a class="bgcolor12" color="bgcolor12">bgcolor12</a>
				<a class="bgcolor13" color="bgcolor13">bgcolor13</a>
				<a class="bgcolor14" color="bgcolor14">bgcolor14</a>
				<a class="bgcolor15" color="bgcolor15">bgcolor15</a>
				<a class="bgcolor16" color="bgcolor16">bgcolor16</a>
				<a class="bgcolor17" color="bgcolor17">bgcolor17</a>
				<a class="bgcolor18 last" color="bgcolor18">bgcolor18</a>
			</div>
		</div>	
	</li>				
</ul>
</script>

<script id="mail_layer_spam_tmpl" type="text/x-handlebars-template">
<p class="desc"><tctl:msg key="reportspam.message"/></p>

<div class="vertical_wrap_s">
<input id="addSpamSender" type="checkbox" checked="checked">
<label for="addSpamSender"><tctl:msg key="reportspam.addspam"/></label>
</div>
<div class="vertical_wrap_s">
<input id="moveTrashMail" type="checkbox" checked="checked">
<label for="moveTrashMail"><tctl:msg key="reportspam.gotrash"/></label>
</div>
</script>

<script id="mail_layer_white_tmpl" type="text/x-handlebars-template">
<p class="desc"><tctl:msg key="reportham.message"/></p>

<div class="vertical_wrap_s">
<input id="addWhiteSender" type="checkbox" checked="checked">
<label for="addWhiteSender"><tctl:msg key="reportham.addwhite"/></label>
</div>
<div class="vertical_wrap_s">
<input id="moveInboxMail" type="checkbox" checked="checked">
<label for="moveInboxMail"><tctl:msg key="reportham.moveinbox"/></label>
</div>
</script>

<script id="mail_write_multi_search_result_tmpl" type="text/x-handlebars-template">
<table class="type_normal">	
	<colgroup>
		<col width="40px">
		<col>
	</colgroup>
	<thead>
		<tr>
			<th><input type="checkbox" id="writeMultiSearchCheckAll"/></th>
			<th><tctl:msg key="mail.search.name.title"/></th>
		</tr>
	</thead>
</table>
<div style="height:200px;overflow-y:auto;">
<table class="type_normal">
	<colgroup>
		<col width="40px">
		<col>
	</colgroup>
	<tbody>
		{{#each this}}
		<tr>
			<td><input type="checkbox" name="emailCheck" value="{{address}}" data-name="{{personal}}"></td>
			<td><span class="name">{{printEmailAddress address}}</span></td>
		</tr>
		{{/each}}
	</tbody>
</table>
</script>

<script id="mail_folder_option_tmpl" type="text/x-handlebars-template">
	<ul class="array_type" folder="{{folderName}}" data-share="{{share}}" data-shareseq="{{shareseq}}">
		<li evt-rol="empty-user-folder">
			<span class="txt"><tctl:msg key="mail.folder.empty"/></span>
		</li>
		{{#notEqual folderName 'Inbox'}}
		<li class="depart_line"></li>
		<li evt-rol="move-folder">
			<span class="txt"><tctl:msg key="mail.folder.move"/></span>
		</li>		
		<li evt-rol="modify-folder">
			<span class="txt"><tctl:msg key="mail.folder.modify"/></span>
		</li>		
		<li evt-rol="delete-folder"{{#unless useSharedfolder}}{{#equal depth 2}}class="last"{{/equal}}{{/unless}}>
			<span class="txt"><tctl:msg key="mail.folder.delete"/></span>
		</li>
		{{/notEqual}}
		
		<li evt-rol="add-sub-folder"  {{#unless useSharedfolder}}class="last"{{/unless}}>
			<span class="txt"><tctl:msg key="mail.subfolder.add"/></span>
		</li>
		
		
		{{#notEqual folderName 'Inbox'}}		
		<li evt-rol="upload-message">
			<span class="txt"><tctl:msg key="mail.mailupload.setup"/></span>
		</li>
		{{/notEqual}}

        {{#if useSharedfolder}}
		{{#notEqual folderName 'Inbox'}}
		<li class="depart_line"></li>
		<li evt-rol="share-folder" class="last">
			<span class="txt"><tctl:msg key="mail.folder.share"/></span>
		</li>
		{{/notEqual}}		
		{{/if}}		
	</ul>
</script>

<script id="mail_tag_option_tmpl" type="text/x-handlebars-template">
	<ul class="array_type" tagid="{{id}}" tagname="{{name}}" tagcolor="{{color}}">
		<li evt-rol="tag-modify">
			<span class="txt"><tctl:msg key="mail.tag.modify"/></span>
		</li>
		<li evt-rol="tag-delete">
			<span class="txt"><tctl:msg key="mail.tag.delete"/></span>
		</li>		
	</ul>
</script>

<script id="mail_email_layer_menu_tmpl" type="text/x-handlebars-template">
<div class="mailLayerMenu" style="position:absolute;z-index:1;">
	<div class="array_option">
		<ul class="array_type" data-email="{{email}}">
			<li evt-rol="layer-write-email">
				<span><tctl:msg key="mail.message.write"/></span>
			</li>
			{{#if useContact}}
			<li evt-rol="layer-save-addr">
				<span><tctl:msg key="menu.addaddr"/></span>
			</li>
			{{/if}}
			<li evt-rol="layer-search-mail" class="last">
				<span><tctl:msg key="mail.message.search"/></span>
			</li>
		</ul>
	</div>
</div>
</script>

<script id="mail_add_addr_email_tmpl" type="text/x-handlebars-template">
<table class="table_form_mini">
	<tbody>
		<tr>
			<th><span class="txt"><tctl:msg key="conf.userinfo.name" /></span></th>
			<td>
				<input id="addrMemberName" type="text" class="txt_mini w_max" value="{{name}}">
			</td>
		</tr>
		<tr>
			<th><span class="txt"><tctl:msg key="conf.userinfo.email" /></span></th>
			<td>
				<input id="addrMemberEmail" type="text" class="txt_mini w_max" value="{{email}}">
			</td>
		</tr>				
		<tr>
			<th><span class="txt"><tctl:msg key="addr.btn.select.group"/></span></th>
			<td>
				<select id="addrMemberGroup" class="w_max">
					<option value=""><tctl:msg key="addr.tree.all.label"/></option>
					{{#each groupList}}
					<option value="{{id}}">{{name}}</option>
					{{/each}}
				</select>
			</td>
		</tr>			
	</tbody>
</table>
</script>

<script id="mail_send_allow_check_tmpl" type="text/x-handlebars-template">
{{#if sendEmailCheckResult}}
<div class="notice">
	<span class="ic_error ic_error_default"></span>
	<p class="title"><tctl:msg key="mail.sendcheck.email.title"/></p>
	<p class="desc"><tctl:msg key="mail.sendcheck.email.desc"/></p>
</div>
{{/if}}
{{#if sendAttachCheckResult}}
<div class="notice">
	<span class="ic_error ic_error_default"></span>
	<p class="title"><tctl:msg key="mail.sendcheck.attach.title"/></p>
	<p class="desc"><tctl:msg key="mail.sendcheck.attach.desc"/></p>
</div>
{{/if}}
{{#if sendKeywordCheckResult}}
<div class="notice">
	<span class="ic_error ic_error_default"></span>
	<p class="title"><tctl:msg key="mail.sendcheck.keyword.title"/></p>
	<p class="desc"><tctl:msg key="mail.sendcheck.keyword.desc"/></p>
</div>
{{/if}}
{{#if sendInfoCheck}}
<p class="desc" style="padding-left:12px;"><tctl:msg key="mail.rcptcheck.info"/></p>
<div style="overflow: auto; height: 300px;">
<table class="in_table_type2">
	<colgroup>
		<col width="100px">
		<col width="">								
	</colgroup>
	<tbody>
		<tr>
			<th><tctl:msg key="mail.subject"/></th>						
			<td>{{subject}}</td>
		</tr>
		<tr>
			<th><tctl:msg key="mail.to"/></th>						
			<td>
				{{#each toList}}
					<p><input type="checkbox" name="toAddr" value="{{printThis this}}"> <label>{{makeEmailFormatName this}}</label></p>
				{{/each}}
			</td>
		</tr>
		{{#if ccList}}
		<tr>
			<th><tctl:msg key="mail.cc"/></th>						
			<td>
				{{#each ccList}}
					<p><input type="checkbox" name="ccAddr" value="{{printThis this}}"> <label>{{makeEmailFormatName this}}</label></p>
				{{/each}}
			</td>
		</tr>
		{{/if}}
		{{#if bccList}}
		<tr>
			<th><tctl:msg key="mail.bcc"/></th>						
			<td>
				{{#each bccList}}
					<p><input type="checkbox" name="bccAddr" value="{{printThis this}}"> <label>{{makeEmailFormatName this}}</label></p>
				{{/each}}
			</td>
		</tr>
		{{/if}}
		{{#if attachList}}
		<tr>
			<th><tctl:msg key="mail.attach"/></th>						
			<td>
				<ul class="file_wrap">
					{{#each attachList}}
					<li>
						<span class="item_file">
							<input type="checkbox" name="attachFile" value="{{id}}">
							<span class="ic_file ic_{{fileExt name}}"></span>
							<span class="name">{{name}}</span>
							<span class="size">{{printSize size}}</span>
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
{{/if}}	
</script>

<script id="mail_mdn_recall_fail_tmpl" type="text/x-handlebars-template">
<span class="ic_data_type ic_error_page"></span>
<p class="q"><tctl:msg key="mail.mdn.message.recall.003"/></p>
<p class="add">
	{{#if successEmailList}}
	<tctl:msg key="mail.mdn.message.recall.005"/> : <tctl:msg key="mail.mdn.message.recall.009"/><br>
	{{/if}}
	{{#if ignoreEmailList}}
	<tctl:msg key="mail.mdn.message.recall.006"/> : <tctl:msg key="mail.mdn.message.recall.010"/><br>
	{{/if}}
	{{#if externalEmailList}}
	<tctl:msg key="mail.mdn.message.recall.007"/> : <tctl:msg key="mail.mdn.message.recall.011"/><br>
	{{/if}}
</p>

<div style="max-height:400px;width:100%;overflow:auto;min-height:100px;">
{{#if successEmailList}}
<table class="in_table_type2" style="margin:5px 0px;">
	<tr><th><tctl:msg key="mail.mdn.message.recall.005"/></th></tr>
{{#each successEmailList}}
	<tr><td>{{printThis this}}</td></tr>
{{/each}}
</table>
{{/if}}
{{#if ignoreEmailList}}
<table class="in_table_type2" style="margin:5px 0px;">
	<tr><th><tctl:msg key="mail.mdn.message.recall.006"/></th></tr>
{{#each ignoreEmailList}}
	<tr><td>{{printThis this}}</td></tr>
{{/each}}
</table>
{{/if}}
{{#if externalEmailList}}
<table class="in_table_type2" style="margin:5px 0px;">
	<tr><th><tctl:msg key="mail.mdn.message.recall.007"/></th></tr>
{{#each externalEmailList}}
	<tr><td>{{printThis this}}</td></tr>
{{/each}}
</table>
{{/if}}
{{#if failEmailList}}
<table class="in_table_type2" style="margin:5px 0px;">
	<tr><th><tctl:msg key="mail.mdn.message.recall.012"/></th></tr>
{{#each failEmailList}}
	<tr><td>{{printThis this}}</td></tr>
{{/each}}
</table>
{{/if}}
</div>
</script>

<script id="mail_message_upload_tmpl" type="text/x-handlebars-template">
<form id="messageUploadForm" name="messageUploadForm" enctype="multipart/form-data">
	<input type="hidden" name="folder"/>
<div id="messageUploadWrap" {{#unless useFlash}}style="display:none;"{{/unless}}>
	<span class="title" style="vertical-align:top;line-height:30px"><tctl:msg key="menu.uploadmsg"/></span>
	<span class="attachPart">
		<span id="basicMsgUploadControl" class="btn_minor_s" style="padding:0px;height:26px;"><input type="button" id="basicMsgUploadBtn"/></span>
	</span>
</div>

<span id="simpleFileInit" class="btn btn-success fileinput-button" {{#if useFlash}}style="display:none;"{{/if}}>
	<span class="title" style="vertical-align:top;line-height:30px"><tctl:msg key="menu.uploadmsg"/></span>
	<a class="btn_minor_s">
		<span class="ic"></span>
		<span class="txt"><strong><tctl:msg key="comn.file.attachment" /></strong></span>
	</a>
	<input type="file" id="mailSimpleMessageUpload" name="theFile" multiple class="TM_attFile">
</span>

<div id="messageUploadListWrap" style="display:none;max-height:300px;overflow-y:auto;">
<table id="messageUploadListTable" class="in_table">
	<colgroup>
		<col />
		<col style="width:100px" />
	</colgroup>
	<tr>
		<th><tctl:msg key="bigattach.list.001"/></th>
		<th><tctl:msg key="ocx.uptxt_lst3"/></th>
	</tr>
</table>

</div>
<div id="messageUploadFailListWrap" style="display:none;max-height:200px;overflow-y:auto;"></div>
</form>
</script>

<script id="mail_message_upload_items_tmpl" type="text/x-handlebars-template">
{{#each this}}
{{#applyTemplate "mail_message_upload_item_tmpl" this}}{{/applyTemplate}}
{{/each}}
</script>

<script id="mail_message_upload_item_tmpl" type="text/x-handlebars-template">
<tr>
	<td title="{{name}}">
		<span class="item_file">
			<span class="ic_file ic_{{fileExt name}}"></span>
			<span class="name">{{name}}</span>
		</span>
	</td>
	<td style="text-align:center">
		<span id="msg_progress_{{id}}" class="progressBar"></span>
	</td>
</tr>
</script>

<script id="mail_message_upload_fail_tmpl" type="text/x-handlebars-template">
<table class="in_table">
		<colgroup>
			<col />
		</colgroup>
		<tr>
			<th><tctl:msg key="error.upload"/></th>
		</tr>
		{{#each this}}
		<tr>
			<td title="{{name}}">
				<span class="item_file">
					<span class="ic_file ic_{{fileExt name}}"></span>
					<span class="name">{{name}}</span>
				</span>
			</td>
		</tr>
		{{/each}}
	</table>
</script>

<script id="mail_message_upload_list_tmpl" type="text/x-handlebars-template">
<table class="in_table">
	<colgroup>
		<col />
		<col style="width:100px" />
	</colgroup>
	<tr>
		<th><tctl:msg key="bigattach.list.001"/></th>
		<th><tctl:msg key="ocx.uptxt_lst3"/></th>
	</tr>
	{{#each this}}
	<tr>
		<td title="{{name}}">
			<span class="item_file">
				<span class="ic_file ic_{{fileExt name}}"></span>
				<span class="name">{{name}}</span>
			</span>
		</td>
		<td style="text-align:center">
			<span id="msg_progress_{{id}}" class="progressBar"></span>
		</td>
	</tr>
	{{/each}}
</table>
</script>
<script id="mail_send_allow_list_tmpl" type="text/x-handlebars-template">
{{#if this}}
<ul class="list_line">
    {{#each this}}
        <li><span class="email">{{this}}</span></li>
    {{/each}}
{{else}}
<ul>
        <li><span class="email"><tctl:msg key="sendallow.list.empty"/></span></li>
{{/if}}
</ul>
</script>


<script id="mail_inline_img_upload_tmpl" type="text/x-handlebars-template">
<div {{#unless useFlash}}style="display:none;"{{/unless}}>
	<span class="attachPart">
		<span class="btn_minor_s" id="swfupload-control" style="padding:0 !important;height:26px;">
			<span class="txt" id="button"></span>
		</span>
	</span>
</div>

<span id="simpleFileInit" class="btn btn-success fileinput-button" {{#if useFlash}}style="display:none;"{{/if}}>
	<a class="btn_minor_s">
		<span class="ic"></span>
		<span class="txt"><strong><tctl:msg key="comn.file.attachment" /></strong></span>
	</a>
	<input type="file" id="mailSimpleInlineImgUpload" name="NewFile" class="TM_attFile" multiple>
</span>

</script>

<script id="mail_write_rcpt_info_tmpl" type="text/x-handlebars-template">
<table class="type_normal">	
	<colgroup>
		<col width="100px">
		<col width="100px">
		<col width="100px">
		<col width="150px">
		<col width="100px">
		
	</colgroup>
	<thead>
		<tr>
			<th><tctl:msg key="conf.userinfo.name" /></th>
			<th><tctl:msg key="mail.search.name.department"/></th>
			<th><tctl:msg key="mail.search.name.position"/></th>
			<th><tctl:msg key="conf.userinfo.email" /></th>
			<th><tctl:msg key="mail.search.name.company"/></th>
		</tr>
	</thead>
</table>
<div style="height:200px;overflow-y:auto;">
<table class="type_normal">
	<colgroup>
		<col width="100px">
		<col width="100px">
		<col width="100px">
		<col width="150px">
		<col width="100px">
	</colgroup>
	<tbody>
		
		<tr>
			
			<td><span class="name">{{name}}</span></td>
			<td><span class="name">{{department}}</span></td>
			<td><span class="name">{{position}}</span></td>
			<td>
				<span class="name">
					{{#if email}}
						{{email}}
					{{else}}
						<input type="text" name="emailValue" class="txt_mini" style="width:350px;"/>
					{{/if}}
				</span>
			</td>
			<td><span class="name">{{company}}</span></td>
		</tr>

	</tbody>
</table>
</script>

<script id="mail_attch_check_layer" type="text/x-handlebars-template">
	<div class="notice last">
		<span class="ic_error ic_error_default"></span>
		<p class="title"><tctl:msg key="mail.attach.check.layer.title"/></p>
		<p class="desc"><tctl:msg key="mail.attach.check.layer.desc"/></p>
		<table class="in_table_type2">
			<colgroup>
				<col width="100px">
				<col width="">
			</colgroup>
			<tbody>
			<tr>
				<th><tctl:msg key="mail.subject"/></th>
				<td id="attachChekLayerSubject"></td>
			</tr>
			<tr>
				<td colspan="2">
					<div class="add_file" style="display:">
						<div class="add_file_header">
							<span class="subject">
							<span class="ic ic_file_s"></span>
							<strong><tctl:msg key="mail.attach"/></strong>
							<span class="num" id="attachChekLayerFileCount">1</span><tctl:msg key="mail.unit.count"/>
							</span>
							<span class="btn_area">
							<span class="btn_wrap"><span class="txt_caution" evt-rol="delete-attach-all"><tctl:msg key="mail.deleteall"/></span></span>
							</span>
						</div>
						<ul class="file_wrap" id="attachChekLayerListWrap">

						</ul>
					</div>
				</td>
			</tr>
			</tbody>
		</table>
		<p class="desc"><tctl:msg key="mail.attach.check.layer.caution"/></p>
	</div>
</script>

<script id="mail_list_content_preview" type="text/x-handlebars-template">
<strong>{{{subject}}}</strong><br/>
<span>{{{content}}}</span>
</script>

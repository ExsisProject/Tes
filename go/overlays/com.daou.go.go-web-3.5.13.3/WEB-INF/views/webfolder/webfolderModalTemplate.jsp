<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<script id="webfolder_list_popup_wrap_tmpl" type="text/x-handlebars-template">
	<div id="webfolderListWrap" class="layer_select">
		<div class="list_wrap">
			<div id="userFolderArea"></div>
			<hr/>
			<div id="companyFolderArea"></div>
		</div>
	</div>
</script>
<script id="webfolder_list_popup_tmpl" type="text/x-handlebars-template">
	<section id="privateWebfolderList" class="lnb">
		<h1 class="user">
			<ins class="ic"></ins> 
			<span class="txt"><tctl:msg key="webfolder.title" /></span>
		</h1>
        <ul class="side_depth webfolderLeft" id="privateWebfolderList">
			<li class="folder">
				<p class="title" real-path="WEBFOLDERROOT" auth="W" type="user">
					<a><ins class="ic"></ins><span class="txt"><tctl:msg key="webfolder.title"  /></span></a>
				</p>
				<ul>
					{{#each webfolder}}
                		<li class="folder">
                    		<p class="title" type="{{type}}" auth="{{auth}}" real-path="{{fullName}}">
                        		<a><ins class="ic"></ins><span class="txt" >{{name}}</span></a>
                    		</p>
                    		{{#if child}}{{#applyTemplate "webfoler_list_popup_sub_tmpl" child}}{{/applyTemplate}}{{/if}}
                		</li>
            		{{/each}}
				</ul>
			</li>
		</ul>
	</section>
</script>
<script id="webfolder_list_public_popup_tmpl" type="text/x-handlebars-template">
	<section class="lnb">
		<h1 class="company">
			<ins class="ic"></ins> 
			<span class="txt"><tctl:msg key="webfolder.public.title" /></span>
		</h1>
        <ul class="side_depth publicFolderLeft" id="publicWebFolderList">
			<li class="folder">
            	<p class="title {{#equal auth 'R'}}title_disable{{/equal}}" type="public" auth="{{auth}}" real-path="WEBFOLDERROOT">
                    <a><ins class="ic"></ins><span class="txt"><tctl:msg key="webfolder.public.title"  /></span></a>
            	</p>
            	<ul>
					{{#each webfolder}}
                		<li class="folder">
                    		<p class="title {{#equal auth 'R'}}title_disable{{/equal}}" type="{{type}}" auth="{{auth}}" real-path="{{fullName}}">
                        		<a><ins class="ic"></ins><span class="txt">{{name}}</span></a>
                    		</p>
                    		{{#if child}}{{#applyTemplate "webfoler_list_popup_sub_tmpl" child}}{{/applyTemplate}}{{/if}}
						</li>
					{{/each}}
				</ul>
            </li>
		</ul>
	</section>
</script>
<script id="webfolder_list_share_popup_tmpl" type="text/x-handlebars-template">
 <ul class="side_depth">
    
                {{#each webfolder}}
                {{#isArray this}}
                    {{#applyTemplate "webfoler_list_share_popup_sub_tmpl" this}}{{/applyTemplate}}
                {{else}}
                <li class="folder">
                 <p class="title title_disable" type="{{type}}" auth="{{auth}}" real-path="{{fullName}}" sroot="{{sroot}}" user-seq="{{mailUserSeq}}" type="share">
                     <a ><ins class="ic"></ins><span class="txt" >{{name}}</span></a>
                 </p>
                    {{#if child}}
                    {{#applyTemplate "webfoler_list_share_popup_sub_tmpl" child}}{{/applyTemplate}}
                {{/if}}
                {{/isArray}}
                </li>
                {{/each}}               
    </ul>
</script>
<script id="webfoler_list_share_popup_sub_tmpl" type="text/x-handlebars-template">
{{#each this}}
<ul>
    <li class="folder">
    <p class="title {{#equal auth 'R'}}title_disable{{/equal}}" type="{{type}}" auth="{{auth}}" real-path="{{fullName}}" sroot="{{sroot}}" user-seq="{{mailUserSeq}}">
        <a><ins class="ic"></ins><span class="txt">{{name}}</span></a>
    </p>
    {{#if child}}{{#applyTemplate "webfoler_list_share_popup_sub_tmpl" child}}{{/applyTemplate}}{{/if}}
    </li>
</ul>
{{/each}}
</script>
<script id="webfoler_list_popup_sub_tmpl" type="text/x-handlebars-template">
{{#each this}}
<ul>
    <li class="folder">
    <p class="title {{#equal auth 'R'}}title_disable{{/equal}}" type="{{type}}" auth="{{auth}}" real-path="{{fullName}}">
        <a><ins class="ic"></ins><span class="txt">{{name}}</span></a>
    </p>
    {{#if child}}{{#applyTemplate "webfoler_list_popup_sub_tmpl" child}}{{/applyTemplate}}{{/if}}
    </li>
</ul>
{{/each}}
</script>
 
 <script id="webfoler_select_folder_popup_tmpl" type="text/x-handlebars-template">
<option class="{{type}}" type="{{type}}" real-path="/" auth="{{auth}}">{{#equal type "user"}}<tctl:msg key="webfolder.title" />{{/equal}}{{#equal type "public"}}<tctl:msg key="webfolder.public.title" />{{/equal}}</option>
{{#each webfolder}}
 <option class="{{type}}" type="{{type}}" real-path="{{fullName}}" auth="{{auth}}">-{{name}}</option>
{{#if child}}
    {{#applyTemplate "webfoler_select_folder_sub_popup_tmpl" child}}{{/applyTemplate}}
{{/if}}
</li>
{{/each}}
 </script>
<script id="webfoler_select_folder_sub_popup_tmpl" type="text/x-handlebars-template">
{{#each this}}
 <option class="{{type}}" type="{{type}}" real-path="{{fullName}}" auth="{{auth}}">{{#equal depth 1 }}--{{name}}{{/equal}}{{#equal depth 2 }}---{{name}}{{/equal}}{{#equal depth 3 }}----{{name}}{{/equal}}{{#equal depth 4 }}-----{{name}}{{/equal}}</option>
{{#if child}}{{#applyTemplate "webfoler_select_folder_sub_popup_tmpl" child}}{{/applyTemplate}}{{/if}}
{{/each}}
 </script>

 <script id="webfoler_select_folder_share_popup_tmpl" type="text/x-handlebars-template">
{{#each webfolder}}
{{#isArray this}}
    {{#applyTemplate "webfoler_select_folder_share_sub_popup_tmpl" this}}{{/applyTemplate}}
{{else}}
<option class="{{type}}" type="{{type}}" real-path="{{fullName}}" sroot="{{sroot}}" user-seq="{{mailUserSeq}}" auth="{{auth}}">-{{name}}</option>
{{#if child}}
    {{#applyTemplate "webfoler_select_folder_share_sub_popup_tmpl" child}}{{/applyTemplate}}
{{/if}}
{{/isArray}}
{{/each}}
 </script>
<script id="webfoler_select_folder_share_sub_popup_tmpl" type="text/x-handlebars-template">
{{#each this}}
 <option type="{{type}}" real-path="{{fullName}}" sroot="{{sroot}}" user-seq="{{mailUserSeq}}" auth="{{auth}}">{{#equal depth 0 }}-{{name}}{{/equal}}{{#equal depth 1 }}--{{name}}{{/equal}}{{#equal depth 2 }}---{{name}}{{/equal}}{{#equal depth 3 }}----{{name}}{{/equal}}{{#equal depth 4 }}-----{{name}}{{/equal}}</option>
{{#if child}}{{#applyTemplate "webfoler_select_folder_share_sub_popup_tmpl" child}}{{/applyTemplate}}{{/if}}
{{/each}}
 </script>
 
<script id="webfolder_file_popup_tmpl" type="text/x-handlebars-template">
            <span class="size"><span class="txt_caution" id="basic_normal_size">0B</span>/{{#formatSize max}}{{/formatSize}}</span> (<tctl:msg key="file.upload.quota.title" />)
            <br>
            <span class="error_msg align_r" style="display:none" id="quotaMax">
                <ins class="ic ic_"></ins>
                <span class="txt"><tctl:msg key="file.upload.quota.warning" /></span>           
            </span>
</script>
<script id="webfolder_shared_popup_tmpl" type="text/x-handlebars-template">
      <div class="vertial_wrap_s">
            <span class="title"><tctl:msg key="webfolder.name"  /></span>
            <span class="txt">{{#replaceAll folder "." ">" }}{{/replaceAll}}</span>
        </div>
        <hr>
        <div class="share_user">
            <h1>
                <span class="title"><tctl:msg key="webfolder.share.user.title"  /></span>
                <span class="btn_fn4"><span class="txt" evt-rol="addShareUser" data-type="add"><tctl:msg key="webfolder.searchadd" /></span></span>
            </h1>       
            <div class="list_wrap ">            
                <ul id="sharedUserList">
                   
                </ul>   
            </div>      
        </div>
</script>
<script id="webfolder_shared_user_search_popup_tmpl" type="text/x-handlebars-template">
      <div class="move_wrap">
            <span class="btn_bg btn_add_user" evt-rol="shareUserAdd">              
                <span class="ic ic ic_prev2"></span>
                <span class="txt"><tctl:msg key="comn.add" /></span>
            </span>
        </div>
        <div class="user_search_wrap">
            <h1><span class="title"><tctl:msg key="webfolder.share.user.search.title"  /></span></h1>
            <div class="search_wrap">
                <form onsubmit="return false;">                  
                    <input type="text" id="searchUserInput" placeholder='<tctl:msg key="webfolder.search"  />' class="search" evt-rol="searchUser">
                    <input type="submit" value="검색" class="btn_search" evt-rol="searchUser">
                </form>
            </div>  
            <ul id="searchUserList">
                
            </ul>
        </div>      
</script>
<script id="webfolder_shared_user_search_result_tmpl" type="text/x-handlebars-template">
{{#each this}}                
<li>
	<input type="checkbox" data-id="{{id}}" data-name="{{name}}" data-position="{{position}}" data-dept="{{#deptParse departments}}{{/deptParse}}" data-email="{{email}}">
	<span class="user_info">
		<span class="name">{{name}}</span>
		{{#notEmpty position}}
		<span class="bar">/</span>
		{{/notEmpty}}
		<span class="position">{{position}}</span>
		{{#notEmptyArray departments}}
		<span class="bar">/</span>
		{{/notEmptyArray}}
		<span class="part">{{#deptParse departments}}{{/deptParse}}</span>
		{{#notEmpty email}}
		<span class="bar">/</span>
		{{/notEmpty}}
		<span class="email">{{email}}</span>
	</span>
</li>
{{/each}}
</script>
<script id="webfolder_shared_user_list_tmpl" type="text/x-handlebars-template">
{{#each this}}                
<li data-id="{{goUserSeq}}" data-permission="{{shareAuth}}">
	<span class="user_info">
		<span class="name">{{userName}}</span>
		{{#notEmpty position}}
		<span class="bar">/</span>
		{{/notEmpty}}
		<span class="position">{{position}}</span>
		{{#notEmpty dept}}
		<span class="bar">/</span>
		{{/notEmpty}}
		<span class="part">{{dept}}</span>
		{{#notEmpty email}}
		<span class="bar">/</span>
		{{/notEmpty}}
		<span class="email">{{email}}</span>
	</span>
	<span class="btn_wrap btn_write" evt-rol="writePermission">
		{{#if shareAuth}}
			{{#equal shareAuth "R"}}<span class="btn_fn7"><tctl:msg key="webfolder.read"  /></span>{{/equal}}
			{{#equal shareAuth "W"}}<span class="btn_fn7"><tctl:msg key="webfolder.write"  /></span>{{/equal}}
		{{else}}
			<span class="btn_fn7"><tctl:msg key="webfolder.read"  /></span>
		{{/if}}
	</span>
	<span class="btn_wrap btn_del" evt-rol="removeShareUser"><span class="ic_classic ic_del"></span></span>
</li>
{{/each}}
</script>
<script id="file_upload" type="text/x-handlebars-template">
<div id="webfolderFilePopup" class="layer_normal layer_upload" style="position:fixed; width:800px;left :30%; top:20%;z-index:60;">
	<header>
		<h1><tctl:msg key="list.fileattaching"  /></h1>
		<a class="btn_layer_x" evt-rol="closeUploadFileWrap">
			<span class="ic"></span>
			<span class="txt"><tctl:msg key="comn.close" /></span>
		</a>
	</header>
	<div class="content">
		<form name="uploadForm" method="post" enctype="multipart/form-data">
			<input type="hidden" name="uploadType">
			<input type="hidden" name="maxAttachFileSize">
			<div class="vertical_wrap_s">
				<span class="title"><tctl:msg key="webfolder.select" /></span>
				<select class="w_large" id="selectFolderListAll" style="width:380px;"></select>
			</div>
			<hr>
			<div>
				<span class="title"><tctl:msg key="comn.file.attachment" /></span>
			</div>
			<div class="tool_bar" style="clear:both">
				<div class="critical mail_attach_wrap" style="float:left">
					<span id="att_btn_simple" style="float:left;margin-right:5px;">
						<span class="attachPart">
							<span id="basicUploadControl" class="btn_minor_s" style="display: none;">
								<input id="basicUploadBtn" type="button">
							</span>
						</span>
					</span>
					<span id="att_btn_ocx" style="display:none;float:left;margin-right:5px;">
						<a class="btn_minor_s" onclick="ocx_file()"><span class="ic"></span><span class="txt"><strong><tctl:msg key="button.upload"/></strong></span></a>
					</span>
					<span id="simpleFileInit" class="btn btn-success fileinput-button" style="display:none;float:left;margin-right:5px;" evt-rol="selectSendFile">
						<a class="btn_minor_s">
							<span class="ic"></span>
							<span class="txt"><strong><tctl:msg key="comn.file.select"/></strong></span>
						</a>
						<input id="mailSimpleFileUpload" name="theFile" multiple type="file">
					</span>
					<a class="btn_minor_s" evt-rol="removeAttachFileList" style="float:left;margin-right:5px;">
						<span class="txt"><tctl:msg key="comn.del" /></span>
					</a>
				</div>
				<div id="chgAttachModeWrap" style="display:none;float:right;">
					<a class="btn_minor_s" onclick="chgAttachMod('ocx')" id="simple_chage"><span class="txt"><tctl:msg key="mail.attach.power"/></span></a>
					<a class="btn_minor_s" onclick="chgAttachMod('simple')" id="ocx_chage" style="display:none;"><span class="txt"><tctl:msg key="mail.attach.simple"/></span></a>
				</div>
			</div>
			<div style="clear:both"></div>
			<div id="attach_area" class="TM_attach_area">
				<div id="att_ocx_area" >
					<div id="ocxCompL"></div>
				</div>
				<div id="att_simple_area">
					<div id="basicUploadAttachList"></div>
				</div>
			</div>
			<p class="desc align_r" id="quotaWrap"></p>
		</form>
		<footer class="btn_layer_wrap">
			<span class="btn_major_s" data-role="button" evt-rol="sendFile">
				<span class="icon"></span>
				<span class="txt"><tctl:msg key="menu.uploadmsg.simple"  /></span>
			</span>
			<span class="btn_minor_s" data-role="button" evt-rol="closeUploadFileWrap">
				<span class="icon"></span>
				<span class="txt"><tctl:msg key="comn.cancel" /></span>
			</span>
		</footer>
	</div>
	<p class="drag_txt"><tctl:msg key="mail.attach.drag" /></p>
</div>
</script>

<script id="file_unified_detail_search_tmpl" type="text/x-handlebars-template">
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
						<th class="label"><span class="title"><tctl:msg key="webfolder.search.keyword" /></span></th>
						<td class="form">
							<input id="keyword" class="txt_mini w_max" type="text" />
							<div class="vertical_wrap" style="display:none;">
								<span id="searchAttachContentsWrap" class="option_wrap">
									<input id="searchAttachContents" type="checkbox" name="" /><label for="searchAttachContents"><tctl:msg key="webfolder.search.attach.contents" /></label>
								</span>
							</div>
						</td>
					</tr>
					<tr>
						<th class="label"><span class="title"><tctl:msg key="webfolder.search.period" /></span></th>
						<td id="addSearchFlagWrap" class="form">
							<div class="vertical_wrap">
								<span class="option_wrap"><input id="radioAll" type="radio" name="searchPeriod" checked="checked" value="" evt-rol="search-period"/><label for="notSelectFlagRadio"><tctl:msg key="webfolder.search.all" /></label></span>
								<span class="option_wrap"><input id="radio1Week" type="radio" name="searchPeriod" value="-1" evt-rol="search-period"/><label for="attachFlagRadio"><tctl:msg key="webfolder.search.1week" /></label></span>
								<span class="option_wrap"><input id="radio2Week" type="radio" name="searchPeriod" value="-2" evt-rol="search-period"/><label for="seenFlagRadio"><tctl:msg key="webfolder.search.2weeks" /></label></span>
								<span class="option_wrap"><input id="radio1Month" type="radio" name="searchPeriod" value="month" evt-rol="search-period"/><label for="unseenFlagRadio"><tctl:msg key="webfolder.search.1month" /></label></span>
							</div>
							<div class="select_direct">
								<span class="option_wrap"><input id="radioDirectly" type="radio" name="searchPeriod" value="directly" evt-rol="search-directly"/><label for="unseenFlagRadio"><tctl:msg key="webfolder.search.self" /></label></span>
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
				<span class="txt"><tctl:msg key="webfolder.search" /></span>
			</span>
			<span class="btn_minor_s" data-role="button" evt-rol="close-unified-search-folder">
				<span class="icon"></span>
				<span class="txt"><tctl:msg key="comn.cancel" /></span>
			</span>	
		</footer>
	</div>
</div>
</script>
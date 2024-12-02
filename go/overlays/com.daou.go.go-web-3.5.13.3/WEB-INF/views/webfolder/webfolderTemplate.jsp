<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<script id="webfoler_left_tmpl" type="text/x-handlebars-template">
{{#each webfolder}}
{{#if folderShare}}
<li class="folder_share" depth="{{depth}}">
{{else}}
<li class="folder" depth="{{depth}}">
{{/if}}
    <p class="title" id="{{../type}}{{#replaceAll fullName '.' '-' }}{{/replaceAll}}">
		{{#if child}}
		<span class="open" evt-rol="toggle-webfolder" status="close" title="<tctl:msg key="comn.open" />"></span>
		{{/if}}
        <a  real-path="{{fullName}}" type="{{../type}}" evt-rol="viewFolderLeft" title="{{name}}"><ins class="ic"></ins><span class="txt" >{{name}}</span></a>
    </p>
{{#if child}}
    {{#equal ../../type "public"}} {{#applyTemplate "webfoler_left_sub_public_tmpl" child}}{{/applyTemplate}}{{/equal}}
    {{#equal ../../type "user"}} {{#applyTemplate "webfoler_left_sub_tmpl" child}}{{/applyTemplate}}{{/equal}}
{{/if}}
</li>
{{/each}}
 </script>
<script id="webfoler_share_left_tmpl" type="text/x-handlebars-template">
{{#each webfolder}}
{{#isArray this}}
     {{#applyTemplate "webfoler_left_sub_share_tmpl" this}}{{/applyTemplate}}
{{else}}
<li class="folder_share" depth="{{depth}}">
    <p class="title" id="share{{#replaceAll fullName '.' '-' }}{{/replaceAll}}">
		{{#if child}}
		<span class="open" evt-rol="toggle-webfolder" status="close" title="<tctl:msg key="comn.open" />"></span>
		{{/if}}
        <a real-path="{{fullName}}" sroot="{{sroot}}" user-seq="{{mailUserSeq}}" type="share" evt-rol="viewFolderLeft" title="{{name}}"><ins class="ic"></ins><span class="txt"  >{{name}}</span></a>
    </p>
{{#if child}}
    {{#applyTemplate "webfoler_left_sub_share_tmpl" child}}{{/applyTemplate}}
{{/if}}
{{/isArray}}
</li>
{{/each}}
 </script>


<script id="webfoler_left_sub_tmpl" type="text/x-handlebars-template">
{{#each this}}
<ul depth="{{depth}}">
    {{#if folderShare}}
		<li class="folder_share" depth="{{depth}}">
	{{else}}
		<li class="folder" depth="{{depth}}">
	{{/if}}
    <p class="title" id="user{{#replaceAll fullName '.' '-' }}{{/replaceAll}}">
	{{#if child}}
	<span class="open" evt-rol="toggle-webfolder" status="close" title="<tctl:msg key="comn.open" />"></span>
	{{/if}}
    <a  real-path="{{fullName}}" type="user" evt-rol="viewFolderLeft" title="{{name}}"><ins class="ic"></ins><span class="txt">{{name}}</span></a>
</p>
{{#if child}}
	{{#applyTemplate "webfoler_left_sub_tmpl" child}}{{/applyTemplate}}
{{/if}}
</li>
</ul>
{{/each}}
 </script>
<script id="webfoler_left_sub_public_tmpl" type="text/x-handlebars-template">
{{#each this}}
<ul depth="{{depth}}">
    <li class="folder" depth="{{depth}}">
    <p class="title" id="public{{#replaceAll fullName '.' '-' }}{{/replaceAll}}">
	{{#if child}}
	<span class="open" evt-rol="toggle-webfolder" status="close" title="<tctl:msg key="comn.open" />"></span>
	{{/if}}
    <a real-path="{{fullName}}" type="public" evt-rol="viewFolderLeft" title="{{name}}"><ins class="ic"></ins><span class="txt">{{name}}</span></a>
</p>
{{#if child}}{{#applyTemplate "webfoler_left_sub_public_tmpl" child}}{{/applyTemplate}}{{/if}}
</li>
</ul>
{{/each}}
 </script>
<script id="webfoler_left_sub_share_tmpl" type="text/x-handlebars-template">
{{#each this}}
<ul depth="{{depth}}">
    <li class="folder_share" depth="{{depth}}">
    <p class="title" id="share{{#replaceAll fullName '.' '-' }}{{/replaceAll}}">
	{{#if child}}
	<span class="open" evt-rol="toggle-webfolder" status="close" title="<tctl:msg key="comn.open" />"></span>
	{{/if}}
    <a real-path="{{fullName}}" sroot="{{sroot}}" user-seq="{{mailUserSeq}}" type="share" evt-rol="viewFolderLeft" title="{{name}}"><ins class="ic"></ins><span class="txt">{{name}}</span></a>
</p>
{{#if child}}{{#applyTemplate "webfoler_left_sub_share_tmpl" child}}{{/applyTemplate}}{{/if}}
</li>
</ul>
{{/each}}
 </script>
 <script id="webfoler_view_popup_tmpl" type="text/x-handlebars-template">
<table class="type_normal"> 
	<colgroup>
		<col width="40px">
		<col style="min-width:330px" width="*">
		<col width="85px">
		<col width="80px">
		<col width="130px">
	</colgroup>
	<thead>
	<tr>
		<th class="sorting_disabled">
		    <input type="checkbox" evt-rol="list-select-all" />             
		</th>
        <th class="sorting{{#equal sortby "name"}}_{{sortDir}}{{/equal}}">
            <span class="title_sort" evt-rol="sortFolderList" sort-data="name"><tctl:msg key="list.name" /><ins class="ic"></ins>
            {{#equal sortby "name"}}<span class="selected"></span>{{/equal}}
            </span>
        </th>
        <th class="sorting{{#equal sortby "size"}}_{{sortDir}}{{/equal}}">
            <span class="title_sort" evt-rol="sortFolderList" sort-data="size"><tctl:msg key="list.size" /><ins class="ic"></ins>
            {{#equal sortby "size"}}<span class="selected"></span>{{/equal}}
            </span>
        </th>
        <th class="sorting{{#equal sortby "kind"}}_{{sortDir}}{{/equal}}">
            <span class="title_sort" evt-rol="sortFolderList" sort-data="kind"><tctl:msg key="webfolder.ext" />
                <ins class="ic"></ins>
                {{#equal sortby "kind"}}<span class="selected"></span>{{/equal}}
            </span>
        </th>
        <th class="sorting{{#equal sortby "date"}}_{{sortDir}}{{/equal}}">
            <span class="title_sort" evt-rol="sortFolderList" sort-data="date"><tctl:msg key="list.date" /><ins class="ic"></ins>
            {{#equal sortby "date"}}<span class="selected"></span>{{/equal}}
            </span>
        </th>
	</tr>
	</thead>
</table>
<div class="div_scroll">
	<table class="type_normal">
		<colgroup>
			<col width="40px">
			<col style="min-width:330px" width="*">
			<col width="85px">
			<col width="80px">
			<col width="130px">
		</colgroup>
		<tbody id="viewFolderBody">
		{{#notEqual type "share"}}
		{{#unless root}} 
 			<tr>
				<td></td>
				<td colspan="4"><span class="btn_txt" evt-rol="preFolder"  type="{{type}}" user-seq="{{../userSeq}}" sroot="{{../sroot}}" node-num="{{nodeNum}}" ppath="{{ppath}}">..(<tctl:msg key="webfolder.up.tilte" />)</span></td>
			</tr>
		{{/unless}}
		{{/notEqual}}
		{{#each folders}}
			<tr fid="{{folderName}}" isChild="{{child}}" isShare="{{share}}">
 				<td><input type="checkbox" data-postid="2"  evt-rol="list-select" folder-type="{{../type}}" user-seq="{{../userSeq}}" sroot="{{../sroot}}"  real-path="{{realPath}}"></td>
				<td colspan="4" type="{{../type}}" user-seq="{{../userSeq}}" sroot="{{../sroot}}"  real-path="{{realPath}}" node-number="{{nodeNumber}}">
					<ins class="ic_side ic_folder"></ins>
  					<a><span class="folder_name" evt-rol="viewFolder">{{folderName}}</span></a>
 				</td>
			</tr>
		{{/each}} 
		{{#empty messages}}
     	{{#empty folders}}
 		{{#empty keyWord}}
      		<tr>
                <td colspan="5">
	                <p class="data_null">
	                    <span class="ic_data_type ic_no_data"></span>
	                    <span class="txt"><tctl:msg key="webfolder.file.empty.title" /></span>
	                </p>
                </td>
			</tr>   
		{{/empty}}    
		{{/empty}}    
		{{#if keyWord}}
			<tr>
				<td colspan="5">
					<p class="data_null"><tctl:msg key="webfolder.nosearch" /></p>
				</td>
			</tr>
		{{/if}}
		{{/empty}}
		</tbody>
	</table>
</div>
 </script>
                
<script id="webfoler_view_tmpl" type="text/x-handlebars-template">
<colgroup>
	<col width="40px">
	<col style="min-width:330px" width="*">
	<col width="100px">
	<col width="80px">
	<col width="130px">
</colgroup>
<thead>
	<tr>
		<th class="sorting_disabled check">
			<input type="checkbox"  class=""  evt-rol="list-select-all" />             
		</th>
		<th class="sorting{{#equal sortby "name"}}_{{sortDir}}{{/equal}}">
			<span class="title_sort" evt-rol="sortFolderList" sort-data="name">
				<tctl:msg key="list.name" /><ins class="ic"></ins>
				{{#equal sortby "name"}}<span class="selected"></span>{{/equal}}
			</span>
		</th>
		<th class="sorting{{#equal sortby "size"}}_{{sortDir}}{{/equal}}">
			<span class="title_sort" evt-rol="sortFolderList" sort-data="size">
				<tctl:msg key="list.size" /><ins class="ic"></ins>
				{{#equal sortby "size"}}<span class="selected"></span>{{/equal}}
   			</span>
		</th>
		<th class="sorting{{#equal sortby "kind"}}_{{sortDir}}{{/equal}}">
			<span class="title_sort" evt-rol="sortFolderList" sort-data="kind">
				<tctl:msg key="webfolder.ext" />
				<ins class="ic"></ins>
				{{#equal sortby "kind"}}<span class="selected"></span>{{/equal}}
			</span>
		</th>
		<th class="sorting{{#equal sortby "date"}}_{{sortDir}}{{/equal}}">
 			<span class="title_sort" evt-rol="sortFolderList" sort-data="date">
				<tctl:msg key="list.date" /><ins class="ic"></ins>
				{{#equal sortby "date"}}<span class="selected"></span>{{/equal}}
			</span>
		</th>
	</tr>
</thead>
<tbody id="viewFolderBody">					   	
	{{#notEqual type "share"}}	 
	{{#unless root}} 
	<tr>
		<td></td>
		<td colspan="4"><span class="btn_txt" evt-rol="preFolder"  type="{{type}}" user-seq="{{../userSeq}}" sroot="{{../sroot}}" node-num="{{nodeNum}}" ppath="{{ppath}}">..(<tctl:msg key="webfolder.up.tilte" />)</span></td>
	</tr>
	{{/unless}}
	{{/notEqual}}
	{{#each folders}}
	<tr fid="{{folderName}}" isChild="{{child}}" isShare="{{share}}">
		<td type="{{../type}}">
			<input type="checkbox" data-postid="2"  evt-rol="list-select" folder-type="{{../type}}" user-seq="{{../userSeq}}" sroot="{{../sroot}}"  real-path="{{realPath}}" node-number="{{nodeNumber}}" shared-user-count="{{sharedUserCount}}">
		</td>
		<td colspan="4"  type="{{../type}}" user-seq="{{../userSeq}}" sroot="{{../sroot}}"  real-path="{{realPath}}" node-number="{{nodeNumber}}" shared-user-count="{{sharedUserCount}}">
			<ins class="ic_side ic_folder"></ins>
			<a><span class="folder_name" evt-rol="viewFolder">{{folderName}}</span></a>
			{{#equal privil 'W'}}
			<span class="btn_fn7" evt-rol="editFolderView"><span class="txt"><tctl:msg key="webfolder.rename" /></span></span>
			{{/equal}}
			{{#equal ../type "user"}}
			<span class="btn_fn7"><span class="txt" evt-rol="showShareFolderList">{{#if sharedUserCount}}<tctl:msg key="webfolder.share.name" />{{sharedUserCount}}<tctl:msg key="webfolder.share.user.count.title" />{{else}}<tctl:msg key="webfolder.share.add.title" />{{/if}}</span></span>
			{{/equal}}
		</td>
	</tr>
	{{/each}}
	{{#each messages}}
	<tr uid="{{id}}" type="{{../type}}" path="{{../path}}" sroot="{{../sroot}}" userSeq="{{../userSeq}}">
		<td><input type="checkbox" data-postid="5"  evt-rol="list-select"></td>
		<td>
			<a href="javascript:;" evt-rol="downloadFile"><span class="file_name" evt-rol="downloadFile">{{subject}} </span></a>
			{{#if ../useHtmlConverter}}
				{{#acceptConverter webFolderFileExt}}
				<a href="javascript:;" evt-rol="previewFile"><span class="btn_fn7"><span class="txt" evt-rol="previewFile"><tctl:msg key="mail.preview"/></span></span></a>
				{{/acceptConverter}}
			{{/if}}
			<a href="javascript:;" evt-rol="downloadFile"><span class="btn_fn7"><span class="txt" evt-rol="downloadFile"><tctl:msg key="file.download.title" /></span></span></a>
		</td>
		<td><span class="size">{{#formatSize webFolderFileSize}}{{/formatSize}}</span></td>
     	<td>{{webFolderFileExt}}</td>
        <td><span class="date">{{printFormatDate webFolderFileUtcDate 'YYYY.MM.DD'}}</span></td>
	</tr>
	{{/each}}
	{{#empty messages}}
	{{#empty folders}}
	{{#empty keyWord}}
	<tr>
		<td colspan="5">
			<p class="data_null">
				<span class="ic_data_type ic_no_data"></span>
				<span class="txt"><tctl:msg key="webfolder.file.empty.title" /></span>
			</p>
		</td>
	</tr>   
	{{/empty}}    
	{{/empty}}    
	{{#if keyWord}}
		<td colspan="5">
  			<p class="data_null"><tctl:msg key="webfolder.nosearch" /></p>
   		</td>
	{{/if}}           
	{{/empty}}
</tbody>
 </script>
 <script id="webfoler_view_page_tmpl" type="text/x-handlebars-template">
    {{#each messages}}
        <tr uid="{{id}}" type="{{../type}}" path="{{../path}}" sroot="{{../sroot}}" userSeq="{{../userSeq}}">
             <td><input type="checkbox" data-postid="5"  evt-rol="list-select"></td>
             <td>
                 <a href="javascript:;" evt-rol="downloadFile"><span class="file_name" evt-rol="downloadFile">{{subject}} </span></a>
                 {{#if ../useHtmlConverter}}
                 {{#acceptConverter webFolderFileExt}}
                 <a href="javascript:;" evt-rol="previewFile"><span class="btn_fn7"><span class="txt" evt-rol="previewFile"><tctl:msg key="mail.preview"/></span></span></a>
                 {{/acceptConverter}}
                 {{/if}}
                 <a href="javascript:;" evt-rol="downloadFile"><span class="btn_fn7"><span class="txt" evt-rol="downloadFile"><tctl:msg key="file.download.title" /></span></span></a>
             </td>
             <td><span class="size">{{#formatSize webFolderFileSize}}{{/formatSize}}</span></td>
             <td>{{webFolderFileExt}}</td>
             <td><span class="date">{{printFormatDate webFolderFileUtcDate 'YYYY.MM.DD'}}</span></td>
        </tr>
     {{/each}}
 </script>
 
  <script id="webfoler_view_popup_page_tmpl" type="text/x-handlebars-template">
	{{#each messages}}
		</tr>
			<tr uid="{{id}}" type="{{../type}}" path="{{../path}}" sroot="{{../sroot}}" userSeq="{{../userSeq}}">
				<td class="check"><input type="checkbox" data-postid="5"  evt-rol="list-select"></td>
				<td class="subject">
					<a><span class="file_name" evt-rol="downloadFile">{{subject}} </span></a>
				</td>
				<td class="size"><span class="size">{{#formatSize webFolderFileSize}}{{/formatSize}}</span></td>
				<td class="file">{{webFolderFileExt}}</td>
				<td class="date"><span class="date">{{printFormatDate webFolderFileUtcDate 'YYYY.MM.DD'}}</span></td>
		</tr>
	{{/each}}
	
 </script>
 
<script id="webfoler_edit_folder_tmpl" type="text/x-handlebars-template">
<ins class="ic_side ic_folder"></ins>
<span class="txt_edit"><input type="text" id="rfName" class="txt_mini wfix_max edit" value="{{folderName}}" folder-name="{{folderName}}"></span>
<span class="btn_fn7" evt-rol="editFolder" ><span class="txt"><tctl:msg key="button.ok" /></span></span>
<span class="btn_fn7" evt-rol="editFolderViewCancel"  folder-name="{{folderName}}" type="{{type}}" real-path="{{realPath}}" node-number="{{nodeNumber}}"><span class="txt"><tctl:msg key="button.cancel" /></span></span>
<span style="display:none;" class="error_msg">
    <ins class="ic ic_"></ins>
    <span class="txt"><tctl:msg key="alert.slashfolder" /></span>
</span>
 </script>
 
<script id="webfolder_edit_tmpl" type="text/x-handlebars-template">
<ins class="ic_side ic_folder"></ins>
<a><span class="folder_name" evt-rol="viewFolder">{{folderName}}</span></a>
<span class="btn_fn7" evt-rol="editFolderView"><span class="txt"><tctl:msg key="webfolder.rename" /></span></span>
{{#equal "user" type}}
<span class="btn_fn7"><span class="txt" evt-rol="showShareFolderList">{{#if sharedUserCount}}<tctl:msg key="webfolder.share.name" />{{sharedUserCount}}<tctl:msg key="webfolder.share.user.count.title" />{{else}}<tctl:msg key="webfolder.share.add.title" />{{/if}}</span></span>
{{/equal}}
 </script>
<script id="webfoler_left_quot_tmpl" type="text/x-handlebars-template">
	<h1>
		<ins class="ic"></ins>
		{{#equal type "public"}}<tctl:msg key="webfolder.public.quota.info.title" />{{/equal}}{{#equal type "user"}}<tctl:msg key="webfolder.private.quota.info.title" />{{/equal}}{{#equal type "share"}}<tctl:msg key="webfolder.share.quota.info.title" />{{/equal}}
	</h1>
	<span class="gage_wrap">
		<span class="gage" style="width:{{quotaUsagePercent}}%"></span>
	</span>
 	<span class="num"><tctl:msg key="webfolder.usage" />&nbsp;<strong>{{quotaUsage}}</strong>/{{quotaLimit}}</span>
</script>
 
<script id="webfoler_header_title_tmpl" type="text/x-handlebars-template">
<span class="txt">
{{#equal "user" type}}
    {{#unless root}}
        {{currentPath}}
    {{else}}
        <tctl:msg key="webfolder.title" />
    {{/unless}}
{{/equal}}
{{#equal "public" type}}
    {{#unless root}}
        {{currentPath}}
     {{else}}
       <tctl:msg key="webfolder.public.title" />         
    {{/unless}}
{{/equal}}
{{#equal "share" type}}
{{currentPath}}
{{/equal}}

{{#equal "user" type}}
</span>
{{#unless root}}

<span class="action">
    <a class="btn_fn6" evt-rol="showShareFolderList" real-path="{{realPath}}" type="user">
        <span class="ic_con ic_share"></span>
        <span class="txt"><tctl:msg key="webfolder.share.name" />{{#if sharedUserCount}} {{sharedUserCount}}<tctl:msg key="webfolder.share.user.count.title" />{{/if}}</span>                      
    </a>
</span>

{{/unless}}
{{/equal}}
 </script>

<script id="webfolder_navi_tmpl" type="text/x-handlebars-template">
	{{#with pageInfo}}
	<div id="pageNaviWrap" class="dataTables_paginate paging_full_numbers {{#if out}}paging_out{{/if}}" style="{{#if out}}border-top:0px;{{/if}}" data-pagebase="{{../pageBase}}" data-total="{{total}}">
		<a tabindex="0" class="first paginate_button {{#if firstWindow}}paginate_button_disabled{{/if}}" {{#unless firstWindow}}page="{{preWindow}}" evt-rol="list-page-move"{{/unless}} title="<tctl:msg key="comn.page.first" />"></a>
		<a tabindex="0" class="previous paginate_button {{#if firstPage}}paginate_button_disabled{{/if}}" {{#unless firstPage}}page="{{prePage}}" evt-rol="list-page-move"{{/unless}} title="<tctl:msg key="comn.page.pre" />"></a>
		<span>
		{{#each pages}}
		<a tabindex="0" {{#equal ../page this}}class="paginate_active"{{else}}class="paginate_button"{{/equal}} page="{{printThis this}}">{{printThis this}}</a>
			{{/each}}
	</span>
		<a tabindex="0" class="next paginate_button {{#if lastPage}}paginate_button_disabled{{/if}}" {{#unless lastPage}}page="{{nextPage}}" evt-rol="list-page-move"{{/unless}} title="<tctl:msg key="comn.page.next" />"></a>
		<a tabindex="0" class="last paginate_button {{#if lastWindow}}paginate_button_disabled{{/if}}" {{#unless lastWindow}}page="{{nextWindow}}" evt-rol="list-page-move"{{/unless}} title="<tctl:msg key="comn.page.end" />"></a>
	</div>
	{{/with}}
</script>

 
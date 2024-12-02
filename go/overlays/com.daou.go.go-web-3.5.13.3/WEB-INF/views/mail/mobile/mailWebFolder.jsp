<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="webfolder_content" class="go_content" style="display:none;left: 0px; z-index: 3000; margin-top: 0px;">
    <div id="mailWebFolderSelectToolbarWrap" class="nav con_nav check_nav" style="display:none;">
        <div class="critical">
            <a href="javascript:;" evt-rol="checked-webfolder-cancel"><span class="ic_nav ic_nav_cancel"></span></a>
            <span class="count"></span>
        </div>
        <div class="optional">
            <ul class="toolbar_list">
                <li>
                    <a id="select-all" href="javascript:;" evt-rol="select-webfolder-all"><tctl:msg
                            key="mail.select.all"/></a>
                </li>
                <li>
                    <a evt-rol="attach-webfolder" href="javascript:;"><tctl:msg key="mail.attachment"/></a>
                </li>
            </ul>
        </div>
    </div>
    <div id="mailWebSubFolderToolbarWrap" class="nav con_nav webFolderHeader">
        <h1></h1>
        <div class="critical">
            <a href="javascript:;" id="moveParentWebFolder" evt-rol="move-parent-webfolder"><span
                    class="ic_nav ic_nav_prev"></span></a>
        </div>
        <div class="optional">
            <ul class="toolbar_list">
                <li>
                    <a href=""></a>
                </li>
            </ul>
        </div>
    </div>
    <div id="mailWebFolderHomeToolbarWrap" class="nav con_nav webFolderHeader">
        <h1 id="title"><tctl:msg key="webfolder.title.01"/></h1>
        <div class="critical">
            <a href="javascript:;" evt-rol="choose-webfolder-cancel"><span class="ic_nav ic_nav_cancel"></span></a>
        </div>
    </div>
    <div class="go_body">
        <div class="go_content" style="left:0">
            <div class="content_page">
                <div class="content">
                    <select id="webFolderDirectory">
                        <option value="user" data-type="user"><tctl:msg key="webfolder.title"/></option>
                        <option data-type="public"><tctl:msg key="webfolder.public.title"/></option>
                    </select>
                    <ul class="list_file" id="webfolder_list">
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<script id="webfolder_content_tmpl" type="text/x-handlebars-template">
    {{#each folders}}
    <li>
        <a href="javascript:;" evt-rol="move-sub-webfolder" data-type="{{../type}}" data-userseq="{{../userSeq}}"
           data-sroot="{{../sroot}}" data-full-path="{{realPath}}" data-node-num="{{nodeNumber}}">
            <span class="item_file">
                <span class="ic_file ic_folder"></span>
                <span class="subject">{{folderName}}</span>
            </span>
        </a>
    </li>
    {{/each}}
    {{#each messages}}
    <li>
        <a href="javascript:;" evt-rol="select-webfolder">
            <span class="item_file">
                {{#equal webFolderFileExt "ppt"}}
                <span class="ic_file ic_file_ppt"></span>
                {{else}}
                <span class="ic_file ic_{{webFolderFileExt}}"></span>
                {{/equal}}
                <span class="subject">{{subject}}</span>
                <span class="info">
                    <span class="date">{{printFormatDate webFolderFileUtcDate 'YYYY.MM.DD'}}</span>
                    <span class="part">|</span>
                    <span class="size" data-size="{{webFolderFileSize}}">{{#formatSize webFolderFileSize}}{{/formatSize}}</span>
                </span>
            </span>
        </a>
        <input type="checkbox" data-uid="{{id}}">
    </li>
    {{/each}}
</script>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<script id="mail_list_content_tmpl" type="text/x-handlebars-template">
    <ul id="mail_list_area" class="list_normal list_mail">
        {{#if messageList}}
        {{#each messageList}}
        <li id="{{folderEncName}}_{{id}}" class="{{#if seen}} {{else}}read_no{{/if}}" folder="{{folderEncName}}"
            uid="{{id}}">
            <input type="checkbox" name="msgId" value="{{id}}" data-femail="{{fromEscape}}" data-temail="{{toEscape}}"/>
            <span evt-rol="check-checkbox" class="checkboxSelect">&nbsp;</span>
            <a class="tit" href="javascript:;" data-list-id="{{id}}" {{#notEqual ../folderType
            'quotaviolate'}}evt-rol="{{#equal ../../folderType
            'drafts'}}draft-message{{else}}read-message{{/equal}}{{/notEqual}}">
            <span class="vertical_wrap txt_ellipsis">
					{{flagClassMobile flag}}
					<span class="name">
						{{#equal ../folderType 'all'}}
							{{folderDepthName folderDepthName}}
						{{else}}
							{{#if ../../../exceptFolder}}
								{{#empty sendToSimple}}
									(<tctl:msg key="mail.to.empty"/>)
								{{else}}
									{{sendToSimple}}
								{{/empty}}
							{{else}}
								{{fromToSimple}}
							{{/if}}
						{{/equal}}
					</span>
				</span>
            <span class="subject txt_ellipsis">
					{{#equal priority 'HIGH'}}<span class="ic ic_exclamation"></span>{{/equal}}
					{{#contains flag 'T'}}<span class="ic ic_attach" title="<tctl:msg key="mail.attach"/>"></span>{{/contains}}
					{{#each tagList}}
						<span class="ic_tag {{color}}"><span class="tail_r"><span></span></span></span>
					{{/each}}
					<span class="title">
						{{#equal subject ""}}
							<tctl:msg key="header.nosubject"/>
						{{else}}
							{{#if ../../../exceptFolder}}
								{{subject}}
							{{else}}
								{{#lessThen spamRate 0}}<strike>{{subject}}<strike>{{else}}{{subject}}{{/lessThen}}
							{{/if}}
						{{/equal}}
					</span>
				</span>
            </a>
            <div class="optional">
                <span class="date">{{#equal ../folderType 'sent'}}{{printMdnListDate sentDateUtc}}{{else}}{{printMdnListDate dateUtc}}{{/equal}}</span>
                <a href="javascript:;" tap-rol="switch-flag" class="flagClass"><span flag="F" {{#contains flag
                    'F'}}flaged="on" class="ic ic_important_on"{{else}}flaged="off" class="ic
                    ic_important_off"{{/contains}}></span></a>
            </div>
        </li>
        {{/each}}
        {{else}}
        <li class="creat data_null">
		<span class="subject">
			<span class="txt">
				{{#if search}}
					<tctl:msg key="alert.addr.search.noresult"/>
				{{else}}
					<tctl:msg key="mail.notexist"/>
				{{/if}}
			</span>
		</span>
        </li>
        {{/if}}
    </ul>
    {{#if messageList}}
    {{#applyTemplate "mail_list_paging_tmpl" pageInfo}}{{/applyTemplate}}
    {{/if}}
</script>

<script id="mail_read_content_tmpl" type="text/x-handlebars-template">
    <style type="text/css">
        p.MsoListParagraph {
            text-indent: 0px !important;
        }
    </style>
    <div style="position:relative">
        <div id="contentBox">
            <div>
                {{#with msgContent}}
                <section id="mailViewContentWrap" class="classic_detail mail_view">
                    <input type="hidden" id="folderName" name="folderName" value="{{folderFullName}}"/>
                    <input type="hidden" id="msgUid" name="uid" value="{{uid}}"/>
                    <input type="hidden" id="messageListId" value="{{folderEncName}}_{{uid}}"/>
                    <header class="article_header">
                        <h2>
                            {{#equal priority 'HIGH'}}<span class="ic ic_exclamation"></span>{{/equal}}
                            <span id="readSubject" class="title">
				{{#equal subject ""}}
					<tctl:msg key="header.nosubject"/>
				{{else}}
					{{subject}}
				{{/equal}}
			</span>
                            <span class="btn_wrap">
				<span id="readTagWrap"></span>
				<a href="javascript:;" evt-rol="switch-flag-read" flag="F">
					<span id="readFlagedFlagIcon" {{#if flaged}}flaged="on" class="ic ic_important_on"
                          {{else}}flaged="off" class="ic ic_important_off" {{/if}}></span>
                            </a>
                            </span>
                        </h2>
                        <div class="list_report_wrap">
                            <table class="list_report">
                                <tbody>
                                <tr>
                                    <th class="default_info">
                                        <span class="title"><tctl:msg key="mail.from"/></span>
                                    </th>
                                    <td>
                                        <ul class="name_tag">
                                            <li email="{{from}}">
									<span class="name" evt-rol="layer-write-email">
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
                                </tbody>
                            </table>
                            <!-- 열기 버튼 -->
                            <a href="javascript:;" evt-rol="mail-read-toggle-sender-list">
				<span class="btn_more" style="top:5px;">
					{{#if ../isRcptShow}}
						<span class="ic_arrow2_up"></span>
					{{else}}
						<span class="ic_arrow2_down"></span>
					{{/if}}
                    <!-- 닫기 버튼 -->
                    <!-- <span class="ic_arrow2_down" evt-rol="mail-read-open-sender-list"></span> -->
				</span>
                            </a>
                            <div class="wrap_fontsize" id="fontResizeWrap" style="display:none">
                                <a href="javascript:;" class="btn_fontsize" evt-rol="mail-read-font-resize">
                                    <span class="ic ic_text_range"></span>
                                </a>
                                <div id="fontResizeLayer" class="wrap_range wrap_range_fs" style="display:none">
                                    <span class="fs">T</span>
                                    <ul class="list_fs">
                                        <li><input type="radio" id="inpFont13" name="inpFont" class="inp_fs" value="0">
                                            <label class="lab_fs" for="inpFont13"></label></li>
                                        <li><input type="radio" id="inpFont16" name="inpFont" class="inp_fs" value="20">
                                            <label class="lab_fs" for="inpFont16"></label></li>
                                        <li><input type="radio" id="inpFont19" name="inpFont" class="inp_fs" value="40">
                                            <label class="lab_fs" for="inpFont19"></label></li>
                                        <li><input type="radio" id="inpFont22" name="inpFont" class="inp_fs" value="60">
                                            <label class="lab_fs" for="inpFont22"></label></li>
                                        <li><input type="radio" id="inpFont25" name="inpFont" class="inp_fs" value="80">
                                            <label class="lab_fs" for="inpFont25"></label></li>
                                        <li><input type="radio" id="inpFont28" name="inpFont" class="inp_fs"
                                                   value="100"> <label class="lab_fs" for="inpFont28"></label></li>
                                        <li><input type="radio" id="inpFont31" name="inpFont" class="inp_fs"
                                                   value="120"> <label class="lab_fs" for="inpFont31"></label></li>
                                        <li><input type="radio" id="inpFont34" name="inpFont" class="inp_fs"
                                                   value="140"> <label class="lab_fs" for="inpFont34"></label></li>
                                    </ul>
                                    <span class="fs">T</span>
                                </div>
                            </div>
                        </div>
                        <div id="mailReadSenderListWrap" class="list_report_wrap sub_report"
                             style="{{#unless ../isRcptShow}}display:none;{{/unless}}">
                            <table class="list_report">
                                <tbody>
                                <tr>
                                    <th class="default_info">
                                        <span class="title"><tctl:msg key="mail.to"/></span>
                                    </th>
                                    <td>
                                        <ul class="name_tag">
                                            {{#each toList}}
                                            <li email="{{makeEmailAddress personal address}}">
										<span class="name" evt-rol="layer-write-email">
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
                                        <ul class="name_tag">
                                            {{#each ccList}}
                                            <li email="{{makeEmailAddress personal address}}">
										<span class="name" evt-rol="layer-write-email">
											{{#empty personal}}
												{{address}}
											{{else}}
												{{#if ../../../../addressVisible}}
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
                                        <ul class="name_tag">
                                            {{#each bccList}}
                                            <li email="{{makeEmailAddress personal address}}">
										<span class="name" evt-rol="layer-write-email">
											{{#empty personal}}
												{{address}}
											{{else}}
												{{#if ../../../../addressVisible}}
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
                                        <span class="date">{{date}}</span>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        {{#if nationList}}
                        <table class="list_report">
                            <tbody>
                            <tr>
                                <th class="default_info">
                                    <span class="title"><tctl:msg key="conf.profile.83"/></span>
                                </th>
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
                    </header>

                    <!-- 첨부파일 -->
                    <div class="wrap_attach">
                        <section class="list_type5">
                            <div class="add_file">
                                {{#greateThen attachFileCount 0}}
                                <div class="add_file_header">
				<span class="subject">
					<span class="ic ic_file_s"></span>
					<strong><tctl:msg key="mail.attach"/></strong>
					<span class="num">{{../attachFileCount}}</span><tctl:msg key="mail.unit.count"/>
				</span>

                                    <a href="javascript:;" evt-rol="mail-read-toggle-attach-list">
					<span class="btn_more">
						<span class="ic_arrow2_down"></span>
					</span>
                                    </a>
                                </div>
                                {{/greateThen}}
                                <div id="mailReadAttachListWrap" style="display:none;">
                                    {{#greateThen attachFileCount 0}}
                                    <ul id="attachFileWrap" class="file_wrap">
                                        {{#each attachList}}
                                        <li part="{{path}}" class="{{#equal size 0}}deleted{{/equal}}"
                                            fileName="{{fileName}}" fileSize="{{size}}">
					<span class="item_file">
						<span class="ic_file ic_{{mobileFileIcon fileType}}"></span>
						{{#greateThen size 0}}
							{{#if ../../../../useMobileSecurityOption}}
							<a href="javascript:;" evt-rol="download-attach" evt-data="{{attachConfirm}}">
								<span class="name">{{mobileFileName fileName}}</span>
								<span class="data">{{mobileFileExt fileName}}</span>
								<span class="size">({{fsize}})</span>
							</a>
							{{else}}
							<span class="name">{{mobileFileName fileName}}</span>
							<span class="data">{{mobileFileExt fileName}}</span>
							<span class="size">({{fsize}})</span>
							{{/if}}
							<span class="optional">
								{{#ifAnd ../../../../useMobilePreviewOption ../../../../useHtmlConverter}}
									{{#acceptConverterMobile fileType}}
										<a href="javascript:;" class="wrap_ic_file wrap_ic_file_preview"
                                           evt-rol="preview-attach">
											<span class="ic ic_file_preview"></span>
										</a>
									{{/acceptConverterMobile}}
								{{/ifAnd}}

								{{#if ../../../../useMobilePreviewOption}}
								{{#isImgFile fileName}}
									{{#acceptConverter fileType}}
									<a href="javascript:;" class="wrap_ic_file wrap_ic_file_preview"
                                       evt-rol="preview-attach-image">
										<span class="ic ic_file_preview"></span>
									</a>
									{{/acceptConverter}}
								{{/isImgFile}}
								{{/if}}
								{{#if ../../../../useMobileSecurityOption}}
										<a href="javascript:;" class="wrap_ic_file" evt-rol="download-attach"
                                           evt-data="{{attachConfirm}}">
											<span class="txt ic ic_file_download"></span>
										</a>
								{{/if}}
							</span>
						{{else}}
							<span class="name">{{mobileFileName fileName}}</span>
							<span class="data">{{mobileFileExt fileName}}</span>
							<span class="size">[<tctl:msg key="mail.deleteattach"/>]</span>
						{{/greateThen}}
					</span>
                                            {{#if tnef}}
                                            <div class="dat_wrap">
                                                <div class="dat_tit">
                                                    <span class="ic_sub">ㄴ</span>
                                                    <span class="txt"><tctl:msg key="file.dat"/></span>
                                                </div>
                                                <ul class="dat_list">
                                                    {{#each tnefList}}
                                                    <li part="{{../path}}">
                                                        <a class="name" evt-rol="download-tnef-attach"
                                                           attKey="{{attachKey}}">[{{fileName}}]</a>
                                                    </li>
                                                    {{/each}}
                                                </ul>
                                            </div>
                                            {{/if}}
                                        </li>
                                        {{/each}}
                                        {{#each vcardList}}
                                        <li part="{{path}}" fileName="vcard.vcf" fileSize="{{fsize}}">
					<span class="item_file">
						<span class="ic_file ic_def"></span>
						<a href="javascript:;" evt-rol="download-attach" evt-data="{{attachConfirm}}">
							<span class="name">vcard</span>
							<span class="data">.vcf</span>
							<span class="size">({{fsize}})</span>
						</a>
						<span class="btn_wrap">
							<a href="javascript:;" evt-rol="download-attach" evt-data="{{attachConfirm}}"><span
                                    class="btn btn_filedown"></span></a>
						</span>
					</span>
                                        </li>
                                        {{/each}}
                                    </ul>
                                    {{/greateThen}}
                                    <div class="alert_wrap"><tctl:msg key="mail.attach.download.info"/></div>
                                </div>
                            </div>
                        </section>

                    </div>
                    <!-- // 첨부파일 -->

                    <article class="article_view" id="article_view"
                             style="position:relative;overflow:scroll;margin:0px;padding:0px">
                        <div id="message_view_table" style="position:relative;width:100%;">
                            <div id="mailContentWrapper" style="display:inline-block;margin:16px">
                                {{{htmlContent}}}
                            </div>
                        </div>
                    </article>
                </section>
                {{/with}}
            </div>
        </div>
    </div>
</script>

<script id="mail_write_content_tmpl" type="text/x-handlebars-template">
    <style type="text/css">
        p.MsoListParagraph {
            text-indent: 0px !important;
        }
    </style>
    <div class="option">
	<span class="option_wrap">
		<input id="receivenoti" type="checkbox" name="receivenoti" {{#if receiveNoti}}checked="checked" {{/if}}>
		<label for="receivenoti" class="txt"><tctl:msg key="menu.receivenoti"/></label>
	</span>
        <span class="option_wrap">
		<input id="onesend" type="checkbox" name="onesend">
		<label for="onesend" class="txt"><tctl:msg key="menu.onesend"/></label>
	</span>
        <input type="hidden" id="useHtmlConverter" value="{{useHtmlConverter}}"/>
        <input type="hidden" id="useMobilePreviewOption" value="{{useMobilePreviewOption}}"/>
    </div>
    <form onsubmit="return false;">
        <fieldset>
            <table id="mail_write_table" class="form_type tb_mail_write">
                <tbody>
                <tr>
                    <th><span class="title"><tctl:msg key="mail.to"/></span></th>
                    <td>
                        <div class="div_ipt_wrap">
                            <!-- name_tag in input -->
                            <div id="toAddrWrap" class="div_ipt">
                                <ul class="name_tag">
                                    <li class="creat creat_block">
                                        <div class="addr_input">
                                            <textarea type="text" id="to" name="to"></textarea>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <span class="option_wrap">
							<input id="writeMyself" type="checkbox" evt-rol="write-myself">
							<label for="writeMyself" class="txt"><tctl:msg key="mail.myself"/></label>
						</span>
                        <span class="optional_bottom">
							<span class="btn_wrap">
								<a id="toggle_ccbcc_link" href="javascript:;" evt-rol="write-toggle-ccbcc">
									<span class="ic ic_plus"></span>
									<span class="txt"><tctl:msg key="mail.cc"/>/<tctl:msg key="mail.bcc"/></span>
								</a>
							</span>
						</span>
                    </td>
                </tr>
                <tr class="ccbccWrap">
                    <th><span class="title"><tctl:msg key="mail.cc"/></span></th>
                    <td>
                        <div class="div_ipt_wrap">
                            <div id="ccAddrWrap" class="div_ipt">
                                <ul class="name_tag">
                                    <li class="creat creat_block">
                                        <div class="addr_input">
                                            <textarea type="text" id="cc" name="cc"></textarea>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr class="ccbccWrap">
                    <th><span class="title"><tctl:msg key="mail.bcc"/></span></th>
                    <td>
                        <div class="div_ipt_wrap">
                            <!-- name_tag in input -->
                            <div id="bccAddrWrap" class="div_ipt">
                                <ul class="name_tag">
                                    <li class="creat creat_block">
                                        <div class="addr_input">
                                            <textarea type="text" id="bcc" name="bcc"></textarea>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <th><span class="title"><tctl:msg key="mail.subject"/></span></th>
                    <td>
                        <div class="ipt_wrap"><input id="subject" class="input w_max" type="text" value="{{subject}}">
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="ipt_wrap">
                            {{#contains sendFlag 'forward'}}
                            <textarea id="content" name="content"
                                      placeholder="<tctl:msg key="mail.mobile.write.content"/>"></textarea>
                            <textarea id="forwardOrgText" name="forwardOrgText"
                                      style="width:0px;height:0px;display:none;"><br>{{htmlContent}}</textarea>
                            {{else}}
                            {{#contains sendFlag 'reply'}}
                            <textarea id="content" name="content"
                                      placeholder="<tctl:msg key="mail.mobile.write.content"/>"></textarea>
                            <textarea id="replyOrgText" name="replyOrgText"
                                      style="width:0px;height:0px;display:none;"><br>{{htmlContent}}</textarea>
                            {{else}}
                            <textarea id="content" name="content"
                                      placeholder="<tctl:msg key="mail.mobile.write.content"/>">{{textContent}}</textarea>
                            {{/contains}}
                            {{/contains}}
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" class="display_option display_position">
                        <div class="btn_wrap wrap_btn_attach critical">
                            {{#if isAndroidApp}}
                            <a href="javascript:;" data-bypass evt-rol="attach-file"><span
                                    class="btn btn_attach_file"></span></a>
                            <a href="javascript:;" evt-rol="attach-photo"><span class="btn btn_attach_photo"></span></a>
                            {{else}}
                            <span class="wrap_btn">
                                <span class="btn btn_attach_file"></span>
                                <input evt-rol="attach-image" class="btn_attach" type="file" multiple
                                       style="position:absolute;right:0;top:0;width:40px;height:40px;opacity:0"
                                       name="file">
                            </span>
                            {{/if}}
                            <!-- 자료실첨부 -->
                            {{#if isWebFolderUsable}}
                            <div class="btn_wrap">
                                <a id="writeWebfolderBtn" evt-rol="open-write-webfolder" href="javascript:;">
                                    <span class="btn btn_attach_folder"></span>
                                </a>
                            </div>
                            {{/if}}
                        </div>
                        <div class="option_display" id="attach_wrap" style="margin-top:50px;">
                            <ul id="file_wrap" class="file_wrap">
                                {{#if attaches}}
                                {{#each attaches}}
                                <li orgname="{{upkey}}" filename="{{name}}" filesize="{{size}}" hostid="{{hostId}}">
									<span class="item_file">
										<span class="ic_file ic_{{mobileFileIcon name}}"></span>
										<span class="name">{{name}}</span>
										<span class="size">({{printSize size}})</span>
										<span class="optional">
											<a href="javascript:;" class="btn_fn4" evt-rol="delete-attach">
												<span class="txt ic ic_file_del"></span>
											</a>
										</span>
									</span>
                                </li>
                                {{/each}}
                                {{/if}}
                            </ul>
                            <ul id="file_wrap" class="file_wrap"></ul>
                            <ul id="img_wrap" class="img_wrap"></ul>
                        </div>
                    </td>
                </tr>
                <tr id="signWrap" style="display:none;">
                    <th><span class="title"><tctl:msg key="mail.sign"/></span></th>
                    <td id="signListWrap" data-attach="{{signAttach}}"></td>
                </tr>

                {{#contains sendFlag 'forward'}}
                <tr>
                    <td colspan="2">
                        <div class="box_type1 wrap_originalMassage" style="overflow-x:auto">
                            {{{htmlContent}}}
                        </div>
                    </td>
                </tr>
                {{else}}
                {{#contains sendFlag 'reply'}}
                <tr>
                    <td colspan="2">
                        <div class="box_type1 wrap_originalMassage" style="overflow-x:auto">
                            {{{htmlContent}}}
                        </div>
                    </td>
                </tr>
                {{/contains}}
                {{/contains}}

                </tbody>
            </table>
        </fieldset>
    </form>
</script>

<script id="mail_mdn_list_content_tmpl" type="text/x-handlebars-template">
    <ul id="mail_mdn_list_area" class="mail_mdn_list_area list_normal list_mail">
        {{#if mdnList}}
        {{#each mdnList}}
        <li id="{{folder}}_{{id}}">
            <input type="checkbox" name="msgId" value="{{messageId}}"/>
            <span evt-rol="check-checkbox" class="checkboxSelect" data-type="mdn">&nbsp;</span>
            <a class="tit" data-list-id="{{messageId}}" href="javascript:;" {{#greateThen mdnCount 0}}evt-rol="mdn-read"
               {{/greateThen}} messageId="{{messageId}}" subject="{{subject}}" date="{{dateUtc}}">
            <span class="vertical_wrap txt_ellipsis">
						<span class="name">{{#notEmpty personal}}{{personal}}{{else}}{{emailName to}}{{/notEmpty}}</span>
					</span>
            <span class="subject txt_ellipsis">
						<span class="title">
							{{#equal subject ""}}
								<tctl:msg key="header.nosubject"/>
							{{else}}
								{{subject}}
							{{/equal}}
						</span>
					</span>
            </a>

            <div class="optional">
                <span class="date">{{printMdnListDate dateUtc}}</span>
                {{#lessThen mdnCount 0}}
                <span class="status">
							<tctl:msg key="mail.mdn.notselect"/>
						</span>
                {{/lessThen}}
                {{#equal mdnCount 1}}
                <span class="status">
						{{makeMdn mdnCode mdnTimeUtc}}
						</span>
                {{/equal}}
                {{#greateThen mdnCount 1}}
                <span class="count">
						{{mdnReadCount}}/{{mdnCount}}
						</span>
                {{/greateThen}}
            </div>
        </li>
        {{/each}}
        {{else}}
        <li class="creat data_null">
            <span class="subject"><span class="txt"><tctl:msg key="mail.notexist"/></span></span>
        </li>
        {{/if}}
    </ul>
    {{#if mdnList}}
    {{#applyTemplate "mail_list_paging_tmpl" pageInfo}}{{/applyTemplate}}
    {{/if}}
</script>

<script id="mail_mdn_read_tmpl" type="text/x-handlebars-template">
    <section class="classic_detail">
        <header class="article_header">
            <h2>
                {{#equal subject ""}}
                <tctl:msg key="header.nosubject"/>
                {{else}}
                {{subject}}
                {{/equal}}
            </h2>
            <div class="article_wrap">
                <div><span class="txt">{{printReadDate dateUtc}}</span></div>
            </div>
        </header>
        <input type="hidden" id="mdnReadUid" value="{{uid}}"/>
        <input type="hidden" id="mdnMessageId" value="{{messageId}}"/>
        <input type="hidden" id="mdnMessageSubject" value="{{subject}}"/>
        {{#if rcptList}}
        <ul id="mail_mdn_read_area" class="list_normal list_recept">
            {{#each rcptList}}
            <li>
                <span class="name">{{emailName printAddress}}</span>
                <span class="status">{{printMdnReadMessage message}} <strong>[{{status}}]</strong></span>
                {{#isMdnCheck localDomain code}}
                <div class="btn_wrap">
                    <a class="btn_type2" href="javascript:;" evt-rol="recall-mdn" addr="{{address}}"><span
                            class="txt"><tctl:msg key="mail.mdn.recall"/></span></a>
                </div>
                {{/isMdnCheck}}
            </li>
            {{/each}}
        </ul>
        {{/if}}
    </section>
    {{#if rcptList}}
    {{#applyTemplate "mail_list_paging_tmpl" pageInfo}}{{/applyTemplate}}
    {{/if}}
</script>

<script id="mail_send_content_tmpl" type="text/x-handlebars-template">
    <div class="notice">
        <span class="ic_notice {{#if sendError}}ic_notice_error{{else}}ic_notice_mail{{/if}}"></span>
        <h2 class="title">
            {{#if sendError}}
            <tctl:msg key="mail.send.fail"/>
            {{else}}
            {{#equal sendType "draft"}}
            <tctl:msg key="mail.drafts.success"/>
            {{else}}
            <tctl:msg key="mail.send.success"/>
            {{/equal}}
            {{/if}}
        </h2>
        <p class="desc">
            {{#if sendError}}
            {{#unless saveError}}
            <tctl:msg key="mail.drafts.success"/><br/>
            {{/unless}}
            {{trimErrorMessage}}
            {{else}}
            {{#notEmpty saveFolderName}}
            <tctl:msg key="mail.send.success.msg" arg0="{{saveFolderName}}"/>
            {{/notEmpty}}
            {{/if}}
        </p>
        <div class="page_action_wrap">
            {{#if sendError}}
            <a href="javascript:;" fname="Drafts" evt-rol="folder">
				<span data-role="button" class="btn_minor">
					<span class="txt"><tctl:msg key="folder.drafts"/></span>
				</span>
            </a>
            <a href="javascript:;" fname="Inbox" evt-rol="folder">
				<span data-role="button" class="btn_minor">
					<span class="txt"><tctl:msg key="folder.inbox"/></span>
				</span>
            </a>
            {{else}}
            {{#equal sendType "draft"}}
            <a href="javascript:;" fname="Drafts" evt-rol="folder">
					<span data-role="button" class="btn_minor">
						<span class="txt"><tctl:msg key="folder.drafts"/></span>
					</span>
            </a>
            <a href="javascript:;" fname="Inbox" evt-rol="folder">
					<span data-role="button" class="btn_minor">
						<span class="txt"><tctl:msg key="folder.inbox"/></span>
					</span>
            </a>
            {{else}}
            <a href="javascript:;" fname="Inbox" evt-rol="folder">
					<span data-role="button" class="btn_minor">
						<span class="txt"><tctl:msg key="folder.inbox"/></span>
					</span>
            </a>
            <a href="javascript:;" fname="Sent" evt-rol="folder">
					<span data-role="button" class="btn_minor">
						<span class="txt"><tctl:msg key="folder.sent"/></span>
					</span>
            </a>
            {{/equal}}
            {{/if}}
        </div>
    </div>
</script>

<script id="mail_tag_tmpl" type="text/x-handlebars-template">
    {{#each this}}
    <li>
        <a href="javascript:;" evt-rol="tag-message" val="{{id}}">
		<span class="btn_wrap">
			<span class="ic_tag {{color}}"><span class="tail_r"><span></span></span></span>
			<span class="txt_ellipsis">{{name}}</span>
		</span>
        </a>
    </li>
    {{/each}}
</script>

<script id="mail_bookmark_tmpl" type="text/x-handlebars-template">
    {{#each this}}
    <li seq="{{bookmarkSeq}}" query="{{bookmarkValue}}" type="{{bookmarkType}}">
        <a href="javascript:;" evt-rol="bookmark-execute">
			<span class="btn_wrap">
				<span class="{{mobileBookmarkCss bookmarkType bookmarkValue}}"><span class="tail_r"><span></span></span></span>
				<span class="txt_ellipsis">{{displayBookmark bookmarkType bookmarkName}}</span>
				<span id="bookmark_num_{{bookmarkSeq}}" class="count">
			</span>
        </a>
    </li>
    {{/each}}
</script>

<script id="mail_user_folder_tmpl" type="text/x-handlebars-template">
    {{#each this}}
    {{#user_folder_inbox_check this ../isInbox}}
    {{#unless smartFolder}}
    <li class="folder">
        <p id="folder_link_{{encName}}" class="title">
            <a href="javascript:;" evt-rol="folder" fname="{{fullName}}">
			<span class="btn_wrap">
				{{#greateThen depth 0}}
					<span class="ic ic_root"></span>
				{{else}}
					<span class="ic_side {{#if share}}ic_mail_share{{else}}ic_mail{{/if}}"></span>
				{{/greateThen}}
				<span class="txt_ellipsis">{{name}}</span>
				<span id="{{id}}_num" class="count">{{#greateThen unseenCnt 0}}{{unseenCnt}}{{/greateThen}}</span>
			</span>
            </a>
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
    <li>
        <p id="folder_link_{{encName}}" class="title">
            <a href="javascript:;" evt-rol="folder" fname="{{fullName}}">
			<span class="btn_wrap">
				{{#greateThen depth 0}}
					<span class="ic ic_root"></span>
				{{else}}
					<span class="ic_side {{printSmartFolderMobile fullName}}"></span>
				{{/greateThen}}
				<span class="txt_ellipsis">{{name}}</span>
				<span id="{{id}}_num" class="count">{{#greateThen unseenCnt 0}}{{unseenCnt}}{{/greateThen}}</span>
			</span>
            </a>
        </p>
    </li>
    {{/if}}
    {{/each}}
</script>

<script id="mail_user_subfolder_tmpl" type="text/x-handlebars-template">
    {{#each this}}
    <ul>
        <li class="folder">
            <p id="folder_link_{{encName}}" class="title">
                <a href="javascript:;" evt-rol="folder" fname="{{fullName}}">
				<span class="btn_wrap">
					<span class="ic ic_root"></span>
					<span class="txt_ellipsis">{{name}}</span>
					<span id="{{id}}_num" class="count">{{#greateThen unseenCnt 0}}{{unseenCnt}}{{/greateThen}}</span>
				</span>
                </a>
            </p>
            {{#if child}}{{#applyTemplate "mail_user_subfolder_tmpl" child}}{{/applyTemplate}}{{/if}}
        </li>
    </ul>
    {{/each}}
</script>

<script id="shared_folder_tmpl" type="text/x-handlebars-template">
    {{#each this}}
    <li class="folder">
        <p class="title">
            <a href="javascript:;" evt-rol="shared-folder" fname="{{encName}}" seq="{{userId}}">
			<span class="btn_wrap">
				<span class="ic_side ic_mail_share"></span>
				<span class="txt_ellipsis">{{name}}[{{userName}}({{userUid}})]</span>
			</span>
            </a>
        </p>
    </li>
    {{/each}}
</script>

<script id="mail_folder_selectbox_tmpl" type="text/x-handlebars-template">
    <li>
        <a href="javascript:;" class="tit" folder="Inbox" evt-rol="move-message">
			<span class="subject">
				<span class="title">
					<tctl:msg key="folder.inbox"/>
				</span>
			</span>
        </a>
    </li>
    {{#each this}}
    {{#startWidth fullName 'Inbox'}}
    <li class="depth1">
        <a href="javascript:;" class="tit" folder="{{fullName}}" evt-rol="move-message">
					<span class="subject">
						<span class="ic ic_root"></span>
						<span class="title">
							{{name}}
						</span>
					</span>
        </a>
    </li>
    {{#if child}}{{#applyTemplate "mail_folder_child_selectbox_tmpl" child}}{{/applyTemplate}}{{/if}}
    {{/startWidth}}
    {{/each}}
    <c:if test="${useSpamFolder}">
        <li>
            <a href="javascript:;" class="tit" folder="Spam" evt-rol="move-message">
			<span class="subject">
				<span class="title">
					<tctl:msg key="folder.spam"/>
				</span>
			</span>
            </a>
        </li>
    </c:if>
    <li>
        <a href="javascript:;" class="tit" folder="Trash" evt-rol="move-message">
			<span class="subject">
				<span class="title">
					<tctl:msg key="folder.trash"/>
				</span>
			</span>
        </a>
    </li>
    {{#each this}}
    {{#notStartWidth fullName 'Inbox'}}
    <li>
        <a href="javascript:;" class="tit" folder="{{fullName}}" evt-rol="move-message">
					<span class="subject">
						<span class="title">
							{{#if smartFolder}}
								{{name}}
							{{else}}
								{{fullName}}
							{{/if}}
						</span>
					</span>
        </a>
    </li>
    {{#if child}}{{#applyTemplate "mail_folder_child_selectbox_tmpl" child}}{{/applyTemplate}}{{/if}}
    {{/notStartWidth}}
    {{/each}}
</script>

<script id="mail_folder_child_selectbox_tmpl" type="text/x-handlebars-template">
    {{#each this}}
    <li class="depth{{depth}}">
        <a href="javascript:;" class="tit" folder="{{fullName}}" evt-rol="move-message">
			<span class="subject">
				<span class="ic ic_root"></span>
				<span class="title">
					{{name}}
				</span>
			</span>
        </a>
    </li>
    {{#if child}}{{#applyTemplate "mail_folder_child_selectbox_tmpl" child}}{{/applyTemplate}}{{/if}}
    {{/each}}
</script>

<script id="mail_attach_image_tmpl" type="text/x-handlebars-template">
    <li orgname="{{filePath}}" filename="{{fileName}}" filesize="{{fileSize}}" hostid="{{hostId}}" atttype="go">
	<span class="item_image">
		<span class="thumb"><img src="{{thumbnail}}" alt="{{fileName}}"></span>
		<span class="img_tit">{{fileName}}</span>
		<span class="txt">({{formattedFileSize}})</span>
		<a class="iscroll-tap-highlight">
			<span class="btn_wrap" data-btntype="attachDelete" evt-rol="delete-attach">
				<span class="ic_cmm ic_del"></span>
			</span>
		</a>
	</span>
    </li>
</script>

<script id="mail_attach_file_tmpl" type="text/x-handlebars-template">
    <li orgname="{{filePath}}" filename="{{fileName}}" filesize="{{fileSize}}" hostid="{{hostId}}" atttype="go">
	<span class="item_file">
		<span class="ic_file {{fileIcon}}"></span>
		<span class="name">{{fileName}}</span>
		<span class="size">({{calFileSize}})</span>
		<span class="optional">
			{{#ifAnd useMobilePreviewOption useHtmlConverter}}
			{{#acceptConverterMobile fileExt}}
			<a href="javascript:;" class="wrap_ic_file wrap_ic_file_preview" evt-rol="preview-attach-temp">
				<span class="ic ic_file_preview"></span>
			</a>
			{{/acceptConverterMobile}}
			{{/ifAnd}}
			<a href="javascript:;" data-bypass="" data-btntype="attachDelete" evt-rol="delete-attach" class="btn_fn4">
				<span class="txt ic ic_file_del">
				<tctl:msg key="comn.del"/>
				</span>
			</a>
		</span>
	</span>
    </li>
</script>

<script id="addr_no_readable_mail_tmpl" type="text/x-handlebars-template">
    <li class="creat data_null">
<span class="subject">
	<span class="txt">
		<tctl:msg key="alert.addr.noreadable"/>
	</span>
</span>
    </li>
</script>

<script id="addr_write_mail_tmpl" type="text/x-handlebars-template">
    {{#if data}}
    {{#each data}}
    <li>
        {{#notEmpty email}}
        <input type="checkbox" name="addrEmail" data-name="{{name}}" data-email="{{email}}"
               data-position="{{positionName}}" data-department="{{departmentName}}">
        <span evt-rol="check-checkbox-only" class="checkboxSelect">&nbsp;</span>
        {{/notEmpty}}
        <a class="tit" href="javascript:;" evt-rol="toggle-addr-select">
            <div class="photo"><img src="{{thumbSmall}}"></div>
            <div class="info">
                <span class="name txt_ellipsis">{{name}} {{positionName}}</span>
                <span class="mail txt_ellipsis">
				{{email}}{{#if departmentName}}<span class="part">|</span><span
                        class="department">[{{departmentName}}]</span>{{/if}}
			</span>
            </div>
        </a>
    </li>
    {{/each}}
    {{else}}
    <li class="creat data_null">
	<span class="subject">
		<span class="txt">
			{{#if search}}
				<tctl:msg key="alert.addr.search.noresult"/>
			{{else}}
				<tctl:msg key="addr.list.member.empty"/>
			{{/if}}
		</span>
	</span>
    </li>
    {{/if}}
    {{#if data}}
    {{#applyTemplate "mail_list_paging_tmpl_old" pageInfo}}{{/applyTemplate}}
    {{/if}}
</script>

<script id="emp_write_mail_tmpl" type="text/x-handlebars-template">
    {{#if data}}
    {{#each data}}
    <li>
        {{#notEmpty email}}
        <input type="checkbox" name="addrEmail" data-name="{{name}}" data-email="{{email}}"
               data-position="{{positionName}}" data-department="{{departmentName}}">
        <span evt-rol="check-checkbox-only" class="checkboxSelect">&nbsp;</span>
        {{/notEmpty}}
        <a class="tit" href="javascript:;" evt-rol="toggle-addr-select">
            <div class="photo"><img src="{{thumbnail}}"></div>
            <div class="info">
                <span class="name txt_ellipsis">{{name}} {{position}}</span>
                <span class="mail txt_ellipsis">
				{{#if ../mailExposure}}{{email}}{{/if}}{{#if departments}}<span class="part">{{#if ../mailExposure}}|{{/if}}</span><span
                        class="department">{{#each departments}}[{{printThis this}}]{{/each}}</span>{{/if}}
			</span>
            </div>
        </a>
    </li>
    {{/each}}
    {{else}}
    <li class="creat data_null">
	<span class="subject">
		<span class="txt">
			{{#if search}}
				<tctl:msg key="alert.addr.search.noresult"/>
			{{else}}
				<tctl:msg key="addr.list.member.empty"/>
			{{/if}}
		</span>
	</span>
    </li>
    {{/if}}
    {{#if data}}
    {{#applyTemplate "mail_list_paging_tmpl_old" pageInfo}}{{/applyTemplate}}
    {{/if}}
</script>

<script id="addr_dept_select_tmpl" type="text/x-handlebars-template">
    <span class="depthspan">
	<span class="depth">></span>
	<a class="btn_tool btn_slt " data-role="button">
		<span class="txt"></span><span class="space_ic"></span><span class="ic ic_arrow_down"></span>
		<select class="sit_move dept_addr_select" style="display:block">
			{{#each data}}
			<option value="{{id}}">{{name}}</option>
			{{/each}}
		</select>
	</a>
	</span>
</script>

<script id="addr_company_select_tmpl" type="text/x-handlebars-template">
    <span class="depthspan" data-depth={{depth}}>
	<span class="depth">></span>
	<a class="btn_tool btn_slt " data-role="button">
		<span class="txt">depth1</span><span class="space_ic"></span><span class="ic ic_arrow_down"></span>
		<select class="sit_move company_addr_select" style="display:block">
			{{#unless isFirst}}
			<option value="">선택</option>
			{{/unless}}
			{{#each data}}
			<option value="{{metadata.id}}" data-readable={{metadata.readable}}>{{metadata.name}}</option>
			{{/each}}
		</select>
	</a>
	</span>
</script>

<script id="mail_read_tag_tmpl" type="text/x-handlebars-template">
    <span class="ic_tag {{color}}"><span class="tail_r"><span></span></span></span>
</script>

<script id="mail_list_paging_tmpl" type="text/x-handlebars-template">
    <%--{{#with this}}--%>
    <%--<div class="paging">--%>
    <%--	{{#unless firstPage}}--%>
    <%--		<a href="javascript:;" evt-rol="list-page-move" page="{{prePage}}" class="btn_type4"><span class="ic ic_arrow3_l"></span><span class="txt"><tctl:msg key="comn.page.pre"/></span></a>--%>
    <%--	{{/unless}}--%>
    <%--		<span class="page">--%>
    <%--			<span class="current_page" page="{{page}}">{{printFromPage page pageSize}}</span>--%>
    <%--			<span class="txt_bar">-</span>--%>
    <%--			<span class="total_page">{{printToPage page total pageSize}}</span>--%>
    <%--			<span class="total_page">/ {{total}}</span>--%>
    <%--		</span>--%>
    <%--	{{#unless lastPage}}--%>
    <%--		<a href="javascript:;" evt-rol="list-page-move" page="{{nextPage}}" class="btn_type4"><span class="txt"><tctl:msg key="comn.page.next"/></span><span class="ic ic_arrow3_r"></span></a>--%>
    <%--	{{/unless}}--%>
    <%--</div>--%>
    <%--{{/with}}--%>
</script>

<script id="mail_list_paging_tmpl_old" type="text/x-handlebars-template">
    {{#with this}}
    <div class="paging">
        {{#unless firstPage}}
        <a href="javascript:;" evt-rol="list-page-move" page="{{prePage}}" class="btn_type4"><span
                class="ic ic_arrow3_l"></span><span class="txt"><tctl:msg key="comn.page.pre"/></span></a>
        {{/unless}}
        <span class="page">
				<span class="current_page" page="{{page}}">{{printFromPage page pageSize}}</span>
				<span class="txt_bar">-</span>
				<span class="total_page">{{printToPage page total pageSize}}</span>
				<span class="total_page">/ {{total}}</span>
			</span>
        {{#unless lastPage}}
        <a href="javascript:;" evt-rol="list-page-move" page="{{nextPage}}" class="btn_type4"><span
                class="txt"><tctl:msg key="comn.page.next"/></span><span class="ic ic_arrow3_r"></span></a>
        {{/unless}}
    </div>
    {{/with}}
</script>

<script id="mail_send_allow_check_content_tmpl" type="text/x-handlebars-template">
    {{#if sendEmailCheckResult}}
    <div class="notice">

        <span class="ic_error ic_error_default"></span>
        <p class="title"><tctl:msg key="mail.sendcheck.email.title"/></p>
        <p class="desc"><tctl:msg key="mail.sendcheck.email.desc"/></p>
    </div>
    {{/if}}
    {{#if sendAttachCheckResult}}
    <div class="notice">
        {{#unless sendEmailCheckResult}}
        <span class="ic_error ic_error_default"></span>
        {{/unless}}
        <p class="title"><tctl:msg key="mail.sendcheck.attach.title"/></p>
        <p class="desc"><tctl:msg key="mail.sendcheck.attach.desc"/></p>
    </div>
    {{/if}}
    {{#if sendKeywordCheckResult}}
    <div class="notice">
        {{#unless sendAttachCheckResult}}
        {{#unless sendEmailCheckResult}}
        <span class="ic_error ic_error_default"></span>
        {{/unless}}
        {{/unless}}
        <p class="title"><tctl:msg key="mail.sendcheck.keyword.title"/></p>
        <p class="desc"><tctl:msg key="mail.sendcheck.keyword.desc"/></p>
    </div>
    {{/if}}
    {{#if sendInfoCheck}}
    <div class="notice">
        {{#unless sendAttachCheckResult}}
        {{#unless sendEmailCheckResult}}
        {{#unless sendKeywordCheckResult}}
        <span class="ic_error ic_error_default"></span>
        {{/unless}}
        {{/unless}}
        {{/unless}}
        <p class="desc"><tctl:msg key="mail.rcptcheck.info"/></p>

        <div class="wrap_list_box1">
            <ul class="list_box1 list_prevent_receiveError">
                <li>
                    <p class="tit"><tctl:msg key="mail.subject"/></p>
                    <div class="container">
                        {{subject}}
                    </div>
                </li>
                <li>
                    <p class="tit"><tctl:msg key="mail.to"/></p>
                    <div class="container">
                        {{#each toList}}
                        <span class="wrap_option"><input type="checkbox" name="toAddr"
                                                         value="{{printThis this}}"><label>{{makeEmailFormatName this}}</label></span><br/>
                        {{/each}}
                    </div>
                </li>
                {{#if ccList}}
                <li>
                    <p class="tit"><tctl:msg key="mail.cc"/></p>
                    <div class="container">
                        {{#each ccList}}
                        <span class="wrap_option"><input type="checkbox" name="ccAddr"
                                                         value="{{printThis this}}"> <label>{{makeEmailFormatName this}}</label></span><br/>
                        {{/each}}
                    </div>
                </li>
                {{/if}}
                {{#if bccList}}
                <li>
                    <p class="tit"><tctl:msg key="mail.bcc"/></p>
                    <div class="container">
                        {{#each bccList}}
                        <span class="wrap_option"><input type="checkbox" name="bccAddr"
                                                         value="{{printThis this}}"> <label>{{makeEmailFormatName this}}</label></span><br/>
                        {{/each}}
                    </div>
                </li>
                {{/if}}
                {{#if attachList}}
                <li>
                    <p class="tit"><tctl:msg key="mail.attach"/></p>
                    <div class="container">
                        <!-- 첨부파일 -->
                        <ul class="file_wrap_normal">
                            {{#each attachList}}
                            <li>
							<span class="wrap_option">
								<input type="checkbox" name="attachFile" value="{{id}}" orgname="{{id}}"
                                       filename="{{name}}" filesize="{{size}}" fileattr="{{fileattr}}"
                                       hostid="{{hostId}}">
								<label for="">
									<span class="ic_file ic_{{fileExt name}}"></span>
									<span class="file_name">{{name}}
										<span class="size">{{printSize size}}</span>
									</span>
								</label>
							</span>
                            </li>
                            {{/each}}
                        </ul>
                    </div>
                </li>
                {{/if}}
            </ul>
        </div>
    </div>
    {{/if}}
</script>

<script id="mail_icalendar_tmpl" type="text/x-handlebars-template">
    {{#each this}}
    <div style="padding:0; margin:15px;">
        <table cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse">
            <thead>
            <tr>
                <th style="width:60px; height:60px; background:#e9f5f6; border-top:1px solid #ccc; border-left: 1px solid #ccc; color:#333; border-bottom: 2px solid #2EACB3; font:bold 16px/16px arial, gulim, dotum; text-align:left; padding:15px 0; white-space:nowrap">
                    <table align="center" cellpadding="0" cellspacing="0"
                           style="width:100%; border-collapse:collapse; border:1px solid #e9f5f6; padding:10px 20px; text-align:center">
                        <tr>
                            <td style="padding:3px; text-align:center;font-size:12px; font-family:arial,dotum; background:#e9f5f6">
                                {{printFullMonth this.icalStartMonth}}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:3px; text-align:center;font-size:26px; font-family:arial,dotum; background:#e9f5f6">
                                {{printSingleDayOfMonth this.icalStartDay}}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:3px; text-align:center;font-size:12px; font-family:arial,dotum; background:#e9f5f6">
                                ({{printDayOfWeek this.icalStartWeekend}})
                            </td>
                        </tr>
                    </table>

                </th>
                <th style="background:#fff; border-top:1px solid #ccc; border-right: 1px solid #ccc; color:#333; border-bottom: 2px solid #2EACB3; font:bold 16px/16px arial, gulim, dotum; text-align:left; padding:14px 20px">
                    {{printThis this.icalSubject}}
                </th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td width="55px"
                    style="padding:20px 0 6px 20px; border-left:1px solid #ccc; font:bold 13px/1.4 gulim; color:#888; text-align:left; vertical-align:top; border-bottom: 1px dotted #ccc">
                    <tctl:msg key="mail.subject"/></td>
                <td style="padding:20px 10px 6px 10px; border-right:1px solid #ccc; font: 13px/1.4 dotum; color:#555; margin:0; vertical-align:top; border-bottom: 1px dotted #ccc">
                    {{printThis this.icalSubject}}
                </td>
            </tr>
            <tr>
                <td style="padding:6px 0 6px 20px; border-left:1px solid #ccc; font:bold 13px/1.4 gulim; color:#888; text-align:left; vertical-align:top; border-bottom: 1px dotted #ccc">
                    <tctl:msg key="mail.registe.date"/></td>
                {{#empty this.icalRecurrenceMsg}}
                <td style="padding:6px 10px; border-right:1px solid #ccc; font: 13px/1.4 dotum; color:#555; margin:0; vertical-align:top; border-bottom: 1px dotted #ccc">
                    {{#if this.icalIsAlldayType}}{{printFullDate this.icalStartDate}}{{else}}{{printFullDateTime
                    this.icalStartTime}} ~ {{printFullDateTime this.icalEndTime}}{{/if}}
                </td>
                {{/empty}}
                {{#notEmpty this.icalRecurrenceMsg}}
                <td style="padding:6px 10px; border-right:1px solid #ccc; font: 13px/1.4 dotum; color:#555; margin:0; vertical-align:top; border-bottom: 1px dotted #ccc">
                    {{printThis this.icalRecurrenceMsg}}{{#if this.icalIsAlldayType}}{{printFullDate
                    this.icalStartDate}}{{else}}, {{printOnlyTime this.icalRecurStartTime}} ~ {{printOnlyTime
                    this.icalRecurEndTime}}{{/if}}
                </td>
                {{/notEmpty}}
            </tr>
            <tr>
                <td style="padding:6px 0 6px 20px; border-left:1px solid #ccc; font:bold 13px/1.4 gulim; color:#888; text-align:left; vertical-align:top; border-bottom: 1px dotted #ccc">
                    <tctl:msg key="mail.calendar.location"/></td>
                <td style="padding:6px 10px; border-right:1px solid #ccc; font: 13px/1.4 dotum; color:#555; margin:0; vertical-align:top; border-bottom: 1px dotted #ccc">
                    {{printThis this.icalLocation}}
                </td>
            </tr>
            <tr>
                <td style="padding:6px 0 6px 20px; border-left:1px solid #ccc; font:bold 13px/1.4 gulim; color:#888; text-align:left; vertical-align:top; border-bottom: 1px solid #ccc">
                    <tctl:msg key="mail.calendar.attendee"/></td>
                <td style="padding:6px 10px; border-right:1px solid #ccc; font: 13px/1.4 dotum; color:#555; margin:0; vertical-align:top; border-bottom: 1px solid #ccc">
                    {{printThis this.icalAttendee}}
                </td>
            </tr>
            {{#notEmpty icalDescription}}
            <tr>
                <td style="padding:6px 0 6px 20px; border-left:1px solid #ccc; font:bold 13px/1.4 gulim; color:#888; text-align:left; vertical-align:top; border-bottom: 1px solid #ccc">
                    <tctl:msg key="mail.calendar.description"/></td>
                <td style="padding:6px 10px; border-right:1px solid #ccc; font: 13px/1.4 dotum; color:#555; margin:0; vertical-align:top; border-bottom: 1px solid #ccc">
                    {{{icalDescription}}}
                </td>
            </tr>
            {{/notEmpty}}
            </tbody>
        </table>
    </div>
    {{/each}}
</script>
<script id="mail_layer_sign_tmpl" type="text/x-handlebars-template">
    <select id="signSelect" class="w_max">
        <option value="0" {{#unless useAttach}}selected{{/unless}}><tctl:msg key="comn.disabled"/></option>
        {{#each this}}
        <option value="{{signSeq}}" {{#if ../useAttach}}{{#if defaultSign}}selected{{/if}}{{/if}}>{{signName}}</option>
        {{/each}}
    </select>
</script>

<script id="mail_attach_download_confirm_tmpl" type="text/x-handlebars-template">
    <!-- 첨부파일 주의 메시지 -->
    <div class="notice">
        <span class="ic_notice ic_error"></span>
        <p class="title"><tctl:msg key="mail.attach.check.layer.title"/></p>
        <p class="desc"><tctl:msg key="mail.attach.check.layer.desc"/></p>
    </div>
    <!-- //첨부파일 주의 메시지 -->
    <div class="notice">
        <p class="desc"><tctl:msg key="mail.attach.check.layer.caution"/></p>
        <!-- 목록 -->
        <div class="wrap_list_box1">
            <ul class="list_box1 list_prevent_receiveError">
                <li>
                    <p class="tit"><tctl:msg key="mail.subject"/></p>
                    <div id="attachDownloadConfirmSubject" class="container"></div>
                </li>
                <li>
                    <p class="tit"><tctl:msg key="mail.attach"/><span id="attachFileCount" class="num">0</span><tctl:msg
                            key="mail.unit.count"/></p>
                    <div class="container">
                        <!-- 첨부파일 -->
                        <ul id="attachDownloadConfirmItemWrap" class="file_wrap_normal"></ul>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</script>

<script id="mail_attach_download_confirm_item_tmpl" type="text/x-handlebars-template">
    <li filename="{{name}}" filesize="{{realsize}}" part="{{part}}">
	<span class="wrap_option">
		<span class="{{css}}"></span>
		<a href="javascript:;" evt-rol="attach-confirm-layer-download">
			<span class="file_name">{{name}}<span class="size">{{size}}</span></span>
		</a>
	</span>
    </li>
</script>

<script id="mail_tag_page_tmpl" type="text/x-handlebars-template">
    {{#if this}}
    {{#each this}}
    <li>
        <a href="javascript:;" evt-rol="tag-message" val="{{id}}" class="tit">
				<span class="btn_wrap">
					<span class="ic_tag {{color}}"><span class="tail_r"><span></span></span></span>
					<span class="tag_name">{{name}}</span>
				</span>
        </a>
    </li>
    {{/each}}
    {{else}}
    <li class="creat data_null">
		<span class="subject">
			<span class="txt_ellipsis"><tctl:msg key="mail.tag.empty"/><br/><tctl:msg key="mail.tag.web"/></span>
		</span>
    </li>
    {{/if}}
</script>

<script id="mail_search_detail" type="text/x-handlebars-template">
    <span id="simpleSearchWrap">
        <p class="tit"><tctl:msg key="mail.sfolder.cond"/></p>
        <ul class="search_result">
            <li>
                <a href="" data-search="all">
                    <label class="tit"><tctl:msg key="mail.search.all"/><tctl:msg key="mail.search"/></label>
                    <div class="txt">
                        <span class="searchText"></span>
                    </div>
                </a>
            </li>
            <li>
                <a href="" data-search="fromaddr">
                    <label class="tit"><tctl:msg key="mail.from"/></label>
                    <div class="txt">
                        <span class="searchText"></span>
                    </div>
                </a>
            </li>
            <li>
                <a href="" data-search="toaddr">
                    <label class="tit"><tctl:msg key="mail.to"/></label>
                    <div class="txt">
                        <span class="searchText"></span>
                    </div>
                </a>
            </li>
			<li>
                <a href="" data-search="subject">
                    <label class="tit"><tctl:msg key="search.subject"/></label>
                    <div class="txt">
                        <span class="searchText"></span>
                    </div>
                </a>
            </li>
        </ul>
    </span>
    <span id="detailSearchWrap" style="display:none">
        <ul class="search_result">
			<li>
                <label class="tit"><tctl:msg key="mail.sfolder"/></label>
                <div class="txt">
						<select id="adFolderName" class="w_max" evt-rol="select-search-folder">
							{{#applyTemplate "mail_folder_option_tmpl" folderList}}{{/applyTemplate}}
						</select>
                </div>
            </li>
            <li>
                <label class="tit"><tctl:msg key="mail.from"/></label>
                <div class="txt">
                    <input id="fromaddr" class="input" type="search"
                           placeholder="<tctl:msg key="mail.mobile.search.message"/>">
                </div>
            </li>
            <li>
                <label class="tit"><tctl:msg key="mail.to"/></label>
                <div class="txt">
                    <input id="toaddr" class="input" type="search"
                           placeholder="<tctl:msg key="mail.mobile.search.message"/>">
                </div>
            </li>
            <li>
                <label class="tit"><tctl:msg key="mail.sword"/></label>
                <div class="txt" id="adSearchCondWrap">
                    <span class="option_wrap">
                        <input id="adSubjectCheck" type="checkbox" name="adSearchCond" value="s">
                        <label for="adSubjectCheck" class="txt"><tctl:msg key="mail.subject"/></label>
                    </span>
                    <span class="option_wrap">
                        <input id="adContentCheck" type="checkbox" name="adSearchCond" value="b">
                        <label for="adContentCheck" class="txt"><tctl:msg key="search.body"/></label>
                    </span>
                    <span class="option_wrap">
                        <input id="adAttachNameCheck" type="checkbox" name="adSearchCond" value="af">
                        <label for="adAttachNameCheck" class="txt"><tctl:msg key="search.attname"/></label>
                    </span>
					<span class="option_wrap" id="adAttachContentSearch" style="display:none">
                        <input id="adAttachContentCheck" type="checkbox" name="adSearchCond" value="ab">
                        <label for="adAttachContentCheck" class="txt"><tctl:msg key="search.attcontent"/></label>
                    </span>
                    <input class="input" type="search" id="adSearchKeyWord"
                           placeholder="<tctl:msg key="mail.mobile.search.message"/>"/>
                </div>
            </li>
        </ul>
        <a class="btn_wrap" evt-rol="searchInit" id="searchInit">
            <span class="btn btn_refresh"></span>
            <span class="txt"><tctl:msg key="smart-editor.reset"/></span>
        </a>
    </span>
    <span id="searchResultWrap">
    </span>
</script>

<script id="mail_folder_option_tmpl" type="text/x-handlebars-template">
    <option value="all"><tctl:msg key="folder.all"/></option>
    <option value="Inbox"><tctl:msg key="folder.inbox"/></option>
    {{#each this}}
    {{#startWidth fullName 'Inbox'}}
    {{#if child}}{{#applyTemplate "mail_folder_child_option_tmpl" child}}{{/applyTemplate}}{{/if}}
    {{/startWidth}}
    {{/each}}
    <option value="Sent"><tctl:msg key="folder.sent"/></option>
    <option value="Spam"><tctl:msg key="folder.spam"/></option>
    <option value="Trash"><tctl:msg key="folder.trash"/></option>
    {{#each this}}
    {{#notStartWidth fullName 'Inbox'}}
    {{#if smartFolder}}
    <option value="{{fullName}}">{{name}}</option>
    {{else}}
    <option value="{{fullName}}">{{fullName}}</option>
    {{/if}}
    {{#if child}}{{#applyTemplate "mail_folder_child_option_tmpl" child}}{{/applyTemplate}}{{/if}}
    {{/notStartWidth}}
    {{/each}}
</script>

<script id="mail_folder_child_option_tmpl" type="text/x-handlebars-template">
    {{#each this}}
    <option value="{{fullName}}">
        {{#startWidth fullName 'Inbox'}}
        {{replaceInboxChild fullName}}
        {{else}}
        {{replaceAll fullName '.' ' > '}}
        {{/startWidth}}
    </option>
    {{#if child}}{{#applyTemplate "mail_folder_child_option_tmpl" child}}{{/applyTemplate}}{{/if}}
    {{/each}}
</script>

<script id="mail_search_list_wrap" type="text/x-handlebars-template">
    <div class="search_info">
        <span class="txt"><tctl:msg key="mail.search.result"/></span>
        <span class="num">{{total}}</span>
    </div>
    <ul class="list_normal list_mail">
        {{#if messageList}}
        {{#applyTemplate "mail_search_list" messageList}}{{/applyTemplate}}
        {{else}}
        <li class="creat data_null">
            <span class="txt"><tctl:msg key="alert.addr.search.noresult"/></span>
        </li>
        {{/if}}
    </ul>
</script>

<script id="mail_search_list" type="text/x-handlebars-template">
    {{#each this}}
    <li id="{{folderEncName}}_{{id}}" {{#unless seen}} class="read_no" {{/unless}} evt-rol="read-message">
    <input type="checkbox" name="msgId" value="{{id}}" data-femail="{{fromEscape}}" data-temail="{{toEscape}}">
    <span evt-rol="check-checkbox" class="checkboxSelect">&nbsp;</span>
    <a class="tit" folder="{{folderEncName}}" uid="{{id}}">
			<span class="vertical_wrap">
				<span class="ic ic_mail"></span>
				<span class="name">{{viewMoveFolderName folderName}}</span>
				<span class="part">|</span>
				<span class="name">
					{{#equal folderName 'Sent'}}
						{{sendToSimple}}
					{{else}}
						{{fromToSimple}}
					{{/equal}}
				</span>
			</span>
        <span class="subject txt_ellipsis">
				{{#equal priority 'HIGH'}}<span class="ic ic_exclamation"></span>{{/equal}}
				{{#contains flag 'T'}}<span class="ic ic_attach"></span>{{/contains}}
				{{#each tagList}}
					<span class="ic_tag {{color}}"><span class="tail_r"><span></span></span></span>
				{{/each}}
				<span class="title">{{subject}}</span>
			</span>
    </a>
    <div class="optional">
        <span class="date">{{printMdnListDate dateUtc}}</span>
        <a href="" tap-rol="switch-flag" class="flagClass"><span flag="F" {{#contains flag 'F'}}flaged="on" class="ic
            ic_important_on"{{else}}flaged="off" class="ic ic_important_off"{{/contains}}></span></a>
    </div>
    </li>
    {{/each}}
</script>
<script id="mail_org_member_tmpl" type="text/x-handlebars-template">
    {{#if data}}
    {{#each data}}
    <li id="userNode" name="addrEmail" data-name="{{name}}" data-email="{{email}}" data-position="{{position}}"
        data-department="{{deptName}}" data-id="{{type}}_{{id}}">
        <a class="btn btn_plus" value="{{type}}_{{id}}" id="userSort_{{id}}"></a>
        <a class="tit">
            <div class="photo"><img src="{{thumbnail}}"></div>
            <div class="info" data-id="{{type}}_{{id}}">
                <span class="name txt_ellipsis">{{name}}</span>
                <span class="mail txt_ellipsis">
				    {{#if ../mailExposure}}{{email}}{{/if}}
                    {{#if deptName}}
                    <span class="part">{{#if ../mailExposure}}|{{/if}}</span>
                    <span class="department">{{deptName}}</span>
                    {{#isMultiCompany}}<span class="part">  |  </span><span class="department">{{companyName}}</span>{{/isMultiCompany}}
                    {{/if}}
                </span>
            </div>
        </a>
    </li>
    {{/each}}
    {{else}}
    <li class="creat data_null">
        <span class="subject">
            <span class="txt"><tctl:msg key="alert.addr.search.noresult"/></span>
        </span>
    </li>
    {{/if}}
</script>
<script id="mail_org_dept_tmpl" type="text/x-handlebars-template">
    {{#if data}}
    {{#each data}}
    <li id="deptNode" name="addrEmail" data-name="{{name}}" data-email="{{email}}" data-department="{{name}}"
        data-id="{{type}}_{{id}}">
        <a class="btn btn_plus" value="{{type}}_{{id}}" id="deptSort_{{id}}"></a>
        <a class="tit">
            {{#isMultiCompany}}<span class="multi_company"><span class="txt">{{companyName}}</span></span>{{/isMultiCompany}}
            <div class="depart">
                <span class="txt"><tctl:msg key="mail.search.name.department"/></span>
            </div>
            <div class="info dept_info" data-id="{{type}}_{{id}}">
                <span class="name txt_ellipsis">{{title}}</span>
                {{#hasDeptChildren}}
                <span class="ic ic_arrow4" style="display: inline-block"></span>
                {{/hasDeptChildren}}
            </div>
        </a>
    </li>
    {{/each}}
    {{else}}
    <li class="creat data_null">
        <span class="subject">
            <span class="txt"><tctl:msg key="alert.addr.search.noresult"/></span>
        </span>
    </li>
    {{/if}}
</script>
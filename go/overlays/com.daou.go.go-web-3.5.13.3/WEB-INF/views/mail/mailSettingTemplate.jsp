<%@ page language="java"  contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<script id = "mail_setting_basic_tmpl" type = "text/x-handlebars-template">
					<section class="form_admin">
					<header>
						<h3><tctl:msg key="conf.profile.2" /></h3>
					</header>
					<form>
						<input type="hidden" id="pageLineCntVal" value="{{pageLineCnt}}"/>
						<fieldset>
							<table class="form_type">
								<caption><tctl:msg key="conf.profile.2" /></caption>
								<colgroup>
									<col style="width:190px"/>
									<col/>
								</colgroup>
								<tbody>
									<tr>
										<th><span class="title"><tctl:msg key="conf.address.display.type" /></span></th>
										<td>
											<span class="option_wrap">
												<input id="addressVisibleOff" type="radio" name="addressVisible" value="off" {{#equal addressVisible "off"}}checked="checked"{{/equal}}>
												<label for="addressVisibleOff"><tctl:msg key="common.14" /></label>
											</span>
											<span class="horspace1"></span>
											<span class="option_wrap">
												<input id="addressVisibleOn" type="radio" name="addressVisible" value="on" {{#equal addressVisible "on"}}checked="checked"{{/equal}}>
												<label for="addressVisibleOn"><tctl:msg key="common.14" /> + <tctl:msg key="common.17" /></label>
											</span>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.basic.bodyimage" /></span></th>
										<td><span class="option_wrap"><input id="hiddenimg" type="checkbox" {{#equal hiddenImg 'on'}}checked="checked"{{/equal}}/><label for="hiddenimg"><tctl:msg key="conf.profile.46" /></label></span></td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.profile.45" /></span></th>
										<td><span class="option_wrap"><input id="hiddentag" type="checkbox" {{#equal hiddenTag 'on'}}checked="checked"{{/equal}}/><label for="hiddentag"><tctl:msg key="conf.profile.47" /></label></span>
											<span class="help">
												<span class="tool_tip" style="width:84px">
												<tctl:msg key="conf.profile.48" /><br />
												.HTML<br />
												.HEAD<br />
												.META<br />
												.BODY<br />
												.SCRIPT<br />
												.IFRAME<br />
												.EMBED
												<i class="tail_left"></i>
												</span>
											</span>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.profile.83" /></span></th>
										<td>
											<span class="option_wrap">
												<input id="nationView" type="checkbox" {{#equal nationView 'on'}}checked="checked"{{/equal}}/><label for="nationView"><tctl:msg key="conf.profile.84" /></label>
											</span>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.profile.search.option" /></span></th>
										<td>
											<span class="option_wrap">
												<input id="searchallfolder" type="checkbox" {{#equal searchAllFolder 'on'}}checked="checked"{{/equal}}/><label for="searchallfolder"><tctl:msg key="conf.profile.search.folder" /></label>
											</span>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.basic.ccinclude.title" /></span></th>
										<td>
											<span class="option_wrap">
												<input id="listViewCc" type="checkbox" {{#equal listViewCc 'on'}}checked="checked"{{/equal}}><label for="listViewCc"><tctl:msg key="conf.basic.ccinclude.view" /></label>
											</span>
										</td>
									</tr>
									<tr style="display:none;">
										<th><span class="title"><tctl:msg key="conf.basic.badge.title" /></span></th>
										<td>
											<span class="option_wrap">
												<input id="mailBadgeUse" type="checkbox" {{#equal mailBadgeUse 'on'}}checked="checked"{{/equal}}/><label for="mailBadgeUse"><tctl:msg key="conf.basic.badge.folder.include" /></label>
											</span>
										</td>
									</tr>
								</tbody>
							</table>
						</fieldset>
					</form>
				</section>
				<!-- 메일 쓰기 설정 -->
				<section class="form_admin">
					<header>
						<h3><tctl:msg key="conf.profile.4" /></h3>
					</header>
					<form>
						<fieldset>
							<table class="form_type">
								<caption><tctl:msg key="conf.profile.4" /></caption>
								<colgroup>
									<col style="width:190px"/>
									<col/>
								</colgroup>
								<tbody>
									{{#if mailExposure}}
									<tr>
										<th><span class="title"><tctl:msg key="conf.rcpt.title" /></span></th>
										<td>
											<span class="option_wrap"><input id="rcptModeNormal" type="radio" name="rcptMode" value="normal" {{#equal rcptMode 'normal'}}checked="checked"{{/equal}}/><label for="rcptModeNormal"><tctl:msg key="conf.rcpt.normal" /></label></span>
											<span class="horspace1"></span>
											<span class="option_wrap"><input id="rcptModeNoneac" type="radio" name="rcptMode" value="noneac" {{#equal rcptMode 'noneac'}}checked="checked"{{/equal}}/><label for="rcptModeNoneac"><tctl:msg key="conf.rcpt.noneac" /></label></span>
											<span class="horspace1"></span>
											<span class="option_wrap"><input id="rcptModeSearchaddr" type="radio" name="rcptMode" value="searchaddr" {{#equal rcptMode 'searchaddr'}}checked="checked"{{/equal}}/><label for="rcptModeSearchaddr"><tctl:msg key="conf.rcpt.searchaddr" /></label></span>											
										</td>
									</tr>
									{{/if}}
									<tr>
										<th><span class="title"><tctl:msg key="conf.send.confirm.title" /></span></th>
										<td>
											<span class="option_wrap"><input id="sendConfirmOn" type="radio" name="sendConfirm" value="on" {{#notEqual sendConfirm 'off'}}checked="checked"{{/notEqual}}/><label for="sendConfirmOn"><tctl:msg key="conf.send.confirm.on" /></label></span>
											<span class="horspace1"></span>
											<span class="option_wrap"><input id="sendConfirmOff" type="radio" name="sendConfirm" value="off" {{#equal sendConfirm 'off'}}checked="checked"{{/equal}}/><label for="sendConfirmOff"><tctl:msg key="conf.send.confirm.off" /></label></span>
											<p class="desc"><tctl:msg key="conf.send.confirm.desc" /></p>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.profile.5" /></span></th>
										<td>
											<span class="option_wrap"><input id="saveSendBox" type="radio" name="saveSendBoxFalg" value="on" {{#equal saveSendBox 'on'}}checked="checked"{{/equal}}/><label for="saveSendBox"><tctl:msg key="comn.save" /></label></span>
											<span class="horspace1"></span>
											<span class="option_wrap"><input id="notSaveSendBox" type="radio" name="saveSendBoxFalg" value="off" {{#notEqual saveSendBox 'on'}}checked="checked"{{/notEqual}}/><label for="notSaveSendBox"><tctl:msg key="comn.save.cancel" /></label></span>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.profile.7" /></span></th>
										<td>
											<span class="option_wrap"><input id="receiveNoti" type="radio" name="receiveNotiFalg" value="on" {{#equal receiveNoti 'on'}}checked="checked"{{/equal}}/><label for="receiveNoti"><tctl:msg key="comn.use.check" /></label></span>
											<span class="horspace1"></span>
											<span class="option_wrap"><input id="notUseReceiveNoti" type="radio" name="receiveNotiFalg" value="off" {{#notEqual receiveNoti 'on'}}checked="checked"{{/notEqual}}/><label for="notUseReceiveNoti"><tctl:msg key="comn.use.check.cancel" /></label></span>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.profile.25" /></span></th>
										<td>
											<select id = "wmodeSelect">
												<option value="html" {{#equal writeMode 'html'}} selected="selected" {{/equal}}>HTML</option>
												<option value="text" {{#equal writeMode 'text'}} selected="selected" {{/equal}}>TEXT</option>
											</select>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.profile.71" /></span></th>
										<td>
											<select id = "composeModeSelect">
												<option value="normal" {{#equal composeMode 'normal'}} selected="selected" {{/equal}}><tctl:msg key="conf.profile.72" /></option>
												<option value="popup" {{#equal composeMode 'popup'}} selected="selected" {{/equal}}><tctl:msg key="conf.profile.73" /></option>
											</select>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.profile.26" /></span></th>
										<td>
											<select id = "encodingSelect">
												<option value="EUC-KR" {{#equal charSet 'EUC-KR'}} selected="selected" {{/equal}}><tctl:msg key="conf.profile.27" /></option>
												<option value="US-ASCII" {{#equal charSet 'US-ASCII'}} selected="selected" {{/equal}}><tctl:msg key="conf.profile.29" /></option>
												<option value="ISO-2022-JP" {{#equal charSet 'ISO-2022-JP'}} selected="selected" {{/equal}}><tctl:msg key="conf.profile.28" /></option>
												<option value="GB2312" {{#equal charSet 'GB2312'}} selected="selected" {{/equal}}><tctl:msg key="conf.profile.32" /></option>
												<option value="BIG5" {{#equal charSet 'BIG5'}} selected="selected" {{/equal}}><tctl:msg key="conf.profile.33" /></option>
												<option value="UTF-8" {{#equal charSet 'UTF-8'}} selected="selected" {{/equal}}><tctl:msg key="conf.profile.34" /></option>
											</select>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.profile.74" /></span></th>
										<td>
											<span class="option_wrap"><input id="writeNoti" type="radio" name="writeNotiFalg" value="on" {{#equal writeNoti 'on'}}checked="checked"{{/equal}}/><label for="writeNoti"><tctl:msg key="comn.use.check" /></label></span>
											<span class="horspace1"></span>
											<span class="option_wrap"><input id="notUseWriteNoti" type="radio" name="writeNotiFalg" value="off" {{#notEqual writeNoti 'on'}}checked="checked"{{/notEqual}}/><label for="notUseWriteNoti"><tctl:msg key="comn.use.check.cancel" /></label></span>
										</td>
									</tr>
									<tr id="senderNameTr">
										<th><span class="title"><tctl:msg key="conf.profile.9" /></span></th>
										<td><input class="input w_max" type="text" id="senderNameInfo" name="senderNameInfo" class="IP200" value="{{senderName}}" onFocusOut="changePersonalPart(event)"/></td>
									</tr>
									<tr id="senderEmailTr">
										<th><span class="title"><tctl:msg key="conf.profile.53" /></span></th>
										<td><input class="input w_max" type="text" id="senderEmailInfo" name="senderEmailInfo" class="IP200" value="{{senderEmail}}" {{#equal useMailSender true}}{{#equal replyToSameMail 'on'}}{{#equal replyToSameMail 'on'}}disabled="disabled"{{/equal}}{{/equal}}{{/equal}}/></td>
									</tr>
									{{#if useMailSender}}
									<tr id="useMailSenderSettingTr">
										<th><span class="title"><tctl:msg key="conf.basic.sender.title" /></span></th>
										<td>
											<div class="option_set">
												<span class="option_wrap">
													<input type="checkbox" id="replyToSameMail" {{#equal replyToSameMail 'on'}} checked {{/equal}} onclick="toggleReplyTo(event)"/>
													<label for="replyToSameMail"><tctl:msg key="conf.basic.reply.to.same.mail" /></label>
												</span>	
												<div class="option_display">
													<div class="wrap">
														<span class="txt"><tctl:msg key="conf.basic.sender.name" /></span>
														<input type="text" id="inputSenderName" class="input wfix_large">
														<span class="txt"><tctl:msg key="conf.userinfo.email" /></span>
														<select id="availableEmails">
														</select>
														<input type="text" id="inputSenderEmail" class="input wfix_large" onKeyPress="(keyEvent(event) == 13) ? validateAddSenderEmail() : '';" style="display:none;">
														<a href="javascript:;" evt-rol="add-sender-email" class="btn_fn10"><tctl:msg key="comn.add" /></a>
													</div>	
													<div id="mailSenderListWrap" class="vertical_wrap_s">																											
														<input type="hidden" id="mailSenderUse" value="on"/>
														<table class="in_table tb_article_head">
															<caption><tctl:msg key="conf.basic.sender.email" /></caption>
															<colgroup>
																<col width="">
																<col width="130px">									
																<col width="100px">									
															</colgroup>
															<thead>
																<tr>
																	<th class="align_l"><tctl:msg key="conf.basic.sender.email.desc" /></th>
																	<th><tctl:msg key="comn.mgnt" /></th>
																	<th><tctl:msg key="comn.del" /></th>
																</tr>
															</thead>
															<tbody id="mailSenderListTbody">
																<tr>
																	<td>
																		<span class="wrap_option">
																			<span class="txt senderItem" data-email="{{myEmail}}" data-alias="false">{{myEmail}}</span>{{#if myEmailDefault}}<span id="defaultEmail">(<tctl:msg key="conf.userinfo.sender.email.default" />)</span>{{/if}}
																		</span>
																	</td>						
																	<td class="align_c"><a id="myEmailDefault" class="btn_minor_s" evt-rol="default-sender-email" {{#empty senderList}}style="display:none"{{/empty}}><span class="txt"><tctl:msg key="conf.userinfo.sender.email.default.add" /></span></a></td>
																	<td class="align_c"></td>
																</tr>
																{{#each senderList}}
																<tr>
																	<td>
																		<span class="wrap_option">
																			<span class="txt senderItem" data-email="{{email}}" data-alias="{{aliasUser}}">{{email}}</span>{{#if defaultMail}}<span id="defaultEmail">(<tctl:msg key="conf.userinfo.sender.email.default" />)</span>{{/if}}
																		</span>
																	</td>
																	<td class="align_c">{{#unless aliasUser}}<a class="btn_minor_s" evt-rol="default-sender-email"><span class="txt"><tctl:msg key="conf.userinfo.sender.email.default.add" /></span></a>{{/unless}}</td>									
																	<td class="align_c"><span class="btn_bdr" evt-rol="delete-sender-item"><span title="<tctl:msg key="comn.del" />" class="ic_classic ic_basket"></span></span></td>
																</tr>
																{{/each}}
															</tbody>								
														</table>	
													</div>		
												</div>
											</div>										
										</td>
									</tr>
									{{/if}}
									<tr>
										<th><span class="title"><tctl:msg key="conf.profile.11" /></span></th>
										<td>
											<span class="option_wrap"><input id="vcardattach" type="checkbox" {{#equal vcardAttach 'on'}}checked="checked"{{/equal}}/><label for="vcardattach"><tctl:msg key="conf.profile.12" /></label></span>
											<span class="btn_minor_s" data-role="button" evt-rol="view-vcard">
											<span class="ic_classic ic_setup"></span><span class="txt"><tctl:msg key="conf.sign.13" /></span>
											</span>											
										</td>
									</tr>
								</tbody>
							</table>
						</fieldset>
					</form>
				</section>
				<div class="page_action_wrap">
					<a class="btn_major" data-role="button" evt-rol="save-basic-setting"><span class="txt"><tctl:msg key="comn.btn.save" /></span></a>
					<a class="btn_minor" data-role="button" evt-rol="basic-setting-cancel"><span class="txt"><tctl:msg key="comn.cancel" /></span></a>
					<a class="btn_minor" data-role="button" evt-rol="default-basic-setting"><span class="txt"><tctl:msg key="common.default" /></span></a>
				</div>
</script>

<script id = "mail_setting_modal_tmpl" type = "text/x-handlebars-template">
		<table class="form_type form_mail001">
			<tbody>
				<tr>
					<th class="label"><span class="title"><tctl:msg key="addr.view.picture.title" /></span><ins class="asterisk">*</ins></th>
					<td class="form">				
					    <form name="pictureForm" method="post" enctype="multipart/form-data">		
							<input type="hidden" name="picturePath" />
							<input type="hidden" name="pictureName" />
							<input type="hidden" id="maxImageSize" name="maxImageSize" value="1048576"/>
							<input type="hidden" id="mailUserSeq" name="mailUserSeq" value="{{mailUserSeq}}" />
							<span class="img_profile">	
								<span class="btn_edit_photo" id="swfupload-control" {{#unless useFlash}}style="display:none;"{{/unless}}> 
									<span class="txt" id="button"><tctl:msg key="addr.view.picture.button.title" /></span>
								</span>	
								<img id="thumbnail_image" style="height:100px; border: 1px solid #cecece;" src="{{#if photoUrl}}{{photoUrl}}{{else}}/resources/images/photo_profile_sample.jpg{{/if}}" alt="<tctl:msg key="addr.view.picture.img.title" />" img-data="{{photoPath}}" />
							</span>
							<span class="wrap_btn wrap_file_upload">
								<span id="simpleFileInit" class="upload_button btn_minor_s fileinput-button button_text" style="overflow:visible;{{#if useFlash}}display:none;{{/if}}">
									<a class="height: inherit">
										<span class="buttonText"><tctl:msg key="addr.view.picture.button.title" /></span>
									</a>
									<input type="file" multiple id="mailSimpleVcardImageUpload" name="NewFile" class="TM_attFile">
								</span>
							</span>
							<span id="vcard_img_delete" evt-rol="delete-photo" class="btn_minor_s" style="text-align:center; cursor:pointer;{{#unless photoUrl}}display:none;{{/unless}}"><tctl:msg key="mail.attach.delete"/></span>
							<p class="desc">※ <tctl:msg key="addr.view.picture.content" /></p>
						</form>
					</div>						
					</td>
				</tr>
				<tr>
					<th class="label"><span class="title"><tctl:msg key="conf.userinfo.name" /></span><ins class="asterisk">*</ins></th>
					<td class="form">						
						<input class="txt_mini wfix_medium" id="lastName" name="lastName" value="{{lastName}}" type="text" placeholder="<tctl:msg key="conf.userinfo.basic.lastname" /> " onkeyup="checkName()">												
						<input class="txt_mini wfix_medium" id="firstName" name="firstName" value="{{firstName}}" type="text" placeholder="<tctl:msg key="conf.userinfo.name" />" onkeyup="checkName()">												
						<input class="txt_mini wfix_medium" id="memberName" name="memberName" value="{{memberName}}" type="text" placeholder="<tctl:msg key="conf.userinfo.basic.displayname" />">						
					</td>
				</tr>
				<tr>
					<th class="label"><span class="title"><tctl:msg key="conf.userinfo.belong" /></span><ins class="asterisk">*</ins></th>
					<td class="multi_option form">
						<input class="txt_mini wfix_medium" id="companyName" name="companyName" value="{{companyName}}" type="text" placeholder="<tctl:msg key="conf.userinfo.company" />">
						<input class="txt_mini wfix_medium" id="departmentName" name="departmentName" value="{{departmentName}}" type="text" placeholder="<tctl:msg key="conf.userinfo.departmentname" />">					
						<input class="txt_mini wfix_medium" id="titleName" name="titleName" value="{{titleName}}" type="text" placeholder="<tctl:msg key="conf.userinfo.codeclass" />">															
					</td>
				</tr>
				<tr>
					<th class="label"><span class="title"><tctl:msg key="conf.userinfo.email" /></span></th>
					<td class="form">					
						<input class="txt_mini w_max" id="memberEmail" name="memberEmail" type="text" value="{{memberEmail}}" placeholder="<tctl:msg key="conf.userinfo.email" />">					
					</td>
				</tr>
				<tr>
					<th class="label"><span class="title"><tctl:msg key="addr.view.mobile.title" /></span></th>
					<td class="form">						
						<input class="txt_mini w_max" id="mobileNo" name="mobileNo" type="text" value="{{mobileNo}}" placeholder="<tctl:msg key="addr.view.mobile.title" />">						
					</td>
				</tr>
				<tr>					
					<th class="label"><span class="title"><tctl:msg key="addr.view.office.tel.title" /></span></th>					
					<td class="form">						
						<input class="txt_mini w_max" id="officeTel" name="officeTel" type="text" value="{{officeTel}}" placeholder="<tctl:msg key="addr.view.office.tel.title" />">						
					</td>
				</tr>

				<tr>
					<th class="label"><span class="title"><tctl:msg key="addr.view.office.address.title" /></span></th>
					<td class="detail_option form">
						<input class="txt_mini" type="text" id="officeBasicAddress" name="officeBasicAddress" value="{{officeBasicAddress}}" placeholder="<tctl:msg key="addr.view.office.address.title" />">
						<span class="ic_con ic_detail" evt-rol="detail-addr" title="<tctl:msg key="addr.view.address.detail.title" />"></span>

						<div id="detailofficeAddressLayerWrap" style="position:relative;display:none;z-index:1; left: 250px;top: -35px;"></div>
						<input type="hidden" id="officeAddressTemp" name="officeAddressTemp">
						<input type="hidden" id="officeCountry" name="officeCountry">
						<input type="hidden" id="officeState" name="officeState">
						<input type="hidden" id="officeCity" name="officeCity">
						<input type="hidden" id="officeExtAddress" name="officeExtAddress">
						<input type="hidden" id="officePost" name="officePost">
					</td>
				</tr>
														
				<tr>
					<th class="label"><span class="title"><tctl:msg key="conf.userinfo.basic.memo" /></span></th>
					<td class="form">
						<textarea class="w_max" id="description" name="description" value="{{description}}" placeholder="<tctl:msg key="conf.userinfo.basic.memo" />">{{description}}</textarea>
					</td>					
				</tr>
				
				{{#if homeTel}}
                <tr>
                    <th class="label"><span class="title"><tctl:msg key="addr.view.home.tel.title" /></span></th>
                       <td class="form">                                         
                          <input type="text" id="homeTel" name="homeTel" placeholder="<tctl:msg key="addr.view.home.tel.title" />"  value="{{homeTel}}" class="txt_mini edit wfix_large">                          
                       </td>
                </tr>
                {{/if}}

				{{#if homeAddress}}
				<tr>
					<th class="label"><span class="title"><tctl:msg key="addr.view.home.address.title" /></span></th>
					<td class="detail_option form">
						<input class="txt_mini" type="text" id="homeAddress" name="homeAddress" value="{{homeAddress}}" placeholder="<tctl:msg key="addr.view.home.address.title" />">
						<span class="ic_con ic_detail" evt-rol="detail-home-addr" title="<tctl:msg key="addr.view.address.detail.title" />"></span>

						<div id="detailhomeAddressLayerWrap" style="position:relative;display:none;z-index:1; left: 250px;top: -35px;"></div>
						<input type="hidden" id="homeAddressTemp" name="homeAddressTemp">
						<input type="hidden" id="homeCountry" name="homeCountry">
						<input type="hidden" id="homeState" name="homeState">
						<input type="hidden" id="homeCity" name="homeCity">
						<input type="hidden" id="homeExtAddress" name="homeExtAddress">
						<input type="hidden" id="homePost" name="homePost">
					</td>
				</tr>
 				{{/if}}

				{{#if messenger}}
				<tr>
					<th class="label"><span class="title"><tctl:msg key="conf.userinfo.messenger" /></span></th>
					<td class="form"><input class="txt_mini w_max" type="text" id="messenger" name="messenger" placeholder="<tctl:msg key="conf.userinfo.messenger" />" value="{{messenger}}"></td>
				</tr>
				{{/if}}

				{{#if officeHomepage}}
                <tr>
                    <th class="label"><span class="title"><tctl:msg key="addr.view.office.homepage.title" /></span></th>
                       <td class="form">                                         
                          <input type="text" id="officeHomepage" name="officeHomepage" placeholder="<tctl:msg key="addr.view.office.homepage.title" />"  value="{{officeHomepage}}" class="txt_mini edit wfix_large">                          
                       </td>
                </tr>
                {{/if}}

				<tr id="selectAddItem" class="line">
					<th class="label"><span class="title"><tctl:msg key="addr.view.add.type.title" /></span></th>
					<td class="form">
						<select evt-rol="select-item">
							<option><tctl:msg key="addr.view.add.type.content" /></option>							
							{{#unless homeTel}}<option value="homeTel"><tctl:msg key="addr.view.home.tel.title" /></option>{{/unless}}
							{{#unless homeAddress}}<option value="homeAddress"><tctl:msg key="addr.view.home.address.title" /></option>{{/unless}}
							{{#unless messenger}}<option value="messenger"><tctl:msg key="conf.userinfo.messenger" /></option>{{/unless}}
							{{#unless officeHomepage}}<option value="officeHomepage"><tctl:msg key="addr.view.office.homepage.title" /></option>{{/unless}}
						</select>
					</td>
				</tr>
			</tbody>
		</table>
<div id="workHiddenFrame"></div>		
</script>

<script id="addr_member_view_add_item_tmpl" type="text/x-handlebars-template">
<tr>
    <th><span class="title">{{itemName}}</span></th>
    <td>
        <span class="txt_edit">
            <input type="text" id="{{itemId}}" name="{{itemId}}" placeholder="{{itemName}}" class="input edit wfix_large">
            {{#equal itemId "homeAddress"}}
            <span title="<tctl:msg key="addr.view.address.detail.title" />" class="ic_con ic_detail" evt-rol="detail-home-addr" type="home"></span>
            <div id="detailhomeAddressLayerWrap" style="position:relative;display:none;z-index:1; left: 250px;top: -35px;"></div>
            <input type="hidden" id="homeAddressTemp" name="homeAddressTemp">
            <input type="hidden" id="homeCountry" name="homeCountry">
            <input type="hidden" id="homeState" name="homeState">
            <input type="hidden" id="homeCity" name="homeCity">
            <input type="hidden" id="homeExtAddress" name="homeExtAddress">
            <input type="hidden" id="homePost" name="homePost">
            {{/equal}}           
        </span>
    </td>
</tr>
</script>

<script id="addr_address_layer_view_tmpl" type="text/x-handlebars-template">
<div class="layer_normal layer_addr_mgmt">
    <header>
        <h1><tctl:msg key="addr.address.input.detail.title" /></h1>
        <a class="btn_layer_x" evt-rol="closeDetailAddress"><span class="ic"></span></a>
    </header>
    <div class="content">
        <table class="table_form_mini">
			<tbody>
				<tr>
					<th><span class="title"><tctl:msg key="addr.address.detail.layer.country.title" /></span></th>
					<td><input class="txt_mini" type="text" id="{{type}}Country" name="{{type}}Country"></td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="addr.address.detail.layer.post.title" /></span></th>
					<td><input class="txt_mini" type="text" id="{{type}}PostalCode" name="{{type}}PostalCode"></td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="addr.address.detail.layer.state.title" /></span></th>
					<td><input class="txt_mini" type="text" id="{{type}}State" name="{{type}}State"></td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="addr.address.detail.layer.city.title" /></span></th>
					<td><input class="txt_mini" type="text" id="{{type}}City" name="{{type}}City"></td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="addr.address.detail.layer.ext.address.title" /></span></th>
					<td><input class="txt_mini" type="text" id="{{type}}Street" name="{{type}}Street"></td>
				</tr>
			</tbody>             
		</table>
    </div>  
    <footer class="btn_layer_wrap">
        <a class="btn_major_s" evt-rol="inputDetailAddress"><span class="txt"><tctl:msg key="comn.confirm" /></span></a>
        <a class="btn_minor_s" evt-rol="closeDetailAddress"><span class="txt"><tctl:msg key="comn.cancel" /></span></a>      
    </footer>
</div>
</script>

<script id = "mail_setting_detail_addr_tmpl" type = "text/x-handlebars-template">
		<table class="form_type">
			<colgroup>
				<col width="80px"/>
				<col width="*" />
			</colgroup>
			<tbody>
				<tr>
					<th><span class="title"><tctl:msg key="addr.address.detail.layer.country.title" /></span></th>
					<td><input class="input w_max" type="text" id="officeCountry" name="officeCountry" value="{{officeCountry}}"></td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="addr.address.detail.layer.post.title" /></span></th>
					<td><input class="input w_max" type="text" id="officePostalCode" name="officePostalCode" value="{{officePostalCode}}"></td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="addr.address.detail.layer.state.title" /></span></th>
					<td><input class="input w_max" type="text" id="officeState" name="officeState" value="{{officeState}}"></td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="addr.address.detail.layer.city.title" /></span></th>
					<td><input class="input w_max" type="text" id="officeCity" name="officeCity" value="{{officeCity}}"></td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="addr.address.detail.layer.ext.address.title" /></span></th>
					<td><input class="input w_max" type="text" id="officeStreet" name="officeStreet" value="{{officeStreet}}"></td>
				</tr>
			</tbody>
		</table>			
</script>

<script id = "mail_setting_sign_tmpl" type = "text/x-handlebars-template">
<!-- 서명 기본 설정 -->
<section class="form_admin">
	<header>
		<h3><tctl:msg key="conf.sign.basic.setting" /></h3>
				<div class="optional_posi" id="signApplySelect">
					<span class="option_wrap"><input id="sign_apply" type="radio" value="T" name="signApplyRadio" {{#if signUse}}checked="checked"{{/if}}/><label for="sign_apply"><tctl:msg key="comn.apply" /></label></span>
					<span class="horspace1"></span>
                    <span class="option_wrap"><input id="sign_notapply" type="radio" value="F" name="signApplyRadio" {{#unless signUse}}checked="checked"{{/unless}}/><label for="sign_notapply"><tctl:msg key="comn.apply.cancel" /></label></span>
				</div>
	</header>
	<form>
		<fieldset>
			<table class="form_type tb_sub">
				<caption><tctl:msg key="conf.sign.basic.setting" /></caption>
				<colgroup>
					<col style="width:150px"/>
					<col/>
				</colgroup>
				<tbody>
					<tr>
						<th><span class="title"><tctl:msg key="conf.sign.forward.location" /></span></th>
						<td id="signLocationOption">
							<select id="signLocation">
								<option value="outside" {{#if outside}}selected="selected"{{/if}}><tctl:msg key="conf.sign.forward.location.bottom" /></option>
								<option value="inside" {{#unless outside}}selected="selected"{{/unless}}><tctl:msg key="conf.sign.forward.location.content" /></option>
							</select>
						</td>
					</tr>
					<tr>
						<th><span class="title"><tctl:msg key="conf.sign.list.title" /></span></th>
						<td>
							<div class="btn_func_wrap">
								<a class="btn_tool" evt-rol = "write-signData">
                                    <span class="ic_toolbar plus"></span>
									<span class="txt"><tctl:msg key="comn.add" /></span>
                                </a>
								<a class="btn_tool" evt-rol = "delete-AllsignData">
                                    <span class="ic_toolbar del"></span>
                                    <span class="txt"><tctl:msg key="comn.delete.all" /></span>
                                </a>
							</div>
							<table class="in_table tb_scroll_head">
								<colgroup>
									<col />
									<col style="width:200px" />
								</colgroup>
								<thead>
									<tr>
										<th class="align_l"><tctl:msg key="conf.sign.list.title" /></th>
										<th><tctl:msg key="comn.mgnt" /></th>
									</tr>
								</thead>
							</table>
							<!-- 스크롤 되는 영역 -->
							<div class="div_scroll div_scroll_mini">
							<table id="signListTable" class="in_table">
								<colgroup>
									<col />
									<col style="width:200px" />
								</colgroup>
								<tbody>
									{{#if signList}}
										{{#each signList}}
										<tr>
											<td><a data-sign_seq={{signSeq}}><span class="txt" evt-rol="modify-signData">{{signName}}{{#if defaultSign}}(<tctl:msg key="conf.sign.5" />){{/if}}</span></a></td>
											<input type="hidden" name="signNameHidden" value="{{signName}}">
											<td class="align_c" data-sign_seq={{signSeq}}>
												<span class="btn_fn7" evt-rol = "setting-defaultSign"><span class="txt"><tctl:msg key="conf.sign.basic.setting.button" /></span></span>
												<span class="btn_fn7" evt-rol = "modify-signData"><span class="txt"><tctl:msg key="comn.modfy" /></span></span>
												<span class="btn_fn7" evt-rol = "delete-signData"><span class="txt_caution"><tctl:msg key="comn.del" /></span></span>
											</td>
										</tr>
										{{/each}}
									{{else}}
										<tr>
											<td colspan="2">
												<p class="data_null"><span class="txt"><tctl:msg key="conf.sign.list.empty" /></span></p>
											</td>
										</tr>
									{{/if}}
								</tbody>
							</table>
							</div>
							<!-- // 스크롤 되는 영역 -->
						</td>
					</tr>
				</tbody>
			</table>
		</fieldset>
	</form>
</section>
<div class="page_action_wrap">
	<a class="btn_major" data-role="button" evt-rol = "save-sign-setting"><span class="txt"><tctl:msg key="comn.btn.save" /></span></a>
	<a class="btn_minor" data-role="button" evt-rol = "cancel-sign-setting"><span class="txt"><tctl:msg key="comn.cancel" /></span></a>
</div>
</script>

<script id="mail_setting_modify_sign_modal_tmpl" type="text/x-handlebars-template">
<!-- 서명 추가 편집 -->
    <div>
        <input type="hidden" id="signWriteType">
        <input type="hidden" id="signSeq" value="{{signSeq}}">
    	<input type="hidden" id="beforeSignName" name="beforeSignName" value="{{signName}}">
    </div>
	<table class="form_type" style="height:350px;">
		<colgroup>
		<col width="120px" />
		<col width="" />
		</colgroup>
		<tbody id="sign_body">
			<tr>
				<th><span class="title"><tctl:msg key="conf.sign.subject" /></span></th>
				<td>
					<input id="signName" class="input w_max" type="text" value="{{signName}}"/>
					<span class="vertical_wrap">
						<span class="option_wrap"><input id="defaultSign" type="checkbox" {{#if defaultSign}} checked="checked"{{/if}}><label for="all_day"><tctl:msg key="conf.sign.default" /></label></span>
						<span class="option_wrap"><input id="sign_only_image" type="checkbox" evt-rol = "change-onlyImageSignMode"><label for="sign_only_image"><tctl:msg key="conf.sign.onlyimage" /></label></span>
					</span>
				</td>
			</tr>
			<tr id="signSelectMode">
				<th><span class="title"><tctl:msg key="conf.sign.edit" /></span></th>
				<td>
					<select id="sign_mode" evt-rol = "change-SignMode" value="{{signMode}}">
						<option value="html" {{#equal signMode 'html'}}selected="selected"{{/equal}}>HTML</option>
						<option value="text" {{#equal signMode 'text'}}selected="selected"{{/equal}}>TEXT</option>
					</select>
				</td>
			</tr>
			<tr id="registSignImage">
				<th><span class="title"><tctl:msg key="conf.sign.image.upload" /></span></th>
				<td>
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
						<input type="hidden" id="maxImageSize" name="maxImageSize" value="1048576"/>
						<input type="file" multiple id="mailSimpleSignImageUpload" name="NewFile" class="TM_attFile">
					</span>
					
					<span class="desc" id="signImgSizeText"><tctl:msg key="conf.sign.image.defaultsize" /> <span id="signImageSizeDesc">100 x 120</span> pixel</span>
					<p class="desc"><tctl:msg key="conf.sign.image.info.001" /><br><tctl:msg key="conf.sign.image.info.002" /> </p>
					<span class="option_wrap" id="onlySignImgSize" evt-rol="changeImgSize">
						<input id="imgResize" type="radio" name="imgSizeFlag" value="image" {{#empty signType}}checked="checked"{{/empty}}{{#equal signType 'image'}}checked="checked"{{/equal}}/><label for="imgResize"><tctl:msg key="conf.sign.image.desc"  /></label>
						<input id="imgFullSize" type="radio" name="imgSizeFlag" value="image_full" {{#equal signType 'image_full'}}checked="checked"{{/equal}}/><label for="imgFullSize"><tctl:msg key="conf.sign.full.image.desc"  /></label>
					</span>
				</td>
			</tr>
<!-- 기본서명 > TEXT 선택한 경우 -->
			<tr>
				<th id="thumbnailImageWrap" style="height:120px;">
					<div style="position:relative">
						<div id="thumbnailImageDivWrap" style="position:absolute;{{#startWidth signType 'image'}}overflow:auto;width:670px;height:180px;{{/startWidth}}">
				    		<img id="thumbnail_image" style="border: 1px solid #cecece;" width="100" height="120" src="{{#if signImageUrl}}{{signImageUrl}}{{else}}/resources/images/photo_profile_sample.jpg{{/if}}" img-data="{{signImagePath}}" img-name="{{signImageName}}" />
							<span id="sign_img_delete" class="btn_minor_s" style="float:left; text-align:center; cursor:pointer; margin:5px 28px;{{#if signImagePath}}display:block;{{else}} display:none;{{/if}}"><tctl:msg key="mail.attach.delete"/></span>
						</div>
					</div>
				</th>
                <td>
					<div id="signText">	
						<textarea class="w_max" id="signText_Textarea" style="height:150px">{{signText}}</textarea>
					</div>
					<div id="signHtml">	
						<textarea class="w_max" id="signSmartEditor" name="signSmartEditor" style="width:100%;min-width:450px;height:300px;display:none;">{{signText}}</textarea>
					</div>
				</td>
			</tr>
		</tbody>
	</table>
<div id="writeSignDialog" title="<tctl:msg key="conf.sign.edit" />">
	<div id="writeSignContent"></div>
</div>
<div id="workHiddenFrame"></div>
</script>

<script id="mail_setting_folder_tmpl" type="text/x-handlebars-template">
	<section class="form_admin">
		<div class="dataTables_wrapper">
			<div class="tool_bar">
				<div class="critical">
					<a evt-rol="add-folder" class="btn_tool" data-role="button">
                        <span class="ic_toolbar plus"></span>
                        <span class="txt"><tctl:msg key="mail.folder.add"/></span>
                    </a>
				</div>
			</div>
			<div class="tb_sub_wrap">
			<table id="folderManageWrap" class="type_normal tb_sub tb_inbox_mgmt">
				<colgroup>
					<col></col>
					<col style="width:100px"/>
					<col style="width:100px"/>
					<col style="width:100px"/>
					<col style="width:260px"/>
				</colgroup>
				<thead>
					<tr>
						<th class="align_l mailbox"><tctl:msg key="mail.folderlist"/></th>
						<th class="expired"><tctl:msg key="mail.aging"/></th>
						<th class="unread"><tctl:msg key="mail.message.type.simple"/></th>
						<th class="align_r usage "><tctl:msg key="mail.quota"/></th>
						<th class="align_c manage"><tctl:msg key="comn.mgnt" /></th>
					</tr>
				</thead>
				<tbody>

<!-- 백업 완료 -->							
<tr style="display:none" id="empty_org">
	<td colspan="6" class="status_wrap">
		<span class="desc" id="empty_msg"></span>
		<span class="btn_wrap">
			<span class="btn_fn9" evt-rol="download-backup"><tctl:msg key="mail.backup.down"/></span>
			<span class="btn_fn9" evt-rol="delete-backup"><tctl:msg key="mail.backup.delete"/></span>
		</span>
	</td>
</tr>
				{{#each defaultFolders}}
					{{#equal fullName 'Inbox'}}	
						{{#applyTemplate "mail_setting_subfolder_tmpl" this}}{{/applyTemplate}}
					{{/equal}}
				{{/each}}
				{{#each userFolders}}
					{{#user_folder_inbox_check this true}}	
						{{#applyTemplate "mail_setting_subfolder_tmpl" this}}{{/applyTemplate}}
					{{/user_folder_inbox_check}}
				{{/each}}
				{{#each defaultFolders}}
					{{#notEqual fullName 'Inbox'}}	
						{{#equal fullName 'Spam'}}
							<c:if test="${useSpamFolder}">
							{{#applyTemplate "mail_setting_subfolder_tmpl" this}}{{/applyTemplate}}
							</c:if>
						{{else}}
							{{#applyTemplate "mail_setting_subfolder_tmpl" this}}{{/applyTemplate}}	
						{{/equal}}
					{{/notEqual}}
				{{/each}}
				{{#each userFolders}}
					{{#user_folder_inbox_check this false}}	
						{{#applyTemplate "mail_setting_subfolder_tmpl" this}}{{/applyTemplate}}
					{{/user_folder_inbox_check}}
				{{/each}}
				</tbody>
			</table>
			</div>
		</div>
	</section>
<!-- 태그 관리 -->
	<section class="form_admin">
		<div class="dataTables_wrapper">
			<div class="tool_bar">
				<div class="critical">
					<a class="btn_tool" data-role="button" evt-rol="add-tag">
                        <span class="ic_toolbar plus"></span>
                        <span class="txt"><tctl:msg key="mail.tag.add"/></span>
                    </a>
				</div>
			</div>
			<div class="tb_sub_wrap">
			<table class="type_normal tb_tag tb_sub" id="tagManageWrap">
				<colgroup>
					<col style="width:80%">
					<col style="width:20%">
				</colgroup>
				<thead>
					<tr>
						<th class="align_l"><tctl:msg key="folder.tag"/></th>
						<th class="align_r"><tctl:msg key="comn.del" /></th>
					</tr>
				</thead>
				<tbody>
				{{#each userTags}}
					<tr id="tag_row_{{id}}">
						<td class="align_l ">
							<span class="ic_tag {{color}}"><span class="tail_r"><span></span></span></span>
							<span class="txt_form">{{name}}<span class="tool_tip" evt-rol="modify-tagName" tagname="{{name}}" tagcolor="{{color}}" tagid="{{id}}"><tctl:msg key="comn.modfy" /><i class="tail"></i></span></span>
						</td>
						<td class="align_r">
							<span class="btn_fn7" evt-rol="delete-tag" tagid="{{id}}"><span class="txt_caution"><tctl:msg key="comn.del" /></span></span>
						</td>
					</tr>
					<tr id="tag_modify_area_{{id}}" style="display: none"></tr>
				{{/each}}
				</tbody>
			</table>
			</div>
		</div>
	</section>
</script>

<script id = "tag_modify_tmpl" type = "text/x-handlebars-template">
<td class="align_l">
	<span class="ic_tag {{color}}"><span class="tail_r"><span></span></span></span>
	<span class="txt_edit" data-name="{{name}}">
		<input id="tag_name_input_{{id}}" class="input edit wfix_large" type="text" value="{{name}}" name="modifyTagName" tagname="{{name}}" tagold_id="{{id}}" tagcolor="{{color}}">
		<span class="btn_wrap ui_edit_ing" fid="{{id}}">
			<span title="<tctl:msg key="common.modify.complate" />" class="ic_side ic_done" evt-rol="modify-tag"></span>
			<span title="<tctl:msg key="comn.cancel" />" class="ic_side ic_cancel" evt-rol="modify-tag-cancel"></span>
		</span>
	</span>
	<div id="modify_tag_pallete_{{id}}" style="position:relative"></div>
</td>
<td class="align_r">
	<span class="btn_fn7" evt-rol="delete-tag" tagid="{{id}}"><span class="txt_caution"><tctl:msg key="comn.del" /></span></span>
</td>
</script>

<script id = "mail_pallete_modal_tmpl" type = "text/x-handlebars-template">
<div id="mailTagPallete" class="layer_normal layer_pallete" style="position:absolute; left:13px; top:0px; z-index:1; display:">
	<a class="bgcolor1 {{#equal color 'bgcolor1'}}active{{/equal}}" color="bgcolor1">색상1</a>
	<a class="bgcolor2 {{#equal color 'bgcolor2'}}active{{/equal}}" color="bgcolor2">색상2</a>
	<a class="bgcolor3 {{#equal color 'bgcolor3'}}active{{/equal}}" color="bgcolor3">색상3</a>
	<a class="bgcolor4 {{#equal color 'bgcolor4'}}active{{/equal}}" color="bgcolor4">색상4</a>
	<a class="bgcolor5 {{#equal color 'bgcolor5'}}active{{/equal}}" color="bgcolor5">색상5</a>
	<a class="bgcolor6 {{#equal color 'bgcolor6'}}active{{/equal}} last" color="bgcolor6">색상6</a>
	<a class="bgcolor7 {{#equal color 'bgcolor7'}}active{{/equal}}" color="bgcolor7">색상7</a>
	<a class="bgcolor8 {{#equal color 'bgcolor8'}}active{{/equal}}" color="bgcolor8">색상8</a>
	<a class="bgcolor9 {{#equal color 'bgcolor9'}}active{{/equal}}" color="bgcolor9">색상9</a>
	<a class="bgcolor10 {{#equal color 'bgcolor10'}}active{{/equal}}" color="bgcolor10">색상10</a>
	<a class="bgcolor11 {{#equal color 'bgcolor11'}}active{{/equal}}" color="bgcolor11">색상11</a>
	<a class="bgcolor12 {{#equal color 'bgcolor12'}}active{{/equal}} last" color="bgcolor12">색상12</a>
	<a class="bgcolor13 {{#equal color 'bgcolor13'}}active{{/equal}}" color="bgcolor13">색상13</a>
	<a class="bgcolor14 {{#equal color 'bgcolor14'}}active{{/equal}}" color="bgcolor14">색상14</a>
	<a class="bgcolor15 {{#equal color 'bgcolor15'}}active{{/equal}}" color="bgcolor15">색상15</a>
	<a class="bgcolor16 {{#equal color 'bgcolor16'}}active{{/equal}}" color="bgcolor16">색상16</a>
	<a class="bgcolor17 {{#equal color 'bgcolor17'}}active{{/equal}}" color="bgcolor17">색상17</a>
	<a class="bgcolor18 {{#equal color 'bgcolor18'}}active{{/equal}} last" color="bgcolor18">색상18</a>
</div>
</script>

<script id = "mail_setting_subfolder_tmpl" type = "text/x-handlebars-template">
<tr class="depth{{depth}}" fname="{{fullName}}">
	<td class="name {{#if share}}shared{{/if}}">
		<a evt-rol="folder" fname="{{fullName}}">
			{{#isUserFolder fullName}}
				<ins class="ic"></ins>
				<span class="inbox_txt txt_form">{{name}}
					{{#unless smartFolder}}
					<span class="tool_tip" evt-rol="modify-folderName" previous_name="{{fullName}}"><tctl:msg key="comn.modfy" /><i class="tail"></i></span>
					{{/unless}}
				</span>
			{{else}}
				<ins class="ic"></ins>
				<span class="inbox_txt">
				{{name}}
				</span>
			{{/isUserFolder}}
		</a>
		{{#isUserFolder fullName}}
			<span class="txt_edit" style="display:none">
				<input id="modify_folder_{{id}}" value="{{displayFolderName name}}" previous_name="{{fullName}}" class="input edit wfix_large" type="text" name="modifyFolderName"  data-folder-name="{{displayFolderName name}}" />
				<span class="btn_wrap ui_edit_ing" fid="{{id}}">
					<span title="<tctl:msg key="common.modify.complate" />" class="ic_side ic_done" evt-rol="modify-folder"></span>
					<span title="<tctl:msg key="comn.cancel" />" class="ic_side ic_cancel" evt-rol="modify-folder-cancel"></span>
				</span>
			</span>
		{{/isUserFolder}}
	</td>
	<td class="expired">
		{{#isUserFolder fullName}}
			<select id="changeUserFolderAging" evt-rol = "change-UserFolderAging" data-name="{{fullName}}" data-preaging="{{aging}}" data-index="{{index}}" {{#if domainFolder}}disabled="disabled"{{/if}}>
				<option value="0" {{#selectAging groupAging aging '0'}}selected{{/selectAging}} {{#isNotgroupAgingZero groupAging}} disabled="disabled" {{/isNotgroupAgingZero}}><tctl:msg key="folder.aging.unlimited"/></option>
				<option value="30" {{#selectAging groupAging aging '30'}}selected{{/selectAging}} {{#isOvergroupAging groupAging '30'}} disabled="disabled" {{/isOvergroupAging}}><tctl:msg key="folder.aging.30"/></option>
				<option value="90" {{#selectAging groupAging aging '90'}}selected{{/selectAging}} {{#isOvergroupAging groupAging '90'}} disabled="disabled" {{/isOvergroupAging}}><tctl:msg key="folder.aging.90"/></option>
				<option value="120" {{#selectAging groupAging aging '120'}}selected{{/selectAging}} {{#isOvergroupAging groupAging '120'}} disabled="disabled" {{/isOvergroupAging}}><tctl:msg key="folder.aging.120"/></option>
				{{#isCustomAging groupAging}} 
				<option value="{{groupAging}}" {{#selectAging groupAging aging groupAging}}selected{{/selectAging}}>{{groupAging}}<tctl:msg key="folder.aging.day"/></option> 
				{{/isCustomAging}}
			</select>
		{{else}}
			{{#equal aging 0}}
				<tctl:msg key="folder.aging.unlimited"/>
			{{else}}
				{{aging}}<tctl:msg key="folder.aging.day"/>
			{{/equal}}
		{{/isUserFolder}}
	</td>
	<td class="unread"><strong>{{unseenCnt}}</strong><span class="part">/</span><span class="num">{{totalCnt}}</span></td>
	<td class="align_r usage"><span class="num">{{usageUnit}}</span></td>
	<td class="align_r manage" fname="{{fullName}}" fid="{{encName}}" data-share="{{#if share}}on{{else}}off{{/if}}" data-shareseq="{{sharedUid}}">
		{{#isUserFolder fullName}}
		{{#unless smartFolder}}
		<span class="btn_fn7" evt-rol="move-folder"><tctl:msg key="comn.move" /></span>
		<span class="btn_fn7" evt-rol="delete-folder"><span class="txt_caution"><tctl:msg key="comn.del" /></span></span>
		{{else}}
		<c:if test="${!smartFilter}">
			<span class="btn_fn7" evt-rol="delete-folder"><span class="txt_caution"><tctl:msg key="comn.del" /></span></span>
		</c:if>
		{{/unless}}
		{{#unless smartFolder}}
			<span class="btn_fn7 shareFolder" evt-rol="share-folder"><span class="txt"><tctl:msg key="menu.shared"/></span></span>
		{{/unless}}
		<span class="btn_fn7" evt-rol="upload-folder"><span class="txt"><tctl:msg key="menu.uploadmsg.simple"/></span></span>
		{{/isUserFolder}}
		<span class="btn_fn7" evt-rol="backup-folder"><span class="txt"><tctl:msg key="menu.backup"/></span></span>
		<span class="btn_fn7" evt-rol="empty-folder"><span class="txt"><tctl:msg key="menu.empty"/></span></span>
	</td>
</tr>
<tr style="display: none" id="startBackup_{{encName}}">
	<td colspan="6" class="status_wrap">
		<span class="desc">"{{name}}" <tctl:msg key="mail.backup.process"/></span>
		<span class="gage_wrap"><span id="startBackup_graph_{{encName}}" class="gage bgcolor17" style="width:0%"></span></span>
	</td>
</tr>
<!-- 백업 완료 -->							
<tr style="display: none" id="completeBackup_{{encName}}">
	<td colspan="6" class="status_wrap">
		<span class="desc"></span>
		<span class="btn_wrap">
			<span class="btn_fn9" evt-rol="download-backup"><tctl:msg key="mail.backup.down"/></span>
			<span class="btn_fn9" evt-rol="delete-backup"><tctl:msg key="mail.backup.delete"/></span>
		</span>
	</td>
</tr>
{{#if child}}
	{{#each child}}
		{{#applyTemplate "mail_setting_subfolder_tmpl" this}}{{/applyTemplate}}
	{{/each}}
{{/if}}
</script>

<script id = "mail_upload_modal_tmpl" type = "text/x-handlebars-template">
<!-- 메일 업로드 -->
<form id="messageUploadForm" name="messageUploadForm"  enctype="multipart/form-data">
	<div class="content" id="basicMsgUploadControl">
		<span class="btn_minor_s" evt-rol="upload-folder-seach"><span class="txt"><tctl:msg key="comn.file.attachment" /></span></span><input class="txt_mini w_max" type="text" id="basicMsgUploadBtn"/>
	</div>
</form>
</script>

<script id = "mail_setting_spam_tmpl" type = "text/x-handlebars-template">
				<section class="form_admin">
					<header>
						<h3><tctl:msg key="conf.spamrule.basic.title" /></h3>
					</header>
					<form>
						<fieldset>
							<table class="form_type tb_sub">
								<caption><tctl:msg key="conf.spamrule.basic.title" /></caption>
								<colgroup>
									<col style="width:190px"/>
									<col/>
								</colgroup>
								<tbody>
									<tr>
										<th><span class="title"><tctl:msg key="conf.spamrule.basic.policy" /></span></th>
										<td>
											<select id = "spamPolicy" evt-rol = "spam-policy">
												<option value="1" {{#equal spamPolicyValue '1'}} selected="selected" {{/equal}}><tctl:msg key="conf.spamrule.block.use" /></option>
												<option value="2" {{#equal spamPolicyValue '2'}} selected="selected" {{/equal}}><tctl:msg key="conf.spamrule.block.notuse" /></option>												
												<option value="3" {{#equal spamPolicyValue '3'}} selected="selected" {{/equal}}><tctl:msg key="conf.spamrule.receive.all" /></option>
												<option value="4" {{#equal spamPolicyValue '4'}} selected="selected" {{/equal}}><tctl:msg key="conf.spamrule.block.all" />, <tctl:msg key="conf.spamrule.receive.white" /></option>
											</select>
											<select id = "spamLevel" evt-rol = "spam-level">
												<option value="1" {{#equal pspamRuleLevel '3'}} selected="selected" {{/equal}}><tctl:msg key="conf.spamrule.23" /></option>
												<option value="2" {{#equal pspamRuleLevel '2'}} selected="selected" {{/equal}}><tctl:msg key="conf.spamrule.22" /></option>
												<option value="3" {{#equal pspamRuleLevel '1'}} selected="selected" {{/equal}}><tctl:msg key="conf.spamrule.21" /></option>
											</select>
										</td>
									</tr>
									<tr id = spamHandleTr>
										<th><span class="title"><tctl:msg key="conf.spamrule.24" /></span></th>
										<td>
											<select id = "spamHandle" evt-rol = "spam-handle">
												<c:if test="${useSpamFolder}">
												<option value="move Spam" {{#equal pspamPolicy 'move Spam'}} selected="selected" {{/equal}}><tctl:msg key="conf.spamrule.25" /></option>
												</c:if>
												<option value="move Trash" {{#equal pspamPolicy 'move Trash'}} selected="selected" {{/equal}}><tctl:msg key="conf.spamrule.26" /></option>
												<option value="delete" {{#equal pspamPolicy 'delete'}} selected="selected" {{/equal}}><tctl:msg key="menu.deleteforever"/></option>
											</select>
										</td>
									</tr>
									<tr id = "blackAndWhiteTr">
										<th><span class="title"><tctl:msg key="conf.spamrule.46" /></span></th>
										<td>
											<div class="btn_func_wrap">
												<a class="btn_tool" evt-rol = "mail-white-add">
                                                    <span class="ic_toolbar plus"></span>
                                                    <span class="txt"><tctl:msg key="comn.add" /></span>
                                                </a>
												<a class="btn_tool" evt-rol = "all-white-delete">
                                                    <span class="ic_toolbar del"></span>
                                                    <span class="txt"><tctl:msg key="comn.delete.all" /></span>
                                                </a>
											</div>
											<table class="in_table tb_scroll_head">
												<colgroup>
													<col />
													<col style="width:180px" />
												</colgroup>
												<thead>
													<tr>
														<th class="align_l"><tctl:msg key="conf.spamrule.46" /></th>
														<th class="align_r"><tctl:msg key="comn.mgnt" /></th>
													</tr>
												</thead>
											</table>
											<!-- 스크롤 되는 영역 -->
											<div class="div_scroll div_scroll_mini">
											<table class="in_table">
												<colgroup>
													<col />
													<col style="width:180px" />
												</colgroup>
												<tbody id = "whiteList">
													<tr id="whiteList_empty" style="display:{{#if whiteList}} none {{/if}}" >
														<td colspan="2">
															<p class="data_null"><span class="txt"><tctl:msg key="conf.spamrule.54" /></span></p>
														</td>
													</tr>
													{{#each whiteList}}
													<tr id="whiteList_txt">
														<td class="txt">{{this}}</td>
														<td class="align_r"><span class="btn_fn7" evt-rol = "mail-white-delete"><span class="txt_caution"><tctl:msg key="comn.del" /></span></span>
														</td>
													</tr>
													{{/each}}
												</tbody>
											</table>
											</div>
											<!-- // 스크롤 되는 영역 -->
										</td>
									</tr>
									<tr id = "blackListTr">
										<th><span class="title"><tctl:msg key="conf.spamrule.49" /></span></th>
										<td>
											<div class="btn_func_wrap">
												<a class="btn_tool" evt-rol = "mail-black-add">
                                                    <span class="ic_toolbar plus"></span>
                                                    <span class="txt"><tctl:msg key="comn.add" /></span>
                                                </a>
												<a class="btn_tool" evt-rol = "all-black-delete">
                                                    <span class="ic_toolbar del"></span>
                                                    <span class="txt"><tctl:msg key="comn.delete.all" /></span>
                                                </a>
											</div>
											<table class="in_table tb_scroll_head">
												<colgroup>
													<col />
													<col style="width:180px" />
												</colgroup>
												<thead>
													<tr>
														<th class="align_l"><tctl:msg key="conf.spamrule.49" /></th>
														<th class="align_r"><tctl:msg key="comn.mgnt" /></th>
													</tr>
												</thead>
											</table>
											<!-- 스크롤 되는 영역 -->
											<div class="div_scroll div_scroll_mini">
											<table class="in_table">
												<colgroup>
													<col />
													<col style="width:180px" />
												</colgroup>
												<tbody id = "blackList">
													<tr id = "blackList_empty" style="display:{{#if blackList}}none{{/if}}">
														<td colspan="2">
															<p class="data_null"><span class="txt"><tctl:msg key="conf.spamrule.55" /></span></p>
														</td>
													</tr>
												{{#each blackList}}
													<tr id = "blackList_txt">
														<td class="txt">{{this}}</td>
														<td class="align_r">
															<span class="btn_fn7" evt-rol = "mail-black-delete"><span class="txt_caution"><tctl:msg key="comn.del" /></span></span>
														</td>
													</tr>
												{{/each}}
												</tbody>
											</table>
											</div>
											<!-- // 스크롤 되는 영역 -->
										</td>
									</tr>
								</tbody>
							</table>
						</fieldset>
					</form>
				</section>
<!-- btn_wrap -->
				<div class="page_action_wrap">
					<a class="btn_major" data-role="button" evt-rol="save-spam-setting"><span class="txt"><tctl:msg key="comn.btn.save" /></span></a>
					<a class="btn_minor" data-role="button" evt-rol="spam-setting-cancel"><span class="txt"><tctl:msg key="comn.cancel" /></span></a>
				</div>
</script>

<script id = "mail_setting_filter_tmpl" type = "text/x-handlebars-template">

				<section class="form_admin">
					{{#if smartFilter}}
					<header>
						<h3><tctl:msg key="conf.filter.59" /></h3>
					</header>
					<form>
						<fieldset>
							<table class="form_type">
								<caption><tctl:msg key="conf.filter.59" /></caption>
								<colgroup>
									<col style="width:148px">
									<col>
								</colgroup>
								<tbody>
								<tr>
									<th><span class="title"><tctl:msg key="conf.filter.60" /></span></th>
									<td>
										<div class="mail_smart_sort">
											<span class="option_wrap">
												<input type="radio" value="on" id="billboxOn" name="billbox"  {{#if apply.billbox}}checked="checked"{{/if}}/>
												<label for="billboxOn"><tctl:msg key="comn.use.check" /></label>
											</span>
											<span class="horspace1"></span>
											<span class="option_wrap">
												<input type="radio" value="off" id="billboxOff" name="billbox" {{#unless apply.billbox}}checked="checked"{{/unless}}>
												<label for="billboxOff"><tctl:msg key="comn.use.check.cancel" /></label>
											</span>
											<p class="desc"><tctl:msg key="conf.filter.61" /></p>
										</div>
									</td>
								</tr>
								<tr>
									<th><span class="title"><tctl:msg key="conf.filter.62" /></span></th>
									<td>
										<div class="mail_smart_sort">
											<span class="option_wrap">
												<input type="radio" value="on" id="advboxOn" name="advbox"  {{#if apply.advbox}}checked="checked"{{/if}}>
												<label for="advboxOn"><tctl:msg key="comn.use.check" /></label>
											</span>
											<span class="horspace1"></span>
											<span class="option_wrap">
												<input type="radio" value="off" id="advboxOff" name="advbox" {{#unless apply.advbox}}checked="checked"{{/unless}}>
												<label for="advboxOff"><tctl:msg key="comn.use.check.cancel" /></label>
											</span>
											<p class="desc"><tctl:msg key="conf.filter.63" /></p>
										</div>
									</td>
								</tr>
								<tr>
									<th><span class="title"><tctl:msg key="conf.filter.64" /></span></th>
									<td>
										<div class="mail_smart_sort">
											<span class="option_wrap">
												<input type="radio" value="on" id="snsboxOn" name="snsbox"  {{#if apply.snsbox}}checked="checked"{{/if}}>
												<label for="snsboxOn"><tctl:msg key="comn.use.check" /></label>
											</span>
											<span class="horspace1"></span>
											<span class="option_wrap">
												<input type="radio" value="off" id="snsboxOff" name="snsbox" {{#unless apply.snsbox}}checked="checked"{{/unless}}>
												<label for="snsboxOff"><tctl:msg key="comn.use.check.cancel" /></label>
											</span>
											<p class="desc"><tctl:msg key="conf.filter.65" /></p>
										</div>
									</td>
								</tr>
								</tbody>
							</table>
						</fieldset>
					</form>
					{{/if}}
					<header>
						<h3><tctl:msg key="conf.filter.8" /></h3>
						<div class="optional_posi">
							<span class="option_wrap"><input id="filter_apply" type="radio" name="filterApplyFlg" value="on" {{#if apply.filter}}checked="checked"{{/if}}/><label for="filter_apply"><tctl:msg key="comn.apply" /></label></span>
							<span class="horspace1"></span>
                            <span class="option_wrap"><input id="filter_notapply" type="radio" name="filterApplyFlg" value="off" {{#unless apply.filter}}checked="checked"{{/unless}}/><label for="filter_notapply"><tctl:msg key="comn.apply.cancel" /></label></span>
						</div>
					</header>
					<form>
						<fieldset>
							<table class="form_type">
								<caption><tctl:msg key="conf.filter.8" /></caption>
								<colgroup>
									<col style="width:148px" />
									<col />
								</colgroup>
								<tbody>
									<tr>
										<th><span class="title"><tctl:msg key="conf.filter.8" /></span></th>
										<td>
											<div class="btn_func_wrap">
												<a class="btn_tool" evt-rol="auto-filter-add">
                                                    <span class="ic_toolbar plus"></span>
                                                    <span class="txt"><tctl:msg key="comn.add" /></span>
                                                </a>
												<a class="btn_tool" evt-rol="all-filter-delete">
                                                    <span class="ic_toolbar del"></span>
                                                    <span class="txt"><tctl:msg key="comn.delete.all" /></span>
                                                </a>
											</div>
											<table class="in_table tb_scroll_head tb_sub">
												<colgroup>
													<col />
													<col style="width:150px" />
													<col style="width:200px" />
													<col style="width:150px" />													
												</colgroup>
												<thead>
													<tr>
														<th class="align_l"><span class="option_wrap"><tctl:msg key="conf.filter.21" /></span></th>
														<th class="align_c"><span class="option_wrap"><tctl:msg key="conf.forward.20" /></span></th>
														<th class="align_c"><span class="option_wrap"><tctl:msg key="conf.filter.32" />/<tctl:msg key="folder.tag"/></span></th>
														<th class="align_c"><span class="option_wrap"><tctl:msg key="comn.mgnt" /></span></th>
														<!--<th class="last"><span class="option_wrap"><tctl:msg key="conf.forward.33" /></span></th>-->
													</tr>
												</thead>
											</table>
											<!-- 스크롤 되는 영역 -->
											<div class="div_scroll" evt-rol="auto-filter-table" style="height:200px">
											<table class="in_table tb_scroll_body">
												<colgroup>
													<col />
													<col style="width:150px" />
													<col style="width:200px" />
													<col style="width:150px" />													
												</colgroup>
												<tbody id = "autoFilter">
													{{#if filterList}}
													{{#each filterList}}
													<tr>
														<td>
															{{#each subcondList}}
																<p>
																{{#equal field "FROM"}}<tctl:msg key="conf.filter.48" />{{/equal}}																
																{{#equal field "TO"}}<tctl:msg key="conf.filter.49" />{{/equal}}
																{{#equal field "SUBJECT"}}<tctl:msg key="conf.filter.50" />{{/equal}}
																'<b>{{pattern}}</b>' <tctl:msg key="conf.filter.30" /></p>
															{{/each}}
														</td>
														<td class="align_c">{{#equal subcondList.length 1}}-{{else}}{{#equal operation 'and'}}<tctl:msg key="conf.filter.66" />{{else}}<tctl:msg key="conf.filter.68" />{{/equal}}{{/equal}}</td>
														<td class="align_c">{{#if tagPolicy}}{{viewTagName policy}}{{else}}{{viewMoveFolderName policy}}{{/if}}</td>
														<td class="align_c">
															<span class="btn_fn7"><span class="txt" condseq="{{condSeq}}" evt-rol="modify-filter"><tctl:msg key="comn.modfy" /></span></span>
															<span class="btn_fn7"><span class="txt_caution" condseq="{{condSeq}}" evt-rol="delete-filter"><tctl:msg key="comn.del" /></span></span>
														</td>
														<!--
														<td class="align_c">
															<span class="ic ic_low"></span>
														</td>
														-->
													</tr>
													{{/each}}
													{{else}}
													<tr>
														<td colspan="4">
															<p class="data_null"><span class="txt"><tctl:msg key="conf.filter.list.empty" /></span></p>
														</td>
													</tr>
													{{/if}}										
												</tbody>
											</table>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</fieldset>
					</form>
				</section>
				<div class="page_action_wrap">
					<a class="btn_major" data-role="button" evt-rol="save-auto-filter"><span class="txt"><tctl:msg key="comn.btn.save" /></span></a>
					<a class="btn_minor" data-role="button" evt-rol="auto-filter-cancel"><span class="txt"><tctl:msg key="comn.cancel" /></span></a>
				</div>
</script>

<script id = "mail_setting_forward_tmpl" type = "text/x-handlebars-template">
<section class="form_admin">
					<header>
						<h3><tctl:msg key="conf.forward.34" /></h3>
						<div class="optional_posi">
							<span class="option_wrap"><input id="forward_apply" type="radio" name="forwardApplyFlag" value="on" {{#equal apply 'on'}}checked="checked"{{/equal}}/><label for="forward_apply"><tctl:msg key="comn.apply" /></label></span>
							<span class="horspace1"></span>
                            <span class="option_wrap"><input id="forward_notApply" type="radio" name="forwardApplyFlag" value="off" {{#notEqual apply 'on'}}checked="checked"{{/notEqual}}/><label for="forward_notApply"><tctl:msg key="comn.apply.cancel" /></label></span>
						</div>
					</header>
					<form>
						<fieldset>
							<table class="form_type tb_sub">
								<caption><tctl:msg key="conf.forward.35" /></caption>
								<colgroup>
									<col style="width:190px" />
									<col />
								</colgroup>
								<tbody>
									<tr>
										<th><span class="title"><tctl:msg key="conf.forward.35" /></span></th>
										<td>
											<select id="forwardMode" evt-rol="forward-mode">
												<option value="forwarding" {{#equal forwardMode 'forwarding'}} selected="selected" {{/equal}}><tctl:msg key="conf.forward.8" /></option>
												<option value="forwardingonly" {{#equal forwardMode 'forwardingonly'}} selected="selected" {{/equal}}><tctl:msg key="conf.forward.9" /></option>
											</select>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.forward.21" /></span></th>
										<td>
											<div class="btn_func_wrap">
												<a class="btn_tool" evt-rol = "forward-mail-add">
                                                    <span class="ic_toolbar plus"></span>
                                                    <span class="txt"><tctl:msg key="comn.add" /></span>
                                                </a>
												<a class="btn_tool" evt-rol = "forward-all-delete">
                                                    <span class="ic_toolbar del"></span>
                                                    <span class="txt"><tctl:msg key="comn.delete.all" /></span>
                                                </a>
											</div>
											<table class="in_table tb_scroll_head">
												<colgroup>
													<col />
													<col style="width:90px" />
													
												</colgroup>
												<thead>
													<tr>
														<th class="align_l"><tctl:msg key="conf.forward.21" /></th>
														<th><tctl:msg key="comn.mgnt" /></th>
													</tr>
												</thead>
											</table>
											<!-- 스크롤 되는 영역 -->
											<div class="div_scroll div_scroll_mini">
											<table class="in_table">
												<tbody id="forwardMailList">
												{{#if forwardingAddress}}
													{{#each forwardingAddress}}
													<tr id="forward_mail_list">
														<td class="forwardMailList">{{this}}</td>
														<td class="align_r"><span class="btn_fn7" evt-rol = "forward-mail-delete"><span class="txt_caution"><tctl:msg key="comn.del" /></span></span></td>
													</tr>
													{{/each}}	
												{{/if}}
													<tr id="forwardMailList_empty_area" style="display: {{#if forwardingAddress}} none {{/if}}">
														<td colspan="2">
															<p class="data_null"><span class="txt"><tctl:msg key="conf.forward.36" /></span></p>
														</td>
													</tr>
												</tbody>
											</table>
											</div>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.forward.18" /></span></th>
										<td>
											<div class="btn_func_wrap">
												<a class="btn_tool" evt-rol="exception-forward-add">
                                                    <span class="ic_toolbar plus"></span>
                                                    <span class="txt"><tctl:msg key="comn.add" /></span>
                                                </a>
												<a class="btn_tool" evt-rol="exception-forward-delete-all">
                                                    <span class="ic_toolbar del"></span>
                                                    <span class="txt" ><tctl:msg key="comn.delete.all" /></span>
                                                </a>
											</div>
											<table class="in_table tb_scroll_head">
												<colgroup>
													<col />
													<col style="width:200px" />
													<col style="width:100px" />
													<col style="width:16px" />
												</colgroup>
												<thead>
													<tr>
														<th class="align_l"><tctl:msg key="conf.forward.37" /></th>
														<th><tctl:msg key="conf.forward.12" /></th>
														<th><tctl:msg key="comn.mgnt" /></th>
														<th class="scroll_blank"></th>
													</tr>
												</thead>
											</table>
											<!-- 스크롤 되는 영역 -->
											<div class="div_scroll div_scroll_mini">
											<table class="in_table tb_scroll_body">
												<colgroup>
													<col />
													<col style="width:200px" />
													<col style="width:100px" />
												</colgroup>
												<tbody id="defineForwardList" data-forward_list_num=0>
													{{#each defineForwardList}}
													<tr class="defineForwarList_value" data-index="{{defineForwardingSeq}}" data-address="{{fromAddress}}" data-domain="{{fromDomain}}">
														<td class="defineRuleValue">{{#if fromAddress}} {{fromAddress}} {{/if}} {{#if fromDomain}} {{fromDomain}} {{/if}}</td>
														<td class="align_c" id="seq{{defineForwardingSeq}}">
														{{#each forwardingAddressList}}														
															<label>{{this}}<br/></label>															
														{{/each}}
														</td>
														<td class="align_c">
															<span class="btn_fn7"><span class="txt" evt-rol="modify-ext-rule" 
																data-address="{{fromAddress}}" data-domain="{{fromDomain}}" 
																data-index="{{defineForwardingSeq}}"><tctl:msg key="comn.modfy" /></span></span>
															<span class="btn_fn7" evt-rol="delete-ext-rule" data-index="{{defineForwardingSeq}}"><span class="txt_caution" ><tctl:msg key="comn.del" /></span></span>
														</td>	
													</tr>
													{{/each}}
													<tr id="defineForwarList_empty_area" style="display: {{#if defineForwarList}} none {{/if}}">
														<td colspan="3">
															<p class="data_null"><span class="txt"><tctl:msg key="conf.forward.36" /></span></p>
														</td>
													</tr>													
												</tbody>
											</table>

											<select id="removeDefineForwardList" style="display:none"></select>
											<input type="hidden" id="removeAllDefineForward"/>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</fieldset>
					</form>
				</section>
				<div class="page_action_wrap">
					<a class="btn_major" data-role="button" evt-rol="save-auto-forward"><span class="txt"><tctl:msg key="comn.btn.save" /></span></a>
					<a class="btn_minor" data-role="button" evt-rol="auto-forward-cancel"><span class="txt"><tctl:msg key="comn.cancel" /></span></a>
				</div>
</script>

<script id = "mail_defineForwarList_tmpl" type = "text/x-handlebars-template">
<tr id="defineForwarList_txt" data-domain="{{from_domain}}" data-address="{{from_address}}" data-index="{{defineForwardingSeq}}">
	<td>{{#if from_address}} {{from_address}} {{/if}} {{#if from_domain}} {{from_domain}} {{/if}}</td>
	<td class="align_c" id="seq{{defineForwardingSeq}}">
	{{#each forwarding_address_list}}														
		<label>{{forwarding_address_list}}<br/></label>				
	{{/each}}
	</td>
	<td class="align_c">
		<span class="btn_fn7"><span class="txt" id="{{defineForwardingSeq}}" evt-rol="modify-ext-rule"
			data-address="{{from_address}}" data-domain="{{from_domain}}"
			data-index="{{defineForwardingSeq}}"><tctl:msg key="comn.modfy" /></span></span>
		<span class="btn_fn7" evt-rol="delete-ext-rule"><span class="txt_caution" data-index="{{defineForwardingSeq}}"><tctl:msg key="comn.del" /></span></span>
	</td>	
</tr>
</script>
<script id = "mail_setting_reply_tmpl" type = "text/x-handlebars-template">
<section class="form_admin">
					<header>
						<h3><tctl:msg key="conf.autoreply.10" /></h3>
						<div class="optional_posi">
							<span class="option_wrap"><input id="reply_apply" type="radio" name="applyFlag" value="on" {{#if useAutoReply}}checked="checked"{{/if}}/><label for="reply_apply"><tctl:msg key="comn.apply" /></label></span>
                            <span class="horspace1"></span>
							<span class="option_wrap"><input id="reply_notApply" type="radio" name="applyFlag" value="off" {{#unless useAutoReply}}checked="checked"{{/unless}}/><label for="reply_notApply"><tctl:msg key="comn.apply.cancel" /></label></span>
						</div>
					</header>
					<form>
						<fieldset>
							<table class="form_type">
								<caption><tctl:msg key="conf.autoreply.13" /></caption>
								<colgroup>
									<col style="width:190px"/>
									<col/>
								</colgroup>
								<tbody>
									<tr>
										<th><span class="title"><tctl:msg key="conf.autoreply.13" /></span></th>
										<td>
											<div class="select_direct">
											<span class="noti_date_wrap option_wrap">
												<label>
													<input id="startTime" name="startTime" class="input wfix_medium" type="text" readonly="readonly" value="{{printFormatDate startTime 'YYYY-MM-DD'}}">
													<span class="ic ic_calendar" style="margin-top:-10px"></span>
												</label>
											</span>
											<span class="date_wave">~</span>
											<span class="noti_date_wrap option_wrap">
												<label>
													<input id="endTime" name="endTime" class="input wfix_medium" type="text" readonly="readonly" value="{{printFormatDate endTime 'YYYY-MM-DD'}}">
													<span class="ic ic_calendar" style="margin-top:-10px"></span>	
													<span class="btn_wrap" title="<tctl:msg key="comn.show.calendar" />"></span>
												</label>
											</div>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.autoreply.title" /></span></th>
										<td>
											<input class="input w_max" type="text" id="autoReplySubject" name="autoReplySubject" value="{{subject}}">
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.autoreply.21" /></span></th>
										<td>
											<textarea class="w_max" id="autoReplyText" name="autoReplyText">{{content}}</textarea>
										</td>
									</tr>
									<tr>
										<th><span class="title"><tctl:msg key="conf.autoreply.14" /></span></th>
										<td>
											<select id="replyMode" evt-rol="reply-mode">
												<option value="REPLYALL" {{#equal replyMode 'REPLYALL'}} selected="selected" {{/equal}}><tctl:msg key="conf.autoreply.16" /></option>
												<option value="REPLYWHITE" {{#equal replyMode 'REPLYWHITE'}} selected="selected" {{/equal}}><tctl:msg key="conf.autoreply.18" /></option>
											</select>
											<!-- 지정한 응답 대상자에게만 부재중 응답 -->
											<div id="reply_mode_area" class="option_display2" {{#equal replyMode 'REPLYALL'}} style="display: none"{{/equal}}>
												<div class="btn_func_wrap">
													<a class="btn_tool" evt-rol="reply-mail-add">
                                                        <span class="ic_toolbar plus"></span>
                                                        <span class="txt"><tctl:msg key="comn.add" /></span>
                                                    </a>
													<a class="btn_tool" evt-rol="reply-mail-delete-all">
                                                        <span class="ic_toolbar del"></span>
                                                        <span class="txt"><tctl:msg key="comn.delete.all" /></span>
                                                    </a>
												</div>
												<table class="in_table tb_scroll_head">
													<colgroup>
														<col />
														<col style="width:180px" />
													</colgroup>
													<thead>
														<tr>
															<th class="align_l"><tctl:msg key="conf.autoreply.20" /></th>
															<th><tctl:msg key="comn.mgnt" /></th>
														</tr>
													</thead>
												</table>
												<div class="div_scroll div_scroll_mini">
												<table class="in_table">
													<tbody id="mail_add_list">
													{{#if replyAddressList}} 
														{{#each replyAddressList}}
														<tr id="reply_mail_list">
															<td class="reply_address">{{this}}</td>
															<td class="align_r">
																<span class="btn_fn7" evt-rol="reply-mail-delete"><span class="txt_caution"><tctl:msg key="comn.del" /></span></span>
															</td>
														</tr>
														{{/each}} 
													{{/if}} 
														<tr id="mail_list_empty" class="last" style="display: {{#if replyAddressList}} none {{/if}}">
															<td colspan="2">
																<p class="data_null"><span class="txt"><tctl:msg key="conf.forward.36" /></span></p>
															</td>
														</tr>
													</tbody>
												</table>
												</div>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</fieldset>
					</form>
				</section>
				<div class="page_action_wrap">
					<a class="btn_major" data-role="button" evt-rol="save-auto-reply"><span class="txt"><tctl:msg key="comn.btn.save" /></span></a>
					<a class="btn_minor" data-role="button" evt-rol="auto-reply-cancel"><span class="txt"><tctl:msg key="comn.cancel" /></span></a>
				</div>
</script>

<script id = "mail_setting_mailadd_tmpl" type = "text/x-handlebars-template">
<!-- 메일 추가 -->
	<div class="content">
		<input id="add_mail_name" class="txt_mini w_max" type="text" />
	</div>
<!-- //메일 추가 --> 
</script>

<script id = "mail_setting_ext_tmpl" type = "text/x-handlebars-template">
<section class="form_admin">
	<header>
		<h3><tctl:msg key="conf.pop.29" /></h3>
	</header>
	<div class="dataTables_wrapper">
		<div class="tool_bar">
			<div class="critical">
				<a class="btn_tool" data-role="button" evt-rol="ext-mail-add">
                    <span class="ic_toolbar plus"></span>
                    <span class="txt"><tctl:msg key="comn.add" /></span>
                </a>
				<a class="btn_tool" data-role="button" evt-rol="ext-mail-delete-all">
                    <span class="ic_toolbar del"></span>
                    <span class="txt"><tctl:msg key="comn.delete.all" /></span>
                </a>
			</div>
		</div>
		<div class="tb_sub_wrap">
		<table class="type_normal tb_sub list_mail002">
			<thead>
				<tr>
					<th class="pop3"><tctl:msg key="conf.pop.31" /></th>
					<th class="port"><tctl:msg key="conf.pop.39" /></th>
					<th class="ssl"><tctl:msg key="conf.pop.62" /></th>
					<th class="id"><tctl:msg key="conf.pop.32" /></th>
					<th class="savemail"><tctl:msg key="conf.pop.30" /></th>
					<th class="delete"><tctl:msg key="conf.pop.24" /></th>
					<th class="action"><tctl:msg key="comn.mgnt" /></th>
				</tr>
			</thead>
			<tbody id="pop3Vo">
				<tr id="pop3Vo_empty" class="last" style="display: {{#if pop3Vo}} none {{/if}}">
					<td colspan="7">
					<p class="data_null"><span class="txt"><tctl:msg key="conf.pop.63" /></span></p>
					</td>
				</tr>
			{{#each parentFolder}}
			<!--<input type="hidden" data-name="{{name}}" data-full-name="{{fullName}}"/>-->
			{{/each}}
				{{#each pop3Vo}}
				<tr>
					<td class="pop3">{{pop3Host}}</td>
					<td class="port">{{pop3Port}}</td>
					<td class="ssl">{{#if usedSsl}}<tctl:msg key="comn.use.check.simple" />{{else}}<tctl:msg key="comn.use.check.cancel.simple" />{{/if}}</td>
					<td class="id">{{pop3Id}}</td>
					<td class="savemail">{{viewMoveFolderName pop3Boxname}}</td>
					<td class="delete">{{#if pop3Del}}<tctl:msg key="comn.del" />{{else}}<tctl:msg key="comn.preserve" />{{/if}}</td>
					<td class="action">
						<span class="btn_fn7"><span class="txt" evt-rol="ext-mail-modify" pop3host="{{pop3Host}}" pop3id="{{pop3Id}}"><tctl:msg key="comn.modfy" /></span></span>
						<span class="btn_fn7"><span class="txt_caution" pop3host="{{pop3Host}}" pop3id="{{pop3Id}}" evt-rol="ext-mail-delete"><tctl:msg key="comn.del" /></span></span>
					</td>
				</tr>
				{{/each}}
			</tbody>
		</table>
		</div>
	</div>
</section>
</script>

<script id = "mail_setting_rcpt_tmpl" type = "text/x-handlebars-template">
<section class="form_admin">
	<div class="dataTables_wrapper">
		<div class="tool_bar">
			<div class="critical">
				<a class="btn_tool" evt-rol="lastrcpts-delete-all">
                    <span class="ic_toolbar del"></span>
                    <span class="txt"><tctl:msg key="comn.delete.all" /></span>
                </a>
			</div>
		</div>
		<div class="tb_sub_wrap">
			<table class="type_normal tb_sub">
				<colgroup>
					<col>
					<col style="width:80px">
				</colgroup>
				<thead>
				<tr>
					<th class="align_l"><tctl:msg key="conf.lastrcpt.list" /></th>
					<th><tctl:msg key="comn.mgnt" /></th>
				</tr>
				</thead>
			</table>
		</div>
		<div class="div_scroll" style="max-height:540px;">
			<input type="hidden" id="rcptList" value=""/>
			<table class="type_normal tb_sub">
				<tbody id="rcptbody">
				<tr id="rcptbodyEmpty" class="last" style="display: {{#if this}} none {{/if}}">
					<td colspan="7">
					<p class="data_null"><span class="txt"><tctl:msg key="conf.lastrcpt.002" /></span></p>
					</td>
				</tr>
				{{#each this}}
				<tr id="rcptData">
					<td class="align_l">{{#if ../mailExposure}}{{address}}{{else}}{{getEmailNotInCompanyDomain ../../companyDomainList address}}{{/if}}</td>
					<td class="align_r"><span class="btn_fn7 deleteBtn" evt-rol="lastrcpts-delete" data-seq="{{rcptSeq}}"><span class="txt_caution"><tctl:msg key="comn.del" /></span></span></td>
				</tr>
				{{/each}}
				</tbody>
			</table>
		</div>
	</div>
</section>
<!-- btn_wrap -->
<div class="page_action_wrap">
	<a class="btn_major" data-role="button" evt-rol="save-rcpt"><span class="txt"><tctl:msg key="comn.btn.save" /></span></a>
	<a class="btn_minor" data-role="button" evt-rol="rcpt-setting-cancel"><span class="txt"><tctl:msg key="comn.cancel" /></span></a>
</div>
</script>

<script id="mail_setting_spam_modal_white_tmpl" type="text/x-handlebars-template">
	<div class="content">
		<input class="txt_mini w_max" type="text" id="addWhiteMail"/>
	</div>
</script>

<script id="mail_setting_spam_modal_black_tmpl" type="text/x-handlebars-template">
	<div class="content">
		<input class = "txt_mini w_max" type="text" id="addBlackMail"/>
	</div>
</script>

<script id="mail_setting_spam_modal_tmpl" type="text/x-handlebars-template">
	<div class="content">
		<input class="txt_mini w_max" type="text" id="addMail"/>
	</div>
</script>

<script id="mail_ext_forward_modal_tmpl" type="text/x-handlebars-template">
	<div class="content">
		<input class = "txt_mini w_max" type="text" id="addExtForwardMail"/>
	</div>
</script>

<script id="mail_setting_modal_filter_tmpl" type="text/x-handlebars-template">
		<input type="hidden" id="filterCondSeq" name="filterCondSeq" value="{{condSeq}}"/>
		<ul class="normal">
			<li>				
				<label>
					<strong class="align_r"><tctl:msg key="conf.filter.48" /></strong>
					<input class="txt_mini" type="text" id="setting_filter_sender" name="sender" value="{{#each subcondList}}{{#equal field "FROM"}}{{pattern}}{{/equal}}{{/each}}"/>								
					<span class="txt"><tctl:msg key="conf.filter.23" /></span>
				</label>
			</li>
			<li>				
				<label>
					<strong class="align_r"><tctl:msg key="conf.filter.49" /></strong>
					<input class="txt_mini" type="text" id="setting_filter_receiver" name="receiver" value="{{#each subcondList}}{{#equal field "TO"}}{{pattern}}{{/equal}}{{/each}}"/>
					<span class="txt"><tctl:msg key="conf.filter.23" /></span>
				</label>					 
			</li>
			<li>				
				<label>
					<strong class="align_r"><tctl:msg key="conf.filter.50" /></strong>
					<input class="txt_mini" type="text" id="setting_filter_subject" name="subject" value="{{#each subcondList}}{{#equal field "SUBJECT"}}{{pattern}}{{/equal}}{{/each}}"/>
					<span class="txt"><tctl:msg key="conf.filter.23" /></span>
				</label>					 
			</li>
		</ul>
		<div id="settingFilterCondOperationWrap" style="display:none;">
			<hr />
			<span class="wrap_opt">
				<input type="radio" id="settingFilterOperationAnd" name="filterOperation" value="and" {{#notEqual operation 'or'}}checked{{/notEqual}}/>
				<label for="settingFilterOperationAnd" class="txt_radio">
					<strong>
					<tctl:msg key="conf.filter.66" /> - 
					<tctl:msg key="conf.filter.67" />
					</strong>
				</label>
			</span>
			<br>
			<span class="wrap_opt">
				<input type="radio" id="settingFilterOperationOr" name="filterOperation" value="or" {{#equal operation 'or'}}checked{{/equal}}/>
					<label for="settingFilterOperationOr" class="txt_radio">
					<strong>
						<tctl:msg key="conf.filter.68" /> - 
						<tctl:msg key="conf.filter.69" />
					</strong>
					</label>
			</span>
		</div>
		<hr />
		<ul class="normal">		
			<li>
				<div class="title">
					<input id="settingFilterFolderSave" type="radio" name="autoFilterSelect" value="folder" evt-rol="move-folder" checked="checked"><label class="txt_radio" for="settingFilterFolderSave"><tctl:msg key="conf.filter.54" /></label>
				</div>			 		
				<div class="data">					
					<select id="settingFilterSaveFolder">											
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
					<input id="newFolderSaver" type="radio" name="autoFilterSelect" value="newFolder" evt-rol="move-newFolder"><label class="txt_radio" for="newFolderSaver"><tctl:msg key="conf.filter.55" /></label>
				</div>
				<div class="data">
					<select id="settingFilterSaveNewFolder" disabled="">
						<option value=""><tctl:msg key="mail.folder.parent.select.msg"/></option>
						<option value="Inbox"><tctl:msg key="folder.inbox"/></option>
						{{#applyTemplate "mail_folder_add_selectbox_tmpl" folderList}}{{/applyTemplate}}
	                </select>   	
					<input class="txt_mini" type="text" disabled="" id="settingFilterInputBoxName" placeholder="<tctl:msg key="mail.folder.add.title"/>" />							
				</div>					
			</li>
			<li>
				<div class="title">
					<input id="settingFilterSetTag" type="radio" name="autoFilterSelect" value="tag" evt-rol="set-tag"><label for="settingFilterSetTag"><tctl:msg key="conf.filter.56" /></label>
				</div>
				<div class="data">
					<select id="settingFilterTagList" disabled="">
						<option value="" selected="selected"><tctl:msg key="mail.tag.select"/></option>
						{{#each tagList}}
						<option value="{{id}}">{{name}}</option>
						{{/each}}
					</select>	
				</div>	
			</li>	
			<li>
				<div class="title">
					<input type="radio" id="settingFilterSetNewTag" name="autoFilterSelect" value="newTag" evt-rol="set-new-tag"><label for="settingFilterSetNewTag"><tctl:msg key="conf.filter.57" /></label>
				</div>
				<div class="data">	
					<input id="settingFilterNewTagName" class="txt_mini" type="text" placeholder="<tctl:msg key="mail.tag.add.title"/>">
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
<script id = "mail_forward_except_modal_tmpl" type = "text/x-handlebars-template">
		<input type="hidden" name="defineForwardingSeq" id="defineForwardingSeq" value="{{defineForwardingSeq}}">
		<input type="hidden" id="forwardingPrevName" value="{{defineValue}}"/>
		<div class="vertical_wrap_s">
			<select id="defineType">
				<option value="mail" {{#equal defineType 'mail'}} selected="selected" {{/equal}}><tctl:msg key="conf.forward.27" /></option>
				<option value="domain" {{#equal defineType 'domain'}} selected="selected" {{/equal}}><tctl:msg key="conf.forward.28" /></option>
			</select>
			<input class="txt_mini w_medium" type="text" value="{{defineValue}}" name="defineValue" id="defineValue" />
		</div>	
		<div class="vertical_wrap_s">
			<p class="desc"><tctl:msg key="conf.forward.26" /></p>
			<input class="txt_mini w_max" type="text" id="defineForwardingAddressText"/>			
		</div>	
		<div>
			<span id="exceptForwardList" class="btn_wrap btn_item_wrap">
				<span class="btn_fn4_b" evt-rol="forward-except-add"><tctl:msg key="comn.add" /></span>
				<span class="btn_fn4_b" evt-rol="forward-except-delete"><tctl:msg key="comn.del" /></span>
				<span class="btn_fn4_b" evt-rol="forward-except-all-delete"><tctl:msg key="comn.delete.all" /></span>
			</span>
			<div class="box_wrap div_scroll div_scroll_mini" style="height:100px">
				<ul id="defineForwardingList" class="list_line_no">
				{{#each defineList}}
					<input type="hidden" dlist="defineList" value="{{didSaveDefineValue}}"/>
				{{/each}}
					{{#each forwarding_address_list}}
						<li>
							<input type="checkbox" />
							<span class="txt" id="{{forwarding_address_list}}">{{forwarding_address_list}}</span>
						</li>
					{{/each}}
				</ul>
			</div>
		</div>
</script>

<script id = "mail_ext_setting_modal_tmpl" type = "text/x-handlebars-template">
<div class="content">
		<table class="form_type">	
			<colgroup>
				<col width="116px"/>
				<col width="*" />
			</colgroup>
			<tbody>
				<tr>
					<th><span class="title"><tctl:msg key="conf.pop.31" /></span></th>
					<td>
						<select id="pop3List" evt-rol="pop3-server-select" {{#if pop3Host}} disabled="disabled" {{/if}}>
							{{#equal locale 'ko'}}
                            <option value="none"><tctl:msg key="conf.pop.11" /></option>
							<option value="pop.naver.com|ssl" {{#equal pop3Host 'pop.naver.com'}} selected="selected" {{/equal}}><tctl:msg key="conf.pop.66" /></option>
							<option value="pop.daum.net|ssl" {{#equal pop3Host 'pop.daum.net'}} selected="selected" {{/equal}}><tctl:msg key="conf.pop.67" /></option>
							<option value="pop3.nate.com|ssl" {{#equal pop3Host 'pop3.nate.com'}} selected="selected" {{/equal}}><tctl:msg key="conf.pop.68" /></option>
							<option value="pop.gmail.com|ssl" {{#equal pop3Host 'pop.gmail.com'}} selected="selected" {{/equal}}><tctl:msg key="conf.pop.70" /></option>
							<option value="pop.mail.yahoo.com|ssl" {{#equal pop3Host 'pop.mail.yahoo.com'}} selected="selected" {{/equal}}><tctl:msg key="conf.pop.13" /></option>
							<option value="pop3.live.com|ssl" {{#equal pop3Host 'pop3.live.com'}} selected="selected" {{/equal}}><tctl:msg key="conf.pop.71" /></option>
							<option value="pop.chol.com" {{#equal pop3Host 'pop.chol.com'}} selected="selected" {{/equal}}><tctl:msg key="conf.pop.17" /></option>
							<option value="kornet.net" {{#equal pop3Host 'kornet.net'}} selected="selected" {{/equal}}><tctl:msg key="conf.pop.69" /></option>
							<option value="mail.hanafos.com" {{#equal pop3Host 'mail.hanafos.com'}} selected="selected" {{/equal}}><tctl:msg key="conf.pop.38" /></option>
							<option value="pop3.unitel.co.kr" {{#equal pop3Host 'pop3.unitel.co.kr'}} selected="selected" {{/equal}}><tctl:msg key="conf.pop.53" /></option>
							{{/equal}}
                            <option value=""><tctl:msg key="conf.pop.65" /></option>
						</select>
						<input id="pop3Host" value="{{pop3Host}}" {{#if pop3Host}} disabled="disabled" {{/if}} class="txt_mini" type="text" disabled="disabled">
					</td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="conf.pop.42" /></span></th>
					<td>
						<input id="pop3Port" value="{{pop3Port}}" class="txt_mini" type="text" {{#unless pop3Port}}disabled="disabled"{{/unless}}>
						<span class="option_wrap line16"><input id="sslCheck" type="checkbox" evt-rol="ssl-check" {{#if usedSsl}}checked="checked"{{/if}} {{#unless pop3Port}}disabled="disabled"{{/unless}}><label for="sslCheck"><tctl:msg key="conf.pop.62" /></label></span>
					</td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="conf.pop.32" /></span></th>
					<td><input id="pop3Id" name="pop3Id" value="{{pop3Id}}" {{#if pop3Id}} disabled="disabled" readonly="readonly" {{/if}}  class="txt_mini w_max" type="text" disabled="disabled"></td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="conf.pop.33" /></span></th>
					<td><input id="pop3Pw" name="pop3Pw" value="{{pop3Pw}}" class="txt_mini w_max" type="password" autocomplete="off" {{#unless pop3Pw}}disabled="disabled"{{/unless}}></td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="conf.pop.24" /></span></th>
					<td>
						<span class="option_wrap"><input id="pop3Del1" type="radio" name="pop3delFlag" value="on" {{#if pop3Del}}checked="checked"{{/if}}><label for="pop3Del1"><tctl:msg key="conf.pop.58" /></label></span>
						<span class="option_wrap"><input id="pop3Del2" type="radio" name="pop3delFlag" value="off" {{#unless pop3Del}}checked="checked"{{/unless}}/><label for="pop3Del2"><tctl:msg key="conf.pop.59" /></label></span>
					</td>
				</tr>
				<tr>
					<th><span class="title"><tctl:msg key="conf.pop.30" /></span></th>
					<td>
						<select id="saveFolder" class="wfix_max">
							<option value="noChoiceParentFolder" selected="selected"><tctl:msg key="mail.folder.select"/></option>
							<option value="Inbox"><tctl:msg key="folder.inbox"/></option>
							<c:if test="${useSpamFolder}">
							<option value="Spam"><tctl:msg key="folder.spam"/></option>
							</c:if>
							<option value="Trash"><tctl:msg key="folder.trash"/></option>
							{{#applyTemplate "mail_folder_selectbox_tmpl" folderList}}{{/applyTemplate}}
						</select>	
						<div class="option_display">						
							<span class="option_wrap">
								<input id="mbox" type="checkbox" name="newFolder" evt-rol="create-new-folder" value="on"/><label for="newFolder"><tctl:msg key="conf.filter.31" /></label>
							</span>

							<select id="saveNewFolder" disabled="false" class="wfix_medium">
								<option value="noChoiceParentFolder" selected="selected"><tctl:msg key="conf.filter.parentfolder" /></option>
								<option value="Inbox"><tctl:msg key="folder.inbox"/></option>
								<c:if test="${useSpamFolder}">
								<option value="Spam"><tctl:msg key="folder.spam"/></option>
								</c:if>
								<option value="Trash"><tctl:msg key="folder.trash"/></option>
								{{#applyTemplate "mail_folder_selectbox_tmpl" folderList}}{{/applyTemplate}}
							</select>
							<input id="inputBoxName" class="txt_mini wfix_medium" type="text" style="display: none">
						</div>
					</td>
				</tr>
			</tbody>
		</table>		
	</div>
</script>

<script id="mail_sender_add_tmpl" type="text/x-handlebars-template">
<tr>
	<td>
		<span class="wrap_option">
			<span class="txt senderItem" data-email="{{value}}" data-alias="{{isAliasUser}}">{{value}}</span><span>
		</span>
	</td>
	<td class="align_c">
        {{#unless isAliasUser}}
        <a class="btn_minor_s" evt-rol="default-sender-email">
            <span class="txt"><tctl:msg key="conf.userinfo.sender.email.default.add" /></span>
        </a>
        {{/unless}}
    </td>
	<td class="align_c"><span class="btn_bdr" evt-rol="delete-sender-item"><span title="<tctl:msg key="comn.del" />" class="ic_classic ic_basket"></span></span></td>
</tr>
</script>

(function(){define(["jquery","backbone","app","hogan","hgn!board/templates/mobile/m_post_write","hgn!board/templates/mobile/m_post_auth_user","board/views/dept_list","i18n!nls/commons","i18n!board/nls/board","views/mobile/header_toolbar","board/models/post","board/collections/header_list","attach_file","admin/models/community_base_config","admin/models/board_base_config","board/models/board_config","components/go-fileuploader/mobile","views/mobile/m_org","jquery.go-validation","jquery.progressbar","jquery.go-sdk","GO.util","jquery.cookie","jquery.go-validation"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g){var y=null,b={post_write:a["\uae00\uc4f0\uae30"],post_edit:a["\uae00\uc218\uc815"],post_reply:a["\ub2f5\uae00\uc4f0\uae30"],img_attach:u["\uc774\ubbf8\uc9c0 \ucca8\ubd80"],file_attach:u["\ud30c\uc77c \ucca8\ubd80"],title:u["\uc81c\ubaa9"],tmp_posts:a["\uc784\uc2dc \uc800\uc7a5\ub41c \uae00"],"private":u["\ube44\uacf5\uac1c"],public_setting:a["\uacf5\uac1c \uc124\uc815"],save_post:a["\ub4f1\ub85d"],link_input:a["\ub9c1\ud06c\uc785\ub825"],post_stream:a["\uc774\uc57c\uae30 \ud558\uae30"],del:u["\uc0ad\uc81c"],confirm:u["\ud655\uc778"],cancel:u["\ucde8\uc18c"],no_header:a["\ub9d0\uba38\ub9ac\ub97c \uc120\ud0dd\ud574\uc8fc\uc138\uc694."],no_subject:u["\uc81c\ubaa9\uc5c6\uc74c"],no_content:a["\uc785\ub825\ub41c \ub0b4\uc6a9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],alert_max_attach_cnt:a["\ucd5c\ub300 \ucca8\ubd80 \uac2f\uc218\ub294 0\uac1c \uc785\ub2c8\ub2e4."],alert_max_attach_size:a["\ucca8\ubd80\ud560 \uc218 \uc788\ub294 \ucd5c\ub300 \uc0ac\uc774\uc988\ub294 0MB \uc785\ub2c8\ub2e4."],no_title:a["\uc81c\ubaa9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],alert_content:a["\uc785\ub825\ub41c \ub0b4\uc6a9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],alert_length:a["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],alert_init_writeform:a["\uc785\ub825\ud558\uc2e0 \uc815\ubcf4\uac00 \ucd08\uae30\ud654\ub429\ub2c8\ub2e4."],input_placeholder:a["\uc0c8\ub85c\uc6b4 \uc815\ubcf4, \uae30\ubd84 \uc88b\uc740 \uc18c\uc2dd\uc744 \ubd80\uc11c\uc6d0\ub4e4\uacfc \uacf5\uc720\ud558\uc138\uc694."],board_type_change:GO.util.br2nl(a["\uac8c\uc2dc\ud310 \ud0c0\uc785\uc774 \ubcc0\uacbd\ub418\uba74 ,\uae30\uc874\uc5d0 \uc785\ub825\ud588\ub358 \ub0b4\uc6a9\uc740 \ubaa8\ub450 \uc0ad\uc81c\ub429\ub2c8\ub2e4."]),alert_fail:u["\uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4."],placeholder_subject:a["\uc81c\ubaa9\uc744 \uc785\ub825\ud558\uc138\uc694."],placeholder_content:a["\ub0b4\uc6a9\uc744 \uc785\ub825\ud558\uc138\uc694."],header_default:a["\ub9d0\uba38\ub9ac \uc120\ud0dd"],link_meta_delete:a["\uba54\ud0c0 \ub370\uc774\ud130 \uc0ad\uc81c"],link_meta_title:a["\ub9c1\ud06c \uba54\ud0c0\uc815\ubcf4 \ud0c0\uc774\ud2c0"],link_meta_img:a["\uba54\ud0c0\uc815\ubcf4 \uc774\ubbf8\uc9c0"],link_content_delete:a["\ub0b4\uc6a9 \uc0ad\uc81c"],link_img_delete:a["\uc774\ubbf8\uc9c0 \uc0ad\uc81c"],alert_url:a["\uc798\ubabb\ub41c url\uc785\ub2c8\ub2e4."],alim_mail:u["\uba54\uc77c\uc54c\ub9bc"],alim_push:u["\ud478\uc2dc\uc54c\ub9bc"],alim_alert:u["\uad00\ub9ac\uc790 \uc124\uc815\uc73c\ub85c \ud558\ub098\uc758 \uc54c\ub9bc\uc740 \ubc18\ub4dc\uc2dc \uc120\ud0dd\ub418\uc5b4\uc57c \ud569\ub2c8\ub2e4."],no_board:a["\uc120\ud0dd\uac00\ub2a5\ud55c \uac8c\uc2dc\ud310\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],public_writer:a["\uc791\uc131\uc790 \uacf5\uac1c"]},w=t.View.extend({el:"#content",events:{"vclick a[data-btntype='userAddBtn']":"callUserAddBtn","vclick .postAuthUser .ic_del":"onClickedRemoveAuthUserBtn"},unbindEvent:function(){this.$el.off("vclick",'span[data-btntype="attachDelete"]'),this.$el.off("change","select#select_board"),this.$el.off("change","select#dept_select"),this.$el.off("change","#post_mail_noti"),this.$el.off("change","#post_push_noti"),this.$el.off("change","#secret"),this.$el.off("keyup","#mobileContent"),this.$el.off("vclick","#btnLink"),this.$el.off("vclick",'input[data-btntype="linkSubmit"]'),this.$el.off("change",'input[type="file"]'),this.$el.off("vclick",'input[type="file"]'),GO.EventEmitter.off("trigger-action")},bindEvent:function(){this.$el.on("change","select#select_board",e.proxy(this.setWriteForm,this)),this.$el.on("change","select#dept_select",e.proxy(this.setWriteForm,this)),this.$el.on("change","#post_mail_noti",e.proxy(this.streamWriteNoti,this)),this.$el.on("change","#post_push_noti",e.proxy(this.streamWriteNoti,this)),this.$el.on("change","#secret",e.proxy(this.toggleSecret,this)),this.$el.on("keyup","#mobileContent",e.proxy(this.expandTextarea,this)),this.$el.on("vclick","#btnLink",e.proxy(this.linkInputShow,this)),this.$el.on("vclick",'input[data-btntype="linkSubmit"]',e.proxy(this.linkSubmit,this)),GO.EventEmitter.on("trigger-action","board-save",this.saveBbs,this)},initialize:function(){GO.util.appLoading(!0),this.headerToolbarView=f;var e=['<ul><li class="thumb">','{{#imageSrc}}<a href="javascript:;" class="meta_thumb"><img class="" src="{{imageSrc}}" alt="{{lang.link_meta_img}}" title="{{lang.link_meta_title}}"></a>{{/imageSrc}}',"</li>",'<li class="url"><a href="javascript:;" class="url_type">{{url}}</a></li>','<li><a href="javascript:;" class="title">{{title}}</a></li>','<li><p href="javascript:;" class="meta_contents">{{description}}</p></li></ul>'],t=['<select id="{{selectId}}" class="{{selectClass}}"><option value="0">{{defaultSelect}}</option>','{{#dataset}}{{^deletedFlag}}<option value="{{id}}">{{name}}</option>{{/deletedFlag}}{{/dataset}}',"</select>"];this.hogan={tplPostLink:r.compile(e.join("")),tplHeaderList:r.compile(t.join(""))},this.isSaving=!1,this.postAuthorizedUsers=[],this.setAppCallBack()},render:function(t){GO.util.pageDone(),GO.util.appLoading(!0),this.unbindEvent(),this.bindEvent();var n=this;this.communityId=t.communityId||"",this.isCommunity=t.communityId?!0:!1,this.deptId=t.deptId||"",this.boardId=t.boardId||"",this.boardType="",this.type=t.type||"",this.postId=t.postId&&t.postId.indexOf("?")>0?t.postId.split("?")[0]||"":t.postId||"",this.boardModel=t.boardId?v.get(this.boardId):{};var r=b.post_write;this.type=="edit"?r=b.post_edit:this.type=="reply"&&(r=b.post_reply),this.$el.html(i({lang:b,boardLang:a,isCommunity:this.isCommunity,isMobileApp:GO.config("isMobileApp"),isAndroidApp:GO.util.isAndroidApp(),isReply:this.type=="reply"?!0:!1,anonymFlag:this.boardId?v.get(this.boardId).get("anonymFlag"):!1,isEditMode:this.boardId&&this.type=="edit"||!1,isAvailableAnonymousWriterPost:this.boardId?this.boardModel.get("availableAnonymousWriterOptionInPost"):!1,isAvailableAnonymousWriterComment:this.boardId?this.boardModel.get("availableAnonymousWriterOptionInPostComment"):!1})),o.render({id:"#deptList",boardList:!0,communityId:this.communityId,deptId:this.deptId,boardId:this.boardId,postId:this.postId,type:this.type,selectClass:"w_max",isCommunity:this.isCommunity});var s=b.save_post;this.boardType=="STREAM"&&(s=b.post_stream),this.headerToolbarView.render({isClose:!0,title:r,actionMenu:[{id:"board-save",text:s,triggerFunc:"board-save"}]}),setTimeout(function(){GO.util.appLoading(!1)},500);var u=e("#select_board option:selected");if(u.val()==="")return;this.initWriteForm(),this.setCurrentBoard(),this.changeBoardModel(),(this.type=="edit"||this.type=="reply")&&this.postId&&(this.setWriteData({boardId:this.boardId,postId:this.postId,type:this.type}),_.each(this.writeModel.get("links"),function(e){this.renderLink(e)},this)),this.configModel=this.isCommunity?p.read({admin:!1}):d.read({admin:!1}),this.isCommunity?this.configModel=p.read({admin:!1}):this.configModel=d.read({admin:!1}),this.attachFileUploader(),n.setPostAuthUsersMarkup(),n.setNotiMarkup()},attachFileUploader:function(){var t={};t.success=e.proxy(function(t){var n=this,r=typeof t=="string"?JSON.parse(t):t.data;r.mode="edit",e("#attach_wrap").show();var i=h.makeTempItem(r);return i.done(function(t){if(e("div.option_display").data("attachable")==="false")return;try{n.attachValidate(r)}catch(i){i.message==="overMaxAttachNumber"&&e("div.option_display").data("attachable","false");return}GO.util.isImage(r.fileExt)?e("#img_attach_wrap_ul").append(t.$el):e("#file_attach_wrap_ul").append(t.$el),t.$el.on("removedFile",function(t,n){var r=n.el;r.preventDefault(),e(r.currentTarget).parents("li").first().remove(),e("div.option_display").data("attachable","true"),e("#attach_wrap").find("li").size()<1&&e("#attach_wrap").hide()})}),i.promise()},this),t.error=function(e){alert(u["\uc5c5\ub85c\ub4dc\uc5d0 \uc2e4\ud328\ud558\uc600\uc2b5\ub2c8\ub2e4."])},t.androidCallFile=e.proxy(function(){this.callFile()},this),m.bind(this.$el.find("#go-fileuploader"),t)},linkInputShow:function(t){t.preventDefault(),e("#linkInputPart").show()},linkSubmit:function(){var t=this,n=e("#select_board option:selected").val(),r=encodeURIComponent(e("#linkUrl").val());if(e.trim(r)==""){GO.util.delayAlert(a["\ub9c1\ud06c\ub97c \uc785\ub825\ud558\uc138\uc694."]);return}var i=GO.contextRoot+"api/board/"+n+"/html/parser?url="+r;e.go(i,"",{qryType:"GET",contentType:"application/json",responseFn:function(e){e.code==200?t.renderLink(e.data):GO.util.delayAlert(b.alert_url)},error:function(e){GO.util.delayAlert(b.alert_url)}})},attachValidate:function(t){var r=GO.util.getFileNameAndTypeData(t),i=this.configModel.get("attachSizeLimit")?this.configModel.get("maxAttachSize"):-1,s=this.configModel.get("attachNumberLimit")?this.configModel.get("maxAttachNumber"):-1,o=this.configModel.get("excludeExtension")==undefined?"":this.configModel.get("excludeExtension");this.configModel.get("attachSizeLimit")?i=this.configModel.get("maxAttachSize"):GO.config("allowedFileUploadSize")&&(i=GO.config("allowedFileUploadSize")/1024/1024);try{e.goValidation.attachValidate("#attach_wrap ul li",r,i,s,o),GO.session().brandName=="DO_SAAS"&&m.attachFileValidateBySaaS(r.size)}catch(a){var f=a.message;if(f=="ExtentionException")GO.util.delayAlert(n.i18n(u["\ud655\uc7a5\uc790\uac00 \ub561\ub561\uc778 \uac83\ub4e4\uc740 \ucca8\ubd80 \ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],"arg1",o));else if(f=="AttachSizeException")GO.util.delayAlert(n.i18n(u["\ucca8\ubd80\ud560 \uc218 \uc788\ub294 \ucd5c\ub300 \uc0ac\uc774\uc988\ub294 0MB \uc785\ub2c8\ub2e4."],"arg1",i));else{if(f=="AttachNumberException")throw GO.util.delayAlert(n.i18n(u["\ucca8\ubd80 \ud30c\uc77c \uac1c\uc218\ub97c \ucd08\uacfc\ud558\uc600\uc2b5\ub2c8\ub2e4."],"arg1",s)),new Error("overMaxAttachNumber");if(f=="AttachNumberExceptionBySaaS")throw GO.util.delayAlert(n.i18n(u["\ucd5c\ub300 \ucca8\ubd80 \uac2f\uc218\ub294 0\uac1c \uc785\ub2c8\ub2e4."],"arg1",s)),new Error("overMaxAttachNumber");f=="NotFoundExtException"&&GO.util.delayAlert(u["\ucca8\ubd80\ud560 \uc218 \uc5c6\ub294 \ud30c\uc77c \uc785\ub2c8\ub2e4."])}throw new Error("Attach Validation Error")}},callFile:function(){var t=-1;this.configModel.get("attachSizeLimit")?t=this.configModel.get("maxAttachSize"):GO.config("allowedFileUploadSize")&&(t=GO.config("allowedFileUploadSize")/1024/1024);var n=this.configModel.get("attachNumberLimit")?this.configModel.get("maxAttachNumber"):-1,r=this.configModel.get("excludeExtension");if(!this.fileUploadCountValidate())return!1;this.configModel.get("attachNumberLimit")&&(n-=e("#attach_wrap li").size()),GO.util.callFile(t,n,r)},fileUploadCountValidate:function(){if(this.configModel.get("attachNumberLimit")){var t=e("#attach_wrap li").size(),r=this.configModel.get("maxAttachNumber");if(t>=r)return GO.util.delayAlert(n.i18n(u["\ucd5c\ub300 \ucca8\ubd80 \uac2f\uc218\ub294 0\uac1c \uc785\ub2c8\ub2e4."],"arg1",r)),!1}return!0},changeBoardList:function(){var t=e("#select_board option:selected"),n=t.val(),r=c.getHeaderList({boardId:n}).toJSON();r.length>0?e("#headerList").html(this.hogan.tplHeaderList.render({dataset:r,defaultSelect:b.header_default,selectId:"header_list",selectClass:"w_max"})).show():e("#headerList").html("").hide()},changeDeptList:function(){var t=e("#dept_select option:selected"),n=e("#select_board option:selected"),r=e("#post_mail_noti").parents("span.streamPart:first"),i=e("#post_push_noti").parents("span.streamPart:first");if(t.attr("data-ownertype")=="Company")this.$el.find("#linkInputPart").hide();else{var s=v.get(n.val()),o=s.get("anonymFlag");o?(r.hide(),i.hide()):(r.show(),i.show())}},expandTextarea:function(e){GO.util.textAreaExpand(e)},streamWriteNoti:function(t){var n=e(t.currentTarget),r=n.is(":checked");n.parent("span").toggleClass("btn_action",r).toggleClass("btn_action_off",!r)},toggleSecret:function(e){this.setPostAuthUsersMarkup(),this.setNotiMarkup()},initWriteForm:function(t){var n=e("#select_board option:selected");this.boardType==""&&(this.boardType=n.attr("data-bbstype")),n.attr("data-bbstype")=="STREAM"?this.setStreamFrom():this.setClassicForm(),this.changeBoardList(),this.changeDeptList()},setStreamFrom:function(){this.boardType="STREAM",this.type=="edit"?e(".streamPart").first().show():e(".streamPart").show(),e(".classicPart").hide(),e("#btnToolbarRight span").html(b.post_stream)},setClassicForm:function(){this.boardType="CLASSIC",e(".classicPart").show(),e("#linkInputPart").hide(),e("#btnToolbarRight span").html(b.confirm)},setWriteForm:function(t){var n=this,r=e("#select_board option:selected");if(r.val()==="")return;var i=function(){n.setCurrentBoard(),r.attr("data-bbstype")=="STREAM"?n.setStreamFrom():n.setClassicForm(),n.changeBoardList(),n.changeDeptList()};this.boardType!=r.attr("data-bbstype")?confirm(b.board_type_change)?i():n.$el.find("#select_board").val(n.$el.find("input[name=currentBoard]").val()):i(),n.changeBoardModel()},setCurrentBoard:function(){var e=this.$el.find("#select_board").val();this.$el.find("input[name=currentBoard]").val(e)},setWriteData:function(t){var n=this;this.writeModel=new l({boardId:t.boardId,postId:t.postId,readOnly:!0}),this.writeModel.setURL(),this.writeModel.fetch({async:!1});var r=this.writeModel.toJSON();r.publicWriter&&t.type=="edit"&&e("#isPublicWriter").attr("checked",!0),r.status=="CLOSE"&&(this.$("#notiMailBtn").hide(),this.$("#notiPushBtn").hide()),t.type=="reply"?e("#subject").val(GO.util.unescapeHtml("RE : "+r.title)):(e("#subject").val(GO.util.unescapeHtml(r.title)),e("#mobileContent").val(GO.util.unescapeHtml(r.content)),GO.util.textAreaExpandByNode(e("#mobileContent")[0]),r.header&&e("#header_list").val(r.header.id),r.status=="CLOSE"&&e("#secret").attr("checked","checked"),r.attaches.length>0&&(e("#attach_wrap").show(),e("#attach_wrap").append('<ul class="file_wrap" id="file_attach_wrap_ul"></ul><ul class="img_wrap" id="img_attach_wrap_ul"></ul>'),h.edit("#file_attach_wrap_ul",r.attaches))),n.setPostAuthorizedUsers(n.writeModel.get("authorizedUsers"))},renderLink:function(t){var n=this.hogan.tplPostLink.render(e.extend(t,{lang:b}));this.$("#linkAttachPart").css("display",""),this.$("#linkInfo").html(n),this.$("#linkUrl").val("")},writeOptionSetting:function(t){if(t.id!=t.thread)e("#writeOptionWrap").hide();else{e(":input:radio[name=writeSecret]").filter("input[value="+t.status+"]").attr("checked","checked");if(t.hasOwnProperty("fromDate")){var n=t.fromDate,r=t.toDate;e("#write_noti").attr("checked",!0),e("#write_noti").parent().removeClass("action_off"),e("#notice_term_part").show(),e("#stickyStartDate").val(GO.util.shortDateCalenderFormat(n)),e("#stickyEndDate").val(GO.util.shortDateCalenderFormat(r)),this.datePickerInit()}}},callUserAddBtn:function(t){t.preventDefault(),t.stopPropagation();var r=[],i=this;e.each(e("#postAuthUsersUL li"),function(){r.push({id:e(this).attr("data-userid"),username:e(this).attr("data-username"),position:e(this).attr("data-userposition")})}),GO.config("isMobileApp")?GO.util.callOrg(r):(n.router.navigate(n.router.getUrl()+"#org",{trigger:!1,pushState:!0}),this.orgView=new g({}),this.orgView.render({title:a["\uc5f4\ub78c\uc790 \ucd94\uac00"],checkedUser:r,callback:function(e){return i.setPostAuthorizedUsers(_.map(e,function(e){return{userId:e.id,name:e.name,positionName:e.position}})),!1}}))},setAppCallBack:function(){var e=this;window.addSuccess=function(t){e.setPostAuthorizedUsers(_.map(JSON.parse(t),function(e){return{userId:e.id,name:e.name,positionName:e.position}}))}},changeBoardModel:function(){this.toggleAnonymousPost();var e=this,t=e.$el.find("#select_board option:selected").val();if(t==="")return;e.boardModel=v.get(t),e.setPostAuthUsersMarkup(),e.setPostAuthorizedUsers(e.getPostAuthorizedUsers()),e.setNotiMarkup()},toggleAnonymousPost:function(){if(!this.boardId){e("#publicWriterSettingPart").hide();return}this.boardModel.get("anonymFlag")&&this.boardModel.get("availableAnonymousWriterOptionInPost")&&e("#publicWriterSettingPart").show()},getPostAuthorizedUsers:function(){return e("#authorizedUserList").is(":visible")?this.postAuthorizedUsers:[]},setPostAuthorizedUsers:function(t){var n=this;n.postAuthorizedUsers=[];if(!n.usePostAuthOption())return;_.forEach(t,function(e){n.isDuplicatedAuthUser(e.userId)||n.postAuthorizedUsers.push({userId:e.userId,name:e.name,positionName:e.positionName})}),e("#postAuthUsersUL").html(s({data:n.postAuthorizedUsers})),n.setNotiMarkup()},removePostAuthorizedUser:function(e){var t=this;t.postAuthorizedUsers=t.postAuthorizedUsers.filter(function(t){return t.userId!=e}),t.setNotiMarkup()},isDuplicatedAuthUser:function(e){var t=this;return _.any(t.postAuthorizedUsers,function(t){return t.userId==e})},setNotiMarkup:function(){var e=this,t=e.type!="edit",n=!e.boardModel.get("anonymFlag"),r=e.postAuthorizedUsers.length>0,i=e.usePostAuthOption(),s=e.isOpenStatus();s&&t&&n?e.$el.find(".postNotiBtn").show():i&&r&&t&&n?e.$el.find(".postNotiBtn").show():e.$el.find(".postNotiBtn").hide()},setPostAuthUsersMarkup:function(){var e=this;e.usePostAuthOption()?e.$el.find("#authorizedUserList").show():e.$el.find("#authorizedUserList").hide()},isOpenStatus:function(){var t=this;return t.boardType!="CLASSIC"||!e("#secret").is(":checked")},usePostAuthOption:function(){var e=this,t=e.isOpenStatus(),n=e.boardModel.get("postAuthOption");return!t&&n},onClickedRemoveAuthUserBtn:function(t){t.stopPropagation();var n=e(t.currentTarget).closest(".postAuthUser"),r=n.data("userid");n.remove(),this.removePostAuthorizedUser(r)},saveBbs:function(){var t=e("#mobileContent").val(),r=e("#subject").val(),i=this;if(this.isSaving)return;this.isSaving=!0;if(this.boardType=="CLASSIC"){if(e.trim(r)==""){GO.util.delayAlert(b.no_title),e("#subject").focus(),this.isSaving=!1;return}if(!e.goValidation.isCheckLength(2,100,r))return GO.util.delayAlert(n.i18n(b.alert_length,{arg1:"2",arg2:"100"})),this.$el.find("#subject").focus(),this.isSaving=!1,!1;var s=e("#select_board option:selected");if(s.attr("data-headerFlag")=="true"&&s.attr("data-headerRequiredflag")=="true"&&e("#header_list").val()==0)return GO.util.delayAlert(b.no_header),this.isSaving=!1,!1}if(e.trim(t)=="")return GO.util.delayAlert(b.no_content),this.$el.find("#mobileContent").focus(),this.isSaving=!1,!1;if(e("#select_board").val()==="")return GO.util.delayAlert(b.no_board),this.isSaving=!1,!1;GO.util.appLoading(!0);var s=e("#select_board option:selected"),o=s.val(),u=e("#writePostId").val(),a=e("#writeType").val(),f="PUT";a!="edit"&&(f="POST");var c={content:t,contentType:"TEXT"};this.boardType=="CLASSIC"&&(c.title=r);var h=!1;e("#publicWriterSettingPart").is(":visible")&&(h=e("#isPublicWriter").is(":checked")),c.publicWriter=h,c.notiMailFlag=this.$("#notiMailBtn").is(":visible")&&e("#post_mail_noti").is(":checked"),c.notiPushFlag=this.$("#notiPushBtn").is(":visible")&&e("#post_push_noti").is(":checked"),c.status=this.isOpenStatus()?"OPEN":"CLOSE",c.authorizedUsers=this.getPostAuthorizedUsers();var p=e("#header_list option").length;p>0&&(c.headerId=e("#header_list option:selected").val());var d=m.getAttachInfo("#attach_wrap");d.length>0&&(c.attaches=d);var v=e("#linkInfo li"),g=[];if(v.length>0){var y=e("#linkInfo a.url_type").html(),w=e("#linkInfo .thumb img").attr("src"),E=e("#linkInfo a.url_type").attr("data-video"),r=e("#linkInfo .title").html(),S=e("#linkInfo .meta_contents").html();g.push({url:y,title:r,description:S,imageSrc:w,videoSrc:E}),c.links=g}this.writeModel=new l,this.writeModel.set({boardId:o,postId:u,writeType:a},{silent:!0}),this.writeModel.save(c,{type:f,success:function(e){var t="";i.isCommunity?t="community/"+i.communityId+"/board/"+o+"/post/"+e.id:t="board/"+o+"/post/"+e.id,GO.util.appLoading(!1),n.router.navigate(t,{replace:!0,trigger:!0})},error:function(e,t){GO.util.appLoading(!1);var n=JSON.parse(t.responseText||{});n.message?GO.util.delayAlert(n.message):GO.util.delayAlert(b.alert_fail)}})}});return{render:function(e){return y=new w(e),y.render(e)}}})}).call(this);
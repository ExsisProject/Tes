define(["jquery","underscore","backbone","when","hgn!approval/templates/document/document","hgn!approval/templates/document/attach_file_view","hgn!approval/templates/document/attach_file_inprogress","hgn!approval/templates/doc_attaches_file","hgn!approval/templates/doc_attaches_img","hgn!approval/templates/document/reference_doc_view","approval/models/document","approval/models/ref_document","approval/views/document/comments","approval/views/document/actcopy","approval/views/document/actcopy_list","approval/views/document/related_document_attach","approval/views/document/document_print","i18n!nls/commons","i18n!approval/nls/approval","file_upload","content_viewer","approval/views/document/attach_file","formutil","jquery.fancybox","jquery.go-popup","jquery.ui","json","json2","jquery.go-validation","jquery.placeholder","jquery.progressbar","go-fancybox"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y,b,w,E){var S={img_attach:g["\uc774\ubbf8\uc9c0 \ucca8\ubd80"],file_attach:g["\ud30c\uc77c\ucca8\ubd80"],del:g["\uc0ad\uc81c"],confirm:g["\ud655\uc778"],cancel:g["\ucde8\uc18c"],save:g["\uc800\uc7a5"],noti:g["\uc54c\ub9bc"],doc_search:y["\ubb38\uc11c \uac80\uc0c9"],attach_file:y["\ucca8\ubd80\ud30c\uc77c"],ref_doc:y["\uad00\ub828\ubb38\uc11c"],view:y["\ubcf4\uae30"],preview:y["\ubbf8\ub9ac\ubcf4\uae30"],download:g["\ub2e4\uc6b4\ub85c\ub4dc"],amt:y["\uac1c"],msg_no_approval_document:y["\uacb0\uc7ac \ubb38\uc11c\ub97c \uc120\ud0dd\ud574 \uc8fc\uc138\uc694"],msg_duplicate_approval_document:y["\uc911\ubcf5\ub41c \uad00\ub828\ubb38\uc11c\uac00 \uc788\uc2b5\ub2c8\ub2e4"],"\ub313\uae00":y["\ub313\uae00"],"\uc6d0\ubcf8\ubb38\uc11c":y["\uc6d0\ubcf8\ubb38\uc11c"],"\ubb38\uc11c\ucd94\uac00":y["\ubb38\uc11c \ucd94\uac00"],"\uc774 \uacf3\uc5d0 \ud30c\uc77c\uc744 \ub4dc\ub798\uadf8 \ud558\uc138\uc694":g["\uc774 \uacf3\uc5d0 \ud30c\uc77c\uc744 \ub4dc\ub798\uadf8 \ud558\uc138\uc694"],"\uc774 \uacf3\uc5d0 \ud30c\uc77c\uc744 \ub4dc\ub798\uadf8 \ud558\uc138\uc694 \ub610\ub294":g["\uc774 \uacf3\uc5d0 \ud30c\uc77c\uc744 \ub4dc\ub798\uadf8 \ud558\uc138\uc694 \ub610\ub294"],"\ud30c\uc77c\uc120\ud0dd":g["\ud30c\uc77c\uc120\ud0dd"],"\ucca8\ubd80\ud30c\uc77c 1\uac1c\uc758 \ucd5c\ub300 \uc6a9\ub7c9\uc740 NNN MB \uc774\uba70 \ucd5c\ub300 N\uac1c \uae4c\uc9c0 \ub4f1\ub85d \uac00\ub2a5\ud569\ub2c8\ub2e4":GO.i18n(g["\ucca8\ubd80\ud30c\uc77c 1\uac1c\uc758 \ucd5c\ub300 \uc6a9\ub7c9\uc740 {{size}} MB \uc774\uba70 \ucd5c\ub300 {{number}} \uac1c \uae4c\uc9c0 \ub4f1\ub85d \uac00\ub2a5\ud569\ub2c8\ub2e4"],{size:GO.config("commonAttachConfig").maxAttachSize,number:GO.config("commonAttachConfig").maxAttachNumber})},x="body {margin: 0px;}",T=n.View.extend({events:{"click span#addRelatedDocument":"onAddRelatedDocumentClicked","click span.ic_del":"attachDelete","click #refDocPart a.btn_fn4":"refPreviewBtnClicked","click #refDocPart span.name":"refPreviewTitleClicked","click #refDoc a.btn_fn4":"refPreviewBtnClicked","click #refDoc span.name":"refPreviewTitleClicked",'click a[data-func="preview"]':"attachPreview",'click a[data-func="tempPreview"]':"tempAttachPreview","click span#addReceptionOriginDocument":"onClickAddReceptionOriginDocument","dragover #dropZone":"_dragOver","dragleave #dropZone":"_dragLeave","drop #dropZone":"_drop"},initialize:function(e){this.options=e||{},this.formOpts={},t.bindAll(this,"render","setNewFormMode","setEditMode","setViewMode"),this.docType=this.options.type,this.docId=this.options.docId,this.docModel=this.options.model,this.infoModel=this.options.infoData,this.actionModel=this.options.actionModel,this.userApprSettingModel=this.options.userApprSettingModel,this.mode="VIEW",this.isPreview=this.options.isPreview,this.originalDocId=this.options.originalDocId,this.isBrowseByReference=this.options.refDocId!=undefined,this.formIntegrator=this.options.formIntegrator||{},this.commentsView=new h({docId:this.docId,comments:this.docModel.comments,originalDocId:this.originalDocId,isBrowseByReference:this.isBrowseByReference}),this.isSaaS=GO.session().brandName=="DO_SAAS",this.totalAttachSize=0,this.totalAttachCount=0},render:function(){var n=this,r=this.infoModel.formScriptType,s=this.infoModel.externalScript,o=this.infoModel.scriptBody;return this.$el.html(i({lang:S,data:this.docModel,isDraftType:this.docModel.docType=="DRAFT",isSaaS:this.isSaaS,refDocs:function(){var e=n.docModel.receptionOrigin;return!e||0?n.docModel.references:t.filter(n.docModel.references,function(t){return t.id!=e.id})},recpOriginInRefDocs:function(){var e=n.docModel.receptionOrigin;return t.find(n.docModel.references,function(t){return t.id==e.id})}})),this.docContents=e("#document_content"),this.initFileUpload(),this.initAttachFileView(),this.$el.find("div#attachView").append(f({lang:S,data:function(){var e=n.docModel.receptionOrigin;return!e||0?{references:n.docModel.references}:{references:t.filter(n.docModel.references,function(t){return t.id!=e.id}),receptionOriginInReferences:t.find(n.docModel.references,function(t){return t.id==e.id})}}})),this.formOpts={data:this.docModel.docBodyContent,contextRoot:"/",userId:this.docModel.drafterId,userProfileApi:"api/user/profile",docType:this.docModel.docType,draftDate:this.docModel.draftedAt?GO.util.formatDatetime(this.docModel.draftedAt,null,"YYYY-MM-DD(ddd)"):GO.util.formatDatetime(GO.util.toISO8601(new Date),null,"YYYY-MM-DD(ddd)")},this.isPreview?this.commentsView.setElement(e(this.el).find("section.article_reply")).render():this.docModel.docStatus=="CREATE"||this.docModel.docStatus=="TEMPSAVE"?(this.setDocumentTemplate(t.clone(this.formOpts)),r=="SRC"&&!t.isEmpty(s)?this.renderIntegrationByExternalScript({mode:"create",moduleName:s}):r=="EDIT"&&!t.isEmpty(o)?this.renderIntegrationByScriptText({mode:"create",scriptBody:o}):this.onNewFormMode()):r=="SRC"&&!t.isEmpty(s)?this.renderIntegrationByExternalScript({mode:"view",moduleName:s}):r=="EDIT"&&!t.isEmpty(o)?this.renderIntegrationByScriptText({mode:"view",scriptBody:o}):this.onViewMode(),this},_dragOver:function(t){t.preventDefault(),t.stopPropagation(),t.originalEvent.dataTransfer.dropEffect="move",e("#dropZone").addClass("drag_file")},_dragLeave:function(t){t.preventDefault(),t.stopPropagation(),e("#dropZone").removeClass("drag_file")},_drop:function(t){t.preventDefault(),t.stopPropagation(),e("#dropZone").removeClass("drag_file")},setCustomApprovalData:function(){var t={preserveDuration:e("#docYear option:selected").text()||this.convertPreserveYears(this.infoModel.docYear),securityLevel:e("#infoSecurityLevel option:selected").text()||this.infoModel.securityLevelName};this.setApprovalData(t)},convertPreserveYears:function(e){return e==0?y["\uc601\uad6c"]:e+y["\ub144"]},setDocumentTemplate:function(e){GO.util.store.set("document.docMode","EDIT",{type:"session"}),GO.util.store.set("apprConfig.multiCompanySupporting",this.actionModel.multiCompanySupporting,{type:"session"});var t=e;t.angleBracketReplace=!1,this.docContents.setTemplate(t)},renderIntegrationByExternalScript:function(e){var n=this,r=e.moduleName,i=e.mode,s=null;t.isEmpty(r)?console.log("module name Empty!!"):require([r],function(e){t.isUndefined(e)||(s=new e({variables:t.clone(n.docModel.variables),docModel:n.docModel,infoData:n.infoModel}),i=="create"?(t.isFunction(s.render)&&s.render(),n.formIntegrator.setIntegrationView(s),n.onNewFormMode()):i=="view"&&(n.onViewMode(),t.isFunction(s.renderViewMode)&&s.renderViewMode(),n.formIntegrator.setIntegrationView(s),n.setCustomApprovalData()))})},renderIntegrationByScriptText:function(e){var n=this,r=e.mode,i=e.scriptBody,s,o=new Function(i);if(o){var u=new o;s=new u({variables:t.clone(n.docModel.variables),docModel:n.docModel,infoData:n.infoModel}),r=="create"?(t.isFunction(s.render)&&s.render(),this.formIntegrator.setIntegrationView(s),this.onNewFormMode()):r=="view"&&(n.onViewMode(),t.isFunction(s.renderViewMode)&&s.renderViewMode(),n.formIntegrator.setIntegrationView(s),n.setCustomApprovalData())}else console.log("scriptBody is Empty")},onNewFormMode:function(){this.docModel.docStatus=="CREATE"&&this.docContents.setDocVariables(this.docModel.variables),this.setNewFormMode(),this.setAttaches(),e(".fancybox-thumbs").goFancybox()},onViewMode:function(){this.commentsView.setElement(e(this.el).find("section.article_reply")).render(),this.setViewMode(),this.setAttaches(),e(".fancybox-thumbs").goFancybox()},remove:function(){n.View.prototype.remove.apply(this,arguments),e(window).off("resize.appr.document")},initAttachFileView:function(){E.appendTo(this.$el.find("#attachView"),this.docModel.attaches,this.userApprSettingModel,this.docId,{originalDocId:this.originalDocId,isBrowseByReference:this.isBrowseByReference})},_reloadAttachArea:function(e){this.model.attaches=e.data.document.attaches,this.setAttaches()},initFileUpload:function(){var n="";GO.config("locale")=="en"?n="57":GO.config("locale")=="ko"?n="73":n="65";var r=GO.util.useButtonWindow(),i=this,s={el:"#swfupload-control",context_root:GO.contextRoot,button_width:n,useButtonWindow:r,button_title:S["\ud30c\uc77c\uc120\ud0dd"],button_text:"<span class='txt'>"+S["\ud30c\uc77c\uc120\ud0dd"]+"</span>",url:"api/file?GOSSOcookie="+e.cookie("GOSSOcookie"),textTmpl:["<span class='btn_file''>","{text}","<input type='file' name='file' title='{title}' multiple='' accept={accept} />","</span>"].join(""),dropZone:"#dropZone",progressEl:"div.progress"};r&&(s.button_height=26);var u=parseInt(GO.config("commonAttachConfig").maxAttachSize),a=u*1024*1024,f=parseInt(GO.config("commonAttachConfig").maxAttachNumber);(new b(s)).queue(function(e,t){}).start(function(n,r){if(!GO.config("attachFileUpload"))return e.goAlert(g["\ud30c\uc77c\ucca8\ubd80\uc6a9\ub7c9\ucd08\uacfc"]),i.$("#dropZone").removeClass("drag_file"),!1;if(GO.config("excludeExtension")&&!t.isUndefined(r.type)){var s=e.inArray(r.type.substr(1).toLowerCase(),GO.config("excludeExtension").split(","));if(s>=0)return e.goMessage(GO.i18n(g["\ud655\uc7a5\uc790\uac00 \ub561\ub561\uc778 \uac83\ub4e4\uc740 \ucca8\ubd80 \ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],"arg1",GO.config("excludeExtension"))),!1}if(i.isSaaS){if(a<r.size)return e.goMessage(GO.i18n(g["\ucca8\ubd80\ud560 \uc218 \uc788\ub294 \ucd5c\ub300 \uc0ac\uc774\uc988\ub294 0MB \uc785\ub2c8\ub2e4."],"arg1",u)),i.$("#dropZone").removeClass("drag_file"),!1;i.totalAttachSize+=r.size;var o=e("#fileWrap").children().size()+e("#imgWrap").children().size()+i.totalAttachCount+1;if(f<o)return e.goMessage(GO.i18n(g["\ucd5c\ub300 \ucca8\ubd80 \uac2f\uc218\ub294 0\uac1c \uc785\ub2c8\ub2e4."],"arg1",f)),i.$("#dropZone").removeClass("drag_file"),!1;i.totalAttachCount++}}).progress(function(e,t){}).success(function(n,r,s){var u="",a="";if(GO.util.fileUploadErrorCheck(r))u="<strong class='caution'>"+GO.util.serverMessage(r)+"</strong>",a="attachError";else if(GO.util.isFileSizeZero(r))return e.goAlert(GO.util.serverMessage(r)),!1;var f=r.data,l=f.filePath,c=f.fileName,h=f.fileExt,p={},d={lang:S,attachClass:a,tmpName:l,name:c,hostId:f.hostId,size:f.fileSize,humanSize:GO.util.getHumanizedFileSize(f.fileSize)};GO.util.isImage(h)?(p=t.extend({isImage:!0,thumbnail:f.thumbnail},d),e("#imgWrap").append(o(p))):(p=t.extend({isImage:!1,fileType:GO.util.getFileIconStyle({extention:f.fileExt}),usePreview:f.preview,useDownload:!0,previewURL:GO.contextRoot+"api/approval/attach/temp/"+encodeURI(encodeURIComponent(c))+l,alertMessage:u},d),e("#fileWrap").append(o(p))),i.setViewedTotalAttachSize(),i.resetAttachSizeAndCount()}).complete(function(e,t){console.info(t);var n=i.getAttachNames();i.setAttachFile(n)}).error(function(t,n){n.jqXHR&&(n.jqXHR.statusText=="abort"?e.goAlert(g["\ucde8\uc18c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]):e.goAlert(g["\uc5c5\ub85c\ub4dc\uc5d0 \uc2e4\ud328\ud558\uc600\uc2b5\ub2c8\ub2e4."]),i.resetAttachSizeAndCount())})},getViewedTotalAttachSize:function(){var t=0;return e("#fileWrap, #imgWrap").find("li").each(function(){t+=parseInt(this.getAttribute("data-size"),0)}),t},setViewedTotalAttachSize:function(){if(this.isSaaS){var e=this.getViewedTotalAttachSize();this.$el.find("#total_size").html(GO.util.displayHumanizedAttachSizeStatus(e))}},resetAttachSizeAndCount:function(){this.isSaaS&&(this.totalAttachSize=0,this.totalAttachCount=0)},getAttachNames:function(){var t=[];return e("#fileWrap").find("li").each(function(){t.push(this.getAttribute("data-name"))}),e("#imgWrap").find("li").each(function(){t.push(this.getAttribute("data-name"))}),t.join(", ")},setAttaches:function(){var t=this.docId,n=[],r=[];e.each(this.model.attaches,function(e,i){if(i.thumbSmall)n.push(i);else{var s=i;s.filePath=GO.contextRoot+"api/approval/document/"+t+"/download/"+i.id,r.push(s)}});var i=function(){var e="def";return GO.util.fileExtentionCheck(this.extention)&&(e=this.extention),e},s=function(){var e=this.size,t=GO.util.getHumanizedFileSize(e);return t};this.$el.find("#fileWrap").html(u({dataset:r,checkFileType:i,sizeCal:s,lang:S})),this.$el.find("#imgWrap").html(a({dataset:n,sizeCal:s})),this.setViewedTotalAttachSize()},attachDelete:function(t){e(t.target).parents("li").first().remove(),e("#optionStreamDisplay").find("li").length<1&&(e("#optionStreamDisplay").removeClass("option_display"),e("#optionStreamDisplay").css("height","1px"));var n=this.getAttachNames();this.setAttachFile(n),this.setViewedTotalAttachSize()},actCopy:function(t){var n=this,r=l.create(this.docId);r.fetch({async:!1});var i=r.get("apprFlow"),s=e.goPopup({pclass:"layer_normal layer_doc_choice",header:y["\uc2dc\ud589\ubb38 \uc591\uc2dd \uc120\ud0dd"],modal:!0,width:700,contents:"",buttons:[{btext:g["\ud655\uc778"],btype:"confirm",autoclose:!1,callback:function(t){var r=t.find(".on").children("a").children("span[data-id]").attr("data-id");if(!r)return e.goError(y["\uc591\uc2dd\uc744 \uc120\ud0dd\ud574 \uc8fc\uc138\uc694."]),!1;var s=new p({docId:n.docId,actCopyFormId:r,infoModel:n.infoModel,apprFlow:i,isPopup:n.options.isPopup});s.render(),t.close()}},{btext:g["\ucde8\uc18c"],btype:"cancel"}]}),o=new d({});o.render(),s.reoffset()},onAddRelatedDocumentClicked:function(){var t=e.goPopup({pclass:"layer_normal layer_doc_attach",header:y["\uacb0\uc7ac \ubb38\uc11c \ucca8\ubd80"],modal:!0,width:"800px",contents:"",buttons:[{btext:g["\ud655\uc778"],btype:"confirm",autoclose:!1,callback:function(t){var n=e("#reference_tbody tr"),r=0,i=[],s=[],o=[];e(n).each(function(t,n){e(n).find("input[type=checkbox]").is(":checked")&&(r++,i.push(e(n).find("input[type=checkbox]").attr("data-id")),s.push(e(n).find("input[type=checkbox]").attr("data-docnum")),o.push(e(n).find(".subject").text()))});if(r==0)return e.goError(S.msg_no_approval_document),!1;var u=[],a=e("#refDocPart").find("li[data-id]"),f=!1;e(a).each(function(t,n){u.push(e(n).attr("data-id"))}),e(i).each(function(t,n){e(u).each(function(e,t){n==t&&(f=!0)})});if(f)return e.goError(S.msg_duplicate_approval_document),!1;for(var l=0;l<r;l++)templete='<li data-id="'+i[l]+'" data-name="'+o[l]+'">'+'<span class="item_file">'+'<span class="name" data-id="'+i[l]+'">['+s[l]+"] "+o[l]+"</span>"+'<span class="optional">'+'<a class="btn_fn4"><span class="txt">'+S.preview+"</span></a>"+'<span class="btn_wrap" title="'+S.del+'">'+'<span class="ic_classic ic_del"></span>'+"</span>"+"</span>"+"</span>"+"</li>",e("#refDocPart").find("ul.file_wrap").append(templete);t.close()}},{btext:g["\ucde8\uc18c"],btype:"cancel"}]}),n=new v({});n.render(),t.reoffset()},onClickAddReceptionOriginDocument:function(t){e("#receptionOriginDocPart td").empty();var n=this.docModel.receptionOrigin,r='<div class="file_wrap feed"><ul class="file_wrap"><li data-id="'+n.id+'" data-name="'+n.title+'">'+'<span class="item_file">'+'<span class="name">['+n.docNum+"] "+n.title+"</span>"+'<span class="optional">'+'<a class="btn_fn4"><span class="txt">'+S.preview+"</span></a>"+'<span class="btn_wrap" title="'+S.del+'">'+'<span class="ic_classic ic_del"></span>'+"</span>"+"</span>"+"</span>"+"</li>"+"</ul>"+"</div>";e("#receptionOriginDocPart td").append(r)},refDocDelete:function(t){e("#receptionOriginDocPart td").empty();var n='<span class="wrap_btn wrap_file_upload"><span class="btn_minor_s fileinput-button" id="addReceptionOriginDocument"><span class="buttonText">'+S.\ubb38\uc11c\ucd94\uac00+"</span>"+"</span>"+"</span>";e("#receptionOriginDocPart td").append(n)},attachPreview:function(t){var n=e(t.currentTarget);return GO.util.preview(n.attr("data-id")),!1},tempAttachPreview:function(n){var r=e(n.currentTarget).closest("li"),i=t.extend({},{filePath:r.attr("data-tmpname"),fileName:r.find("span.name").text()});return GO.util.previewTempFile(i),!1},refPreviewBtnClicked:function(t){var n=e(t.currentTarget).parents("li").data("id");this.previewRefDoc(n)},refPreviewTitleClicked:function(e){this.refPreviewBtnClicked(e)},previewRefDoc:function(e){var t=window.location.protocol+"//"+window.location.host+GO.contextRoot+"app/approval/document/"+this.docId+"/preview/reference/"+e;window.open(t,"","location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes")},setNewFormMode:function(){this.mode="NEW",e(this.el).find("div#editView").show(),e(this.el).find("div#attachView").hide(),e(this.el).find("section.article_reply").hide()},setEditMode:function(n){this.mode="EDIT",this.formOpts.isAdmin=t.isUndefined(n)?!1:n,e(this.el).find("div#editView").show(),e(this.el).find("div#attachView").hide(),e(this.el).find("section.article_reply").show(),GO.util.store.set("document.docMode",this.mode,{type:"session"}),this.docContents.setTemplate(this.formOpts)},setViewMode:function(){this.mode="VIEW",GO.util.store.set("document.docMode",this.mode,{type:"session"}),e(this.el).find("div#editView").hide(),e(this.el).find("div#attachView").show(),e(this.el).find("section.article_reply").show();var n=e.goFormUtil.convertViewMode(this.docModel.docBodyContent);this.docContents.html(n);var r=t.map(this.docContents.find("style"),function(t){return e(t).html()}).join("");t.each(this.docContents.find("span[data-dsl*='editor']"),function(t){var n=e(t);w.init({$el:n,content:GO.util.escapeXssFromHtml(n.html()),style:r+x})})},_setPreviewModeContent:function(t){this.mode="VIEW";var n=e.goFormUtil.convertViewMode(t);this.docContents.html(n),GO.util.isIE8()&&e("body").css("min-width","300px"),e(this.el).find("div#editView").remove(),e(this.el).find("div#attachView").remove(),e(this.el).find("section.article_reply").remove()},setPreviewMode:function(e){var n=this.infoModel.formScriptType,r=this.infoModel.externalScript,i=this.infoModel.scriptBody,s=this;if(n=="SRC"&&!t.isEmpty(r)){var o="view",u=null;t.isEmpty(r)?console.log("module name Empty!!"):require([r],function(n){t.isUndefined(n)||(u=new n({variables:t.clone(s.docModel.variables),docModel:s.docModel,infoData:s.infoModel}),s._setPreviewModeContent(e),t.isFunction(u.renderViewMode)&&u.renderViewMode())})}else if(n=="EDIT"&&!t.isEmpty(i)){var o="view",u,a=new Function(i);if(a){var f=new a;u=new f({variables:t.clone(s.docModel.variables),docModel:s.docModel,infoData:s.infoModel}),s._setPreviewModeContent(e),t.isFunction(u.renderViewMode)&&u.renderViewMode()}else console.log("scriptBody is Empty")}else s._setPreviewModeContent(e)},getTitle:function(){return this.docContents.getApprovalSubject().replace(/\s+/g," ")},getDocBodyContents:function(){return this.mode=="NEW"||this.mode=="EDIT"?this.docContents.getFormData():this.docModel.docBodyContent},getDocVariables:function(){return this.docContents.getDocVariables()},changeActivityGroups:function(t,n){e.fn.changeActivityGroups({groups:t,config:{activityBox:{headerType:this.actionModel.activityBoxHeaderType,bodyElement:{sign:this.actionModel.activityBoxContentSign,name:this.actionModel.activityBoxContentName,position:this.actionModel.activityBoxContentPosition,duty:this.actionModel.activityBoxContentDuty,dept:this.actionModel.activityBoxContentDept}},isReception:n,displayDrafter:this.infoModel.displayDrafter,includeAgreement:this.infoModel.includeAgreement}})},changeReferrenceReaders:function(n){var r=this.$el.find("[data-dsl='{{label:docReference}}']");if(r.length<1)return;var i=[],s="";t.each(n,function(e){var t=e.reader;t.deptType?i.push(t.name):i.push(t.name+" "+t.position)}),s=i.join(","),e.each(r,function(){e(this).val(s).attr("data-value",s)})},changeActivity:function(t){e.fn.changeActivity(t)},setDocNum:function(e){return this.docContents.setDocNo(e)},setApprovalData:function(e){return this.docContents.setApprovalData(e)},setRecipient:function(e){return this.docContents.setRecipient(e)},setPreserveDuration:function(e){return this.docContents.setPreserveDuration(e)},setAttachFile:function(e){return this.docContents.setAttachFile(e)},setSecurityLevel:function(e){return this.docContents.setSecurityLevel(e)},setDocClassification:function(e){return this.docContents.setDocClassification(e)},setDocReference:function(e){return this.docContents.setDocReference(e)},isCompleteRequiredForm:function(){return this.docContents.isCompleteRequiredForm()},getMaxLengthCheck:function(){return this.docContents.getMaxLengthCheck()},setDocFocus:function(t){e("#"+t).focus()}});return T});
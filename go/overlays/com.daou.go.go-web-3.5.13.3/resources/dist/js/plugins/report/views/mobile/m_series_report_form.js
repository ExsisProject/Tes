(function(){define(["jquery","backbone","app","i18n!report/nls/report","i18n!nls/commons","views/mobile/header_toolbar","report/models/report_folder","report/models/report","hgn!report/templates/mobile/m_report_form","attach_file","components/go-fileuploader/mobile","formutil","GO.util","GO.m.util"],function(e,t,n,r,i,s,o,u,a,f,l){var c=t.View.extend({el:"#content",events:{},initialize:function(e){this.options=e||{},this.model=u.get(this.options.reportId);var t=this.model.get("status");this.isUndone=t=="UNDONE",this.isTempsave=t=="TEMP",this.isDone=t=="DONE";var n=this.model.get("folder");this.folderModel=this.isUndone||this.isTempsave?o.get(n.id):(new o).set(n),this.useForm=this.folderModel.get("formFlag"),this.editorTml='<span class="comp_wrap" data-dsl="{{editor}}"></span>',this.$el.off(),this.headerBindEvent()},headerBindEvent:function(){n.EventEmitter.off("trigger-action"),n.EventEmitter.on("trigger-action","report-save",this.saveReport,this),n.EventEmitter.on("trigger-action","report-call-prev",this.callPrevReport,this)},render:function(){this.renderHeaderToolbar(),this.$el.html(a({isPeriodic:this.folderModel.isPeriodic(),title:this.folderModel.get("name")+" > "+this.model.getSeriesStr()}));var e="";return this.isDone?e=this.getSavedContent():this.isTempsave?e=confirm(r["\uc791\uc131\uc911\uc778 \ubcf4\uace0\uc11c\uac00 \uc788\uc2b5\ub2c8\ub2e4. \ubd88\ub7ec\uc624\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"])?this.getSavedContent():this.getCleanContent():e=this.getCleanContent(),this.renderContent(e),this.useSavedContent&&f.edit("#attach_placeholder",this.model.get("attaches")),this.$el.addClass("write"),this.attachFileUploader(),this},renderHeaderToolbar:function(){var t=[{id:"report-call-prev",text:r["\uc774\uc804 \ud68c\ucc28 \ubd88\ub7ec\uc624\uae30"],triggerFunc:"report-call-prev"},{id:"report-save",text:i["\ub4f1\ub85d"],triggerFunc:"report-save"}],n={isClose:!0,actionMenu:t};this.isDone||(n.closeCallback=e.proxy(this.tempsaveReport,this)),s.render(n)},getSavedContent:function(t){this.useSavedContent=!0;var n=t?t:this.model.get("content");return this.useForm?n:e(this.editorTml).append(n).prop("outerHTML")},getCleanContent:function(){return this.useSavedContent=!1,this.useForm?this.folderModel.get("form").content:this.editorTml},renderContent:function(e){var t={data:e,contextRoot:n.contextRoot,userId:n.session().id,userProfileApi:"api/user/profile",deptName:this.model.get("reporter").deptName};this.$el.find("#reportContent").setTemplate(t)},attachFileUploader:function(){var t=this,r={};r.success=function(r){var i=typeof r=="string"?JSON.parse(r):r.data;e("#attach_wrap").show(),i.mode="edit";var s=f.makeTempItem(i);s.done(function(r){if(e("div.option_display").data("attachable")==="false")return;try{t.attachValidate(i)}catch(s){s.message==="overMaxAttachNumber"&&e("div.option_display").data("attachable","false");return}n.util.isImage(i.fileExt)?e("ul.img_wrap").show().append(r.$el):e("ul.file_wrap").show().append(r.$el),r.$el.on("removedFile",function(t,n){var r=n.el;r.preventDefault(),e(r.currentTarget).parents("li").first().remove(),e("div.option_display").data("attachable","true"),e("#attach_wrap").find("li").size()<1&&e("#attach_wrap").hide()})})},r.error=function(){alert(i["\uc5c5\ub85c\ub4dc\uc5d0 \uc2e4\ud328\ud558\uc600\uc2b5\ub2c8\ub2e4."])},l.bind(this.$el.find("#go-fileuploader"),r)},attachValidate:function(t){var r=null,s=n.util.getFileNameAndTypeData(t);n.config("allowedFileUploadSize")&&(r=n.config("allowedFileUploadSize")/1024/1024);try{e.goValidation.attachValidate("#attach_wrap ul li",s,r),n.session().brandName=="DO_SAAS"&&l.attachFileValidateBySaaS(s.size)}catch(o){var u=o.message;if(u=="AttachSizeException")n.util.delayAlert(n.i18n(i["\ucca8\ubd80\ud560 \uc218 \uc788\ub294 \ucd5c\ub300 \uc0ac\uc774\uc988\ub294 0MB \uc785\ub2c8\ub2e4."],"arg1",r));else{if(u=="AttachNumberExceptionBySaaS")throw n.util.delayAlert(n.i18n(i["\ucd5c\ub300 \ucca8\ubd80 \uac2f\uc218\ub294 0\uac1c \uc785\ub2c8\ub2e4."],"arg1",n.config("commonAttachConfig").maxAttachNumber)),new Error("overMaxAttachNumber");u=="NotFoundExtException"&&n.util.delayAlert(i["\ucca8\ubd80\ud560 \uc218 \uc5c6\ub294 \ud30c\uc77c \uc785\ub2c8\ub2e4."])}throw new Error("Attach Validation Error")}},callPrevReport:function(){if(confirm(r["\uc774\uc804\ud68c\ucc28\ub97c \ubd88\ub7ec\uc624\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"])){var t=this,i=n.contextRoot+"api/report/"+this.model.get("id")+"/prev";e.ajax(i,{type:"GET",contentType:"application/json",dataType:"json",success:function(e){var n=t.getSavedContent(e.data.content);t.renderContent(n)},error:function(e){var t=JSON.parse(e.responseText);alert(t.message)}})}},tempsaveReport:function(){function t(){n.util.isAndroidApp()?window.GOMobile.pressBackKey():window.history.back()}if(confirm(i["\uc784\uc2dc\uc800\uc7a5\uc744 \ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c? \ucde8\uc18c\ub97c \ub204\ub974\uba74 \uc791\uc131 \uc911\uc778 \ub0b4\uc6a9\uc740 \uc0ac\ub77c\uc9d1\ub2c8\ub2e4."])){var e=this.setData("TEMP");e.save(null,{success:function(){n.util.toastMessage(r["\uc784\uc2dc\uc800\uc7a5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),t()},error:function(e,t){n.util.toastMessage(i["\uc800\uc7a5\uc5d0 \uc2e4\ud328 \ud558\uc600\uc2b5\ub2c8\ub2e4."])}})}else t()},saveReport:function(){var e=this,t=this.setData();t.save(null,{success:function(t){var r="report/series/"+e.model.get("series").id+"/report/"+e.model.get("id");n.router.navigate(r,{trigger:!0,replace:!0})}})},setData:function(e){var t=new u,n=this.model.get("id"),r=this.$el.find("#reportContent").getFormData();return t.set({id:n,content:r,status:e?e:"DONE",attaches:l.getAttachInfo("#attach_wrap"),contentType:"HTML",folder:{id:this.folderModel.get("id")}}),t}},{__instance__:null,create:function(e){return this.__instance__=new this.prototype.constructor({packageName:e}),this.__instance__}});return c})}).call(this);
define(["jquery","underscore","backbone","app","hgn!admin/templates/appr_config_sign_regist","i18n!nls/commons","i18n!approval/nls/approval","i18n!admin/nls/admin","file_upload","swfupload","swfupload.plugin","jquery.progressbar"],function(e,t,n,r,i,s,o,u,a){var f=n.Model.extend({url:function(){return"/ad/api/approval/admin/config/sign/regist"}}),l={"\uc11c\uba85 \uc77c\uad04\ub4f1\ub85d":u["\uc11c\uba85 \uc77c\uad04\ub4f1\ub85d"],"\uc544\uc774\ub514\ub85c \uad6c\ubd84":o["\uc544\uc774\ub514\ub85c \uad6c\ubd84"],"\uc0ac\ubc88\uc73c\ub85c \uad6c\ubd84":o["\uc0ac\ubc88\uc73c\ub85c \uad6c\ubd84"],"\ud30c\uc77c \ucc3e\uae30":u["\ud30c\uc77c \ucc3e\uae30"],"\ub4f1\ub85d\uc2dc\uc791":o["\ub4f1\ub85d\uc2dc\uc791"],"\uc800\uc7a5":s["\uc800\uc7a5"],"\ucde8\uc18c":s["\ucde8\uc18c"],upload_must_zipfile:u["\uc11c\uba85 \uc774\ubbf8\uc9c0\uc758 \ud30c\uc77c\uc740 \uc0ac\ubc88 \ub610\ub294 \uc544\uc774\ub514\ub85c \ubcc0\uacbd\ud55c \ud6c4, zip \ud30c\uc77c\ub85c \uc5c5\ub85c\ub4dc\ud558\uc2dc\uae30 \ubc14\ub78d\ub2c8\ub2e4."],"\uae30\ubcf8 \uc124\uc815":o["\uae30\ubcf8 \uc124\uc815"],appr_sign_desc:o["\uc11c\uba85\uc740 \uc774\ubbf8\uc9c0 \ud06c\uae30 \uc548\ub0b4"]},c={boxImage:r.contextRoot+"resources/images/progressbar.gif",barImage:r.contextRoot+"resources/images/progressbg_green_200.gif",width:200,max:100},h=n.View.extend({el:"#layoutContent",initialize:function(){this.model=new f,this.model.fetch({async:!1,statusCode:{403:function(){r.util.error("403")},404:function(){r.util.error("404",{msgCode:"400-common"})},500:function(){r.util.error("500")}}})},delegateEvents:function(t){this.undelegateEvents(),n.View.prototype.delegateEvents.call(this,t),this.$el.on("click.signReg","#add_sign",e.proxy(this.uploadStart,this)),this.$el.on("click.signReg","span.ic_del",e.proxy(this.deleteFile,this))},undelegateEvents:function(){return n.View.prototype.undelegateEvents.call(this),this.$el.off(".signReg"),this},deleteFile:function(){e("#fileComplete").html("")},render:function(t){var n=this.model,r={id:n.get("id"),useFlag:n.get("useFlag"),userChangFlag:n.get("userChangFlag")};return this.$el.empty(),this.$el.html(i({lang:l,config:r})),this.initFileUpload(),e("#signResultDiv").hide(),this.$el},findFile:function(){alert("\ud30c\uc77c\ucc3e\uae30")},uploadStart:function(){var t=this,n=e(':radio[name="signType"]:checked').attr("id");if(!n)return e.goError(o["\uad6c\ubd84\uc744 \uc120\ud0dd \ud558\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4."]),!1;if(!e("#file_name").val())return e.goError(u["\uc77c\uad04\ub4f1\ub85d \ud30c\uc77c \uc120\ud0dd"]),!1;var i=new f;e.goConfirm(o["\uc800\uc7a5\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],"",function(){i.set({fileName:e("#file_name").val(),filePath:e("#file_path").val(),hostId:e("#host_id").val(),signType:n},{silent:!0}),r.EventEmitter.trigger("common","layout:setOverlay",u["\ub85c\ub529\uc911"]),i.save({},{type:"PUT",success:function(n,i){r.EventEmitter.trigger("common","layout:clearOverlay",!0),i.code==200&&(e.goMessage(o["\uc800\uc7a5\uc774 \uc644\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),t.drawSuccessList(i.data),t.deleteFile())},error:function(n,i){var s=JSON.parse(i.responseText);return r.EventEmitter.trigger("common","layout:clearOverlay",!0),s.message?(e.goError(u["\ub4f1\ub85d\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4."]),t.drawFileUploadFailView(i.data),t.deleteFile(),!1):(e.goError(u["\ub4f1\ub85d\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4."]),t.drawFileUploadFailView(i.data),t.deleteFile(),!1)}})})},drawSuccessList:function(t){e("#signResultDiv").show();var n="",r=u["\uc11c\uba85 \uc774\ubbf8\uc9c0"]+" "+e("#file_name").val()+" "+u["\uc5c5\ub85c\ub4dc \uc644\ub8cc"];n+='<li><span class="txt">'+r+"</span></li>",e("#signResultDiv ul").empty(),e("#signResultDiv ul").append(n),e.each(t,function(t,r){r.resultFlag?n='<li><span class="txt">'+r.zipFileName+" "+s["\uc800\uc7a5"]+" ["+r.userName+" ] "+"</span></li>":n='<li><span class="txt">'+r.zipFileName+" "+s["\uc2e4\ud328"]+"</span></li>",e("#signResultDiv ul").append(n)})},drawFileUploadFailView:function(t){e("#signResultDiv").show();var n="";n+='<li><span class="txt">'+u["\uc774\ubbf8\uc9c0 \ud30c\uc77c"]+" "+e("#file_name").val()+" "+u["\uc5c5\ub85c\ub4dc \uc2e4\ud328"]+"</span></li>",e("#signResultDiv ul").empty(),e("#signResultDiv ul").append(n)},initFileUpload:function(){var t=u["\ud30c\uc77c \ucc3e\uae30"],n=this,i={el:"#swfupload-control",context_root:r.contextRoot,button_text:"<span class='buttonText'>"+t+"</span>",progressBarUse:!0,url:"ad/api/file?GOAdminSSOcookie="+e.cookie("GOAdminSSOcookie")};(new a(i)).queue(function(e,t){}).start(function(t,n){var r=new RegExp("(.zip)","gi"),i=n.type.toLowerCase();if(!r.test(i))return e.goAlert(o["zip \ud30c\uc77c\ub9cc \ub4f1\ub85d \uac00\ub2a5\ud569\ub2c8\ub2e4."]),e("#progressbar").hide(),!1}).progress(function(e,t){}).success(function(t,n,i){if(r.util.fileUploadErrorCheck(n))return e.goAlert(r.util.serverMessage(n)),!1;e("#signResultDiv").hide();var s=n.data,o=s.fileName,u=s.filePath,a=s.hostId,f=r.util.getHumanizedFileSize(s.fileSize),l="<li id='item_file'><span class='item_file'><span class='ic_file ic_def'></span><span class='name'>"+o+"</span>"+"<span class='size'>("+f+")</span>"+"<span class='btn_wrap' title='\uc0ad\uc81c'>"+"<span class='ic_classic ic_del'></span>"+"</span>"+"</span>"+"<input type='hidden' value='"+u+"' id='file_path'/>"+"<input type='hidden' value='"+o+"' id='file_name'/>"+"<input type='hidden' value='"+a+"' id='host_id'/>"+"</li>";e("#fileComplete").html(l)}).complete(function(e,t){console.info(t)}).error(function(e,t){console.info(t)})},release:function(){this.$el.off(),this.$el.empty()}});return h});
define(["jquery","backbone","app","admin/models/install_info","hgn!system/templates/device_version_create","hgn!system/templates/device_version_modify","hgn!system/templates/attaches_file","hgn!system/templates/attaches","system/models/device_version","i18n!nls/commons","i18n!admin/nls/admin","file_upload","jquery.go-orgslide","jquery.go-sdk","jquery.go-validation"],function(e,t,n,r,i,s,o,u,a,f,l,c){var h={label_ok:f["\uc800\uc7a5"],label_cancel:f["\ucde8\uc18c"],label_modify:f["\uc218\uc815"],label_title_add:l["\ubc84\uc804 \ucd94\uac00"],label_title_modify:l["\ubc84\uc804 \uc0c1\uc138"],label_list:l["\ubaa9\ub85d\uc73c\ub85c \ub3cc\uc544\uac00\uae30"],label_device:l["\ub514\ubc14\uc774\uc2a4"],label_pc:l.PC,label_pc_electron:"PC - Electron",label_pc_mac:"PC - MAC",label_pc_xp:l.PC_XP,label_iphone:l.iPhone,label_android:l.Android,label_importance:l["\uc911\uc694\ub3c4"],label_urgent:l["\uae34\uae09"],label_high:l["\uc0c1"],label_medium:l["\uc911"],label_low:l["\ud558"],label_version:l["\ubc84\uc804"],label_version_ex:l["\ubc84\uc804 \uc124\uba85"],label_ko_message:l["\ud55c\uae00 \uc5c5\ub370\uc774\ud2b8 \uba54\uc138\uc9c0"],label_en_message:l["\uc601\ubb38 \uc5c5\ub370\uc774\ud2b8 \uba54\uc138\uc9c0"],label_jp_message:l["\uc77c\ubb38 \uc5c5\ub370\uc774\ud2b8 \uba54\uc138\uc9c0"],label_zhcn_message:l["\uc911\ubb38 \uac04\uccb4 \uc5c5\ub370\uc774\ud2b8 \uba54\uc138\uc9c0"],label_zhtw_message:l["\uc911\ubb38 \ubc88\uccb4 \uc5c5\ub370\uc774\ud2b8 \uba54\uc138\uc9c0"],label_vi_message:l["\ubca0\ud2b8\ub0a8\uc5b4 \uc5c5\ub370\uc774\ud2b8 \uba54\uc138\uc9c0"],label_ko_contents:l["\ud55c\uae00 \uc5c5\ub370\uc774\ud2b8 \ub0b4\uc6a9"],label_en_contents:l["\uc601\ubb38 \uc5c5\ub370\uc774\ud2b8 \ub0b4\uc6a9"],label_jp_contents:l["\uc77c\ubb38 \uc5c5\ub370\uc774\ud2b8 \ub0b4\uc6a9"],label_zhcn_contents:l["\uc911\ubb38 \uac04\uccb4 \uc5c5\ub370\uc774\ud2b8 \ub0b4\uc6a9"],label_zhtw_contents:l["\uc911\ubb38 \ubc88\uccb4 \uc5c5\ub370\uc774\ud2b8 \ub0b4\uc6a9"],label_vi_contents:l["\ubca0\ud2b8\ub0a8\uc5b4 \uc5c5\ub370\uc774\ud2b8 \ub0b4\uc6a9"],label_message_desc:l["\uc5c5\ub370\uc774\ud2b8 \uba54\uc138\uc9c0 \uc124\uba85"],label_package_upload:l["\ud328\ud0a4\uc9c0 \uc5c5\ub85c\ub4dc"],label_file:l["\ud30c\uc77c \ucc3e\uae30"],label_link_info:l["\ub9c1\ud06c\uc815\ubcf4"],label_note:l["\ube44\uace0"],label_inhouse:l.InHouse,label_market:l.Market,label_info_add:l["\ud56d\ubaa9\ucd94\uac00"],label_info_add_select:l["\ucd94\uac00\ud560 \ud56d\ubaa9\uc744 \uc120\ud0dd\ud558\uc138\uc694."],label_upload:l["\uc5c5\ub85c\ub4dc"],label_link:l["\ub9c1\ud06c"],label_link_message:l["\ub9c1\ud06c\uc548\ub0b4\uba54\uc138\uc9c0"],label_market_url_message:l["\ub9c8\ucf13\uc548\ub0b4\uba54\uc138\uc9c0"],label_note_message:l["\ube44\uace0\uc548\ub0b4\uba54\uc138\uc9c0"],label_market_url:l["\ub9c8\ucf13 URL"],label_file_upload_validation:l["\ud30c\uc77c \uc5c5\ub85c\ub4dc \uc720\ud6a8\uc131\uccb4\ud06c"],label_market_url_validation:l["\ub9c8\ucf13 \ub9c1\ud06c \uc720\ud6a8\uc131\uccb4\ud06c"]},p=null,d=n.BaseView.extend({initialize:function(e){this.options=e||{},this.deviceId=this.options.deviceId,this.unbindEvent(),this.bindEvent()},unbindEvent:function(){this.$el.off("click","span#btn_device_version_ok"),this.$el.off("click","span#btn_device_version_modify"),this.$el.off("click","span#btn_device_version_cancel"),this.$el.off("click","span.ic_del"),this.$el.off("keyup","input#version"),this.$el.off("click","input:radio[name='deviceType']"),this.$el.off("click","input:radio[name='linkType']"),this.$el.off("click","input:radio[name='marketType']"),this.$el.off("change","#more_message"),this.$el.off("change","#more_contents")},bindEvent:function(){this.$el.on("click","span#btn_device_version_ok",e.proxy(this.deviceVersionSave,this)),this.$el.on("click","span#btn_device_version_modify",e.proxy(this.deviceVersionModify,this)),this.$el.on("click","span#btn_device_version_cancel",e.proxy(this.deviceVersionCancel,this)),this.$el.on("click","span.ic_del",e.proxy(this.cancelUploadFile,this)),this.$el.on("keyup","input#version",e.proxy(this.validationVersion,this)),this.$el.on("click","input:radio[name='deviceType']",e.proxy(this.toggleDeviceType,this)),this.$el.on("click","input:radio[name='linkType']",e.proxy(this.toggleLinkType,this)),this.$el.on("click","input:radio[name='marketType']",e.proxy(this.toggleMarketType,this)),this.$el.on("change","#more_message",e.proxy(this.addMoreMessage,this)),this.$el.on("change","#more_contents",e.proxy(this.addMoreContents,this))},addMoreContents:function(t){t.stopPropagation(),e("#"+t.target.value).show(),e(t.target).find(":selected").remove(),e("#more_contents option").size()==1&&e("#addUpdateContents").hide()},addMoreMessage:function(t){t.stopPropagation(),e("#"+t.target.value).show(),e(t.target).find(":selected").remove(),e("#more_message option").size()==1&&e("#addUpdateMessage").hide()},toggleDeviceType:function(t){t.stopPropagation(),e("span#marketType").remove(),e("#marketLink").hide(),e("#packageUpload").show();var n=e(t.currentTarget).attr("value");(n=="android"||n=="iphone")&&this.appendMarketType(t)},toggleMarketType:function(t){t.stopPropagation();var n=e(t.currentTarget).attr("value");n=="market"?(e("#packageUpload").hide(),e("#marketLink").show(),this.$el.find("#file_link").val(""),e("span.ic_del").parents("li").remove()):(e("#marketLink").hide(),e("#packageUpload").show(),e("#marketUrl").val(""))},appendMarketType:function(t){var n=[];n.push('<span class="option_wrap" id="marketType">'),n.push("("),n.push('<input type="radio" name="marketType" value="inhouse" id="inhouse" checked="checked"/> <label for="inhouse">'+h.label_inhouse+"</label>"),n.push('<input type="radio" name="marketType" value="market" id="market"/> <label for="market">'+h.label_market+"</label>"),n.push(")"),n.push("</span>"),e(t.currentTarget).parent().parent().append(n.join(""))},toggleLinkType:function(t){t.stopPropagation(),e(t.currentTarget).attr("value")=="upload"?(e("span#file_upload_btn").show(),e("span#file_layer").show(),e("span#file_upload_link").hide(),e("#marketUrl").val(""),e("#file_link").val("")):(e("span#file_upload_btn").hide(),e("span#file_layer").hide(),e("span#file_upload_link").show(),e("#marketUrl").val(""),e("span.ic_del").parents("li").remove())},validationVersion:function(t){t.stopPropagation();if(!(t.keyCode>=96&&t.keyCode<=105||t.keyCode>=48&&t.keyCode<=57||t.keyCode==13||t.keyCode==8||t.keyCode==190||t.keyCode==110))return e.goMessage(l["\ubc84\uc804 \ud615\uc2dd\uc744 \uc9c0\ucf1c\uc8fc\uc138\uc694!! \uc608) 1.1.1.1"]),t.currentTarget.value="",!1},getCompanyLocale:function(e,t){return e==t?!0:!1},render:function(){var t,n=this,o,u=r.read().toJSON().language;u=="ja"?o="jp":u=="zh_CN"?o="zhcn":u=="zh_TW"?o="zhtw":u=="vi"?o="vi":o=u,e(".breadcrumb .path").html(l["\ubaa8\ube4c\ub9ac\ud2f0 > \ubaa8\ubc14\uc77c \uc571 \ubc84\uc804 \uad00\ub9ac"]),this.$el.empty(),e("#mobilty").addClass("on"),this.deviceId?(this.deviceModel=a.get(this.deviceId),this.deviceData=this.deviceModel.toJSON(),t=s({dataset:this.deviceData,lang:h,isKoLocale:function(){return n.getCompanyLocale(o,"ko")},isEnLocale:function(){return n.getCompanyLocale(o,"en")},isJpLocale:function(){return n.getCompanyLocale(o,"jp")},isZhcnLocale:function(){return n.getCompanyLocale(o,"zhcn")},isZhtwLocale:function(){return n.getCompanyLocale(o,"zhtw")},isViLocale:function(){return n.getCompanyLocale(o,"vi")},isAndroidType:function(){return this.deviceType=="android"}}),this.$el.html(t),this.setDeviceModifyData(this.deviceData),this.initSWFUpload()):(t=i({lang:h,isKoLocale:function(){return n.getCompanyLocale(o,"ko")},isEnLocale:function(){return n.getCompanyLocale(o,"en")},isJpLocale:function(){return n.getCompanyLocale(o,"jp")},isZhcnLocale:function(){return n.getCompanyLocale(o,"zhcn")},isZhtwLocale:function(){return n.getCompanyLocale(o,"zhtw")},isViLocale:function(){return n.getCompanyLocale(o,"vi")}}),this.$el.html(t),this.initSWFUpload()),this.$el.find("#installLocale").val(o)},setDeviceModifyData:function(t){this.$el.find("#deviceId").val(t.id),this.$el.find('input[name="deviceType"][value="'+t.deviceType+'"]').attr("checked",!0),this.$el.find('input[name="importance"][value="'+t.importance+'"]').attr("checked",!0),this.$el.find('input[name="linkType"][value="'+t.linkType+'"]').attr("checked",!0),this.$el.find("#version").val(t.version),this.$el.find("#note").val(t.note),this.$el.find("#marketUrl").val(t.marketUrl);var n=this.$el.find("#installLocale").val();this.$el.find('#more_message > option[value="'+n+'UpdateMessage"]').remove(),this.$el.find('#more_contents > option[value="'+n+'UpdateContents"]').remove(),t.koUpdateMessage&&(this.$el.find("#koUpdateMessage").show(),this.$el.find("textarea#koUpdateMessage").val(t.koUpdateMessage),this.$el.find('#more_message > option[value="koUpdateMessage"]').remove()),t.enUpdateMessage&&(this.$el.find("#enUpdateMessage").show(),this.$el.find("textarea#enUpdateMessage").val(t.enUpdateMessage),this.$el.find('#more_message > option[value="enUpdateMessage"]').remove()),t.jpUpdateMessage&&(this.$el.find("#jpUpdateMessage").show(),this.$el.find("textarea#jpUpdateMessage").val(t.jpUpdateMessage),this.$el.find('#more_message > option[value="jpUpdateMessage"]').remove()),t.zhcnUpdateMessage&&(this.$el.find("#zhcnUpdateMessage").show(),this.$el.find("textarea#zhcnUpdateMessage").val(t.zhcnUpdateMessage),this.$el.find('#more_message > option[value="zhcnUpdateMessage"]').remove()),t.zhtwUpdateMessage&&(this.$el.find("#zhtwUpdateMessage").show(),this.$el.find("textarea#zhtwUpdateMessage").val(t.zhtwUpdateMessage),this.$el.find('#more_message > option[value="zhtwUpdateMessage"]').remove()),t.viUpdateMessage&&(this.$el.find("#viUpdateMessage").show(),this.$el.find("textarea#viUpdateMessage").val(t.viUpdateMessage),this.$el.find('#more_message > option[value="viUpdateMessage"]').remove()),t.koUpdateContents&&(this.$el.find("#koUpdateContents").show(),this.$el.find("textarea#koUpdateContents").val(t.koUpdateContents),this.$el.find('#more_contents > option[value="koUpdateContents"]').remove()),t.enUpdateContents&&(this.$el.find("#enUpdateContents").show(),this.$el.find("textarea#enUpdateContents").val(t.enUpdateContents),this.$el.find('#more_contents > option[value="enUpdateContents"]').remove()),t.jpUpdateContents&&(this.$el.find("#jpUpdateContents").show(),this.$el.find("textarea#jpUpdateContents").val(t.jpUpdateContents),this.$el.find('#more_contents > option[value="jpUpdateContents"]').remove()),t.zhcnUpdateContents&&(this.$el.find("#zhcnUpdateContents").show(),this.$el.find("textarea#zhcnUpdateContents").val(t.zhcnUpdateContents),this.$el.find('#more_contents > option[value="zhcnUpdateContents"]').remove()),t.zhtwUpdateContents&&(this.$el.find("#zhtwUpdateContents").show(),this.$el.find("textarea#zhtwUpdateContents").val(t.zhtwUpdateContents),this.$el.find('#more_contents > option[value="zhtwUpdateContents"]').remove()),t.viUpdateContents&&(this.$el.find("#viUpdateContents").show(),this.$el.find("textarea#viUpdateContents").val(t.viUpdateContents),this.$el.find('#more_contents > option[value="viUpdateContents"]').remove()),t.marketType=="market"?(this.$el.find("#packageUpload").hide(),this.$el.find("#marketLink").show()):(this.$el.find("#packageUpload").show(),this.$el.find("#marketLink").hide()),t.deviceType=="android"||t.deviceType=="iphone"?this.$el.find("#marketType").show():this.$el.find("#marketType").hide(),e('input:radio[name="marketType"][value="'+t.marketType+'"]').attr("checked","checked"),this.$el.find("#linkType").val(t.linkType),t.linkType=="upload"?(e("span#file_upload_link").hide(),e("span#file_upload_btn").show(),t.deviceVersionAttach!=null&&(this.$el.find(".file_wrap").html(u({dataset:t.deviceVersionAttach,linkUrl:t.linkUrl,label_link_info:l["\ub9c1\ud06c\uc815\ubcf4"]})),e("#fileName").attr("data-name",t.deviceVersionAttach.name),e("#linkinfo").append('<span id="device_download" class="btn_wrap"><span class="btn_s" id="btn_down"><a href="'+GO.contextRoot+"ad/api/system/device/download/"+t.deviceVersionAttach.id+'">'+l["\ub2e4\uc6b4\ub85c\ub4dc"]+"</a></span></span>"))):(e("span#file_upload_link").show(),e("span#file_upload_btn").hide(),this.$el.find("#file_link").val(t.linkUrl))},initSWFUpload:function(){var t=this,n=h.label_file;options={el:"#swfupload-control",context_root:GO.contextRoot,button_text:"<span class='buttonText'>"+n+"</span>",url:"ad/api/file?GOAdminSSOcookie="+e.cookie("GOAdminSSOcookie")},(new c(options)).queue(function(e,t){}).start(function(e,t){}).progress(function(e,t){}).success(function(t,n,r){if(GO.util.fileUploadErrorCheck(n))return e.goAlert(GO.util.serverMessage(n)),!1;var i=n.data,s=i.fileName,u=i.filePath,a=i.hostId,f=i.fileExt.toLowerCase(),c=new RegExp("(ipa|zip|apk|exe|dmg)","gi"),h=c.test(f);h?(e(".file_wrap").html(o({dataset:i,name:s,linkInfo:!1})),e("#fileName").attr("data-tempname",u),e("#fileName").attr("data-name",s),e("#fileName").attr("host-id",a)):e.goMessage(l["\ud328\ud0a4\uc9c0 \ud655\uc7a5\uc790\uacbd\uace0"])}).complete(function(e,t){console.info(t)}).error(function(e,t){console.info(t)})},deviceVersionSave:function(t){t.stopPropagation();var r=e('input[name="deviceType"]:radio:checked').val(),i=e('input[name="importance"]:radio:checked').val(),s=e("#version").val(),o=e("textarea#koUpdateMessage").val(),u=e("textarea#enUpdateMessage").val(),a=e("textarea#jpUpdateMessage").val(),f=e("textarea#zhcnUpdateMessage").val(),c=e("textarea#zhtwUpdateMessage").val(),h=e("textarea#viUpdateMessage").val(),p=e("textarea#koUpdateContents").val(),d=e("textarea#enUpdateContents").val(),v=e("textarea#jpUpdateContents").val(),m=e("textarea#zhcnUpdateContents").val(),g=e("textarea#zhtwUpdateContents").val(),y=e("textarea#viUpdateContents").val(),b=e("#note").val(),w=e("#marketUrl").val(),E=e('input[name="marketType"]:radio:checked').val(),S=e('input[name="linkType"]:radio:checked').val(),x=e("#file_link").val(),T={};e("#fileName").attr("data-name")!=null&&(T.name=e("#fileName").attr("data-name"),T.path=e("#fileName").attr("data-tempname"),T.hostId=e("#fileName").attr("host-id"));if(!e.goValidation.isCheckLength(0,32,s)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"32"})),e("#version").focus();return}if(!e.goValidation.validateVersion(s)){e.goMessage(l["\ubc84\uc804\uc785\ub825\uac12\uc81c\ud55c"]),e("#version").focus();return}if(!e.goValidation.isCheckLength(0,512,o)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"512"})),e("#koUpdateMessage").focus();return}if(!e.goValidation.isCheckLength(0,512,u)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"512"})),e("#enUpdateMessage").focus();return}if(!e.goValidation.isCheckLength(0,512,a)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"512"})),e("#jpUpdateMessage").focus();return}if(!e.goValidation.isCheckLength(0,512,f)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"512"})),e("#zhcnUpdateMessage").focus();return}if(!e.goValidation.isCheckLength(0,512,c)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"512"})),e("#zhtwUpdateMessage").focus();return}if(!e.goValidation.isCheckLength(0,512,h)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"512"})),e("#viUpdateMessage").focus();return}if(E=="inhouse"){if(S=="link"&&(x==null||x==="")){e.goMessage(l["\ud30c\uc77c\ub2e4\uc6b4\ub85c\ub4dc \ub9c1\ud06c\uc815\ubcf4\ub97c \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."]);return}S=="upload"&&(T.path==null||T.path==="")&&e.goMessage(l["\ud30c\uc77c \uc5c5\ub85c\ub4dc \uc720\ud6a8\uc131\uccb4\ud06c"])}if(E=="market"&&(w==null||w==="")){e.goMessage(l["\ub9c8\ucf13 \ub9c1\ud06c \uc720\ud6a8\uc131\uccb4\ud06c"]);return}var N=GO.contextRoot+"ad/api/system/device/version",C={deviceType:r,marketType:E==null||r=="pc"||r=="pc_xp"?"none":E,importance:i,version:s,koUpdateMessage:o,enUpdateMessage:u,jpUpdateMessage:a,zhcnUpdateMessage:f,zhtwUpdateMessage:c,viUpdateMessage:h,koUpdateContents:p,enUpdateContents:d,jpUpdateContents:v,zhcnUpdateContents:m,zhtwUpdateContents:g,viUpdateContents:y,note:b,marketUrl:w,deviceVersionAttach:T.path==null&&T.name==null?null:T,linkType:E=="market"?"link":S,linkUrl:x};GO.EventEmitter.trigger("common","layout:setOverlay",""),e.go(N,JSON.stringify(C),{qryType:"POST",contentType:"application/json",responseFn:function(e){GO.EventEmitter.trigger("common","layout:clearOverlay",!0),e.code==200&&n.router.navigate("system/device",!0)},error:function(t){GO.EventEmitter.trigger("common","layout:clearOverlay",!0);var n=JSON.parse(t.responseText);e.goMessage(n.message)}})},deviceVersionModify:function(t){t.stopPropagation();var r=e('input[name="deviceType"]:radio:checked').val(),i=e('input[name="importance"]:radio:checked').val(),s=e("#version").val(),o=e("textarea#koUpdateMessage").val(),u=e("textarea#enUpdateMessage").val(),a=e("textarea#jpUpdateMessage").val(),f=e("textarea#zhcnUpdateMessage").val(),c=e("textarea#zhtwUpdateMessage").val(),h=e("textarea#viUpdateMessage").val(),p=e("textarea#koUpdateContents").val(),d=e("textarea#enUpdateContents").val(),v=e("textarea#jpUpdateContents").val(),m=e("textarea#zhcnUpdateContents").val(),g=e("textarea#zhtwUpdateContents").val(),y=e("textarea#viUpdateContents").val(),b=e("#note").val(),w=e("#marketUrl").val(),E=e('input[name="marketType"]:radio:checked').val(),S=e('input[name="linkType"]:radio:checked').val(),x=e("#file_link").val(),T={};e("#fileName").attr("data-name")!=null&&(T.name=e("#fileName").attr("data-name"),T.hostId=e("#fileName").attr("host-id"),e("#fileName").attr("data-tempname")!=null?T.path=e("#fileName").attr("data-tempname"):T.id=e("#fileName").attr("data-id"));if(!e.goValidation.isCheckLength(0,32,s)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"32"})),e("#version").focus();return}if(!e.goValidation.validateVersion(s)){e.goMessage(l["\ubc84\uc804\uc785\ub825\uac12\uc81c\ud55c"]),e("#version").focus();return}if(!e.goValidation.isCheckLength(0,512,o)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"512"})),e("#koUpdateMessage").focus();return}if(!e.goValidation.isCheckLength(0,512,u)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"512"})),e("#enUpdateMessage").focus();return}if(!e.goValidation.isCheckLength(0,512,a)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"512"})),e("#jpUpdateMessage").focus();return}if(!e.goValidation.isCheckLength(0,512,f)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"512"})),e("#zhcnUpdateMessage").focus();return}if(!e.goValidation.isCheckLength(0,512,c)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"512"})),e("#zhtwUpdateMessage").focus();return}if(!e.goValidation.isCheckLength(0,512,h)){e.goMessage(n.i18n(l["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"0",arg2:"512"})),e("#viUpdateMessage").focus();return}if(E=="inhouse"){if(S=="link"&&(x==null||x==="")){e.goMessage(l["\ud30c\uc77c\ub2e4\uc6b4\ub85c\ub4dc \ub9c1\ud06c\uc815\ubcf4\ub97c \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."]);return}if(S=="upload"&&(T.name==null||T.name==="")){e.goMessage(l["\ud30c\uc77c \uc5c5\ub85c\ub4dc \uc720\ud6a8\uc131\uccb4\ud06c"]);return}}if(E=="market"&&(w==null||w==="")){e.goMessage(l["\ub9c8\ucf13 \ub9c1\ud06c \uc720\ud6a8\uc131\uccb4\ud06c"]);return}var N=GO.contextRoot+"ad/api/system/device/version/"+e("#deviceId").val(),C={deviceType:r,marketType:E==null||r=="pc"||r=="pc_xp"?"none":E,importance:i,version:s,koUpdateMessage:o,enUpdateMessage:u,jpUpdateMessage:a,zhcnUpdateMessage:f,zhtwUpdateMessage:c,viUpdateMessage:h,koUpdateContents:p,enUpdateContents:d,jpUpdateContents:v,zhcnUpdateContents:m,zhtwUpdateContents:g,viUpdateContents:y,note:b,marketUrl:w,deviceVersionAttach:T.path==null&&T.name==null?null:T,linkType:E=="market"?"link":S,linkUrl:x};GO.EventEmitter.trigger("common","layout:setOverlay",""),e.go(N,JSON.stringify(C),{qryType:"PUT",contentType:"application/json",responseFn:function(e){GO.EventEmitter.trigger("common","layout:clearOverlay",!0),e.code==200&&n.router.navigate("system/device",!0)},error:function(t){GO.EventEmitter.trigger("common","layout:clearOverlay",!0);var n=JSON.parse(t.responseText);e.goMessage(n.message)}})},deviceVersionCancel:function(e){e.stopPropagation(),n.router.navigate("system/device",!0)},cancelUploadFile:function(t){t.stopPropagation(),e(t.target).parents("li").remove()}},{create:function(e){return p=new d({el:"#layoutContent",deviceId:e?e.deviceId:""}),p.deviceId=e?e.deviceId:"",p.render()}});return{render:function(e){var t=d.create(e);return t}}});
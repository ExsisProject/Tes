function getPopupData(){return POPUPDATA}function ocx_file(){var e=document.uploadForm.powerupload;e.AttachFile()}function ocx_init(){var e=document.uploadForm.powerupload;e.SetAttachDuedate(Math.floor(BIGATTACH_EXPIRE_DATE.getTime()/1e3)),e.SetAttachMaxSize("HUGE",MAX_BIG_ATTACH_SIZE),e.SetAttachMaxSize("NORMAL",1048576*MAX_ATTACH_SIZE),e.SetUrlData("UPLOAD",goHostInfo+"/api/mail/file/upload"),e.SetUrlData("UPFIELD","theFile"),jQuery("#ocx_normal_size").html(printSize(0)),jQuery("#ocx_huge_size").html(printSize(0)),jQuery("#ocx_huge_quota").html(printSize(BIG_ATTACH_QUOTA))}function deleteOcxFileAll(){var e=document.uploadForm.powerupload,t=e.GetAttachedFileCount();for(var n=0;n<t;n++)e.DetachFile(0)}function updateHugeQuota(e){BIG_ATTACH_QUOTA=MAX_BIG_ATTACH_QUOTA-e,BIG_ATTACH_QUOTA=BIG_ATTACH_QUOTA<0?0:BIG_ATTACH_QUOTA;if(isOcxUpload){var t=document.uploadForm.powerupload;jQuery("#ocx_huge_quota").html(printSize(BIG_ATTACH_QUOTA)),t.SetAttachMaxSize("HUGE",MAX_BIG_ATTACH_SIZE)}else jQuery("#basic_huge_quota").html(printSize(BIG_ATTACH_QUOTA)),basicAttachUploadControl.setAttachSize("hugeMax",BIG_ATTACH_QUOTA)}function ocx_upload(){var e=document.uploadForm.powerupload;return e.SetUploadParam("type","ocx"),e.SetUploadParam("writeFile","true"),e.SetUploadParam("upldtype","upld"),e.SetUploadParam("attfile","true"),e.SetUploadParam("userId","mailadm"),e.SetUploadParam("queryValue","Successful"),e.SetUploadParam("text","text"),e.SetUploadParam("uploadType","power"),e.SetUploadParam("regdate",today.getTime()),e.UploadFiles()}function makeBigAttachContent(){var e={},t,n=null,r=0,i=[],s,o,u,a,f,l,e;if(isOcxUpload){var c=document.uploadForm.powerupload,h=c.GetAttachedFileCount();for(var p=0;p<h;p++)s=c.GetAttachedFileAttr(p,"TYPE"),upkey=c.GetAttachedFileAttr(p,"UPKEY"),o=c.GetAttachedFileAttr(p,"SIZE"),u=c.GetAttachedFileAttr(p,"FILENAME2"),a=c.GetAttachedFileAttr(p,"FILEPATH"),f=c.GetAttachedFileAttr(p,"UID"),u=Base64TMS.decode(u),s=="huge"&&i.push({size:o,fileName:u,uid:f})}else{var d=basicAttachUploadControl.getFileList("huge");for(var p=0;p<d.length;p++)o=d[p].size,u=d[p].name,f=d[p].uid,i.push({size:o,fileName:u,uid:f})}var v="",m=window.location.port?":"+window.location.port:"",v=window.location.protocol+"//"+window.location.hostname+m,g='<table class="tb_attachFile" width="100%" style="table-layout:fixed; border:1px solid #e6e6e6; margin:10px 0 20px; padding:0; font-size: 12px" cellspacing="0" cellpadding="0"><thead><tr><th style="padding:8px; text-align:left; background-color:#F7F7F7; border-bottom:1px solid #e6e6e6; cursor: default"><img src="'+v+'/resources/images/ic_clip.png" style="vertical-align:middle; height:16px; margin-right:5px" />'+'<span style="display:inline-block; vertical-align:middle;"> '+mailMsg.bigattach_06+"</span>"+'<span style="display:inline-block; vertical-align:middle; color:#2EACB3; font-weight:normal; font-size: 12px">&nbsp;&nbsp;'+i.length+"</span>"+'<span style="display:inline-block; vertical-align:middle; font-weight:normal; font-size: 12px">'+mailMsg.mail_unit_count+"</span>"+"</th>"+"</tr>"+"</thead>"+"<tbody>",y='<table class="tb_attachFile" width="100%" style="table-layout:fixed; border:1px solid #e6e6e6; margin:10px 0 20px; padding:0; font-size: 12px" cellspacing="0" cellpadding="0"><thead><tr><th style="padding:8px; text-align:left; background-color:#F7F7F7; border-bottom:1px solid #e6e6e6; cursor: default"><img src="'+v+'/resources/images/ic_clip.png" style="vertical-align:middle; height:16px; margin-right:5px" />'+'<span style="display:inline-block; vertical-align:middle;"> '+mailMsg.bigattach_06+"</span>"+'<span style="display:inline-block; vertical-align:middle; color:#2EACB3; font-weight:normal; font-size: 12px">&nbsp;&nbsp;'+i.length+"</span>"+'<span style="display:inline-block; vertical-align:middle; font-weight:normal; font-size: 12px">'+mailMsg.mail_unit_count+"</span>"+'<span style="display:inline-block; vertical-align:middle;font-family:AppleGothic,arial,Helvetica,sans-serif">&nbsp;&nbsp;(Large Attachment <span style="display:inline-block; vertical-align:middle; color:#2EACB3; font-weight:normal; font-size: 12px">&nbsp;&nbsp;'+i.length+"</span> ) </span>"+"</th>"+"</tr>"+"</thead>"+"<tbody>";if(i.length>0){n=[];for(var p=0;p<i.length;p++)e=i[p],o=e.size,u=e.fileName,n.push("email="+USEREMAIL+"&uid="+e.uid),g+='<tr><td style="padding: 8px; box-sizing: border-box; border-bottom: 1px solid #e6e6e6; background-color: #f7f7f7;"><a href="{tims_bigattach_link_'+p+'}" style="vertical-align: middle; line-height: 22px; text-decoration: none; color: #333; margin-right: 3px;font-family:AppleGothic,arial,Helvetica,sans-serif">'+u+"</a>"+'<span style="font-family: tahoma, dotum; color: #999; font-size: 11px; margin-right: 5px;font-family:AppleGothic,arial,Helvetica,sans-serif">('+printSize(o)+")</span>"+'<a target="_self" href="{tims_bigattach_link_'+p+'}" ><img src="'+v+'/resources/images/ic_mail_download.gif" style="vertical-align: middle; margin-top: -2px; padding: 4px; border-style: none" title="download"></a>'+"</td>"+"</tr>",y+='<tr><td style="padding: 8px; box-sizing: border-box; border-bottom: 1px solid #e6e6e6; background-color: #f7f7f7;"><a href="{tims_bigattach_link_'+p+'}" style="vertical-align: middle; line-height: 22px; text-decoration: none; color: #333; margin-right: 3px;font-family:AppleGothic,arial,Helvetica,sans-serif">'+u+"</a>"+'<span style="font-family: tahoma, dotum; color: #999; font-size: 11px; margin-right: 5px;font-family:AppleGothic,arial,Helvetica,sans-serif">('+printSize(o)+")</span>"+'<a target="_self" href="{tims_bigattach_link_'+p+'}" ><img src="'+v+'/resources/images/ic_mail_download.gif" style="vertical-align: middle; margin-top: -2px; padding: 4px; border-style: none" title="download"></a>'+"</td>"+"</tr>",r++}return g+='<tr><td style="background-color:#F7F7F7; padding:9px 8px; font-family:AppleGothic,arial,Helvetica,sans-serif; line-height: 16px"><span style="color:#3b3b3b">'+mailMsg.bigattach_17+" </span>"+msgArgsReplace(mailMsg.bigattach_16,[BIGATTACH_EXPIRE,BIGATTACH_DOWNCNT])+' : <span style="color:red">'+" ~ "+BIGATTACH_EXPIRE_DATE.getFullYear()+"-"+(BIGATTACH_EXPIRE_DATE.getMonth()+1)+"-"+BIGATTACH_EXPIRE_DATE.getDate()+'</span><span style="padding-left:5px">'+BIGATTACH_TIMEZONE+"</span></td>"+"</tr>"+"</tbody>"+"</table>",y+='<tr><td style="background-color:#F7F7F7; padding:9px 8px; font-family:AppleGothic,arial,Helvetica,sans-serif; line-height: 16px"><span style="color:#3b3b3b">'+mailMsg.bigattach_17+" - </span>"+msgArgsReplace(mailMsg.bigattach_16,[BIGATTACH_EXPIRE,BIGATTACH_DOWNCNT])+'<span style="color:#3b3b3b;"> (Download available for '+BIGATTACH_EXPIRE+'days) : <span style="color:red">'+" ~ "+BIGATTACH_EXPIRE_DATE.getFullYear()+"-"+(BIGATTACH_EXPIRE_DATE.getMonth()+1)+"-"+BIGATTACH_EXPIRE_DATE.getDate()+'</span></span><span style="padding-left:5px">'+BIGATTACH_TIMEZONE+"</span></td>"+"</tr>"+"</tbody>"+"</table>",r>0?(e.mode=!0,LOCALE=="en"?e.html=g:e.html=y,e.links=n):(e.mode=!1,e.html="",e.links=n),e}function hugeMailCheck(){var e;if(isOcxUpload){var t=document.uploadForm.powerupload;e=t.GetAttachedSize("HUGE")}else e=basicAttachUploadControl.getAttachSize("hugeUse");var n=jQuery("#reservation").attr("checked"),r=jQuery("#reservation"),i=jQuery("#securemail");e>0&&n?(i&&i.attr("disabled")&&chkSecureMail(!0),jQuery.goAlert("",mailMsg.write_alert006),chkReservedMail(!1)):e>0&&i&&i.attr("checked")?(r.attr("disabled")&&chkReservedMail(!0),jQuery.goAlert("",mailMsg.write_alert005),chkSecureMail(!1)):e==0&&(r.attr("disabled")?chkReservedMail(!0):i&&i.attr("disabled")&&chkSecureMail(!0))}function basic_init(){basicAttachUploadControl.setAttachSize("hugeMax",BIG_ATTACH_QUOTA),basicAttachUploadControl.setAttachSize("hugeUse",0),basicAttachUploadControl.setAttachSize("normalMax",1048576*MAX_ATTACH_SIZE),basicAttachUploadControl.setAttachSize("normalUse",0),jQuery("#basic_normal_size").html(printSize(0)),jQuery("#basic_huge_size").html(printSize(0)),jQuery("#basic_huge_quota").html(printSize(BIG_ATTACH_QUOTA))}function updateAttachQuota(e,t){e=="hugeUse"?(jQuery("#basic_huge_size").html(printSize(t)),basicAttachUploadControl.setAttachSize("hugeUse",t)):e=="normalUse"&&(jQuery("#basic_normal_size").html(printSize(t)),basicAttachUploadControl.setAttachSize("normalUse",t))}function chgAttachMod(e,t){var n=e,r=function(){var e=jQuery("#att_btn_ocx"),t=jQuery("#crtBtnSimple"),r=jQuery("#att_ocx_area"),i=jQuery("#att_ocx_quota_info"),s=jQuery("#att_btn_simple"),o=jQuery("#crtBtnPower"),u=jQuery("#att_simple_area"),a=jQuery("#att_simple_quota_info"),f=jQuery("#simpleFileInit"),l=jQuery("#simpleFileInitSub");USE_WEBFOLDER==1?jQuery("#writeWebfolderBtn").show():jQuery("#writeWebfolderBtn").hide();try{if(n=="ocx"){isOcxUploadDownModule=!1;if(!isOcxUploadDownModule){USE_BIGATTACH_MODE?makePoweruploadOcx("ocxCompL",LOCALE):makeNormalUploadOcx("ocxCompL",LOCALE);try{if(isMsie){var c=document.uploadForm.powerupload;c.SetUrlData("UPFIELD","theFile"),isOcxUploadDownModule=!0}}catch(h){console.log(h),isOcxUploadDownModule=!1,isMsie9&&setTimeout(function(){chgAttachMod("ocx",!0),jQuery("#crtBtnSimple").hide()},1e3)}}if(isOcxUploadDownModule){ocx_init();var c=document.uploadForm.powerupload;s.hide(),o.hide(),u.hide(),a.hide(),f.hide(),l.hide(),c.SetChangeUpMode("true"),e.show(),t.show(),r.show(),i.show(),showAttachBoxDisplay(!0),setCookie("OcxUpload","on",365),isOcxUpload=!0,jQuery("span[evt-rol='attach-area-toggle']").hasClass("ic_arrow_down_type4")&&jQuery("span[evt-rol='attach-area-toggle']").trigger("click"),basicAttachUploadControl.emptyFileList(),USE_BIGATTACH_MODE&&(jQuery("#basic_bigattach_size").show(),jQuery("#bigAttachMgn").show(),jQuery("#bigattachMessageSpanBtn").show())}}else{e.hide(),t.hide(),r.hide(),i.hide(),f.show(),l.show(),jQuery("#basicUploadControl").hide(),USE_BIGATTACH_MODE?(jQuery("#basic_bigattach_size").show(),jQuery("#bigattachMngBtn").show(),jQuery("#bigattachMessageSpanBtn").show()):(jQuery("#basic_bigattach_size").hide(),jQuery("#bigattachMngBtn").hide(),jQuery("#bigattachMessageSpanBtn").hide()),s.show(),o.show(),u.show(),a.show(),showAttachBoxDisplay(!1);if(activeXMake&&isMsie&&isOcxUpload){var c=document.uploadForm.powerupload,p=c.GetAttachedFileCount(),d;for(var v=p-1;v>=0;v--)d=c.GetAttachedFileAttr(v,"attachid"),c.RemoveAttachFile(d);c.Reset()}setCookie("OcxUpload","off",365),isOcxUpload=!1,basicAttachUploadControl.init(),basicAttachUploadControl.makeBtnControl(),basicAttachUploadControl.makeListControl(),basic_init();if(!isMsie||!activeXMake)t.hide(),o.hide()}}catch(h){throw h}};!t&&getAttachTotalCount()>0?jQuery.goConfirm(mailMsg.mail_write,mailMsg.mail_attach_change_mode_is_exsit_title,function(){r()}):r()}function checkUploadfile(e){var t,n,r,i,s,o;if(e&&e.length>0){for(var u=0;u<e.length;u++){r=e[u].upkey,t=e[u].name,n=e[u].size,s=e[u].hostId,i=e[u].uid?e[u].uid:"",o="normal";var a=getAttachNormalSize();parseInt(a,10)+parseInt(n,10)>MAX_ATTACH_SIZE*1024*1024&&(o="huge"),addlist(t,n,r,s,i,o)}fileCheck=!0,jQuery("#att_simple_area").show().closest("tr").find("[evt-rol=attach-area-toggle]").toggleClass("ic_arrow_down_type4").toggleClass("ic_arrow_up_type4")}else fileCheck=!0}function deleteAllHugeFile(){var e=getHugeFileUidList();e.length>0&&deleteBigAttachFile(e)}function getHugeFileUidList(){var e=[];if(isOcxUpload){var t=document.uploadForm.powerupload,n=t.GetAttachedFileCount(),r,i;for(var s=0;s<n;s++)r=t.GetAttachedFileAttr(s,"TYPE"),i=t.GetAttachedFileAttr(s,"UID"),r=="huge"&&i&&i!=""&&e.push(i)}else{var o=basicAttachUploadControl.getFileList("huge"),i;if(o)for(var s=0;s<o.length;s++)i=o[s].uid,i&&i!=""&&i!="0"&&e.push(i)}return e}function deleteUpoladBarList(e){if(!isOcxUpload){var t=basicAttachUploadControl.getFileList("huge");for(var n=0;n<t.length;n++)if(e==t[n].uid){jQuery("#"+t[n].id).attr("checked",!0);break}deletefile()}}function deletefile(e){e=e||!1;if(!isOcxUpload){var t=[],n=[];e?jQuery("input[name=basicAttachFileEl]").each(function(){n.push(jQuery(this).attr("id"))}):n=basicAttachUploadControl.getCheckAttachFileIds();if(n.length>0){var r=basicAttachUploadControl.getFileList("huge");for(var i=0;i<n.length;i++){if(r)for(var s=0;s<r.length;s++)if(n[i]==r[s].id){t.push(r[s].uid);break}basicAttachUploadControl.deleteAttachList(n[i])}t.length>0&&deleteBigAttachFile(t);var o=basicAttachUploadControl.getAttachQuotaInfo();updateAttachQuota("hugeUse",o.hugeUse),updateAttachQuota("normalUse",o.normalUse),jQuery("#basicAttachChkAll").attr("checked",!1),getAttachTotalCount()==0&&showAttachBoxDisplay(!1)}}else{var u=document.uploadForm.powerupload;u.DetachFile(-1)}}function deletefileById(e){if(!isOcxUpload){var t=[],n=basicAttachUploadControl.getFileList("huge");if(n)for(var r=0;r<n.length;r++)if(e==n[r].id){t.push(n[r].uid);break}basicAttachUploadControl.deleteAttachList(e),t.length>0&&deleteBigAttachFile(t);var i=basicAttachUploadControl.getAttachQuotaInfo();updateAttachQuota("hugeUse",i.hugeUse),updateAttachQuota("normalUse",i.normalUse),jQuery("#basicAttachChkAll").attr("checked",!1),getAttachTotalCount()==0&&showAttachBoxDisplay(!1)}else{var s=document.uploadForm.powerupload;s.DetachFile(-1)}}function previewTempFile(e){var t=basicAttachUploadControl.getAttachFileInfo("normal",e),n={fileName:t.name,filePath:t.path,hostId:t.hostId};n.action="previewAttachTempFile",POPUPDATA=n,window.open("/app/mail/popup","","resizable=yes,scrollbars=yes,status=yes,width=800,height=640")}function downloadTempFile(e){var t=basicAttachUploadControl.getAttachFileInfo("normal",e),n={fileName:t.name,filePath:t.path,fileSize:t.size,hostId:t.hostId};if(TABLET||MOBILE){var r=location.protocol+"//"+window.location.host;url="/api/mail/file/temp/download?"+jQuery.param(n),window.location=r+url}else document.getElementById("reqFrame").src="/api/mail/file/temp/download?"+jQuery.param(n)}function getAttachTotalCount(){var e=0;if(!isOcxUpload){var t=basicAttachUploadControl.getFileList("normal"),n=basicAttachUploadControl.getFileList("huge"),r=!t||!t.length||t.length<1?0:t.length,i=!n||!n.length||n.length<1?0:n.length;e=r+i}else{var s=document.uploadForm.powerupload;e=s.GetAttachedFileCount()}return e}function addWebfolderAttach(e){var t,n,r,i,s,o,u=!1;for(var a=0;a<e.length;a++){r=e[a][0],t=e[a][1],n=e[a][2],i=e[a][3],o=n>MAX_ATTACH_SIZE*1024*1024?"huge":"normal";if(!addlist(t,n,r,i,"",o)){u=!0;break}}u||jQuery.goPopup.close(),webfolderAttachProcess=!1}function addlistForJQuery(e,t,n,r,i,s,o){var u=e+" ("+t+" bytes)",a="normal";USE_BIGATTACH_MODE&&(a=s?s:"normal");var f,l,c=n.substring(n.length-1,n.length);if(c=="r")document.massmail.rcptsfile.value=n,jQuery("#filename").html(u);else{showAttachBoxDisplay(!0);var h={path:n,size:t,name:e,hostId:r,uid:i,type:a,notChage:!0};o?(h.id=o,basicAttachUploadControl.updateAttachFile(h)):(h.id="SWFUpload_0_a"+makeRandom(),basicAttachUploadControl.addAttachList(h))}return!0}function addlist(e,t,n,r,i,s,o){var u=e+" ("+t+" bytes)",a="normal";USE_BIGATTACH_MODE&&(a=s?s:"normal");var f,l,c=n.substring(n.length-1,n.length);if(c=="r")document.massmail.rcptsfile.value=n,jQuery("#filename").html(u);else{var h=parseInt(t);if(a=="normal"){if(isOcxUpload){var p=document.uploadForm.powerupload;f=p.GetAttachedSize("NORMAL")}else f=basicAttachUploadControl.getAttachSize("normalUse");h=f+parseInt(t);if(h>MAX_ATTACH_SIZE*1024*1024)return jQuery.goAlert(mailMsg.comn_upload_title,MAX_ATTACH_SIZE+"MB "+mailMsg.ocx_upalert_size),!1}else if(a=="huge"){if(isOcxUpload){var p=document.uploadForm.powerupload;l=p.GetAttachedSize("HUGE")}else l=basicAttachUploadControl.getAttachSize("hugeUse");if(l+h>BIG_ATTACH_QUOTA)return jQuery.goAlert(mailMsg.comn_upload_title,printSize(BIG_ATTACH_QUOTA)+" "+mailMsg.ocx_upalert_size),!1}showAttachBoxDisplay(!0);if(isMsie&&isOcxUpload)try{var p=document.uploadForm.powerupload,d=p.AddAttachedFile(e,t,a);p.SetAttachedFileAttr2(d,"FILEPATH",n),p.SetAttachedFileAttr2(d,"UPKEY",n),p.SetAttachedFileAttr2(d,"FILENAME2",Base64TMS.encode(e)),p.SetAttachedFileAttr2(d,"SIZE",t),p.SetAttachedFileAttr2(d,"HOSTID",r),p.SetAttachedFileAttr2(d,"TYPE",a),p.SetAttachedFileAttr2(d,"RESULT","OK"),a=="huge"?jQuery("#ocx_huge_size").html(printSize(p.GetAttachedSize("HUGE"))):jQuery("#ocx_normal_size").html(printSize(h))}catch(v){}else{var m=basicAttachUploadControl.generatorFileIndex(),g={path:n,size:t,name:e,hostId:r,uid:i,type:a,notChage:!0,index:m};o?(g.id=o,basicAttachUploadControl.updateAttachFile(g)):(g.id="SWFUpload_0_a"+makeRandom(),basicAttachUploadControl.addAttachList(g)),a=="huge"?updateAttachQuota("hugeUse",l+h):updateAttachQuota("normalUse",h)}}return!0}function getAttachNormalSize(){var e=0;if(isOcxUpload){var t=document.uploadForm.powerupload;e=t.GetAttachedSize("NORMAL")}else e=basicAttachUploadControl.getAttachSize("normalUse");return e}function getPreviewAttachString(){var e="";if(isOcxUpload){var t=document.uploadForm.powerupload,n=t.GetAttachedFileCount();for(var r=0;r<n;r++){var i=t.GetAttachedFileAttr(r,"TYPE");i!="normal"?e+="temp	"+Base64TMS.decode(t.GetAttachedFileAttr(r,"FILENAME2"))+"	"+"0	"+"unknown	"+"0\n":e+=t.GetAttachedFileAttr(r,"UPKEY")+"	"+Base64TMS.decode(t.GetAttachedFileAttr(r,"FILENAME2"))+"	"+t.GetAttachedFileAttr(r,"SIZE")+"	"+t.GetAttachedFileAttr(r,"HOSTID")+"	"+t.GetAttachedFileAttr(r,"UID")+"\n"}}else{var s=basicAttachUploadControl.getFileList("normal");for(var r=0;r<s.length;r++)e+=s[r].path+"	"+s[r].name+"	"+s[r].size+"	"+s[r].hostId+"	"+s[r].uid+"\n"}return e}function getAttachString(){var e="";if(isOcxUpload){var t=document.uploadForm.powerupload,n=t.GetAttachedFileCount();for(var r=0;r<n;r++){var i=t.GetAttachedFileAttr(r,"TYPE");if(i!="normal")continue;e+=t.GetAttachedFileAttr(r,"UPKEY")+"	"+Base64TMS.decode(t.GetAttachedFileAttr(r,"FILENAME2"))+"	"+t.GetAttachedFileAttr(r,"SIZE")+"	"+t.GetAttachedFileAttr(r,"HOSTID")+"	"+t.GetAttachedFileAttr(r,"UID")+"\n"}}else{var s=basicAttachUploadControl.getFileList("normal");for(var r=0;r<s.length;r++)e+=s[r].path+"	"+s[r].name+"	"+s[r].size+"	"+s[r].hostId+"	"+s[r].uid+"\n"}return e}function chgAttachFileType(e){var t=jQuery("#"+e),n=t.attr("atttype"),r=Number(t.attr("attsize")),i,s,o=basicAttachUploadControl.getAttachQuotaInfo();if(n=="huge"){if(r>o.normalMax||r+o.normalUse>o.normalMax){jQuery.goAlert(mailMsg.comn_upload_title,printSize(o.normalMax)+" "+mailMsg.ocx_upalert_size);return}updateAttachQuota("hugeUse",o.hugeUse-r),updateAttachQuota("normalUse",r+o.normalUse)}else{if(r>o.hugeMax||r+o.hugeUse>o.hugeMax){jQuery.goAlert(mailMsg.comn_upload_title,printSize(o.hugeMax)+" "+mailMsg.ocx_upalert_size);return}updateAttachQuota("normalUse",o.normalUse-r),updateAttachQuota("hugeUse",r+o.hugeUse)}basicAttachUploadControl.chageAttachType(e),hugeMailCheck()}function startUploadAttach(e){var t,n=basicAttachUploadControl.getUploadQueueFile();uploadAttachFilesError=!1;if(n.length>0){uploadAttachFilesComplete=!1;for(var r=0;r<n.length;r++)t=n[r],jQuery("#progress_"+t.id).progressBar(progressBarOpt);basicAttachUploadControl.startUpload()}}function showAttachBoxDisplay(e){e?jQuery("#attach_area").show():jQuery("#attach_area").hide()}function deleteBigAttachFile(e){var t={messageUids:e};mailControl.deleteBigAttach(t)}function destroyBasicUploadControl(){isOcxUpload&&jQuery("#att_ocx_area").hide();if(basicAttachUploadControl){var e=jQuery("#att_btn_simple object").length==0?!1:!0;if(e){isOcxUpload&&jQuery("#att_btn_simple").height("0px").show().css("visibility","hidden");try{basicAttachUploadControl.stopUpload(),basicAttachUploadControl.cancelUpload(),basicAttachUploadControl.destroy()}catch(t){}}}}function destroyMassUploadControl(){if(massAttachUploadControl){var e=jQuery("#massUploadControl object").length==0?!1:!0;if(e)try{massAttachUploadControl.stopUpload(),massAttachUploadControl.cancelUpload(),massAttachUploadControl.destroy()}catch(t){}}}function uploadOcxFile(){var e=!0,t=ocx_upload();if(!t||uploadAttachFilesError)t||(jQuery.goAlert(mailMsg.error_fileupload),deleteOcxFileAll(),ocx_init()),uploadAttachFilesError=!1,e=!1;return e}var POPUPDATA={},progressBarOpt={boxImage:"/resources/images/progressbar.gif",barImage:"/resources/images/progressbg_green_50.gif",width:100},uploadAttachFilesError=!1,uploadAttachFilesComplete=!0,basicUploadListeners={swfuploadLoaded:function(e){setTitleBar(TITLENAME)},fileQueued:function(e,t){var n=t.size,r=basicAttachUploadControl.getAttachQuotaInfo(),i=n+r.normalUse>r.normalMax?!0:!1,s=jQuery("#bigAttachFlagCheck").attr("checked");if((s||n>r.normalMax||i)&&basicAttachUploadControl.getHugeUploadUse()){t.type="huge";if(n+r.hugeUse>r.hugeMax){i?jQuery.goAlert(mailMsg.comn_upload_title,mailMsg.ocx_upalert_size):jQuery.goAlert(mailMsg.comn_upload_title,printSize(r.hugeMax)+" "+mailMsg.ocx_upalert_size),jQuery("#basicUploadControl").swfupload("cancelUpload",t.id);return}if(n>MAX_BIG_ATTACH_SIZE){jQuery.goAlert(mailMsg.comn_upload_title,msgArgsReplace(mailMsg.bigattach_18,[printSize(MAX_BIG_ATTACH_SIZE)])),jQuery("#basicUploadControl").swfupload("cancelUpload",t.id);return}jQuery("#basicUploadControl").swfupload("addFileParam",t.id,"attachtype","huge"),jQuery("#basicUploadControl").swfupload("addFileParam",t.id,"regdate",today.getTime()),updateAttachQuota("hugeUse",n+r.hugeUse),hugeMailCheck()}else{t.type="normal";if(n+r.normalUse>r.normalMax){jQuery.goAlert(mailMsg.comn_upload_title,printSize(r.normalMax)+" "+mailMsg.ocx_upalert_size),jQuery("#basicUploadControl").swfupload("cancelUpload",t.id);return}jQuery("#basicUploadControl").swfupload("addFileParam",t.id,"attachtype","normal"),updateAttachQuota("normalUse",n+r.normalUse)}t.directUpload=!0,basicAttachUploadControl.addAttachList(t),basicAttachUploadControl.addUploadQueueFile(t),showAttachBoxDisplay(!0)},fileQueueError:function(e,t,n,r){n==SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE?jQuery.goAlert(mailMsg.comn_upload_title,mailMsg.ocx_virtxt_failquest):n==SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT?jQuery.goAlert(mailMsg.comn_upload_title,mailMsg.ocx_upalert_size):jQuery.goAlert(mailMsg.comn_upload_title,mailMsg.error_fileupload+"["+n+"]")},fileDialogStart:function(e){},fileDialogComplete:function(e,t,n){startUploadAttach()},uploadStart:function(e,t){jQuery("#progress_"+t.id).progressBar(0,progressBarOpt)},uploadProgress:function(e,t,n){var r=t.size,i=Math.ceil(n/r*100);i=i>=100?100:i,jQuery("#progress_"+t.id).hide(),jQuery("#progress_"+t.id).progressBar(i,progressBarOpt),jQuery("#progress_"+t.id).show(),i==100&&jQuery("#progress_"+t.id).html("<img src='/resources/images/img_loader_s.gif' align='absmiddle'>")},uploadSuccess:function(event,file,serverData){var data=eval("("+serverData+")");if(data.uploadResult=="success"&&parseInt(data.uid,10)>-1){basicAttachUploadControl.setUploadCompleteFile(file.id,data),jQuery("#progress_"+file.id).html('<span style="color:red">['+mailMsg.comn_upload_complete+"]</span>");var totalUploadFileCount=jQuery("#basicAttachItemList tr").length,queueSize=basicAttachUploadControl.getUploadQueueSize();jQuery("#basicAttachItemList").animate({scrollTop:(totalUploadFileCount-queueSize+1)*24},"slow")}else uploadAttachFilesError||jQuery.goAlert(mailMsg.comn_upload_title,mailMsg.error_fileupload),jQuery("#"+file.id).attr("checked",!0),deletefile()},uploadComplete:function(e,t){basicAttachUploadControl.isNextUploadQueue(t.id)||(uploadAttachFilesComplete=!0)},uploadError:function(e,t,n,r){n!=SWFUpload.UPLOAD_ERROR.FILE_CANCELLED&&(uploadAttachFilesError||(jQuery.goAlert(mailMsg.comn_upload_title,mailMsg.error_fileupload),basic_init(),uploadAttachFilesError=!0))}},basicAttachUploadControl;
(function(e){var t=this,n=t.GO=t.GO||{},r=Array.prototype.slice;n.util=e.extend(n.util||{},{defaultLocale:"ko",appLoading:function(e,t){t?n.util.isAndroidApp()?window.GOMobile.callProgressBar(t,e):window.location="gomobile://callProgressBar?"+t+"&"+e:n.util.isAndroidApp()?window.GOMobile.callProgressBar(e):n.util.isIosApp()&&(window.location="gomobile://callProgressBar?"+e)},changeStatusBarColor:function(e){if(n.util.isAndroidApp())try{window.GOMobile.changeStatusBarColor(e)}catch(t){console.log(t);return}else if(n.util.isIosApp())try{window.location="gomobile://changeStatusBarColor?"+e}catch(t){console.log(t);return}},pageDone:function(e){n.util.isAndroidApp()?window.GOMobile.pageDone():n.util.isIosApp()&&(window.location="gomobile://pageDone")},attachFiles:function(e,t,r){n.util.isAndroidApp()?window.GOMobile.attachSave(e,t,r):n.util.isIosApp()?window.location="gomobile://attachSave?"+e+"&fileName="+t:window.open(e);return},attachImages:function(e,t){if(!e)return!1;if(n.util.isAndroidApp())window.GOMobile.attachImageView(JSON.stringify(e),t);else if(n.util.isIosApp())window.location="gomobile://attachImageView?"+JSON.stringify(e)+"&"+t;else if(n.util.checkOS()=="android"){var r=window.open(),i="<!DOCTYPE html>\n<html>\n<head></head>\n<body><img src='"+e[t].url+"' /></body>\n"+"</html>";r.document.write(i),r.document.close()}else window.open(e[t].url);return},callOrg:function(e){try{n.util.isAndroidApp()?window.GOMobile.callOrg(JSON.stringify(e),"addSuccess","addFail"):n.util.isIosApp()&&(window.location="gomobile://callOrg?"+JSON.stringify(e)+"&addSuccess&addFail")}catch(t){}},callFile:function(e,t,r){try{var i=e==undefined?-1:e,s=t==undefined?-1:t,o=r==undefined?"":r;n.util.isAndroidApp()&&window.GOMobile.callFile("attachFileSuccess","attachFileFail",s,i,o)}catch(u){}},callAlbum:function(){try{n.util.isAndroidApp()?window.GOMobile.callAlbum("attachFileSuccess","attachFileFail"):n.util.isIosApp()&&(window.location="gomobile://callAlbum?attachFileSuccess&attachFileFail")}catch(e){}},callContactAlbum:function(e){var t=e==undefined?-1:e;try{n.util.isAndroidApp()?window.GOMobile.callContactAlbum("attachFileSuccess","attachFileFail",t):n.util.isIosApp()&&(window.location="gomobile://callContactAlbum?attachFileSuccess&attachFileFail")}catch(r){}},callCamera:function(){try{n.util.isAndroidApp()?window.GOMobile.callCamera("attachFileSuccess","attachFileFail"):n.util.isIosApp()&&(window.location="gomobile://callCamera?attachFileSuccess&attachFileFail")}catch(e){}},removeItem:function(e){localStorage.removeItem(e)},setLocalStorage:function(e,t){localStorage.setItem(e,JSON.stringify(t))},getLocalStorage:function(e){return JSON.parse(localStorage.getItem(e))},mPagingLang:{ko:{"\ub2e4\uc74c":"\ub2e4\uc74c","\uc774\uc804":"\uc774\uc804"},en:{"\ub2e4\uc74c":"Newer","\uc774\uc804":"Older"},ja:{"\ub2e4\uc74c":"\u6b21\u3078","\uc774\uc804":"\u524d\u3078"},zh_CN:{"\ub2e4\uc74c":"\u4e0b\u4e00\u9875","\uc774\uc804":"\u524d\u4e00\u9875"},zh_TW:{"\ub2e4\uc74c":"\u4e0b\u4e00\u9801","\uc774\uc804":"\u524d\u4e00\u9801"},en:{"\ub2e4\uc74c":"Ti\u1ebfp theo","\uc774\uc804":"Trang tr\u01b0\u1edbc"}},mPaging:function(e){if(!e||!e.page)return!1;var t=n.router.getUrl(),r=n.router.getSearch(),i=[],s=n.locale||this.defaultLocale,o=e.page,u=e.length,a=[],f=(o.page+1)*o.offset-o.offset+u,l=f-u+1;if(r.page!=o.page){r.page=o.page;for(var c in r)i.push(encodeURIComponent(c)+"="+encodeURIComponent(r[c]));n.router.navigate(t.split("?")[0]+(t.split("?")[0].charAt(t.split("?")[0].length-1)=="/"?"":"/")+"?"+i.join("&"),{replace:o.page==0?!0:!1})}if(o.page!=0||u>0)a.push('<div class="paging">'),o.page>0&&a.push('<a class="btn_type4" data-btn="paging" data-direction="prev"><span class="ic ic_arrow3_l"></span><span class="txt">',this.mPagingLang[s]["\uc774\uc804"],"</span></a>"),a.push('<span class="page"><span class="current_page">',l,'</span><span class="txt_bar">-</span><span class="total_page">',f,'</span><span class="total_page"> / ',o.total,"</span></span>"),o.lastPage||a.push('<a class="btn_type4" data-btn="paging" data-direction="next"><span class="txt">',this.mPagingLang[s]["\ub2e4\uc74c"],'</span><span class="ic ic_arrow3_r"></span></a>'),a.push("</div>");return a.join("")},initDetailiScroll:function(t,r,i,s,o,u){function E(e){var t=e.attr("src");if(t){var n=e.prev();if(n.hasClass("shortcut"))return;var r=n.hasClass("transparentDiv")?n:e;r.before("<a class='shortcut' target='_blank' href='"+t+"'><span style='font-size: 15px;'>LINK CLICK \u261e<br /></span></a>")}}var a=this,f=e.isUndefined(s)?!0:s,l=n.util.isMobileApp()?0:52,c=$("#headerToolbar").outerHeight(!0),u=e.isUndefined(u)?!1:u,h=jQuery("#"+i),p=$(window).height(),d=$("#scrollToTop");$("link[href*='/resources/css/go_m_style_big']").length&&$("div.content").addClass("content_detail");var v=$("#doc_header"),m=v.length?v.outerHeight(!0):0;$("#"+t).css("position","relative").css("overflow-x","scroll").css("overflow-y","hidden"),h.css("display","inline-table");var g=h.outerWidth(!0),y=jQuery(window).width();g<y&&(g=y);var b=1/(g/y);$("#"+r).width(g),u?$("#"+t).height(p-l):$("#"+t).height(p-c-m),this.iscroll&&this.iscroll.destroy();var w=!n.util.isMobileApp()&&(n.util.checkOS()=="iphone"||n.util.checkOS()=="ipad");return this.iscroll=new IScroll("#"+t,{bounce:!1,zoom:!0,zoomMin:b,disablePointer:!0,disableMouse:!1,disableTouch:w,preventDefault:w,onBeforeScrollStart:function(e){var t=e.target;if(t.tagName=="TEXTAREA"||t.tagName=="INPUT"||t.tagName=="SELECT")return;e.preventDefault()},onBeforeScrollEnd:function(e){setTimeout(function(){$("#"+r).css("transform",$("#"+r).css("transform"))},300)}}),w||(this.iscroll.on("zoomStart",function(e){$("#"+t).css("overflow-x","").css("overflow-y","")}),this.iscroll.on("zoomEnd",function(e){$("#"+t).css("overflow-x","scroll").css("overflow-y","hidden")})),setTimeout(function(){y<g&&a.iscrollZoom(b),n.util.appLoading(!1),n.router.getPackageName()==="approval"||n.router.getPackageName()==="docfolder"?h.css("visibility","visible"):$("#content").css("visibility","visible"),a.iscrollRefresh(),d.hide();var e=$("#"+t).find("iframe");e.length>0&&$.each(e,function(e,t){var r=$(t);r.css("pointer-events","none");var i=$('<div class="transparentDiv" style="z-index: 999999; opacity: 0; position:absolute; width:100%;"></div>');r.before(i),i.css("height",r.height()+"px");var s=r.get(0);if(n.router.getPackageName()==="approval"){var o=s.contentDocument?s.contentDocument:s.contentWindow.document,u=$(o).find("iframe");$.each(u,function(e,t){E($(t))}),i.on("click",function(e){var t=o.elementFromPoint(e.offsetX,e.offsetY);$(t).parent().attr("href")&&(location.href=$(t).parent().attr("href"))})}else E($(s))})},400),this.iscroll},contentsParsingForFontSizeResizing:function(e){e.wrapInner("<div></div>").find("*").contents().filter(function(){return this.nodeType==3&&$.trim(this.nodeValue)&&this.parentNode.tagName.toLowerCase()!="style"&&this.parentNode.tagName.toLowerCase()!="script"}).each(function(e,t){var n=getComputedStyle(this.parentNode),r=n.fontSize.replace("px",""),i=n.lineHeight.replace("px","");$(this).wrap('<span data-font-resize data-origin-fontsize="'+r+'" '+'data-origin-lineheight="'+i+'" '+'style="font-size:'+r+"px;line-height:"+i+'px" />')})},rollbackFontSizeResizing:function(e){e.find("span[data-font-resize]").contents().unwrap()},imageLoadCheck:function(e){var t=$.Deferred(),n=$("#"+e).find("img"),r=n.length,i=0;return r||t.resolve(),n.load(function(){i++,r==i&&t.resolve()}),t},iscrollRefresh:function(){this.iscroll&&this.iscroll.refresh()},iscrollZoom:function(e){this.iscroll&&($(this.iscroll.wrapper).hide(),this.iscroll.zoom(0,0,e),this.iscroll.scrollTo(0,0)),$(this.iscroll.wrapper).show()},initToolbar:function(){$(".go_header").css({position:"initial",top:"0px"}),$("#titleToolbar").css({position:"relative",top:"0px","z-index":"initial",width:"initial"}),$("#tool_bar").css({position:"relative",top:"0px","z-index":"initial",width:"initial"}),$(".go_content ").css("padding-top","0px")},fixedToolbar:function(e,t,n){$(".go_header").css("position","fixed").animate({top:"-"+e+"px"},200),$("#titleToolbar").css({position:"fixed",width:"100%","z-index":"999"}),$("#tool_bar").css({position:"fixed",width:"100%","z-index":"999",top:t+1+"px"}),$(".go_content ").css("padding-top",n+5+"px")},toolBarFixed:function(){var e=this,t=$(".go_header").height(),n=$("#titleToolbar").height(),r=$("#tool_bar").height(),i=t+n+r;$(document).on("scroll.fixedTop",function(){$(this).scrollTop()<t&&e.initToolbar()}),$(document).on("touchmove.fixedTop",function(){$(this).scrollTop()>t&&e.fixedToolbar(t,n,i),$(this).scrollTop()<t})},unBindToolbarFixed:function(){$(document).off("scroll.fixedTop"),$(document).off("touchmove.fixedTop"),this.initToolbar()},imagesLoaded:function(e,t){var n=$(e).find("img");imagesCount=n.length,self=this;if(imagesCount==0)t();else{var r=1;n.load(function(){imagesCount==r?t():r+=1})}},disagreeContentLoss:function(){var e=require("i18n!nls/commons");return $("textarea").attr("disabled")!="disabled"&&($("textarea:visible").val()||n.util.hasActiveEditor()&&n.util.isEditorWriting())?!confirm(n.util.br2nl(e["\ub0b4\uc6a9 \uc791\uc131 \uc911 \uc774\ub3d9 \uacbd\uace0 \uba54\uc2dc\uc9c0"])):!1},delayAlert:function(e,t){setTimeout(function(){alert(e)},t||10)},navigateToBackList:function(){var e=sessionStorage.getItem("list-history-baseUrl");if(e){var t=$.param(n.router.getSearch()),r=t?"?"+t:"";n.router.navigate(e+r,{trigger:!0})}else n.router.navigate("approval",{trigger:!0})},toastMessage:function(e,t){$(document.activeElement).filter(":focus").blur(),window.scrollTo(0,0),t||(t=2e3);var n=$(window).height()/2;$("#toastMsg")&&$("#toastMsg").remove(),$("#main").append('<div id="toastMsg" class="toastMsg" style="width: 80%;height:auto; position: absolute; margin:0 auto;z-index: 9999; background-color: #383838; color: #F0F0F0; font-size: 15px; padding: 10px; text-align:center; border-radius: 2px; -webkit-box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1); -moz-box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1); box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1); display:none">'+e+"</div>");var r=($(window).width()-$("#toastMsg").outerWidth(!0))/2;$("#toastMsg").css({top:n+"px",left:r+"px"}).fadeIn(400).delay(t).fadeOut(400)},copyUrl:function(t){function i(){var e=n.router.getRootUrl()+n.router.getUrl();return e}!e.isUndefined(t)&&t.cancelable&&(t.preventDefault(),t.stopPropagation());var r=document.createElement("textarea");document.body.appendChild(r),r.value=i(),r.select(),document.execCommand("copy"),document.body.removeChild(r);try{if(n.util.isAndroidApp())window.GOMobile.copyUrl(r.value);else if(n.util.isIosApp())window.location="gomobile://copyUrl?"+r.value;else{var s=require("i18n!board/nls/board");alert(s["\ubaa8\ubc14\uc77c URL \ubcf5\uc0ac \ubb38\uad6c"])}}catch(t){console.log(t)}},linkToErrorPage:function(t){var r=JSON.parse(t.responseText);if(e.isUndefined(r.message)){var i=require("i18n!nls/commons");r.message=e.isUndefined(i[r.code+" \uc624\ub958\ud398\uc774\uc9c0 \ud0c0\uc774\ud2c0"])?i["500 \uc624\ub958\ud398\uc774\uc9c0 \ud0c0\uc774\ud2c0"]:i[r.code+" \uc624\ub958\ud398\uc774\uc9c0 \ud0c0\uc774\ud2c0"]}n.util.isAndroidApp()?window.GOMobile.onError(r.code,r.message):n.util.isIosApp()?window.location="gomobile://onError?"+r.code+"&"+encodeURIComponent(r.message.replace(/<br\/\>/gi,"\n")):(alert(r.message),n.router.navigate(n.router.getPackageName(),{trigger:!0}))},linkToCustomError:function(e){var t=e.code,r=e.message;alert(r.replace(/<br\/\>/gi,"\n")),n.router.navigate(n.router.getPackageName(),{trigger:!0})},showTempAttach:function(e){n.util.appLoading(!0),$.ajax({type:"POST",contentType:"application/x-www-form-urlencoded; charset=UTF-8",url:"/api/preview/tempFile",data:e,success:function(e){var t=e.data.str.split("&originName")[0],r=location.protocol+"//"+window.location.host;n.util.isAndroidApp()?window.GOMobile.attachView(r+t):n.util.isIosApp()?window.location.href="gomobile://attachView?"+r+t:window.location.href=t,n.util.isAndroidApp()&&n.util.appLoading(!1)},error:function(e){console.log(e.responseJSON.message),n.util.isAndroidApp()&&n.util.appLoading(!1)}})},isValidSearchText:function(e){var t=require("i18n!nls/commons");return e===""?(alert(t["\uac80\uc0c9 \ud0a4\uc6cc\ub4dc\ub97c \uc785\ub825\ud558\uc138\uc694."]),!1):$.goValidation.isCheckLength(2,64,e)?$.goValidation.isInValidEmailChar(e)?(alert(t["\uba54\uc77c \uc0ac\uc6a9 \ubd88\uac00 \ubb38\uc790"]),!1):!0:(alert(n.i18n(t["\uac80\uc0c9\uc5b4 \uae38\uc774 \ud655\uc778 \ubb38\uad6c"],{arg1:"2",arg2:"64"})),!1)},isValidSearchTextForDetail:function(t){var r=require("i18n!nls/commons"),i=function(e,t){alert(e),t&&t.focus()},s=t.length;for(var o=0;o<s;o++){if(e.isUndefined(t[o].data)||e.isUndefined(t[o].id))return alert(r["\uc624\ub958 \ubc1c\uc0dd"]),!1;if(t[o].data=="")continue;if(!$.goValidation.isCheckLength(2,64,t[o].data))return i(n.i18n(r["\uac80\uc0c9\uc5b4 \uae38\uc774 \ud655\uc778 \ubb38\uad6c"],{arg1:"2",arg2:"64"}),$("#"+t[o].id)),!1;if($.goValidation.isInValidEmailChar(t[o].data))return i(r["\uba54\uc77c \uc0ac\uc6a9 \ubd88\uac00 \ubb38\uc790"],$("#"+t[o].id)),!1}return!0},isValidForSearchTextWithCheckbox:function(e){var t=require("i18n!nls/commons"),n=$("#"+e);return n.val()!=""&&n.parent().find("input[type=checkbox]:checked").length<1?(alert(t["\uac80\uc0c9\uc5b4 \uad6c\ubd84\uc744 \uc120\ud0dd\ud574\uc8fc\uc138\uc694."]),!1):n.val()==""&&n.parent().find("input[type=checkbox]:checked").length>=1?(alert(t["\uac80\uc0c9 \ud0a4\uc6cc\ub4dc\ub97c \uc785\ub825\ud558\uc138\uc694."]),!1):!0},isAllEmptySearchText:function(t){var n=0;return e.each(t,function(e){n+=e.data.length}),n===0},getFileNameAndTypeData:function(t){var n={};if(e.isUndefined(t.name)){var r=t.fileName.split(".");n.size=t.fileSize}else{var r=t.name.split(".");n.size=t.size}return n.type=r[r.length-1],n}})}).call(this,_);
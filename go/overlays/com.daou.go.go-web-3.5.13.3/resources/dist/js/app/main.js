define("main",function(require){var e=require("jquery"),t=require("backbone");require("boot");var n=require("app"),r,i=require("browser");require("go-notification");var s=require("collections/notifications"),o=require("editor_inlineImg_upload"),u=require("i18n!nls/commons");require("GO.util"),require("go-webeditor/jquery.go-webeditor");var a=n.config("googleAnalyticsOption");_.isObject(a)&&a.trackerId&&require("../libs/go-google-analytics"),require("go-notice"),e.datepicker.setDefaults(e.datepicker.regional[n.config("locale")]),n.fetch("baseConfig").done(function(){r=require("router");var t=r.getInstance();t.on("change:package",function(){e.goNotice.fetch()})});var f=function(){function r(){return n.config("deviceType")==="pc"&&n.config("instanceType")==="app"}function a(){return n.config("deviceType")==="mobile"&&n.config("instanceType")==="app"}function f(){return n.util.isMobileApp()}function l(){return n.config("GO-Agent")||n.util.getGoAgent()||""}function c(){t.history.start({pushState:!0,root:n.config("root")})}function h(){window.inlineImgUploadLayer=function(e){o.render({elPlaceHolder:e})}}function p(){return r()&&!window.opener&&!d()}function d(){return window.location.href.indexOf("app/note")>0||window.location.href.indexOf("app/#note")>0}function v(){e(document).on("click","[url-copy]",function(t){!_.isUndefined(t)&&t.cancelable&&(t.preventDefault(),t.stopPropagation());var r=e(t.currentTarget);if(r.attr("url-copy"))var i=r.attr("url-copy");else var i=window.location.href.split("?")[0];n.util.setClipboard(i)})}function m(){e(document).on("click","a:not([data-bypass])",function(t){var r={prop:e(this).prop("href"),attr:e(this).attr("href")};t.preventDefault();if(r.prop&&n.router.isEqualToRootUrl(r.prop))n.router.navigate(n.router.getUrl(r.prop),{trigger:!0,pushState:!0});else if(r.attr){var i=["form.editor_view","div.editor_view","p.editor_view","article.editor_view","span.editor_view"],s=!0;e.each(i,function(n,i){if(e(t.currentTarget).parents(i).first().length>0){var o=window.open(r.attr,"_blank");return o===null&&(window.location.href=r.attr),s=!1,!1}}),s&&(window.location.href=r.attr)}})}function g(){var t=!1,r=null,i={},s=n.constant("response"),o,c=n.config("root")+n.router.getUrl(),h={"GO-Agent":l()},p=function(e){if(f())try{e.setRequestHeader("GO-Agent",l()),n.util.checkOS()=="android"?window.GOMobile.isConnected():window.location="gomobile://isConnected"}catch(t){}e.setRequestHeader("TimeZoneOffset",-(new Date).getTimezoneOffset())},d=function(e){return n.util.parseUrl(e).pathname.indexOf("note")>=0},v=function(e){return r?r.window.location.href.indexOf(e)>=0:!1},m={401:function(i){if(f())n.util.callSessionTimeout();else if(n.config("useOtp")||n.config("useCert")||t||d(c)){if(t)return!1;t=e.parseJSON(i.responseText).name=="common.unauthenticated.concurrent",e.goConfirm(u["\uc790\ub3d9\ub85c\uadf8\uc544\uc6c3"],u["\uc790\ub3d9\ub85c\uadf8\uc544\uc6c3\uc124\uba85"],function(){o=n.config("contextRoot")+"login?returnUrl="+c,t&&(o+="&cause=concurrent"),window.location=o,r&&r.close()})}else n.config("instanceType")==="admin"?window.location=n.config("contextRoot")+"login?returnUrl="+c:v(n.config("contextRoot")+"simplelogin")||(o=n.config("contextRoot")+"simplelogin?type="+i.originalRequestOptions.type+"&returnUrl="+c,r=window.open(o,"simpleLogin","width=540,height=650 top="+(screen.height/2-200)+" left="+(screen.width/2-180)));return!1},404:function(){},403:function(){},503:function(t){a()&&n.util.callServerCheck(e.parseJSON(t.responseText))}};for(var g in s){var y=s[g];m[y]&&(i[y]=m[y])}e.ajaxPrefilter(function(e,t,n){n.originalRequestOptions=t}),e.ajaxSetup({timeout:n.constant("system","AJAX_TIMEOUT"),statusCode:i,headers:h,beforeSend:p})}function y(){p()&&e.get(n.config("contextRoot")+"api/bosh/user",function(t){var r=["go_web",n.session("repId"),Math.ceil(Math.random()*100)].join("_"),i=[t.data.jid,r].join("/"),o=location.protocol,u=o==="https:"?"443":"80",a="http-bind/",f=[location.protocol,"//",location.hostname,":",u,"/",a].join("");window.GO_Notification&&window.GO_Notification.release();var l=new GONotification(f,{jid:i,password:t.data.subInfo},{onReceiveMessage:function(t){s.getNewCount(function(t){e("#noti-count-badge").text(t),e("#noti-count-badge").css("display",t==0?"none":"inline-block")})}});l.run(),window.GO_Notification=l})}function b(){var t=n.util.setBrowserTitle;t(),i.msie&&i.version<10?e(window).off(".browsertitle").on("hashchange.browsertitle",function(){setTimeout(t,500)}):n.router.on("change:package",t);return}function w(){var e=n.config("googleAnalyticsOption");if(!_.isObject(e)||!e.trackerId)return;e.userId=n.session("loginId"),n.Analytics.excute(e)}return{start:function(){v(),m(),g(),y(),b(),w(),c(),h()}}}();e.when(n.fetch("baseConfig"),n.fetch("session")).then(function(){f.start()})});
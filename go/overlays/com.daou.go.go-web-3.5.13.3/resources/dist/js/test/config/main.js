(function(e,t,require,n){function r(){return GO.config("deviceType")==="pc"&&GO.config("instanceType")==="app"}function i(){return GO.config("deviceType")==="mobile"&&GO.config("instanceType")==="app"}function s(){return GO.util.isMobileApp()}function o(){Backbone.history.start({pushState:!0,root:GO.config("root")})}function u(){return r()&&!e.opener&&!a()}function a(){return GO.util.isNote()}function f(){$(t).on("click","a:not([data-bypass])",function(t){var n={prop:$(this).prop("href"),attr:$(this).attr("href")};t.preventDefault();if(n.prop&&GO.router.isEqualToRootUrl(n.prop))GO.router.navigate(GO.router.getUrl(n.prop),{trigger:!0,pushState:!0});else if(n.attr){var r=["form.editor_view","div.editor_view","p.editor_view","article.editor_view","span.editor_view"],i=!0;$.each(r,function(r,s){if($(t.currentTarget).parents(s).first().length>0)return e.open(n.attr,"_blank"),i=!1,!1}),i&&(e.location.href=n.attr)}})}function l(){var t={},n=GO.constant("response"),r={401:function(t){if(s())GO.util.callSessionTimeout();else{var n=GO.config("contextRoot")+"login?returnUrl="+GO.config("root")+GO.router.getUrl(),r=$.parseJSON(t.responseText);r.name=="common.unauthenticated.concurrent"&&(n+="&cause=concurrent"),e.location=n}return!1},404:function(){i()&&GO.util.goAppHome()},403:function(){i()&&GO.util.goAppHome()}};for(var o in n){var u=n[o];r[u]&&(t[u]=r[u])}var a=function(){if(s())try{GO.util.checkOS()=="android"?e.GOMobile.isConnected():e.location="gomobile://isConnected"}catch(t){}};$.ajaxSetup({timeout:GO.constant("system","AJAX_TIMEOUT"),statusCode:t,beforeSend:a})}function c(){u()&&require(["go-notification","collections/notifications"],function(t,n){$.get(GO.config("contextRoot")+"api/bosh/user",function(r){var i=["go_web",GO.session("id"),Math.ceil(Math.random()*100)].join("_"),s=[r.data.jid,i].join("/"),o=location.protocol,u=o==="https:"?"443":"80",a="http-bind/",f=[location.protocol,"//",location.hostname,":",u,"/",a].join("");e.GO_Notification&&e.GO_Notification.release();var l=new t(f,{jid:s,password:r.data.subInfo},{onReceiveMessage:function(e){n.getNewCount(function(e){$("#noti-count-badge").text(e),$("#noti-count-badge").css("display",e==0?"none":"inline-block")})}});l.run(),e.GO_Notification=l})})}function h(){e.console||(e.console=function(){var e={};return _.each(["log","info","warn","error","assert","dir","profile","profileEnd"],function(t){e[t]=function(){}}),e}())}function p(e){GO.util.setBrowserTitle(),d(e,GO.util.setBrowserTitle);return}function d(t,n){t.msie&&t.version<10?$(e).off(".browsertitle").on("hashchange.browsertitle",function(){setTimeout(n,500)}):GO.router.on("change:package",n)}function v(){function e(e,t){return"__go_checksum__"in e?(delete e.__go_checksum__,_.each(e,function(e,t){t!=="data"&&(this[t]=e)},this),e.data):e}_.extend(GO,Backbone.Events),_.extend(Backbone.Model.prototype,{parse:e}),_.extend(Backbone.Collection.prototype,{parse:e}),Backbone.sync=function(){var e,t=Backbone.sync;return e=function(e,n,r){return r=r||{},!r.url&&_.result(n,"url")&&(r.url=GO.util.fixUrlPathname(_.result(n,"url"))),t.call(Backbone,e,n,r)},e}()}function m(){var e={__instance__:null,create:function(){return this.__instance__===null&&(this.__instance__=new this.prototype.constructor),this.__instance__},getInstance:function(){return this.create()}},t=_.extend({},e,{getData:function(e){e=_.defaults(e||{},{async:!1});var t=this.getInstance(),n=$.Deferred();return $.when(t.fetch(e)).done(function(){n.resolveWith(t)}),n.promise(t),t}}),n=_.extend({},e,{render:function(e){var t=this.getInstance();return t.render(e)}});GO.BaseModel=Backbone.Model.extend({},t),GO.BaseCollection=Backbone.Collection.extend({},t),GO.BaseView=Backbone.View.extend({},n)}function g(t,n){t.lang((n||"ko").toLowerCase().replace("_","-")),e.moment||(e.moment=t)}function y(){var e=GO.profile==="development";jQuery.migrateMute=!e,jQuery.migrateTrace=e}require(["jquery","backbone","app","moment","browser","router"],function(e,t,n,r,i){y(),v(),m(),o(),f(),l(),h(),p(i),g(r,n.locale)})})(window,document,require);
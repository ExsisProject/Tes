(function(){try{var e={pluginName:"lazyload",cssUrl:DEXTTOP.G_CURREDITOR._config.webPath.plugin+"lazyload/css/lazyload.css"+("1"==DEXTTOP.DEXT5.config.UseConfigTimeStamp?"?t="+DEXTTOP.DEXT5.util.getTimeStamp():"?ver="+DEXTTOP.DEXT5.ReleaseVer),cssId:"dextLazyCss",isSupported:"function"==typeof document.getElementsByClassName?!0:!1,isLoadError:!1,isLoadedComplete:!1,canUseLazyLoad:function(){return 1==e.isSupported&&0==e.isLoadError&&1==e.isLoadedComplete}};G_DEPlugin.lazyload=e;var t=null;if(0!=e.isSupported){var n=function(e,t){var n=document.getElementsByTagName("head")[0],r=document.createElement("script");r.type="text/javascript",r.onload=function(){t(!0)},r.onerror=function(){t(!1)},r.src=e,n.appendChild(r)};e.onInit=function(){var r="../plugin/lazyload/js"+(DEXTTOP.DEXT5.isRelease?"":"_dev")+"/config.js",r="1"==DEXTTOP.DEXT5.config.UseConfigTimeStamp?r+("?t="+DEXTTOP.DEXT5.util.getTimeStamp()):r+("?ver="+DEXTTOP.DEXT5.ReleaseVer);n(r,function(r){if(0==r)e.isLoadError=!0,e.isLoadedComplete=!0;else if(G_DEPlugin.lazyload.options){window.lazySizesConfig={lazyClass:"dext_lazyload",loadedClass:"dext_lazyloaded",loadingClass:"dext_lazyloading",preloadClass:"dext_lazypreload",errorClass:"dext_lazyerror",autosizesClass:"dext_lazyautosizes",fastLoadedClass:"dext_ls-is-cached",srcAttr:"dext-src",srcsetAttr:"dext-srcset",sizesAttr:"dext-sizes"};for(var i in G_DEPlugin.lazyload.options)window.lazySizesConfig[i]=G_DEPlugin.lazyload.options[i];r="../plugin/lazyload/js"+(DEXTTOP.DEXT5.isRelease?"":"_dev")+"/lazysizes.js",r="1"==DEXTTOP.DEXT5.config.UseConfigTimeStamp?r+("?t="+DEXTTOP.DEXT5.util.getTimeStamp()):r+("?ver="+DEXTTOP.DEXT5.ReleaseVer),n(r,function(n){e.isLoadedComplete=!0,1==n?"undefined"!=typeof lazySizes&&(t=lazySizes):e.isLoadError=!0})}})},e.onInit(),e.onLoaded=function(){},e.onBeforeGetApi=function(t){if(e.canUseLazyLoad()){var n=t.targetDoc.getElementById(e.cssId);n&&n.parentNode.removeChild(n),s(t)}},e.onBeforeEditorChangeMode=function(t){e.canUseLazyLoad()&&("source"==t.newMode?s({targetDoc:_iframeDoc}):"preview"==t.currMode&&"design"==t.newMode&&r(_iframeWin))},e.onAfterEditorChangeMode=function(t){e.canUseLazyLoad()&&"preview"==t.newMode&&r(DEXTTOP.G_CURREDITOR._EDITOR.preview.contentWindow)},e.isRequiredCheck=function(t){return e.isLoadedComplete},e.onBeforeDocumentWrite=function(n){var r={html:null};if(e.canUseLazyLoad()){n=n.html;var i=new RegExp(/(<img[^>]+)(src=)([^>]+>)/gi);if(i.test(n))try{n=n.replace(i,"$1"+t.cfg.srcAttr+"=$3")}catch(s){}r.html=n}return r},e.onAfterDocumentWrite=function(n){if(e.canUseLazyLoad()){n=_iframeDoc.getElementsByTagName("img");for(var i=n.length,s=0;s<i;s++)for(var o=n[s],u=o.attributes.length,a=0;a<u;a++){var f=o.attributes[a];f.name==t.cfg.srcAttr&&""!=f.value?0==t.hC(o,t.cfg.lazyClass)&&t.aC(o,t.cfg.lazyClass):-1<f.name.indexOf(t.cfg.srcAttr)&&(o.setAttribute(f.name.replace(t.cfg.srcAttr,"src"),f.value),o.removeAttribute(f.name))}r(_iframeWin)}};var r=function(n){null==n.document.getElementById(e.cssId)&&o(n.document),_iframeDoc.addEventListener("lazyloaded",i),t.setWindow(n),setTimeout(function(){t.init(!0)},0)},i=function(e){},s=function(e){for(var n=[t.cfg.lazyClass,t.cfg.loadedClass,t.cfg.loadingClass,t.cfg.preloadClass,t.cfg.errorClass,t.cfg.autosizesClass,t.cfg.fastLoadedClass],r=n.length,i=0;i<r;i++)for(var s=e.targetDoc.getElementsByClassName(n[i]),o=n[i],u=s.length-1;0<=u;u--){var a=s[u];a.getAttribute(t.cfg.srcAttr)&&(a.src=a.getAttribute(t.cfg.srcAttr),a.removeAttribute(t.cfg.srcAttr)),t.rC(a,o),""!=a.className&&""!=a.className.replace(/ /g,"")||a.removeAttribute("class")}},o=function(t){var n=t.createElement("link");n.href=e.cssUrl,n.id=e.cssId,n.rel="stylesheet",n.type="text/css",t.getElementsByTagName("head")[0].appendChild(n)}}}catch(u){}})();
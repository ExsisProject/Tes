/*
 * Autocomplete - jQuery plugin 1.0.2
 *
 * Copyright (c) 2007 Dylan Verheul, Dan G. Switzer, Anjesh Tuladhar, Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.autocomplete.js 5747 2008-06-25 18:30:55Z joern.zaefferer $
 *
 */

(function(e){e.fn.extend({autocomplete:function(t,n){var r=typeof t=="string";return n=e.extend({},e.Autocompleter.defaults,{url:r?t:null,data:r?null:t,delay:r?e.Autocompleter.defaults.delay:10,max:n&&!n.scroll?10:150},n),n.highlight=n.highlight||function(e){return e},n.formatMatch=n.formatMatch||n.formatItem,this.each(function(){new e.Autocompleter(this,n)})},result:function(e){return this.bind("result",e)},search:function(e){return this.trigger("search",[e])},flushCache:function(){return this.trigger("flushCache")},setOptions:function(e){return this.trigger("setOptions",[e])},unautocomplete:function(){return this.trigger("unautocomplete")}}),e.Autocompleter=function(t,n){function v(t){var n=e("<div />");return n.text(t),n.html()}function m(e){if(e.indexOf("<")<0)return e;var t=e.indexOf("<")+1,n=e.length-1;return e.substr(t,n-t)}function g(e){if(e.indexOf("<")<0)return"";var t=0,n=e.indexOf("<"),r=e.substr(t,n);return trim(r.replace(/[\"]/g,""))}function y(){var t=p.selected();if(!t){if(!n.makeFormat)return!1;var r=e.trim(i.val());if(r=="")return!1;t=r}var s=t;u=s;if(n.multiple){var a=E(i.val());a.length>1&&(s=a.slice(0,a.length-1).join(n.multipleSeparator)+n.multipleSeparator+s),s+=n.multipleSeparator}return n.makeFormat?n.editMode?n.editModeFunc(i,s):n.makeFormatFunc(i,s):i.val(s),n.autoResizeWidth&&i.width(c),N(),!e.browser.msie&&!o&&clearInterval(o),i.trigger("result",[t.data,t.value]),!0}function b(e){var t=/^[0-9a-zA-Z^-~!#$%&*+-.\/=\?\[\]\{\}\(\)\'\"\@\;\:|\s]*$/;return!t.test(e)}function w(t,s){if(l==r.DEL){p.hide();return}var o=i.val();p.setImeMode(b(o)?"etc":"en");if(!s&&o==u)return;if(n.autoResizeWidth){var a=e("#writeStrWidth");a.text(o),a.outerWidth()+50>i.width()&&i.width(a.outerWidth()+50)}u=o,o=S(o),i.addClass(n.loadingClass),n.matchCase||(o=o.toLowerCase()),o!=""?k(o,C,function(){p.hide()}):T()}function E(t){if(!t)return[""];var r=t.split(n.multipleSeparator),i=[],s;for(var o=0;o<r.length;o++)r[o].indexOf(n.multipleSeparatorEtc)>-1?(s=r[o].split(n.multipleSeparatorEtc),e.each(s,function(t,n){e.trim(n)&&(i[i.length]=n)})):i[i.length]=r[o];var u=[];return e.each(i,function(t,n){e.trim(n)&&(u[t]=e.trim(n))}),u}function S(e){if(!n.multiple)return e;var t=E(e),r=t&&t.length>0?t[t.length-1]:"";return r}function x(s,o){n.autoFill&&S(i.val()).toLowerCase()==s.toLowerCase()&&l!=r.BACKSPACE&&(i.val(i.val()+o.substring(S(u).length)),e.Autocompleter.Selection(t,u.length,u.length+o.length))}function T(){clearTimeout(s),s=setTimeout(N,200)}function N(){var e=p.visible();p.hide(),clearTimeout(s),A(),n.mustMatch&&i.search(function(e){if(!e)if(n.multiple){var t=E(i.val()).slice(0,-1);i.val(t.join(n.multipleSeparator)+(t.length?n.multipleSeparator:""))}else i.val("")})}function C(e,t){t&&t.length&&f?(A(),p.display(t,e),x(e,t[0].value),p.show()):N()}function k(t,r,i){n.matchCase||(t=t.toLowerCase());var s=a.load(t);if(s&&s.length)r(t,s);else if(typeof n.url=="string"&&n.url.length>0){var o={keyword:S(t),notContact:n.notContact};n.excSearchOption&&(o.excSearchOption=n.excSearchOption),n.isDomainSearch&&(o.isDomainSearch=n.isDomainSearch),e.post(n.url,o,function(e){e.code=="200"&&e.data&&r(t,e.data)},"json")}else p.emptyList(),i(t)}function L(t){var r=[],i=t.split("\n");for(var s=0;s<i.length;s++){var o=e.trim(i[s]);o&&(o=o.split("|"),r[r.length]={data:o,value:o[0],result:n.formatResult&&n.formatResult(o,o[0])||o[0]})}return r}function A(){i.removeClass(n.loadingClass)}var r={UP:38,DOWN:40,DEL:46,TAB:9,RETURN:13,ESC:27,COMMA:188,PAGEUP:33,PAGEDOWN:34,BACKSPACE:8},i=e(t).attr("autocomplete","off").addClass(n.inputClass),s,o,u="",a=e.Autocompleter.Cache(n),f=0,l,c=n.autoResizeWidth?i.width():0,h={mouseDownOnSelect:!1},p=e.Autocompleter.Select(n,t,y,h),d;e.browser.opera&&e(t.form).bind("submit.autocomplete",function(){if(d)return d=!1,!1}),i.bind((e.browser.opera?"keypress":"keydown")+".autocomplete",function(t){l=t.keyCode;switch(t.keyCode){case r.UP:t.preventDefault(),p.visible()?p.prev():w(0,!0);break;case r.DOWN:t.preventDefault(),p.visible()?p.next():w(0,!0);break;case r.PAGEUP:t.preventDefault(),p.visible()?p.pageUp():w(0,!0);break;case r.PAGEDOWN:t.preventDefault(),p.visible()?p.pageDown():w(0,!0);break;case r.TAB:case r.RETURN:if(n.offKeyPress)return w(),p.visible()?(y(),!1):!1;return y()?(t.preventDefault(),d=!0,!1):!1;case r.ESC:p.hide();break;default:if(n.offKeyPress){p.hide();break}clearTimeout(s),s=setTimeout(w,n.delay),!e.browser.msie&&!o&&(o=setInterval(w,100))}}).focus(function(){f++}).blur(function(){f=0,h.mouseDownOnSelect||T()}).click(function(){f++>1&&!p.visible()&&w(0,!0)}).bind("search",function(){function n(e,n){var r;if(n&&n.length)for(var s=0;s<n.length;s++)if(n[s].result.toLowerCase()==e.toLowerCase()){r=n[s];break}typeof t=="function"?t(r):i.trigger("result",r&&[r.data,r.value])}var t=arguments.length>1?arguments[1]:null;e.each(E(i.val()),function(e,t){k(t,n,n)})}).bind("flushCache",function(){a.flush()}).bind("setOptions",function(){e.extend(n,arguments[1]),"data"in arguments[1]&&a.populate()}).bind("unautocomplete",function(){p.unbind(),i.unbind(),e(t.form).unbind(".autocomplete")})},e.Autocompleter.defaults={inputClass:"ac_input",resultsClass:"ac_results",loadingClass:"ac_loading",minChars:3,delay:400,matchCase:!1,matchSubset:!1,matchContains:!0,cacheLength:10,max:1e3,mustMatch:!1,extraParams:{},selectFirst:!0,formatItem:function(e){return e},formatMatch:null,autoFill:!1,width:0,multiple:!0,multipleSeparator:",",multipleSeparatorEtc:";",highlight:function(e,t){return e=e.split("<").join("&lt;"),e=e.split(">").join("&gt;"),t!=""?e.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)("+t.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi,"\\$1")+")(?![^<>]*>)(?![^&;]+;)","gi"),"<strong>$1</strong>"):e},autoResizeWidth:!1,makeFormat:!1,makeFormatFunc:null,editMode:!1,editModeFunc:null,scroll:!0,scrollHeight:180},e.Autocompleter.Cache=function(t){function i(e,n){t.matchCase||(e=e.toLowerCase());var r=e.indexOf(n);return r==-1?!1:r==0||t.matchContains}function s(e,i){r>t.cacheLength&&u(),n[e]||r++,n[e]=i}function o(){if(!t.data)return!1;var n={},r=0;t.url||(t.cacheLength=1),n[""]=[];for(var i=0,o=t.data.length;i<o;i++){var u=t.data[i];u=typeof u=="string"?[u]:u;var a=t.formatMatch(u,i+1,t.data.length);if(a===!1)continue;var f=a.charAt(0).toLowerCase();n[f]||(n[f]=[]);var l={value:a,data:u,result:t.formatResult&&t.formatResult(u)||a};n[f].push(l),r++<t.max&&n[""].push(l)}e.each(n,function(e,n){t.cacheLength++,s(e,n)})}function u(){n={},r=0}var n={},r=0;return setTimeout(o,25),{flush:u,add:s,populate:o,load:function(s){if(!t.cacheLength||!r)return null;if(!t.url&&t.matchContains){var o=[];for(var u in n)if(u.length>0){var a=n[u];e.each(a,function(e,t){i(t.value,s)&&o.push(t)})}return o}if(n[s])return n[s];if(t.matchSubset)for(var f=s.length-1;f>=t.minChars;f--){var a=n[s.substr(0,f)];if(a){var o=[];return e.each(a,function(e,t){i(t.value,s)&&(o[o.length]=t)}),o}}return null}}},e.Autocompleter.Select=function(t,n,r,i){function d(){if(!l)return;c=e("<div class='layer_auto_complete'/>").hide().addClass(t.resultsClass).css("position","absolute").css("overflow","auto").attr("id",e(n).attr("id")+"_actb").appendTo(document.body),h=e("<ul class='layer_auto_complete'/>").appendTo(c).mouseover(function(t){v(t).nodeName&&v(t).nodeName.toUpperCase()=="LI"&&(u=e("li",h).removeClass(s.ACTIVE).index(v(t)),e(v(t)).addClass(s.ACTIVE))}).click(function(t){return e(v(t)).addClass(s.ACTIVE),r(),n.focus(),e(n).css("ime-mode",p=="etc"?"active":"auto"),!1}).mousedown(function(){i.mouseDownOnSelect=!0}).mouseup(function(){i.mouseDownOnSelect=!1}),t.width>0&&c.css("width",t.width),l=!1}function v(e){var t=e.target;while(t&&t.tagName!="LI")t=t.parentNode;return t?t:[]}function m(e){o.slice(u,u+1).removeClass(s.ACTIVE),g(e);var n=o.slice(u,u+1).addClass(s.ACTIVE);if(t.scroll){var r=0;o.slice(0,u).each(function(){r+=this.offsetHeight}),r+n[0].offsetHeight-h.scrollTop()>h[0].clientHeight?h.scrollTop(r+n[0].offsetHeight-h.innerHeight()):r<h.scrollTop()&&h.scrollTop(r)}}function g(e){u+=e,u<0?u=o.size()-1:u>=o.size()&&(u=0)}function y(e){return t.max&&t.max<e?t.max:e}function b(){h.empty();var n=y(a.length);for(var r=0;r<n;r++){if(!a[r])continue;var i=t.formatItem(a[r],r+1,n,a[r],f);if(i===!1)continue;var l=e("<li/>").html(t.highlight(i,f)).addClass(r%2==0?"ac_even":"ac_odd").appendTo(h)[0];e.data(l,"ac_data",a[r])}o=h.find("li"),t.selectFirst&&(o.slice(0,1).addClass(s.ACTIVE),u=0),e.fn.bgiframe&&h.bgiframe()}var s={ACTIVE:"ac_over"},o,u=-1,a,f="",l=!0,c,h,p;return{display:function(e,t){d(),a=e,f=t,b()},next:function(){m(1)},prev:function(){m(-1)},pageUp:function(){u!=0&&u-8<0?m(-u):m(-8)},pageDown:function(){u!=o.size()-1&&u+8>o.size()?m(o.size()-1-u):m(8)},hide:function(){c&&c.hide(),o&&o.removeClass(s.ACTIVE),u=-1},visible:function(){return c&&c.is(":visible")},current:function(){return this.visible()&&(o.filter("."+s.ACTIVE)[0]||t.selectFirst&&o[0])},show:function(){var r=e(n).offset(),i=navigator.userAgent.toLowerCase(),s=n.offsetHeight;i.indexOf("firefox")!=-1&&(s=n.offsetHeight-6);var u=typeof t.width=="string"||t.width>0?t.width:e(n).width();if(t.customLeft){var a=parseInt(c.outerWidth()),f=r.left>$(window).width()-a?$(window).width()-a:r.left;c.css({width:u,top:r.top+s,left:f}).show()}else c.css({width:u,top:r.top+s,left:r.left}).show();if(t.scroll){h.scrollTop(0),h.css({maxHeight:t.scrollHeight,overflow:"auto"});if(e.browser.msie&&typeof document.body.style.maxHeight=="undefined"){var l=0;o.each(function(){l+=this.offsetHeight});var p=l>t.scrollHeight;h.css("height",p?t.scrollHeight:l),p||o.width(h.width()-parseInt(o.css("padding-left"))-parseInt(o.css("padding-right")))}}},selected:function(){var t=o&&o.filter("."+s.ACTIVE).removeClass(s.ACTIVE);return t&&t.length&&e.data(t[0],"ac_data")},emptyList:function(){h&&h.empty()},unbind:function(){c&&c.remove()},setImeMode:function(e){p=e}}},e.Autocompleter.Selection=function(e,t,n){if(e.createTextRange){var r=e.createTextRange();r.collapse(!0),r.moveStart("character",t),r.moveEnd("character",n),r.select()}else e.setSelectionRange?e.setSelectionRange(t,n):e.selectionStart&&(e.selectionStart=t,e.selectionEnd=n);e.focus()}})(jQuery);
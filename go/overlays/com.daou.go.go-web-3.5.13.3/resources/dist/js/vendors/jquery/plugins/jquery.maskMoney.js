(function(e){e.browser||(e.browser={},e.browser.mozilla=/mozilla/.test(navigator.userAgent.toLowerCase())&&!/webkit/.test(navigator.userAgent.toLowerCase()),e.browser.webkit=/webkit/.test(navigator.userAgent.toLowerCase()),e.browser.opera=/opera/.test(navigator.userAgent.toLowerCase()),e.browser.msie=/msie/.test(navigator.userAgent.toLowerCase()));var t={destroy:function(){return e(this).unbind(".maskMoney"),e.browser.msie&&(this.onpaste=null),this},mask:function(t){return this.each(function(){var n=e(this),r;return typeof t=="number"&&(n.trigger("mask"),r=e(n.val().split(/\D/)).last()[0].length,t=t.toFixed(r),n.val(t)),n.trigger("mask")})},unmasked:function(){return this.map(function(){var t=e(this).val()||"0",n=t.indexOf("-")!==-1,r;return e(t.split(/\D/).reverse()).each(function(e,t){if(t)return r=t,!1}),t=t.replace(/\D/g,""),t=t.replace(new RegExp(r+"$"),"."+r),n&&(t="-"+t),parseFloat(t)})},init:function(t){return t=e.extend({prefix:"",suffix:"",affixesStay:!0,thousands:",",decimal:".",precision:2,allowZero:!1,allowNegative:!1},t),this.each(function(){function i(){var e=n.get(0),t=0,r=0,i,s,o,u,a;return typeof e.selectionStart=="number"&&typeof e.selectionEnd=="number"?(t=e.selectionStart,r=e.selectionEnd):(s=document.selection.createRange(),s&&s.parentElement()===e&&(u=e.value.length,i=e.value.replace(/\r\n/g,"\n"),o=e.createTextRange(),o.moveToBookmark(s.getBookmark()),a=e.createTextRange(),a.collapse(!1),o.compareEndPoints("StartToEnd",a)>-1?t=r=u:(t=-o.moveStart("character",-u),t+=i.slice(0,t).split("\n").length-1,o.compareEndPoints("EndToEnd",a)>-1?r=u:(r=-o.moveEnd("character",-u),r+=i.slice(0,r).split("\n").length-1)))),{start:t,end:r}}function s(){var e=!(n.val().length>=n.attr("maxlength")&&n.attr("maxlength")>=0),t=i(),r=t.start,s=t.end,o=t.start!==t.end&&n.val().substring(r,s).match(/\d/)?!0:!1,u=n.val().substring(0,1)==="0";return e||o||u}function o(e){n.each(function(t,n){if(n.setSelectionRange)n.focus(),n.setSelectionRange(e,e);else if(n.createTextRange){var r=n.createTextRange();r.collapse(!0),r.moveEnd("character",e),r.moveStart("character",e),r.select()}})}function u(e){var n="";return e.indexOf("-")>-1&&(e=e.replace("-",""),n="-"),n+t.prefix+e+t.suffix}function a(e){var n=e.indexOf("-")>-1&&t.allowNegative?"-":"",r=e.replace(/[^0-9]/g,""),i=r.slice(0,r.length-t.precision),s,o,a;return i=i.replace(/^0*/g,""),i=i.replace(/\B(?=(\d{3})+(?!\d))/g,t.thousands),i===""&&(i="0"),s=n+i,t.precision>0&&(o=r.slice(r.length-t.precision),a=(new Array(t.precision+1-o.length)).join(0),s+=t.decimal+a+o),u(s)}function f(e){var t=n.val().length,r;n.val(a(n.val())),r=n.val().length,e-=t-r,o(e)}function l(){var e=n.val();n.val(a(e))}function c(){var e=n.val();return t.allowNegative?e!==""&&e.charAt(0)==="-"?e.replace("-",""):"-"+e:e}function h(e){e.preventDefault?e.preventDefault():e.returnValue=!1}function p(t){t=t||window.event;var r=t.which||t.charCode||t.keyCode,o,u,a,l,p;return r===undefined?!1:r<48||r>57?r===45?(n.val(c()),!1):r===43?(n.val(n.val().replace("-","")),!1):r===13||r===9?!0:!e.browser.mozilla||r!==37&&r!==39||t.charCode!==0?(h(t),!0):!0:s()?(h(t),o=String.fromCharCode(r),u=i(),a=u.start,l=u.end,p=n.val(),n.val(p.substring(0,a)+o+p.substring(l,p.length)),f(a+1),!1):!1}function d(e){e=e||window.event;var r=e.which||e.charCode||e.keyCode,s,o,u,a,l;return r===undefined?!1:(s=i(),o=s.start,u=s.end,r===8||r===46||r===63272?(h(e),a=n.val(),o===u&&(r===8?t.suffix===""?o-=1:(l=a.split("").reverse().join("").search(/\d/),o=a.length-l-1,u=o+1):u+=1),n.val(a.substring(0,o)+a.substring(u,a.length)),f(o),!1):r===9?!0:!0)}function v(){r=n.val(),l();var e=n.get(0),t;e.createTextRange&&(t=e.createTextRange(),t.collapse(!1),t.select())}function m(){setTimeout(function(){l()},0)}function g(){var e=parseFloat("0")/Math.pow(10,t.precision);return e.toFixed(t.precision).replace(new RegExp("\\.","g"),t.decimal)}function y(i){e.browser.msie&&p(i);if(n.val()===""||n.val()===u(g()))t.allowZero?t.affixesStay?n.val(u(g())):n.val(g()):n.val("");else if(!t.affixesStay){var s=n.val().replace(t.prefix,"").replace(t.suffix,"");n.val(s)}n.val()!==r&&n.change()}function b(){var e=n.get(0),t;e.setSelectionRange?(t=n.val().length,e.setSelectionRange(t,t)):n.val(n.val())}var n=e(this),r;t=e.extend(t,n.data()),n.unbind(".maskMoney"),n.bind("keypress.maskMoney",p),n.bind("keydown.maskMoney",d),n.bind("blur.maskMoney",y),n.bind("focus.maskMoney",v),n.bind("click.maskMoney",b),n.bind("cut.maskMoney",m),n.bind("paste.maskMoney",m),n.bind("mask.maskMoney",l)})}};e.fn.maskMoney=function(n){if(t[n])return t[n].apply(this,Array.prototype.slice.call(arguments,1));if(typeof n=="object"||!n)return t.init.apply(this,arguments);e.error("Method "+n+" does not exist on jQuery.maskMoney")}})(window.jQuery||window.Zepto);
/*
 * jQuery Hotkeys Plugin
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Based upon the plugin by Tzury Bar Yochay:
 * http://github.com/tzuryby/hotkeys
 *
 * Original idea by:
 * Binny V A, http://www.openjs.com/scripts/events/keyboard_shortcuts/
*/

(function(e){function t(t){if(typeof t.data!="string")return;var n=t.handler,r=t.data.toLowerCase().split(" ");t.handler=function(t){if(!(this===t.target||!/textarea|select/i.test(t.target.nodeName)&&t.target.type!=="text"))return;var i=t.type!=="keypress"&&e.hotkeys.specialKeys[t.which],s=String.fromCharCode(t.which).toLowerCase(),o,u="",a={};t.altKey&&i!=="alt"&&(u+="alt+"),t.ctrlKey&&i!=="ctrl"&&(u+="ctrl+"),t.metaKey&&!t.ctrlKey&&i!=="meta"&&(u+="meta+"),t.shiftKey&&i!=="shift"&&(u+="shift+"),i?a[u+i]=!0:(a[u+s]=!0,a[u+e.hotkeys.shiftNums[s]]=!0,u==="shift+"&&(a[e.hotkeys.shiftNums[s]]=!0));for(var f=0,l=r.length;f<l;f++)if(a[r[f]])return n.apply(this,arguments)}}e.hotkeys=e.extend(e.hotkeys,{version:"0.8",specialKeys:{46:"del",113:"f2"},shiftNums:{"`":"~",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")","-":"_","=":"+",";":": ","'":'"',",":"<",".":">","/":"?","\\":"|"}}),e.each(["keydown","keyup","keypress"],function(){e.event.special[this]={add:t}})})(jQuery);
/*!
 * jQuery UI Touch Punch 0.2.3
 *
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */

(function(e){function s(e,t){if(e.originalEvent.touches.length>1)return;e.preventDefault();var n=e.originalEvent.changedTouches[0],r=document.createEvent("MouseEvents");console.log("screenY:"+n.screenY),console.log("clinetY:"+n.clientY),r.initMouseEvent(t,!0,!0,window,1,n.screenX,n.screenY,n.clientX,n.clientY,!1,!1,!1,!1,0,null),e.target.dispatchEvent(r)}e.support.touch="ontouchend"in document;if(!e.support.touch)return;var t=e.ui.mouse.prototype,n=t._mouseInit,r=t._mouseDestroy,i;t._touchStart=function(e){var t=this;if(i||!t._mouseCapture(e.originalEvent.changedTouches[0]))return;i=!0,t._touchMoved=!1,s(e,"mouseover"),s(e,"mousemove"),s(e,"mousedown")},t._touchMove=function(e){if(!i)return;this._touchMoved=!0,s(e,"mousemove")},t._touchEnd=function(e){if(!i)return;s(e,"mouseup"),s(e,"mouseout"),this._touchMoved||s(e,"click"),i=!1},t._mouseInit=function(){var t=this;t.element.bind({touchstart:e.proxy(t,"_touchStart"),touchmove:e.proxy(t,"_touchMove"),touchend:e.proxy(t,"_touchEnd")}),n.call(t)},t._mouseDestroy=function(){var t=this;t.element.unbind({touchstart:e.proxy(t,"_touchStart"),touchmove:e.proxy(t,"_touchMove"),touchend:e.proxy(t,"_touchEnd")}),r.call(t)}})(jQuery);
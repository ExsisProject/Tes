/**
 *
 * jQuery.ajaxMock - https://github.com/martinkr/jQuery.ajaxMock
 *
 * jQuery.ajaxMock is a tiny but yet powerful mocking plugin for jQuery 1.5+.
 *
 * @Version: 1.2.0
 *
 * @example:
 *
 *   Register your mock object:
 *   // jQuery.ajaxMock.register( URL ,  {reponseText: "{String} Mocked responseText", statusCode: "{Number} Mocked status code", status: "{String} Mocked status description", type: "{String} http request method"}
 *   jQuery.ajaxMock.register('http://example.com', {
 *         responseText:'responseFoo',
 *         statusCode:200,
 *         status:'OK',
 *         type: 'POST', // optional, takes a String as http request method default: 'GET'
 *         delay: 1000 // optional
 *       }
 *  );
 *
 *  And all $.ajax-calls to 'http://example.com' will return the mocked response.
 *
 * Copyright (c) 2012 Martin Krause (jquery.public.mkrause.info)
 * Dual licensed under the MIT and GPL licenses.
 *
 * @author Martin Krause public@mkrause.info
 * @copyright Martin Krause (jquery.public.mkrause.info)
 * @license MIT http://www.opensource.org/licenses/mit-license.php
 * @license GNU http://www.gnu.org/licenses/gpl-3.0.html
 *
 * @requires
 *  jQuery JavaScript Library - http://jquery.com/, v1.5+
 *    Copyright 2010, John Resig
 *    Dual licensed under the MIT or GPL Version 2 licenses - http://jquery.org/license
 *
 */

(function(e){e.ajaxMock=function(){var t={},n={url:undefined,type:undefined},r="GET",i=function(e,t){return encodeURIComponent([t||r,"++",e].join(""))},s=function(e,n){t[i(e,n.type)]=n},o=function(e,n){return t[i(e,n)]},u=function(e,n){return!!t[i(e,n)]},a=function(){t={},n={url:undefined,type:undefined}},f=function(e,t){if(e){var i=t||r;n=o(e,i),n.url=e,n.type=i}return n},l=function(){e.ajaxTransport("+*",function(t){var n=t.url,i=t.type||r;if(e.ajaxMock.isRegistered(n,i))return{send:function(t,r){function o(){e.ajaxMock.last(n,i),r(s.statusCode||200,s.status||"OK",{text:s.responseText||"",type:i})}var s=e.ajaxMock.getObject(n,i);s.delay?window.setTimeout(o,s.delay):o()}}})};return{getObject:o,register:s,isRegistered:u,flush:a,last:f,initialize:l}}()})(jQuery),$.ajaxMock.initialize();
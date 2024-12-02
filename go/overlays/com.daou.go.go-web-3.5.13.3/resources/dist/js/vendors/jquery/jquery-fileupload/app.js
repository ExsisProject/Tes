/*
 * jQuery File Upload Plugin Angular JS Example 1.2.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

(function(){var e=window.location.hostname==="blueimp.github.io",t=e?"//jquery-file-upload.appspot.com/":"server/php/";angular.module("demo",["blueimp.fileupload"]).config(["$httpProvider","fileUploadProvider",function(t,n){e&&(delete t.defaults.headers.common["X-Requested-With"],angular.extend(n.defaults,{disableImageResize:/Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),maxFileSize:5e6,acceptFileTypes:/(\.|\/)(gif|jpe?g|png)$/i}))}]).controller("DemoFileUploadController",["$scope","$http","$filter","$window",function(n,r,i,s){e||(n.loadingFiles=!0,n.options={url:t},r.get(t).then(function(e){n.loadingFiles=!1,n.queue=e.data.files||[]},function(){n.loadingFiles=!1}))}]).controller("FileDestroyController",["$scope","$http",function(e,t){var n=e.file,r;n.url?(n.$state=function(){return r},n.$destroy=function(){return r="pending",t({url:n.deleteUrl,method:n.deleteType}).then(function(){r="resolved",e.clear(n)},function(){r="rejected"})}):!n.$cancel&&!n._index&&(n.$cancel=function(){e.clear(n)})}])})();
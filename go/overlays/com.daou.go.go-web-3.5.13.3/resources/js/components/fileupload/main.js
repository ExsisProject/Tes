;(function() {
    define([
        "jquery", 
        "backbone",
		'components/fileupload/views/flash_upload',
		'components/fileupload/views/jquery_upload'
    ], 
    function(
       $,
       Backbone,
	   FlashUpload,
	   JqueryUpload
    ) {

		var FileUploadAppView = Backbone.View.extend({
			initialize: function (options) {
				var self = this;

				this.deferred = $.Deferred();

				self.deferred.resolve(new JqueryUpload(options));

				return this.deferred;
			},

			queue: function (callback) {
				this.deferred.done(function (fileUpload) {
					fileUpload.queue(callback);
				});
				return this;
			},

			start: function (callback) {
				this.deferred.done(function (fileUpload) {
					fileUpload.start(callback);
				});
				return this;
			},

			progress: function (callback) {
				this.deferred.done(function (fileUpload) {
					fileUpload.progress(callback);
				});
				return this;
			},

			success: function (callback) {
				this.deferred.done(function (fileUpload) {
					fileUpload.success(callback);
				});
				return this;
			},

			complete: function (callback) {
				this.deferred.done(function (fileUpload) {
					fileUpload.complete(callback);
				});
				return this;
			},

			error: function (callback) {
				this.deferred.done(function (fileUpload) {
					fileUpload.error(callback);
				});
				return this;
			}
		});
        
        return FileUploadAppView;
    });
}).call(this);
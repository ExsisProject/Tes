;(function() {
	define([
			"backbone",
			"components/inlineUpload/views/editor_inlineImgUploadLayer",
			"jquery.go-validation",
	], 
	function(
			Backbone,
			EditorInlineImgUploadLayer
	) {
		var FileUploadLayer = Backbone.View.extend({
			initialize : function(options) {
				this.options = options || {};
			},
			render : function() {
				var uploadLayer = new EditorInlineImgUploadLayer({'elPlaceHolder':this.options.elPlaceHolder});
				uploadLayer.render();
				return this;
			}
		});
		return {
			render : function(opt) {
				return new FileUploadLayer(opt).render();
			}
		};
	});
}).call(this);
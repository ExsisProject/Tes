(function() {
	define([
	"backbone", 
	"app",
	"hgn!components/fileupload/templates/file_item",
	"hgn!components/fileupload/templates/image_file_item"
	],

	function(
		Backbone,
		GO,
		FileTmpl,
		ImageTmpl
	) {

		var FileItemView = Backbone.View.extend({
			tagName : "li",
			events : {
				"span.ic_del click" : "remove"
			},

			initialize : function() {
				this.opts = this.options;
				this.$el.attr("data-name", this.opts.fileName);
				this.$el.attr("data-path", this.opts.filePath);
				this.$el.attr("host-id", this.opts.hostId);
				if (_.has(this.opts, "uid")) this.$el.attr("data-uid", this.opts.uid);
			},

			renderFile : function() {
				this.$el.html(FileTmpl(this.opts));
				return this.$el;
			},
			
			renderImage : function(){
				this.$el.html(ImageTmpl(this.opts));
				return this.$el;
			},
			
			remove : function(){
				this.$el.remove();
			}
		},{
			createFile : function(opts){
				var fileItemView = new FileItemView(opts);
				fileItemView.renderFile();
				return fileItemView;
			},
			
			createImageFile : function(opts){
				var fileItemView = new FileItemView(opts);
				fileItemView.renderImage();
				return fileItemView;
			}
		}
		
		);

		function privateFunc(view, param1, param2) {

		}

		return FileItemView;

	});

})();
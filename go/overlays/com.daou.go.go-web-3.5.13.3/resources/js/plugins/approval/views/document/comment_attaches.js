(function() {
	define([
	    // libraries...
	    "jquery",
	    "backbone",
	    "app",
	    "hgn!approval/templates/document/comment_attaches",
	    "i18n!nls/commons",
	    "i18n!approval/nls/approval"
	], 
	function(
		$,
		Backbone,
		App, 
		TplCommentAttaches,
		commonLang,
		approvalLang
	) {
		var instance = null,
			lang = {
				'download' : commonLang['다운로드'],
				'preview' : approvalLang['미리보기']
			};
			
		var CommentAttaches = Backbone.View.extend({
			initialize: function(options) {
			    this.options = options || {};
				if(!this.options.el) {
					this.tagName = 'div';
				}
				this.attaches = this.options.attaches;
				this.docId = this.options.docId;
				this.commentId = this.options.commentId;
				this.writer = this.options.writer;
				this.originalDocId = this.options.originalDocId;
				this.isBrowseByReference = this.options.isBrowseByReference;
				this.images = [];
				this.files = [];
			},
			events : {
			
			},
			render : function() {
				var self = this;
				$.each(this.attaches, function(k,v) {
					v.humanSize = GO.util.getHumanizedFileSize(v.size);
					v.docId = self.docId;
					v.commentId = self.commentId;
					if (!GO.util.isMobile()) {
						v.download = true;
					}
					if(v.thumbSmall) {
						self.images.push(v);
					} else {
						var reExt = new RegExp("(zip|doc|docx|ppt|pptx|xls|xlsx|hwp|pdf|txt|html|htm|jpg|jpeg|png|gif|tif|tiff|bmp|exe|avi|mp3|mp4|mov|mpg|mpeg|lzh|xml|log|csv|eml)","gi");
						if(!reExt.test(v.extention)){
							v.extention = "def";
						}
						self.files.push(v);
					}
				});
				this.$el.html(TplCommentAttaches({
					lang : lang,
					hasFiles : this.files.length ? true : false,
					files : this.files,
					contextRoot : GO.contextRoot, 
					hasImages : this.images.length ? true : false,
					images : this.images,
					docId : this.docId,
					commentId : this.commentId,
					writer : this.writer,
					isBrowseByReference: this.isBrowseByReference,
					originalDocId: this.originalDocId
				}));
				return this.$el.html();
			}
		});
		
		return {
			render: function(options) {
				instance = new CommentAttaches(options);
				return instance.render();
			}
		};
	});
}).call(this);

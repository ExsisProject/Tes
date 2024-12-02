// 클래식형 게시판 글목록
(function() {
	define([
	    // libraries...
	    "jquery",
	    "backbone",
	    "i18n!nls/commons",
	    "i18n!board/nls/board",
	    "app",
	    "hgn!board/templates/post_attaches"
	], 
	function(
		$,
		Backbone,
		commonLang,
		boardLang,
		App, 
		TplPostAttaches
	) {
		var instance = null,
			lang = {
				'save': commonLang['저장'],
				'preview': commonLang['미리보기'],
				'download': commonLang['다운로드']
			};

		var PostAttaches = Backbone.View.extend({
			initialize: function (options) {
				this.options = options || {};
				if (!this.options.el) {
					this.tagName = 'div';
				}
				this.attaches = this.options.attaches;
				this.boardId = this.options.boardId;
				this.postId = this.options.postId;
				this.images = [];
				this.files = [];
			},
			events: {},
			render: function () {
				var self = this,
					classPreFix = 'length_',
					appendImageCount = 0;

				$.each(this.attaches, function (k, v) {
					v.humanSize = GO.util.getHumanizedFileSize(v.size);

					if (v.thumbSmall) {
						self.images.push(v);
					} else {
						if (!GO.util.fileExtentionCheck(v.extention)) {
							v.extention = "def";
						}
						self.files.push(v);
					}
				});

				this.$el.html(TplPostAttaches({
					lang: lang,
					hasFiles: this.files.length ? true : false,
					files: this.files,
					contextRoot: GO.contextRoot,
					hasImages: this.images.length ? true : false,
					getImageClass: function () {
						if (self.images.length <= 4) {
							return classPreFix + self.images.length;
						} else if (self.images.length == 5) {
							return classPreFix + 3;
						} else if (self.images.length == 6) {
							return classPreFix + 3;
						} else {
							return classPreFix + 4;
						}
					},
					largeImageSize: function () {
						return (self.images.length == 1) ? true : false;
					},
					midImageSize: function () {
						return (self.images.length == 2 || self.images.length == 3) ? true : false;
					},
					smallImageSize: function () {
						return (self.images.length > 3) ? true : false;
					},
					reoffsetImg: function () {
						if (self.images.length == 1) return false;
						return 'if($(this).parents(\'li\').height() > this.height) { this.style.marginTop = ($(this).parents(\'li\').height()-this.height)/2 + \'px\'; } ';
					},
					isGif: function () {
						if (this.extention.toLowerCase() == "gif") {
							return true;
						}
						return false;
					},

					images: this.images,
					postId: this.postId,
					boardId: this.boardId
				}));
				return this.$el.html();
			},

			preview: function (e) {
				var currentEl = $(e.currentTarget);
				GO.util.preview(currentEl.attr("data-id"));

				return false;
			},

			resize: function ($el) {
				if (!$el) return false;
				var $imageEls = $el.find('.feed_img:not(.length_1)>li[data-resize!=true]');
				var _this = this;
				var firstImgWidth = $($imageEls[0]).width();
				if ($imageEls.length) {
					$($imageEls).each(function (k, v) {
						var $v = $(v);
						$v.height(_this.firstImgWidth).attr('data-resize', true);
					});
				}
			}
		});

		return {
			render: function (options) {
				instance = new PostAttaches(options);
				return instance.render();
			},
			resize: function ($el) {
				if (instance) instance.resize($el);
			}
		};
	});
}).call(this);
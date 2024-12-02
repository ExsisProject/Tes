// 클래식형 게시판 글목록
;(function() {
	define([
	    // libraries...
	    "app",	    
	    "jquery",
	    "backbone",
	    "i18n!nls/commons",
	    "i18n!board/nls/board",
	    

	    "hgn!board/templates/mobile/m_post_attaches",
	    "GO.m.util"
	], 
	function(
		App, 
		$,
		Backbone,
		commonLang,
		boardLang,

		TplPostAttaches
	) {
		var instance = null,
			lang = {
				'save' : commonLang['저장'],
				'preview' : commonLang['미리보기'],
				'download' : commonLang['다운로드']
				
			};
			      	
			
		var PostAttaches = Backbone.View.extend({
			initialize: function(options) {
				this.options = options || {};
				if(!this.options.el) {
					this.tagName = 'div';
				}
				this.attaches = this.options.attaches;
				this.boardId = this.options.boardId;
				this.postId = this.options.postId;
				this.images = [];
				this.files = [];
			},
			events : {
				"vclick ul.feed_img a.imageview" : "showImages",
				"vclick ul.file_wrap a.filedown" : "showFiles",
				"vclick ul.file_wrap a[data-type=preview]" : "preview"
			},
			render : function() {
				var self = this,
					classPreFix = 'length_',
					appendImageCount = 0; 
				
				
				$.each(this.attaches, function(k,v) {
					
					v.byteSize = v.size;
					v.size = GO.util.getHumanizedFileSize(v.size);
					
                    if(v.thumbSmall && GO_config.__config__.mobileConfig.useMobilePreview) {
						self.images.push(v);
					} else {
						if(!GO.util.fileExtentionCheck(v.extention)){
							v.extention = "def";
						}
						self.files.push(v);
						
					}						 
				});
				this.$el.html(TplPostAttaches({
					lang : lang,
					hasFiles : this.files.length ? true : false,
					files : this.files,
					useMobilePreview : GO_config.__config__.mobileConfig.useMobilePreview,
					useMobileSecurity : GO_config.__config__.mobileConfig.useMobileSecurity,
					isMobileApp : GO_config.__config__.isMobileApp,
					contextRoot : GO.contextRoot, 
					hasImages : this.images.length ? true : false,
					getImageClass : function() {
						if(self.images.length<=4) {
							return classPreFix + self.images.length;
						} else if (self.images.length == 5) {
							return classPreFix + 3;
						}  else if (self.images.length == 6) {
							return classPreFix + 3;
						}  else {
							return classPreFix + 4;
						}
					},
					midImageSize : function(){
						return (self.images.length == 1 ) ? true : false;
					},
					smallImageSize : function(){
						return (self.images.length > 1 ) ? true : false;							
					},
					isGif : function(){						
						if(this.extention.toLowerCase() == "gif"){
							return true;
						}
						return false;
					},
					reoffsetImg : function() {
						if(self.images.length == 1) return false;
						return 'if($(this).parents(\'li\').height() > this.height) { this.style.marginTop = ($(this).parents(\'li\').height()-this.height)/2 + \'px\'; } ';
					},
					images : this.images,
					postId : this.postId,
					boardId : this.boardId
				}));
				return this.$el.html();
			},
			showFiles : function(e) {
				var $eTarget = $(e.currentTarget);
				var host = location.protocol+"//"+window.location.host;
				var saveUrl = GO.contextRoot + 'api/board/'+$eTarget.attr('data-boardId')+'/post/'+$eTarget.attr('data-postId')+'/attaches/'+$eTarget.attr('data-id');
				var fileName = $eTarget.attr('title');
				var fileSize = $eTarget.attr('data-size');
				
				GO.util.attachFiles(host+saveUrl,fileName,fileSize);
				return false;
			},
			preview : function(e){	
                var currentEl = $(e.currentTarget);
                GO.util.preview(currentEl.attr("data-id"));
                
	            return false;
			},
			showImages : function(e) {
				var images = [],
					selectedKey = 0;
					postImages = {},
					$eTarget = $(e.currentTarget),
					selectedId = $eTarget.attr('data-id'),
					dataGroup = $eTarget.attr('data-group');

				if(dataGroup) {
					postImages = $eTarget.parents('ul.feed_img').find('a[data-group="'+dataGroup+'"]');
					$.each(postImages, function(k,v) {
						var $v = $(v);
						images.push({
							fileName : $v.attr('title'),
							url : GO.contextRoot + 'api/board/'+$v.attr('data-boardId')+'/post/'+$v.attr('data-postId')+'/attaches/'+$v.attr('data-id')
						});
						if($v.attr('data-id') == selectedId) selectedKey = k;
					});
				}
				
				GO.util.attachImages(images, selectedKey);
				return false;
			},
			resize : function($el) {
			
				if(!$el) return false;
				var deferred = $.Deferred();
				var $imageEls = $el.find('.feed_img >li[data-resize!=true]'),
					imageLength = $imageEls.length;
				
				if(imageLength) {
					$($imageEls).each(function(k,v) {
						var $v = $(v),
							$img = $v.find('img');
						
						$img.attr('src', $img.attr('data-src'));
						if(imageLength > 1) $v.attr('data-resize', true);
					});
				}
				deferred.resolveWith(this, [this]);
                return deferred;
			}
		});
		
		return {
			render: function(options) {
				instance = new PostAttaches(options);
				return instance.render();
			},
			resize : function($el) {
				if(instance) {
					instance.resize($el);
				}
			},
			initImageView : function($el) { //stream only  !! 
				if($el && instance) {
					this.resize($el);
					$el.off('vclick', 'ul.feed_img a.imageview');
					$el.off('vclick', 'ul.file_wrap a.filedown');
					$el.off('vclick', 'li a[data-type=preview]');
					$el.on('vclick', 'ul.feed_img a.imageview', $.proxy(instance.showImages, this));
					$el.on('vclick', 'ul.file_wrap a.filedown', $.proxy(instance.showFiles, this));
					$el.on('vclick', 'li a[data-type=preview]', $.proxy(instance.preview, this));
					
				}
			}
		};
	});
}).call(this);
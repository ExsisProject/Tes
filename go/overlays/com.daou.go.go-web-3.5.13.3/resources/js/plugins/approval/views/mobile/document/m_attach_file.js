// 클래식형 게시판 글목록
;(function() {
	define([
	    // libraries...
	    "jquery",
		"underscore",
	    "backbone",
	    "i18n!nls/commons",
	    "i18n!approval/nls/approval",
	    "app",
	    "hgn!approval/templates/mobile/document/m_attach_file",
	    "GO.m.util"
	], 
	function(
		$,
		_,
		Backbone,
		commonLang,
		approvalLang,
		App, 
		TplAttaches
	) {
		var instance = null,
			lang = {
				'attach_file' : approvalLang['첨부파일'],
				'save' : commonLang['저장'],
				'preview' : commonLang['미리보기'],
				'download' : commonLang['다운로드']
			};
			      	
			
		var DocumentAttaches = Backbone.View.extend({
			initialize: function(options) {
				this.options = options || {};
				if(!this.options.el) {
					this.tagName = 'div';
					this.className = 'add_file';
				}
				this.attaches = this.options.attaches;
				this.images = [];
				this.files = [];
			},
			events : {
				'vclick ul.feed_img a.imageview' : 'showImages',
				'vclick ul.file_wrap a.filedown' : 'showFiles',
				'vclick ul.file_wrap span.ic_file_download' : 'showFiles',
				'vclick ul.file_wrap span.name a' : 'showFiles',
				'vclick li a.preview' : 'preview',
				'vclick li a.wrap_ic_file_preview' : 'preview'
			},
			render : function() {
				var self = this,
					classPreFix = 'length_',
					appendImageCount = 0; 
				
				
				$.each(this.attaches, function(k,v) {
					var file = _.clone(v);
					file.byteSize = file.size;
					file.size = GO.util.getHumanizedFileSize(file.size);
					
					if(file.thumbSmall && GO_config.__config__.mobileConfig.useMobilePreview) {
						self.images.push(file);
					} else {
						if(!GO.util.fileExtentionCheck(file.extention)){
							file.extention = "def";
						}
						self.files.push(file);
					}						 
				});
				this.$el.html(TplAttaches({
					lang : lang,
					hasFiles : this.files.length ? true : false,
					files : this.files,
					docId: this.options.docId,
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
					isMobile : GO.util.isMobile()
				}));
				return this.$el.html();
			},
			showFiles : function(e) {
				var $eTarget = $(e.currentTarget);
				var host = location.protocol+"//"+window.location.host;
				var saveUrl = GO.contextRoot + 'api/approval/document/' + this.options.docId + '/download/' +$eTarget.attr('data-id');
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
				var docId = this.options.docId;
				var images = [],
					selectedKey = 0;
					$eTarget = $(e.currentTarget),
					selectedId = $eTarget.attr('data-id'),
					dataGroup = $eTarget.attr('data-group');
					
				if (dataGroup) {
					var postImages = $eTarget.parents('ul.feed_img').find('a[data-group="'+dataGroup+'"]');
			        $.each(postImages, function(k,v) {
			            var $v = $(v);
			            images.push({
			                fileName : $v.attr('title'),
			                url : GO.contextRoot + 'api/approval/document/' + docId + '/download/' +$v.attr('data-id')
			            });
			            if($v.attr('data-id') == selectedId) selectedKey = k;
			        });
				} else {
					images.push({
						fileName : $eTarget.attr('title'),
						url : GO.contextRoot + 'api/approval/document/' + docId + '/download/' + $eTarget.attr('data-id')
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
						if(imageLength > 1) $v.height($v.width()).attr('data-resize', true);
					});
				}
				deferred.resolveWith(this, [this]);
                return deferred;
			}
		});
		
		return {
			render: function(options) {
				instance = new DocumentAttaches(options);
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
					$el.off('click', 'ul.feed_img a.imageview');
					$el.off('click', 'ul.file_wrap a.filedown');
					$el.off('click', 'li a.preview');
					$el.on('click', 'ul.feed_img a.imageview', $.proxy(instance.showImages, this));
					$el.on('click', 'ul.file_wrap a.filedown', $.proxy(instance.showFiles, this));
					$el.on('click', 'li a.preview', $.proxy(instance.preview, this));
					
				}
			}
		};
	});
}).call(this);
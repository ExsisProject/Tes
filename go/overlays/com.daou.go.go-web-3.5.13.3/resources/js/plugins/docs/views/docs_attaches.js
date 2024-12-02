define('docs/views/docs_attaches', function(require) {
    var $ = require('jquery');
    var Backbone = require('backbone');
    var commonLang = require('i18n!nls/commons');
    var TplDocsAttaches = require('hgn!docs/templates/docs_attaches');

    var instance = null,
        lang = {
            'save' : commonLang['저장'],
            'preview' : commonLang['미리보기'],
            'download' : commonLang['다운로드']
        };

    var DocsAttaches = Backbone.View.extend({

        initialize: function(options) {
            this.options = options || {};
            if(!this.options.el) {
                this.tagName = 'div';
            }
            this.attaches = this.options.attaches;
            this.docsId = this.options.docsId;
            this.images = [];
            this.files = [];
        },

        events : {
            'click li a.preview' : "preview",
            'click li a.imageview' : 'showImages',
            'click li a.filedown' : "showFiles"
        },
        render : function() {
            var self = this;

            $.each(this.attaches, function(k,v) {

                v.size = GO.util.getHumanizedFileSize(v.size);

                if(v.thumbSmall && !GO.util.isMobile()) {
                	self.images.push(v);                    
                }else if(v.thumbSmall && GO.util.isMobile() && GO_config.__config__.mobileConfig.useMobilePreview){
                	self.images.push(v); 
                }else {
                    if(!GO.util.fileExtentionCheck(v.extention)){
                        v.extention = "def";
                    }
                    self.files.push(v);

                }
            });

            this.$el.html(TplDocsAttaches({
                lang : lang,
                hasFiles : this.files.length ? true : false,
                files : this.files,
                useMobilePreview : GO_config.__config__.mobileConfig.useMobilePreview,
                useMobileSecurity : GO_config.__config__.mobileConfig.useMobileSecurity,
                isMobileApp : GO_config.__config__.isMobileApp,
                contextRoot : GO.contextRoot,
                hasImages : this.images.length ? true : false,
                isGif : function(){
                    if(this.extention.toLowerCase() == "gif"){
                        return true;
                    }
                    return false;
                },
                isMobile : GO.util.isMobile(),
                images : this.images,
                docsId : this.docsId
            }));
            return this.$el.html();
        },

        preview : function(e){
            var currentEl = $(e.currentTarget);
            GO.util.preview(currentEl.attr("data-id"));

            return false;
        },

        resize : function($el) {
            if(!$el) return false;
            var $imageEls = $el.find('.feed_img:not(.length_1)>li[data-resize!=true]');
            var firstImgWidth = $($imageEls[0]).width();
            if($imageEls.length) {
                $($imageEls).each(function(k,v) {
                    var $v = $(v);
                    $v.height(firstImgWidth).attr('data-resize', true);
                });
            }
        },

        showImages : function(e) {
            var images = [],
                selectedKey = 0;
            var $eTarget = $(e.currentTarget),
                selectedId = $eTarget.attr('data-id'),
                dataGroup = $eTarget.attr('data-group');

            if (dataGroup) {
                var postImages = $eTarget.parents('ul.img_wrap').find('a[data-group="'+dataGroup+'"]');
                $.each(postImages, function(k,v) {
                    var $v = $(v);
                    images.push({
                        fileName : $v.attr('title'),
                        url : GO.contextRoot + 'api/docs/'+$v.attr('data-docsId')+'/download/'+$v.attr('data-id')
                    });
                    if($v.attr('data-id') == selectedId) selectedKey = k;
                });
            } else {
                images.push({
                    fileName : $eTarget.attr('title'),
                    url :  GO.contextRoot + 'api/docs/'+$eTarget.attr('data-docsId')+'/download/'+$eTarget.attr('data-id')
                });
            }

            GO.util.attachImages(images, selectedKey);
            return false;
        },
        showFiles : function(e) {
        	var $eTarget = $(e.currentTarget),
            	selectedId = $eTarget.attr('data-id'),
            	dataGroup = $eTarget.attr('data-group');
        	
			var host = location.protocol+"//"+window.location.host;
			var saveUrl = GO.contextRoot + 'api/docs/'+$eTarget.attr('data-docsId')+'/download/'+$eTarget.attr('data-id');
			var fileName = $eTarget.attr('title');
			var fileSize = $eTarget.attr('data-size');
			
			GO.util.attachFiles(host+saveUrl,fileName,fileSize);
			return false;
        }

    });

    return {
        render: function(options) {
            instance = new DocsAttaches(options);
            return instance.render();
        },
        resize : function($el) {
            if(instance) instance.resize($el);
        }
    };
});
(function() {
define([
    "jquery",
    "backbone",
    "approval/models/ref_document",
    "approval/views/mobile/document/m_attach_file",
    "hgn!approval/templates/mobile/document/m_preview",
    "hgn!approval/templates/mobile/document/m_reference_doc_view",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
	"GO.util",
	"iscroll"
],
function(
	$,
	Backbone,
	RefDocumentModel,
	AttachFileView,
	PreviewTpl,
	ReferenceDocumentTpl,
    commonLang,
    approvalLang
) {
	var lang = {
			'confirm' : commonLang['확인'],
			'cancel' : commonLang['취소'],
			'attach_file' : approvalLang['첨부파일'],
			'ref_doc' : approvalLang['관련문서'],
			'view' : approvalLang['보기'],
			'preview' : approvalLang['미리보기'],
			'amt' : approvalLang['개'],
			'원본문서' : approvalLang['원본문서']
	};
	var DocumentPreView = Backbone.View.extend({
		initialize : function(options){
			_.bindAll(this, 'render');
		    this.options = options || {};
		    this.docId = options.docId;
		    this.title = options.title || lang['preview'];
		    this.docBody = $.goFormUtil.convertViewMode(this.options.docBody);
		    this.attaches = this.options.attaches;
		    this.references = this.options.references;
			this.images = [];
			this.files = [];
			this.callback = _.isFunction(this.options.callback) ? this.options.callback : this.back

            if (_.isNull(options.isDocReadAuthority)) {
                this.isDocReadAuthority = true;
            } else {
                this.isDocReadAuthority = options.isDocReadAuthority;
            }
		},
		id: 'mobileDocPreview',
		attributes : {
			'data-role' : 'layer',
			'style' : 'background:#fff; position:absolute; width:100%; min-height:100%; top:0; left:0; z-index:999'
		},
		unbindEvent : function() {
			this.$el.off("vclick", "a[data-btn='cancel']");
		},
		bindEvent : function() {
			this.$el.on("vclick", "a[data-btn='cancel']", $.proxy(this.callback, this));
		},
		events : {
			'vclick ul.feed_img a.imageview' : 'showImages',
			'vclick ul.file_wrap a.filedown' : 'showFiles',
			'vclick ul.file_wrap span.name a' : 'showFiles',
			'vclick li a.preview' : 'preview',					// pc
			'vclick li a.wrap_ic_file_preview' : 'preview'	// mobile
		},

		render: function() {
			this.unbindEvent();
			this.bindEvent();
			var self = this,
			classPreFix = 'length_',
			appendImageCount = 0;
			$.each(this.attaches, function(k,v) {
				v.byteSize = v.size;
				v.size = GO.util.getHumanizedFileSize(v.size);

				if(v.thumbSmall) {
					self.images.push(v);
				} else {
					if(!GO.util.fileExtentionCheck(v.extention)){
						v.extention = "def";
					}
					self.files.push(v);

				}
			});

			this.$el.html(PreviewTpl({
				title : this.title,
				docBody : this.docBody,
				hasFiles : this.files.length ? true : false,
				files : this.files,
				docId : this.docId,
                isDocReadAuthority : this.isDocReadAuthority,
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
					if(self.images.length == 1) {
                        return false;
                    }
					return 'if($(this).parents(\'li\').height() > this.height) { this.style.marginTop = ($(this).parents(\'li\').height()-this.height)/2 + \'px\'; } ';
				},
				images : this.images,
				isMobile : GO.util.isMobile()
			}));

			this.$el.find('div#refDocPart').append(ReferenceDocumentTpl({
				lang: lang,
			    data: function() {
			        var receptionOrigin = self.receptionOrigin;
			        if (!receptionOrigin || 0) { // 원본문서가 존재하지 않을 경우(기안문서)
			            return { references: self.references };
			        }
			        //관련문서는 원본문서도 포함할수 있다.
			        //실제 수신문서의 entity에는 원본문서(receptionOrigin)가 존재하지만 관련문서(references)에 추가하여 보여주고 있음
			        return {
			        	references: _.filter(self.references, function(referenceDocument) {return referenceDocument.id != receptionOrigin.id;}),
			            receptionOriginInReferences: _.find(self.references, function(referenceDocument) {return referenceDocument.id == receptionOrigin.id;})
			        };
			    }
			}));
			this.$el.css("height",$(document).height()+"px");
			$('body').append(this.el);
			GO.util.initDetailiScroll('preview_doc_iscroll', 'preview_doc_hscroll', 'preview_document', true, 20, true);
		},

		showFiles : function(e) {
			var $eTarget = $(e.currentTarget);
			var host = location.protocol+"//"+window.location.host;
			var saveUrl = GO.contextRoot + 'api/approval/document/' + this.docId + '/download/'+$eTarget.attr('data-id');
			var fileName = $eTarget.attr('title');
			var fileSize = $eTarget.attr('data-size');

			GO.util.attachFiles(host+saveUrl,fileName,fileSize);
			return false;
		},
		showImages : function(e) {
			var images = [],
				selectedKey = 0;
				$eTarget = $(e.currentTarget),
				selectedId = $eTarget.attr('data-id');

					images.push({
						fileName : $eTarget.attr('title'),
						url : GO.contextRoot + 'api/approval/document/' + this.docId + '/download/'+$eTarget.attr('data-id')
					});

			GO.util.attachImages(images, selectedKey);
			return false;
		},

		resize : function($el) {

			if(!$el) {
                return false;
            }
			var deferred = $.Deferred();
			var $imageEls = $el.find('.feed_img >li[data-resize!=true]'),
				imageLength = $imageEls.length;

			if(imageLength) {
				$($imageEls).each(function(k,v) {
					var $v = $(v),
						$img = $v.find('img');

					$img.attr('src', $img.attr('data-src'));
					if(imageLength > 1){$v.height($v.width()).attr('data-resize', true);}
				});
			}
			deferred.resolveWith(this, [this]);
            return deferred;
		},

		back : function(e) {
			window.history.back();
			if(e){e.stopPropagation();}
			return false;
		},
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		},

        preview : function(e) {
			var currentEl = $(e.currentTarget);
			GO.util.preview(currentEl.attr("data-id"));
			return false;
		}
	});

	return DocumentPreView;
	});
}).call(this);
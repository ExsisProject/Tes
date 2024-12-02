define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "approval/models/ref_document",
    "hgn!approval/templates/document/document_print",
    "hgn!approval/templates/document/reference_doc_view",
    "attach_file",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
    "jquery.fancybox",
    "formutil"
],
function(
	$,
	_,
	Backbone,
	App,
	RefDocumentModel,
	DocumentPrintTpl,
	ReferenceDocumentTpl,
	AttachFilesView,
    commonLang,
    approvalLang
) {
	var DocumentModel = Backbone.Model.extend({
		url: function() {
			return "/api/approval/document/" + this.docId;
		},
		setId: function(docId) {
			this.docId = docId;
		}
	});

	var lang = {
		'confirm' : commonLang['확인'],
		'cancel' : commonLang['취소'],
		'save' : commonLang['저장'],
		'view' : approvalLang['보기'],
		'attach_file' : approvalLang['첨부파일'],
		'ref_doc' : approvalLang['관련문서'],
		'preview' : approvalLang['미리보기'],
		'amt' : approvalLang['개'],
		'원본문서' : approvalLang['원본문서']
	};

	var PrintView = Backbone.View.extend({

	    el: '.layer_normal .content',
	    events: {
	        'click #btnRefDocPreview' : 'showReferencePreview'
	    },

		initialize: function(opt) {
		    this.prevPopup = opt.popup;
		    this.docId = opt.docId;
			this.docBody = $.goFormUtil.convertViewMode(opt.docBody);
			this.attaches = opt.attaches;
			this.references = opt.references;
		},

		render: function() {
			var hasAttach = false;
			if (!($.isEmptyObject(this.attaches)) || !($.isEmptyObject(this.references))){
			    hasAttach = true;
		    }

			this.$el.html(DocumentPrintTpl({
				data : this.docBody,
				hasAttach : hasAttach
			}));

			// 에디터영역의 기본 스타일
			this.$el.find('span[data-type=editor]').css('font-size', '12px').css('line-height', '1.5').css('font-family', '돋움,dotum,AppleGothic,arial,Helvetica,sans-serif');

			if (hasAttach) {
				var docId = this.docId;
				$.each(this.attaches,function(k,v){
					v.docId = docId;
				});
				
				AttachFilesView.create('div#attachePrintView', this.attaches, function(item) {
					return GO.config('contextRoot') + 'api/approval/document/' + item.attributes.docId + '/download/' + item.id;
                });

				this.$el.find('div#referencePrintView').append(ReferenceDocumentTpl({
					lang: lang,
				    data: function() {
						if (!self.docModel) return {};
				        var receptionOrigin = self.docModel.receptionOrigin;
				        if (!receptionOrigin || 0) { // 원본문서가 존재하지 않을 경우(기안문서)
				            return { references: self.docModel.references };
				        }
				        //관련문서는 원본문서도 포함할수 있다.
				        //실제 수신문서의 entity에는 원본문서(receptionOrigin)가 존재하지만 관련문서(references)에 추가하여 보여주고 있음
				        return {
				        	references: _.filter(self.docModel.references, function(referenceDocument) {return referenceDocument.id != receptionOrigin.id;}),
				            receptionOriginInReferences: _.find(self.docModel.references, function(referenceDocument) {return referenceDocument.id == receptionOrigin.id;})
				        };
				    }
				}));
			}
		},

		showReferencePreview: function(e) {
		    var refDocId = $(e.currentTarget).attr('data-id');
            var refDocModel = RefDocumentModel.create(this.docId, refDocId);
            refDocModel.fetch({async : false});

            var popupOption = {
                'allowPrevPopup' : true,
                "pclass" : "layer_normal layer_approval_preview preview_child_" + refDocId,
                "header" : approvalLang['보기'],
                "modal" : true,
                "width" : 900,
                "contents" :  "",
                "buttons" : [
                    {
                        'btext' : commonLang['확인'],
                        'btype' : 'confirm'
                    },
                    {
                        'btext' : commonLang["취소"],
                        'btype' : 'cancel'
                    }
                ]
            };

            if (this.prevPopup) {
                var prevPopupOffset = this.prevPopup.offset();
                popupOption['offset'] = {
                    'top': prevPopupOffset['top'] + 20,
                    'left' : prevPopupOffset['left'] + 20
                };
            }

            var previewLayer = $.goPopup(popupOption);
            var documentPrintView = new PrintView({
                el : '.preview_child_' + refDocId + ' .content',
                popup : previewLayer,
                docId : refDocId,
                docBody : refDocModel.get('document').docBodyContent,
                attaches : refDocModel.get('document').attaches,
                references : refDocModel.get('document').references
            });

            documentPrintView.render();
//            previewLayer.reoffset();
		},

		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});

	return PrintView;
});
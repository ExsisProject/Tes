define([
    "jquery",
    "underscore",
    "backbone",
	"when",
    
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
    "file_upload",
    "content_viewer",
	"approval/views/document/attach_file",

    "hgn!approval/templates/official_document/document",
	'formutil',
    "jquery.fancybox",
    "jquery.go-popup",
    "jquery.ui",
    "json",
    "json2",
    "jquery.go-validation",
    "jquery.placeholder",
    "jquery.progressbar",
    'go-fancybox'
],
function(
	$,
	_,
	Backbone,
	when,

	commonLang,
    approvalLang,
    FileUpload,
    ContentViewer,
	ApprAttachFileView,
	
	DocumentTpl
) {
	var lang = {
		'img_attach' : commonLang['이미지 첨부'],
		'file_attach' : commonLang['파일 첨부'],
		'del' : commonLang['삭제'],
		'confirm' : commonLang['확인'],
		'cancel' : commonLang['취소'],
		'save' : commonLang['저장'],
		'noti' : commonLang['알림'],
		'doc_search' : approvalLang['문서 검색'],
		'attach_file' : approvalLang['첨부파일'],
		'ref_doc' : approvalLang['관련문서'],
		'view' : approvalLang['보기'],
		'preview' : approvalLang['미리보기'],
		'amt' : approvalLang['개'],
		'msg_no_approval_document' : approvalLang['결재 문서를 선택해 주세요'],
		'msg_duplicate_approval_document' : approvalLang['중복된 관련문서가 있습니다'],
		'댓글' : approvalLang['댓글']
	};
	
	var APPROVAL_EDITOR_CONTENT_MARGIN = "body {margin: 0px;}";
	
	var DocumentView = Backbone.View.extend({
		events : {

		},

		initialize: function(options) {
		    this.options = options || {};
		    this.model = options.model;
			_.bindAll(this, 'render');
		},
		render: function() {
			this.$el.html(DocumentTpl({
				 lang : lang,
				 model : this.model
			}));
			this.docContents = $('#document_content');
			var content = this.model.get('officialBody');
			this.docContents.html(content);
			var style = _.map(this.docContents.find("style"), function(style) {
				return $(style).html();
			}).join("");
			_.each(this.docContents.find("span[data-dsl*='editor']"), function(el) {
				var $el = $(el);
				ContentViewer.init({
					$el : $el,
					content : GO.util.escapeXssFromHtml($el.html()),
					style : style + APPROVAL_EDITOR_CONTENT_MARGIN
				});
			});
			return this;
		}
	});

	return DocumentView;
});
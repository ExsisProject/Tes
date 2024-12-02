define([
	"backbone",
	"app",
	"approval/models/document",
	"approval/models/appr_flow",
	"approval/views/document/comments",
	"approval/views/document/apprflow",
	"approval/views/document/attach_file",
	"hgn!approval/templates/document/print_main",
	"hgn!approval/templates/document/print_toolbar",

	"hgn!approval/templates/document/print_document",
	"hgn!approval/templates/document/attach_file_view",
	"hgn!approval/templates/doc_attaches_file",
	"hgn!approval/templates/doc_attaches_img",
	"hgn!approval/templates/document/reference_doc_view",

	"i18n!nls/commons",
	"i18n!approval/nls/approval",

	'formutil',
	"jquery.fancybox",
	"jquery.go-popup",
	"jquery.ui",
	"json",
	"json2",
	"jquery.placeholder"
],
function(
	Backbone,
	App,
	ApprDocumentModel,
	ApprFlowModel,
	CommentsView,
	ApprFlowView,
	ApprAttachFileView,
	MainTpl,
	ToolbarTpl,

	DocumentTpl,
	AttachFileTpl,
	AttachesFileTpl,
	AttachesImgTpl,
	ReferenceDocumentTpl,

	commonLang,
	approvalLang
) {
	var DocumentViewModel = ApprDocumentModel.extend({
		initialize: function(attrs, options) {
			this.options = options || {};
			this.docId = this.options.docId;

			ApprDocumentModel.prototype.initialize.apply(this, arguments);
		},

		url: function() {
			var url = '/api/approval/document/'+this.docId;
			return url;
		},

		getShowUrl : function(){
			var docId = this.docId.split("?")[0];

			return "/approval/document/" + docId;
		},

		getFullShowUrl : function(){
			return window.location.protocol + "//" +window.location.host + GO.contextRoot +"app" + this.getShowUrl();
		}
	}, {
		create: function(docId) {
			return new DocumentViewModel({}, {"docId": docId});
		}
	});

	var lang = {
		"결재문서명" : approvalLang['결재문서명'],
		"기안자" : approvalLang['기안자'],
		"결재자" : approvalLang['결재자'],
		"기안의견" : approvalLang['기안의견'],
		"결재의견" : approvalLang['결재의견'],
		"댓글" : commonLang['댓글'],
		"결재비밀번호" : approvalLang['결재비밀번호'],
		"전결" : approvalLang['전결'],
		"전결설명" : approvalLang['전결설명'],
		"결재옵션" : approvalLang['결재옵션'],
		"결재선" : approvalLang['결재선'],
		"문서정보" : approvalLang['문서정보'],
		"변경이력" : approvalLang['변경이력'],
		"공문발송" : approvalLang['공문발송'],
		"인쇄 미리보기" : commonLang['인쇄 미리보기'],
		"인쇄" : commonLang['인쇄'],
		"열람자 추가" : approvalLang['열람자 추가'],
		"의견을 작성해 주세요" : approvalLang['의견을 작성해 주세요'],
		'목록으로 이동합니다' : approvalLang['목록으로 이동합니다'],
		'담당자를 지정해주세요' : approvalLang['담당자를 지정해주세요'],
		'담당자가 지정되었습니다' : approvalLang['담당자가 지정되었습니다'],
		'담당자를 지정할 수 없습니다' : approvalLang['담당자를 지정할 수 없습니다'],
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
		'원본문서' : approvalLang['원본문서']
	};

	var DocumentView = Backbone.View.extend({
		events : {
			'click span#addRelatedDocument' : 'onAddRelatedDocumentClicked',
			'click span.ic_del' : 'attachDelete',
			'click #refDocPart a.btn_fn4' : 'refPreviewBtnClicked',
			'click #refDocPart span.name' : 'refPreviewTitleClicked',
			'click #refDoc a.btn_fn4' : 'refPreviewBtnClicked',
			'click #refDoc span.name' : 'refPreviewTitleClicked',
			'click a[data-func]' : 'attachPreview'
		},

		initialize: function(options) {
			this.options = options || {};
			this.formOpts = {};
			_.bindAll(this, 'render', 'setViewMode');
			this.docType = this.options.type;
			this.docId = this.options.docId;
			this.docModel = this.options.model;
			this.infoModel = this.options.infoData;
			this.apprFlowModel = this.options.apprFlowModel;
			this.actionModel = this.options.actionModel;
			this.userApprSettingModel = this.options.userApprSettingModel;
			this.mode = 'VIEW';	// 'NEW', 'VIEW', 'EDIT'

		},
		render: function() {
			var self = this;
			var formScriptType = this.infoModel['formScriptType'];
			var moduleName = this.infoModel['externalScript'];
			var scriptBody = this.infoModel['scriptBody'];
			this.$el.html(DocumentTpl({
				lang : lang,
				data : this.docModel
			}));

			this.docContents = $('#document_content');

			this.initAttachFileView();

			this.$el.find('div#attachView').append(ReferenceDocumentTpl({
				lang: lang,
			    data: function() {
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

			if(formScriptType == 'SRC' && !_.isEmpty(moduleName)){
				this.renderIntegrationByExternalScript({mode : 'view', moduleName : moduleName});
			}else if(formScriptType == 'EDIT' && !_.isEmpty(scriptBody)){
				this.renderIntegrationByScriptText({mode : 'view', scriptBody : scriptBody});
			}else{
				this.setViewMode();				
			}
			return this;
		},
		
		renderIntegrationByExternalScript : function(option){
			var self = this;
			var moduleName = option.moduleName;
			var mode = option.mode;
			var integrationView = null;
			if(!_.isEmpty(moduleName)){
				require([moduleName], function(Integration) {
					if(!_.isUndefined(Integration)){
						integrationView = new Integration({
							variables : _.clone(self.docModel.variables),
							docModel : self.docModel,
							infoData : self.infoModel
						});
						self.setViewMode(); //GO-21704 양식 스크립트 방식 개선 : 화면이 그려진 상태에서 실행하도록 개선
	                    if(_.isFunction(integrationView.renderViewMode)){
	                        integrationView.renderViewMode();
	                    }
					}
				});
			}else{
				console.log('module name Empty!!');
			}
		},

		renderIntegrationByScriptText : function(option){
			var self = this;
			var mode = option.mode;
			var scriptBody = option.scriptBody;
			var integrationView;
			var integrationFn = new Function(scriptBody);
			if(integrationFn){
				var returnView = new integrationFn();
				integrationView = new returnView({
					variables : _.clone(self.docModel.variables),
					docModel : self.docModel,
					infoData : self.infoModel
				});
				self.setViewMode(); //GO-21704 양식 스크립트 방식 개선 : 화면이 그려진 상태에서 실행하도록 개선
                if(_.isFunction(integrationView.renderViewMode)){
                    integrationView.renderViewMode();
                }
			}else{
				console.log('scriptBody is Empty');
			}
		},

		initAttachFileView: function() {
			if(!_.isEmpty(this.docModel.attaches)){
				ApprAttachFileView.appendTo(this.$el.find('div#attachView'), this.docModel.attaches, this.userApprSettingModel, this.docId);
			}
		},

		setViewMode: function() {
			this.mode = 'VIEW';
			GO.util.store.set('document.docMode', this.mode, {type: 'session'});
			$(this.el).find('div#editView').hide();
			$(this.el).find('div#attachView').show();
			$(this.el).find('section.article_reply').show();
			var content = $.goFormUtil.convertViewMode(GO.util.escapeXssFromHtml(this.docModel.docBodyContent));
			content = this.convertSelect(content);
			this.docContents.html(content);
			this.setApprovalData();
			this.setApprovalDataCorrectHeight();
		},

		setApprovalDataCorrectHeight: function () {
			var formScrollHeight = $("#document_content").prop("scrollHeight");
			var formHeight = $('#document_content').height();
			var toolbarHeight = $('#toolbar').outerHeight();

			if (formScrollHeight - toolbarHeight > formHeight) {
				$('#document_content').height(formScrollHeight - toolbarHeight);
			}
		},

		setApprovalData : function(){
			var setData = {
					preserveDuration : this.showPreserveYears(this.infoModel.docYear)
				};
			$('#document_content').setApprovalData(setData);
		},
		
		showPreserveYears : function(year) {
        	return (year == 0) ? approvalLang['영구'] : year + approvalLang['년'];
		},
		
		/*
         * 방어코드
         * 전자결재 양식에 select 컴포넌트가 없을때 select를 커스터마이징한 경우 인쇄할때 select 박스가 그대로 노출됨
         * 원인은 DB에 select tag가 저장되기때문임.
        */
		convertSelect : function(data){
        	var $data = $(data);
        	$.each($data.find('select'),function(index,selectEl){
        		var selectWrapSpan = $(selectEl).parent('span');
            	var selectValue = selectWrapSpan.attr('data-selecttext');
            	$(selectEl).remove();
                selectWrapSpan.text(selectValue);
        	});
        	return $data;
        },

		onAddRelatedDocumentClicked: function(){
			var relatedDocumentAttachLayer = $.goPopup({
				"pclass" : "layer_normal layer_doc_attach",
				"header" : approvalLang["결재 문서 첨부"],
				"modal" : true,
				"width" : "800px",
				"contents" :  "",
				"buttons" : [{
					'btext' : commonLang["확인"],
					'btype' : 'confirm',
					'autoclose' : false,
					'callback' : function(rs) {
						var tr = $('#reference_tbody tr');
						var count = 0;
						var ids = [];
						var docnums = [];
						var title = [];
						$(tr).each(function(k, v){
							if($(v).find("input[type=checkbox]").is(':checked')){
								count++;
								ids.push($(v).find("input[type=checkbox]").attr('data-id'));
								docnums.push($(v).find("input[type=checkbox]").attr('data-docnum'));
								title.push($(v).find(".subject").text());
							}
						});

						if(count == 0){
							$.goError(lang.msg_no_approval_document);
							return false;
						}

						var original_ids = [];
						var original_li = $('#refDocPart').find('li[data-id]');
						var isExist = false;
						$(original_li).each(function(k, v){
							original_ids.push($(v).attr('data-id'));
						});
						$(ids).each(function(k, v){
							$(original_ids).each(function(index, value){
								if(v == value){
									isExist = true;
								}
							});
						});

						if(isExist){
							$.goError(lang.msg_duplicate_approval_document);
							return false;
						}

						for(var i=0; i < count; i++){
							var templete = '<li data-id="'+ids[i]+'" data-name="'+title[i]+'">'+
								'<span class="item_file">'+
								'<span class="name" data-id="'+ids[i]+'">['+ docnums[i] + '] ' + title[i]+'</span>'+
								'<span class="optional">' +
								'<a class="btn_fn4"><span class="txt">' + lang.preview + '</span></a>' +
								'<span class="btn_wrap" title="' + lang.del + '">' +
								'<span class="ic_classic ic_del"></span>' +
								'</span>' +
								'</span>' +
								'</span>' +
								'</li>';
							$("#refDocPart").find('ul.file_wrap').append(templete);
						};

						rs.close();
					}
				},
					{
						'btext' : commonLang["취소"],
						'btype' : 'cancel'
					}]
			});

			var relatedDocumentAttachView = new RelatedDocumentAttachView({});

			relatedDocumentAttachView.render();
			relatedDocumentAttachLayer.reoffset();
		},

		attachPreview : function(e){
			var currentEl = $(e.currentTarget);
			GO.util.preview(currentEl.attr("data-id"));
			return false;
		},

		refPreviewBtnClicked: function(e) {
			var refDocId = $(e.currentTarget).parents('li').data('id');
			this.previewRefDoc(refDocId);
		},

		refPreviewTitleClicked: function(e) {
			this.refPreviewBtnClicked(e);
		},

		previewRefDoc: function(refDocId) {
			var url = window.location.protocol + "//" +window.location.host + GO.contextRoot +"app/approval/document/" + this.docId + "/preview/reference/" + refDocId;
			window.open(url, '','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
		},


		setAttaches: function(){
			var images = [];
			var files = [];
			$.each(this.model.attaches,function(k,v){
				if(v.thumbSmall){
					images.push(v);
				}else{
					files.push(v);
				}
			});

			var checkFileType = function(){
				var fileType = "def";
				if(GO.util.fileExtentionCheck(this.extention)){
					fileType = this.extention;
				}
				return fileType;

			};

			//파일 사이즈 계산
			var sizeCal = function(){
				var data = this.size;
				var size = GO.util.getHumanizedFileSize(data);
				return size;
			};

			this.$el.find('#fileWrap').html(AttachesFileTpl({
				dataset : files,
				checkFileType : checkFileType,
				sizeCal : sizeCal,
				contextRoot : GO.contextRoot
			}));

			this.$el.find('#imgWrap').html(AttachesImgTpl({
				dataset : images,
				sizeCal : sizeCal
			}));
		},

		getTitle: function() {
			return this.docContents.getApprovalSubject();
		}
	});

	var MainView = Backbone.View.extend({
		el: '#content',
		initialize: function(options) {
			this.options = options || {};
			this.formId = this.options.formId;
			this.docId = this.options.docId;
			this.type = _.isUndefined(this.options.type) ? "DOCUMENT" : this.options.type;
			this.model = DocumentViewModel.create(this.docId);
			this.documentInit();
			this.unbindEvent();
			this.bindEvent();
			this.commentsView = new CommentsView({
				docId : this.docId,
				dateFormat : 'basicDate',
				comments : this.model.comments
			});
		},

		render: function() {
			this.allowAction = true;
			if (this.model.get('document') == null) {
				return;
			}
			this.$el.html(MainTpl({
				lang : lang
			}));
			this.$el.prepend(ToolbarTpl({lang : lang})); //content보다 상위에 toolbar가 위치하는 마크업이므로 parent에 render한다.
			this.assign(this.documentView, 'div.approval_type');
			this.append(this.apprFlowView, 'div.doc-meta-container');
			this.commentsView.setElement($(this.el).parent().find('#commentSection')).render();
			this.setReadOnlyModeCommentView(this.commentsView);
			this.setApprFlowStyle();
			this.toggleDisplay();
			$("body").addClass("print");
			if (GO.util.isIE8()) {
				$("body").css("min-width", "300px");
			}
		},

		unbindEvent : function() {
			this.$el.parent().off("click","#toolbar input[type='chk']");
			this.$el.parent().off("click","#printDoc");
		},
		bindEvent : function() {
			this.$el.parent().on("click", "#toolbar input[name='chk']", $.proxy(this.toggleDisplay, this));
			this.$el.parent().on("click", "#printDoc", $.proxy(this.printDoc, this));
		},

		setReadOnlyModeCommentView : function(commentsView){
			var htmls = [
				'<li class="view_option" data-role="button" style="display:">',
				'    <span class="ic_classic ic_reply"></span>',
				'<span class="txt_b">{{lang.댓글}}<span class="num" id="replyCount">{{commentsCount}}</span></span>',
				'</li>'
			];
			var compiled = Hogan.compile(htmls.join(''));
			commentsView.$el.find('ul.reply').prepend(compiled.render({
				lang: lang,
				commentsCount : this.model.get('document').comments.length
			}));
			commentsView.$el.find('#comment_creat').remove();
			commentsView.$el.find('.btn_wrap').remove();
		},

		printDoc : function(){
			GO.util.print(this.$el);
		},

		toggleDisplay : function(){
			var isCommentChk = $('#commentChecked').is(':checked');
			var isApprChk = $('#apprChecked').is(':checked');
			if(isApprChk){
				$(this.el).find('#apprSection').show();
			}else{
				$(this.el).find('#apprSection').hide();
			}

			if(isCommentChk){
				$(this.el).find('#commentSection').show();
			}else{
				$(this.el).find('#commentSection').hide();
			}
		},

		docInitError: function(msg, title) {
			var self = this;
			var callbackFunc = function() {
				if (self.options.isPopup) {
					window.close();
				} else {
					self.navigateToBackList();
				}
			};
			$.goAlert(approvalLang['결재문서를 열람할 수 없습니다.'], msg, null, commonLang['닫기'], callbackFunc);
		},

		documentInit: function(){
			var self = this;

			this.model.fetch({
				async: false,
				success: function(model, result) {
					self.title = _.isUndefined(model.get('document').title) ? model.get('document').formName : model.get('document').title;
					self.initDocument();
				},
				error: function(model, rs){
					var msg = commonLang['500 오류페이지 내용'];
					if ($.parseJSON(rs.responseText).message) {
						msg = $.parseJSON(rs.responseText).message;
					}
					if (rs.status == 400) {
						self.docInitError(msg);
					}
					if (rs.status == 403) {
						self.docInitError(approvalLang['조회권한없음']);
					}
					if (rs.status == 404) {
						self.docInitError(msg);
					}
					if (rs.status == 500) {
						self.docInitError(msg);
					}
					if (rs.status != 400 && rs.status != 403 && rs.status != 404 && rs.status != 500) {
						self.docInitError(msg);
					}
				},
				reset: true
			});
		},

		initDocument: function() {
			this.docId = this.model.get('document').documentId;
			this.documentView = new DocumentView({
				type : this.type,
				docId: this.model.get('document').documentId,
				model: this.model.get('document'),
				apprFlowModel : this.model.get('apprFlow'),
				userApprSettingModel: this.model.get('userApprSetting'),
				infoData : this.model.get("docInfo"),
				isPopup : this.options.isPopup
			});
			this.apprFlowView = new ApprFlowView({
				type : this.type,
				docId: this.model.get('document').documentId,
				model: new ApprFlowModel(this.model.get('apprFlow'))
			});
		},

		setApprFlowStyle : function(){
			var htmls = [
				'<li class="view_option" data-role="button" style="display:">',
				'    <span class="ic_classic ic_reply"></span>',
				'<span class="txt_b">{{lang.결재의견}}<span class="num">{{activityCount}}</span></span>',
				'</li>'
			];

			var activityCount = 0;

			_.each(this.model.get('apprFlow').activityGroups, function(item, key) {
				_.each(item.activities, function(v, i){
					activityCount++;
				});
            });
            var compiled = Hogan.compile(htmls.join(''));
            this.$('div.doc-meta-container .reply').prepend(compiled.render({ lang: lang, activityCount : activityCount}));
            var html = this.$('div.doc-meta-container').find('form').html(); //ApprFlow View를 공유해서 쓰는데 form태그가 있으면 프린트창에서는 UI가 깨짐
            this.$('div.doc-meta-container').find('form').replaceWith(html);
        },

        append: function(view, selector) {
            this.$(selector).append(view.render().el);
        },

        assign: function(view, selector) {
            view.setElement(this.$(selector)).render();
        },

        prepend: function(view, selector) {
            this.$(selector).prepend(view.render().el);
        }
    });

    return MainView;

});
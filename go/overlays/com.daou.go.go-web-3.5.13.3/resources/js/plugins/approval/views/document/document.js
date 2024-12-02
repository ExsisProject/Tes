define([
    "jquery",
    "underscore",
    "backbone",
	"when",

    "hgn!approval/templates/document/document",
    "hgn!approval/templates/document/attach_file_view",
	"hgn!approval/templates/document/attach_file_inprogress",
    "hgn!approval/templates/doc_attaches_file",
    "hgn!approval/templates/doc_attaches_img",
    "hgn!approval/templates/document/reference_doc_view",

    "approval/models/document",
    "approval/models/ref_document",
    "approval/views/document/comments",
    "approval/views/document/actcopy",
    "approval/views/document/actcopy_list",
    "approval/views/document/related_document_attach",
    "approval/views/document/document_print",

	"i18n!nls/commons",
    "i18n!approval/nls/approval",
    "file_upload",
    "content_viewer",
	"approval/views/document/attach_file",

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

	DocumentTpl,
	AttachFileTpl,
	AttachFileInprogressTpl,
	AttachesFileTpl,
    AttachesImgTpl,
	ReferenceDocumentTpl,

	DocumentModel,
	RefDocumentModel,
	CommentsView,
	ActCopyView,
	ActCopyLayerView,
	RelatedDocumentAttachView,
	DocumentPrintView,

	commonLang,
    approvalLang,
    FileUpload,
    ContentViewer,
	ApprAttachFileView
) {
	var lang = {
		'img_attach': commonLang['이미지 첨부'],
		'file_attach': commonLang['파일첨부'],
		'del': commonLang['삭제'],
		'confirm': commonLang['확인'],
		'cancel': commonLang['취소'],
		'save': commonLang['저장'],
		'noti': commonLang['알림'],
		'doc_search': approvalLang['문서 검색'],
		'attach_file': approvalLang['첨부파일'],
		'ref_doc': approvalLang['관련문서'],
		'view': approvalLang['보기'],
		'preview': approvalLang['미리보기'],
		'download': commonLang["다운로드"],
		'amt': approvalLang['개'],
		'msg_no_approval_document': approvalLang['결재 문서를 선택해 주세요'],
		'msg_duplicate_approval_document': approvalLang['중복된 관련문서가 있습니다'],
		'댓글': approvalLang['댓글'],
		'원본문서': approvalLang['원본문서'],
		'문서추가': approvalLang['문서 추가'],
		'이 곳에 파일을 드래그 하세요': commonLang['이 곳에 파일을 드래그 하세요'],
		'이 곳에 파일을 드래그 하세요 또는': commonLang['이 곳에 파일을 드래그 하세요 또는'],
		'파일선택': commonLang['파일선택'],
		'첨부파일 1개의 최대 용량은 NNN MB 이며 최대 N개 까지 등록 가능합니다':
			GO.i18n(commonLang["첨부파일 1개의 최대 용량은 {{size}} MB 이며 최대 {{number}} 개 까지 등록 가능합니다"],
				{"size": GO.config('commonAttachConfig').maxAttachSize, "number": GO.config('commonAttachConfig').maxAttachNumber})
	};
	
	var APPROVAL_EDITOR_CONTENT_MARGIN = "body {margin: 0px;}";

	var DocumentView = Backbone.View.extend({
		events : {
			'click span#addRelatedDocument' : 'onAddRelatedDocumentClicked',
			'click span.ic_del' : 'attachDelete',
			'click #refDocPart a.btn_fn4' : 'refPreviewBtnClicked',
			'click #refDocPart span.name' : 'refPreviewTitleClicked',
			'click #refDoc a.btn_fn4' : 'refPreviewBtnClicked',
			'click #refDoc span.name' : 'refPreviewTitleClicked',
			'click a[data-func="preview"]' : 'attachPreview',
			'click a[data-func="tempPreview"]' : 'tempAttachPreview',
			'click span#addReceptionOriginDocument' : 'onClickAddReceptionOriginDocument',

			'dragover #dropZone': '_dragOver',
			'dragleave #dropZone': '_dragLeave',
			'drop #dropZone': '_drop',
		},

		initialize: function (options) {
			this.options = options || {};
			this.formOpts = {};
			_.bindAll(this, 'render', 'setNewFormMode', 'setEditMode', 'setViewMode');
			this.docType = this.options.type;
			this.docId = this.options.docId;
			this.docModel = this.options.model;
			this.infoModel = this.options.infoData;
			this.actionModel = this.options.actionModel;
			this.userApprSettingModel = this.options.userApprSettingModel;
			this.mode = 'VIEW';	// 'NEW', 'VIEW', 'EDIT'
			this.isPreview = this.options.isPreview;
			this.originalDocId = this.options.originalDocId;
			this.isBrowseByReference = this.options.refDocId != undefined;
			this.formIntegrator = this.options.formIntegrator || {};
			this.commentsView = new CommentsView({
				docId: this.docId,
				comments: this.docModel.comments,
				originalDocId: this.originalDocId,
				isBrowseByReference: this.isBrowseByReference,
			});
			this.isSaaS = GO.session().brandName == "DO_SAAS";
			this.totalAttachSize = 0;
			this.totalAttachCount = 0;


		},

		render: function() {
			var self = this;
			var formScriptType = this.infoModel['formScriptType'];
			var moduleName = this.infoModel['externalScript'];
			var scriptBody = this.infoModel['scriptBody'];

			//EDIT MODE
			this.$el.html(DocumentTpl({
				lang: lang,
				data: this.docModel,
				isDraftType: this.docModel.docType == 'DRAFT',
				isSaaS: this.isSaaS,
				refDocs: function () {
					var recepOriginDoc = self.docModel.receptionOrigin;
					if (!recepOriginDoc || 0) {
						return self.docModel.references;
					}
					return _.filter(self.docModel.references, function (refDoc) {
						return refDoc.id != recepOriginDoc.id;
					});
				},
				recpOriginInRefDocs: function () {
					var recepOriginDoc = self.docModel.receptionOrigin;
					return _.find(self.docModel.references, function (refDoc) {
						return refDoc.id == recepOriginDoc.id;
					});
				}
			}));

			this.docContents = $('#document_content');
			this.initFileUpload();
			this.initAttachFileView();

			//VIEW MODE
			this.$el.find('div#attachView').append(ReferenceDocumentTpl({
				lang: lang,
				data: function () {
					var receptionOrigin = self.docModel.receptionOrigin;
					if (!receptionOrigin || 0) { // 원본문서가 존재하지 않을 경우(기안문서)
						return {references: self.docModel.references};
					}

					//관련문서는 원본문서도 포함할수 있다.
					//실제 수신문서의 entity에는 원본문서(receptionOrigin)가 존재하지만 관련문서(references)에 추가하여 보여주고 있음
					return {
						references: _.filter(self.docModel.references, function (referenceDocument) {
							return referenceDocument.id != receptionOrigin.id;
						}),
						receptionOriginInReferences: _.find(self.docModel.references, function (referenceDocument) {
							return referenceDocument.id == receptionOrigin.id;
						})
					};
				}
			}));

			this.formOpts = {
				data: this.docModel.docBodyContent,
				contextRoot: '/',
				userId: this.docModel.drafterId,
				userProfileApi: 'api/user/profile',
				docType: this.docModel.docType,
				draftDate: this.docModel.draftedAt ?
					GO.util.formatDatetime(this.docModel.draftedAt, null, "YYYY-MM-DD(ddd)") :
					GO.util.formatDatetime(GO.util.toISO8601(new Date()), null, "YYYY-MM-DD(ddd)")
			};

			if (this.isPreview) {
				this.commentsView.setElement($(this.el).find('section.article_reply')).render();
			} else {
				if (this.docModel.docStatus == "CREATE" || this.docModel.docStatus == "TEMPSAVE") {

					this.setDocumentTemplate(_.clone(this.formOpts));

					if (formScriptType == 'SRC' && !_.isEmpty(moduleName)) {
						this.renderIntegrationByExternalScript({mode: 'create', moduleName: moduleName});
					} else if (formScriptType == 'EDIT' && !_.isEmpty(scriptBody)) {
						this.renderIntegrationByScriptText({mode: 'create', scriptBody: scriptBody});
					} else {
						this.onNewFormMode();
					}
				} else {
					if (formScriptType == 'SRC' && !_.isEmpty(moduleName)) {
						this.renderIntegrationByExternalScript({mode: 'view', moduleName: moduleName});
					} else if (formScriptType == 'EDIT' && !_.isEmpty(scriptBody)) {
						this.renderIntegrationByScriptText({mode: 'view', scriptBody: scriptBody});
					} else {
						this.onViewMode();
					}
				}
			}

			return this;
		},

		_dragOver: function (e) {
			e.preventDefault();
			e.stopPropagation();
			e.originalEvent.dataTransfer.dropEffect = 'move';
			$("#dropZone").addClass('drag_file');
		},

		_dragLeave: function (e) {
			e.preventDefault();
			e.stopPropagation();
			$("#dropZone").removeClass('drag_file');
		},

		_drop: function (e) {
			e.preventDefault();
			e.stopPropagation();
			$("#dropZone").removeClass('drag_file');
		},

		// GO-23996
		setCustomApprovalData: function () {
			var setData = {
				preserveDuration: $("#docYear option:selected").text() || this.convertPreserveYears(this.infoModel.docYear),
				securityLevel: $("#infoSecurityLevel option:selected").text() || this.infoModel.securityLevelName
			};
			this.setApprovalData(setData);
		},

		convertPreserveYears: function (year) {
			return (year == 0) ? approvalLang['영구'] : year + approvalLang['년']
		},

		setDocumentTemplate: function (formOpts) {
			GO.util.store.set('document.docMode', "EDIT", {type: 'session'});
			GO.util.store.set('apprConfig.multiCompanySupporting', this.actionModel.multiCompanySupporting, {type: 'session'});
			var editModeTemplateOpt = formOpts;
			editModeTemplateOpt['angleBracketReplace'] = false;
			this.docContents.setTemplate(editModeTemplateOpt);
		},

		renderIntegrationByExternalScript: function (option) {
			var self = this;
			var moduleName = option.moduleName;
			var mode = option.mode;
			var integrationView = null;
			if (!_.isEmpty(moduleName)) {
				require([moduleName], function (Integration) {
					if (!_.isUndefined(Integration)) {
						integrationView = new Integration({
							variables: _.clone(self.docModel.variables),
							docModel: self.docModel,
							infoData: self.infoModel
						});
						if (mode == 'create') {
							if (_.isFunction(integrationView.render)) {
								integrationView.render();
							}
							self.formIntegrator.setIntegrationView(integrationView);
							self.onNewFormMode();
						} else if (mode == 'view') {
							self.onViewMode(); //GO-21704 양식 스크립트 방식 개선 : 화면이 그려진 상태에서 실행하도록 개선
							if (_.isFunction(integrationView.renderViewMode)) {
								integrationView.renderViewMode();
							}
							self.formIntegrator.setIntegrationView(integrationView);
							// GO-23996
							self.setCustomApprovalData();
						}
					}
				});
			} else {
				console.log('module name Empty!!');
			}
		},

		renderIntegrationByScriptText: function (option) {
			var self = this;
			var mode = option.mode;
			var scriptBody = option.scriptBody;
			var integrationView;
			var integrationFn = new Function(scriptBody);

			if (integrationFn) {
				var returnView = new integrationFn();
				integrationView = new returnView({
					variables: _.clone(self.docModel.variables),
					docModel: self.docModel,
					infoData: self.infoModel
				});
				if (mode == 'create') {
					if (_.isFunction(integrationView.render)) {
						integrationView.render();
					}
					this.formIntegrator.setIntegrationView(integrationView);
					this.onNewFormMode();
				} else if (mode == 'view') {
					self.onViewMode(); //GO-21704 양식 스크립트 방식 개선 : 화면이 그려진 상태에서 실행하도록 개선
					// GO-23996 공문서 인쇄시 보존년한 0년 처리
					if (_.isFunction(integrationView.renderViewMode)) {
						integrationView.renderViewMode();
					}
					self.formIntegrator.setIntegrationView(integrationView);
					// DOCUSTOM-8774
					self.setCustomApprovalData();
				}
			} else {
				console.log('scriptBody is Empty');
			}
		},

		onNewFormMode: function () {
			if (this.docModel.docStatus == "CREATE") {
				this.docContents.setDocVariables(this.docModel.variables); //임시 저장문서에서는 다시 docVariable를 셋팅하지 않음
			}
			this.setNewFormMode();
			this.setAttaches();
			$('.fancybox-thumbs').goFancybox();
		},

		onViewMode: function () {
			this.commentsView.setElement($(this.el).find('section.article_reply')).render();
			this.setViewMode();
			this.setAttaches();
			$('.fancybox-thumbs').goFancybox();
		},

		remove: function () {
			Backbone.View.prototype.remove.apply(this, arguments);
			$(window).off('resize.appr.document');
		},

		initAttachFileView: function () {
			ApprAttachFileView.appendTo(this.$el.find('#attachView'), this.docModel.attaches, this.userApprSettingModel, this.docId,
				{
					originalDocId: this.originalDocId,
					isBrowseByReference: this.isBrowseByReference,
				});
		},

		_reloadAttachArea: function (data) {
			this.model.attaches = data.data.document.attaches;
			this.setAttaches();
		},

		initFileUpload: function () {
			var button_width = "";
			if (GO.config("locale") == 'en') {
				button_width = "57";
			} else if (GO.config("locale") == 'ko') {
				button_width = "73";
			} else { //cn, ja
				button_width = "65";
			}

			//DOCUSTOM-5963 IE9 에서 button mode를 바꿔야함
			var useButtonWindow = GO.util.useButtonWindow();
            var self = this;
			var options = {
				el: "#swfupload-control",
				context_root: GO.contextRoot,
				button_width: button_width,
				useButtonWindow: useButtonWindow,
				button_title: lang["파일선택"],
				button_text: "<span class='txt'>" + lang["파일선택"] + "</span>",
				url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
				textTmpl: [
					"<span class='btn_file''>",
						"{text}",
						"<input type='file' name='file' title='{title}' multiple='' accept={accept} />",
					"</span>"
				].join(""),
				dropZone: "#dropZone",
				progressEl: "div.progress"
			};

			if (useButtonWindow) {
				options['button_height'] = 26;
			}

			var maxAttachSize = parseInt(GO.config('commonAttachConfig').maxAttachSize);
			var maxAttachByteSize = maxAttachSize * 1024 * 1024;
			var maxAttachNumber = parseInt(GO.config('commonAttachConfig').maxAttachNumber);

            (new FileUpload(options))
			.queue(function (e, data) {

            })
            .start(function (e, data) {
				if (!GO.config('attachFileUpload')) {
					$.goAlert(commonLang['파일첨부용량초과']);
					self.$("#dropZone").removeClass('drag_file');
					return false;
				}

                if (GO.config('excludeExtension') && !_.isUndefined(data.type)) {
                    var index = $.inArray(data.type.substr(1).toLowerCase(), GO.config('excludeExtension').split(','));
                    if (index >= 0) {
                        $.goMessage(GO.i18n(commonLang['확장자가 땡땡인 것들은 첨부 할 수 없습니다.'], "arg1", GO.config('excludeExtension')));
                        return false;
                    }
                }

				if (self.isSaaS) {
					if (maxAttachByteSize < data.size) {
						$.goMessage(GO.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
						self.$("#dropZone").removeClass('drag_file');
						return false;
					} else {
						self.totalAttachSize += data.size;
					}

					var currentTotalAttachCount = $('#fileWrap').children().size() + $("#imgWrap").children().size() + self.totalAttachCount + 1;
					if (maxAttachNumber < currentTotalAttachCount) {
						$.goMessage(GO.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
						self.$("#dropZone").removeClass('drag_file');
						return false;
					} else {
						self.totalAttachCount++;
					}
				}
			})
            .progress(function (e, data) {

            })
            .success(function (e, serverData, fileItemEl) {
				var alertMessage = "";
				var attachClass = "";

				if (GO.util.fileUploadErrorCheck(serverData)) {
					alertMessage = "<strong class='caution'>" + GO.util.serverMessage(serverData) + "</strong>";
					attachClass = "attachError";
				} else {
					if (GO.util.isFileSizeZero(serverData)) {
						$.goAlert(GO.util.serverMessage(serverData));
						return false;
					}
				}

				var data = serverData.data;
				var tmpName = data.filePath;
				var name = data.fileName;
				var extention = data.fileExt;

				var specific = {};
				var common = {
					lang: lang,
					attachClass: attachClass,
					tmpName: tmpName,
					name: name,
					hostId: data.hostId,
					size: data.fileSize,
					humanSize: GO.util.getHumanizedFileSize(data.fileSize),
				};

				if (GO.util.isImage(extention)) {
					specific = _.extend({
						isImage: true,
						thumbnail: data.thumbnail,
					}, common);
					$("#imgWrap").append(AttachFileInprogressTpl(specific));
				} else {
					specific = _.extend({
						isImage: false,
						fileType: GO.util.getFileIconStyle({extention : data.fileExt}),
						usePreview: data.preview,
						useDownload: true,
						previewURL: GO.contextRoot + 'api/approval/attach/temp/' + encodeURI(encodeURIComponent(name)) + tmpName,
						alertMessage: alertMessage
					}, common);
					$("#fileWrap").append(AttachFileInprogressTpl(specific));
				}

				self.setViewedTotalAttachSize();
				self.resetAttachSizeAndCount();
            })
			.complete(function (e, data) {
				console.info(data);
				var attachNames = self.getAttachNames();
				self.setAttachFile(attachNames);
			})
			.error(function (e, data) {
				if(data.jqXHR) {
					if(data.jqXHR.statusText == "abort") {
						$.goAlert(commonLang['취소되었습니다.']);
					} else {
						$.goAlert(commonLang['업로드에 실패하였습니다.']);
					}
					self.resetAttachSizeAndCount();
				}
			});
		},

		getViewedTotalAttachSize: function () {
			var viewedTotalAttachSize = 0;
			$("#fileWrap, #imgWrap").find('li').each(function () {
				viewedTotalAttachSize += parseInt(this.getAttribute('data-size'), 0);
			});
			return viewedTotalAttachSize;
		},

		setViewedTotalAttachSize: function () {
			if (this.isSaaS) {
				var current = this.getViewedTotalAttachSize();
				this.$el.find("#total_size").html(GO.util.displayHumanizedAttachSizeStatus(current));
			}
		},

		resetAttachSizeAndCount: function () {
			if (this.isSaaS) {
				this.totalAttachSize = 0;
				this.totalAttachCount = 0;
			}
		},

		getAttachNames: function () {
			var attachNames = [];
			$("#fileWrap").find('li').each(function () {
				attachNames.push(this.getAttribute('data-name'));
			});
			$("#imgWrap").find('li').each(function () {
				attachNames.push(this.getAttribute('data-name'));
			});
			return attachNames.join(", ");
		},

		setAttaches: function () {
			var docId = this.docId;
			var images = [];
			var files = [];

			$.each(this.model.attaches, function (k, v) {
				if (v.thumbSmall) {
					images.push(v);
				} else {
					var file = v;
					file.filePath = GO.contextRoot + 'api/approval/document/' + docId + '/download/' + v.id;
					files.push(file);
				}
			});

			var checkFileType = function () {
				var fileType = "def";
				if (GO.util.fileExtentionCheck(this.extention)) {
					fileType = this.extention;
				}
				return fileType;
			};

			//파일 사이즈 계산
			var sizeCal = function () {
				var data = this.size;
				var size = GO.util.getHumanizedFileSize(data);
				return size;
			};

			this.$el.find('#fileWrap').html(AttachesFileTpl({
				dataset: files,
				checkFileType: checkFileType,
				sizeCal: sizeCal,
				lang: lang
			}));

			this.$el.find('#imgWrap').html(AttachesImgTpl({
				dataset: images,
				sizeCal: sizeCal
			}));

			this.setViewedTotalAttachSize();
		},

		attachDelete: function (e) {
			$(e.target).parents('li').first().remove();

			if ($("#optionStreamDisplay").find('li').length < 1) {
				$("#optionStreamDisplay").removeClass("option_display");
				$("#optionStreamDisplay").css("height", "1px");
			}
			var attachNames = this.getAttachNames();
			this.setAttachFile(attachNames);
			this.setViewedTotalAttachSize();
		},

		actCopy: function (e) {
			var self = this;
			var documentModel = DocumentModel.create(this.docId);
			documentModel.fetch({async: false});

			var apprFlow = documentModel.get('apprFlow');

			var actCopyLayer = $.goPopup({
				"pclass": "layer_normal layer_doc_choice",
				"header": approvalLang["시행문 양식 선택"],
				"modal": true,
				"width": 700,
				"contents": "",
				"buttons": [{
					'btext': commonLang["확인"],
					'btype': 'confirm',
					'autoclose': false,
					'callback': function (rs) {
						var actCopyFormId = (rs.find('.on').children('a').children('span[data-id]')).attr('data-id');
						if (!actCopyFormId) {
							$.goError(approvalLang['양식을 선택해 주세요.']);
							return false;
						} else {
							var actCopyView = new ActCopyView({
								docId: self.docId,
								actCopyFormId: actCopyFormId,
								infoModel: self.infoModel,
								apprFlow: apprFlow,
								isPopup: self.options.isPopup
							});
							actCopyView.render();
							rs.close();
						}
					}
				}, {
					'btext': commonLang["취소"],
					'btype': 'cancel'
				}]
			});

			var actCopyLayerView = new ActCopyLayerView({});
			actCopyLayerView.render();
			actCopyLayer.reoffset();
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
							templete = '<li data-id="'+ids[i]+'" data-name="'+title[i]+'">'+
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
				}, {
					'btext' : commonLang["취소"],
					'btype' : 'cancel'
				}]
			});

			var relatedDocumentAttachView = new RelatedDocumentAttachView({});
			
			relatedDocumentAttachView.render();
			relatedDocumentAttachLayer.reoffset();
		},
		
		onClickAddReceptionOriginDocument : function(e) {
			$('#receptionOriginDocPart td').empty();
			var receptionOrigin = this.docModel.receptionOrigin;
			var template = '<div class="file_wrap feed">' +
				'<ul class="file_wrap">' +
					'<li data-id="'+receptionOrigin.id+'" data-name="'+receptionOrigin.title+'">' +
						'<span class="item_file">' +
							'<span class="name">['+receptionOrigin.docNum+'] '+receptionOrigin.title+'</span>' +
							'<span class="optional">' +
		                        '<a class="btn_fn4"><span class="txt">'+lang.preview+'</span></a>' +
		                        '<span class="btn_wrap" title="'+lang.del+'">' +
		                            '<span class="ic_classic ic_del"></span>' +
		                        '</span>' +
		                    '</span>' +
						'</span>' +
					'</li>' +
				'</ul>' +
			'</div>';
			$('#receptionOriginDocPart td').append(template);
		},

		refDocDelete : function(e){ 
			$('#receptionOriginDocPart td').empty();
			var template = '<span class="wrap_btn wrap_file_upload">' +
				'<span class="btn_minor_s fileinput-button" id="addReceptionOriginDocument">' +
					'<span class="buttonText">'+lang.문서추가+'</span>' +
				'</span>' +
			'</span>';
			$('#receptionOriginDocPart td').append(template);
		},

		attachPreview: function (e) {
			var currentEl = $(e.currentTarget);
			GO.util.preview(currentEl.attr("data-id"));
			return false;
		},

		tempAttachPreview: function (e) {
			var currentEl = $(e.currentTarget).closest('li');
			var opts = _.extend({}, {
				filePath: currentEl.attr('data-tmpname'),
				fileName: currentEl.find('span.name').text()
			});
			GO.util.previewTempFile(opts);
			return false;
		},

		refPreviewBtnClicked: function (e) {
			var refDocId = $(e.currentTarget).parents('li').data('id');
			this.previewRefDoc(refDocId);
		},

		refPreviewTitleClicked: function (e) {
			this.refPreviewBtnClicked(e);
		},

		previewRefDoc: function (refDocId) {
			var url = window.location.protocol + "//" +
				window.location.host + GO.contextRoot +
				"app/approval/document/" + this.docId + "/preview/reference/" + refDocId;
			window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
		},

		setNewFormMode: function () {
			this.mode = 'NEW';
			$(this.el).find('div#editView').show();
			$(this.el).find('div#attachView').hide();
			$(this.el).find('section.article_reply').hide();
		},

		setEditMode: function (isAdmin) {
			this.mode = 'EDIT';
			this.formOpts['isAdmin'] = _.isUndefined(isAdmin) ? false : isAdmin;
			$(this.el).find('div#editView').show();
			$(this.el).find('div#attachView').hide();
			$(this.el).find('section.article_reply').show();
			GO.util.store.set('document.docMode', this.mode, {type: 'session'});
			this.docContents.setTemplate(this.formOpts);
		},

		setViewMode: function () {
			this.mode = 'VIEW';
			GO.util.store.set('document.docMode', this.mode, {type: 'session'});
			$(this.el).find('div#editView').hide();
			$(this.el).find('div#attachView').show();
			$(this.el).find('section.article_reply').show();
			var content = $.goFormUtil.convertViewMode(this.docModel.docBodyContent);
			this.docContents.html(content);
			var style = _.map(this.docContents.find("style"), function (style) {
				return $(style).html();
			}).join("");
			_.each(this.docContents.find("span[data-dsl*='editor']"), function (el) {
				var $el = $(el);
				ContentViewer.init({
					$el: $el,
					content: GO.util.escapeXssFromHtml($el.html()),
					style: style + APPROVAL_EDITOR_CONTENT_MARGIN
				});
			});
		},

		_setPreviewModeContent: function (contents) {
			this.mode = 'VIEW';
			var content = $.goFormUtil.convertViewMode(contents);
			this.docContents.html(content);
			if (GO.util.isIE8()) {
				$("body").css("min-width", "300px");
			}
			$(this.el).find('div#editView').remove();
			$(this.el).find('div#attachView').remove();
			$(this.el).find('section.article_reply').remove();
		},

		setPreviewMode: function (contents) {
			var formScriptType = this.infoModel['formScriptType'];
			var moduleName = this.infoModel['externalScript'];
			var scriptBody = this.infoModel['scriptBody'];
			var self = this;

			if (formScriptType == 'SRC' && !_.isEmpty(moduleName)) {
				var mode = 'view';
				var integrationView = null;
				if (!_.isEmpty(moduleName)) {
					require([moduleName], function (Integration) {
						if (!_.isUndefined(Integration)) {
							integrationView = new Integration({
								variables: _.clone(self.docModel.variables),
								docModel: self.docModel,
								infoData: self.infoModel
							});

							self._setPreviewModeContent(contents);

							if (_.isFunction(integrationView.renderViewMode)) {
								integrationView.renderViewMode();
							}
						}
					});
				} else {
					console.log('module name Empty!!');
				}
			} else if (formScriptType == 'EDIT' && !_.isEmpty(scriptBody)) {
				var mode = 'view';
				var integrationView;
				var integrationFn = new Function(scriptBody);
				if (integrationFn) {
					var returnView = new integrationFn();
					integrationView = new returnView({
						variables: _.clone(self.docModel.variables),
						docModel: self.docModel,
						infoData: self.infoModel
					});

					self._setPreviewModeContent(contents);

					if (_.isFunction(integrationView.renderViewMode)) {
						integrationView.renderViewMode();
					}
				} else {
					console.log('scriptBody is Empty');
				}
			} else {
				self._setPreviewModeContent(contents);
			}
		},

		getTitle: function () {
			return this.docContents.getApprovalSubject().replace(/\s+/g, " ");
		},

		getDocBodyContents: function () {
			if (this.mode == 'NEW' || this.mode == 'EDIT') {
				return this.docContents.getFormData();
			}
			return this.docModel.docBodyContent;
		},

		getDocVariables: function () {
			return this.docContents.getDocVariables();
		},

		changeActivityGroups: function (activityGroups, isReception) {
			$.fn.changeActivityGroups({
				groups: activityGroups,
				config: {
					activityBox: {
						headerType: this.actionModel.activityBoxHeaderType,
						bodyElement: {
							sign: this.actionModel.activityBoxContentSign,
							name: this.actionModel.activityBoxContentName,
							position: this.actionModel.activityBoxContentPosition,
							duty: this.actionModel.activityBoxContentDuty,
							dept: this.actionModel.activityBoxContentDept
						}
					},
					isReception: isReception,
					displayDrafter: this.infoModel.displayDrafter,
					includeAgreement: this.infoModel.includeAgreement
				}
			});
		},

		changeReferrenceReaders: function (referrenceReaders) {
			var $referrenceReaders = this.$el.find("[data-dsl='{{label:docReference}}']");

			if ($referrenceReaders.length < 1) {
				return;
			}

			var referrenceReadersArr = [];
			var referrenceReadersStr = "";
			_.each(referrenceReaders, function (referrenceReader) {
				var reader = referrenceReader.reader;
				if (reader.deptType) {
					referrenceReadersArr.push(reader.name);
				} else {
					referrenceReadersArr.push(reader.name + " " + reader.position);
				}
			});

			referrenceReadersStr = referrenceReadersArr.join(",");

			$.each($referrenceReaders, function () {
				$(this).val(referrenceReadersStr).attr("data-value", referrenceReadersStr);
			})
		},

		changeActivity: function (activity) {
			$.fn.changeActivity(activity);
		},

		setDocNum: function (data) {
			return this.docContents.setDocNo(data);
		},

		setApprovalData: function (data) {
			return this.docContents.setApprovalData(data);
		},

		setRecipient: function (data) {
			return this.docContents.setRecipient(data);
		},

		setPreserveDuration: function (data) {
			return this.docContents.setPreserveDuration(data);
		},

		setAttachFile: function (data) {
			return this.docContents.setAttachFile(data);
		},

		setSecurityLevel: function (data) {
			return this.docContents.setSecurityLevel(data);
		},

		setDocClassification: function (data) {
			return this.docContents.setDocClassification(data);
		},

		setDocReference: function (data) {
			return this.docContents.setDocReference(data);
		},

		isCompleteRequiredForm: function () {
			return this.docContents.isCompleteRequiredForm();
		},

		getMaxLengthCheck: function () {
			return this.docContents.getMaxLengthCheck();
		},

		setDocFocus: function (focusId) {
			$('#' + focusId).focus();
		}
	});

	return DocumentView;
});

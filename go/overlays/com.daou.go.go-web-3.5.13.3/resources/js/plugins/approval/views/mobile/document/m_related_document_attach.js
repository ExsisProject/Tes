define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    
	"views/mobile/layer_toolbar",
    "approval/views/mobile/m_reference_doclist_item",
	"approval/views/mobile/document/m_appr_company_folder_tree",

    "approval/collections/draft_doclist",
    "approval/collections/appr_doc_list",
    "approval/collections/viewer_doclist",
    "approval/collections/reception_doclist",
    "approval/collections/dept_folder_doclist",
	"approval/collections/send_doclist",
	"approval/collections/user_folder_doclist",
	"approval/collections/share_folder_doclist",
	"approval/collections/company_doc_list",
	"approval/views/mobile/m_pagination",

	"hgn!approval/templates/mobile/m_doclist_empty",
	"hgn!approval/templates/mobile/document/m_related_document_attach",

    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    "jquery.jstree",
    "jquery.go-preloader"
],
function(
	$,
	_,
	Backbone,
	GO,
	
	LayerToolbarView,
	ReferenceDocListItemView,
	CompanyDocTreeTreeView,
	
	DocDraftCollection,
	ApprDocCollection,
	ViewerDocCollection,
	ReceptionDocCollection,
	DeptFolderDocCollection,
	SendDocCollection,
	UserFolderDocCollection,
	ShareFolderDocCollection,
	CompanyDocCollection,
	PaginationView,

	DocListEmptyTpl,
	MobileDocumentReferenceTpl,
    
	commonLang,
    approvalLang
) {
	var lang = {
		"이름" : commonLang['이름'],
		"부서명" : commonLang['부서명'],
		"이메일" : commonLang['이메일'],
		"검색" : commonLang['검색'],
		'개인 문서함' : approvalLang['개인 문서함'],
		"기안 문서함" : approvalLang['기안 문서함'],
		"결재 문서함" : approvalLang['결재 문서함'],
		"참조/열람 문서함" : approvalLang['참조/열람 문서함'],
		"수신 문서함" : approvalLang['수신 문서함'],
		'기안 완료함': approvalLang["기안 완료함"],
		'부서 참조함': approvalLang["부서 참조함"],
		'부서 수신함': approvalLang["부서 수신함"],
		'부서 문서함' : approvalLang["부서 문서함"],
		'문서번호' : approvalLang["문서번호"],
		'결재선' : approvalLang["결재선"],
		'company_docfolder' : approvalLang['전사 문서함'],
		'send_docfolder' : approvalLang['발송 문서함'],
		'added_docfolder' : approvalLang['추가된 문서함'],
		'shared_docfolder' : approvalLang['공유된 문서함'],
		'base_docfolder' : approvalLang['기본 문서함'],
		'결재 문서 첨부' : approvalLang['결재 문서 첨부'],
		'검색어를 입력해주세요' : commonLang['검색어를 입력해주세요.'],
		'결재양식' : approvalLang['결재양식'],
		'제목': commonLang['제목'],
		'개': commonLang['개'],
		'기안자': approvalLang['기안자'],
		'search_result' : commonLang['검색결과'],
		'select' : commonLang['선택']
	};

	var ApprSideModel = Backbone.Model.extend({
		url: '/api/approval/side'
	});

	var RelatedDocListItemView = ReferenceDocListItemView.extend({
		isReadable: false,//api를 호출하여 열람가능한지를 확인한 상태인지를 확인하는 flag

		events: function () {
			return _.extend({}, ReferenceDocListItemView.prototype.events, {
				'click input:checkbox': 'checkReadable'
			});
		},

		checkReadable: function (e) {
			var self = this;
			var el = $(e.currentTarget);
			if (!self.isReadable) { // api를 호출하여 권한이 있는 문서가 확인된 경우는 체크하지 않는다.
				var documentId = this.model.get('documentId');
				$.ajax({
					type: "GET",
					url: GO.contextRoot + "api/approval/document/" + documentId + "/readable",
					success: function () {
						self.isReadable = true;
					},
					error: function (response) {
						var result = JSON.parse(response.responseText);
						alert(result.message);
						$(el).prop('checked', false);
						self.isReadable = false;
					}
				});
			}
		}
	});

	var DocumentReferenceView = Backbone.View.extend({
		searchTreeView: null,
		formListView: null,
		initialize: function (options) {
			$('html').scrollTop(0);
			this.options = options || {};
			this.layerToolbarView = LayerToolbarView;
			this.isCheckboxVisible = _.isBoolean(options.isCheckboxVisible) ? options.isCheckboxVisible : false;
			this.collection = new DocDraftCollection();
			this.collection.setType("complete");
			this.collection.bind('reset', this.resetList, this);
			this.collection.setSort("latestActivityCompletedAt", "DESC");
			this.collection.fetch({
				statusCode: {
					403: function () {
						GO.util.error('403');
					},
					404: function () {
						GO.util.error('404', {"msgCode": "400-common"});
					},
					500: function () {
						GO.util.error('500');
					}
				}
			});
			this.docuName = lang["개인 문서함"];
			this.apprSideModel = new ApprSideModel();
			this.apprSideModel.fetch({async: false});
		},

		events: {
			'change #clickRefSide': 'clickRefSide',
			'vclick #search_icon': 'search',
			'keydown #search_title': 'searchEnter',
			'vclick .btn_del_type1': 'reset'
		},

		reset: function(e){
			$('html').scrollTop(0);
			$('#search_title').val('');

			this.collection = new DocDraftCollection();
			this.collection.setType("complete");
			this.collection.setSort("latestActivityCompletedAt", "DESC");

			this.collection.fetch({
				success: $.proxy(function (collection) {
					this.resetList(collection);
				}, this),
				error : function (collection, response, options) {
					preloader.release();
					GO.util.toastMessage(response.responseText);
				},
				statusCode: {
					403: function () {
						GO.util.error('403');
					},
					404: function () {
						GO.util.error('404', {"msgCode": "400-common"});
					},
					500: function () {
						GO.util.error('500');
					}
				}
			});
		},
		// 페이지 이동
		selectPage: function(pageNo) {
			this.collection.setPageNo(pageNo);

			var preloader = $.goPreloader();

			this.collection.fetch({
				beforeSend : function(){
					preloader.render();
				},
				success: $.proxy(function (collection) {
					this.resetList(collection);
				}, this)
			}).done(function(){
				console.info("done!!");
				preloader.release();
			});
		},

		render: function () {
			this.layerToolbarView.render(this.options.toolBarData);

			var addedFolder = false;
			if (this.apprSideModel.get('userFolders')) {
				addedFolder = (this.apprSideModel.get('userFolders').length > 0);
			}
			var sharedFolder = false;
			if (this.apprSideModel.get('sharedFoldersToUser')) {
				sharedFolder = (this.apprSideModel.get('sharedFoldersToUser').length > 0);
			}

			var dataset = this.deptFoldersData(this.apprSideModel.get('deptFolders'));

			var apprSideData = this.apprSideModel.toJSON();
			$.each(apprSideData.sharedFoldersToUser, function (i, v) {
				if (v.folderType == "USER") {
					v.isfolderTypeUser = true;
				} else {
					v.isfolderTypeUser = false;
				}
			});
			var tpl = MobileDocumentReferenceTpl({
				lang: lang,
				addedFolder: addedFolder,
				sharedFolder: sharedFolder,
				apprSideData: apprSideData,
				dataset: dataset,
				docu_name: this.docuName
			});
			this.$el.html(tpl);
			//모바일 페이징 추가
			$('.tb_doc_attach > tbody').html(DocListEmptyTpl({
				lang: {'doclist_empty': approvalLang['문서가 없습니다.']}
			}));
			this.dropDownCompanyDocRender();
		},

		renderPages: function() {
			this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
			var el = this.pageView.render().el;

			this.$el.find('div.paging br_no').remove();
			this.pageView.bind('paging', this.selectPage, this);
			this.$el.find('.list_box.list_apprChk').append(el);
		},
		deptFoldersData: function (deptFolders) {
			if (deptFolders.length) {
				$.each(deptFolders, function (index, deptFolder) {
					deptFolder.addedDeptFolder = deptFolder.deptFolders.length > 0;
					if (deptFolder.sharedDocFolders && deptFolder.sharedDocFolders.length > 0) {
						deptFolder.sharedDeptFolder = true;
						$.each(deptFolder.sharedDocFolders, function (i, folder) {
							folder.deptId = deptFolder.deptId;
							folder.isfolderTypeUser = folder.folderType == "USER";
						});
					} else {
						deptFolder.sharedDeptFolder = false;
					}
				});
			}
			return deptFolders;
		},

		dropDownCompanyDocRender: function () {
			this.companyDocTreeView = new CompanyDocTreeTreeView({
				isAdmin: false,
				disabledSelect: false,
				apiCommonUrl: 'api/docfolder/sidetree/all',
				treeElementId: 'companyDocTree'
			});
			this.companyDocTreeView.render();
		},

		clickRefSide: function (e) {
			var $e = $(e.currentTarget).find("option:selected");
			var optGroup = $e.closest("optgroup");

			var optGroupId = optGroup.attr("id");
			if (optGroupId == "userReference") {
				this.clickUserRefSide($e)
			} else if (optGroupId == "deptReference") {
				this.clickDeptRefSide($e)
			} else if (optGroupId == "companyDocSide") {
				this.clickCompanyRefSide($e)
			}
		},

		clickUserRefSide: function (e) {
			var currentTarget = e,
				type = currentTarget.attr("data-type"),
				folderType = currentTarget.attr("data-navi") == "shareuserdoc" ? "userfolder" : "deptfolder",
				collection = {
					"draft": new DocDraftCollection(),
					"sign": new ApprDocCollection(),
					"cc": new ViewerDocCollection(),
					"inbox": new ReceptionDocCollection(),
					"send": new SendDocCollection(),
					"userFolder": new UserFolderDocCollection({folderId: currentTarget.attr("data-id")}),
					"sharedFolder": new ShareFolderDocCollection({
						folderId: currentTarget.attr("data-id"),
						deptId: currentTarget.attr("data-deptid"),
						type: folderType,
						belong: currentTarget.attr("data-belong")
					})
				};

			this.collection = collection[type];
			if (type != "sharedFolder") {
				this.collection.setType("complete");
			}

			if (type == "cc") {
				this.collection.setSort("document.latestActivityCompletedAt", "DESC");
			} else {
				this.collection.setSort("latestActivityCompletedAt", "DESC");
			}

			var preloader = $.goPreloader();
			preloader.render();

			this.collection.bind('reset', this.resetList, this);
			this.collection.fetch({
				statusCode: {
					403: function () {
						GO.util.error('403');
					},
					404: function () {
						GO.util.error('404', {"msgCode": "400-common"});
					},
					500: function () {
						GO.util.error('500');
					}
				}
			}).done(function () {
				preloader.release();
			});
		},

		clickDeptRefSide: function (e) {
			var currentTarget = e,
				type = currentTarget.attr("data-type"),
				deptId = currentTarget.attr("data-deptid"),
				folderId = currentTarget.attr("data-folderId"),
				folderType = currentTarget.attr("data-navi") == "shareuserdoc" ? "userfolder" : "deptfolder",
				collection = {
					"draft": new DeptFolderDocCollection({deptId: deptId, type: "deptdraft"}),
					"cc": new DeptFolderDocCollection({deptId: deptId, type: "deptreference", status: "complete"}),
					"inbox": new ReceptionDocCollection("complete", deptId),
					"folder": new DeptFolderDocCollection({folderId: folderId, deptId: deptId, type: "deptfolder"}),
					"sharedFolder": new ShareFolderDocCollection({
						folderId: folderId,
						deptId: deptId,
						type: folderType,
						belong: currentTarget.attr("data-belong")
					})

				};

			this.collection = collection[type];

			var preloader = $.goPreloader();

			if (type == "cc") {
				this.collection.setSort("document.latestActivityCompletedAt", "DESC");
			} else {
				this.collection.setSort("latestActivityCompletedAt", "DESC");
			}

			this.collection.bind('reset', this.resetList, this);
			this.collection.fetch({
				beforeSend: function () {
					preloader.render();
				},
				statusCode: {
					403: function () {
						GO.util.error('403');
					},
					404: function () {
						GO.util.error('404', {"msgCode": "400-common"});
					},
					500: function () {
						GO.util.error('500');
					}
				}
			}).done(function () {
				console.info("done!!");
				preloader.release();
			});
		},

		clickCompanyRefSide: function (e) {
			var currentTarget = e,
				id = currentTarget.attr("data-id"),
				collection = new CompanyDocCollection();

			collection.setFolderId(id);
			this.collection = collection;
			this.collection.setSort("latestActivityCompletedAt", "DESC");
			var preloader = $.goPreloader();
			preloader.render();

			this.collection.bind('reset', this.resetList, this);
			this.collection.fetch({
				statusCode: {
					403: function () {
						GO.util.error('403');
					},
					404: function () {
						GO.util.error('404', {"msgCode": "400-common"});
					},
					500: function () {
						GO.util.error('500');
					}
				}
			}).done(function () {
				preloader.release();
			});
		},

		resetList: function (doclist) {
			$('.docu_list > ul').empty();
			$('.docu_name').text($('#clickRefSide option:selected').parent().attr("label"));

			var isCheckboxVisible = this.isCheckboxVisible;
			doclist.each(function (doc) {
				var docListItemView = new RelatedDocListItemView({
					model: doc,
					isShowUrl: false,
					isCheckboxVisible: isCheckboxVisible,
					isRelateDocumentItem: true
				});
				$('.docu_list > ul').append(docListItemView.render().el);

			});
			if (doclist.length == 0) {
				$('.docu_list > ul').html(DocListEmptyTpl({
					lang: {'doclist_empty': approvalLang['문서가 없습니다.']}
				}));
			}

			if (doclist.length != 0){
				this.renderPages();
			}
		},

		search: function () {
			var keywordEl = this.$el.find("#search_title");
			var searchType = this.$el.find("#referenceSearchType").val();
			this.collection.setSearch(searchType, keywordEl.val());
			this.collection.fetch({
				success: $.proxy(function (collection) {
					this.resetList(collection);
				}, this)
			});
		},

		searchEnter: function (e) {
			if (e.keyCode == "13") {
				this.search();
			}
		},

		release: function () {
			this.$el.off();
			this.$el.empty();
		}
	});

	return DocumentReferenceView;
});
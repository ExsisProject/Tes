//사이트관리자 > 전자결재 > 결재문서관리
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "calendar/libs/util",  
    "views/pagination",
    "views/pagesize",
    "collections/paginated_collection",

	"admin/views/document/manage_doclist_item",
    "approval/models/doclist_item",

	"hgn!approval/templates/doclist_empty",
    "hgn!admin/templates/appr_document_list",

	"approval/collections/apprFormCoreCollection",

	"i18n!nls/commons",
    "i18n!approval/nls/approval",
    "i18n!admin/nls/admin"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
    CalUtil, 
	PaginationView,
	PageSizeView,
	PaginatedCollection,

	DocListItemView,
	DocListItemModel,

	DocListEmptyTpl,
	DocListTpl,

	ApprFormCoreCollection,

	commonLang,
    approvalLang,
    adminLang
) {
	var lang = {
		'부서명': commonLang['부서명'],
		'기안자': approvalLang['기안자'],
		'검색': commonLang['검색'],
		"전체": approvalLang['전체'],
		"진행중": approvalLang['진행중'],
		"완료": approvalLang['완료'],
		"반려": approvalLang['반려'],
		"상태": adminLang['상태'],
		"기안일 기준": adminLang['기안일 기준'],
		"검색": commonLang['검색'],
		"목록 다운로드": adminLang['목록 다운로드'],
		'기안일': approvalLang.기안일,
		'결재양식': approvalLang.결재양식,
		'기안자': approvalLang.기안자,
		'제목': commonLang.제목,
		'첨부': approvalLang.첨부,
		'결재상태': approvalLang.결재상태,
		'결재일': approvalLang.결재일,
		'문서번호': approvalLang.문서번호,
		"검색 기간": approvalLang['검색 기간'],
		'기안부서': approvalLang['기안부서'],
		'결재선': approvalLang['결재선'],
		'문서 구분': approvalLang['문서 구분'],
		'결재 상태': approvalLang['결재 상태'],
		'일반 결재문서': approvalLang['일반 결재문서'],
		'수신 결재문서': approvalLang['수신 결재문서'],
		'접수대기': approvalLang['접수대기'],
		'접수': approvalLang['접수'],
		'반송': approvalLang['반송'],
		'상신취소': approvalLang['상신취소'],
		'결재문서회수': approvalLang['결재문서회수'],
		'기안일이 없는 문서는 생성일 기준으로 검색됩니다': approvalLang['기안일이 없는 문서는 생성일 기준으로 검색됩니다'],
		'연동 여부': approvalLang['연동 여부'],
		'일반문서(N)': approvalLang['일반문서(N)'],
		'연동문서(Y)': approvalLang['연동문서(Y)'],
		'연동 여부를 선택해주세요.': approvalLang['연동 여부를 선택해주세요.'],
		'수신 접수대기 / 접수 / 반송 문서를 조회합니다': approvalLang['수신 접수대기 / 접수 / 반송 문서를 조회합니다'],
		'문서ID': approvalLang['문서ID'],
		'생성일': approvalLang['생성일'],
		'연동여부': approvalLang['연동여부'],
		'결재요청시 생성되는 고유의 ID입니다': approvalLang['결재요청시 생성되는 고유의 ID입니다'],
		'DocID는 숫자만 입력할 수 있습니다': approvalLang['DocID는 숫자만 입력할 수 있습니다']
	};

	var FormSelectView = Backbone.View.extend({
		initialize: function(selectQuery) {
			this.$el = $(selectQuery);
			this.isAdmin = true;
			this.collection = new ApprFormCoreCollection(this.isAdmin);
		},

		render: function(callback) {
			this.collection.fetch({
				success: $.proxy(function(collection, response, options) {
					var html = [];
					html.push(['<option value="', 0, '" selected="selected">', lang['전체'], '</option>'].join(''));
					collection.each(function(m) {
						html.push(['<option value="', m.get('id'), '">', m.get('name'), '</option>'].join(''));
					});

					this.$el.html(html.join("\n"));

					var search = GO.router.getSearch();
					var formId = search.formId && search.formId.length == 1 ? search.formId[0] : "0";
					if (formId) {
						this.$el.val(formId);
					}

					callback();
				}, this)
			}, this);
		},

		// 선택된 양식이 있으면 선택된 양식 아이디를, 전체가 선택되었다면 null을 반환한다.
		// null을 넘기면 서버에서 알아서 판단한다.
		getSelectedFormIdList: function() {
			var selectedId = this.$el.find('option:selected').val();
			return (selectedId == 0) ? null : selectedId;
		}
	});

	var DocList = PaginatedCollection.extend({
		model: DocListItemModel,

		url: function () {
			var conditions = {
				'startAt' : this.startAt,
				'endAt' : this.endAt,
				'drafterName' : this.drafterName,
				'drafterDeptName' : this.drafterDeptName,
				'activityUserName' : this.activityUserName,
				'docId' : this.docId,
				'docNum' : this.docNum,
				'title' : this.title,
				'docStatus[]' : this.docStatusList,
				'docType[]' : this.docTypeList,
				'formId[]' : this.formIdList,
				'page' : this.pageNo,
				'offset' : this.pageSize,
				'property' : this.property,
				'direction' : this.direction,
				'integration[]' : this.integrationList,
				'apprStatus' : this.apprStatus
			};

			return GO.contextRoot + 'ad/api/approval/manage/document' + '?' + $.param(conditions);
		},

		setSearch : function(param) {
			this.startAt = param.startAt;
			this.endAt = param.endAt;
			this.drafterName = param.drafterName;
			this.drafterDeptName = param.drafterDeptName;
			this.activityUserName = param.activityUserName;
			this.docId = param.docId;
			this.docNum = param.docNum;
			this.title = param.title;
			this.docTypeList = param.docType;
			this.docStatusList = param.docStatus;
			this.formIdList = param.formId;
			this.pageNo = param.page;
			this.pageSize = param.offset;
			this.property = param.property;
			this.direction = param.direction;
			this.integrationList = param.integration;
			this.apprStatus = param.apprStatus;
		},

		setSort: function (property, direction) {
			this.property = property;
			this.direction = direction;
			this.pageNo = 0;
		}
	});

	var DocListView = Backbone.View.extend({
		el: '#layoutContent',

		columns: {
			'count': 10
		},

		initialize: function () {
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');

			this.collection = new DocList();
			this.collection.bind('reset', this.resetList, this);
		},

		delegateEvents: function (events) {
			this.undelegateEvents();
			Backbone.View.prototype.delegateEvents.call(this, events);
			this.$el.on("click.manage", "#btn_search_document", $.proxy(this.docManageSearch, this, false));
			this.$el.on("click.manage", "#apprManageCvsDown", $.proxy(this.cvsDownLoad, this));
			this.$el.on("click", ".sorting", $.proxy(this.sort, this));
			this.$el.on("click", ".sorting_desc", $.proxy(this.sort, this));
			this.$el.on("click", ".sorting_asc", $.proxy(this.sort, this));

			this.$el.on("click", "input[name=docStatCheck]", $.proxy(this.toggleDocStatCheckbox, this));
			this.$el.on("click", "input[name=docTypeCheck]", $.proxy(this.toggleDocTypeCheckbox, this));
			this.$el.on("click", "input[name=docIntegrationCheck]", $.proxy(this.toggleDocIntegrationCheckbox, this));
		},

		undelegateEvents: function () {
			Backbone.View.prototype.undelegateEvents.call(this);
			this.$el.off();
			return this;
		},

		_initDate: function () {
			$.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
			var startDate = this.$el.find("#startDate"),
				endDate = this.$el.find("#endDate");

			this.$el.find("#startDate").val(GO.util.fromNow('days', -7).format("YYYY-MM-DD"));
			this.$el.find("#endDate").val(GO.util.now().format("YYYY-MM-DD"));

			startDate.datepicker({
				dateFormat: "yy-mm-dd",
				changeMonth: true,
				changeYear: true,
				yearSuffix: "",
				onClose: function (selectedDate) {
					endDate.datepicker("option", "minDate", selectedDate);
				}
			});

			endDate.datepicker({
				dateFormat: "yy-mm-dd",
				changeMonth: true,
				changeYear: true,
				yearSuffix: "",
				minDate: startDate.val()
			});

			return this;
		},

		_initStatus: function () {
			this.$el.find('input[type=checkbox][name=docStatCheck]').prop('checked', true);
		},

		_initType: function () {
			this.$el.find('input[type=checkbox][name=docTypeCheck]').prop('checked', true);
		},

		_initIntegration: function () {
			this.$el.find('input[type=checkbox][name=docIntegrationCheck]').prop('checked', true);
		},

		toggleDocStatCheckbox: function (e) {
			if ($(e.currentTarget).attr('id') == 'docStatAllCheck') {
				var checked = this.$el.find('#docStatAllCheck').is(':checked');
				$('input[type="checkbox"][name="docStatCheck"]').attr('checked', checked);
			} else {
				var checked = $(e.currentTarget).is(':checked');
				$(e.currentTarget).attr('checked', checked);
				if (!checked) {
					$('#docStatAllCheck').attr('checked', false);
				}
			}
		},

		toggleDocTypeCheckbox: function (e) {
			if ($(e.currentTarget).attr('id') == 'docTypeAllCheck') {
				var checked = this.$el.find('#docTypeAllCheck').is(':checked');
				$('input[type="checkbox"][name="docTypeCheck"]').attr('checked', checked);
			} else {
				var checked = $(e.currentTarget).is(':checked');
				$(e.currentTarget).attr('checked', checked);
				if (!checked) {
					$('#docTypeAllCheck').attr('checked', false);
				}
			}
		},

		toggleDocIntegrationCheckbox: function (e) {
			if ($(e.currentTarget).attr('id') == 'docIntegrationAllCheck') {
				var checked = this.$el.find('#docIntegrationAllCheck').is(':checked');
				$('input[type="checkbox"][name="docIntegrationCheck"]').attr('checked', checked);
			} else {
				var checked = $(e.currentTarget).is(':checked');
				$(e.currentTarget).attr('checked', checked);
				if (!checked) {
					$('#docIntegrationAllCheck').attr('checked', false);
				}
			}
		},

		cvsDownLoad: function () {
			var url = "ad/api/approval/manage/document/download?";
			var param = this.getParam();
			GO.util.downloadCsvFile(url + GO.util.jsonToUrlParam(param));
		},

		render: function (option) {
			this.$el.empty();
			this.$el.html(DocListTpl({
				lang: lang,
				columns: this.columns
			}));

			this.setInitSort(this.initProperty, this.initDirection);
			this._initDate();
			this._initStatus();
			this._initType();
			this._initIntegration();

			this.formSelectView = new FormSelectView('#formId');
			this.formSelectView.render($.proxy(this.docManageSearch, this));

			this.renderPageSize();
			return this.$el;
		},

		getParam: function () {
			var startAt = GO.util.toISO8601(GO.util.toMoment($('#startDate').val()));
			var endAt = GO.util.toISO8601(GO.util.toMoment($('#endDate').val()).add('days', 1).subtract('seconds', 1));
			var drafterName = $.trim($('#drafterName').val());
			var drafterDeptName = $.trim($('#drafterDeptName').val());
			var activityUserName = $.trim($('#activityUserName').val());
			var docId = $.trim($('#docId').val());
			var docNum = $.trim($('#docNum').val());
			var title = $.trim($('#title').val().replace(/\+/gi, " "));
			var formIdList = this.formSelectView.getSelectedFormIdList();
			var apprStatus = "";

			var docStatusList = [];
			_.each($('input[type=checkbox][name=docStatCheck]:checked'), function (el) {
				if ($(el).attr('id') != 'docStatAllCheck') {
					if($(el).val() == 'cancel_draft') {
						docStatusList.push('draft_waiting');
						docStatusList.push('tempsave');
						apprStatus = "cancel";
					} else {
						docStatusList.push($(el).val());
					}
				}
			});

			var docTypeList = [];
			_.each($('input[type=checkbox][name=docTypeCheck]:checked'), function (el) {
				if ($(el).attr('id') != 'docTypeAllCheck') {
					docTypeList.push($(el).val());
				}
			});

			var docIntegrationList = [];
			_.each($('input[type=checkbox][name=docIntegrationCheck]:checked'), function (el) {
				if ($(el).attr('id') != 'docIntegrationAllCheck') {
					docIntegrationList.push($(el).val());
				}
			});

			var param = {
				startAt: startAt,
				endAt: endAt,
				drafterName: drafterName,
				drafterDeptName: drafterDeptName,
				activityUserName: activityUserName,
				docId: docId,
				docNum: docNum,
				title: title,
				docType: docTypeList,
				docStatus: docStatusList,
				formId: formIdList,
				page: 0,
				offset: this.collection.pageSize,
				property: this.property,
				direction: this.direction,
				integration: docIntegrationList,
				apprStatus: apprStatus
			};

			return param;
		},

		docManageSearch: function () {
			var param = this.getParam();

			if (param.docStatus.length == 0) {
				$.goError(approvalLang['문서 상태를 선택해주세요.']);
				return;
			}

			if (param.docType.length == 0) {
				$.goError(approvalLang['문서 구분을 선택해주세요.']);
				return;
			}

			if (param.integration.length == 0) {
				$.goError(approvalLang['연동 여부를 선택해주세요.']);
				return;
			}

			if($.trim(param.docId) != "" && !$.isNumeric(param.docId)) {
				$.goError(approvalLang['DocID는 숫자만 입력할 수 있습니다']);
				return;
			}

			this.collection.setSearch(param);
			this.setInitSort(this.initProperty, this.initDirection);
			this.collection.fetch();
		},

		renderPageSize: function () {
			this.pageSizeView = new PageSizeView({pageSize: this.collection.pageSize});
			this.pageSizeView.render();
			this.pageSizeView.bind('changePageSize', this.selectPageSize, this);
		},

		renderPages: function () {
			this.pageView = new PaginationView({
				pageInfo: this.collection.pageInfo()
			});

			this.pageView.bind('paging', this.selectPage, this);
			this.$el.find('div.tool_absolute > div.dataTables_paginate').remove();
			this.$el.find('div.tool_absolute').append(this.pageView.render().el);
		},

		resetList: function (doclist) {
			$('.tb_admin_approval > tbody').empty();
			var columns = this.columns;
			doclist.each(function (doc) {
				var docListItemView = new DocListItemView({
					model: doc,
					columns: columns,
				});
				$('.tb_admin_approval > tbody').append(docListItemView.render().el);
			});

			if (doclist.length == 0) {
				$('.tb_admin_approval > tbody').html(DocListEmptyTpl({
					columns: this.columns,
					lang: {'doclist_empty': commonLang['검색결과없음']}
				}));
			}

			this.renderPages();
		},

		// 페이지 이동
		selectPage: function (pageNo) {
			this.collection.setPageNo(pageNo);
			this.collection.fetch();
		},

		// 목록갯수 선택
		selectPageSize: function (pageSize) {
			this.collection.setPageSize(pageSize);
			this.collection.fetch();
		},

		setInitSort: function (property, direction) {
			var dataId = null;
			var sortPart = this.$el.find('th');
			sortPart.each(function () {
				if ($(this).attr('sort-id') == property) {
					dataId = $(this).attr('id');
				}
				if ($(this).attr('class') != 'sorting_disabled') {
					$(this).attr('class', 'sorting');
				}
			});
			$("#" + dataId).attr('class', 'sorting_' + direction);
		},

		sort: function (e) {
			var id = '#' + $(e.currentTarget).attr('id');
			var class_status = $(id).attr('class');
			var property = $(id).attr('sort-id');
			var direction = 'desc';
			var sortPart = this.$el.find('th');

			sortPart.each(function () {
				if ($(this).attr('class') != 'sorting_disabled') {
					$(this).attr('class', 'sorting');
				}
			});

			if (class_status == 'sorting') {
				$(id).attr('class', 'sorting_desc');
			} else if (class_status == 'sorting_desc') {
				$(id).attr('class', 'sorting_asc');
				direction = 'asc';
			} else if (class_status == 'sorting_asc') {
				$(id).attr('class', 'sorting_desc');
			} else {
				$.goMessage("Sorting Error.");
			}

			this.property = property;
			this.direction = direction;

			this.collection.setSort(property, direction);
			this.collection.fetch();
		},

		// 제거
		release: function () {
			this.$el.off();
			this.$el.empty();
		}
	});
	return DocListView;
});

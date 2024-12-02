// 사용자 > 전자결재 > 전자결재문서관리 > 양식별 문서조회
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "when",
    "calendar/libs/util",
    "helpers/form",
    "collections/paginated_collection",
    
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    "approval/views/doclist/base_doclist",
    "approval/views/doclist/doclist_item",
    "approval/views/doclist/doclist_csv_download",
    "approval/views/doclist/doclist_bulk_action",
    
    "approval/models/doclist_item",
    "approval/collections/apprFormCoreCollection",
    
    "hgn!approval/templates/doclist_search_null",
    "hgn!approval/templates/appr_doc_manage_main",
    
	"i18n!nls/commons",
    "i18n!approval/nls/approval",

    "jquery.go-popup",
    "jquery.ui"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	when,
    CalUtil,
    FormHelper,
	PaginatedCollection,
	
	ContentTopView,
	PaginationView,
	PageSizeView,
	BaseDocListView,
	DocListItemView,
	DocListCsvDownloadView,
	DocListBulkActionView,
	
	DocListItemModel,
	ApprFormCoreCollection,

	DocListEmptyTpl,
	mainTpl,
	
	commonLang,
	approvalLang
) {
    
	var lang = {
		"전체" : approvalLang['전체'],
		"진행중" : approvalLang['진행중'],
		"완료" : approvalLang['완료'],
		"반려" : approvalLang['반려'],
		"상태" : approvalLang['상태'],
		"기간" : commonLang['기간'],
		"검색 기간" : approvalLang['검색 기간'],
		'기안자': approvalLang['기안자'],
		'기안부서': approvalLang['기안부서'],
		'결재선': approvalLang['결재선'],
		'제목': commonLang['제목'],
		'검색': commonLang['검색'],
		'선택': commonLang['선택'],
		'삭제': commonLang['삭제'],
		'부서명': commonLang['부서명'],
		'기안일' : approvalLang['기안일'],
		'결재양식': approvalLang['결재양식'], 
		'첨부': approvalLang['첨부'],
		'문서 구분': approvalLang['문서 구분'],
		'결재 상태': approvalLang['결재 상태'],
		'일반 결재문서' : approvalLang['일반 결재문서'],
		'수신 결재문서' : approvalLang['수신 결재문서'],
		'결재일': approvalLang['결재일'], 
		'문서번호': approvalLang['문서번호'],
		'열람자 추가': approvalLang['열람자 추가'],
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
		'결재요청시 생성되는 고유의 ID입니다': approvalLang['결재요청시 생성되는 고유의 ID입니다'],
		'DocID는 숫자만 입력할 수 있습니다': approvalLang['DocID는 숫자만 입력할 수 있습니다']
	};

	var preloader = null;
	var ApprDocManageList = PaginatedCollection.extend({
	    manageType: null,
		model: DocListItemModel,

		initialize: function(manageType) {
			PaginatedCollection.prototype.initialize.apply(this, arguments);
		    this.manageType = manageType;
		},

		url: function() {
		    return this._makeURL(false);
		},

		getCsvURL: function() {
		    return this._makeURL(true);
		},

		_makeURL: function(isCsv) {
		    var baseURL = '/api/approval/$REPLACE/document';
		    if (this.manageType.isFormAdmin()) {
                baseURL = baseURL.replace('$REPLACE', 'manageform');
            } else if (this.manageType.isDocMaster()) {
                baseURL = baseURL.replace('$REPLACE', 'manage');
            } else {
                baseURL = baseURL.replace('$REPLACE', 'companyofficial');
            }

		    if (isCsv) {
		        baseURL += '/csv';
		    }

            return baseURL + '?' + $.param({
                'startAt' : this.startAt,
                'endAt' : this.endAt,
                'drafterName' : this.drafterName,
                'drafterDeptName' : this.drafterDeptName,
                'activityUserName' : this.activityUserName,
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
				'docId' : this.docId,
				'apprStatus' : this.apprStatus
            });
		},

		fetch: function (options) {
			typeof (options) != 'undefined' || (options = {});
			var self = this;
			var beforeSend = options.beforeSend;
			if (!_.isFunction(beforeSend)) {
				preloader = $.goPreloader();
				preloader.render();
			}

			var complete = options.complete;
			options.complete = function (resp) {

				if (preloader != null) {
					preloader.release();
				}
				if (_.isFunction(complete)) {
					complete(self, resp);
				}
			}
			return PaginatedCollection.prototype.fetch.call(this, options);
		},

		setInit: function(property, direction, docStatusList) {
			this.startAt = GO.util.toISO8601(GO.util.toMoment(GO.util.now().format("YYYY-MM-DD")));
			this.endAt = GO.util.toISO8601(GO.util.searchEndDate(GO.util.shortDate(GO.util.now().format("YYYY-MM-DD"))));
			this.property = property;
			this.direction = direction;
			this.docStatusList = docStatusList;
			this.pageNo = 0;
		},
		
		setSort: function(property, direction) {
			this.property = property;
			this.direction = direction;
			this.pageNo = 0;
		},
		
		setSearch : function(param) {
			this.startAt = param.startAt; 
		    this.endAt = param.endAt; 
		    this.drafterName = param.drafterName;
		    this.drafterDeptName = param.drafterDeptName;
		    this.activityUserName = param.activityUserName;
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
			this.docId = param.docId;
			this.apprStatus = param.apprStatus;
		},
		
		setListParam: function() {
			this.pageNo = sessionStorage.getItem('list-history-pageNo');
			this.pageSize = sessionStorage.getItem('list-history-pageSize');
			this.property = sessionStorage.getItem('list-history-property');
			this.direction = sessionStorage.getItem('list-history-direction');
		}
	});
	
	var ApprDocManageRenderException = function(message) {
	    this.name = 'ApprDocManageRenderException';
	    this.message = message;
	};
	
	/**
	 * 문서 목록 관리 페이지를 2가지 타입으로 관리할 수 있는데, 이 때의 타입 값을 표현하는 객체이다.
	 * docMaster: 전자결재 > 전자결재 문서관리 > 양식별 문서 조회
	 */
	var DocumentManageType = Backbone.Model.extend({
	    types: ['formAdmin', 'docMaster', 'officialDocMaster'],
	    type: null,
	    
	    initialize: function(value) {
	        this.type = this._parse(value);
	    },
	    
        _parse: function(value) {
            if (_.contains(this.types, value)) {
                return value;
            } else {
                throw new ApprDocManageRenderException("Invalid Manage Type.");
            }
        },
        
        isFormAdmin: function() {
            return this.type == 'formAdmin';
        },
        
        isDocMaster: function() {
            return this.type == 'docMaster';
        },
        
        isOfficialDocMaster: function() {
            return this.type == 'officialDocMaster';
        },
        
        getValue: function() {
            return this.type;
        }
	});
	
	/**
	 * 양식별 문서 조회인 경우에, 양식을 선택하기 위한 Select Box를 관리한다.
	 */
	var FormSelectView = Backbone.View.extend({
	    
	    initialize: function(selectQuery) {
	        this.$el = $(selectQuery);
	        this.collection = new ApprFormCoreCollection();
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
	    
	    /**
	     * 선택된 양식이 있으면 선택된 양식 아이디를,
	     * 전체가 선택되었다면 null을 반환한다.
	     */
	    getSelectedFormIdList: function() {
	    	var selectedId = this.$el.find('option:selected').val();
	    	if (selectedId == 0) {
	    	    /**
	    	     * null을 넘기면 서버에서 알아서 판단한다.
	    	     */
	    		return null;
	    	}
	    	
	    	return selectedId;
	    }
	});

	var ApprDocumentManageView = BaseDocListView.extend({
		el: '#content',
		docFolderType: null,
		columns: {},

		initialize: function (options) {
			this.isSearch = location.search ? true : false;
			if (GO.router.getUrl().indexOf("?") > 0) {
				//ie9에서는 #이 붙기 떄문에 isSearch가 무조건 false로 떨어져서 location.search는 쓰면 안됨.
				this.isSearch = true;
			}
			this.options = options || {};
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');

			this.contentTop = ContentTopView.getInstance();
			this.manageType = new DocumentManageType(this.options.type);

			if (this.manageType.isFormAdmin() || this.manageType.isDocMaster()) {
				this.docFolderType = 'manage_form';
			} else {
				this.docFolderType = 'manage_official';
			}

			this.collection = new ApprDocManageList(this.manageType);
			this.collection.bind('reset', this.resetList, this);

			this.initProperty = "id";
			this.initDirection = "desc";

			var baseUrl = sessionStorage.getItem('list-history-baseUrl');
			if (baseUrl) {
				baseUrl = baseUrl.replace(/#/gi, "");
			}
			if (baseUrl && baseUrl == 'approval/manage/document') {
				this.initProperty = sessionStorage.getItem('list-history-property');
				this.initDirection = sessionStorage.getItem('list-history-direction');
				this.collection.setListParam();
			} else {
				this.collection.setSearch(GO.router.getSearch());
			}

			sessionStorage.clear();
			this.checkboxColumn = {
				id: 'checkedAllDeptDoc',
				name: 'checkedAllDeptDoc'
			};
			BaseDocListView.prototype.initialize.call(this, options);
		},

		events: {
			'click input[name=docStatCheck]': 'toggleDocStatCheckbox',
			'click input[name=docTypeCheck]': 'toggleDocTypeCheckbox',
			'click input[name=docIntegrationCheck]': 'toggleDocIntegrationCheckbox',
			'click .sorting': 'sort',
			'click .sorting_desc': 'sort',
			'click .sorting_asc': 'sort',
			'click a#btn_search_document': 'docManageSearch',
			'click input[name=checkedAllDeptDoc]': 'toggleCheckboxDocManage'
		},

		// 초기 날짜 세팅 (시작-종료 : 현재 일자)
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

		_initStatus: function () {
			this.$el.find('input[type=checkbox][name=docStatCheck]').prop('checked', true);
		},

		_initType: function () {
			this.$el.find('input[type=checkbox][name=docTypeCheck]').prop('checked', true);
		},

		_initIntegration: function () {
			this.$el.find('input[type=checkbox][name=docIntegrationCheck]').prop('checked', true);
		},

		_initPage: function (page, offset) {
			this.collection.setPageSize(offset);
			this.collection.setPageNo(page);
		},

		//override
		render: function () {
			when(this.fetchDocField.call(this)) //super method
				.then(_.bind(this.renderLayout, this)) //to override method
				.then(_.bind(this.renderDocFieldSettingView, this))//super method
				.then(_.bind(this.renderDocFieldColumnTpl, this))//super method
				.then(_.bind(this.renderFormView, this))
				.then(_.bind(this.setInitSort, this))
				.otherwise(function printError(err) {
					console.log(err.stack);
				});
		},

		renderLayout: function (option) {
			this.$el.empty();
			this.$el.html(mainTpl({
				lang: lang
			}));

			this._initDate();
			this._initStatus();
			this._initType();
			this._initIntegration();

			if (_.isEmpty(this.collection.pageNo) && _.isEmpty(this.collection.pageSize)) {
				this._initPage(0, 20);
			} else {
				this._initPage(this.collection.pageNo, this.collection.pageSize);
			}

			if (this.isSearch) {
				this.renderSearchParam();
			}

			this.contentTop.setTitle(approvalLang['양식별 문서 조회']);
			if (this.manageType.isOfficialDocMaster()) {
				this.contentTop.setTitle(approvalLang['전사 공문 발송함']);
			}

			this.contentTop.render();
			this.$el.find('header.content_top').replaceWith(this.contentTop.el);

			this.renderPageSize();

			this._makeCsvDownloadButton();
			if (this.manageType.type == 'docMaster' || this.manageType.type == 'formAdmin') {
				this._makeBulkActionButtons();
			}

			return this.$el;
		},

		renderFormView: function () {
			this.formSelectView = new FormSelectView('#formId');
			this.formSelectView.render($.proxy(this.docManageSearch, this));
		},

		toggleCheckboxDocManage: function (e) {
			var target = $(e.currentTarget);
			var targetChecked = $(target).is(':checked');

			if (target.attr('id') == this.checkboxColumn.id) {
				$('input[name="checkbox_docmanage"]:not([disabled])').prop('checked', targetChecked);
			}

			if (target.hasClass('doc_manager_item_checkbox')) {
				if (!targetChecked) {
					$('#' + this.checkboxColumn.id).prop('checked', targetChecked);
				}
			}
		},

		renderSearchParam: function () {
			var param = GO.router.getSearch();
			var startDate = param.startAt || "";
			var endDate = param.endAt || "";
			var docStatusList = param.docStatus;
			var docTypeList = param.docType;
			var docIntegrationList = param.integration;
			var apprStatus = param.apprStatus;

			this.$("#startDate").val(startDate.split("T")[0]);
			this.$("#endDate").val(endDate.split("T")[0]);
			this.$("#drafterName").val(param.drafterName || "");
			this.$("#drafterDeptName").val(param.drafterDeptName || "");
			this.$("#activityUserName").val(param.activityUserName || "");
			this.$("#docNum").val(param.docNum || "");
			this.$("#title").val(param.title.replace(/\+/gi, " ") || "");
			this.$("#docId").val(param.docId || "");
			this.$("#apprStatus").val(apprStatus || "");

			// 결재 상태 체크
			this.$("input[type=checkbox][name=docStatCheck]").attr("checked", false);
			if (docStatusList.length == 7 || docStatusList.length == 8) {
				this.$("#docStatAllCheck").attr("checked", true);
			}
			_.each(docStatusList, function (status) {
				this.$("#" + status.toLowerCase()).attr("checked", true);
			}, this);

			if(_.contains(docStatusList, 'draft_waiting') &&
				_.contains(docStatusList, 'tempsave') && apprStatus == 'cancel') {
				this.$("#cancel_draft").attr("checked", true);
			}

			// 문서 구분 체크
			this.$("input[type=checkbox][name=docTypeCheck]").attr("checked", false);
			if (docTypeList.length == 2) {
				this.$("#docTypeAllCheck").attr("checked", true);
			}
			_.each(docTypeList, function (type) {
				var type = type.toLowerCase();
				this.$("input[type=checkbox][name=docTypeCheck][value=" + type + "]").attr("checked", true);
			}, this);

			// 연동 여부 체크
			this.$("input[type=checkbox][name=docIntegrationCheck]").attr("checked", false);
			if (docIntegrationList.length == 2) {
				this.$("#docIntegrationAllCheck").attr("checked", true);
			}
			_.each(docIntegrationList, function (type) {
				this.$("input[type=checkbox][name=docIntegrationCheck][value=" + type + "]").attr("checked", true);
			}, this);
		},

		renderPageSize: function () {
			this.pageSizeView = new PageSizeView({
				pageSize: this.collection.pageSize
			});
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
			var fragment = this.collection.url().slice(this.collection.url().indexOf('api/') + 4);
			var bUrl = GO.router.getUrl().replace("#", "");

			if (bUrl.indexOf("?") < 0) {
				GO.router.navigate(fragment, {replace: true});
			} else {
				if (bUrl != fragment) {
					GO.router.navigate(fragment, {trigger: false, pushState: true});
				}
			}

			$('.list_approval > tbody').empty();
			if (doclist.isEmpty()) {
				$('.list_approval > tbody').html(DocListEmptyTpl({
					columns: this.columns,
					lang: {'doclist_empty': approvalLang['검색 된 문서가 없습니다.']}
				}));
			} else {
				doclist.each(function (doc) {
					var listType = 'manage';
					if (this.manageType.isFormAdmin()) {
						listType = 'manageform';
					} else if (this.manageType.isOfficialDocMaster()) {
						listType = 'companyofficial';
					}
					var docListItemView = new DocListItemView({
						listType: listType,
						columns: this.columns,
						isManager: true,
						model: doc
					});

					$('.list_approval > tbody').append(docListItemView.render().el);
				}, this);
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

		sort: function (e) {
			var id = '#' + $(e.currentTarget).attr('id');
			var property = $(id).attr('sort-id');
			var direction = 'desc';
			var removeClassName = "";
			var addClassName = "";

			if ($(id).hasClass('sorting')) {
				removeClassName = 'sorting';
				addClassName = 'sorting_desc';
			}
			if ($(id).hasClass('sorting_desc')) {
				removeClassName = 'sorting_desc';
				addClassName = 'sorting_asc';
				direction = 'asc';
			}
			if ($(id).hasClass('sorting_asc')) {
				removeClassName = 'sorting_asc';
				addClassName = 'sorting_desc';
			}

			$(id).removeClass(removeClassName).addClass(addClassName);
			var sortPart = this.$el.find('th');
			sortPart.each(function () {
				if (!$(this).hasClass('sorting_disabled') && ('#' + $(this).attr('id') != id)) {
					$(this).removeClass('sorting').addClass('sorting');
					$(this).removeClass('sorting_desc').addClass('sorting');
					$(this).removeClass('sorting_asc').addClass('sorting');
				}
			});

			this.collection.setSort(property, direction);
			this.collection.fetch();
		},

		docManageSearch: function () {
			if (this.isSearch) {
				this.isSearch = false;
				this.collection.setListParam();
				this.collection.setSearch(GO.router.getSearch());
			} else {
				var startAt = GO.util.toISO8601(GO.util.toMoment($('#startDate').val()));
				var endAt = GO.util.toISO8601(GO.util.toMoment($('#endDate').val()).add('days', 1).subtract('seconds', 1));
				var drafterName = $.trim($('#drafterName').val());
				var drafterDeptName = $.trim($('#drafterDeptName').val());
				var activityUserName = $.trim($('#activityUserName').val());
				var docNum = $.trim($('#docNum').val());
				var title = $.trim($('#title').val().replace(/\+/gi, " "));
				var docId = $.trim($('#docId').val());
				var apprStatus = "";

				var docStatusList = [];
				_.each($('input[type=checkbox][name=docStatCheck]:checked'), function (el) {
					if ($(el).attr('id') != 'docStatAllCheck') {
						if($(el).val() == 'cancel_draft') {
							docStatusList.push('draft_waiting');
							docStatusList.push('tempsave');
							apprStatus = 'cancel';
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

				if (docStatusList.length == 0) {
					$.goError(approvalLang['문서 상태를 선택해주세요.']);
					return;
				}

				if (docTypeList.length == 0) {
					$.goError(approvalLang['문서 구분을 선택해주세요.']);
					return;
				}

				if (docIntegrationList.length == 0) {
					$.goError(approvalLang['연동 여부를 선택해주세요.']);
					return;
				}

				if($.trim(docId) != "" && !$.isNumeric(docId)) {
					$.goError(approvalLang['DocID는 숫자만 입력할 수 있습니다']);
					return;
				}

				var formIdList = this.formSelectView.getSelectedFormIdList();
				this.collection.setSearch({
					startAt: startAt,
					endAt: endAt,
					drafterName: drafterName,
					drafterDeptName: drafterDeptName,
					activityUserName: activityUserName,
					docNum: docNum,
					title: title,
					docType: docTypeList,
					docStatus: docStatusList,
					formId: formIdList,
					page: 0,
					offset: this.collection.pageSize,
					property: this.initProperty,
					direction: this.initDirection,
					integration: docIntegrationList,
					docId: docId,
					apprStatus: apprStatus
				});

				this.setInitSort(this.initProperty, this.initDirection);
			}

			this.collection.fetch();
		},

		_makeCsvDownloadButton: function () {
			new DocListCsvDownloadView({
				getDownloadURL: $.proxy(this.collection.getCsvURL, this.collection),
				appendTarget: this.$el.find('#docToolbar > ul.critical > li')
			}).render();
		},

		_makeBulkActionButtons: function () {
			var context = this;
			new DocListBulkActionView({
				appendTarget: this.$el.find('#downloadListCsv'),
				getSelectedDocs: function () {
					return context._getSelectedDocs()
				},
				resetList: function () {
					context.collection.fetch();
				}
			}).render();
		},

		_getSelectedDocs: function () {
			var $elements = $(".list_approval input[type=checkbox][data-id]:checked");
			var ids = _.map($elements, function (input) {
				return parseInt($(input).attr("data-id"));
			});

			return this.collection.select(function (model) {
				return _.contains(ids, model.get("id"));
			});
		},

		getCheckedIds: function () {
			return _.map($(".list_approval input[type=checkbox][name='checkbox_docmanage'][data-id]:checked"), function (input) {
				return $(input).attr("data-id");
			});
		},

		// 제거
		release: function () {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return ApprDocumentManageView;
});

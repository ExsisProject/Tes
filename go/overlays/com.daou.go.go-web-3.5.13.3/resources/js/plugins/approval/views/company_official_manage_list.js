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
    
    "approval/models/doclist_item",
    "approval/collections/apprFormCoreCollection",
    
    "hgn!approval/templates/doclist_search_null",
    "hgn!approval/templates/company_official_manage_main",
    
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
	
	DocListItemModel,
	ApprFormCoreCollection,
	
	DocListEmptyTpl,
	mainTpl,
	
	commonLang,
	approvalLang
) {
    
	var lang = {
		"전체" : approvalLang['전체'],
		'승인' : approvalLang['승인'],
		'승인대기' : approvalLang['승인대기'],
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
		'결재일': approvalLang['결재일'], 
		'문서번호': approvalLang['문서번호'],
		'열람자 추가': approvalLang['열람자 추가'],
		'승인 상태': approvalLang['승인 상태'],
		'발송취소' : approvalLang['발송취소'],
		'승인 상태를 선택해주세요' : approvalLang['승인 상태를 선택해주세요']
	};
	
	var preloader = null;
	
	var ApprDocManageList = PaginatedCollection.extend({
	    
	    manageType: null,
		model: DocListItemModel,
		
		url: function() {
		    return this._makeURL(false);
		},
		
		getCsvURL: function() {
		    return this._makeURL(true);
		},
		
		_makeURL: function(isCsv) {
		    var baseURL = '/api/approval/company/official';
		    
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
                'officialStatus[]' : this.officialStatusList,
                /*'docStatus[]' : this.docStatusList,
                'docType[]' : this.docTypeList,*/
                'formId[]' : this.formIdList,
                'page' : this.pageNo, 
                'offset' : this.pageSize, 
                'property' : this.property, 
                'direction' : this.direction 
            });
		},

		setInit: function(property, direction, officialStatusList) {
			this.startAt = GO.util.toISO8601(GO.util.toMoment(GO.util.now().format("YYYY-MM-DD")));
			this.endAt = GO.util.toISO8601(GO.util.searchEndDate(GO.util.shortDate(GO.util.now().format("YYYY-MM-DD"))));
			this.property = property;
			this.direction = direction;
			this.officialStatusList = officialStatusList;
			this.pageNo = 0;
		},
		
		setSort: function(property, direction) {
			this.property = property;
			this.direction = direction;
			this.pageNo = 0;
		},
		
		fetch : function(options){
			typeof(options) != 'undefined' || (options = {});
			var self = this;
			var beforeSend = options.beforeSend;
			if(!_.isFunction(beforeSend)) {
				preloader = $.goPreloader();
				preloader.render();    				
			}
			
			var complete = options.complete;
			options.complete = function(resp){
				if(preloader != null){
					preloader.release();
				}
				if(_.isFunction(complete)){
					complete(self, resp);
				}
			}
			return PaginatedCollection.prototype.fetch.call(this, options);
		},
		
		setSearch : function(param) {
			this.startAt = param.startAt; 
		    this.endAt = param.endAt; 
		    this.drafterName = param.drafterName;
		    this.drafterDeptName = param.drafterDeptName;
		    this.activityUserName = param.activityUserName;
		    this.docNum = param.docNum; 
		    this.title = param.title;
		    this.officialStatusList = param.officialStatus;
		    this.formIdList = param.formId;
		    this.pageNo = param.page;
		    this.pageSize = param.offset;
		    this.property = param.property; 
		    this.direction = param.direction;
		},
		
		setListParam: function() {
			this.pageNo = sessionStorage.getItem('list-history-pageNo');
			this.pageSize = sessionStorage.getItem('list-history-pageSize');
			this.property = sessionStorage.getItem('list-history-property');
			this.direction = sessionStorage.getItem('list-history-direction');
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
	
    var ReaderModel = Backbone.Model.extend({
        initialize: function(docId) {
            this.docId = docId;
        },
        url: function() {
            var url = ['/api/approval/document', this.docId, 'draft'].join('/');
            return url;
        },
        setUrl : function(url){
        	this.url = url;
        }
    });
	
	var CompanyOfficialManageListView = BaseDocListView.extend({

		el: '#content',
        docFolderType : null,
		columns: {
			'선택' : approvalLang['선택'],
			'기안일' : approvalLang['기안일'],
			'기안자': approvalLang['기안자'], 
			'결재양식': approvalLang['결재양식'], 
			'제목': commonLang['제목'], 
			'첨부': approvalLang['첨부'],
			'결재상태': approvalLang['결재상태'],
			'문서번호' : approvalLang['문서번호'],
			'count': 8
		},
		
		initialize: function(options) {
			this.isSearch = location.search ? true : false;
			if(GO.router.getUrl().indexOf("?") > 0){
				this.isSearch = true; //ie9에서는 #이 붙기 떄문에 isSearch가 무조건 false로 떨어져서 location.search는 쓰면 안됨.
			}
			this.options = options || {};
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');
			
			this.contentTop = ContentTopView.getInstance();
			this.docFolderType = 'manage_official';
			this.collection = new ApprDocManageList();
			this.collection.bind('reset', this.resetList, this);
			
			this.initProperty = "document.draftedAt";
			this.initDirection = "desc";
			this.collection.setSearch(GO.router.getSearch());
			
			sessionStorage.clear();
			this.checkboxColumn = {
					id : 'checkedAllDeptDoc',
					name : 'checkedAllDeptDoc'
			};
            BaseDocListView.prototype.initialize.call(this, options);
		},
		
		events: {
			'click input[name=officialStatCheck]' : 'toggleOfficialStatCheckbox',
			'click .sorting' : 'sort',
			'click .sorting_desc' : 'sort',
			'click .sorting_asc' : 'sort',
			'click a#btn_search_document' : 'docManageSearch',
			'click input[name=checkedAllDeptDoc]' : 'toggleCheckboxDocManage'
    	},
    	
    	// 초기 날짜 세팅 (시작-종료 : 현재 일자)
        _initDate : function(){
			$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] ); 
			var startDate = this.$el.find("#startDate"),
				endDate = this.$el.find("#endDate");
			
			this.$el.find("#startDate").val(GO.util.fromNow('days', -7).format("YYYY-MM-DD"));
			this.$el.find("#endDate").val(GO.util.now().format("YYYY-MM-DD"));
           
			startDate.datepicker({ 
	            dateFormat: "yy-mm-dd",
	            changeMonth: true,
	            changeYear: true,
	            yearSuffix: "",
	            onClose: function( selectedDate ) {
                    endDate.datepicker( "option", "minDate", selectedDate );
                }
	        });

			endDate.datepicker({
	            dateFormat: "yy-mm-dd", 
	            changeMonth: true,
	            changeYear: true,
	            yearSuffix: "",
	            minDate : startDate.val()
	        });
			
			return this;
        },
        
        toggleOfficialStatCheckbox : function(e){
        	if ($(e.currentTarget).attr('id') == 'officialStatAllCheck') {
        	    var checked = this.$el.find('#officialStatAllCheck').is(':checked');
				$('input[type="checkbox"][name="officialStatCheck"]').attr('checked', checked);
        	} else {
        	    var checked = $(e.currentTarget).is(':checked');
        	    $(e.currentTarget).attr('checked', checked);
        		if (!checked) {
    			    $('#officialStatAllCheck').attr('checked', false);
    			}
        	}
		},
		
		_initStatus: function() {
			this.$el.find('input[type=checkbox][name=officialStatCheck]').prop('checked', true);
		},
		
		_initPage: function(page, offset) {
			this.collection.setPageSize(offset);
			this.collection.setPageNo(page);
		},

		//override
		render : function(){
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
		
		renderLayout: function(option) {
			this.$el.empty();
			this.$el.html(mainTpl({
				lang: lang
			}));
			this._initDate();
			this._initStatus();
			this._initPage(0, 20);
			
			if (this.isSearch) this.renderSearchParam();
			
			this.contentTop.setTitle(approvalLang['전사 공문 발송함']);
    		this.contentTop.render();
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
    		
    		this.renderPageSize();
    		
            this._makeCsvDownloadButton();
    		return this.$el;
		},
		
		renderFormView : function(){
    		this.formSelectView = new FormSelectView('#formId');
            this.formSelectView.render($.proxy(this.docManageSearch, this));
		},
		
		toggleCheckboxDocManage : function(e){
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
		
		renderSearchParam : function() {
			var param = GO.router.getSearch();
			var startDate = param.startAt || "";
			var endtDate = param.endAt || "";
			var officialStatusList = param.officialStatus;
			
			this.$("#startDate").val(startDate.split("T")[0]);
			this.$("#endDate").val(endtDate.split("T")[0]);
			this.$("#drafterName").val(param.drafterName || "");
			this.$("#drafterDeptName").val(param.drafterDeptName || "");
			this.$("#activityUserName").val(param.activityUserName || "");
			this.$("#docNum").val(param.docNum || "");
			this.$("#title").val(param.title.replace(/\+/gi, " ") || "");
			
			// 승인 상태 체크
			this.$("input[type=checkbox][name=officialStatCheck]").attr("checked", false);
			if (officialStatusList.length == 3) {
                this.$("#officialStatAllCheck").attr("checked", true);
            }
			_.each(officialStatusList, function(status) {
				this.$("#" + status.toLowerCase()).attr("checked", true);
			}, this);
			
		},
		
		renderPageSize: function() {
			this.pageSizeView = new PageSizeView({
			    pageSize: this.collection.pageSize
		    });
    		this.pageSizeView.render();
    		this.pageSizeView.bind('changePageSize', this.selectPageSize, this);
		},
		
		renderPages: function() {
			this.pageView = new PaginationView({
			    pageInfo: this.collection.pageInfo()
		    });
			this.pageView.bind('paging', this.selectPage, this);
			this.$el.find('div.tool_absolute > div.dataTables_paginate').remove();
			this.$el.find('div.tool_absolute').append(this.pageView.render().el);
		},
		
		resetList: function(doclist) {
			var fragment = this.collection.url().slice(this.collection.url().indexOf('api/') + 4);
			var bUrl = GO.router.getUrl().replace("#","");
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
                    lang: { 'doclist_empty': approvalLang['검색 된 문서가 없습니다.'] }
                }));
			} else {
			    doclist.each(function(doc){
			        var listType = 'officialDoc';
	                var docListItemView = new DocListItemView({ 
	                    listType : listType,
	                    columns: this.columns,
	                    isManager: true,
	                    model: doc,
	                    useDocInfo: false
	                });
	                
	                $('.list_approval > tbody').append(docListItemView.render().el);
	            }, this);
			}
			
			this.renderPages();
		},
		// 페이지 이동
		selectPage: function(pageNo) {
			this.collection.setPageNo(pageNo);
			this.collection.fetch();
		},
		// 목록갯수 선택
		selectPageSize: function(pageSize) {
			this.collection.setPageSize(pageSize);
			this.collection.fetch();
		},
		
		sort: function(e){
    		var id = '#'+$(e.currentTarget).attr('id');
    		var property = $(id).attr('sort-id');
    		var direction= 'desc';
    		var removeClassName = "";
    		var addClassName = "";
    		
    		if ( $(id).hasClass('sorting')) {
    			removeClassName = 'sorting';
    			addClassName = 'sorting_desc';
    		}
    		if ( $(id).hasClass('sorting_desc')) {
    			removeClassName = 'sorting_desc';
    			addClassName = 'sorting_asc';
    			direction= 'asc';
    		}
    		if ( $(id).hasClass('sorting_asc')) {
    			removeClassName = 'sorting_asc';
    			addClassName = 'sorting_desc';
    		}
    		
    		$(id).removeClass(removeClassName).addClass(addClassName);
    		var sortPart = this.$el.find('th');
    		sortPart.each(function(){
    			if( !$(this).hasClass('sorting_disabled') && ( '#'+$(this).attr('id') != id )) {
    				$(this).removeClass('sorting').addClass('sorting');
    				$(this).removeClass('sorting_desc').addClass('sorting');
    				$(this).removeClass('sorting_asc').addClass('sorting');
    			} 
    		});
    		
    		this.collection.setSort(property,direction);
    		this.collection.fetch();
    	},
    	
		docManageSearch: function() {
			if (this.isSearch) {
				this.isSearch = false;
				this.collection.setListParam();
				this.collection.setSearch(GO.router.getSearch());
			} else {
				var startAt = GO.util.toISO8601(GO.util.toMoment($('#startDate').val()));
				var endAt = GO.util.toISO8601(GO.util.toMoment($('#endDate').val()).add('days',1).subtract('seconds',1));
				var drafterName = $.trim($('#drafterName').val());
				var drafterDeptName = $.trim($('#drafterDeptName').val());
				var activityUserName = $.trim($('#activityUserName').val());
				var docNum = $.trim($('#docNum').val());
				var title = $.trim($('#title').val().replace(/\+/gi, " "));
				
				var officialStatusList = [];
				_.each($('input[type=checkbox][name=officialStatCheck]:checked'), function(el) {
				    if ($(el).attr('id') != 'officialStatAllCheck') {
				    	officialStatusList.push($(el).val());
				    }
				});
				
				if (officialStatusList.length == 0) {
                    $.goError(lang['승인 상태를 선택해주세요']); 
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
				    officialStatus: officialStatusList,
				    formId: formIdList,
				    offset: this.collection.pageSize,
				    property: this.initProperty,
				    direction: this.initDirection
				});
				
				this.setInitSort(this.initProperty, this.initDirection);
			}
			
			this.collection.fetch();
		},
		
		_makeCsvDownloadButton: function() {
		    new DocListCsvDownloadView({
		        getDownloadURL: $.proxy(this.collection.getCsvURL, this.collection),
                appendTarget: this.$el.find('#docToolbar > ul.critical > li')
            }).render();
		},
		
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return CompanyOfficialManageListView;
});

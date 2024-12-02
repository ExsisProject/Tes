//관리자 작업기록
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "calendar/libs/util",
    "collections/paginated_collection",
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    "approval/views/doclist/loglist_item",
    "approval/models/loglist_item",
    "hgn!approval/templates/doclist_search_null",
    "hgn!approval/templates/appr_doc_manage_log",
	"i18n!nls/commons",
	"i18n!admin/nls/admin",
    "i18n!approval/nls/approval",
    "jquery.go-popup",
    "jquery.ui"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
    CalUtil,
	PaginatedCollection,
	ContentTopView,
	PaginationView,
	PageSizeView,
	LogListItemView,
	LogListItemModel,
	DocListEmptyTpl,
	mainTpl,
	commonLang,
	adminLang,
	approvalLang
) {
	var preloader = null;
	var lang = {
		'검색 기간': approvalLang['검색 기간'],
		'관리자': adminLang['관리자'],
		'기안자': approvalLang['기안자'],
		'문서명': approvalLang['문서명'],
		'작업구분': approvalLang['작업구분'],
		'전체': approvalLang['전체'],
		'목록': approvalLang['목록'],
		'조회': approvalLang['조회'],
		'내용 수정': approvalLang['내용 수정'],
		'결재선 수정': approvalLang['결재선 수정'],
		'강제반려': approvalLang['강제반려'],
		'삭제': approvalLang['삭제'],
		'이름': approvalLang['이름'],
		'직위': approvalLang['직위'],
		'검색': commonLang['검색'],
		'강제반송': approvalLang['강제반송'],
		'접수취소': approvalLang['접수취소']
	};
	
	var ApprDocManageList = PaginatedCollection.extend({
		model: LogListItemModel,
		url: function () {
			return GO.contextRoot + 'api/approval/managelog' + '?' + $.param({
				startAt: this.startAt,
				endAt: this.endAt,
				accessUserName: this.accessUserName,
				accessTypes: this.accessTypes,
				page: this.pageNo,
				offset: this.pageSize,
				property: this.property,
				direction: this.direction
			});
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
		setInit: function (property, direction) {
			this.startAt = GO.util.toISO8601(GO.util.toMoment(GO.util.now().format("YYYY-MM-DD")));
			this.endAt = GO.util.toISO8601(GO.util.searchEndDate(GO.util.shortDate(GO.util.now().format("YYYY-MM-DD"))));
			this.property = property;
			this.direction = direction;
			this.pageNo = 0;
		},
		setSort: function(property,direction) {
			this.property = property;
			this.direction = direction;
			this.pageNo = 0;
		},
		setSearch: function(startAt, endAt, accessUserName, checked, property, direction) {
			this.startAt = startAt;
			this.endAt = endAt;
			this.accessUserName = accessUserName;
			this.accessTypes = checked;
			this.property = property ? property : this.property;
			this.direction = direction ? direction : this.direction;
			this.pageNo = 0;
		},
		setListParam: function() {
			this.pageNo = sessionStorage.getItem('list-history-pageNo');
			this.pageSize = sessionStorage.getItem('list-history-pageSize');
			this.property = sessionStorage.getItem('list-history-property');
			this.direction = sessionStorage.getItem('list-history-direction');
		},
		setAccessTypes: function(accessType){
			this.accessTypes = accessType;
		}
	});

	var ApprDocumentManageView = Backbone.View.extend({

		el: '#content',
		
		columns: {
			'기안자': approvalLang['제목'],
			'문서명': approvalLang['문서명'],
			'일시': approvalLang['일시'],
			'작업구분': approvalLang['작업구분'],
			'이름': approvalLang['이름'],
			'기안자': approvalLang['기안자'],
			'결재양식': approvalLang['결재양식'],
			'count': 6
		},
		
		initialize: function(options) {
			this.options = options || {};
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');
			this.contentTop = ContentTopView.getInstance();
			this.collection = new ApprDocManageList();
			
			this.initProperty = "accessAt";
			this.initDirection = "desc";

			var baseUrl = sessionStorage.getItem('list-history-baseUrl');
			if ( baseUrl && baseUrl == 'approval/managelog' ) {
				this.initProperty = sessionStorage.getItem('list-history-property');
				this.initDirection = sessionStorage.getItem('list-history-direction');
				this.collection.setListParam();
			} else {
				this.collection.setInit(this.initProperty, this.initDirection);
			}

			sessionStorage.clear();
			
			this.collection.bind('reset', this.resetList, this);
		},
		
		events: {
			'click input:checkbox' : 'toggleCheckbox',
			'click .sorting' : 'sort',
			'click .sorting_desc' : 'sort',
			'click .sorting_asc' : 'sort',
			'click a#btn_search_manage_log' : 'docManageLogSearch'
    	},
    	
    	// 초기 날짜 세팅 (시작-종료 : 현재 일자)
        _initDate : function(){
			$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] ); 
			var startDate = this.$el.find("#startDate"),
				endDate = this.$el.find("#endDate");
			
			this.$el.find("#startDate").val(GO.util.now().format("YYYY-MM-DD"));
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
        
    	toggleCheckbox : function(e){
			if ($(e.currentTarget).attr('name') == 'allCheck') {
				var checked = this.$el.find('#allCheck').is(':checked');
				$('input[type="checkbox"][name="list"]').attr('checked', checked);
				$('input[type="checkbox"][name="view"]').attr('checked', checked);
				$('input[type="checkbox"][name="bodymodify"]').attr('checked', checked);
				$('input[type="checkbox"][name="flowmodify"]').attr('checked', checked);
				$('input[type="checkbox"][name="forcereturn"]').attr('checked', checked);
				$('input[type="checkbox"][name="forcerecvreturned"]').attr('checked', checked);
				$('input[type="checkbox"][name="withdraw"]').attr('checked', checked);
				$('input[type="checkbox"][name="delete"]').attr('checked', checked);
        	} else {
        	    var checked = $(e.currentTarget).is(':checked');
        	    $(e.currentTarget).attr('checked', checked);
        		if (!checked) {
        			this.$el.find('#allCheck').attr('checked', false);
    			}
        	}
		},
		
		render: function(option) {
			this.$el.empty();
			this.$el.html(mainTpl({
				lang: lang,
				columns: this.columns
			}));

			this._initDate();
			
			this.contentTop.setTitle(approvalLang['관리자 작업기록']);
    		this.contentTop.render();
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
    		this.renderPageSize();
    		
    		// TODO 초기 세팅 리스트가 있을 경우 삭제
    		$('.list_manager_record > tbody').html(DocListEmptyTpl({
				columns: this.columns,
				lang: { 'doclist_empty': approvalLang['검색어 구분을 선택해주세요.'] }
			}));
    		
    		this.$el.find('#allCheck').attr('checked',true);
    		this.$el.find('#list').attr('checked',true);
    		this.$el.find('#view').attr('checked',true);
    		this.$el.find('#bodymodify').attr('checked',true);
    		this.$el.find('#flowmodify').attr('checked',true);
    		this.$el.find('#forcereturn').attr('checked',true);
			this.$el.find('#forcerecvreturned').attr('checked',true);
			this.$el.find('#withdraw').attr('checked',true);
    		this.$el.find('#delete').attr('checked',true);
    		this.collection.setAccessTypes(['LIST']);
    		
    		return this.$el;
		},
		
		renderPageSize: function() {
			this.pageSizeView = new PageSizeView({pageSize: this.collection.pageSize});
    		this.pageSizeView.render();
    		this.pageSizeView.bind('changePageSize', this.selectPageSize, this);
		},

		renderPages: function() {
			this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
			this.pageView.bind('paging', this.selectPage, this);
			this.$el.find('div.tool_absolute > div.dataTables_paginate').remove();
			this.$el.find('div.tool_absolute').append(this.pageView.render().el);
		},
		
		resetList: function(doclist) {
			var fragment = this.collection.url().replace('/api/','');
			//GO.router.navigate(fragment, {trigger: false, pushState: true});
			var bUrl = GO.router.getUrl();
			if (bUrl.indexOf("?") < 0) {
				GO.router.navigate(fragment, {replace: true});
			} else {
				if (bUrl != fragment) {
					GO.router.navigate(fragment, {trigger: false, pushState: true});
				}
			}
			
			$('.list_manager_record > tbody').empty();
			var columns = this.columns;
			var listType = "approval/managelog";
			doclist.each(function(doc){
				var logListItemView = new LogListItemView({ 
					model: doc, 
					listType : listType,
					columns: columns
				});
				$('.list_manager_record > tbody').append(logListItemView.render().el);
			});
			if (doclist.length == 0) {
				$('.list_manager_record > tbody').html(DocListEmptyTpl({
					columns: this.columns,
					lang: { 'doclist_empty': approvalLang['검색 된 문서가 없습니다.'] }
				}));
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
		
		setInitSort: function(property,direction){
			var dataId = null;
			var sortPart = this.$el.find('th');
			sortPart.each(function(){
    			if ( $(this).attr('sort-id') == property ) {
    				dataId = $(this).attr('id');
    			} 
    			if( !$(this).hasClass('sorting_disabled') ) {
    				$(this).removeClass('sorting').addClass('sorting');
    				$(this).removeClass('sorting_desc').addClass('sorting');
    				$(this).removeClass('sorting_asc').addClass('sorting');
    			} 
    		});
			$("#"+dataId).removeClass('sorting').addClass('sorting_'+direction);
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
    	
    	docManageLogSearch: function(searchType) {
			this.accessUserName = $.trim($('#accessUserName').val());
			var startAt = GO.util.toISO8601(GO.util.toMoment($('#startDate').val()));
			var endAt = GO.util.toISO8601(GO.util.toMoment($('#endDate').val()).add('days',1).subtract('seconds',1));
			var checked = [];
			var isChecked = false;
			$('input[type=checkbox]').each(function() {
				if(this.checked) isChecked = true;
		    });
			
			if(!isChecked){
				$.goError(approvalLang['작업 구분을 선택해주세요.']); 
				return;
			}else {
				if($('#list').attr('checked')) checked.push('LIST');
				if($('#view').attr('checked')) checked.push('VIEW');
				if($('#bodymodify').attr('checked')) checked.push('BODYMODIFY');
				if($('#flowmodify').attr('checked')) checked.push('FLOWMODIFY');
				if($('#forcereturn').attr('checked')) checked.push('FORCERETURN');
				if($('#forcerecvreturned').attr('checked')) checked.push('FORCERECVRETURNED');
				if($('#withdraw').attr('checked')) checked.push('WITHDRAW');
				if($('#delete').attr('checked')) checked.push('DELETE');
				checked.join(",");
			}
			
			this.collection.setSearch(startAt, endAt, this.accessUserName, checked, this.initProperty, this.initDirection );
			this.setInitSort(this.initProperty, this.initDirection);
			this.collection.fetch();
		},
		
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return ApprDocumentManageView;
});
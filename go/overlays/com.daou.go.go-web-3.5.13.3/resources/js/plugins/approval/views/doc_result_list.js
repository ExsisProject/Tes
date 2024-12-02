// 결재대기문서 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    "approval/views/doclist/doclist_result_item",
    "approval/models/doclist_item",
    "collections/paginated_collection",
    "hgn!approval/templates/doclist_search_null",
    "hgn!approval/templates/doc_result_list",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
    "i18n!board/nls/board"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	ContentTopView,
	PaginationView,
	PageSizeView,
	DocListItemView,
	DocListItemModel,
	PaginatedCollection,
	DocListEmptyTpl,
	DocumentResultListTpl,
    commonLang,
    approvalLang,
    boardLang
) {
	var preloader = null;
	
	var SearchList = PaginatedCollection.extend({
	    
		model: DocListItemModel,
		
		url: function() {
			var uri = '/api/search/approval';
			if(this.type=='docfolder'){
				uri = '/api/search/docfolder';
			}
			
			var searchParam = $.param({
				stype: this.stype,
				type: this.type,
				keyword : this.keyword,
				fromDate: this.fromDate,
				toDate: this.toDate,
				page: this.pageNo, 
				offset: this.pageSize
			});
			
			if (this.stype == "detail") {
				searchParam =  $.param({
					stype: this.stype,
					type: this.type,
					keyword : this.keyword,
					fromDate: this.fromDate,
					toDate: this.toDate,
					title: this.title,
					docBody: this.docBody,
					attachFileNames: this.attachFileNames,
					attachFileContents: this.attachFileContents,
					formName: this.formName,
					searchTerm: this.searchTerm,
					drafterName: this.drafterName,
					drafterDeptName: this.drafterDeptName,
					activityUserNames : this.activityUserNames,
					docNum : this.docNum,
					dateType: this.dateType,
					page: this.pageNo, 
					offset: this.pageSize,
					searchOption: this.searchOption
				});
			}
			
			return uri + "?" + searchParam;
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
		
		setListParam: function() {
			var searchParams = GO.router.getSearch();
			this.stype = searchParams.stype;
			this.searchTerm = searchParams.searchTerm;
			this.keyword = searchParams.keyword ? searchParams.keyword.replace(/\+/gi, " ") : '' ;
			this.title = searchParams.title;
			this.docBody = searchParams.docBody;
			this.attachFileNames = searchParams.attachFileNames;
			this.attachFileContents = searchParams.attachFileContents;
			this.formName = searchParams.formName;
			this.drafterName = searchParams.drafterName;
			this.drafterDeptName = searchParams.drafterDeptName;
			this.activityUserNames = searchParams.activityUserNames;
			this.docNum = searchParams.docNum;
			this.fromDate = searchParams.fromDate;
			this.toDate = searchParams.toDate;
			this.type = searchParams.type;
			this.dateType = searchParams.dateType;
			this.pageNo = searchParams.page ? searchParams.page : 0;
			this.pageSize = searchParams.offset ? searchParams.offset : 20;
			this.searchOption = searchParams.searchOption ? searchParams.searchOption : "OR";
			sessionStorage.clear();
		}
	});
	
	var SearchListView = Backbone.View.extend({
		columns: {
			'기안일' : approvalLang.기안일,
			'검색결재양식': approvalLang.결재양식, 
			'검색제목': commonLang.제목, 
			'첨부': approvalLang.첨부,
			'검색기안자': approvalLang.기안자,
			'검색문서번호' : approvalLang.문서번호,
			'결재상태': approvalLang.결재상태,
			'결재일' : approvalLang.결재일,
			'count': 8
		},
		el: '#content',
		initialize: function(options) {
		    this.options = options || {};
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');
			this.contentTop = ContentTopView.getInstance();
			this.collection = new SearchList();
			this.collection.setListParam();
			this.collection.bind('reset', this.resetList, this);
			this.collection.fetch({
				statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }
			});
		},
		events: {
		
    	},
		render: function() {
			var lang = {
            	"전자결제 상세 검색": approvalLang["전자결제 상세 검색"],
            	"전사 문서함 상세 검색": approvalLang["전사 문서함 상세 검색"],
                "대상 문서함": approvalLang["대상 문서함"], 
                "검색 기간": approvalLang["검색 기간"], 
                "기안일": approvalLang["기안일"],
                "기안자": approvalLang["기안자"],
                "결재선": approvalLang["결재선"],
                "검색문서번호": approvalLang["문서번호"],
                "완료일": approvalLang["완료일"],
                "오늘": commonLang["오늘"],
                "일": approvalLang["일"],
                "주일": approvalLang["주일"],
                "개월": approvalLang["개월"],
                "년": approvalLang["년"],
                "직접선택":approvalLang["직접선택"],
                "양식을 선택하세요": approvalLang["양식을 선택하세요"], 
                "작성자": commonLang["작성자"], 
                "검색어": commonLang["검색어"], 
                "양식제목": approvalLang["양식제목"],
                "제목": commonLang["제목"], 
                "내용": commonLang["내용"],
                "첨부파일명": approvalLang["첨부파일명"],
                "첨부파일내용" : commonLang["첨부파일 내용"],
                "검색": commonLang["검색"],
                "전체기간" : boardLang['전체기간'],
				"해당 검색 결과가 존재하지 않습니다." : commonLang["해당 검색 결과가 존재하지 않습니다."]
			};
			
			var opt = null, typeName = null,
			formName = this.collection.formName || commonLang['전체'], 
			drafterName = this.collection.drafterName || commonLang['전체'],
			drafterDeptName = this.collection.drafterDeptName || commonLang['전체'],
			activityUserNames = this.collection.activityUserNames || commonLang['전체'], 
			docNum = this.collection.docNum || commonLang['전체'], 
			isAllSearch = this.collection.searchTerm == 'all' ? true : false,
			title = this.collection.title || false, 
			docBody = this.collection.docBody || false, 
			attachFileNames = this.collection.attachFileNames || false, 
			attachFileContents = this.collection.attachFileContents || false, 
			keyword = false;

			if(!title && !docBody && !attachFileNames && !attachFileContents) keyword = commonLang["전체"];
			var isDetailSearch = function(stype){
				if(stype == 'detail') return true; return false;
			};
			if(this.collection.dateType=='draftedAt'){
				typeName = approvalLang["기안일"];
			} else if(this.collection.dateType=='completedAt'){
				typeName = approvalLang["완료일"];
			}
			if(this.collection.stype == 'simple'){
				opt = {
					type : this.collection.type,
					keyword : this.collection.keyword,
					isDetailSearch : isDetailSearch(this.collection.stype)
				};
			}else if(this.collection.stype == 'detail'){
				opt = {
					type : this.collection.type,
					formName : formName,
					drafterName : drafterName,
					drafterDeptName : drafterDeptName,
					activityUserNames : activityUserNames,
					docNum : docNum,
					typeName : typeName,
					title : title,
					isAllSearch : isAllSearch,
					docBody : docBody,
					attachFileNames : attachFileNames,
					attachFileContents : attachFileContents,
					keyword : keyword,
					fromDate : GO.util.shortDate(this.collection.fromDate),
					toDate : GO.util.shortDate(this.collection.toDate),
					isDetailSearch : isDetailSearch(this.collection.stype),
					stype : this.collection.stype
				};
			}
			
			this.$el.html(DocumentResultListTpl({
				lang: lang,
				searchData : opt,
				isDetailSearch : isDetailSearch(this.collection.stype),
				columns: this.columns
			}));
			var totalCount = this.collection.total;
			this.setTitle(totalCount);
    		this.contentTop.render();
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
    		
    		this.renderPageSize();
		},
		setTitle: function(totalCount) {
			this.contentTop.setTitle('<span class="txt">' + approvalLang["검색 결과"] 
			+ '</span><span class="num"> ' 
			+ GO.i18n(commonLang["총건수"], { num: totalCount }) 
			+ '</span>');
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
			var listType = this.collection.type;
			var fragment = this.collection.url().replace('/api/search/approval','approval/search'); 
			if ( listType == "docfolder") {
				fragment = this.collection.url().replace('/api/search/docfolder','docfolder/search'); 
			}
			//GO.router.navigate(fragment, {trigger: false, pushState: true});
			var bUrl = GO.router.getUrl();
			if (bUrl.indexOf("?") < 0) {
				GO.router.navigate(fragment, {pushState : true, replace: true});
			} else {
				if (bUrl != fragment) {
					GO.router.navigate(fragment, {trigger: false, pushState: true, replace: true});
				}
			}
			
			$('.list_approval > tbody').empty();
			var columns = this.columns;
			doclist.each(function(doc){
				var docListItemView = new DocListItemView({ 
					model: doc, 
					listType : listType,
					columns: columns
				});
				$('.list_approval > tbody').append(docListItemView.render().el);
			});
			if (doclist.length == 0) {
				$('.list_approval > tbody').html(DocListEmptyTpl({
					columns: this.columns,
					lang: { 'doclist_empty': commonLang["해당 검색 결과가 존재하지 않습니다."] }
				}));
			}
			var totalCount = this.collection.total;
			this.setTitle(totalCount);
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
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return SearchListView;
});
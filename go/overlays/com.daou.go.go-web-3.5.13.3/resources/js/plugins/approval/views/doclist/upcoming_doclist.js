// 결재예정문서 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "when",
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    "approval/views/doclist/base_doclist",
    "approval/views/doclist/doclist_item",
    "approval/models/doclist_item",
    "approval/collections/appr_base_doclist",
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/upcoming_doclist",
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	when,
	ContentTopView,
	PaginationView,
	PageSizeView,
	BaseDocListView,
	DocListItemView,
	DocListItemModel,
	ApprBaseDocList,
	DocListEmptyTpl,
	UpcomingDocListTpl,
    commonLang,
    approvalLang
) {
	var UpcomingDocList = ApprBaseDocList.extend({
		url: function() {
			return '/api/approval/upcoming?' + this._makeParam()
		}
	});
	
	var UpcomingDocListView = BaseDocListView.extend({
		columns: {
			'기안일' : approvalLang['기안일'],
			'기안자': approvalLang['기안자'],
			'결재선': approvalLang['결재선'],
			'결재양식': approvalLang['결재양식'], 
			'긴급': approvalLang['긴급'], 
			'제목': commonLang['제목'], 
			'첨부': approvalLang['첨부'],
			'count': 7
		},
		el: '#content',
        docFieldModel : null,
		usePeriod : true,
        docFolderType : 'appr_wait',
		initialize: function(options) {
		    this.options = options || {};
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');
			this.contentTop = ContentTopView.getInstance();
			this.collection = new UpcomingDocList();
			
			this.initProperty = "activityGroup.apprFlow.document.draftedAt";
			this.initDirection = "desc";
			this.ckeyword = "";
			var baseUrl = sessionStorage.getItem('list-history-baseUrl');
			if (baseUrl) {
				baseUrl = baseUrl.replace(/#/gi, "");
			}
			if ( baseUrl && baseUrl == 'approval/upcoming' ) {
				this.initProperty = sessionStorage.getItem('list-history-property');
				this.initDirection = sessionStorage.getItem('list-history-direction');
				this.initSearchtype = sessionStorage.getItem('list-history-searchtype');
				this.ckeyword = sessionStorage.getItem('list-history-keyword').replace(/\+/gi, " ");
				this.duration = sessionStorage.getItem('list-history-duration');
				this.fromDate = sessionStorage.getItem('list-history-fromDate');
				this.toDate = sessionStorage.getItem('list-history-toDate');
				this.collection.setListParam();
			} else {
				this.collection.setDuration();
				this.collection.setSort(this.initProperty,this.initDirection);
			}
			sessionStorage.clear();
			
			this.collection.bind('reset', this.resetList, this);
            BaseDocListView.prototype.initialize.call(this, options);
		},
		
		events: function(){
			return _.extend({},BaseDocListView.prototype.events, {
				'click .sorting' : 'sort',
				'click .sorting_desc' : 'sort',
				'click .sorting_asc' : 'sort'
			});
    	},
		
		renderLayout : function(){
			var lang = {
				'제목': commonLang['제목'],
				'기안자': approvalLang['기안자'],
				'검색': commonLang['검색'],
                '결재양식': approvalLang['결재양식'],
                '결재선': approvalLang['결재선'],
				'placeholder_search' : commonLang['플레이스홀더검색'],
				'기안부서' : approvalLang['기안부서'],
				'search_all' : approvalLang['전체기간'],
				'search_month' : approvalLang['개월'],
				'search_year' : approvalLang['년'],
				'search_input' : approvalLang['기간입력']
			};
			this.$el.html(UpcomingDocListTpl({
				lang: lang
			}));
			this.contentTop.setTitle(approvalLang['결재 예정 문서']);
    		this.contentTop.render();
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
    		this.renderPageSize();
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
			var bUrl = GO.router.getUrl().replace("#","");
			if (bUrl.indexOf("?") < 0) {
				GO.router.navigate(fragment, {replace: true});
			} else {
				if (bUrl != fragment) {
					GO.router.navigate(fragment, {trigger: false, pushState: true});
				}
			}
			
			$('.list_approval > tbody').empty();
			var columns = this.columns;
			var listType = "approval";
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
					lang: { 'doclist_empty': approvalLang['결재할 문서가 없습니다.'] }
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

		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return UpcomingDocListView;
});
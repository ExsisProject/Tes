//전사 문서함 HOME
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    "approval/views/doclist/doclist_item",
    "approval/views/doclist/doclist_csv_download",
    "approval/models/doclist_item",
    "collections/paginated_collection",
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/company_home_doclist",
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
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
	DocListCsvDownloadView,
	DocListItemModel,
	PaginatedCollection,
	DocListEmptyTpl,
	CompanyHomeDocListTpl,
    commonLang,
    approvalLang
) {
	var preloader = null;
	
	var CompanyHomeDocList = PaginatedCollection.extend({
		model: DocListItemModel.extend({
			idAttribute: "_id",
		}),
		url: function() {
		    return this._makeURL(false);
		},
		getCsvURL: function() {
		    return this._makeURL(true);
		},
		_makeURL: function(isCsv) {
		    var path = '/api/docfolder';
		    if (isCsv) {
		        path += '/csv'
		    }
		    return path + '?' + $.param({
		        page: this.pageNo, 
		        offset: this.pageSize, 
		        property: this.property, 
		        direction: this.direction, 
		        searchtype : this.searchtype, 
		        keyword : this.keyword
	        });
		},
		setSort: function(property,direction) {
			this.property = property;
			this.direction = direction;
			this.pageNo = 0;
		},
		setSearch: function(searchtype,keyword) {
			this.searchtype = searchtype;
			this.keyword = keyword;
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
		
		setListParam: function() {
			this.pageNo = sessionStorage.getItem('list-history-pageNo');
			this.pageSize = sessionStorage.getItem('list-history-pageSize');
			this.property = sessionStorage.getItem('list-history-property');
			this.direction = sessionStorage.getItem('list-history-direction');
			this.searchtype = sessionStorage.getItem('list-history-searchtype');
			this.keyword = sessionStorage.getItem('list-history-keyword').replace(/\+/gi, " ");
		}
	});
	
	var CompanyHomeDocListView = Backbone.View.extend({
		columns: {
			'결재일' : approvalLang.결재일,
			'결재양식': approvalLang.결재양식, 
			'제목': commonLang.제목, 
			'첨부': approvalLang.첨부,
			'기안자': approvalLang.기안자,
			'문서번호': approvalLang.문서번호,
			'count': 6
		},
		el: '#content',
		initialize: function(options) {
		    this.options = options || {};
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');
			this.contentTop = ContentTopView.getInstance();
			this.collection = new CompanyHomeDocList();
			
			this.initProperty = "completedAt";
			this.initDirection = "desc";
			this.ckeyword = "";
			var baseUrl = sessionStorage.getItem('list-history-baseUrl');
			if ( baseUrl && baseUrl == 'docfolder' ) {
				this.initProperty = sessionStorage.getItem('list-history-property');
				this.initDirection = sessionStorage.getItem('list-history-direction');
				this.ckeyword = sessionStorage.getItem('list-history-keyword').replace(/\+/gi, " ");
				this.collection.setListParam();
			} else {
				this.collection.setSort(this.initProperty,this.initDirection);
			}
			sessionStorage.clear();
			
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
			'click .sorting' : 'sort',
			'click .sorting_desc' : 'sort',
			'click .sorting_asc' : 'sort',
			'click .btn_search2' : 'search',
			'keypress input#keyword': 'searchByEnter'
    	},
		render: function() {
			var lang = {
				'제목': commonLang['제목'],
				'기안자': approvalLang['기안자'],
				'검색': commonLang['검색'],
				'결재양식': approvalLang['결재양식'],
				'placeholder_search' : commonLang['플레이스홀더검색']
			};
			
			this.$el.html(CompanyHomeDocListTpl({
				lang: lang,
				columns: this.columns
			}));
			
			this.setInitSort(this.initProperty,this.initDirection);
			this.contentTop.setTitle(approvalLang['최근등록문서']);
    		this.contentTop.render();
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
    		this.$el.find('input[placeholder]').placeholder();
    		this.renderPageSize();
    		
    		new DocListCsvDownloadView({
    		    getDownloadURL: $.proxy(this.collection.getCsvURL, this.collection),
    		    appendTarget: this.$el.find('#docToolbar > div.critical')
    		}).render();
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
			var listType = "docfolder";
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
					lang: { 'doclist_empty': approvalLang['문서가 없습니다.'] }
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
    		$('#keyword').val(this.ckeyword);
		},
		// 정렬
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
		// 검색
		search: function() {
			var searchtype = $('#searchtype').val();
    		var keyword =  $.trim($('#keyword').val());
			if($('input#keyword').attr('placeholder') === this.$el.find('input#keyword').val()){
				keyword = '';
			}
    		if( !keyword ){
    			$.goMessage(approvalLang["검색어를 입력하세요."]);
    			$('#keyword').focus();
    			return false;
    		}
    		if (!$.goValidation.isCheckLength(2, 64, keyword)) {
    			$.goMessage(GO.i18n(approvalLang['0자이상 0이하 입력해야합니다.'],{"arg1" : "2","arg2" : "64"}));
    			$('#keyword').focus();
    			return false;
    		}
    		this.collection.setSearch(searchtype,keyword);
    		this.collection.fetch();
		},

		// 엔터 검색
		searchByEnter: function(e) {
	    	if (e.keyCode != 13) return;
			if(e){
				e.preventDefault();
			}
	    	$(e.currentTarget).focusout().blur();    	
	    	this.search();
	    },
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return CompanyHomeDocListView;
});
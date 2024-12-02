define('docs/views/docslist/latest_update', function(require) {
	
	var $ = require("jquery");
	var _ = require("underscore");
	var Backbone = require("backbone");
	var when = require("when");
    var GO = require("app");

    var BaseDocsView = require("docs/views/base_docs");
    var BaseDocsListView = require("docs/views/docslist/base_docs_list");
	var PageSizeView = require("views/pagesize");
    var PaginationView = require("views/pagination");
    var DocListItemView = require("docs/views/docslist/doclist_item");
    
	var BaseDocsList = require("docs/collections/docs_base_list");
	var DocListItemModel = require("docs/models/docs_doc_item");
	
	var LatestDocsListTpl = require("hgn!docs/templates/docslist/base_docslist");
	var DocsListEmptyTpl = require("hgn!docs/templates/docslist/docslist_empty");
	
	
	var commonLang = require("i18n!nls/commons");
	var docsLang = require("i18n!docs/nls/docs");
	var approvalLang = require("i18n!approval/nls/approval");
	var lang = {
			'제목': docsLang['제목'], 
			'내용' : commonLang['내용'],
			'등록자': docsLang['등록자'],
			'검색': commonLang['검색'],
			'placeholder_search' : commonLang['플레이스홀더검색'],
			'search_all' : approvalLang['전체기간'],
			'search_month' : approvalLang['개월'],
			'search_year' : approvalLang['년'],
			'search_input' : approvalLang['기간입력']
		};
	var LatestUpdateList = BaseDocsList.extend({
		initialize: function(options){
			BaseDocsList.prototype.initialize.apply(this, arguments);
			this.folderType = options.folderType;
		},
		
		model: DocListItemModel,
		
		url: function() {
			return '/api/docs/folder/latestupdate?' + this._makeParam();
		}
	});

	return BaseDocsView.extend({
		
        initialize: function (options) {
        	this.initProperty = "completeDate";
        	this.initDirection = "desc";
        	this.initPage = 20;
        	this.ckeyword = "";
        	
        	this.collection = new LatestUpdateList({folderType : "latestupdate"});
        	this.collection.usePeriod = true;
        	
        	var baseUrl = sessionStorage.getItem('list-history-baseUrl');
        	var regexp = new RegExp('(#)?docs/folder/latestupdate$');
            if ( baseUrl && regexp.test(baseUrl)) {
            	this.initProperty = sessionStorage.getItem('list-history-property');
                this.initDirection = sessionStorage.getItem('list-history-direction');
                this.initSearchtype = sessionStorage.getItem('list-history-searchtype');
                this.ckeyword = sessionStorage.getItem('list-history-keyword').replace(/\+/gi, " ");
				this.duration = sessionStorage.getItem('list-history-duration');
				this.fromDate = sessionStorage.getItem('list-history-fromDate');
				this.toDate = sessionStorage.getItem('list-history-toDate');
            	this.collection.setListParam();
            }else{
            	this.collection.pageSize = this.initPage;
            	this.collection.setDuration();
            	this.collection.setSort(this.initProperty,this.initDirection);
            }
            sessionStorage.clear();
            this.collection.bind('reset', this.resetList, this);
        	
        	
            BaseDocsView.prototype.initialize.apply(this, arguments);
        },
        
        columns: {
			'등록일' : commonLang['등록일'],
			'제목': docsLang['제목'], 
			'첨부': docsLang['첨부'],
			'문서위치': docsLang['위치'], 
			'등록자': docsLang['등록자'],
			'문서번호': docsLang['문서번호'],
			'count': 6,
		},
		
		sorts : {
    		"등록일" : "completeDate",
    		"제목" : "title",
    		"등록자" : "creatorName",
        },

        render: function () {
            BaseDocsView.prototype.render.apply(this, arguments);
            $("#content header h1").text(docsLang["최근 업데이트 문서"]);
            this.$el.html(LatestDocsListTpl({
                lang : lang,
                usePage : true
            }));
            this._renderLatestUpdateList();
            this._renderPageSize();
            this._renderPages();
            return this;
        },
        
        _renderPageSize: function() {
        	this.pageSizeView = new PageSizeView({pageSize: this.collection.pageSize});
    		this.pageSizeView.render();
    		this.pageSizeView.bind('changePageSize', this.selectPageSize, this);
        },
        
        _renderPages: function() {
			this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
			this.pageView.bind('paging', this.selectPage, this);
			this.$el.find('div.tool_absolute > div.dataTables_paginate').remove();
			this.$el.find('div.tool_absolute').append(this.pageView.render().el);
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
        _renderLatestUpdateList: function(){
            var listView = new BaseDocsListView({
                collection : this.collection,
                columns : this.columns,
                sorts : this.sorts,
            	duration : this.duration,
            	fromDate : this.fromDate,
            	toDate : this.toDate,
                usePeriod : true,
                usePage : true
            });
            this.$el.find('#base_doclist').append(listView.render().el);
            listView.setInitSort();
            
            this._bindEvent(listView);
        },
        
        _bindEvent: function(baseView) {
        	this.$el.find("input#keyword").keydown(function(e){
        		baseView.searchByEnter(e);
            });
            this.$el.find(".btn_search2").click(function(e){
            	baseView.search();
            });
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
			
			$('.list_docs > tbody').empty();
			var columns = this.columns;
			var listType = "docs";
            var self = this;
			doclist.each(function(doc){
                doc.folderType = self.collection.folderType;
				var docListItemView = new DocListItemView({
                    model: doc,
                    listType : listType,
                    columns: columns
                });
				$('.list_docs > tbody').append(docListItemView.render().el);
			});
			if (doclist.length == 0) {
				$('.list_docs > tbody').html(DocsListEmptyTpl({
					columns: columns,
					lang: { 'doclist_empty': docsLang['문서없음'] }
				}));
			}
			this.renderPages();
		},
		renderPages: function() {
			this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
			this.pageView.bind('paging', this.selectPage, this);
			this.$el.find('div.tool_absolute > div.dataTables_paginate').remove();
			this.$el.find('div.tool_absolute').append(this.pageView.render().el);
		},
    });
});
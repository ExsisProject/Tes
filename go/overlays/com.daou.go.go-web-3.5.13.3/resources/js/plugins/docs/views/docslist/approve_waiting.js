define('docs/views/docslist/approve_waiting', function(require) {
	
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
    var SideView = require("docs/views/side");
    
	var BaseDocsList = require("docs/collections/docs_base_list");
	var DocListItemModel = require("docs/models/docs_doc_item");
	
	var ApproveWaitingDocsListTpl = require("hgn!docs/templates/docslist/base_docslist");
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
			'search_input' : approvalLang['기간입력'],
			'일괄승인' : docsLang['일괄 승인']
		};
	var ApproveWaitingList = BaseDocsList.extend({
		initialize: function(options){
			BaseDocsList.prototype.initialize.apply(this, arguments);
			this.folderType = options.folderType;
		},
		
		model: DocListItemModel,
		
		url: function() {
			return '/api/docs/folder/approvewaiting?' + this._makeParam();
		}
	});
	
	//일괄승인
	var BulkApproveList = Backbone.Model.extend({
		url : function(){
			var url = '/api/docs/approved';
			return url;
		}
	});

	return BaseDocsView.extend({
		
        initialize: function (options) {
        	this.initProperty = "requestDate";
        	this.initDirection = "desc";
        	this.initPage = 20;
        	this.ckeyword = "";
        	
        	this.collection = new ApproveWaitingList({folderType : "approvewaiting"});
        	this.collection.usePeriod = true;
        	
        	var baseUrl = sessionStorage.getItem('list-history-baseUrl');
        	var regexp = new RegExp('(#)?docs/folder/approvewaiting$');
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
        	'선택' : commonLang["선택"],
			'등록요청일' : docsLang['등록 요청일'],
			'제목': docsLang['제목'], 
			'첨부': docsLang['첨부'],
			'문서위치': docsLang['위치'], 
			'등록자': docsLang['등록자'],
			'문서번호': docsLang['문서번호'],
			'count': 7,
		},
		
		sorts : {
    		"등록요청일" : "requestDate",
    		"제목" : "title",
    		"등록자" : "creatorName",
        },

        render: function () {
            BaseDocsView.prototype.render.apply(this, arguments);
            $("#content header h1").text(docsLang["승인 대기 문서"]);
            this.$el.html(ApproveWaitingDocsListTpl({
                lang : lang,
                usePage : true,
                useToolbar : true,
                isApproveWaiting : true
            }));
            this._renderApproveWaitingList();
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
        
        _renderApproveWaitingList: function(){
        	this.checkboxColumn = {
					id : 'checkedAllApproveWaitingDocs',
					name : 'checkedAllApproveWaitingDocs'
			}
            var listView = new BaseDocsListView({
                collection : this.collection,
                columns : this.columns,
                sorts : this.sorts,
                usePeriod : true,
            	duration : this.duration,
            	fromDate : this.fromDate,
            	toDate : this.toDate,
                usePage : true,
                isCheckboxVisible: true,
                checkboxColumn : this.checkboxColumn
            });
            this.$el.find('#base_doclist').append(listView.render().el);
            listView.setInitSort();
            
            this._bindEvent(listView);
        },
        
        _bindEvent: function(baseView) {
        	var self = this;
        	this.$el.find("input#keyword").keydown(function(e){
        		baseView.searchByEnter(e);
            });
            this.$el.find(".btn_search2").click(function(e){
            	baseView.search();
            });
            this.$el.find("input:checkbox").click(function(e){
            	baseView.toggleCheckbox(e);
            });
            this.$el.find("a#bulkApproved").click(function(e) {
            	self._bulkApproved(e);
            })
        },
        _bulkApproved: function(e) {
        	var $checkedList = $('input.doclist_item_checkbox:checked'),
	            self = this;
	        
	        if ($checkedList.length < 1) {
	            $.goMessage(docsLang['선택문서없음']);
	            return;
	        }
	        var docIds = [];
			$checkedList.each(function(){
				docIds.push($(this).attr('data-id'));
			});
	        var bulkApproveList = new BulkApproveList();
	        $.goConfirm(docsLang['일괄승인확인'], '',
				function() {
					var preloader = $.goPreloader();
					bulkApproveList.set({'ids' : docIds }),
					bulkApproveList.save({
					}, {
						silent : true,
						type : 'PUT',
						beforeSend: function(){
	    			        preloader.render();
	    			    },
						success : function() {
							$.goMessage(docsLang["일괄승인완료"]);
							$('input:checkbox').attr('checked', false);
							self.collection.fetch();
						},
						error : function(){
							$.goError(commonLang['실패했습니다.']);
						},
						complete: function() {
	    			    	preloader.release();
	    			    }
					});
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
                    columns: columns,
                    isCheckboxVisible: true
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
			this.renderSide();
		},
		renderSide: function () {
            this.sideView = new SideView({});
            this.sideView.refreshWaitingCount();
        },
		renderPages: function() {
			this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
			this.pageView.bind('paging', this.selectPage, this);
			this.$el.find('div.tool_absolute > div.dataTables_paginate').remove();
			this.$el.find('div.tool_absolute').append(this.pageView.render().el);
		},
    });
});
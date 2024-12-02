define('docs/views/docslist/latest_read', function(require) {
	
	var $ = require("jquery");
	var _ = require("underscore");
	var Backbone = require("backbone");
	var when = require("when");
    var GO = require("app");

    var DocListItemView = require("docs/views/docslist/doclist_item");
    var BaseDocsView = require("docs/views/base_docs");
    var BaseDocsListView = require("docs/views/docslist/base_docs_list");
	
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
	var LatestReadList = BaseDocsList.extend({
		initialize: function(options){
			BaseDocsList.prototype.initialize.apply(this, arguments);
			this.folderType = options.folderType;
		},
		
		model: DocListItemModel,
		
		url: function() {
			return '/api/docs/folder/latestread?' + this._makeParam();
		}
	});

	return BaseDocsView.extend({
		
        initialize: function (options) {
        	this.initProperty = "updatedAt";
        	this.initDirection = "desc";
        	this.collection = new LatestReadList({folderType : "latestread"});
        	this.collection.setPageSize(50);
        	this.collection.setSort(this.initProperty,this.initDirection);
        	
        	var baseUrl = sessionStorage.getItem('list-history-baseUrl');
        	var regexp = new RegExp('(#)?docs/folder/latestread$');
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
			'열람일' : docsLang['최근 열람일'],
			'등록일' : commonLang['등록일'],
			'제목': docsLang['제목'], 
			'첨부': docsLang['첨부'],
			'문서위치': docsLang['위치'], 
			'등록자': docsLang['등록자'],
			'문서번호': docsLang['문서번호'],
			'count': 7
		},
		
		sorts : {
    		"열람일" : "updatedAt" 
        },

        render: function () {
            BaseDocsView.prototype.render.apply(this, arguments);
            $("#content header h1").text(docsLang["최근 열람 문서"]);
            this.$el.html(LatestDocsListTpl({
                lang : lang,
                usePage : false
            }));
            this._renderLatestReadList();
            return this;
        },
        
        _renderLatestReadList: function(){
            var listView = new BaseDocsListView({
                collection : this.collection,
                columns : this.columns,
                sorts : this.sorts,
            	usePage : false,
            	usePeriod : false
            });
            this.$el.find('#base_doclist').append(listView.render().el);
            listView.setInitSort();
            
            this._bindEvent(listView);
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
		},
        
        _bindEvent: function(baseView) {
        	this.$el.find("input#keyword").keydown(function(e){
        		baseView.searchByEnter(e);
            });
            this.$el.find(".btn_search2").click(function(e){
            	baseView.search();
            });
        }
    });
});
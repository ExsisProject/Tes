define('docs/views/docslist/normal_list', function(require) {
	
	var $ = require("jquery");
	var _ = require("underscore");
	var Backbone = require("backbone");
	var when = require("when");
    var GO = require("app");
    
    var SelectFolderPopup = require('docs/views/select_folder_popup');

    var BaseDocsView = require("docs/views/base_docs");
    var BaseDocsListView = require("docs/views/docslist/base_docs_list");
	var PageSizeView = require("views/pagesize");
    var PaginationView = require("views/pagination");
    var ContentTopView = require('docs/views/content_top');
    var DocListItemView = require("docs/views/docslist/doclist_item");
    var SideView = require("docs/views/side");
    
	var BaseDocsList = require("docs/collections/docs_base_list");
	var DocListItemModel = require("docs/models/docs_doc_item");
	
	var DocsListTpl = require("hgn!docs/templates/docslist/base_docslist");
    var DocsFolderInfo = require("docs/models/doc_folder_info");
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
			'등록' : commonLang['등록'],
			'삭제' : commonLang['삭제'],
			'이동' : commonLang['이동'],
			'목록다운로드' : commonLang['목록 다운로드']
		};
	
	var docsList = BaseDocsList.extend({
		initialize: function(options){
			BaseDocsList.prototype.initialize.apply(this, arguments);
			this.folderId = options.folderId;
		},
		
		model: DocListItemModel,
		
		url: function() {
			return '/api/docs/folder/'+this.folderId+'/docses?' + this._makeParam();
		}
	});
	
	var BulkDeleteList = Backbone.Model.extend({
		url : function(){
			var url = '/api/docs';
			return url;
		}
	});
	
	var BulkMoveList = Backbone.Model.extend({
		url : function(){
			var url = ['/api/docs/foler/' + this.folderId + '/docs/move/' + this.targetFolderId].join('/');
			return url;
		},
		setFolderId: function(folderId) {
			this.folderId = folderId;
		},
		setTargetFolderId : function(targetFolderId) {
			this.targetFolderId = targetFolderId;
		}
	});

	return BaseDocsView.extend({
		
        initialize: function (options) {
        	this.initProperty = "completeDate";
        	this.initDirection = "desc";
        	this.initPage = 20;
        	this.ckeyword = "";
        	
        	this.collection = new docsList({folderId : options.folderId});
        	this.folderModel = new DocsFolderInfo({id : options.folderId});
        	this.collection.usePeriod = true;
        	
        	var baseUrl = sessionStorage.getItem('list-history-baseUrl');
        	var regexp = new RegExp('(#)?docs/folder/'+options.folderId+'/docses$');
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
            '선택' : commonLang['선택'],
			'등록일' : commonLang['등록일'],
			'제목': docsLang['제목'], 
			'첨부': docsLang['첨부'],
			'등록자': docsLang['등록자'],
			'count': 5
		},
		
		sorts : {
    		"등록일" : "completeDate",
    		"제목" : "title",
    		"등록자" : "creatorName"
        },

        fetchFolderInfo: function(){
            return $.when(
                this.folderModel.fetch({
                    statusCode: {
                        403: function() { GO.util.error('403'); },
                        404: function() { GO.util.error('404', { "msgCode": "400-common"}); },
                        500: function() { GO.util.error('500'); }
                    },

                	success: function(model, resp) {
                		if(!resp.data.readable) {
                			GO.util.error('403');
                		}
                	}
                })
            );
        },

        renderContentTop: function(layoutView){
            var self = this;
            var contentTopView = new ContentTopView({});

            layoutView.getContentElement().html(contentTopView.el);
            contentTopView.render();
            layoutView.setContent(self);
            contentTopView.setTitle(GO.util.escapeHtml(this.folderModel.getName()));
            var isFavorite = this.folderModel.isFavorite();
            contentTopView.setFavoriteTmpl(isFavorite, self.folderModel.get("id"));
        },

        render: function () {
            BaseDocsView.prototype.render.apply(this, arguments);
            this.isRemovable = this.folderModel.isRemovable();
            
            if(!this.isRemovable){
            	this.columns = {
        			'등록일' : commonLang['등록일'],
        			'제목': docsLang['제목'], 
        			'첨부': docsLang['첨부'],
        			'등록자': docsLang['등록자'],
        			'count': 4
        		};
            }
            

            if(this.folderModel.useDocNum()){
            	this.columns['문서번호'] = docsLang['문서번호'];
            	this.columns['count'] = this.columns['count'] + 1;
            }else{
            	if(this.columns['문서번호']){
            		delete this.columns['문서번호']
            		this.columns['count'] = this.columns['count'] - 1;
            	}
            }
            
            this.$el.html(DocsListTpl({
                lang : lang,
                columns: this.columns,
                usePage : true,
                useToolbar : true,
                isReadable : this.folderModel.isReadable(),
                isWritable : this.folderModel.isWritable(),
                isRemovable : this.isRemovable
            }));
            this._renderList();
            this._renderPageSize();
            this._renderPages();
            return this;
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
			this._renderPages();
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
        _renderList: function(){
        	this.checkboxColumn = {
					id : 'checkedAllDocs',
					name : 'checkedAllDocs'
			}
            var listView = new BaseDocsListView({
                collection : this.collection,
                columns : this.columns,
                sorts : this.sorts,
            	duration : this.duration,
            	fromDate : this.fromDate,
            	toDate : this.toDate,
                usePeriod : true,
                usePage : true,
                isCheckboxVisible : this.isRemovable ? true : false,
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
            this.$el.find("a#download").click(function(e){
            	//목록다운로드
            	self._downloadList();
            });
            this.$el.find("a#bulkDelete").click(function(e){
            	//삭제
            	self._bulkDelete(e);
            });
            this.$el.find("a#createDocs").click(function(e){
            	//등록
            	self._createDocs();
            });
            this.$el.find("a#bulkMove").click(function(e){
            	self._moveDocs(e);
            });
        },
        _moveDocs : function(e) {
        	var $checkedList = $('input.doclist_item_checkbox:checked'),
	            self = this,
	            folderId = self.folderModel.get('id');
	        if ($checkedList.length < 1) {
	            $.goMessage(docsLang['선택문서없음']);
	            return;
	        }
	        var docsInfoIds = [];
			$checkedList.each(function(){
				docsInfoIds.push($(this).attr('data-docsinfoid'));
			});
			
        	this.popup = $.goPopup({
                pclass : "layer_normal doc_layer",
                header : docsLang["문서이동"],
                width : 300,
                top : "40%",
                contents : "<div class='list_wrap'></div>",
                buttons : [{
                	btext : commonLang["확인"],
                	btype : "confirm",
                	callback : function(rs){
                		var targetId = (rs.find('.on span[data-folderid]').attr('data-folderid'));
                        if (!targetId) {
                            $.goMessage(docsLang["문서함을 선택해 주세요."]);
                            return false;
                        }

						if(targetId == folderId){
                            $.goMessage(docsLang["다른문서함선택알림"]);
							return false;
						}

                        var bulkMoveList = new BulkMoveList();
                        bulkMoveList.setFolderId(folderId);
                        bulkMoveList.setTargetFolderId(targetId);
                    	
                    	var preloader = $.goPreloader();
                    	bulkMoveList.save({
							'ids' : docsInfoIds
						}, {
                            silent : true,
                            type : 'PUT',
                            beforeSend: function(){
            			        preloader.render();
            			    },
                            success : function(m, r) {
                                $.goMessage(docsLang['문서이동완료']);
                                rs.close();
                                $('input:checkbox').attr('checked', false);
    							self.collection.fetch();
                            },
                            error : function(model, rs) {
                                var responseObj = rs.responseJSON;
                                if (!_.isUndefined(responseObj) && responseObj.message) {
                                    $.goError(responseObj.message);
                                    return false;
                                } else {
                                    $.goError(commonLang['저장에 실패 하였습니다.']);
                                    return false;
                                };
                            },
                            complete: function() {
            			    	preloader.release();
            			    }
                        });
                	}
                },
               {
                    btext : commonLang["취소"],
                    btype : "normal"
                }]
            });
            new SelectFolderPopup({
            	"popupType" : "move"
            }).renderList().then($.proxy(function(){
                this.popup.reoffset();
            },this));
        },
        _createDocs : function() {
        	var self = this,
        		folderId = self.folderModel.get('id');
        	GO.router.navigate("docs/create/" + folderId, true);
        },
        _downloadList : function() {
        	var self = this,
        		folderId = self.folderModel.get("id");
        	
        	window.location.href = GO.contextRoot + "api/docs/folder/" + folderId + "/docses/download";
        },
        _bulkDelete: function(e) {
        	var $checkedList = $('input.doclist_item_checkbox:checked'),
	            self = this;
	        
	        if ($checkedList.length < 1) {
	            $.goMessage(docsLang['선택문서없음']);
	            return;
	        }
	        var docsInfoIds = [];
			$checkedList.each(function(){
				docsInfoIds.push($(this).attr('data-docsinfoid'));
			});
	        var bulkDeleteList = new BulkDeleteList();
	        $.goConfirm(docsLang['문서삭제확인'], docsLang['문서삭제설명'],
				function() {
					var preloader = $.goPreloader();
					bulkDeleteList.set({'ids' : docsInfoIds }),
					bulkDeleteList.save({
					}, {
						silent : true,
						type : 'DELETE',
						beforeSend: function(){
	    			        preloader.render();
	    			    },
						success : function() {
							$.goMessage(commonLang["삭제되었습니다."]);
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
        }
    });
});
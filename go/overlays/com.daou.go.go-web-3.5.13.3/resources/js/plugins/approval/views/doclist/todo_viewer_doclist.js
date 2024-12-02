// 참조/열람 대기 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    
    "approval/views/doclist/doclist_item",
    "approval/views/doclist/base_doclist",
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    
    "approval/collections/todo_viewer_doclist",
    "approval/models/doclist_item",
    
    "hgn!approval/templates/todo_viewer_doclist",
    "hgn!approval/templates/doclist_empty",
    
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function(
    $,
    _,
    Backbone,
    GO,
    
    DocListItemView,
    BaseDocListView,
    ContentTopView,
    PaginationView,
    PageSizeView,
    
    TodoViewerDocCollection,
    DocListItemModel,
    
    TodoViewerDocListTpl,
    DocListEmptyTpl,
    
    commonLang,
    approvalLang
) {
	
	var lang = {
			'제목': commonLang['제목'],
            '기안자': approvalLang['기안자'],
            '결재선': approvalLang['결재선'],
            '기안부서' : approvalLang['기안부서'],
            '문서번호': approvalLang['문서번호'],
            '검색': commonLang['검색'],
            '결재양식': approvalLang['결재양식'],
            'placeholder_search' : commonLang['플레이스홀더검색'],
			'전체': approvalLang['전체'],
			'참조' : approvalLang['참조'],
			'열람' : approvalLang['열람'],
			'일괄 확인' : approvalLang['일괄 확인'],
			'정말로 일괄 확인 하시겠습니까?' : approvalLang['정말로 일괄 확인 하시겠습니까?']
    };
	
	var TodoViewerCountModel = Backbone.Model.extend({
        url: '/api/approval/todoviewer/count'
    });
	
    var TodoViewerListView = BaseDocListView.extend({

        columns: {
            '접수일' : approvalLang['접수일'],
            '결재양식': approvalLang['결재양식'],
            '긴급': approvalLang['긴급'], 
            '제목': commonLang['제목'],
            '첨부': approvalLang['첨부'],
            '기안자': approvalLang['기안자'],
            '담당자': approvalLang['담당자'],
            '결재상태': approvalLang['결재상태'],
            '원문번호': approvalLang['원문번호'],
            '수신부서': approvalLang['수신부서'],
            'count': 10
        },

        el: '#content',
        docFolderType : 'todo_ref',
        usePeriod : true,
        events: {
        	'click input:checkbox' : 'toggleCheckbox',
            'click .tab_nav > li' : 'selectTab',
            'click .sorting' : 'sort',
            'click .sorting_desc' : 'sort',
            'click .sorting_asc' : 'sort',
            'click .btn_search2' : 'search',
            'keypress input#keyword': 'searchByEnter',
            'click a#bulkRead' : 'onBulkReadClicked'
        },

        initialize: function(options) {
            this.options = options || {};
            this.type = this.options.type;
            if (_.contains(this.type, "?")) {

                /**
                 * router의 ":path params" 부분이 "query parameter까지 함께 포함하여 전달해준다.
                 * 여기서 순수하게 문서 상태 값-type-만 반환하기 위해 아래의 문자열 작업이 이뤄진다.
                 */
                this.type = this.type.substr(0, this.type.indexOf("?"));
            }
            this.contentTop = ContentTopView.getInstance();
            this.collection = new TodoViewerDocCollection(this.type);
            this.initProperty = "document.draftedAt";
            this.initDirection = "desc";
            this.initPage = 20;
            this.ckeyword = "";

            _.bindAll(this, 'render', 'renderPageSize', 'renderPages');
            this.todoViewerCountModel = new TodoViewerCountModel();
            var baseUrl = sessionStorage.getItem('list-history-baseUrl');
			if (baseUrl) {
				baseUrl = baseUrl.replace(/#/gi, "");
			}
            if ( baseUrl && baseUrl == "approval/todoviewer/all" ) {
                this.initProperty = sessionStorage.getItem('list-history-property');
                this.initDirection = sessionStorage.getItem('list-history-direction');
                this.initSearchtype = sessionStorage.getItem('list-history-searchtype');
                this.ckeyword = sessionStorage.getItem('list-history-keyword').replace(/\+/gi, " ");
                this.collection.setListParam();
            } else {
                this.collection.pageSize = this.initPage;
                this.collection.setSort(this.initProperty,this.initDirection);
            }
            sessionStorage.clear();
            this.checkboxColumn = {
					id : 'checkedAllDeptDoc',
					name : 'checkedAllDeptDoc'
			}
            this.collection.bind('reset', this.resetList, this);
            BaseDocListView.prototype.initialize.call(this, options);
            /*this.collection.fetch({
                statusCode: {
                    403: function() { GO.util.error('403'); },
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    500: function() { GO.util.error('500'); }
                }
            });*/
        },

        renderLayout: function() {
            this.$el.html(TodoViewerDocListTpl({
                buttons: this.buttons,
                lang: lang
            }));
            if (this.type.indexOf("?") >=0) {
                this.type = this.type.substr(0,this.type.indexOf("?"));
            }

            $('#tab_' + this.type).addClass('on');

            var contentTitle = approvalLang['참조/열람 대기 문서'];
            this.contentTop.setTitle(contentTitle);
            this.contentTop.render();

            this.$el.find('header.content_top').replaceWith(this.contentTop.el);
            //this.$el.find('input[placeholder]').placeholder();
            this.renderPageSize();
        },
        
        toggleCheckbox : function(e){
        	var $target = $(e.currentTarget),
            $checkAllBox = $('input#checkedAllDeptDoc'),
            targetChecked = $target.is(':checked');
        
	        if ($target.attr('id') == $checkAllBox.attr('id')) {
	            $('input[type="checkbox"][name="checkbox"]').attr('checked', targetChecked);
	        }
	        
	        if ($target.hasClass('doclist_item_checkbox')) {
	            if (!targetChecked) {
	                $checkAllBox.attr('checked', targetChecked);
	            }
	        }
		},
		
		renderTitle: function(title) {
			this.contentTop.setTitle(title);
			this.contentTop.render();
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
            this.$el.find('#checkedAllDeptDoc').attr('checked', false);
        },

        resetList: function(doclist) {
        	var fragment = this.collection.url().replace('/api/','');
            var bUrl = GO.router.getUrl().replace("#","");
            if (bUrl.indexOf("?") < 0) {
                GO.router.navigate(fragment, {replace: true});
            } else if (bUrl != fragment) {
                GO.router.navigate(fragment, {trigger: false, pushState: true});
            }

            $('.list_approval > tbody').empty();
            var columns = this.columns;
            var listType = "approval";

            doclist.each(function(doc){
                var docListItemView = new DocListItemView({
                    model: doc,
                    isCheckboxVisible: true,
                    listType : listType,
                    columns: columns,
                    isReception : false
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

        // 탭 이동
        selectTab: function(e) {
            this.collection.setPageNo(0);
            $('.tab_nav > li').removeClass('on');
            $(e.currentTarget).addClass('on');

            var tabId = $(e.currentTarget).attr('id');
            if (tabId == 'tab_all') {
                this.collection.setType('all');
            } else if (tabId == 'tab_reference') {
                this.collection.setType('reference');
            } else if (tabId == 'tab_reading') {
                this.collection.setType('reading');
            }

            this.collection.fetch();
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
        // 일괄 확인
        onBulkReadClicked: function() {
            var $checkedList = $('input.doclist_item_checkbox:checked'),
                self = this,
                buttons = [],
                contents = [];
            
            if ($checkedList.length < 1) {
                $.goAlert(approvalLang['선택된 항목이 없습니다.']);
                return;
            }
            
            var htmls = [];
	        htmls.push('<p class="q">' + lang['정말로 일괄 확인 하시겠습니까?'] + '</p>');
	        $.goConfirm(htmls.join(''), '', function() {
	            var docIds = _.map($checkedList, function(el) {
	                    return parseInt($(el).attr('data-id'));
	                });
	            
	            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
	            
	            self.bulkRead(docIds).
	            done(function(data, status, xhr) {
	                $.goAlert(GO.i18n(approvalLang['{{arg1}}개의 확인이 완료되었습니다.'],{"arg1": docIds.length}));
	            }).
	            fail(function(data, status, xhr) {
	                if (data.responseJSON.name == 'pwd.not.match') {
	                    $.goAlert(data.responseJSON.message);
	                } else {
	                    $.goAlert(commonLang['500 오류페이지 타이틀']);
	                }
	            }).
	            complete(function() {
	                self.collection.fetch();
	                GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
	                self.todoViewerCountModel.fetch({
	                	success : function(model){
	                		$('#apprSide a[data-navi="todoviewer"] span.num').text(model.get('docCount') || "");
	                	}
	                })
	            });
	        });
        },
        
        bulkRead: function(docIds) {
            return $.ajax({
                url: GO.contextRoot + 'api/approval/document/bulkread',
                type: 'PUT',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    'docIds': docIds
                })
            });
        },
        // 제거
        release: function() {
            this.$el.off();
            this.$el.empty();
        }
    });

    return TodoViewerListView;
});
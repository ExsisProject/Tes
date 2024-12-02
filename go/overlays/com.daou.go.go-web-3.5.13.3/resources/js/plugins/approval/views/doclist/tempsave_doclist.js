// 기안문서함 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "when",
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    "approval/views/doclist/doclist_item",
    "approval/views/doclist/base_doclist",
    "approval/views/doclist/doclist_csv_download",
    "approval/models/doclist_item",
    "approval/collections/tempsave_doclist",

    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/tempsave_doclist",
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    "jquery.placeholder"
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
    DocListItemView,
    BaseDocListView,
    DocListCsvDownloadView,
    DocListItemModel,
    TempSaveDocList,
    DocListEmptyTpl,
    TempSaveDocListTpl,
    commonLang,
    approvalLang
) {
	
    var TempSaveDocListView = BaseDocListView.extend({
        
        el: '#content',
        columns: {
            '생성일' : approvalLang['생성일'],
            '결재양식': approvalLang['결재양식'], 
            '긴급': approvalLang['긴급'],
            '제목': commonLang['제목'], 
            '첨부': approvalLang['첨부'], 
            '결재상태': approvalLang['결재상태'],
            'count': 6
        },
        
        docFieldModel : null,
        docFolderType : 'user_temp',
        
        initialize: function(options) {
            this.options = options || {};
            _.bindAll(this, 'render', 'renderPageSize', 'renderPages');
            this.contentTop = ContentTopView.getInstance();
            this.type = this.options.type;
            if (this.options.type.indexOf("?") >=0) {
            	this.type = this.options.type.substr(0,this.options.type.indexOf("?"));
            }
            this.collection = new TempSaveDocList();
            this.collection.setType(this.type);
            
            this.initProperty = "updatedAt";
            this.initDirection = "desc";
            this.ckeyword = "";
            
            var baseUrl = sessionStorage.getItem('list-history-baseUrl');
            var regexp = new RegExp('(#)?approval/doclist/tempsave/' + this.type + "$");
            if ( baseUrl && regexp.test(baseUrl)) {
                this.initProperty = sessionStorage.getItem('list-history-property');
                this.initDirection = sessionStorage.getItem('list-history-direction');
                this.initSearchtype = sessionStorage.getItem('list-history-searchtype');
                this.ckeyword = sessionStorage.getItem('list-history-keyword').replace(/\+/gi, " ");
                this.collection.setListParam();
            } else {
                this.collection.setSort(this.initProperty,this.initDirection);
            }
            
            sessionStorage.clear();
            this.checkboxColumn = {
					id : 'checkedAllDeptDoc',
					name : 'checkedAllDeptDoc'
			}
            this.collection.bind('reset', this.resetList, this);
            BaseDocListView.prototype.initialize.call(this, options);
        },
        
        events: {
        	'click a#deletedoc' : 'remove',
            'click input:checkbox' : 'renderPages',
            'click .sorting' : 'sort',
            'click .sorting_desc' : 'sort',
            'click .sorting_asc' : 'sort',
            'click .btn_search2' : 'search',
            'keypress input#keyword': 'searchByEnter',
        	'click input:checkbox' : 'toggleCheckbox'
        },
        
        renderLayout : function(){
            var lang = {
                    '문서 삭제' : approvalLang['문서 삭제'],
                    '선택': commonLang['선택'],
                    '전체': approvalLang['전체'],
                    '진행': approvalLang['진행'],
                    '완료': approvalLang['완료'],
                    '반려': approvalLang['반려'],
                    '임시저장': approvalLang['임시저장'],
                    '제목': commonLang['제목'],
                    '생성일' : approvalLang['생성일'],
                    '기안자': approvalLang['기안자'],
                    '결재선': approvalLang['결재선'],
                    '문서번호': approvalLang['문서번호'],
                    '검색': commonLang['검색'],
                    '결재양식': approvalLang['결재양식'],
    				'기안부서' : approvalLang['기안부서'],
                    'placeholder_search' : commonLang['플레이스홀더검색']
                };

                this.$el.html(TempSaveDocListTpl({
                    lang: lang,
                }));

                if (this.type.indexOf("?") >=0) {
                	this.type = this.type.substr(0,this.type.indexOf("?"));
                }
                $('#tab_' + this.type).addClass('on');
                this.contentTop.setTitle(approvalLang['임시 저장함']);
                this.contentTop.render();
                this.$el.find('header.content_top').replaceWith(this.contentTop.el);
                this.$el.find('input[placeholder]').placeholder();
                this.renderPageSize();
                
                new DocListCsvDownloadView({
                    getDownloadURL: $.proxy(this.collection.getCsvURL, this.collection),
                    appendTarget: this.$el.find('#docToolbar > div.critical#csvDownLoad')
                }).render();
        },

        remove: function() {
            var checkedList = $('input.doclist_item_checkbox:checked'),
            self = this,
            docIds=[];
            checkedList.each(function(){
				docIds.push($(this).attr('data-id'));
			});

        if (checkedList.length < 1) {
            $.goAlert(approvalLang['선택된 항목이 없습니다.']);
            return;
        }else{
            var self = this;
            $.goCaution(approvalLang["문서함 삭제 경고 내용"], '', function() {
                var deleteApiUrl = [GO.config('contextRoot') + 'api/approval/document/delete'];
                $.ajax({
                    url: deleteApiUrl,
                    data: JSON.stringify({'ids' : docIds}),
                    type: 'delete',
                    async: true,
                    dataType: 'json',
                    contentType : "application/json",
                    success: function() {
                        self.collection.fetch();
                        $.goMessage(approvalLang["선택한 항목이 삭제되었습니다"]);
                    }
                });
            });
        }
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
                    isCheckboxVisible: true,
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
            if ( e.keyCode != 13 ) { return; }
            if ( e ) { e.preventDefault(); }
            $(e.currentTarget).focusout().blur();       
            this.search();
        },
        // 제거
        release: function() {
            this.$el.off();
            this.$el.empty();
        }
    });
    
    return TempSaveDocListView;
});
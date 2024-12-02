// 수신문서함 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    "approval/views/doclist/base_doclist",
    "approval/views/doclist/doclist_item",
    "approval/views/doclist/doclist_csv_download",
    "approval/views/doclist/user_doc_folder",
    "approval/collections/send_doclist",
    "approval/models/doclist_item",
    "hgn!approval/templates/send_doclist",
    "hgn!approval/templates/doclist_empty",
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
    BaseDocListView,
    DocListItemView,
    DocListCsvDownloadView,
    UserDocFolderView,
    SendDocCollection,
    DocListItemModel,
    SendDocListTpl,
    DocListEmptyTpl,
    commonLang,
    approvalLang
) {
	var lang = {
        '제목': commonLang['제목'],
        '기안자': approvalLang['기안자'],
        '담당자': approvalLang['담당자'],
        '결재양식': approvalLang['결재양식'],
        '결재선': approvalLang['결재선'],
        '문서번호': approvalLang['문서번호'],
        '검색': commonLang['검색'],
        '전체': approvalLang['전체'],
        '접수대기': approvalLang['접수대기'],
        '접수': approvalLang['접수'],
        '진행': approvalLang['진행'],
        '완료': approvalLang['완료'],
        '반려': approvalLang['반려'],
        '반송': approvalLang['반송'],
        '개인 문서함 분류' : approvalLang['개인 문서함 분류'],
        '개인 문서함이 없습니다' : approvalLang['개인 문서함이 없습니다']
    };
	
    var SendListView = BaseDocListView.extend({

        columns: {
            '접수일' : approvalLang['접수일'],
            '결재양식': approvalLang['결재양식'],
            '긴급': approvalLang['긴급'], 
            '제목': commonLang['제목'],
            '담당자': approvalLang['담당자'],
            '첨부' : approvalLang['첨부'],
            '발송일' : approvalLang['발송일'],
            '결재상태': approvalLang['결재상태'],
            'count': 8
        },

        el: '#content',
        docFolderType : 'user_send',
        usePeriod : true,
        events: {
            'click .tab_nav > li' : 'selectTab',
            'click .sorting' : 'sort',
            'click .sorting_desc' : 'sort',
            'click .sorting_asc' : 'sort',
            'click .btn_search2' : 'search',
            'keypress input#keyword': 'searchByEnter',
        	'click #userDocCopy' : 'userDocCopy',
        	'click #checkedAllDeptDoc' : 'checkedAllDoc'
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

            this.deptId = this.options.deptId;
            this.contentTop = ContentTopView.getInstance();
            this.collection = new SendDocCollection(this.type, this.deptId);
            this.initProperty = "createdAt";
            this.initDirection = "desc";
            this.initPage = 20;
            this.ckeyword = "";
            this.userId = GO.session("id");

            _.bindAll(this, 'render', 'renderPageSize', 'renderPages');

            var baseUrl = sessionStorage.getItem('list-history-baseUrl');
            var regexp = new RegExp('(#)?approval/doclist/send/' + this.type + "$");
            
            if ( baseUrl && regexp.test(baseUrl)) {
                this.initProperty = sessionStorage.getItem('list-history-property');
                this.initDirection = sessionStorage.getItem('list-history-direction');
                this.initSearchtype = sessionStorage.getItem('list-history-searchtype');
                this.ckeyword = sessionStorage.getItem('list-history-keyword').replace(/\+/gi, " ");
				this.duration = sessionStorage.getItem('list-history-duration');
				this.fromDate = sessionStorage.getItem('list-history-fromDate');
				this.toDate = sessionStorage.getItem('list-history-toDate');
                this.collection.setListParam();
            } else {
                this.collection.pageSize = this.initPage;
				this.collection.setDuration();
                this.collection.setSort(this.initProperty,this.initDirection);
            }

            sessionStorage.clear();
            this.collection.bind('reset', this.resetList, this);
            BaseDocListView.prototype.initialize.call(this, options);
        },
        
        renderLayout: function() {
            this.$el.html(SendDocListTpl({
                buttons: this.buttons,
                lang: lang
            }));
            if (this.type.indexOf("?") >=0) {
                this.type = this.type.substr(0,this.type.indexOf("?"));
            }

            $('#tab_' + this.type).addClass('on');

            var contentTitle = approvalLang['발송 문서함'];
            this.contentTop.setTitle(contentTitle);
            this.contentTop.render();

            this.$el.find('header.content_top').replaceWith(this.contentTop.el);
            this.$el.find('input[placeholder]').placeholder();
            this.renderPageSize();
            
            new DocListCsvDownloadView({
                getDownloadURL: $.proxy(this.collection.getCsvURL, this.collection),
                appendTarget: this.$el.find('#docToolbar > div.critical')
            }).render();
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
            var listType = "sendDoc";

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

        // 탭 이동
        selectTab: function(e) {
            this.collection.setPageNo(0);
            $('.tab_nav > li').removeClass('on');
            $(e.currentTarget).addClass('on');

            var tabId = $(e.currentTarget).attr('id');
            if (tabId == 'tab_all') {
                this.collection.setType('all');
            } else if (tabId == 'tab_waiting') {
                this.collection.setType('waiting');
            } else if (tabId == 'tab_received') {
                this.collection.setType('received');
            } else if (tabId == 'tab_inprogress') {
                this.collection.setType('inprogress');
            } else if (tabId == 'tab_complete') {
                this.collection.setType('complete');
            } else if (tabId == 'tab_returned') {
                this.collection.setType('returned');
            } else if (tabId == 'tab_recv_returned') {
                this.collection.setType('recv_returned');
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
        checkedAllDoc : function(){
			if ($("#checkedAllDeptDoc").is(":checked")) { 
				$('td.check :checkbox:not(checked)').attr("checked", true); 
			} else { 
				$('td.check :checkbox:checked').attr("checked", false); 
			}
		},
        // 제거
        release: function() {
            this.$el.off();
            this.$el.empty();
        }
    });

    return SendListView;
});
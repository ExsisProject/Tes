// 공문문서함 목록
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
    
    "approval/models/doc_list_field",
    "approval/collections/doc_list_field",
    "approval/models/doclist_item",
    "approval/collections/user_official_doclist",
    
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/user_official_doclist",
    
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
    
    DocListFieldModel,    
    DocListFieldCollection,
    DocListItemModel,
    UserOfficialDocList,
    
    DocListEmptyTpl,
    UserOfficialDocListTpl,
    
    commonLang,
    approvalLang
) {
	var lang = {
            '전체': approvalLang['전체'],
            '승인대기' : approvalLang['승인대기'],
        	'승인' : approvalLang['승인'],
            '반려': approvalLang['반려'],
            '발송취소': approvalLang['발송취소'],
            '제목': commonLang['제목'],
            '기안자': approvalLang['기안자'],
            '결재선': approvalLang['결재선'],
            '기안부서' : approvalLang['기안부서'],
            '문서번호': approvalLang['문서번호'],
            '검색': commonLang['검색'],
            '결재양식': approvalLang['결재양식'],
            'placeholder_search' : commonLang['플레이스홀더검색']
    };
	
	var ConfigModel = Backbone.Model.extend({
        url : "/api/approval/apprconfig"
    });
	
    var UserOfficialDocListView = BaseDocListView.extend({
        
        el: '#content',
        columns: {
            '기안일' : approvalLang['기안일'],
            '결재양식': approvalLang['결재양식'], 
            '긴급': approvalLang['긴급'], 
            '제목': commonLang['제목'], 
            '첨부': approvalLang['첨부'], 
            '결재상태': approvalLang['결재상태'],
            '문서번호': approvalLang['문서번호'],
            'count': 7
        },
        useOfficialConfirm : true,
        docFolderType : 'user_official',
		usePeriod : true,
        initialize: function(options) {
            this.options = options || {};
            _.bindAll(this, 'render', 'renderPageSize', 'renderPages');
            this.contentTop = ContentTopView.getInstance();
            this.type = this.options.type;
            if (this.options.type.indexOf("?") >=0) {
            	this.type = this.options.type.substr(0,this.options.type.indexOf("?"));
            }
            this.collection = new UserOfficialDocList();
            this.collection.setType(this.type);
            
            this.initProperty = "document.completedAt";
            this.initDirection = "desc";
            this.ckeyword = "";
            this.userId = GO.session("id");
            
            var baseUrl = sessionStorage.getItem('list-history-baseUrl');
            var regexp = new RegExp('(#)?approval/doclist/userofficial/' + this.type + "$");
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
				this.collection.setDuration();
                this.collection.setSort(this.initProperty,this.initDirection);
            }
            
            sessionStorage.clear();
            
            this.collection.bind('reset', this.resetList, this);
            BaseDocListView.prototype.initialize.call(this, options);
        },
        
        events: function(){
			return _.extend({},BaseDocListView.prototype.events, {
	            'click input:checkbox' : 'toggleCheckbox',
	            'click .tab_nav > li' : 'selectTab',
	            'click .sorting' : 'sort',
	            'click .sorting_desc' : 'sort',
	            'click .sorting_asc' : 'sort',
	            'click #checkedAllDeptDoc' : 'checkedAllDoc'
			});
        },
		
        render: function() {
        	when(this.fetchConfig.call(this)) //super method
        	.then(_.bind(this.fetchDocField, this))
            .then(_.bind(this.renderLayout, this)) //to override method
            .then(_.bind(this.renderPeriodView, this))//super method
            .then(_.bind(this.renderDocFieldSettingView, this))//super method
            .then(_.bind(this.renderDocFieldColumnTpl, this))//super method            
            .then(_.bind(this.fetchDocList, this))//super method
            .then(_.bind(this.setInitSort, this))
    		.otherwise(function printError(err) {
                console.log(err.stack);
            });	
		},
        
        renderLayout : function(){
        	var self = this;
            this.$el.html(UserOfficialDocListTpl({
                lang: lang,
                useOfficialConfirm: this.useOfficialConfirm,
             }));
            if (this.type.indexOf("?") >=0) {
            	this.type = this.type.substr(0,this.type.indexOf("?"));
            }
            $('#tab_' + this.type).addClass('on');
            this.contentTop.setTitle(approvalLang['공문 문서함']);
            this.contentTop.render();
            this.$el.find('header.content_top').replaceWith(this.contentTop.el);
            this.$el.find('input[placeholder]').placeholder();
            this.renderPageSize();
            
            new DocListCsvDownloadView({
                getDownloadURL: $.proxy(this.collection.getCsvURL, this.collection),
                appendTarget: this.$el.find('#docToolbar > div.critical')
            }).render();
        },
        
        fetchDocField : function(){
        	var self = this;
        	this.docFieldModel = new DocListFieldModel({
		    	docFolderType : this.docFolderType
        	});
			var deffered = when.defer();
			this.docFieldModel.fetch({
				success : function(model){
					var collection = model.getCollection();
					var approvalField = collection.findWhere({
						columnMsgKey : '승인자'
					});
					var stateField = collection.findWhere({
						columnMsgKey : '승인상태'
					});
					if(!self.useOfficialConfirm){
						collection.remove(approvalField);
						collection.remove(stateField);
						self.toRemoveColumns = ['승인자']; //필드목록 레이어에서도 아예 삭제시킨다.
						self.toRemoveColumns = ['승인상태'];
					}
					self.columns = collection.makeDoclistColumn(self.columns);
					self.sorts = collection.makeDoclistSort();
					deffered.resolve();
				},
				error : deffered.reject
			});
			return deffered.promise;
        },
        
        fetchConfig : function(){
        	var self = this;
			var deffered = when.defer();
			this.configModel = new ConfigModel();
			this.useOfficialConfirm = true
			this.configModel.fetch({
				success: function(model){
					self.useOfficialConfirm = model.get('useOfficialConfirm');
					deffered.resolve();
				},
				error : deffered.reject
			});
			return deffered.promise;
        },
        toggleCheckbox : function(e){
            if(this.$el.find('#checkedAll').is(':checked')){
                $('input[type="checkbox"][name="checkbox"]').attr('checked', true);
            }
            if($(e.currentTarget).is(':checked')){
                $(e.currentTarget).attr('checked', true);
            }else{
                this.$el.find('#checkedAll').attr('checked', false);
                $(e.currentTarget).attr('checked', false);
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
            var listType = "officialDoc";
            doclist.each(function(doc){
                var docListItemView = new DocListItemView({ 
                    model: doc, 
                    isCheckboxVisible: false,
                    listType : listType,
                    columns: columns,
                    useDocInfo: false
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
            this.$el.find('#checkedAll').attr('checked', false);

            // TODO 브라우저 URL 변경
            var tabId = $(e.currentTarget).attr('id');
            if (tabId == 'tab_all') {
                this.collection.setType('all');
            } else if (tabId == 'tab_wait') {
                this.collection.setType('wait');
            } else if (tabId == 'tab_approve') {
                this.collection.setType('approve');
            } else if (tabId == 'tab_return') {
                this.collection.setType('return');
            } else if (tabId == 'tab_cancel') {
                this.collection.setType('cancel');
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
    
    return UserOfficialDocListView;
});
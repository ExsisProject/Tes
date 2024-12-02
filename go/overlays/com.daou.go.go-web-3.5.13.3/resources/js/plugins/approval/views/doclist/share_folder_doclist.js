// 부서 문서함 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    
    "approval/collections/share_folder_doclist",
    
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    "approval/views/doclist/base_doclist",
    
    "approval/views/doclist/doclist_item",
    "approval/views/doclist/doclist_csv_download",
    "approval/views/doclist/share_doc_folder",
    
    "approval/views/side",
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/share_folder_doclist",
    
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	
	ShareFolderDocCollection,
	
	ContentTopView,
	PaginationView,
	PageSizeView,
    BaseDocListView,
	
	DocListItemView,
	DocListCsvDownloadView,
	ShareDocFolderView,
	
	SideView,
	DocListEmptyTpl,
	ShareFolderDocListTpl,
	
    commonLang,
    approvalLang
) {
	var lang = {
		'제목': commonLang['제목'],
		'기안자': approvalLang['기안자'],
		'검색': commonLang['검색'],
		'이동' : commonLang['이동'],
		'삭제' : commonLang['삭제'],
        '결재양식': approvalLang['결재양식'],
        '결재선': approvalLang['결재선'],
        '기안부서' : approvalLang['기안부서'],
        '문서번호': approvalLang['문서번호'],
		'placeholder_search' : commonLang['플레이스홀더검색']
	};
	
	var ShareFolderDocListView = BaseDocListView.extend({
        docFolderType : null,
		shareFolderCols: {
			'선택' : commonLang['선택'],
			'기안일': approvalLang['기안일'], 
			'기안자': approvalLang['기안자'],
			'결재양식': approvalLang['결재양식'],
			'긴급': approvalLang['긴급'], 
			'제목': commonLang['제목'], 
			'첨부': approvalLang['첨부'],
			'문서번호': approvalLang['문서번호'],
			'count': 8
		},
		//buttons: {},
		el: '#content',
		initialize: function(options) {
		    this.options = options || {};
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');
			this.contentTop = ContentTopView.getInstance();
			this.isRef = false;
			
			/*this.buttons.move = true;
			this.buttons.remove = true;*/
			this.docFolderType = 'custom_add';
			/*this.checkboxColumn = {
					id : 'checkedAllDeptDoc',
					name : 'checkedAllDeptDoc'
			}*/
			this.usePeriod = true;
			
			//개인 or 부서(userfolder or deptfolder)_folderType
			this.type = this.options.type;
			//개인 or 부서(inuser or indept)_어떤 문서함에 포함된 문서인지 분류하여 호출(side의 선택된 메뉴 highlight구현시 필요)
			
			this.folderId = this.options.folderId;
			this.belong = this.options.belong;    	

			if(this.options.belong){
				if (this.options.belong.indexOf("?") >=0) {
	            	this.belong = this.options.belong.substr(0,this.options.belong.indexOf("?"));
	            }else{
	            	this.belong = this.options.belong;    	
	            }	
			}
            
			if(this.options.deptId){
	            if (this.options.deptId.indexOf("?") >=0) {
	            	this.deptId = this.options.deptId.substr(0,this.options.deptId.indexOf("?"));
	            }else{
	            	this.deptId = this.options.deptId;
	            }
			}

			this.collection = new ShareFolderDocCollection({
			    folderId: this.folderId,
			    type: this.type,
			    deptId: this.deptId,
			    belong: this.belong
			});
			
			this.initProperty = "draftedAt";
			this.initDirection = "desc";
			this.ckeyword = "";
			var baseUrl = sessionStorage.getItem('list-history-baseUrl');
			if (baseUrl) {
				baseUrl = baseUrl.replace(/#/gi, "");
			}
			var currUrl = '/api/approval/userfolder/' + this.folderId + '/share/' + this.belong;
        	if(this.type == "userfolder"){
        		if(this.belong == "indept"){
        			currUrl = '/api/approval/userfolder/' + this.folderId + '/share/' + this.belong + '/' + this.deptId;
        		}else{
        			currUrl = '/api/approval/userfolder/' + this.folderId + '/share/' + this.belong;
        		}
            }else if(this.type == "deptfolder"){
            	currUrl = '/api/approval/deptfolder/' + this.folderId + '/share/' + this.belong + '/' + this.deptId;
            }
        	
			if ( baseUrl && baseUrl == currUrl ) {
				this.initProperty = sessionStorage.getItem('list-history-property');
				this.initDirection = sessionStorage.getItem('list-history-direction');
				this.initSearchtype = sessionStorage.getItem('list-history-searchtype');
				this.ckeyword = sessionStorage.getItem('list-history-keyword').replace(/\+/gi, " ");
				if(this.usePeriod){
					this.duration = sessionStorage.getItem('list-history-duration');
					this.fromDate = sessionStorage.getItem('list-history-fromDate');
					this.toDate = sessionStorage.getItem('list-history-toDate');
				}
				this.collection.setListParam();
			} else {
				if(this.usePeriod){
					this.collection.setDuration();
				}
				this.collection.setSort(this.initProperty,this.initDirection);
			}
			sessionStorage.clear();
			this.collection.bind('reset', this.resetList, this);
			this.collection.usePeriod = this.usePeriod;
            BaseDocListView.prototype.initialize.call(this, options);
		},
		
		events : function(){
			return _.extend({},BaseDocListView.prototype.events, {
				'click input:checkbox' : 'toggleCheckbox',
				'click .sorting' : 'sort',
				'click .sorting_desc' : 'sort',
				'click .sorting_asc' : 'sort'
			});
		},
		
		renderLayout: function() {
			this.$el.html(ShareFolderDocListTpl({
				lang: lang,
				//buttons: this.buttons,
				isRef : this.isRef
			}));
			this.contentTop.setTitle('');
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);    		
    		this.renderPageSize();
    		
    		new DocListCsvDownloadView({
    		    getDownloadURL: $.proxy(this.collection.getCsvURL, this.collection),
    		    appendTarget: this.$el.find('#docToolbar > div.critical')
    		}).render();
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
			if (this.collection.extData != null) {
				var title = this.collection.extData.folderName;
				if(this.collection.extData.userName){
					title += ' <span class="meta">in ' + this.collection.extData.userName + '</span>';
				}else if(this.collection.extData.deptName){
					title += ' <span class="meta">in ' + this.collection.extData.deptName + '</span>';
				}
				this.renderTitle(title);
			}
			
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
					//isCheckboxVisible: doc.isCompleted(),
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

		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return ShareFolderDocListView;
});
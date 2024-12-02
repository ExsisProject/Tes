//전사문서함문서목록
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
	"approval/collections/company_doc_list",
    "approval/views/doclist/company_doc_folder",
    "approval/views/side_company_doc",
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/company_doclist",
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
	CompanyDocList,
	CompanyDocFolderView,
	CompanyFolderSide,
	DocListEmptyTpl,
	CompanyDocListTpl,
    commonLang,
    approvalLang
) {
	
	var CompanyCopyModel = Backbone.Model.extend({
		url : function(){
			return '/api/approval/companyfolder/' + this.folderId + '/document/move';
		},
		setFolderId: function(folderId) {
			this.folderId = folderId;
		}
	});
	
	var CompanyDeleteModel = Backbone.Model.extend({
		url : function(){
			return '/api/approval/companyfolder/' + this.folderId + '/document/remove';
		},
		setFolderId: function(folderId) {
			this.folderId = folderId;
		}
	});
	
	var CompanyDocListView = Backbone.View.extend({
		columns: {
			'기안일': approvalLang['기안일'],
			'기안자': approvalLang['기안자'], 
			'결재양식': approvalLang['결재양식'], 
			'제목': commonLang['제목'], 
			'첨부': approvalLang['첨부'],
			'결재일': approvalLang['결재일'], 
			'문서번호': approvalLang['문서번호'],
			'count': 7
		},
		el: '#content',
		initialize: function(options) {
		    this.options = options || {};
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');
			var self = this;
			this.contentTop = ContentTopView.getInstance();

			this.folderId = this.options.folderId;
			this.collection = new CompanyDocList();
			this.collection.setFolderId(this.folderId);
			
			this.initProperty = "completedAt";
			this.initDirection = "desc";
			this.ckeyword = "";
			var baseUrl = sessionStorage.getItem('list-history-baseUrl');
			if (baseUrl) {
				baseUrl = baseUrl.replace(/#/gi, "");
			}
			if ( baseUrl && baseUrl == 'docfolder/' + this.folderId + '/documents' ) {
				this.initProperty = sessionStorage.getItem('list-history-property');
				this.initDirection = sessionStorage.getItem('list-history-direction');
				this.initSearchtype = sessionStorage.getItem('list-history-searchtype');
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
			
			// TODO 전사문서함 관리자 권한 설정
			this.compAdmin = CompanyFolderSide.getCompanyDocManageble();
			if (this.compAdmin){
				this.columns = {
					'선택' : commonLang['선택'],
					'기안일': approvalLang['기안일'],
					'기안자': approvalLang['기안자'], 
					'결재양식': approvalLang['결재양식'], 
					'제목': commonLang['제목'], 
					'첨부': approvalLang['첨부'],
					'결재일': approvalLang['결재일'],
					'문서번호': approvalLang['문서번호'],
					'count': 8
				};
			}
		},
		events: {
			'click input:checkbox' : 'toggleCheckbox',
			'click #companyDocMove' : 'companyDocMove',
			'click #companyDocDelete' : 'companyDocDelete',
			'click .sorting' : 'sort',
			'click .sorting_desc' : 'sort',
			'click .sorting_asc' : 'sort',
			'click .btn_search2' : 'search',
			'keypress input#keyword': 'searchByEnter'
    	},
    	
    	toggleCheckbox : function(e){
    		var target = $(e.currentTarget);
    		var allCheckEl = this.$el.find('#checkedAllCompanyDoc'); 
    		if(target.attr('id') == allCheckEl.attr('id')){ //전체 체크박스를 눌렀을경우
    			this.$el.find('input[type="checkbox"][name="checkbox"]').prop('checked', target.is(':checked'));    			
    		}else{
    			if(!target.is(':checked')){
    				allCheckEl.prop('checked', false);
    			}
    		}
		},
		
    	companyDocMove: function() {
    		var self = this;
			var docIds = [];
			var target = $('input[name=checkbox]:checked');
			target.each(function(){
				docIds.push($(this).attr('data-id'));
			}); 
			var deptId = this.deptId;
			var sourceId = this.folderId;
			var companyCopyModel = new CompanyCopyModel();
			companyCopyModel.setFolderId(sourceId);
			
			// 전사 문서함 복사 api 되는대로 적용 예정
	    	if(docIds!=''){
				var companyDocMoveLayer = $.goPopup({
					"pclass" : "layer_normal layer_doc_type_select layer_depth",
					"header" : approvalLang['문서 이동'],
					"modal" : true,
					"width" : 300,
					"contents" :  "",
					"buttons" : [{
									'btext' : commonLang['확인'],
									'btype' : 'confirm',
									'autoclose' : false,
									'callback': function(rs){
										var targetId = (rs.find('.on').closest('li[data-id]').attr('data-id'));
										if (!targetId) {
											$.goError(approvalLang["이동하실 문서함을 선택해주십시요."]);
											$('#companyFolderError').addClass('enter error').focus();
											return false;
										}
										if (targetId == sourceId) {
											$.goError(approvalLang["동일한 문서함입니다."]);
											$('#companyFolderError').addClass('enter error').focus();
											return false;
										}
										if (docIds) {
											companyCopyModel.set({ 'folderId' : targetId }),
											companyCopyModel.save({
												'ids' : docIds
											}, {
												silent : true,
												type : 'PUT',
												success : function() {
													$.goMessage(approvalLang["선택한 항목이 이동되었습니다"]);
													rs.close();
													self.$el.find('#checkedAllDeptDoc').attr('checked', false);
													self.collection.fetch();
												},
												error : function(model, rs){
													var responseObj = JSON.parse(rs.responseText);
													if (responseObj.message) {
														$.goError(responseObj.message);
														return false;
													} else {
														$.goError(commonLang['저장에 실패 하였습니다.']);
														return false;
													}
												}
											});
										}
									}
								},
								{
									'btext' : commonLang["취소"],
									'btype' : 'cancel'
								}]
				});
			}else {
				$.goError(approvalLang["선택된 항목이 없습니다."]);
			};
			var companyDocFolderView = new CompanyDocFolderView({
				docIds : docIds,
				folderId : this.folderId
			});
			
			companyDocFolderView.render();
			if(docIds!=''){
				companyDocMoveLayer.reoffset();
			}
			
		},
		
		companyDocDelete: function() {
			var self = this;
			var docIds = [];
			var folderId = this.folderId;
			var target = $('input[name=checkbox]:checked');
			target.each(function(){
				docIds.push($(this).attr('data-id'));
			});
			var companyDeleteModel = new CompanyDeleteModel();
			companyDeleteModel.setFolderId(folderId);
			if(docIds!=''){
				$.goConfirm(approvalLang['선택한 항목을 삭제하시겠습니까?'],
					'',
					function() {
						companyDeleteModel.set({ 'folderId' : folderId,'ids' : docIds }),
						companyDeleteModel.save({
						}, {
							silent : true,
							type : 'PUT',
							success : function() {
								$.goMessage(approvalLang["선택한 항목이 삭제되었습니다"]);
								self.$el.find('#checkedAllCompanyDoc').attr('checked', false);
								self.collection.fetch();
							},
							error : function(){
								$.goError(commonLang['저장에 실패 하였습니다.']);
							}
						});
					});
			}else {
				$.goError(approvalLang["선택된 항목이 없습니다."]);
			};
		},
		
		render: function() {
			var lang = {
				'제목': commonLang['제목'],
				'기안자': approvalLang['기안자'],
				'검색': commonLang['검색'],
				'이동' : commonLang['이동'],
				'삭제' : commonLang['삭제'],
				'결재양식': approvalLang['결재양식'],
				'placeholder_search' : commonLang['플레이스홀더검색']
			};
			this.$el.html(CompanyDocListTpl({
				lang: lang,
				columns: this.columns
			}));
			this.setInitSort(this.initProperty,this.initDirection);
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
    		
			if (!this.compAdmin) {
				$("#companyDocMove").hide();
				$("#companyDocDelete").hide();
			}
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
			//GO.router.navigate(fragment, {trigger: false, pushState: true});
			var bUrl = GO.router.getUrl().replace("#","");
			if (bUrl.indexOf("?") < 0) {
				GO.router.navigate(fragment, {replace: true});
			} else {
				if (bUrl != fragment) {
					GO.router.navigate(fragment, {trigger: false, pushState: true});
				}
			}
			this.renderTitle(this.collection.extData.name);
			
			$('.list_approval > tbody').empty();
			var columns = this.columns;
			var listType = "docfolder";
			var isCheckboxVisible = this.compAdmin;
			doclist.each(function(doc){
				var docListItemView = new DocListItemView({ 
					model: doc,
					isCheckboxVisible: isCheckboxVisible,
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
    		if(this.initSearchtype){
    			this.$('#searchtype').val(this.initSearchtype);
    		}
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
	
	return CompanyDocListView;
});
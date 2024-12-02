// 문서 상세 > 관련 문서 검색
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    
    "views/pagination",
    "views/pagesize",
    "approval/views/doclist/doclist_item",
	"approval/views/apprform/appr_company_folder_tree",

    "approval/collections/draft_doclist",
    "approval/collections/appr_doc_list",
    "approval/collections/viewer_doclist",
    "approval/collections/reception_doclist",
    "approval/collections/dept_folder_doclist",
	"approval/collections/send_doclist",
	"approval/collections/user_folder_doclist",
	"approval/collections/share_folder_doclist",
	"approval/collections/company_doc_list",

	"hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/document/related_document_attach",
	
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    "jquery.jstree",
    "jquery.go-preloader"
],
function(
	$,
	_,
	Backbone,
	GO,
	
    PaginationView,
	PageSizeView,
	DocListItemView,
	CompanyDocTreeTreeView,
	
	DocDraftCollection,
	ApprDocCollection,
	ViewerDocCollection,
	ReceptionDocCollection,
	DeptFolderDocCollection,
	SendDocCollection,
	UserFolderDocCollection,
	ShareFolderDocCollection,
	CompanyDocCollection,

	DocListEmptyTpl,
	DocumentReferenceTpl,
    
	commonLang,
    approvalLang
) {

	var ApprSideModel = Backbone.Model.extend({
		url: '/api/approval/side'
	});

    var RelatedDocListItemView = DocListItemView.extend({
    	isReadable : false, //api를 호출하여 열람가능한지를 확인한 상태인지를 확인하는 flag 
		events : function(){
			return _.extend({},DocListItemView.prototype.events, {
				'click input:checkbox' : 'checkReadable'
			});
		},
		checkReadable : function(e){
			var self = this;
			var el = $(e.currentTarget);
			if(!self.isReadable){ // api를 호출하여 권한이 있는 문서가 확인된 경우는 체크하지 않는다.
				var documentId = this.model.get('documentId');
	    		$.ajax({
	    			  type: "GET",
	    			  url: GO.contextRoot + "api/approval/document/"+ documentId +"/readable",
	    			  success : function(){
	    				  self.isReadable = true;
	    			  },
	    			  error : function(response){
	    				  var result = JSON.parse(response.responseText);
	    				  $.goError(result.message);
	    				  $(el).prop('checked', false);
	    				  self.isReadable = false;
	                }
	    		});	
			}
		}
    });

	var DocumentReferenceView = Backbone.View.extend({
        searchTreeView: null,
        formListView: null,
		el : ".layer_doc_attach .content",
		columns: {
			'선택' : '선택',
			'결재양식' : approvalLang.결재양식,
			'제목': commonLang.제목,
			'기안자': approvalLang.기안자,
			'결재일': approvalLang.결재일,
			'count': 5
		},

		events: {
			'click #allCheck' : 'allCheck',
			'click #userReference ul.side_depth p a' : 'clickUserRefSide',
			'click #deptReference ul.side_depth ul p a' : 'clickDeptRefSide',
			'click #companyDocSide ul.side_depth ul p a' : 'clickCompanyRefSide',
			'click #search_icon' : 'search',
			'keydown #search_title' : 'searchEnter'
		},

		initialize: function(options) {
		    this.options = options || {};
			this.release();
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');
			this.collection = new DocDraftCollection();
			this.collection.setType("complete");
			this.collection.bind('reset', this.resetList, this);
			this.collection.setSort("latestActivityCompletedAt", "DESC");

            var preloader = $.goPreloader();

			this.collection.fetch({
			    beforeSend : function(){
			        preloader.render();
			    },
                statusCode: {
                    403: function() { GO.util.error('403'); },
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    500: function() { GO.util.error('500'); }
                }
            }).done(function(){
                preloader.release();
            });

			this.apprSideModel = new ApprSideModel();
			this.apprSideModel.fetch({async : false});
		},

    	render: function() {
    		var lang = {
    				"이름" : commonLang['이름'],
    				"부서명" : commonLang['부서명'],
    				"이메일" : commonLang['이메일'],
    				"검색" : commonLang['검색'],
    				'개인 문서함' : approvalLang['개인 문서함'],
    				"기안 문서함" : approvalLang['기안 문서함'],
    				"결재 문서함" : approvalLang['결재 문서함'],
    				"참조/열람 문서함" : approvalLang['참조/열람 문서함'],
    				"수신 문서함" : approvalLang['수신 문서함'],
    	            '기안 완료함': approvalLang["기안 완료함"],
    	            '부서 참조함': approvalLang["부서 참조함"],
    	            '부서 수신함': approvalLang["부서 수신함"],
    	            '부서 문서함' : approvalLang["부서 문서함"],
    	            '문서번호' : approvalLang["문서번호"],
    	            '결재선' : approvalLang["결재선"],
					'company_docfolder' : approvalLang['전사 문서함'],
					'send_docfolder' : approvalLang['발송 문서함'],
					'added_docfolder' : approvalLang['추가된 문서함'],
					'shared_docfolder' : approvalLang['공유된 문서함'],
					'base_docfolder' : approvalLang['기본 문서함']
			};

    		var columns = this.columns;

			var addedFolder = false;
			if(this.apprSideModel.get('userFolders')){
				addedFolder = (this.apprSideModel.get('userFolders').length > 0);
			}
			var sharedFolder = false;
			if(this.apprSideModel.get('sharedFoldersToUser')){
				sharedFolder = (this.apprSideModel.get('sharedFoldersToUser').length > 0);
			}

			var dataset = this.deptFoldersData(this.apprSideModel.get('deptFolders'));

			var apprSideData = this.apprSideModel.toJSON();
			$.each(apprSideData.sharedFoldersToUser, function(i,v) {
				if (v.folderType == "USER") {
					v.isfolderTypeUser = true;
				} else {
					v.isfolderTypeUser = false;
				}
			});
			var tpl = DocumentReferenceTpl({
    			columns : columns,
    			lang : lang,
				addedFolder: addedFolder,
				sharedFolder: sharedFolder,
				apprSideData : apprSideData,
				dataset : dataset
			});

    		this.$el.html(tpl);

			// 초기 화면 세팅
			$('.tb_doc_attach > tbody').html(DocListEmptyTpl({
				columns: this.columns,
				lang: { 'doclist_empty': approvalLang['문서가 없습니다.'] }
			}));

			this.renderPages();
			this.sideCompanyDocRender();
		},

		deptFoldersData : function(deptFolders){
			if (deptFolders.length){
				$.each(deptFolders, function(index,v) {
					if (v.deptFolders.length > 0) {
						v.addedDeptFolder = true;
					} else {
						v.addedDeptFolder = false;
					}
					if (v.sharedDocFolders && v.sharedDocFolders.length > 0) {
						v.sharedDeptFolder = true;
						$.each(v.sharedDocFolders, function(i, folder){
							folder.deptId = v.deptId;
							if (folder.folderType == "USER") {
								folder.isfolderTypeUser = true;
							} else {
								folder.isfolderTypeUser = false;
							}
						});

					} else {
						v.sharedDeptFolder = false;
					}
				});
			}
			return deptFolders;
		},
		sideCompanyDocRender : function() {

			this.companyDocTreeView = new CompanyDocTreeTreeView({
				isAdmin: false,
				disabledSelect : false,
				apiCommonUrl : 'api/docfolder/sidetree',
				treeElementId: 'companyDocTree'
			});

			this.companyDocTreeView.render();

		},

		clickCompanyRefSide : function(e){
			var currentTarget = $(e.currentTarget),
				id = currentTarget.parents("li:first").attr("data-id"),
				collection = new CompanyDocCollection();

			collection.setFolderId(id);

			currentTarget.parents("div.set_nav:first").find("p").removeClass("on");
			currentTarget.parent().addClass("on");

			this.collection = collection;
			this.collection.setSort("latestActivityCompletedAt", "DESC");
			var preloader = $.goPreloader();
			preloader.render();

			this.collection.bind('reset', this.resetList, this);
			this.collection.fetch({
				statusCode: {
					403: function() { GO.util.error('403'); },
					404: function() { GO.util.error('404', { "msgCode": "400-common"}); },
					500: function() { GO.util.error('500'); }
				}
			}).done(function(){
				preloader.release();
			});
		},

		allCheck : function(e){
			$('.tb_doc_attach tbody input[type=checkbox]').attr('checked', $(e.currentTarget).is(':checked'));
		},

		clickUserRefSide : function(e){
			var currentTarget = $(e.currentTarget),
				type = currentTarget.parents("li:first").attr("data-type"),
				folderType = currentTarget.attr("data-navi") == "shareuserdoc" ? "userfolder" : "deptfolder",
				collection = {
					"draft" : new DocDraftCollection(),
					"sign" : new ApprDocCollection(),
					"cc" : new ViewerDocCollection(),
					"inbox" : new ReceptionDocCollection(),
					"send" : new SendDocCollection(),
					"userFolder" : new UserFolderDocCollection({folderId : currentTarget.attr("data-id")}),
					"sharedFolder" : new ShareFolderDocCollection({
						folderId : currentTarget.attr("data-id"),
						deptId : currentTarget.attr("data-deptid"),
						type : folderType,
						belong : currentTarget.attr("data-belong")
					})
				};

			currentTarget.parents("div.set_nav:first").find("p").removeClass("on");
			currentTarget.parent().addClass("on");

			this.collection = collection[type];
			if(type != "sharedFolder"){
				this.collection.setType("complete");
			}

			if(type == "cc") {
				this.collection.setSort("document.latestActivityCompletedAt", "DESC");
			}else{
			    this.collection.setSort("latestActivityCompletedAt", "DESC");
			}

            var preloader = $.goPreloader();
            preloader.render();

			this.collection.bind('reset', this.resetList, this);
			this.collection.fetch({
                statusCode: {
                    403: function() { GO.util.error('403'); },
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    500: function() { GO.util.error('500'); }
                }
            }).done(function(){
                preloader.release();
            });
		},

		clickDeptRefSide : function(e){
            var currentTarget = $(e.currentTarget),
                type = currentTarget.parents("li:first").attr("data-type"),
                deptId = currentTarget.parents("ul:first").attr("data-deptid"),
                folderId = currentTarget.parents("li:first").attr("data-folderId"),
				folderType = currentTarget.attr("data-navi") == "shareuserdoc" ? "userfolder" : "deptfolder",
                collection = {
                    "draft" : new DeptFolderDocCollection({deptId : deptId, type : "deptdraft"}),
                    "cc" : new DeptFolderDocCollection({deptId : deptId, type : "deptreference", status : "complete"}),
                    "inbox" : new ReceptionDocCollection("complete", deptId),
                    "folder" : new DeptFolderDocCollection({folderId : folderId , deptId : deptId, type : "deptfolder"}),
					"sharedFolder" : new ShareFolderDocCollection({
						folderId : folderId,
						deptId : deptId,
						type : folderType,
						belong : currentTarget.attr("data-belong")
					})

                };

	        currentTarget.parents("div.set_nav:first").find("p").removeClass("on");
	        currentTarget.parent().addClass("on");

	        this.collection = collection[type];

            var preloader = $.goPreloader();

            if(type == "cc") {
				this.collection.setSort("document.latestActivityCompletedAt", "DESC");
			}else{
				this.collection.setSort("latestActivityCompletedAt", "DESC");
			}

            this.collection.bind('reset', this.resetList, this);
            this.collection.fetch({
                beforeSend : function(){
                    preloader.render();
                },
                statusCode: {
                    403: function() { GO.util.error('403'); },
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    500: function() { GO.util.error('500'); }
                }
            }).done(function(){
                console.info("done!!");
                preloader.release();
            });
		},

		setFormDetail: function(dataId){
			this.collection.setFolderId(dataId);
			this.collection.fetch();
		},

		renderPageSize: function() {
			this.pageSizeView = new PageSizeView({pageSize: this.collection.pageSize});
    		this.pageSizeView.render();
    		this.pageSizeView.bind('changePageSize', this.selectPageSize, this);
		},
		renderPages: function() {
			this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
			this.pageView.bind('paging', this.selectPage, this);
			this.$el.find('#messageNaviWrap > div.dataTables_paginate').remove();
			this.pageView.render();
			// TODO: 결재문서 첨부에서 사이드와 본문이 어긋나는 현상 임시 수정
			// 근본적으로 PaginationView 내에서 padding-top값이 하드코딩 되어 있는 것을 삭제해야 한다.
			this.pageView.$el.removeAttr('style');
			this.$el.find('#messageNaviWrap').append(this.pageView.el);
		},
		resetList: function(doclist) {
			//var fragment = this.collection.url().replace('/api/','');
			//GO.router.navigate(fragment, {trigger: false, pushState: true});

			$('.tb_doc_attach > tbody').empty();
			var columns = this.columns;
			var listType = "approval";

			doclist.each(function(doc){
				var docListItemView = new RelatedDocListItemView({
					model: doc,
					listType : listType,
					columns: columns,
					isCheckboxVisible : true,
					isShowUrl : false
				});
				$('.tb_doc_attach > tbody').append(docListItemView.render().el);
			});

			if (doclist.length == 0) {
				$('.tb_doc_attach > tbody').html(DocListEmptyTpl({
					columns: this.columns,
					lang: { 'doclist_empty': approvalLang['문서가 없습니다.'] }
				}));
			}

			this.renderPages();
		},

		// 페이지 이동
		selectPage: function(pageNo) {
			this.collection.setPageNo(pageNo);

			var preloader = $.goPreloader();

			this.collection.fetch({
                beforeSend : function(){
                    preloader.render();
                }
			}).done(function(){
                console.info("done!!");
                preloader.release();
            });
		},

		// 목록갯수 선택
		selectPageSize: function(pageSize) {
			this.collection.setPageSize(pageSize);
			this.collection.fetch();
		},

		// 검색
		search: function() {
			var keywordEl = this.$el.find("#search_title");
			var searchType = this.$el.find("#referenceSearchType").val();
			this.collection.setSearch(searchType, keywordEl.val());
			this.collection.fetch();
			keywordEl.val("");
		},

		searchEnter : function(e){
			if(e.keyCode == "13"){
				this.search();
			}
		},

		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});

	return DocumentReferenceView;
});
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    
    "approval/collections/user_folder_doclist",
    
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    "approval/views/doclist/base_doclist",
    
    "approval/views/doclist/doclist_item",
    "approval/views/doclist/doclist_csv_download",
    "approval/views/doclist/user_doc_folder",
    
    "approval/views/side",
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/user_folder_doclist",
	"approval/models/all_documents_action",
    
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	
	UserFolderDocCollection,
	
	ContentTopView,
	PaginationView,
	PageSizeView,
    BaseDocListView,
	
	DocListItemView,
	DocListCsvDownloadView,
	UserDocFolderView,
	
	SideView,
	DocListEmptyTpl,
	UserFolderDocListTpl,
    UserDocActionModel,
	
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
	
	//이동
	var UserDocMoveModel = Backbone.Model.extend({
		url : function(){
			var url = ['/api/approval/userfolder/' + this.folderId + '/document/move'].join('/');
			return url;
		},
		setFolderId: function(folderId) {
			this.folderId = folderId;
		}
	});
	
	//삭제
	var UserDocDeleteModel = Backbone.Model.extend({
		url : function(){
			var url = ['/api/approval/userfolder/' + this.folderId + '/document/remove'].join('/');
			return url;
		},
		setFolderId: function(folderId) {
			this.folderId = folderId;
		}
	});
	
	var UserFolderDocListView = BaseDocListView.extend({
        docFolderType : null,
		userFolderCols: {
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
		buttons: {},
		el: '#content',
		initialize: function(options) {
		    this.options = options || {};
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');
			this.contentTop = ContentTopView.getInstance();
			this.type = this.options.type;
			this.isRef = false;
			
			this.buttons.move = true;
			this.buttons.remove = true;
			this.docFolderType = 'custom_add';
			this.checkboxColumn = {
					id : 'checkedAllDeptDoc',
					name : 'checkedAllDeptDoc'
			}
			this.usePeriod = true;
			this.folderId = this.options.folderId;
			this.userId = GO.session("id");
			
			this.collection = new UserFolderDocCollection({
			    folderId : this.folderId,
			    userId : this.userId,
			    type : this.type
			});
			
			this.initProperty = "draftedAt";
			this.initDirection = "desc";
			this.ckeyword = "";
			var baseUrl = sessionStorage.getItem('list-history-baseUrl');
			if (baseUrl) {
				baseUrl = baseUrl.replace(/#/gi, "");
			}
			var currUrl = 'approval/userfolder/' + this.folderId + '/documents'; 
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
				'click #userDocMove' : 'userDocMove',
				'click #userDocDelete' : 'userDocDelete',
				'click .sorting' : 'sort',
				'click .sorting_desc' : 'sort',
				'click .sorting_asc' : 'sort',
                'click #checkedAllDeptDoc' : 'checkedAllDoc'
			});
		},
		
    	userDocMove: function() {
    		var self = this;
			var docIds = [];
			var target = $('input[name=checkbox]:checked');
			target.each(function(){
				docIds.push($(this).attr('data-id'));
			});
			if ($.isEmptyObject(docIds)) {
				$.goError(approvalLang["선택된 항목이 없습니다."]);
				return;
			}
			var userName = this.userName;
			var userId = this.userId;
			var sourceId = this.folderId;
			var model;

			var userDocMoveLayer = $.goPopup({
				"pclass" : "layer_normal layer_doc_type_select",
				"header" : approvalLang['문서 이동'],
				"modal" : true,
				"width" : 300,
				"contents" :  "",
				"buttons" : [{
								'btext' : commonLang['확인'],
								'btype' : 'confirm',
								'autoclose' : false,
								'callback': function(rs){
									var targetId = (rs.find('.on span[data-folderid]').attr('data-folderid'));
									if (!targetId) {
										$.goError(approvalLang["이동하실 문서함을 선택해주십시요."]);
										$('#userFolderError').addClass('enter error').focus();
										return false;
									}
									if (targetId == sourceId) {
										$.goError(approvalLang["동일한 문서함입니다."]);
										$('#userFolderError').addClass('enter error').focus();
										return false;
									}

									var preloader = $.goPreloader();

									if(rs.parent().find('#allSelectTr').is(':visible') && rs.parent().find('#allSelectMsg3').attr('data-value') == 'folder'){

                                        model = new UserDocActionModel({folderType : 'userfolder', action : 'move'});
                                        if(!_.isUndefined(self.collection.keyword) && self.collection.keyword.trim().length > 0){
                                            model.setSearch(self.collection.searchtype, self.collection.keyword);
                                            if(self.collection.duration == "period"){
                                                model.setDuration({
                                                    duration : self.collection.duration,
                                                    fromDate : GO.util.toISO8601(self.collection.fromDate),
                                                    toDate : GO.util.searchEndDate(self.collection.toDate)
                                                });
                                            }
                                        }

                                    }else{
                                        model = new UserDocMoveModel({'ids' : docIds});
                                    }
                                    model.set({ 'folderId' : targetId });
                                    model.setFolderId(sourceId);
									model.save({

									}, {
										silent : true,
										type : 'PUT',
										beforeSend: function(){
		                			        preloader.render();
		                			    },
										success : function() {
											$.goMessage(approvalLang["선택한 항목이 이동되었습니다"]);
											rs.close();
											self.$el.find('#checkedAllDeptDoc').attr('checked', false);
											self.collection.fetch();
										},
										error:  function(model,rs){
											var result = JSON.parse(rs.responseText);
											$.goError(result.message);
										},
										complete: function() {
		                			    	preloader.release();
		                			    }
									});
								}
							},
							{
								'btext' : commonLang["취소"],
								'btype' : 'cancel'
							}]
			});

			var userDocFolderView = new UserDocFolderView({
				docIds : docIds,
				userId : userId
			});
			
			userDocFolderView.render();
			if(docIds!=''){
				userDocMoveLayer.reoffset();
			}
			
		},
		userDocDelete: function() {
			var self = this;
			var docIds = [];
			var folderId = this.folderId;
			var target = $('input[name=checkbox]:checked');
			target.each(function(){
				docIds.push($(this).attr('data-id'));
			});
			if ($.isEmptyObject(docIds)) {
				$.goError(approvalLang["선택된 항목이 없습니다."]);
				return;
			}
			var userDeleteModel;
			$.goConfirm(approvalLang['선택한 항목을 삭제하시겠습니까?'],
				'',
				function(rs) {
					var preloader = $.goPreloader();

					if(rs.parent().find('#allSelectTr').is(':visible') && rs.parent().find('#allSelectMsg3').attr('data-value') == 'folder'){

                        userDeleteModel = new UserDocActionModel({folderType : 'userfolder', action : 'remove'});
                        if(!_.isUndefined(self.collection.keyword) && self.collection.keyword.trim().length > 0){
                            userDeleteModel.setSearch(self.collection.searchtype, self.collection.keyword);
                            if(self.collection.duration == "period"){
                                userDeleteModel.setDuration({
                                    duration : self.collection.duration,
                                    fromDate : GO.util.toISO8601(self.collection.fromDate),
                                    toDate : GO.util.searchEndDate(self.collection.toDate)
                                });
                            }
                        }

                    }else{
                        userDeleteModel = new UserDocDeleteModel({'ids' : docIds});
                    }
                    userDeleteModel.setFolderId(folderId);
                    userDeleteModel.save({
					}, {
						silent : true,
						type : 'PUT',
						beforeSend: function(){
        			        preloader.render();
        			    },
						success : function() {
							$.goMessage(approvalLang["선택한 항목이 삭제되었습니다"]);
							self.$el.find('#checkedAllDeptDoc').attr('checked', false);
							self.collection.fetch();
						},
						error : function(){
							$.goError(commonLang['저장에 실패 하였습니다.']);
						},
						complete: function() {
        			    	preloader.release();
        			    }
					});
				});
		},
		renderLayout: function() {
			this.$el.html(UserFolderDocListTpl({
				lang: lang,
				buttons: this.buttons,
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
            if($(e.currentTarget).is(':checked')){
                $(e.currentTarget).attr('checked', true);
                if($('td.check :checkbox:checked').length == this.collection.pageSize){
                    this.$el.find('#checkedAllDeptDoc').attr('checked', true);
                    this.toggleSelectAllTpl(true);
                }
            }else{
                this.$el.find('#checkedAllDeptDoc').attr('checked', false);
                $(e.currentTarget).attr('checked', false);
                this.toggleSelectAllTpl(false);
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
				this.renderTitle(this.collection.extData.folderName);
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
            this.completeDocumentTotal = this.collection.total;
            this.renderSelectAllTpl();
			var columns = this.columns;
			var listType = "approval";
			doclist.each(function(doc){
				var docListItemView = new DocListItemView({ 
					model: doc,
					isCheckboxVisible: doc.isCompleted(),
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
		},

        checkedAllDoc : function(){
            if ($("#checkedAllDeptDoc").is(":checked")) {
                $('td.check :checkbox:not(checked)').attr("checked", true);
            } else {
                $('td.check :checkbox:checked').attr("checked", false);
            }
            this.toggleSelectAllTpl($("#checkedAllDeptDoc").is(":checked"));
        },

        toggleSelectAllTpl : function(isSelect){
            var hasMorePage = this.completeDocumentTotal > this.collection.pageSize;
            if(isSelect && hasMorePage){
                $('#allSelectTr').show();
            }else{
                $('#allSelectTr').hide();
            }
        }
	});
	
	return UserFolderDocListView;
});
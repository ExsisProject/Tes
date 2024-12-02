// 부서 문서함 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    
    "approval/collections/dept_folder_doclist",
    
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    "approval/views/doclist/base_doclist",
    
    "approval/views/doclist/doclist_item",
    "approval/views/doclist/doclist_csv_download",
    "approval/views/doclist/dept_doc_folder",
    "approval/views/create_rule",
    "approval/models/all_documents_action",

    "approval/views/side",
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/dept_folder_doclist",
    
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	
	DeptFolderDocCollection,
	
	ContentTopView,
	PaginationView,
	PageSizeView,
    BaseDocListView,
	
	DocListItemView,
	DocListCsvDownloadView,
	DeptDocFolderView,
	CreateRuleView,
	DeptAllDocsActionModel,

	SideView,
	DocListEmptyTpl,
	DeptFolderDocListTpl,
	
    commonLang,
    approvalLang
) {
    
	var DeptDocCopyModel = Backbone.Model.extend({
		url : function(){
			var url = ['/api/approval/deptfolder/' + this.folderId + '/document/add'].join('/');
			return url;
		},
		setFolderId: function(folderId) {
			this.folderId = folderId;
		}
	});
	
	var DeptDocMoveModel = Backbone.Model.extend({
		url : function(){
			var url = ['/api/approval/deptfolder/' + this.folderId + '/document/move'].join('/');
			return url;
		},
		setFolderId: function(folderId) {
			this.folderId = folderId;
		}
	});
	
	var DeptDocDeleteModel = Backbone.Model.extend({
		url : function(){
			var url = ['/api/approval/deptfolder/' + this.folderId + '/document/remove'].join('/');
			return url;
		},
		setFolderId: function(folderId) {
			this.folderId = folderId;
		}
	});
	
	var DeptFolderDocListView = BaseDocListView.extend({
        docFolderType : null,
		deptDraftCols: {
			'선택' : commonLang['선택'],
			'기안일': approvalLang['기안일'], 
			'기안자': approvalLang['기안자'],
			'결재양식': approvalLang['결재양식'], 
			'긴급': approvalLang['긴급'], 
			'제목': commonLang['제목'], 
			'첨부': approvalLang['첨부'],
			'부서 문서함': approvalLang['부서 문서함'],
			'문서번호': approvalLang['문서번호'],
			'count': 9
		},
		deptRefCols: {
			'선택' : commonLang['선택'],
			'기안일': approvalLang['기안일'], 
			'기안자': approvalLang['기안자'],
			'결재양식': approvalLang['결재양식'], 
			'긴급': approvalLang['긴급'], 
			'제목': commonLang['제목'], 
			'첨부': approvalLang['첨부'],
			'결재상태': approvalLang['결재상태'],
			'부서 문서함': approvalLang['부서 문서함'],
			'문서번호': approvalLang['문서번호'],
			'count': 10
		},
	    deptOfficialCols: {
            '부서공문결재일': approvalLang['결재일'],
            '기안자': approvalLang['기안자'],
            '결재양식': approvalLang['결재양식'],
            '긴급': approvalLang['긴급'], 
            '제목': commonLang['제목'],
            '첨부': approvalLang['첨부'],
            '결재상태': approvalLang['결재상태'],
            '부서 문서함': approvalLang['부서 문서함'],
            '문서번호': approvalLang['문서번호'],
            'count': 9
	    },
		deptFolderCols: {
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
			if (this.type == 'deptdraft') { //기안완료함
				this.buttons.copy = true;
				this.buttons.move = false;
				this.buttons.remove = false;
				this.docFolderType = 'dept_complete';
				this.checkboxColumn = {
						id : 'checkedAllDeptDoc',
						name : 'checkedAllDeptDoc'
				}
				this.usePeriod = true;
				this.showDeptSearchType = true;
				this.initProperty = "draftedAt";
			} else if (this.type == 'deptreference') { //부서참조함
				this.buttons.copy = true;
				this.buttons.move = false;
				this.buttons.remove = false;
				this.docFolderType = 'dept_ref';
				this.isRef = true;
				this.checkboxColumn = {
						id : 'checkedAllDeptDoc',
						name : 'checkedAllDeptDoc'
				}
				this.usePeriod = true;
				this.showDeptSearchType = true;
				this.initProperty = "document.draftedAt";
			} else if (this.type == 'deptofficial') { //공문발송함
			    this.buttons.copy = false;
                this.buttons.move = false;
                this.buttons.remove = false;
				this.docFolderType = 'dept_official';
				this.usePeriod = false;
				this.showDeptSearchType = true;
				this.initProperty = "isEmergency";
			} else { //기타 추가된 부서함
				this.buttons.copy = false;
				this.buttons.move = true;
				this.buttons.remove = true;
				this.docFolderType = 'custom_add';
				this.checkboxColumn = {
						id : 'checkedAllDeptDoc',
						name : 'checkedAllDeptDoc'
				}
				this.usePeriod = true;
				this.showDeptSearchType = true;
				this.initProperty = "draftedAt";
			}
			this.initDirection = "desc";
			this.folderId = this.options.folderId;
			if (this.options.deptId) {
				var queryString = this.options.deptId;
				var idx = queryString.indexOf("?");
				if (idx >= 0) {
					this.deptId = queryString.substring(0, idx);
				} else {
					this.deptId = queryString;
				}
			}
			this.classifyManagable = false;
			this.deptAdmin = false;
			this.deptAdminData = SideView.getManageble();
			var self = this;
			if (self.deptAdminData.length && GO.session('useOrg')) {
				$.each(self.deptAdminData, function(k,v) {
					if (self.type == 'deptdraft') {
						if (v.managable && self.deptId == v.deptId) {
							self.deptAdmin = true;
						}
					}
					if(v.managable && self.deptId == v.deptId){
						self.classifyManagable = true;
					}
					if (v.managable && v.containsSubDept) {
						$.each(v.deptFolders, function(i,j) {
							if (j.folderId == self.folderId) {
								self.deptAdmin = true;
							}
						});
					}
				});
			}
			
			this.collection = new DeptFolderDocCollection({
			    folderId : this.folderId,
			    deptId : this.deptId,
			    type : this.type
			});
			this.ckeyword = "";
			var baseUrl = sessionStorage.getItem('list-history-baseUrl');
			if (baseUrl) {
				baseUrl = baseUrl.replace(/#/gi, "");
			}
			var currUrl = 'approval/deptfolder/' + this.folderId + '/documents'; 
			if (this.type == "deptdraft") {
				currUrl = 'approval/deptfolder/draft/' + this.deptId;
			} else if (this.type == "deptreference") {
				currUrl = 'approval/deptfolder/reference/' + this.deptId;
			} else if (this.type == "deptofficial") {
			    currUrl = 'approval/deptfolder/official/' + this.deptId;
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
				'click #deptDocCopy' : 'deptDocCopy',
				'click #deptDocClassify' : 'deptDocClassify',
				'click #deptDocMove' : 'deptDocMove',
				'click #deptDocDelete' : 'deptDocDelete',
				'click .sorting' : 'sort',
				'click .sorting_desc' : 'sort',
				'click .sorting_asc' : 'sort',
				'click #checkedAllDeptDoc' : 'checkedAllDoc',
				'click #docClassifyMenu' : 'toggleDocClassifyMenu'
			});
		},
		
    	deptDocCopy: function() {
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
			var deptName = this.deptName;
			var deptId = this.deptId;
			var model;
			
			var tempView = new DeptDocFolderView({
				docIds : docIds,
				deptId : deptId,
				deptName : deptName
			});
			
			if(tempView.isEmptyDocFolder()){
				tempView.release();
                $.goAlert(approvalLang['부서 문서함이 없습니다.']);
                return false;
			}else{
				tempView.release();
			}
			
			var deptDocCopyLayer = $.goPopup({
				"pclass" : "layer_normal layer_doc_type_select",
                "header" : approvalLang['부서 문서함 분류'],
                "modal" : true,
                "width" : 300,
                "contents" :  "",
                "buttons" : [
                    {
                        'btext' : commonLang['확인'],
                        'btype' : 'confirm',
                        'autoclose' : false,
                        'callback': function(rs) {
                            var targetId = (rs.find('.on span[data-folderid]').attr('data-folderid'));
                            if (!targetId) {
                                $.goError(approvalLang["이동하실 문서함을 선택해주십시요."], $('.list_wrap '));
                                return false;
                            }
                            
                            var preloader = $.goPreloader();

							if(rs.parent().find('#allSelectTr').is(':visible') && rs.parent().find('#allSelectMsg3').attr('data-value') == 'folder'){

                                model = new DeptAllDocsActionModel({folderType : self.collection.type+'folder'});
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
                                model.set({ 'deptId' : deptId });
                            }else{
                                model = new DeptDocCopyModel({'ids' : docIds});
                            }
                        	model.setFolderId(targetId);
                        	model.save({

							}, {
                                silent : true,
                                type : 'PUT',
                                beforeSend: function(){
                			        preloader.render();
                			    },
                                success : function(m, r) {
                                    $.goMessage(approvalLang["선택한 항목이 복사되었습니다"]);
                                    rs.close();
                                    self.$el.find('#checkedAllDeptDoc').attr('checked', false);
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
                        'btext' : commonLang["취소"],
                        'btype' : 'cancel'
                    }
                ]
            });
			
			var deptDocFolderView = new DeptDocFolderView({
				docIds : docIds,
				deptId : deptId,
				deptName : deptName
			});
			
			deptDocFolderView.render();
			if(docIds!=''){
				deptDocCopyLayer.reoffset();
			}
    	},
    	
    	deptDocClassify: function(){
        	var self = this;
    		var docIds = [];
			var target = this.$('input[name=checkbox]:checked');
			target.each(function(){
				docIds.push($(this).attr('data-id'));
			});
			if ($.isEmptyObject(docIds)) {
				$.goError(approvalLang["선택된 항목이 없습니다."]);
				return;
			}

			if (docIds.length != 1) {
				$.goError(approvalLang["하나의 문서만 자동분류할 수 있습니다"]);
				return;
			}
			var docModel = this.collection.get(docIds[0]);
			var docData = {title : docModel.get('title'), form :
						   docModel.get('formName'),
						   drafter : docModel.get('drafterName'),
						   draftDeptName : docModel.get('drafterDeptName'),
						   docFolderType : this.type == "deptreference" ? "REFERRENCE_READ" : "DRAFT"};
			var createRuleView = new CreateRuleView({deptId:this.deptId, deptId:this.deptId, docId:docIds[0], docInfo : docData});

			var popupView = $.goPopup({
				"pclass" : "layer_normal layer_auto",
				"header" : approvalLang['자동분류'],
				"modal" : true,
				"width" : 380,
				"contents" :  "",
				"buttons" : [{
								'btext' : commonLang["확인"],
								'btype' : 'confirm',
								'autoclose' : false,
								'callback' : function(rs) {
									if(createRuleView.validate()){
										createRuleView.createRule().done(function(){
											rs.close();
										});
									}
								}
							},
							{
								'btext' : commonLang["취소"],
								'btype' : 'cancel'
							}]
			});

			popupView.find(".content").html(createRuleView.render().el);
			popupView.reoffset();
        },

    	deptDocMove: function() {
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
			var deptName = this.deptName;
			var deptId = this.deptId;
			var sourceId = this.folderId;
			var model;

			var deptDocMoveLayer = $.goPopup({
				"pclass" : "layer_normal layer_doc_type_select",
				"header" : approvalLang['문서 이동'],
				"modal" : true,
				"width" : 300,
				"contents" :  "",
				"buttons" : [
                    {
                        'btext' : commonLang['확인'],
                        'btype' : 'confirm',
                        'autoclose' : false,
                        'callback': function(rs){
                            var targetId = (rs.find('.on span[data-folderid]').attr('data-folderid'));
                            if (!targetId) {
                                $.goError(approvalLang["이동하실 문서함을 선택해주십시요."]);
                                $('#deptFolderError').addClass('enter error').focus();
                                return false;
                            }
                            if (targetId == sourceId) {
                                $.goError(approvalLang["동일한 문서함입니다."]);
                                $('#deptFolderError').addClass('enter error').focus();
                                return false;
                            }
                            var preloader = $.goPreloader();

							if(rs.parent().find('#allSelectTr').is(':visible') && rs.parent().find('#allSelectMsg3').attr('data-value') == 'folder'){

                                model = new DeptAllDocsActionModel({folderType : 'deptfolder', action : 'move'});
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
                                model = new DeptDocMoveModel({'ids' : docIds});
                            }
                            model.set({'folderId' : targetId });
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
                    }
                ]
			});

			var deptDocFolderView = new DeptDocFolderView({
				docIds : docIds,
				deptId : deptId,
				deptName : deptName
			});
			
			deptDocFolderView.render();
			if(docIds!=''){
				deptDocMoveLayer.reoffset();
			}
			
		},
		deptDocDelete: function() {
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
			var deptDeleteModel;
			$.goConfirm(approvalLang['선택한 항목을 삭제하시겠습니까?'],
				'',
				function(rs) {
					var preloader = $.goPreloader();

					if(rs.parent().find('#allSelectTr').is(':visible') && rs.parent().find('#allSelectMsg3').attr('data-value') == 'folder'){

                        deptDeleteModel = new DeptAllDocsActionModel({folderType : 'deptfolder', action : 'remove'});
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
                        deptDeleteModel = new DeptDocDeleteModel({'ids' : docIds});
                    }
                    deptDeleteModel.setFolderId(folderId);
                    deptDeleteModel.save({
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
			var lang = {
				'제목': commonLang['제목'],
				'기안자': approvalLang['기안자'],
				'검색': commonLang['검색'],
				'부서 문서함 분류' : approvalLang['부서 문서함 분류'],
				'이동' : commonLang['이동'],
				'삭제' : commonLang['삭제'],
                '결재양식': approvalLang['결재양식'],
                '결재선': approvalLang['결재선'],
                '문서번호': approvalLang['문서번호'],
                '기안부서' : approvalLang['기안부서'],
				'placeholder_search' : commonLang['플레이스홀더검색'],
				'자동분류' : approvalLang["자동분류"],
				'분류' : approvalLang['분류']
			};
			this.$el.html(DeptFolderDocListTpl({
				lang: lang,
				buttons: this.buttons,
				isRef : this.isRef,
				classifyManagable : this.classifyManagable,
				showDeptSearchType : this.showDeptSearchType
			}));
			//this.contentTop.setTitle(approvalLang['부서 문서함']);
    		this.contentTop.render();
			this.contentTop.setTitle('');
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
    		
    		this.$el.find('input[placeholder]').placeholder();
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
				this.deptName = this.collection.extData.deptName;
				this.renderTitle(this.collection.extData.folderName + ' <span class="meta">in ' + this.collection.extData.deptName + '</span>');
				this.deptId = this.collection.extData.deptId;
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
		toggleDocClassifyMenu : function(e){
			var target = $(e.currentTarget).find('.array_option');
			if(target.is(":visible")){
				target.hide();
			}else{
				target.show();
			}
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
	
	return DeptFolderDocListView;
});
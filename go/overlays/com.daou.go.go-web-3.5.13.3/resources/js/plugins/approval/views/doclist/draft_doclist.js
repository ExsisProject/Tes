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
    "approval/views/doclist/user_doc_folder",
    "approval/views/create_rule",
    
    "approval/models/doc_list_field",
    "approval/collections/doc_list_field",
    "approval/models/doclist_item",
    "approval/collections/draft_doclist",
    "approval/models/all_documents_action",

    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/draft_doclist",

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
    UserDocFolderView,
    CreateRuleView,
    
    DocListFieldModel,    
    DocListFieldCollection,
    DocListItemModel,
    DraftDocList,
    UserAllDocsCopyModel,

    DocListEmptyTpl,
    DraftDocListTpl,

    commonLang,
    approvalLang
) {
    
	var UserDocCopyModel = Backbone.Model.extend({
		url : function(){
			var url = ['/api/approval/userfolder/' + this.folderId + '/document/add'].join('/');
			return url;
		},
		setFolderId: function(folderId) {
			this.folderId = folderId;
		}
	});

	var lang = {
            '전체': approvalLang['전체'],
            '진행': approvalLang['진행'],
            '완료': approvalLang['완료'],
            '반려': approvalLang['반려'],
            '임시저장': approvalLang['임시저장'],
            '제목': commonLang['제목'],
            '기안자': approvalLang['기안자'],
            '결재선': approvalLang['결재선'],
            '기안부서' : approvalLang['기안부서'],
            '문서번호': approvalLang['문서번호'],
            '검색': commonLang['검색'],
            '결재양식': approvalLang['결재양식'],
            'placeholder_search' : commonLang['플레이스홀더검색'],
            '개인 문서함 분류' : approvalLang['개인 문서함 분류'],
            '자동분류' : approvalLang["자동분류"],
            '개인 문서함이 없습니다' : approvalLang['개인 문서함이 없습니다'],
            '분류' : approvalLang['분류']
    };
	
    var DraftDocListView = BaseDocListView.extend({
        
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
        docFolderType : 'user_draft',
		usePeriod : true,
        initialize: function(options) {
            this.options = options || {};
            _.bindAll(this, 'render', 'renderPageSize', 'renderPages');
            this.contentTop = ContentTopView.getInstance();
            this.type = this.options.type;
            if (this.options.type.indexOf("?") >=0) {
            	this.type = this.options.type.substr(0,this.options.type.indexOf("?"));
            }
            this.collection = new DraftDocList();
            this.collection.setType(this.type);

            this.initProperty = "draftedAt";
            this.initDirection = "desc";
            this.ckeyword = "";
            this.userId = GO.session("id");
            
            var baseUrl = sessionStorage.getItem('list-history-baseUrl');
            var regexp = new RegExp('(#)?approval/doclist/draft/' + this.type + "$");
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
            this.checkboxColumn = {
					id : 'checkedAllDeptDoc',
					name : 'checkedAllDeptDoc'
			}
            
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
	            'click #userDocCopy' : 'userDocCopy',
	            'click #userDocClassify' : 'userDocClassify',
	            'click #checkedAllDeptDoc' : 'checkedAllDoc',
	            'click #docClassifyMenu' : 'toggleDocClassifyMenu'
			});
        },
        
        userDocCopy: function(){
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

			var userId = this.userId;
			var model;
			
			var tempView = new UserDocFolderView({
				docIds : docIds,
				userId : userId
			});
			
			if(tempView.isEmptyDocFolder()){
				tempView.release();
                $.goAlert(lang['개인 문서함이 없습니다']);
                return false;
			}else{
				tempView.release();
			}
			
			var userDocCopyLayer = $.goPopup({
				"pclass" : "layer_normal layer_doc_type_select",
                "header" : lang['개인 문서함 분류'],
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

                                model = new UserAllDocsCopyModel({folderType : 'userdraftfolder'});
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
                                model = new UserDocCopyModel({'ids' : docIds});
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
			
			var userDocFolderView = new UserDocFolderView({
				docIds : docIds,
				userId : userId
			});
			
			userDocFolderView.render();
			if(docIds!=''){
				userDocCopyLayer.reoffset();
			}
        },
        
        userDocClassify: function(){
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
			var docData = {title : docModel.get('title'), 
					       form : docModel.get('formName'), 
					       drafter : docModel.get('drafterName'), 
					       draftDeptName : docModel.get('drafterDeptName'), 
					       docFolderType : "DRAFT"};
			var createRuleView = new CreateRuleView({docId:docIds[0], docInfo : docData});
			
			var popupView = $.goPopup({
				"pclass" : "layer_normal layer_auto",
				"header" : lang['자동분류'],
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
        
        renderLayout : function(){
        	var self = this;
            this.$el.html(DraftDocListTpl({
                lang: lang            
             }));
            if (this.type.indexOf("?") >=0) {
            	this.type = this.type.substr(0,this.type.indexOf("?"));
            }
            $('#tab_' + this.type).addClass('on');
            this.contentTop.setTitle(approvalLang['기안 문서함']);
            this.contentTop.render();
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
                if($('td.check :checkbox:checked').length == this.collection.getCompletedDocumentCount()){
                    this.$el.find('#checkedAllDeptDoc').attr('checked', true);
                    if(this.collection.type == "complete" || this.collection.type == "all"){
                        this.toggleSelectAllTpl(true);
                    }
                }
            }else{
                this.$el.find('#checkedAllDeptDoc').attr('checked', false);
                $(e.currentTarget).attr('checked', false);
                if(this.collection.type == "complete" || this.collection.type == "all"){
                    this.toggleSelectAllTpl(false);
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
            this.completeDocumentTotal = this.completeDocumentCount();
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
        // 탭 이동
        selectTab: function(e) {
        	this.collection.setPageNo(0);
            $('.tab_nav > li').removeClass('on');
            $(e.currentTarget).addClass('on');
            this.$el.find('#checkedAllDeptDoc').attr('checked', false);
            // TODO 브라우저 URL 변경
            var tabId = $(e.currentTarget).attr('id');
            if (tabId == 'tab_all') {
                this.collection.setType('all');
            } else if (tabId == 'tab_inprogress') {
                this.collection.setType('inprogress');
            } else if (tabId == 'tab_complete') {
                this.collection.setType('complete');
            } else if (tabId == 'tab_return') {
                this.collection.setType('return');
            } else if (tabId == 'tab_temp') {
                this.collection.setType('temp');
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
            if(this.collection.type == "complete" || this.collection.type == "all"){
                this.toggleSelectAllTpl($("#checkedAllDeptDoc").is(":checked"));
            }
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

        makeCompleteDocumentCountingUrl: function(){
            var url = GO.contextRoot + "api/approval/doclist/draft/complete/count?";
            return url + this.makeParams();
        }
    });
    
    return DraftDocListView;
});
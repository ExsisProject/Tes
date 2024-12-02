// 수신문서함 목록
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
    "approval/views/doclist/user_doc_folder",
    "approval/views/doclist/base_doclist",
    "approval/views/create_rule",
    "approval/collections/reception_doclist",
    "approval/models/doclist_item",
    "hgn!approval/templates/reception_doclist",
    "hgn!approval/templates/doclist_empty",
    "approval/models/all_documents_action",
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
    UserDocFolderView,
    BaseDocListView,
    CreateRuleView,
    ReceptionDocCollection,
    DocListItemModel,
    ReceptionDocListTpl,
    DocListEmptyTpl,
    UserAllDocsCopyModel,
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
        '제목': commonLang['제목'],
        '기안자': approvalLang['기안자'],
        '담당자': approvalLang['담당자'],
        '결재양식': approvalLang['결재양식'],
        '결재선': approvalLang['결재선'],
        '기안부서' : approvalLang['기안부서'],
        '문서번호': approvalLang['문서번호'],
        '원문번호': approvalLang['원문번호'],
        '검색': commonLang['검색'],
        '전체': approvalLang['전체'],
        '접수대기': approvalLang['접수대기'],
        '접수': approvalLang['접수'],
        '진행': approvalLang['진행'],
        '완료': approvalLang['완료'],
        '반려': approvalLang['반려'],
        '부서 문서함 분류' : approvalLang['부서 문서함 분류'],
        '개인 문서함 분류' : approvalLang['개인 문서함 분류'],
        '개인 문서함이 없습니다' : approvalLang['개인 문서함이 없습니다'],
        '자동분류' : approvalLang['자동분류'],
        '분류' : approvalLang['분류'],
        '반송' : approvalLang['반송'],
    };
	
    var ReceptionListView = BaseDocListView.extend({
    	el: '#content',
    	
        columns: {
            '접수일' : approvalLang['접수일'],
            '결재양식': approvalLang['결재양식'],
            '긴급': approvalLang['긴급'], 
            '제목': commonLang['제목'],
            '첨부': approvalLang['첨부'],
            '기안자': approvalLang['기안자'],
            '담당자': approvalLang['담당자'],
            '결재상태': approvalLang['결재상태'],
            '문서번호': approvalLang['문서번호'],
            '원문번호': approvalLang['원문번호'],
            'count': 10
        },
        
        docFieldModel : null,
        docFolderType : null,

        events: {
        	'click input:checkbox' : 'toggleCheckbox',
			'click #deptDocCopy' : 'deptDocCopy',
			'click #userDocClassify' : 'docClassify',
			'click #deptDocClassify' : 'docClassify',
            'click .tab_nav > li' : 'selectTab',
            'click .sorting' : 'sort',
            'click .sorting_desc' : 'sort',
            'click .sorting_asc' : 'sort',
            'click .btn_search2' : 'search',
            'keypress input#keyword': 'searchByEnter',
            'click #userDocCopy' : 'userDocCopy',
            'click #checkedAllDeptDoc' : 'checkedAllDoc',
            'click p#allSelectMsg3' : 'toggleSelectScope',
            'click #docClassifyMenu' : 'toggleDocClassifyMenu'
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
            this.docFolderType = (_.isEmpty(this.deptId)) ? 'user_reception' : 'dept_reception';
            this.contentTop = ContentTopView.getInstance();
            this.collection = new ReceptionDocCollection(this.type, this.deptId);
            this.initProperty = "receivedAt";
            this.initDirection = "desc";
            this.initPage = 20;
            this.ckeyword = "";
            this.userId = GO.session("id");

            _.bindAll(this, 'render', 'renderPageSize', 'renderPages');
            
            var baseUrl = sessionStorage.getItem('list-history-baseUrl');
            var checkUrl = false;
            if(baseUrl){
            	var allowedUrls = ["approval/doclist/reception/" + this.type,
                                   "approval/deptfolder/receive/"+ this.deptId + "/" + this.type
                                   ]
            	checkUrl = _.contains(allowedUrls, baseUrl);
            }
            
            if (checkUrl) {
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

                                model = new UserAllDocsCopyModel({folderType : 'userreceptionfolder'});
                                if(!_.isUndefined(self.collection.keyword) && self.collection.keyword.trim().length > 0){
                                    model.setSearch(self.collection.searchtype, self.collection.keyword);
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
        
        docClassify: function(){
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
			var docModel = this.collection.filter(function(model){return model.attributes.id==docIds[0]})[0];
			var docData = {title : docModel.get('title'),
						   form : docModel.get('formName'),
						   drafter : docModel.get('drafterName'),
						   draftDeptName : docModel.get('drafterDeptName'),
						   docFolderType : "RECEIVE"};
			var createRuleView = new CreateRuleView({deptId:this.deptId, docId:docIds[0], docInfo : docData});

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

        renderLayout: function() {
            this.$el.html(ReceptionDocListTpl({
                //buttons: this.buttons,
            	isUserReception: (this.docFolderType == 'user_reception') ? true : false,
    			isDeptReception: (this.docFolderType == 'dept_reception') ? true : false,
                lang: lang
            }));
            if (this.type.indexOf("?") >=0) {
                this.type = this.type.substr(0,this.type.indexOf("?"));
            }

            $('#tab_' + this.type).addClass('on');

            var contentTitle = (_.isEmpty(this.deptId)) ? approvalLang['수신 문서함'] : approvalLang['부서 수신함'];
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
            } else if (bUrl != fragment) {
                GO.router.navigate(fragment, {trigger: false, pushState: true});
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
                    columns: columns,
                    isReception : true
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
            if (e.keyCode != 13) {
                return;
            }
            if(e){
                e.preventDefault();
            }
            $(e.currentTarget).focusout().blur();
            this.search();
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
            var url = GO.contextRoot + "api/approval/doclist/reception/complete/count?";
            return url + this.makeParams();
        }
    });

    return ReceptionListView;
});
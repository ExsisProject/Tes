// 결재대기문서 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "when",
    "app", 
    
    "approval/views/content_top",
    "views/pagination",
    "views/pagesize",
    "approval/views/doclist/doclist_item",
    "approval/views/doclist/base_doclist",
    
    "approval/models/doclist_item",
    "approval/models/doc_list_field",
    "approval/collections/appr_base_doclist",
    
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/official_todo_doclist",
    
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone,
	when,
	GO,
	
	ContentTopView,
	PaginationView,
	PageSizeView,
	DocListItemView,
    BaseDocListView,
    
	DocListItemModel,
	DocListFieldModel,
	ApprBaseDocList,
	
	DocListEmptyTpl,
	OfficialTodoDocListTpl,
	
    commonLang,
    approvalLang
) {
    
	var ConfigModel = Backbone.Model.extend({
        url : "/api/approval/apprconfig"
    });
	
    var UserApprConfigModel = Backbone.Model.extend({
        url : "/api/approval/usersetting/userconfig",
        getDefaultPhoto : function(){
            return 'resources/images/stamp_approved.png';
        }
    });
    
    var OfficialTodoCountModel = Backbone.Model.extend({
        url: '/api/approval/officialtodo/count'
    });
    
	var OfficialTodoDocList = ApprBaseDocList.extend({
		model: DocListItemModel.extend({
			idAttribute: "_id"
		}),
		url: function() {
			return '/api/approval/officialtodo?' + this._makeParam();
		},
		getCsvURL: function() {
            return '/api/approval/officialtodo/csv?' + this._makeParam();
        }
	});
	
	var OffcialTodoDocListView = BaseDocListView.extend({
		columns: {
		    '선택' : commonLang['선택'],
			'기안일' : approvalLang['기안일'],
			'기안자' : approvalLang['기안자'],
			'결재양식': approvalLang['결재양식'], 
			'긴급': approvalLang['긴급'], 
			'제목': commonLang['제목'], 
			'첨부': approvalLang['첨부'],
			'count': 8,
			'상태': commonLang['상태']
		},
		el: '#content',
		usePeriod : true,
		initialize: function(options) {
			var self = this;
		    this.options = options || {};
		    /*this.type = this.options.type;
            if (_.contains(this.type, "?")) {

                *//**
                 * router의 ":path params" 부분이 "query parameter까지 함께 포함하여 전달해준다.
                 * 여기서 순수하게 문서 상태 값-type-만 반환하기 위해 아래의 문자열 작업이 이뤄진다.
                 *//*
                this.type = this.type.substr(0, this.type.indexOf("?"));
            }*/
            
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');
			this.officialTodoCountModel = new OfficialTodoCountModel();
			this.contentTop = ContentTopView.getInstance();
			this.collection = new OfficialTodoDocList();
			this.initProperty = "document.completedAt";
			this.initDirection = "desc";
			this.initPage = 20;
			this.ckeyword = "";
			var baseUrl = sessionStorage.getItem('list-history-baseUrl');
			if (baseUrl) {
				baseUrl = baseUrl.replace(/#/gi, "");
			}
			if ( baseUrl && (baseUrl == 'approval/officialtodo')) {
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
			this.checkboxColumn = {
					id : 'checkedAllDeptDoc',
					name : 'checkedAllDeptDoc'
			}
			this.collection.bind('reset', this.resetList, this);
            BaseDocListView.prototype.initialize.call(this, options);
		},
		
        docFieldModel : null,
        docFolderType : 'official_todo',
		
		events : function(){
			return _.extend({},BaseDocListView.prototype.events, {
			    'click input:checkbox' : 'toggleCheckbox',
				'click .sorting' : 'sort',
				'click .sorting_desc' : 'sort',
				'click .sorting_asc' : 'sort',
				'click a#bulkApproval' : 'onBulkApprovalClicked'
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
			var lang = {
				'제목': commonLang['제목'],
				'기안자': approvalLang['기안자'],
				'결재선': approvalLang['결재선'],
				'검색': commonLang['검색'],
				'일괄 승인': approvalLang['일괄 승인'],
                '결재양식': approvalLang['결재양식'],
				'placeholder_search' : commonLang['플레이스홀더검색'],
				'전체': approvalLang['전체'],
				'대기': approvalLang['대기'],
				'보류': approvalLang['보류'],
				'문서번호': approvalLang['문서번호'],
				'기안부서' : approvalLang['기안부서'],
				'search_all' : approvalLang['전체기간'],
				'search_month' : approvalLang['개월'],
				'search_year' : approvalLang['년'],
				'search_input' : approvalLang['기간입력']
			};
			
			this.$el.html(OfficialTodoDocListTpl({
				lang: lang,
				columns: this.columns
			}));
			
			this.contentTop.setTitle(approvalLang['공문 대기 문서']);
    		this.contentTop.render();
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
    		this.renderPageSize();
    		
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
					var holdField = collection.findWhere({columnMsgKey : '상태'});
					self.columns = collection.makeDoclistColumn(self.columns);
					self.sorts = collection.makeDoclistSort();
					if(self.checkboxColumn){
						self.addCheckboxColumn(self.checkboxColumn);
					};
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
			this.useHold = true
			this.configModel.fetch({
				success: function(model){
					deffered.resolve();
				},
				error : deffered.reject
			});
			return deffered.promise;
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
			
			$('.list_approval > tbody').empty();
			var columns = this.columns;
			var listType = "officialDoc";
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
					columns: columns,
					lang: { 'doclist_empty': approvalLang['결재할 문서가 없습니다.'] }
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
	    
	    // 체크박스 일괄 선택/해제
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
        
        // 일괄 승인
        onBulkApprovalClicked: function() {
            var $checkedList = $('input.doclist_item_checkbox:checked'),
                self = this,
                buttons = [],
                contents = [];
            
            if ($checkedList.length < 1) {
                $.goAlert(approvalLang['선택된 항목이 없습니다.']);
                return;
            }
            
            var config = new UserApprConfigModel();
            config.fetch({
                success: function(model) {
                    var	htmls = [];
                    htmls.push('<p class="q">' + approvalLang['정말로 일괄 승인 하시겠습니까?'] + '</p>');
                    htmls.push('<textarea id="bulkApprovalComment" class="w_max" placeholder="' + approvalLang['의견을 작성해 주세요'] + '" autofocus="autofocus"></textarea>');
                    
                    $.goConfirm(htmls.join(''), '', function() {
                        var comment = $('#bulkApprovalComment').val(),
                        	//TODO versionIds로 변경
                        	versionIds = _.map($checkedList, function(el) {
                                return parseInt($(el).attr('data-versionId'));
                            });
                        
                        GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
                        
                        self.bulkApproval(versionIds, comment).
                        done(function(data, status, xhr) {
                            $.goAlert(GO.i18n(approvalLang['{{arg1}}개의 승인이 완료되었습니다.'],{"arg1": versionIds.length}));
                            self.$('table.list_approval input[type=checkbox]').attr('checked', false);
                        }).
                        fail(function(data, status, xhr) {
                            if (data.responseJSON.name == 'pwd.not.match') {
                                $.goAlert(data.responseJSON.message);
                            } else {
                                $.goAlert(commonLang['500 오류페이지 타이틀']);
                            }
                        }).
                        complete(function() {
                            self.collection.fetch();
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                            self.officialTodoCountModel.fetch({
                            	success : function(model){
                            		$('#apprSide a[data-navi="officialtodo"] span.num').text(model.get('docCount') || "");
                            	}
                            })
                        });
                    });
                }
            });
        },
        
        bulkApproval: function(versionIds, comment) {
        	var param = $.param({comment : comment})
            return $.ajax({
                url: GO.contextRoot + 'api/approval/official/approve?' + param,
                type: 'PUT',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    //'comment': comment,
                    //'password': password,
                    'ids': versionIds
                })
            });
        },
        
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return OffcialTodoDocListView;
});
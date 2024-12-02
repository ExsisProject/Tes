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
    "hgn!approval/templates/todo_doclist",
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
	TodoDocListTpl,
    commonLang,
    approvalLang
) {
    
	var ConfigModel = Backbone.Model.extend({
        url : "/api/approval/apprconfig"
    });
	
	var ToolBarModel = Backbone.Model.extend({
        url : "/api/approval/authBulkComplete"
    });
	
    var UserApprConfigModel = Backbone.Model.extend({
        url : "/api/approval/usersetting/userconfig",
        getDefaultPhoto : function(){
            return 'resources/images/stamp_approved.png';
        }
    });
    
    var TodoCountModel = Backbone.Model.extend({
        url: '/api/approval/todo/count'
    });
    
	var TodoDocList = ApprBaseDocList.extend({
		type: "all",
		initialize: function(type) {
			ApprBaseDocList.prototype.initialize.apply(this, arguments);
            this.type = type;
        },
		model: DocListItemModel.extend({
			idAttribute: "_id"
		}),
		url: function() {
			return '/api/approval/todo'+'/' + this.type +'?' + this._makeParam();
		}
	});
	
	var TodoDocListView = BaseDocListView.extend({
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
		    this.type = this.options.type;
            if (_.contains(this.type, "?")) {

                /**
                 * router의 ":path params" 부분이 "query parameter까지 함께 포함하여 전달해준다.
                 * 여기서 순수하게 문서 상태 값-type-만 반환하기 위해 아래의 문자열 작업이 이뤄진다.
                 */
                this.type = this.type.substr(0, this.type.indexOf("?"));
            }
            
			_.bindAll(this, 'render', 'renderPageSize', 'renderPages');
			this.todoCountModel = new TodoCountModel();
			this.contentTop = ContentTopView.getInstance();
			this.collection = new TodoDocList(this.type);
			this.initProperty = "document.isEmergency";
			this.initDirection = "desc";
			this.initPage = 20;
			this.ckeyword = "";
			var baseUrl = sessionStorage.getItem('list-history-baseUrl');
			if (baseUrl) {
				baseUrl = baseUrl.replace(/#/gi, "");
			}
			if ( baseUrl && (baseUrl == 'approval/todo/all' || baseUrl == 'approval/todo/wait' || baseUrl == 'approval/todo/hold')) {
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
		
		useHold : true,
		authBulkComplete : false,
        docFieldModel : null,
        docFolderType : 'appr_todo',
		
		events : function(){
			return _.extend({},BaseDocListView.prototype.events, {
			    'click input:checkbox' : 'toggleCheckbox',
			    'click .tab_nav > li' : 'selectTab',
				'click .sorting' : 'sort',
				'click .sorting_desc' : 'sort',
				'click .sorting_asc' : 'sort',
				'click a#bulkComplete' : 'onBulkCompleteClicked'
			});
		},
        
		render: function() {
            when(this.fetchConfig.call(this)) //super method
            .then(_.bind(this.isAuthBulkComplete, this))
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
				'일괄 결재': approvalLang['일괄 결재'],
                '결재양식': approvalLang['결재양식'],
				'placeholder_search' : commonLang['플레이스홀더검색'],
				'전체': approvalLang['전체'],
				'대기': approvalLang['대기'],
				'보류': approvalLang['보류'],
				'기안부서' : approvalLang['기안부서'],
				'search_all' : approvalLang['전체기간'],
				'search_month' : approvalLang['개월'],
				'search_year' : approvalLang['년'],
				'search_input' : approvalLang['기간입력']
			};
			
			this.$el.html(TodoDocListTpl({
				lang: lang,
				columns: this.columns,
				useHold: this.useHold,
				authBulkComplete : this.authBulkComplete
			}));
			
			if (this.type.indexOf("?") >=0) {
                this.type = this.type.substr(0,this.type.indexOf("?"));
            }
            $('#tab_' + this.type).addClass('on');
			
			this.contentTop.setTitle(approvalLang['결재 대기 문서']);
			
    		this.contentTop.render();
    		//this.$el.find('input[placeholder]').placeholder();
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
					if(!self.useHold){ // 보류상태를 사용하지 않을때에는 필드목록에 상태를 사용하던 안하던 무조건 나오지 않게 한다.
						collection.remove(holdField);
						self.toRemoveColumns = ['상태']; //필드목록 레이어에서도 아예 삭제시킨다.
					}
					self.columns = collection.makeDoclistColumn(self.columns);
					self.sorts = collection.makeDoclistSort();
					if(self.checkboxColumn && self.authBulkComplete){
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
					self.useHold = model.get('useHold');
					deffered.resolve();
				},
				error : deffered.reject
			});
			return deffered.promise;
        },
		isAuthBulkComplete : function() {
        	var self = this;
			var deffered = when.defer();
			this.toolBarModel = new ToolBarModel();
			this.authBulkComplete = true
			this.toolBarModel.fetch({
				success: function(model){
					self.authBulkComplete = model.get('authBulkComplete');
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
			var listType = "approval";
			doclist.each(function(doc){
				var docListItemView = new DocListItemView({ 
					model: doc,
					isCheckboxVisible: true,
					listType : listType,
					columns: columns,
                    total: doclist.total
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
		
		// 탭 이동
        selectTab: function(e) {
            this.collection.setPageNo(0);
            $('.tab_nav > li').removeClass('on');
            $(e.currentTarget).addClass('on');

            var tabId = $(e.currentTarget).attr('id');
            if (tabId == 'tab_all') {
                this.collection.setType('all');
            } else if (tabId == 'tab_wait') {
                this.collection.setType('wait');
            } else if (tabId == 'tab_hold') {
                this.collection.setType('hold');
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
        
        // 일괄 결재
        onBulkCompleteClicked: function() {
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
                    var usePassword = model.get('passwordUseFlag'),
                        htmls = [];
                    
                    htmls.push('<p class="q">' + approvalLang['정말로 일괄 결재 하시겠습니까?'] + '</p>');
                    htmls.push('<textarea id="bulkCompleteComment" class="w_max" placeholder="' + approvalLang['의견을 작성해 주세요'] + '" autofocus="autofocus"></textarea>');
                    
                    if (usePassword) {
                        htmls.push('<span class="wrap_txt w_max"><input class="input w_max" placeholder="' + approvalLang['비밀번호를 입력해 주세요.'] + '" type="password" id="apprPassword"></span>');
                    }
                    
                    $.goConfirm(htmls.join(''), '', function() {
                        var comment = $('#bulkCompleteComment').val(),
                            password = $('#apprPassword').val(),
                            docIds = _.map($checkedList, function(el) {
                                return parseInt($(el).attr('data-id'));
                            });
                        
                        GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
                        
                        self.bulkComplete(docIds, comment, password).
                        done(function(data, status, xhr) {
                            $.goAlert(GO.i18n(approvalLang['{{arg1}}개의 결재가 완료되었습니다.'],{"arg1": data.data.length}));
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
                            self.todoCountModel.fetch({
                            	success : function(model){
                            		$('#apprSide a[data-navi="todo"] span.num').text(model.get('docCount') || "");
                            	}
                            })
                        });
                    });
                    
                    if (usePassword) {
                    	$("#apprPassword").keyup(function(e) {
                    		if (e.keyCode != 13) return;
                    		var $current = $(e.currentTarget);
                    		var saveActionEl = $current.closest("div.go_popup").find("footer a.btn_major_s");
                    		saveActionEl.trigger("click");
                    	});
                    }
                }
            });
        },
        
        bulkComplete: function(docIds, comment, password) {
            return $.ajax({
                url: GO.contextRoot + 'api/approval/document/bulkcomplete',
                type: 'PUT',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    'comment': comment,
                    'password': password,
                    'docIds': docIds
                })
            });
        },
        
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return TodoDocListView;
});
// 수신문서함 목록
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
    "approval/views/doclist/doclist_csv_download",
    "approval/views/document/doc_receiver_assign",
    "approval/views/document/apprflow_editor",
    "approval/collections/todo_reception_doclist",
    "approval/models/doclist_item",
    "approval/models/user_appr_config",
    "hgn!approval/templates/todo_reception_doclist",
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/bulk_draft_popup",
    "approval/models/document",
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
    DocListCsvDownloadView,
    DocReceiverAssignView,
    ApprFlowEditor,
    TodoReceptionDocCollection,
    DocListItemModel,
    UserApprConfigModel,
    TodoReceptionDocListTpl,
    DocListEmptyTpl,
    BulkDraftPopupTpl,
    ApprDocumentModel,
    commonLang,
    approvalLang
) {
	var ToolBarModel = Backbone.Model.extend({
        url : "/api/approval/authBulkReceive"
    });
	
	var TodoReceptionCountModel = Backbone.Model.extend({
        url: '/api/approval/todoreception/count'
    });
	
	var BulkDraftModel = Backbone.Model.extend({
		url: '/api/approval/document/bulkdraft'
	});
	
	var DocumentViewModel = ApprDocumentModel.extend({
        initialize: function(attrs, options) {
        	this.options = options || {};
            this.docId = this.options.docId;
            ApprDocumentModel.prototype.initialize.apply(this, arguments);
        },
        url: function() {
            var url = '/api/approval/document/'+this.docId;
            return url;
        }
    }, {
    	create: function(docId) {
    		return new DocumentViewModel({}, {"docId": docId});
    	}
    });
	
    var TodoReceptionListView = BaseDocListView.extend({
        columns: {
            '접수일' : approvalLang['접수일'],
            '결재양식': approvalLang['결재양식'],
            '긴급': approvalLang['긴급'], 
            '제목': commonLang['제목'],
            '첨부': approvalLang['첨부'],
            '기안자': approvalLang['기안자'],
            '담당자': approvalLang['담당자'],
            '결재상태': approvalLang['결재상태'],
            '원문번호': approvalLang['원문번호'],
            '수신부서': approvalLang['수신부서'],
            'count': 10
        },
        el: '#content',
        docFolderType : 'appr_reception',
        events: {
        	'click input:checkbox' : 'toggleCheckbox',
			'click #deptDocCopy' : 'deptDocCopy',
            'click .tab_nav > li' : 'selectTab',
            'click .sorting' : 'sort',
            'click .sorting_desc' : 'sort',
            'click .sorting_asc' : 'sort',
            'click .btn_search2' : 'search',
            'keypress input#keyword': 'searchByEnter',
            'click #bulkReceive': 'onBulkReception',
            'click #bulkChangeReceiver' : 'onBulkChangeReceiver',
            'click #bulkReceiveCancel' : 'onBulkReceptionCancel',
            'click #bulkDraft' : 'onBulkDraft'
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
            this.contentTop = ContentTopView.getInstance();
            this.collection = new TodoReceptionDocCollection(this.type, this.deptId);
            this.initProperty = "receivedAt";
            this.initDirection = "desc";
            this.initPage = 20;
            this.ckeyword = "";

            _.bindAll(this, 'render', 'renderPageSize', 'renderPages');
            
            this.todoReceptionCountModel = new TodoReceptionCountModel();
            
            var baseUrl = sessionStorage.getItem('list-history-baseUrl');
            if (baseUrl) {
				baseUrl = baseUrl.replace(/#/gi, "");
			}

            if (baseUrl && baseUrl == "approval/todoreception/" + this.type) {
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
					id : 'checkedAllReceiveDoc',
					name : 'checkedAllReceiveDoc'
			}
            this.collection.bind('reset', this.resetList, this);
            
            this.isAuthBulkReceive();
            this.isUsePassword();
        },
        authBulkReceive : false,
        usePassword : false,
        renderLayout: function() {
            var lang = {
                '제목': commonLang['제목'],
                '기안자': approvalLang['기안자'],
				'기안부서' : approvalLang['기안부서'],
                '담당자': approvalLang['담당자'],
                '결재양식': approvalLang['결재양식'],
                '결재선': approvalLang['결재선'],
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
                '수신부서': approvalLang['수신부서'],
                '일괄 접수': approvalLang['일괄 접수'],
                '일괄 접수 취소': approvalLang['일괄 접수 취소'],
                '담당자 지정' : approvalLang['담당자 지정'],
                '결재 정보 설정 및 요청' : approvalLang['결재 정보 설정 및 요청']
            };

            if (this.type.indexOf("?") >=0) {
            	this.type = this.type.substr(0,this.type.indexOf("?"));
            }
            
            this.$el.html(TodoReceptionDocListTpl({
                buttons: this.buttons,
                lang: lang,
                authBulkReceive : this.authBulkReceive,
                useToolbarType : this.type == 'all' ? false : true,
        		isWaitingStatus : this.type == 'waiting' ? true : false,
				isReceiveStatus : this.type == 'received' ? true : false
            }));

            $('#tab_' + this.type).addClass('on');

            var contentTitle = approvalLang['결재 수신 문서'];
            this.contentTop.setTitle(contentTitle);
            this.contentTop.render();
            this.$el.find('header.content_top').replaceWith(this.contentTop.el);
            this.$el.find('input[placeholder]').placeholder();
            this.renderPageSize();
        },
        isAuthBulkReceive : function() {
        	var self = this;
			var deffered = when.defer();
			this.toolBarModel = new ToolBarModel();
			this.authBulkReceive = false;
			this.toolBarModel.fetch({
				async: false,
				success: function(model){
					self.authBulkReceive = model.get('authBulkReceive');
					deffered.resolve();
				},
				error : deffered.reject
			});
			return deffered.promise;
        },
        isUsePassword : function() {
        	var self = this;
			var deffered = when.defer();
			this.config = new UserApprConfigModel();
			this.usePassword = true
			this.config.fetch({
				success: function(model){
					self.usePassword = model.get('passwordUseFlag');
					deffered.resolve();
				},
				error : deffered.reject
			});
			return deffered.promise;
        },
        
        toggleCheckbox : function(e){
        	var $target = $(e.currentTarget),
            $checkAllBox = $('input#checkedAllReceiveDoc'),
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
            this.$el.find('#checkedAllReceiveDoc').attr('checked', false);
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
            var columns = this.columns;
            var listType = "approval";

            doclist.each(function(doc){
                var docListItemView = new DocListItemView({
                	isCheckboxVisible: true,
                    model: doc,
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

            var tabId = $(e.currentTarget).attr('id');
            if (tabId == 'tab_all') {
                this.collection.setType('all');
                $("#receive_toolbar").hide();
            } else if (tabId == 'tab_waiting') {
                this.collection.setType('waiting');
                $("#receive_toolbar").show();
                $("#waitingStatus").show();
                $("#receiveStatus").hide();
            } else if (tabId == 'tab_received') {
                this.collection.setType('received');
                $("#receive_toolbar").show();
                $("#waitingStatus").hide();
                $("#receiveStatus").show();
            } else if (tabId == 'tab_inprogress') {
                this.collection.setType('inprogress');
            } else if (tabId == 'tab_complete') {
                this.collection.setType('complete');
            } else if (tabId == 'tab_returned') {
                this.collection.setType('returned');
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

        // 제거
        release: function() {
            this.$el.off();
            this.$el.empty();
        },
        
        validateCheckItem: function() {
        	var $checkedList = $('input.doclist_item_checkbox:checked');
        	if ($checkedList.length < 1) {
                $.goAlert(approvalLang['선택된 항목이 없습니다.']);
                return false;
            }
        	return true;
        },
        
        onBulkReception: function() {
            var self = this,
            	validate = this.validateCheckItem();
            if(!validate) return;
            
            $.goConfirm('<p class="q">' + approvalLang['일괄접수 팝업설명'] + '</p>', '', function() {
                var docIds = _.map($('input.doclist_item_checkbox:checked'), function(el) {
                        return parseInt($(el).attr('data-id'));
                    });
                
                GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
                
                self.bulkReceptionAction(docIds, 'api/approval/document/bulkreception').
                done(function(data, status, xhr) {
                    $.goAlert(GO.i18n(approvalLang['{{arg1}}건의 문서가 접수되었습니다. 접수 탭에서 확인하세요.'],{"arg1": data.data.docCount}));
                }).
                fail(function(data, status, xhr) {
                    if (data.responseJSON.message) {
                        $.goAlert(data.responseJSON.message);
                    } else {
                        $.goAlert(commonLang['500 오류페이지 타이틀']);
                    }
                }).
                complete(function() {
                    self.collection.fetch();
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    self.todoReceptionCountModel.fetch({
                    	success : function(model){
                    		$('#apprSide a[data-navi="todoreception"] span.num').text(model.get('docCount') || "");
                    	}
                    })
                });
            });
        },
        
        bulkReceptionAction: function(docIds, url) {
            return $.ajax({
                url: GO.contextRoot + url,
                type: 'PUT',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    'docIds': docIds
                })
            });
        },
        
        onBulkChangeReceiver: function() {
        	var self = this,
	        	validate = this.validateCheckItem();
	        if(!validate) return;
	        
	        var $checkedList = $('input.doclist_item_checkbox:checked');
	        var docIds = _.map($checkedList, function(el) {
                return parseInt($(el).attr('data-id'));
            });
	        
	        var receivedDocOwnerDeptIds = _.map($checkedList, function(el) {
                return parseInt($(el).attr('data-receive-deptId'));
            });
	        
	        if(_.uniq(receivedDocOwnerDeptIds).length > 1) {
	        	$.goAlert(GO.i18n(approvalLang['{{arg1}} 일괄지정 경고'],{"arg1": approvalLang['담당자']}));
	        	return;
	        }
	        
            docReceiverAssignView = new DocReceiverAssignView({
            	type : "bulk",
                docIds : docIds,
                receivedDocOwnerDeptId: receivedDocOwnerDeptIds[0],
            });

	        var popup = $.goPopup({
	            "pclass" : "layer_normal layer_item_move",
	            "header" : approvalLang['담당자 일괄 지정'],
	            "modal" : true,
	            "width" : 320,
	            "allowPrevPopup" : true,
	            "contents" :  "",
	            "buttons" : [
	                {
	                    'btext' : approvalLang['담당자 지정'],
	                    'btype' : 'confirm',
	                    'autoclose' : false,
	                    'callback' : function(rs) {
	                        docReceiverAssignView.assignReceiver(function(data) {
	                        	$.goAlert(GO.i18n(approvalLang['{{arg1}}건의 문서에 담당자가 지정되었습니다.'],{"arg1": data.data.docCount}));
	                        	self.collection.fetch();
	                        }, function() {
	                        	$.goAlert(lang["담당자를 지정할 수 없습니다"]);
	                        });
	                    }
	                },
	                {
	                    'btext' : commonLang["취소"],
	                    'btype' : 'cancel',
	                    'callback' : function(){
	                    	if(docReceiverAssignView.slide){
	                    		docReceiverAssignView.slide.close()	
	                    	}
	                    }
	                }
	            ]
	        });
	        docReceiverAssignView.render(popup, "div.content");
        },
        onBulkReceptionCancel: function() {
        	var self = this,
	        	validate = this.validateCheckItem();
	        if(!validate) return;
        
	        $.goConfirm('<p class="q">' + approvalLang['일괄접수 취소 팝업설명'] + '</p>', '', function() {
	            var docIds = _.map($('input.doclist_item_checkbox:checked'), function(el) {
	                    return parseInt($(el).attr('data-id'));
	                });
	            
	            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
	            
	            self.bulkReceptionAction(docIds, 'api/approval/document/bulkreceptioncancel').
	            done(function(data, status, xhr) {
	                $.goAlert(GO.i18n(approvalLang['{{arg1}}건의 문서가 접수가 취소되었습니다.'],{"arg1": data.data.docCount}));
	            }).
	            fail(function(data, status, xhr) {
	                if (data.responseJSON.message) {
	                    $.goAlert(data.responseJSON.message);
	                } else {
	                    $.goAlert(commonLang['500 오류페이지 타이틀']);
	                }
	            }).
	            complete(function() {
	                self.collection.fetch();
	                GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
	                self.todoReceptionCountModel.fetch({
	                	success : function(model){
	                		$('#apprSide a[data-navi="todoreception"] span.num').text(model.get('docCount') || "");
	                	}
	                })
	            });
	        });
        },
        onBulkDraft: function() {
        	var validate = this.validateCheckItem();
	        if(!validate) return;
	        
	        var $checkedList = $('input.doclist_item_checkbox:checked'),
	        	self = this;
	        
	        var docIds = [],
	        	originCompanyIds = [],
	        	receiverIds = [],
	        	receivedDocOwnerDeptIds = [],
	        	useSelfApproval = [];
	        
	        _.each($checkedList, function(el) {
	        	docIds.push(parseInt($(el).attr('data-id')));
	        	originCompanyIds.push(parseInt($(el).attr('data-origin-companyid')));
	        	receiverIds.push(parseInt($(el).attr('data-receiverid')));
	        	receivedDocOwnerDeptIds.push(parseInt($(el).attr('data-receive-deptid')));
	        	useSelfApproval.push($(el).attr('data-use-self-approval'));
	        });
	        
	        if(_.uniq(receiverIds).length > 1 || receiverIds[0] != GO.session('id')) {
	        	$.goAlert(approvalLang['일괄 수신 결재 경고']);
	        	return;
	        }
	        if(_.uniq(receivedDocOwnerDeptIds).length > 1) {
	        	$.goAlert(GO.i18n(approvalLang['{{arg1}} 일괄지정 경고'],{"arg1": approvalLang['결재선']}));
	        	return;
	        }
	        if(_.uniq(originCompanyIds).length > 1) {
	        	$.goAlert(approvalLang["타사이트문서일괄결재경고"]);
	        	return;
	        }
	        
	        var bulkInfoModel = DocumentViewModel.create(docIds[0]);
	        bulkInfoModel.fetch({
                async: false,
                success: function(model, result) {
                	// 결재자 별로 전결가능 여부 옵션은 사용하지 않는다.(양식설정마다 다를수 있다.)
                	// 기안자 정보만 유지하기 위해 DRAFT 타입이 아닌 결재선은 무시. 
                	model.get("apprFlow").activityGroups[0].activities = _.filter(model.get("apprFlow").activityGroups[0].activities, 
                			function(element){ return element.type == 'DRAFT'; });
                	model.get("docInfo").docReadingReaders = [];
                	model.get("docInfo").docReferenceReaders = [];
                	model.get('actionCheck').isArbitraryCheckVisible = false;
                    self.bulkDraftFlowEditor(model,docIds,useSelfApproval);
                },                
                reset: true
            });
            
            return;
        },
        bulkDraftFlowEditor : function(model,docIds,useSelfApproval){
        	var self = this;
        	var bulkDraftPopupContents = this.makeBulkDraftPopupContents(this.usePassword); 
	        //TODO flowEditor 구성된 후 전달받는 데이터로 successCallback에 들어갈 내용
        	when(this.renderFlowEditor(model,docIds,useSelfApproval))
        	.then(function popBulkDraft(){
                $.goPopup({
                    "pclass" : "layer_normal layer_approval",
                    "header" : approvalLang['일괄결재요청'],
                    "modal" : true,
                    "draggable" : true,
                    "width" : 500,
                    "contents" : bulkDraftPopupContents,
                    "buttons" : [
                        {
                            'btext' : approvalLang['결재요청'],
                            'btype' : 'confirm',
                            'autoclose' : false,
                            'callback' : function(rs) {
                                console.log(rs);
                                self.saveDraftDocument(rs);
                            }
                        },
                        {
                            'btext' : commonLang["취소"],
                            'btype' : 'cancel'
                        }
                    ]
                });            	
            })
    		.otherwise(function printError(err) {
                console.log(err.stack);
            });
        },
        renderFlowEditor : function(model,docIds,useSelfApproval){
        	var defer = when.defer();
        	var self = this;
        	this.bulkDraftModel = new BulkDraftModel();
        	var apprFlowEditor = new ApprFlowEditor({
            	
            	apprDocumentModel: model,
                saveCallback: $.proxy(function(apprDocModel) {
                	self.bulkDraftModel.set({
                		"docIds" : docIds,
                		"activities" : apprDocModel.apprFlowModel.get('activityGroups')[0].activities,
                		"docReferenceReaders" : apprDocModel.docInfoModel.get('docReferenceReaders'),
                		"docReadingReaders" : apprDocModel.docInfoModel.get('docReadingReaders'),
                		"useParallelAgreement" : apprDocModel.apprFlowModel.get('useParallelAgreement')
                	});
                	var activitySize = apprDocModel.apprFlowModel.get('activityGroups')[0].activities.length;
                	if(self.validateSelfApproval(useSelfApproval, activitySize)){
                		defer.resolve();
                	}else{
                		defer.reject();
                	}
                }, this),
                defaultActiveTab: null
            });
            apprFlowEditor.render();
            //버튼명 변경
            $(apprFlowEditor)[0].$el.closest('div#gpopupLayer').find('footer.btn_layer_wrap a.btn_major_s span.txt').text(approvalLang['결재 정보 저장 후 결재 요청']);
            return defer.promise;
        },
        validateSelfApproval : function(useSelfApproval, activitySize) {
        	if(activitySize <= 1 && _.contains(useSelfApproval, "false")){	//기안자만 있고 1인결재선을 사용하지 않는 양식의 문서가 있는경우
        		$.goAlert(approvalLang['결재선 1인결재 경고']);
        		return false;
        	}       	
        	return true;
        },
        
        makeBulkDraftPopupContents : function(usePassword) {
        	var config = new UserApprConfigModel();
        	var $tpl;
        	var lang = {
	    			"일괄결재요청안내" : approvalLang['일괄결재요청안내'],
	    			"기안의견" : approvalLang['기안의견'],
	    			"의견을 작성해 주세요" : approvalLang['의견을 작성해 주세요'],
	    			"결재비밀번호" : approvalLang['결재비밀번호'],
	        	};
            $tpl = $(BulkDraftPopupTpl({
            	lang: lang,
            	usePassword : usePassword,
            }));
            
            if(usePassword){
            	$tpl.delegate( "#apprPassword", "keyup", function(e) {
            		if (e.keyCode != 13) return;
            		var $current = $(e.currentTarget);
            		var saveActionEl = $current.closest("div.go_popup").find("footer a.btn_major_s");
            		saveActionEl.trigger("click");
            	});
            }
            return $tpl;
        },
        
        saveDraftDocument: function(rs){
            var self = this;
            var description = $("#textarea-desc").val();

            if(!this.actionApprValidate('#apprPassword', '#textarea-desc', rs)){
                return false;
            }else {
            	// bulkdraft시 모델
            	this.bulkDraftModel.set({"comment": description});
            	console.log(this.bulkDraftModel);
            	GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            	this.bulkDraftModel.save({
            	},{
            		success: function(model, result) {
            			var $checkedList = $('input.doclist_item_checkbox:checked');
            			$.goAlert(GO.i18n(approvalLang["{{arg1}}건의 결재가 요청되었습니다."],{"arg1": $checkedList.length}), "", function() {
            				GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
            				self.collection.fetch();
            			});
            		},
            		error: function() {
                        var responseObj = rs.responseJSON;
                        $.goError(responseObj.message);    
            		}
            	});
            }
        },
        actionApprValidate : function(pwdEl, descEl, popEl){
            var checked = true;
            $(pwdEl).removeClass('enter error');
            $(descEl).removeClass('enter error');
            popEl.find('span.go_error').remove();
            var apprPassword = $(pwdEl).val(),
            	description = $(descEl).val();
            if (this.usePassword) {
                if(!apprPassword){
                    $.goError(approvalLang["결재 비밀번호를 입력하세요."], $(pwdEl));
                    $(pwdEl).addClass('enter error').focus();
                    checked = false;
                } else {
                	$.ajax({
                		type: 'PUT',
                        dataType: 'json',
                        contentType: 'application/json',
                        async: false,
                        url: GO.contextRoot + 'api/approval/usersetting/validate/apprpassword',
                        data: JSON.stringify({
                            'apprPasswd': apprPassword
                        }),
                        error: function (resp) {
                        	$.goError(commonLang["비밀번호가 일치하지 않습니다"], $(pwdEl));
                            $(pwdEl).addClass('enter error').focus();
                            checked = false;
                        }
                    });
                }
            }
            if(description && description.length > 1000){
                $.goError(GO.i18n(approvalLang["{{max}}자 이하로 입력해 주십시오"], {'max': 1000}), $(descEl));
                $(descEl).addClass('enter error').select();
                checked = false;
            }
            return checked;
        }
    });

    return TodoReceptionListView;
});
define(function(require) {
	var $ =  require("jquery"); 
	var Backbone = require("backbone"); 
	var when =  require("when"); 
	var App =  require("app");  
	
	var TplCompanyBoardList = require("hgn!admin/templates/board_company_list");
	var commonLang = require("i18n!nls/commons");
	var adminLang = require("i18n!admin/nls/admin");
	var boardLang = require("i18n!board/nls/board");
	var CompanyBoardCollection =require("admin/collections/company_board");
	
	// 트리형 게시판 지원
	var BoardTree = require('board/components/board_tree/board_tree');
	var CompanyBoardTreeNode = require("board/models/company_board_tree_node"); 
	var Constants = require('board/constants');

	require("jquery.go-sdk");
	require("GO.util");
	require("jquery.go-popup");
	
	var lang = {
		'company_board_add' : adminLang['게시판 추가'],
		'separate_add' : adminLang['구분선 추가'],
		'board_sort' : adminLang['순서 바꾸기'],
		'board_sort_done' : adminLang['순서바꾸기 완료'],
		'board_title' : adminLang['게시판 제목'],
		'board_type' : adminLang['유형'],
		'board_manager' : adminLang['운영자'],
		'board_createdAt' : adminLang['생성일'],
		'board_count' : adminLang['게시물 개수'],
		'share_range' : adminLang['공개 범위'],
		'board_setting' : commonLang['설정'],
		'board_no_list' : adminLang['등록된 전사게시판이 없습니다.'],
		'board_BBS' : adminLang['클래식'],
		'board_STREAM' : adminLang['피드'],
		'board_public' : adminLang['전체공개'],
		'board_private' : adminLang['부분공개'],
		'board_separate' : boardLang['구분선'],
		'board_save' : commonLang['저장'],
		'board_cancel' : commonLang['취소'],
		'board_modify' : commonLang['수정'],
		'board_delete' : commonLang['삭제'],
		'board_stop' : commonLang['중지'],
		'board_normal' : commonLang['정상 상태로 변경'],
		'board_exposure' : adminLang['게시판 홈 노출'],
		'actived_board' :  adminLang['사용중인 게시판'],
		'closed_board' :  adminLang['중지된 게시판'],
		'not_selected_board' : boardLang["게시판을 선택해 주세요."],
        'stop_confirm' : boardLang["게시판 중지 확인"],
        'stop_board' : boardLang["게시판 중지"],
        'delete_confirm' : boardLang["게시판 삭제 확인"],
        'delete_title' : boardLang["게시판 삭제"],
        'delete_success' : commonLang["삭제되었습니다."],
        'change_status_normal' : commonLang["정상 상태로 변경"],
        'normal_confirm' : boardLang["정상으로 변경 알림"],
        'change_success' : commonLang["변경되었습니다."], 
		"add_group": boardLang["게시판 그룹 추가"], 
		"close_all": boardLang["모두 닫기"], 
		"open_all": boardLang["모두 열기"]
	};
	
	var instance = null;

	/**
	 * 중복 액션을 막기 위함
	 */
	var _depFlag = false;
	
	var boardCompanyList = Backbone.View.extend({
		el:'#companyboardListPage',
		unbindEvent: function() {
			this.$el.off("click", "span[data-btntype='bbsCreate']");
			this.$el.off("click", "span[data-btntype='modify']");
			this.$el.off("click", "span.btnBoardStatusNormal");
			this.$el.off("click", "td.title");
			this.$el.off("click", "#checkedAll");
			this.$el.off("click", "#tabControll li");
			
			// 트리형 게시판 작업으로 추가되거나 변경된 이벤트들
			this.$el.off("click", "span.btnBoardLineAdd");
			this.$el.off("click", "span.btnBoardSortable");
			this.$el.off("click", "span.btnToggleNodes");
			this.$el.off("click", "span.btnBoardGroupAdd");
			this.$el.off("click", "span.btnBoardStop");
			this.$el.off("click", "span.btnBoardDelete");
			this.$el.off("click", ".tb-header #checkAll");
		}, 
		bindEvent : function() {
			
			this.$el.on("click", "span[data-btntype='bbsCreate']", $.proxy(this.bbsCreate, this));
			this.$el.on("click", "span[data-btntype='modify']", $.proxy(this.bbsModify, this));
            this.$el.on("click", "span.btnBoardStatusNormal", $.proxy(this.changeStatusNormal, this));
			this.$el.on("click", "td.title", $.proxy(this.bbsModify, this));
			this.$el.on("click", "#checkedAll", $.proxy(this.checkAllToggle, this));
			this.$el.on("click", "#tabControll li", $.proxy(this.changeTab, this));
			
			// 트리형 게시판 작업으로 추가되거나 변경된 이벤트들
			this.$el.on("click", "span.btnBoardLineAdd", $.proxy(this._addSeperator, this));
			this.$el.on("click", "span.btnToggleNodes", $.proxy(this._onClickToggleNodes, this));
			this.$el.on("click", "span.btnBoardSortable", $.proxy(this._onClickSortableToggle, this));
			this.$el.on("click", "span.btnBoardGroupAdd", $.proxy(this._addFolder, this));
			this.$el.on("click", "span.btnBoardStop", $.proxy(this._onClickBoardStop, this));
			this.$el.on("click", "span.btnBoardDelete", $.proxy(this._onClickBoardDelete, this));
			this.$el.on("click", ".tb-header #checkAll", $.proxy(this._onClickCheckAll, this));
		},
		initialize: function() {			
			this.companyId = GO.session().companyId;
			this.unbindEvent();
			this.bindEvent();
			this.type = Constants.STATUS_ACTIVE;
			
			this.activeBoardList = new CompanyBoardTreeNode.Collection(null, {status: Constants.STATUS_ACTIVE, isAdminService: true});
			this.closedBoardList = new CompanyBoardTreeNode.Collection(null, {status: Constants.STATUS_CLOSED, isAdminService: true});
			
			this.boardTreeConfigView = null;
			
			// sync ~= add, remove, reset
			this.listenTo(this.activeBoardList, 'sync', this._renderActiveBoardList);
			this.listenTo(this.closedBoardList, 'sync', this._renderClosedBoardList);
		},
		
		render: function(status) {
			console.log('[board] BoardCompanyList:render call');
			
			this._initRender(status);
			
			if(status === Constants.STATUS_ACTIVE) {
				this.type = Constants.STATUS_ACTIVE;
				this._fetchAndRenderActiveBoardList();
			} else {
				this.type = Constants.STATUS_CLOSED;
				this._fetchAndRenderClosedBoardList();
			}
		},
		
		_initRender: function(status) {
			if(status === Constants.STATUS_ACTIVE) {
				
				// 템플릿이 다시 그려져야 하므로 boardTreeConfigView를 초기화시켜야 한다.
				if(this.boardTreeConfigView) {
					this.boardTreeConfigView.remove();
					this.boardTreeConfigView = null;
				}
				
				var tmpl = TplCompanyBoardList({
					isActive:true,
					lang:lang,
					isActiveBoard : true
				});			
				this.$el.html(tmpl);
			}
		},
		
		_renderClosedBoardList : function(status) {
			var _this = this;

			var bbsType = function(){
				if(this.type == "CLASSIC"){
					return lang.board_BBS;
				}
				return lang.board_STREAM;
			};
			var parseDate = function(){
				return GO.util.basicDate(this.createdAt);
			};
			var sharedRange = function(){
				if(!this.sharedFlag){
					return lang.board_public;
				}
				return lang.board_private;
			};
			
			var dataset = this.closedBoardList.toJSON();
			
			var tmpl = TplCompanyBoardList({
				dataset:dataset,
				bbsType:bbsType,
				parseDate:parseDate,
				sharedRange:sharedRange,
				isActive:false,
				lang:lang,
				isActiveBoard : false
			});			
			this.$el.html(tmpl);
			this.listEl = this.$el.find('#tableBorderList');
			this.$el.find('#tableBorderList tr:last-child').addClass('last');
		},
		
		_fetchAndRenderClosedBoardList: function() {
			var self = this;
			var collection = this.closedBoardList;
			
			return when.promise(function(resolve, reject) {
				collection.fetch({
					silent: true, 
					success: function(collection) {
						resolve(collection);
					},
					
					error: reject
				});
			}).otherwise(function(error) {
				console.log(error.stack);
			});
		},
		
		_renderActiveBoardList: function() {
			var boardTreeConfigView;
			var $noList = this.$el.find('.no-list-msg');
			var collection = this.activeBoardList;
						
			return this._getBoardTreeConfigView(collection);
		}, 
		
		_fetchAndRenderActiveBoardList: function() {
			var self = this;
			var collection = this.activeBoardList;
			
			return when.promise(function(resolve, reject) {
				collection.fetch({
					silent: true, 
					success: function(collection) {
						resolve(collection);
					},
					
					error: reject
				});
			}).otherwise(function(error) {
				console.log(error);
			});
		},
		
		/**
		 * 체크된 체크박스의 게시판 ID를 배열로 반환
		 */
        _getCheckedBoardIds: function() {
        	var ids = [];
        	this.$('input:checkbox[name=board_id]:checked').each(function(i, el) {
        		ids.push($(el).val());
        	});
        	
        	return ids;
        },
        
        _createBoardTreeConfigView: function(collection) {
        	var boardTreeConfigView;
        	var viewOptions = {};
        	
        	if(collection instanceof CompanyBoardTreeNode.Collection) {
        		viewOptions.nodes = this._convertBoardsAction(collection);
        	}
        	
        	boardTreeConfigView = new BoardTree.BoardTreeConfigView(viewOptions);
    		boardTreeConfigView.setElement(this.$el.find('#board-tree-config'));
    		boardTreeConfigView.render();
    		
    		return boardTreeConfigView;
        },
        
        _getBoardTreeConfigView: function(collection) {
        	if(this.boardTreeConfigView === null) {        		
        		this.boardTreeConfigView = this._createBoardTreeConfigView(collection);
        	}
        	
        	return this.boardTreeConfigView;
        },
        
        /**
		 * 사이트 관리자에 들어올 수 있는 관리자는 누구나 게시판 설정을 할수 있다.
		 */
		_convertBoardsAction: function(boardTreeNodes) {			
			boardTreeNodes.map(function(boardTreeNode) {
				if(boardTreeNode.isBoardNode()) {
					boardTreeNode.set('actions', {
						"managable": true
					});
				}
			});
			
			return boardTreeNodes;
		}, 
        
        /**
         * 게시판 그룹 추가
         */
        _addFolder: function() {
        	var boardTreeConfigView = this._getBoardTreeConfigView(this.activeBoardList);
        	
    		boardTreeConfigView.addNode(new CompanyBoardTreeNode.Model({
    			"nodeType": Constants.NODETYPE_FOLDER, 
    			"nodeValue": boardLang['새로운 그룹명을 입력해주세요']
			}, {isAdminService: true}));
        },
        
        /**
         * 구분선 추가
         */
        _addSeperator: function() {
        	var boardTreeConfigView = this._getBoardTreeConfigView(this.activeBoardList);
    		boardTreeConfigView.addNode(new CompanyBoardTreeNode.Model({
    			"nodeType": Constants.NODETYPE_SEPERATOR, 
    			"nodeValue": boardLang['새로운 구분선명을 입력해주세요']
			}, {isAdminService: true}));
        },
        
        /**
		 * 전체 선택 체크박스 클릭 이벤트 핸들러
		 */
		_onClickCheckAll : function (e){
			this.$("input:checkbox[name=board_id]").attr('checked', $(e.currentTarget).is(':checked'));
        }, 
        
        _onClickToggleNodes: function(e) {
			var $target = $(e.currentTarget);
			// $target.data로 가지고 오면 안됨
			var currentState = $target.attr('data-state');
			
			e.preventDefault();
			
			if(this.boardTreeConfigView === null) {
				return;
			}
			
			if(currentState === 'opened') {
				this.boardTreeConfigView.foldAllNodes();
				$target.attr('data-state', 'closed');
				$target.text(lang.open_all);
			} else {
				this.boardTreeConfigView.unfoldAllNodes();
				$target.attr('data-state', 'opened');
				$target.text(lang.close_all);
			}
		},
        
        /**
		 * 게시판 순서변경 버튼 클릭 이벤트 핸들러
		 */
		_onClickSortableToggle : function(e) {
			e.preventDefault();
			
			if(this._isSortableMode()) {
				this._distroyNodeSortable();
			} else {
				this._enableNodeSortable();
			}
		},
		
		
		/**
		 * 순서바꾸기 모드 전환
		 */
		_enableNodeSortable: function() {
			if(!this.boardTreeConfigView) {
				return;
			}

			this.$el.find(".chk").hide();
			$(".btnBoardAdd").hide();
			$(".btnBoardGroupAdd").hide();
			$(".btnBoardLineAdd").hide();
			$(".btnBoardStop").hide();
			$(".btnBoardDelete").hide();
			$(".btnEditNode").hide();

			this.boardTreeConfigView.enableSortable();
			this.$('.tb-header').addClass('tb_stair_edit');
			this._changeSortButtonText(lang.board_sort_done);
		},
		
		/**
		 * 순서바꾸기 모드 해제
		 */
		_distroyNodeSortable: function() {
			if(!this.boardTreeConfigView) {
				return;
			}

            this.$el.find(".chk").hide();
			$(".btnBoardAdd").show();
			$(".btnBoardGroupAdd").show();
			$(".btnBoardLineAdd").show();
			$(".btnBoardStop").show();
			$(".btnBoardDelete").show();
			$(".btnEditNode").show();

			this.boardTreeConfigView.destroySortable();
			this.$('.tb-header').removeClass('tb_stair_edit');
			this._changeSortButtonText(lang.board_sort);
		},
		
		/**
		 * 순서바꾸기 모드인가 체크
		 */
		_isSortableMode: function() {
			return this.$('#board-tree-config').hasClass('tb_stair_edit');
		},
		
		/**
		 * 순서바꾸기 버튼 텍스트 변경
		 */
		_changeSortButtonText: function(text) {
			$('.btnBoardSortable').html(text);
		},
		
		/**
		 * 게시판 중지 버튼 클릭 이벤트 핸들러
		 */
		_onClickBoardStop : function(e){
		    var ids = this._getCheckedBoardIds();
		    var self = this;
		    
		    e.preventDefault();
		    
		    if(_depFlag === true) {
            	$.goSlideMessage(commonLang['잠시만 기다려주세요']);
            	return;
            }
		    
		    if(ids.length == 0){
		        $.goMessage(lang.not_selected_board);
		        return;
		    }
		    
            $.goConfirm(lang.stop_board,  lang.stop_confirm, function() {
                $.ajax({
                    type: 'PUT',
                    async: true,
                    data : JSON.stringify({ids : ids}),
                    dataType: 'json',
                    contentType : "application/json",
                    url: GO.config("contextRoot") + 'ad/api/board/status/closed'
                }).
                done(function(response){
                    $.goMessage(lang.change_success);
                    self.render(self.type);
                }).
                complete(function() {
                	_depFlag = false;
                });
            });
		},
		
		_onClickBoardDelete : function(e){
			var ids = this._getCheckedBoardIds();
		    var self = this;
		    
		    e.preventDefault();
            
            if(_depFlag === true) {
            	$.goSlideMessage(commonLang['잠시만 기다려주세요']);
            	return;
            }
            
            if(ids.length == 0){
                $.goMessage(lang.not_selected_board);
                return;
            }
            
            $.goConfirm(lang.delete_title,  lang.delete_confirm, function() {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    data : JSON.stringify({ids : ids}),
                    dataType: 'json',
                    contentType : "application/json",
                    url: GO.config("contextRoot") + 'ad/api/board/status/deleted'
                }).
                done(function(response){
                    $.goMessage(lang.delete_success);
                    self.render(self.type);
                }).
                complete(function() {
                	_depFlag = false;
                });
            });
		},
        
		// 사용중인 게시판 탭을 제외한 나머지 부분에서 사용되고 있는 함수들임
		/**
		 * 중지된 게시판에서 사용되는 체크박스 전체 선택
		 */
		checkAllToggle : function(e){
		    var currentEl = $(e.currentTarget);
		    
		    if(currentEl.is(":checked")){
		        this.$el.find("#tableBorderList input:checkbox").attr("checked", "checked");
		    }else{
		        this.$el.find("#tableBorderList input:checkbox").attr("checked", null);
		    };
		},
		
		changeStatusNormal : function(){
            var ids = this._getCheckedBoardIds(),
                self = this;
            
            if(ids.length == 0){
                $.goMessage(lang.not_selected_board);
                return;
            }
            
            $.goConfirm(lang.change_status_normal, lang.normal_confirm, function() {
                $.ajax({
                    type: 'PUT',
                    async: true,
                    data : JSON.stringify({ids : ids}),
                    dataType: 'json',
                    contentType : "application/json",
                    url: GO.config("contextRoot") + 'ad/api/board/status/active'
                }).
                done(function(response){
                    $.goMessage(lang.change_success);
                    self.render(self.type);
                });
            });
		},
		
		changeTab : function(e){
			e.stopImmediatePropagation();
		    var currentEl = $(e.currentTarget);
		    var type = currentEl.attr("data-type");
		    this.render(type);
		},
		bindListSortable : function(e) {
			this.$el.find('.btnBoardLineAdd').hide();
			this.$el.find('.btnBoardSortable').hide();
			this.$el.find('.btnBoardAdd').hide();
			this.$el.find('.btnBoardSortDone').show();
			
			this.listEl.find('tbody').removeClass().sortable({
				opacity : '1',
				delay: 100,
				cursor : "move",
				items : "tr",
				containment : '.admin_content',
				hoverClass: "ui-state-hover",
				placeholder : 'ui-sortable-placeholder',
				start : function (event, ui) {
			        ui.placeholder.html(ui.helper.html());
			        ui.placeholder.find('td').css('padding','5px 10px');
			    }
			
			});	
		},
		
		bbsCreate : function(){
			App.router.navigate('/board/create', true);			
		},
		bbsModify : function(e){
			if($(e.currentTarget).parents('tbody:eq(0)').hasClass('ui-sortable')) {
				$.goMessage(adminLang["순서 바꾸기 완료후 설정"]);
				return false;
			}
			var boardId = $(e.currentTarget).attr('data-boardId');
			App.router.navigate('/board/'+boardId+"/modify", true);
		}
	},{
		create: function(status) {
			instance = new boardCompanyList();
			return instance.render(status);
		}
	});
	
	return {
		render: function(status) {
			var layout = boardCompanyList.create(status);
			return layout;
		}		
	};
});
define(function(require) {
	
	var $ = require('jquery');
	var Backbone = require('backbone');
	var when = require('when');
	var GO = require('app');
	
	var BoardTree = require('board/components/board_tree/board_tree');
	var DeptBoardTreeNode = require('board/models/dept_board_tree_node');
	var ToolbarTpl = require('text!board/templates/_dept_board_toolbar.html');
	var Constants = require('board/constants');
	
	var BoardTitleView = require('board/views/board_title');
	var renderDeptBoardAdminTpl = require('hgn!board/templates/dept_board');
	var boardLang = require('i18n!board/nls/board'); 
	var commonLang = require('i18n!nls/commons'); 
	

	require('jquery.ui');
	require('jquery.go-popup');
	require('jquery.go-sdk');
	require('GO.util');
	require('jquery.go-orgslide');
	
	var lang = {
		"board_admin" : boardLang["게시판 관리"],
		"board_admin_desc" : boardLang["게시판 관리 설명"],
		"board_separator" : boardLang["구분선"],
		"board_separator_add" : boardLang["구분선 추가"],
		"board_stop" : commonLang["중지"],
		"board_delete" : commonLang["삭제"],
		"board_migration" : commonLang["게시판 이관"],
		"modify" : commonLang["수정"],
		"save" : commonLang["저장"],
		"cancel" : commonLang["취소"],
		"delete" : commonLang["삭제"],
		"board_active_title" : boardLang["사용중"],
		"board_stop_title" : boardLang["중지"],
		"board_reorder" : boardLang["순서 바꾸기"],
		"board_reorder_save" : boardLang["순서바꾸기 완료"],
		"board_title" : commonLang["게시판"],
		"board_manager" : boardLang["운영자"],
		"board_createat" : boardLang["개설일"],
		"board_updateat" : boardLang["중지일"],
		"board_posts" : boardLang["게시글 수"],
		"board_setting" : commonLang["설정"],
		"board_active_null" : boardLang["사용중인 게시판 목록이 없습니다."],
		"board_stop_null" : boardLang["중지된 게시판 목록이 없습니다."],
		"delete_separator?" : boardLang["구분선을 삭제 하시겠습니까?"],
		"delete_separator_desc?" : boardLang["구분선을 삭제하면 복구되지 않습니다. <br />계속 하시겠습니까?"],
		"not_select_board" : boardLang["게시판을 선택해 주세요."],
		"change_success" : commonLang["변경되었습니다."],
		"delete_success" : commonLang["삭제되었습니다."],
		"delete_confirm" : boardLang["게시판 삭제 확인"],
		"delete_title" : boardLang["게시판 삭제"],
		"stop_confirm" : boardLang["게시판 중지 확인"],
		"stop_board" : boardLang["게시판 중지"],
		"add_board": boardLang["게시판 추가"], 
		"add_group": boardLang["게시판 그룹 추가"], 
		"close_all": boardLang["모두 닫기"], 
		"open_all": boardLang["모두 열기"],
		"stop_board_success": boardLang["게시판중지 안내메시지"], 
		"stop_boards_success": boardLang["복수개 게시판중지 안내메시지"], 
		"del_board_success": boardLang["게시판삭제 안내메시지"], 
		"del_boards_success": boardLang["복수개 게시판삭제 안내메시지"],
		"추가": commonLang["추가"]
	};
	
	/**
	 * 중복 액션을 막기 위함
	 */
	var _depFlag = false;
	
	var BoardAdminView = Backbone.View.extend({
		initialize: function(options) {
			var opts = options || {};
			
			this.deptId = opts.deptId;
			this.status = opts.status || DeptBoardTreeNode.STATUS_ACTIVE;
			
			// 부서게시판 목록
			this.deptBoardNodes = new DeptBoardTreeNode.Collection(null, {deptId: this.deptId, status: this.status});
			
			// 타이틀 뷰 부분
			this.boardTitleView = null;
			this.boardTreeConfigView = null;
		},
		
		events : {
			"click a.btnToggleAddMenu": "_onClickToggleAddMenu", 
			"click a.btnBoardDelete" : "_onClickBoardDelete",
			"click a.btnBoardStop" : "_onClickBoardStop",
			"click #checkAll" : "_onClickCheckAll",
			"click .btnAddBoard": "_onClickAddBoard", 
			"click .btnAddGroup": "_onClickAddGroup",
			"click .btnAddSeperator": "_onClickAddSeperator", 
			"click a.btnBoardMigration" : "_onClickBoardMigration",
			"click a.btnBoardSortable" : "_onClickSortableToggle",
			"click a.btnToggleNodes": "_onClickToggleNodes"
		},
		
		
		/**
		 * 렌더링 함수
		 */
		render: function() {
			console.debug('[board] DeptBoardAdmin:render call');
			
			this.$el.html(renderDeptBoardAdminTpl({
				lang : lang
			}, {
				toolbar: ToolbarTpl
			}));
			
			this._renderBoardTitle();
			this._renderBoardTree();
		}, 
		

		/**
		 * @Override
		 */
		remove: function() {
			Backbone.View.prototype.remove.apply(this, arguments);
			if(this.boardTitleView) {
				this.boardTitleView.remove();
				this.boardTitleView = null;
			}
			
			if(this.boardTreeConfigView) {
				this.boardTreeConfigView.remove();
				this.boardTreeConfigView = null;
			}
		}, 
		
		_renderBoardTitle: function() {
			this.boardTitleView = BoardTitleView.render({
				el: '.content_top', 
				dataset : {
					name : lang['board_admin'] 
				}
			});
		},
		
		_renderBoardTree: function() {
			var self = this;
			var collection = this.deptBoardNodes;
			
			return when.promise(function(resolve, reject) {
				collection.fetch({
					silent: true, 
					success: function(collection) {
						var boardTreeConfigView = new BoardTree.BoardTreeConfigView({"nodes": collection});
						boardTreeConfigView.setElement(self.$('#board-tree-config'));
						boardTreeConfigView.render();
						self.boardTreeConfigView = boardTreeConfigView;
					},
					error: reject, 
					statusCode: {
	                    403: function() { GO.util.error('403', { "msgCode": "400-board"});}, 
	                    404: function() { GO.util.error('404', { "msgCode": "400-board"});}, 
	                    500: function() { GO.util.error('500');}
	                }
				});
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

        _addFolder: function() {
        	if(this.boardTreeConfigView) {
        		this.boardTreeConfigView.addNode(new DeptBoardTreeNode.Model({
        			"nodeType": Constants.NODETYPE_FOLDER, 
        			"nodeValue": boardLang['새로운 그룹명을 입력해주세요']
    			}));
        	}
        },
        
        _addSeperator: function() {
        	if(this.boardTreeConfigView) {
        		this.boardTreeConfigView.addNode(new DeptBoardTreeNode.Model({
        			"nodeType": Constants.NODETYPE_SEPERATOR, 
        			"nodeValue": boardLang['새로운 구분선명을 입력해주세요']
    			}));
        	}
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
				$target.find('span.txt').text(lang.open_all);
			} else {
				this.boardTreeConfigView.unfoldAllNodes();
				$target.attr('data-state', 'opened');
				$target.find('span.txt').text(lang.close_all);
			}
		},
        
		/**
		 * 추가 버튼 클릭 이벤트 핸들러
		 */
		_onClickToggleAddMenu: function(e) {
			var $target = $(e.currentTarget);
			var $contextMenu = $target.siblings('.addActionContextMenu');
			
			e.preventDefault();
			$contextMenu.toggle();
		},
		
		/**
		 * 게시판 삭제 이벤트 핸들러(bulk)
		 */
		_onClickBoardDelete : function(e){
            var self = this;
            var ids = this._getCheckedBoardIds();
            var targetCount = ids.length;
            var repBoard;
            
            e.preventDefault();
            
            if(_depFlag === true) {
            	$.goSlideMessage(commonLang['잠시만 기다려주세요']);
            	return;
            }
            
            if(ids.length === 0){
                $.goMessage(lang.not_select_board);
                return;
            }
            
            // 대표게시판명을 저장해둔다.
            repBoard = this.deptBoardNodes.findByBoardId(parseInt(ids[0]));
            
            $.goConfirm(lang.delete_title,  lang.delete_confirm, function() {
                $.ajax({
                    type: 'DELETE',
                    data : JSON.stringify({ids : ids}),
                    dataType: 'json',
                    contentType : "application/json",
                    url: GO.config("contextRoot") + 'api/board/status/deleted', 
                    beforeSend: function() {
                    	_depFlag = true;
                    }
                }).
                done(function(response){
                	var successMsg = '';
                	if(targetCount > 1) {
                		successMsg = GO.i18n(lang.del_boards_success, {"arg1": targetCount});
                	} else if(targetCount === 1) {
                		successMsg = GO.i18n(lang.del_board_success, {"arg1": repBoard.getBoardName()});
                	}
                	
                	$.goSlideMessage(successMsg);
                    GO.EventEmitter.trigger('boardTree', 'changed:nodes', true);
                    self.render();
                }).
                fail(function(error){
                	if(error.status == 403){
                		$.goSlideMessage(commonLang['권한이 없습니다.'] + commonLang['관리자에게 문의하세요.'], 'caution');
                	}else{
                    	$.goSlideMessage(commonLang['실패했습니다.'], 'caution');
                	}
                }).
                complete(function() {
                	_depFlag = false;
                });
            });
		},
		
		/**
		 * 게시판 중지 버튼 클릭 이벤트 핸들러
		 */
		_onClickBoardStop : function(e){
			var self = this;
            var ids = this._getCheckedBoardIds();
            var targetCount = ids.length;
            var repBoard;
            
            e.preventDefault();
            
            if(_depFlag === true) {
            	$.goSlideMessage(commonLang['잠시만 기다려주세요']);
            	return;
            }
		    
		    if(ids.length == 0){
		        $.goMessage(lang.not_select_board);
		        return;
		    }
		    
		    repBoard = this.deptBoardNodes.findByBoardId(parseInt(ids[0]));
		    
            $.goConfirm(lang.stop_board,  lang.stop_confirm, function() {
                $.ajax(GO.config("contextRoot") + 'api/board/status/closed', {
                    type: 'PUT',
                    data : JSON.stringify({ids : ids}),
                    dataType: 'json',
                    contentType : "application/json",
                    beforeSend: function() {
                    	_depFlag = true;
                    }
                }).
                done(function(response){
                	var successMsg = '';
                	if(targetCount > 1) {
                		successMsg = GO.i18n(lang.stop_boards_success, {"arg1": targetCount});
                	} else if(targetCount === 1) {
                		successMsg = GO.i18n(lang.stop_board_success, {"arg1": repBoard.getBoardName()});
                	}
                	
                	$.goSlideMessage(successMsg);
                	
                    GO.EventEmitter.trigger('boardTree', 'changed:nodes', true);
                    self.render();
                }).
                fail(function(error){
                	if(error.status == 403){
                		$.goSlideMessage(commonLang['권한이 없습니다.'] + commonLang['관리자에게 문의하세요.'], 'caution');
                	}else{
                    	$.goSlideMessage(commonLang['실패했습니다.'], 'caution');
                	}
                }).
                complete(function() {
                	_depFlag = false;
                });
            });
		},
		
		/**
		 * 전체 선택 체크박스 클릭 이벤트 핸들러
		 */
		_onClickCheckAll : function (e){
			this.$("input:checkbox[name=board_id]").attr('checked', $(e.currentTarget).is(':checked'));
        }, 
        
        /**
         * 게시판 추가 클릭 이벤트 핸들러
         */
        _onClickAddBoard: function(e) {
        	var $contextMenu = $(e.currentTarget).closest('.addActionContextMenu');
        	$contextMenu.hide();
        	
        	GO.router.navigate('board/create', {trigger: true});
        },
        
        /**
         * 폴더 추가 클릭 이벤트 핸들러
         */
        _onClickAddGroup: function(e) {
        	var $contextMenu = $(e.currentTarget).closest('.addActionContextMenu');
        	
        	this._addFolder();
        	$contextMenu.hide();
        }, 
        
        /**
         * 구분선 추가 클릭 이벤트 핸들러
         */
        _onClickAddSeperator: function(e) {
        	var $contextMenu = $(e.currentTarget).closest('.addActionContextMenu');
        	$contextMenu.hide();
        	this._addSeperator();
        },
        
        /**
         * 게시판 이관 클릭 이벤트 핸들러
         */
        _onClickBoardMigration : function(e){
        	var self = this;
            var ids = this._getCheckedBoardIds();
            
            e.preventDefault();
            
            if(_depFlag === true) {
            	$.goSlideMessage(commonLang['잠시만 기다려주세요']);
            	return;
            }
        
            if(ids.length == 0){
                $.goMessage(lang.not_select_board);
                return;
            }
            
            $.goOrgSlide({
                type : "department",
                contextRoot : GO.contextRoot,
                callback : $.proxy(function(info) {
                    var content = 
                        '<p class="add">' +
                        GO.i18n(boardLang["게시판 {{arg1}}로 이동"],{arg1 : info.name}) + 
                        '</p>'; 
                    
                    $.goConfirm(lang.board_migration, content, function() {
                        $.ajax({
                            type: 'PUT',
                            async: true,
                            data : JSON.stringify({ids : ids}),
                            dataType: 'json',
                            contentType : "application/json",
                            url: GO.config("contextRoot") + 'api/board/transfer/dept/' + info.id
                        }).
                        done(function(response){
                            $.goMessage(lang.change_success);
                            GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
                            self.render();
                            $.goOrgSlide.close();
                        }).
	                    fail(function(error){
	                    	if(error.status == 403){
	                    		$.goAlert(commonLang['권한이 없습니다.'] + '<br/>' + commonLang['관리자에게 문의하세요.']);
	                    	}else{
	                        	$.goAlert(commonLang['실패했습니다.']);
	                    	}
	                    });
                    });
                }, this)    
            });
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
			
			$(".btnBoardStop").hide();
			$(".btnBoardDelete").hide();
			$(".btnToggleAddMenu").hide();
			$(".btnBoardMigration").hide();
			
			this.boardTreeConfigView.enableSortable();
			this.$('.tb-header').addClass('tb_stair_edit');
			this._changeSortButtonText(lang.board_reorder_save);
		},
		
		/**
		 * 순서바꾸기 모드 해제
		 */
		_distroyNodeSortable: function() {
			if(!this.boardTreeConfigView) {
				return;
			}
			
			$(".btnBoardStop").show();
			$(".btnBoardDelete").show();
			$(".btnToggleAddMenu").show();
			$(".btnBoardMigration").show();
			
			this.boardTreeConfigView.destroySortable();
			this.$('.tb-header').removeClass('tb_stair_edit');
			this._changeSortButtonText(lang.board_reorder);
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
			$('.btnBoardSortable').find('span.txt').html(text);
		},
	});
	
	return BoardAdminView;
});
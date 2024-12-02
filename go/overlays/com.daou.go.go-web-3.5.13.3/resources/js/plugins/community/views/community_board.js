define(function(require) {
	
	var $ = require("jquery");
	var Backbone = require("backbone");
	var when = require("when");
	var App = require("app");
	
	var DeptBoardModel = require("community/models/community_board");
	var tplDeptBoardAdmin =require("hgn!community/templates/community_board");
	
	var boardLang = require("i18n!board/nls/board"); 
	var commonLang = require("i18n!nls/commons"); 
	var communityLang = require("i18n!community/nls/community");
	
	var BoardTree = require('board/components/board_tree/board_tree');
	var CommBoardTreeNode = require('community/models/comm_board_tree_node');
	var ToolbarTpl = require('text!board/templates/_dept_board_toolbar.html');
	var Constants = require('board/constants');

	require("jquery.ui");
	require("jquery.go-popup");
	require("jquery.go-sdk");
	require("GO.util");
	require("jquery.go-validation");
	
	var instance = null;
		lang = {
			'board_admin' : boardLang['게시판 관리'],
			'board_admin_desc' : communityLang['우리 커뮤니티에 개설된 게시판 순서를 변경하거나 , 중단 또는 삭제 할 수 있습니다.'],
			'board_separator' : boardLang['구분선'],
			'board_separator_add' : boardLang['구분선 추가'],
			'modify' : commonLang['수정'],
			'save' : commonLang['저장'],
			'cancel' : commonLang['취소'],
			'delete' : commonLang['삭제'],
			'board_active_title' : boardLang['사용중'],
			'board_stop_title' : boardLang['중지'],
			'board_reorder' : boardLang['순서 바꾸기'],
			'board_reorder_save' : boardLang['순서바꾸기 완료'],
			'board_title' : commonLang['게시판'],
			'board_manager' : boardLang['운영자'],
			'board_createat' : boardLang['개설일'],
			'board_updateat' : boardLang['중지일'],
			'board_posts' : boardLang['게시글 수'],
			'board_setting' : commonLang['설정'],
			'board_active_null' : boardLang['사용중인 게시판 목록이 없습니다.'],
			'board_stop_null' : boardLang['중지된 게시판 목록이 없습니다.'],
			'delete_separator?' : boardLang['구분선을 삭제 하시겠습니까?'],
			'delete_separator_desc?' : boardLang['구분선을 삭제하면 복구되지 않습니다. <br />계속 하시겠습니까?'],
			'delete_confirm' : boardLang["게시판 삭제 확인"],
			'delete_title' : boardLang["게시판 삭제"],
			'stop_confirm' : boardLang["게시판 중지 확인"],
			'stop_board' : boardLang["게시판 중지"],
			'change_success' : commonLang["변경되었습니다."],
			'delete_success' : commonLang["삭제되었습니다."],
			'not_select_board' : boardLang['게시판을 선택해 주세요.'],
			'board_stop' : commonLang["중지"],
			'board_delete' : commonLang["삭제"], 
			"add_board": boardLang["게시판 추가"], 
			"add_group": boardLang["게시판 그룹 추가"], 
			"close_all": boardLang["모두 닫기"], 
			"open_all": boardLang["모두 열기"],
			"추가": commonLang["추가"]
		};
		
	/**
	 * 중복 액션을 막기 위함
	 */
	var _depFlag = false;
	
	var BoardTreeConfigView = BoardTree.BoardTreeConfigView;
	var CommBoardTreeConfigView = BoardTreeConfigView.extend({
		/**
		 * @Override
		 */
		getBoardAdminUrl: function(boardTreeNode) {
			return ['community', boardTreeNode.getCommunityId(), 'board', boardTreeNode.getBoardId(), 'admin'].join('/');
		},
	});
		
	var CommBoardAdmin = Backbone.View.extend({
		
		events : {
			"click a.btnToggleAddMenu": "_onClickToggleAddMenu", 
			"click a.btnBoardDelete" : "_onClickBoardDelete",
			"click a.btnBoardStop" : "_onClickBoardStop",
			"click #checkAll" : "_onClickCheckAll",
			"click .btnAddBoard": "_onClickAddBoard", 
			"click .btnAddGroup": "_onClickAddGroup",
			"click .btnAddSeperator": "_onClickAddSeperator", 
			"click a.btnBoardSortable" : "_onClickSortableToggle",
			"click a.btnToggleNodes": "_onClickToggleNodes"
		},
		
		initialize: function(options) {
			this.$el.off();
			var opts = options || {};
			
			this.communityId = opts.communityId;
			this.status = opts.status || Contstans.STATUS_ACTIVE;
			
			// 부서게시판 목록
			this.commBoardNodes = new CommBoardTreeNode.Collection(null, {communityId: this.communityId, status: this.status});
			this.boardTreeConfigView = null;
		},
		
		render: function() {
			this.$el.empty();
			var self = this;
			console.debug('[board] CommBoardAdmin:render call');
			
			this.$el.html(tplDeptBoardAdmin({
				isStop : isStop = function() {
					if(self.status == 'closed') return true;
					return false;
				},
				lang : lang
			}, {
				toolbar: ToolbarTpl
			}));
			
			// TODO: 리팩토링 필요
			// 게시판 이관 버튼을 제거(게시판 툴바를 그대로 사용해서 발생한 코드)
			this.$el.find('.btnBoardMigration').remove();
			
			this._renderBoardTree();
		},
		
		checkBoard : function(){
			
			var isChecked = false;
			
			$.each($("#tableBorderList tbody input"), function(k,v) {
				if($(v).is(':checked')){
					isChecked = true;
					return false;
				}
			});
			
			return isChecked;
		},
		getSelectBoardIds : function(){
			var boardIds = [];
			$.each($("#tableBorderList tbody input:checked"), function(k,v) {
					boardIds.push($(v).val());
			});
			return boardIds;
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
        		this.boardTreeConfigView.addNode(new CommBoardTreeNode.Model({
        			"nodeType": Constants.NODETYPE_FOLDER, 
        			"nodeValue": boardLang['새로운 그룹명을 입력해주세요']
    			}));
        	}
        },
        
        _addSeperator: function() {
        	if(this.boardTreeConfigView) {
        		this.boardTreeConfigView.addNode(new CommBoardTreeNode.Model({
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
		 * 전체 선택 체크박스 클릭 이벤트 핸들러
		 */
		_onClickCheckAll : function (e){
			this.$("input:checkbox[name=board_id]").attr('checked', $(e.currentTarget).is(':checked'));
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
         * 게시판 추가 클릭 이벤트 핸들러
         */
        _onClickAddBoard: function(e) {
        	var $contextMenu = $(e.currentTarget).closest('.addActionContextMenu');
        	$contextMenu.hide();
        	
        	GO.router.navigate('community/' + this.communityId + '/board/create', {trigger: true});
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
		 * 게시판 순서변경 버튼 클릭 이벤트 핸들러
		 */
		_onClickSortableToggle : function(e) {
			var self = this;
			var $target = $(e.currentTarget);
			
			e.preventDefault();
			
			if(this._isSortableMode()) {
				$(".btnBoardStop").show();
				$(".btnBoardDelete").show();
				$(".btnToggleAddMenu").show();
				
				this._distroyNodeSortable();
			} else {
				$(".btnBoardStop").hide();
				$(".btnBoardDelete").hide();
				$(".btnToggleAddMenu").hide();
				
				this._enableNodeSortable();
			}
		},
		
		/**
		 * 순서바꾸기 모드인가 체크
		 */
		_isSortableMode: function() {
			return this.$('#board-tree-config').hasClass('tb_stair_edit');
		},
		
		/**
		 * 순서바꾸기 모드 전환
		 */
		_enableNodeSortable: function() {
			if(!this.boardTreeConfigView) {
				return;
			}
			
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
			
			this.boardTreeConfigView.destroySortable();
			this.$('.tb-header').removeClass('tb_stair_edit');
			this._changeSortButtonText(lang.board_reorder);
		},
		
		/**
		 * 순서바꾸기 버튼 텍스트 변경
		 */
		_changeSortButtonText: function(text) {
			$('.btnBoardSortable').find('span.txt').html(text);
		},
		
		_onClickBoardStop : function(e){
			var self = this;
			var boardIds = this._getCheckedBoardIds();
			
			e.preventDefault();
			
			if(_depFlag === true) {
            	$.goSlideMessage(commonLang['잠시만 기다려주세요']);
            	return;
            }
			
			if(boardIds.length == 0){
				$.goMessage(lang.not_select_board);
				return;
			}
			
			$.goConfirm(lang.stop_board,  lang.stop_confirm, function() {
                $.ajax({
                    type: 'PUT',
                    data : JSON.stringify({ids : boardIds}),
                    dataType: 'json',
                    contentType : "application/json",
                    url: GO.config("contextRoot") + 'api/board/status/closed', 
                    beforeSend: function() {
                    	_depFlag = true;
                    }
                }).
                done(function(response){
                    $.goMessage(lang.change_success);
                    self.render();
                    GO.EventEmitter.trigger('community', 'changed:sideCommunityBoard', self.deptId);
                }).
                complete(function() {
                	_depFlag = false;
                });
            });
			
		},
		
		_onClickBoardDelete : function(e){
			var self = this;
			var boardIds = this._getCheckedBoardIds();
			
			e.preventDefault();
			
			if(_depFlag === true) {
            	$.goSlideMessage(commonLang['잠시만 기다려주세요']);
            	return;
            }
			
			if(boardIds.length == 0){
				$.goMessage(lang.not_select_board);
				return;
			}
			
			
			$.goConfirm(lang.delete_title,  lang.delete_confirm, function() {
                $.ajax({
                    type: 'DELETE',
                    data : JSON.stringify({ids : boardIds}),
                    dataType: 'json',
                    contentType : "application/json",
                    url: GO.config("contextRoot") + 'api/board/status/deleted', 
                    beforeSend: function() {
                    	_depFlag = true;
                    }
                }).
                done(function(response){
                    $.goMessage(lang.delete_success);                       
                    self.render();
                    GO.EventEmitter.trigger('community', 'changed:sideCommunityBoard', self.deptId);
                }).
                complete(function() {
                	_depFlag = false;
                });
            });
			
		},
		changeCheckedAll : function(e){
			var $eTarget = $(e.currentTarget);
			var isChecked = $eTarget.is(':checked');
			$.each($("#tableBorderList tbody input"), function(k,v) {
				$(v).attr('checked',isChecked);
			});
			
		},
		
		_renderBoardTree: function() {
			var self = this;
			var collection = this.commBoardNodes;
			
			// render가 두번 호출 되는 경우가 있다. 디버깅 전까진 우선 아래와 같이 처리..
			this.$el.find('#board-tree-config').empty();
			
			return when.promise(function(resolve, reject) {
				collection.fetch({
					silent: true, 
					success: function(collection) {
						var boardTreeConfigView = new CommBoardTreeConfigView({
							"nodes": collection, 
							"communityId": this.communityId
						});
						boardTreeConfigView.setElement(self.$('#board-tree-config'));
						boardTreeConfigView.render();
						self.boardTreeConfigView = boardTreeConfigView;
					},
					
					error: reject
				});
			}).otherwise(function(error) {
				console.log(error.stack);
			});
		},
		
		/**
		 * 아래는 정리중인 메소드들
		 */
		
		getSeparator : function(opt) {
			var opt = opt || {};
			var tplSeparator = [	'<tr class="separator"  data-id="',opt.id ,'"><td colspan="6" class="depart_bg align_l">',
			                    	'<span class="title_depart vm">&lt;<span>', opt.title ,'</span>&gt;</span>&nbsp;',
			                    	'<span class="btn_fn7 vm modify">',lang['modify'],'</span>&nbsp;',
			    					'<span class="btn_fn7 vm delete">',lang['delete'],'</span></td></tr>'];
			
			return tplSeparator.join('');
		},
		isSortable : function() {
			
		},
		bindListSortableToggle : function(e) {
			var self = this;
			$(e.currentTarget).toggle(function(){
				self.bindListSortable(e);
			}, function() {
				self.actionListSortPut(e);
			}).click();
		},
		bindListSortable : function(e) {
			this.$el.find('.btnBoardSortable').addClass('btn_save').find('span.txt').html(lang['board_reorder_save']);
			this.$el.find('.btnBoardAddLine').hide();
			this.listEl.find('tbody').removeClass().sortable({
				opacity : '1',
				delay: 100,
				cursor : "move",
				items : "tr",
				containment : '#tableBorderList',
				hoverClass: "ui-state-hover",
				//cursorAt : { top : 18, left : 15},
				forceHelperSize : 'true',
				helper : 'clone',
				placeholder : 'ui-sortable-placeholder',
			    start : function (event, ui) {
			        ui.placeholder.html("<td colspan='6'>&nbsp;</td>")
			    }
			});	
		},
		actionListSortPut : function(e) {
			var self = this,
				sortableBody = this.listEl.find('tbody'),
				sortIds = sortableBody.find('tr').map(function(k,v) {
					return $(v).attr('data-id');
					//return {'ids' : $(v).attr('data-id')};
				}).get();
			this.model.clear();
			this.model.set({ id : this.deptId, deptId : this.deptId, ids : sortIds }, { silent : true });
			this.model.save({}, {
	            success: function() {
	            	GO.EventEmitter.trigger('community', 'changed:sideCommunityBoard', self.deptId);
	            	self.render();
	            }
			});
		},
		actionSeparatorDelete : function(e) {
			var separatorEl = $(e.currentTarget).parents('tr'),
				separatorId = separatorEl.attr('data-id'),
				url = [GO.contextRoot+'api/community', this.deptId , 'board/line', separatorId];
			$.goCaution(lang['delete_separator?'], lang['delete_separator_desc?'], function() {
				$.go(url.join('/'), {}, {							
					qryType : 'DELETE',
					responseFn : function(rs) {
						if(rs.code == 200) {
							separatorEl.slideUp();	
							
						}
						GO.EventEmitter.trigger('community', 'changed:sideCommunityBoard', self.deptId);
					}
				});
			});
		},
		editSeparatorSave : function(e) {
			var self = this, 
				separatorEl = $(e.currentTarget).parents('tr'),
				separatorId = separatorEl.attr('data-id'),
				newTitle = separatorEl.find('input').val(),
				url = [GO.contextRoot+'api/community',this.deptId,'board/line',separatorId];
			
			var invalidAction = function(msg, focusEl) {
				$.goMessage(msg);
				if(focusEl) focusEl.focus();
				return false;
			};
			
			if(!$.goValidation.isCheckLength(1, 17, newTitle)) {
				invalidAction(App.i18n(communityLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"17"}), separatorEl.find('input'));
				return false;
			}
			
			
			
			$.go(url.join('/'), JSON.stringify({ 'title' : newTitle }), {							
				qryType : 'PUT',
				contentType: 'application/json',
				responseFn : function(rs) {								
					if(rs.code == 200) {
						separatorEl.html(
							$(self.getSeparator({id : rs.data.id , title : rs.data.title})).html()
						);
						GO.EventEmitter.trigger('community', 'changed:sideCommunityBoard', self.deptId);
					}
				}
			});
		},
		editSeparatorCancel : function(e) {
			var separatorEl = $(e.currentTarget).parents('tr'),
				separatorId = separatorEl.attr('data-id'),
				separatorTitle = separatorEl.find('input').attr("data-before");
			
			separatorEl.html(
				$(this.getSeparator({id : separatorId, title : separatorTitle})).html()
			);
		},
		editSeparatorTitle : function(e) {
			var separatorEl = $(e.currentTarget).parents('tr'),
				separatorId = separatorEl.attr('data-id'),
				separatorTitle = separatorEl.find('td'),
				separatorTitleText = separatorTitle.find('span.title_depart span').text(),					
				url = ['/api/community', this.deptId , 'board/line', separatorId],
				editTpl = ['<input type="text" class="input w_medium vm" value="', separatorTitleText ,
				            '" data-before="', separatorTitleText  ,'" />&nbsp;<span class="btn_fn7 vm save">',lang['save'],'</span>&nbsp;<span class="btn_fn7 vm cancel">',lang['cancel'],'</span>'];
				
			separatorTitle.html(editTpl.join('')).find('input').focus();
		},
		controlListCount : function() {
			if(this.listEl.find('tr[data-id]').length) {
				this.listEl.find('tr.null').remove();
			} else {
				this.listEl.append(['<tr class="null"><td colspan="6">', this.status == 'closed' ? lang['board_stop_null'] : lang['board_active_null'] ,'</td></tr>'].join(''));
			}
		},
		actionSeparatorPost : function() {
			var self = this, 
				url = [GO.contextRoot+'api/community', this.deptId , 'board/line'];
			
			$('body').animate({scrollTop: this.$el.height()}, 300);
			$.go(url.join('/'), { title : lang['board_separator'] }, {							
				qryType : 'POST',
				responseFn : function(rs) {
					var separators = self.getSeparator(rs.data);
					if(rs.code == 200) {
						self.listEl.append(separators);
						GO.EventEmitter.trigger('community', 'changed:sideCommunityBoard', self.deptId);
						self.controlListCount();
					}
				}
			});
		}
	});
	
	return {
		render: function(opt) {
			var opt = opt || {};
			instance = new CommBoardAdmin({el : '.tab_conent_wrap', communityId : opt.communityId, status : opt.status });
			return instance.render();
		}
	};
	
});

define('board/components/board_tree/views/board_tree_config', function(require) {
	var when = require('when');
	var GO = require('app');
	var BaseBoardTreeView = require('board/components/board_tree/views/base_board_tree');
	var BoardTreeNode = require('board/models/board_tree_node');
	var boardTreeConfigTpl = require('text!board/components/board_tree/templates/board_tree_config.html');
	var ScopeLayerView = require('board/components/layer/views/share_scope');
	var Constants = require('board/constants');
	
	var commonLang = require('i18n!nls/commons'); 
	var boardLang = require('i18n!board/nls/board');
	var adminLang = require('i18n!admin/nls/admin');
	
	require('jquery.go-popup');
	
	// 게시판 홈 노출 최대 갯수(사이트 관리자에서 사용)
	var MAX_EXPOSED_COUNT = 5;
	
	function renderEmptyMessage() {
		var emptyMsgBuff = [];
		
		emptyMsgBuff.push('<li class="empty-message">');
		emptyMsgBuff.push('<p class="data_null">');
		emptyMsgBuff.push('<span class="ic_data_type ic_no_contents"></span>');
		emptyMsgBuff.push('<span class="txt">');
		emptyMsgBuff.push(boardLang['등록된 게시판이 없습니다.']);
		emptyMsgBuff.push('</span>');
		emptyMsgBuff.push('<br />');
		emptyMsgBuff.push('</p>');
		emptyMsgBuff.push('</li>');
		
		return emptyMsgBuff.join('');
	}
	
	var BoardTreeConfigView = BaseBoardTreeView.extend({
		template: boardTreeConfigTpl,
		
		/**
		 * 현재 순서변경모드상태인지 여부 저장
		 */
		sortableState: false, 
		/**
		 * 닫힌 노드의 node id 저장
		 */
		closedNodes: [], 
		
		events: {
			"click .btn-board-admin": "_onClickBoardAdmin", 
			"click .btnSaveNode": "_onClickSaveNode", 
			"click .btnEditNode": "_onClickEditNode", 
			"click .btnRemoveNode": "_onClickNodeRemove",
			"click .btnCancelAddNode": "_onClickCancelAddNode", 
			"click .btnCancelEditNode": "_onClickCancelEditNode", 
			"click .btnToggleNode": "_onClickToggleNode",
			"change select[name=homeExposureFlag]": "_onChangeHomeExposure",
			'click [data-type="btnOwners"]' : "_onClickBtnOwners"
		},
		
		initialize: function(options) {
			BaseBoardTreeView.prototype.initialize.apply(this, arguments);
			
			this.sortableState = false;
		},
		
		render: function() {
			BaseBoardTreeView.prototype.render.apply(this, arguments);
			
			if(this.sortableState) {
				this.enableSortable();
			}
			
			if(this.isRootNode()) {
				this._renderEmptyMessageIfNoData();
			}
		},
		
		/**
		 * 뷰를 다시 그림
		 * 
		 * boardTreeNodes 모델이 boardModel 등을 품고 있어서 게시판 모델이 변경되었을 경우
		 * 업데이트 해줘야 함. 그래서, 컬렉션 자체를 sync 처리하도록 하여 다시 그리도록 함
		 */
		reload: function() {
			var self = this;
			this.$el.empty();

			// GO-19872 이슈로 인해 컬렉션 패치를 다시 받도록 변경함
			// 그러나, 이 방법은 좋지 못하다. 게시판 사이드메뉴 그릴때 동일한 컬렉션을 패치하고 있으므로
			// 향후 리팩토링이 필요하다.
			this.boardTreeNodes.fetch({
				success: function() {
					self.render();
				}
			});
		},
		
		/**
		 * 순서변경 및 하위 그룹으로 변경하는 기능 제공
		 */
		enableSortable: function() {
			var self = this;
			
			this.$el.addClass('tb_stair_edit');
			
			bindSortable(this.$el);
			bindSortable(this.$el.find('.board-tree-nodes'));

			// scroll이 생길경우 helper의 위치에 대한 문제 있음
			// http://stackoverflow.com/questions/5791886/jquery-draggable-shows-helper-in-wrong-place-after-page-scrolled
			this.$('li.node .node-title').draggable({
				scroll: false,
				appendTo: "body",
				cursorAt: {"left": 0, "top": 0 },
				helper: function(event) {
					var $target = $(event.currentTarget);
					return createDragHelper($target.text());
				},
				start: function() {
					$(this).data("startingScrollTop",$(document.body).scrollTop());
				},
				drag: function(event, ui){
					var st = parseInt($(this).data("startingScrollTop"));
					ui.position.top -= st;
				}
			});
			
			this.$('li.folder > .item').droppable({
				accept: '.node-title', 
				drop: function(event, ui) {
					var $receivedNode = ui.draggable.closest('li');
					var $parentNode = $(this).closest('li');
					var parentNode = self._getNodeModel($parentNode);
					var parentNodeId = parentNode.getNodeId();
					var receivedNode = self._getNodeModel($receivedNode);
					var receivedNodeId = receivedNode.getNodeId();
					var newSeq = self.boardTreeNodes.getChildrenCount(parentNodeId);
					
					// 자기 자신에게 드랍되면 무시한다.
					if($receivedNode.is($parentNode)) {
						return;
					}
					
					// node가 없으면 무시한다.
					if(!parentNode) {
						return;
					}
					
					// 자식 노드에 드랍되면 무시한다.
					if($parentNode.parents('li.folder[data-id=' + receivedNodeId + ']').length > 0) {
						$.goSlideMessage(boardLang['상위그룹을 하위그룹으로 이동할 수 없습니다']);
						return;
					}
					
					if(parentNodeId !== receivedNode.getParentId()) {
						self._moveNode(receivedNode, parentNodeId, newSeq).then(function() {
							self.reload();
						});
					}
				}
			});
			
			this.sortableState = true;
			
			function bindSortable($el) {
				$el.sortable({
					item: 'li.node',
					handle : '.ic_drag',
					scroll: false,
					connectWith: '.board-tree-nodes',
					appendTo: document.body,
					helper: function(event, $item) {
						return createDragHelper($item.find('.node-title:first').text());
					},
					stop: _updateNodeAfterSort, 
					receive: _updateNodeAfterSort, 
					remove: function(event, ui) {
						var $nodes = $(this);
						if($nodes.find('li.node').length < 1) {
							$nodes.remove();
						}
					}
				});
			}

			function createDragHelper(label) {
				var $helper = $('<span class="board_name dragging">' + label + '</span>');
				$helper.css({"width": 200, "height": 10});
				return $helper;
			}
			
			function _updateNodeAfterSort(event, ui) {
				var $item = ui.item;
				var $nodes = $item.closest('.board-tree-nodes');
				// 주의: 트리구조이므로 find를 이용하면 안됨
				var newSeq = $nodes.children('li.node').index($item);
				var node = self._getNodeModel($item);
				var parentNodeEl = $item.parents('li.node').get(0);
				var parentId = null;

				if(!$nodes.is(this)) {
					return;
				}
				
				if(parentNodeEl) {
					parentId = self._getNodeModel(parentNodeEl).getNodeId();
				}
				
				self._moveNode(node, parentId, newSeq);
			}
		},
		
		destroySortable: function() {
			this.$el.removeClass('tb_stair_edit');
			$('.board-tree-nodes.ui-sortable').sortable('destroy');
			this.$('li.node .node-title').draggable('destroy');
			this.$('li.folder > .item').droppable('destroy');
			this.sortableState = false;
		}, 
		
		/**
		 * @Override
		 */
		getTemplateVars: function(boardTreeNode) {
			var tplVars = BaseBoardTreeView.prototype.getTemplateVars.apply(this, arguments);
			tplVars.managerList = this._getFormattedManagerName(boardTreeNode);
			tplVars.isAdminService = boardTreeNode.isAdminService();
			tplVars.isHomeExposureBoard = boardTreeNode.isHomeExposureBoard();
			tplVars.isDeptShared = boardTreeNode.isDeptShared();
			tplVars.hasCompanyShare = boardTreeNode.hasCompanyShare();
			tplVars.lang = {
				"modify": commonLang["수정"], 
				"save": commonLang["저장"], 
				"remove": commonLang["삭제"],
				"cancel": commonLang["취소"], 
				"setting": commonLang["설정"],
				"open": commonLang["열기"],
				'range' : adminLang['공개 범위']
			};
			
			return tplVars;
		},
		
		/**
		 * @Override
		 */
		getIconType: function(boardTreeNode) {
			var nodeType = boardTreeNode.get('nodeType');
			var result;
			
			if(boardTreeNode.isFolderNode()) {
				result = 'folder';
			} else if(boardTreeNode.isBoardNode()) {
				result = 'board';
			} else if(boardTreeNode.isCompanyShareNode()) {
				result = 'board';
			} else if(boardTreeNode.isSeperatorNode()) {
				result = 'delimiter';
			}
			
			return result;
		},
		
		/**
		 * 노드를 새로 추가(백엔드 저장은 아님)
		 */
		addNode: function(boardTreeNode) {
			var self = this;
			var $node = this.createNodeElement(boardTreeNode, {"isEditingMode": true});
			this.$el.find('.empty-message').remove();
			this.$el.append($node);
			this._bindNodeEnterEvent($node);
		}, 
		
		/**
		 * @Override
		 * 노드가 닫힌 상태인지 여부 반환
		 */
		isClosedNode: function(boardTreeNode) {
			return _.indexOf(this.closedNodes, boardTreeNode.getNodeId()) > -1;
		}, 
		
		/**
		 * @Override
		 * 노드 접기
		 */
		foldNode: function($node) {
			console.debug('[board] BoardTreeConfigView: foldNode call');
			var nodeId = $node.data('id');
			
			// 주의: 트리 구조이므로 반드시 첫번째 자식을 찾아야 한다.
			$node.find('.board-tree-nodes:first').hide();
			$node.find('.btnToggleNode:first').removeClass('ic_stair_close').addClass('ic_stair_open');
			this._addClosedNode(parseInt($node.data('id')));
		}, 
		
		/**
		 * @Override
		 * 노드 열기
		 */
		unfoldNode: function($node) {
			console.debug('[board] BoardTreeConfigView: unfoldNode call');
			
			// 주의: 트리 구조이므로 반드시 첫번째 자식을 찾아야 한다.
			$node.find('.board-tree-nodes:first').show();
			$node.find('.btnToggleNode:first').removeClass('ic_stair_open').addClass('ic_stair_close');
			this._removeClosedNode(parseInt($node.data('id')));
		},
		
		/**
		 * 모든 노드 닫기(현재는 폴더만 가능)
		 */
		foldAllNodes: function() {
			var self = this;
			this.$('li.folder').each(function(i, el) {
				var $el = $(this);
				self.foldNode($el);
			});
		},
		
		/**
		 * 모든 노드 열기(현재는 폴더만 가능)
		 */
		unfoldAllNodes: function() {
			var self = this;
			this.$('li.folder').each(function() {
				var $el = $(this);
				self.unfoldNode($el);
			});
		}, 
		
		/**
		 * 게시판 설정페이지 URL 반환
		 */
		getBoardAdminUrl: function(boardTreeNode) {
			return 'board/' + boardTreeNode.getBoardId()	+ '/admin';
		},
		
		/**
		 * 등록된 노드 없음 메시지 엘리먼트 반환
		 */
		_getEmptyMessageEl: function() {
			return this.$el.find('.empty-message');
		},
		
		/**
		 * 등록된 노드 없음 메시지 삭제
		 */
		_removeEmptyMessage: function() {
			if(!this.isRootNode()) {
				return;
			}
			
			this._getEmptyMessageEl().remove();
		},
		
		/**
		 * 등록된 노드가 없을 경우 메시지 출력
		 */
		_renderEmptyMessageIfNoData: function() {
			if(!this.isRootNode()) {
				return;
			}
			
			this._removeEmptyMessage();
			if(this.boardTreeNodes.length < 1) {
				this.$el.html(renderEmptyMessage());
			}
		},

		/**
		 * 닫힌상태 노드저장소에 노드(id) 추가
		 */
		_addClosedNode: function(nodeId) {
			if(_.indexOf(this.closedNodes, parseInt(nodeId)) < 0) {
				this.closedNodes.push(nodeId);
			}
		},
		
		/**
		 * 닫힌상태 노드저장소에 노드(id) 삭제
		 */
		_removeClosedNode: function(nodeId) {
			var index = _.indexOf(this.closedNodes, parseInt(nodeId));
			if(index > -1) {
				this.closedNodes.splice(index, 1);
			}
		},
		
		/**
		 * 노드 접기/펼치기 버튼 클릭 이벤트 핸들러
		 */
		_onClickToggleNode: function(e) {
			var $target = $(e.currentTarget);
			var $node = $target.closest('li');
			
			// tree 구조이므로 이벤트가 위 노드로 전파될 수 있음에 주의
			e.stopImmediatePropagation();
			
			if($target.hasClass('ic_stair_open')) {
				this.unfoldNode($node);
			} else {
				this.foldNode($node);
			}
		},
		
		/**
		 * node 엘리먼트의 nodeId를 이용하여 nodeModel을 반환
		 */
		_getNodeModel: function(el) {
			var nodeId = $(el).data('id');
			
			if(!nodeId) {
				return;
			}
			
			return this.boardTreeNodes.get(parseInt(nodeId));
		},
		
		_getFormattedManagerName: function(boardTreeNode) {
			var formatted = '';
			var managerNames = boardTreeNode.getManagerNames();
			
			if(managerNames.length > 1) {
				var repName = managerNames.shift();
				formatted = GO.i18n(boardLang["게시판 대표운영자 표시"], {args1: repName, args2: managerNames.length});
			} else if(managerNames.length === 1) {
				formatted = managerNames[0];
			} else {
				formatted = '-';
			}
			
			return formatted;
		}, 
		
		_moveNode: function(node, parentId, seq) {
			var self = this;
			return node.move(seq, parentId).then(function success() {
				self._triggerChangeEvent();
				$.goSlideMessage(boardLang['순서변경이 적용되었습니다']);
				return when.resolve();
			});
		}, 
		
		/**
		 * 게시판 설정버튼 클릭 이벤트 핸들러
		 */
		_onClickBoardAdmin: function(e) {
			var $target = $(e.currentTarget);
			var $node = $target.closest('li');
			var nodeId = $node.data('id');
			var node = this.boardTreeNodes.get(nodeId);
			
			e.stopImmediatePropagation();
			
			GO.router.navigate(this.getBoardAdminUrl(node), {trigger: true});
		}, 
		
		/**
		 * 그룹/구분선 수정 클릭 핸들러
		 */
		_onClickEditNode: function(e) {
			var self = this;
			var $target = $(e.currentTarget);
			var $node = $target.closest('li');
			var nodeId= $node.data('id');
			var boardTreeNode = this.boardTreeNodes.get(parseInt(nodeId));
			
			this._toggleNodeTitleInput(boardTreeNode, $node, true);
			this._removeEmptyMessage();
		},
		
		/**
		 * 그룹/구분선 저장
		 */
		_onClickSaveNode: function(e) {
			var self = this;
			var $target = $(e.currentTarget);
			var $node = $target.closest('li');
			
			this._saveNode($node);
		}, 
		
		/**
		 * 그룹/구분선 수정모드로 변경
		 */
		_toggleNodeTitleInput: function(boardTreeNode, $node, isEditingMode) {
			// 중첩 구조이므로 현재 노드의 .item만 가져오도록 해야 한다.
			var $editingNode = this.createNodeElement(boardTreeNode, {"isEditingMode": isEditingMode || false});
			$node.find('.item:first').replaceWith($editingNode.find('.item:first'));
			
			if(isEditingMode) {
				this._bindNodeEnterEvent($node);
			} else {
				$node.off('keyup');
			}
		},
		
		/**
		 * 노드 저장(신규/수정 모두 해당)
		 */
		_saveNode: function($node) {
			var self = this;
			var nodeType = $node.data('type');
			var nodeId = $node.data('id');
			var nodeValue = $node.find('input:text').val();
			if (!$.goValidation.isCheckLength(2, 64, nodeValue)) {
				$.goSlideMessage(GO.i18n(boardLang['0자이상 0이하 입력해야합니다.'],{"arg1" : "2","arg2" : "64"}));
				return false;
			}
			var promise;
			var isNew = false;
			
			if(nodeId) {
				promise = when.promise(function(resolve, reject) {
					// title을 저장하지 않으면 BoardTreeNodeModel 변환시 title이 nodeValue를 다시 title값으로 만들어버린다.
					// 백엔드 수정 후 코드 수정 필요
					var beforeValue = self.boardTreeNodes.get(nodeId).get('nodeValue'); 
					self.boardTreeNodes.get(nodeId).save({"nodeValue": nodeValue, "title": nodeValue}, {
						success: resolve,
						error: function(e, response) {
							e.set({"nodeValue":beforeValue, "title":beforeValue});
							return reject(response);
						}
					});
				});
			} else {
				isNew = true;
				promise = this.boardTreeNodes.createNode(nodeType, nodeValue);
			}
			
			return promise.then(function(boardTreeNode) {
				$node.attr('data-id', boardTreeNode.getNodeId());
				self._toggleNodeTitleInput(boardTreeNode, $node);
				self._renderEmptyMessageIfNoData();
				self._triggerChangeEvent();
				printSuccessMessage(boardTreeNode, isNew);
				return when.resolve(boardTreeNode);
			}, function(response) {
				if(response.responseJSON.name == 'name.duplicated'){
					$.goSlideMessage(boardLang['그룹명이 중복되었습니다.']);
				}
			});
			
			function printSuccessMessage(boardTreeNode, isNew) {
				var msg = '';
				var newFlag = isNew || false;
				
				if(newFlag && boardTreeNode.isFolderNode()) {
					msg = boardLang['그룹이 추가되었습니다'];
				} else if(!newFlag && boardTreeNode.isFolderNode()) {
					msg = boardLang['그룹이 수정되었습니다'];
				} else if(newFlag && boardTreeNode.isSeperatorNode()) {
					msg = boardLang['구분선이 추가되었습니다'];
				} else if(!newFlag && boardTreeNode.isSeperatorNode()) {
					msg = boardLang['구분선이 수정되었습니다'];
				}
				
				if(msg && msg.length > 0) {
					$.goSlideMessage(msg);
				}
			}
		},
		
		/**
		 * 그룹/구분선 신규 취소
		 */
		_onClickCancelAddNode: function(e) {
			var self = this;
			var $target = $(e.currentTarget);
			var $node = $target.closest('li');
			
			e.preventDefault();
			
			$node.remove();
			this._renderEmptyMessageIfNoData();
		},
		
		/**
		 * 그룹/구분선 수정 취소
		 */
		_onClickCancelEditNode: function(e) {
			var self = this;
			var $target = $(e.currentTarget);
			var $node = $target.closest('li');
			var nodeId = $node.data('id');
			var boardTreeNode = this.boardTreeNodes.get(parseInt(nodeId));
			
			e.preventDefault();
			
			this._toggleNodeTitleInput(boardTreeNode, $node);
		},
		
		/***
		 * 공개범위 팝업
		 */
		_onClickBtnOwners : function(e){
			
			var $target = $(e.currentTarget);
			var $node = $target.closest('li');
			var popup = $.goPopup({
				header : adminLang['공개 범위'],
				'pclass' : 'layer_normal layer_share_scope',
				width : 330,
				'modal' : true,
				'allowPrevPopup' : false,
				buttons : [{
					btext : commonLang["확인"],
					btype : "confirm",
					autoclose : true
				}],
				contents : ""
			});
			var scopeLayerView = new ScopeLayerView({
				shares : this._getNodeModel($node)
			});
			scopeLayerView.render();
		},
		
		/**
		 * 그룹/구분선 삭제
		 */
		_onClickNodeRemove: function(e) {
			var self = this;
			var $target = $(e.currentTarget);
			var $node = $target.closest('li');
			var nodeId = $node.data('id');
			var nodeType = $node.data('type');
			var boardTreeNode = this.boardTreeNodes.get(parseInt(nodeId));
			
			e.preventDefault();
			e.stopImmediatePropagation();
			
			if(this.boardTreeNodes.hasChildren(nodeId)) {
				$.goSlideMessage(boardLang['게시판이 있거나 하위그룹이 있는 경우 삭제할 수 없습니다']);
				return;
			}
			
			$.goConfirm(
				getAlertTitle(nodeType),  
				GO.i18n(boardLang['게시판 노드 삭제 메시지'], {"args1": boardTreeNode.getNodeValue()}), 
				function() {
					self.boardTreeNodes.destroyNode(nodeId).then(function success(removedModel) {
						$node.remove();
						self._renderEmptyMessageIfNoData();
						$.goSlideMessage(commonLang['삭제되었습니다.']);
						// 삭제시에는 컬렉션에서 sync가 발생되지 않는다. 따라서, 강제로 발생.
						self.boardTreeNodes.trigger('sync');
						self._triggerChangeEvent();
					});
				});
			
			function getAlertTitle(nodeType) {
				var title = '';
				switch(nodeType) {
				case Constants.NODETYPE_FOLDER:
					title = boardLang['게시판 그룹 삭제'];
					break;
				case Constants.NODETYPE_SEPERATOR:
					title = boardLang['구분선 삭제'];
					break;
				}
				
				return title;
			}
		},
		
		/**
		 * 게시판 홈 노출 가능 여부(전사 게시판 관리에서 사용)
		 */
		_canAddHomeExposure: function() {
			var exposed = this.boardTreeNodes.filter(function(boardTreeNode) {
				return boardTreeNode.isBoardNode() && boardTreeNode.getBoardModel().get('homeExposureFlag');
			});
			
			return this.boardTreeNodes.isAdminService() && exposed.length < MAX_EXPOSED_COUNT;
		}, 
		
		/**
		 * 전사게시판 관리에서 게시판 홈 노출 여부 설정
		 */
		_onChangeHomeExposure : function(e){
			var self = this;
		    var $target = $(e.currentTarget);
		    var $node = $target.closest('li');
		    var nodeId = parseInt($node.data('id'));
		    var boardTreeNode = this.boardTreeNodes.get(nodeId);
		    var boardId = boardTreeNode.getBoardId();
		    var value = $target.val();
		    
		    if(!this.boardTreeNodes.isAdminService()) {
		    	return;
		    }
		    
		    if(value === 'true' && !this._canAddHomeExposure()) {
		    	$.goSlideMessage(GO.i18n(commonLang['최대 {{arg1}}개 까지 설정할 수 있습니다.'], {"arg1":MAX_EXPOSED_COUNT}), 'caution');
		    	this.reload();
		    	return;
		    }
		    
            $.ajax({
            	url: GO.config('contextRoot') + 'ad/api/company/board/' + boardId + '/change/exposure?homeExposureFlag=' + value, 
            	type: 'PUT', 
            	success: function(rs) {
            		if(rs.code == 200) {
						$.goSlideMessage(commonLang["저장되었습니다."]);
						boardTreeNode.setBoardAttrs('homeExposureFlag', value === 'true');
					}else{
						$.goSlideMessage(commonLang["실패했습니다."], 'caution');
						self.reload();
					}
            	}, 
            	
            	error: function() {
            		$.goSlideMessage(commonLang["실패했습니다."], 'caution');
            		self.reload();
            	}
            });
        },
		
		_bindNodeEnterEvent: function($node) {
			var self = this;
			$node.find('input:first').on('keyup', function(e) {
				var keycode = (e.keyCode ? e.keyCode : e.which);
				
				if(13 === parseInt(keycode)) {
					self._saveNode($node);
				}
			});
		},
		
		_triggerChangeEvent: function() {
			GO.EventEmitter.trigger('boardTree', 'changed:nodes');
		}
	});
	
	return BoardTreeConfigView;
});
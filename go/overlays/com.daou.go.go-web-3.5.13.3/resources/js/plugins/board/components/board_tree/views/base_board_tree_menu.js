define('board/components/board_tree/views/base_board_tree_menu', function(require) {
	var GO = require('app');	
	var BaseBoardTreeView = require('board/components/board_tree/views/base_board_tree');
	
	require('jquery.go-popup');
	
	var STORE_KEY = GO.session('loginId') + '.board.side.closedNodes';
	
	var BaseBoardTreeMenuView = BaseBoardTreeView.extend({
		/**
		 * 메뉴별 고유 ID
		 */
		menuId: null, 
		
		/**
		 * store 키
		 */
		storeKey: null,
		
		initialize: function(options) {
			var opts = options || {};
			BaseBoardTreeView.prototype.initialize.apply(this, arguments);
			
			this.menuId = null;
			if(opts.hasOwnProperty('menuId')) {
				this.setMenuId(opts.menuId);
			}
		}, 
		
		/**
		 * @Override
		 */
		renderChildView: function(boardTreeNode) {
			var childView = new this.constructor({
				"nodes": this.boardTreeNodes, 
				"parentId": boardTreeNode.getNodeId(), 
				"menuId": this.menuId
			});
			childView.render();
			return childView
		},
		
		setMenuId: function(menuId) {
			this.menuId = menuId;
		},
		
		getMenuId: function() {
			return this.menuId;
		},
		
		/**
		 * @Override
		 * 노드가 닫힌 상태인지 여부 반환
		 */
		isClosedNode: function(boardTreeNode) {
			var closedNodes = this._getStoredClosedNodes();
			return _.indexOf(closedNodes, boardTreeNode.getNodeId()) > -1;
		}, 
		
		/**
		 * @Override
		 * 노드 접기
		 */
		foldNode: function($node) {
			console.debug('[board] BaseBoardTreeView: foldNode call');
			var nodeId = $node.data('id');
			
			// 주의: 트리 구조이므로 반드시 첫번째 자식을 찾아야 한다.
			$node.find('.board-tree-nodes:first').hide();
			$node.find('.btnToggleNode:first').removeClass('close').addClass('open');
			this._addClosedNode(parseInt($node.data('id')));
		}, 
		
		/**
		 * @Override
		 * 노드 열기
		 */
		unfoldNode: function($node) {
			console.debug('[board] BaseBoardTreeView: unfoldNode call');
			
			// 주의: 트리 구조이므로 반드시 첫번째 자식을 찾아야 한다.
			$node.find('.board-tree-nodes:first').show();
			$node.find('.btnToggleNode:first').removeClass('open').addClass('close');
			this._removeClosedNode(parseInt($node.data('id')));
		},
		
		toggleNode: function($node) {
			var nodeId = parseInt($node.data('id'));
			var boardNodeTree = this.boardTreeNodes.get(nodeId);
			
			if(!boardNodeTree) {
				return;
			}
			
			if(!this.boardTreeNodes.hasChildren(nodeId)) {
				return;
			}
			
			if(this.isClosedNode(boardNodeTree)) {
				this.unfoldNode($node);
			} else {
				this.foldNode($node);
			}
		},
		
		/**
		 * 닫힌상태 노드저장소에 노드(id) 추가
		 */
		_addClosedNode: function(nodeId) {
			var closedNodes = this._getStoredClosedNodes();
			if(_.indexOf(closedNodes, parseInt(nodeId)) < 0) {
				closedNodes.push(nodeId);
				this._storeNodeClosedState(closedNodes);
			}
		},
		
		/**
		 * 닫힌상태 노드저장소에 노드(id) 삭제
		 */
		_removeClosedNode: function(nodeId) {
			var closedNodes = this._getStoredClosedNodes();
			var index = _.indexOf(closedNodes, parseInt(nodeId));
			if(index > -1) {
				closedNodes.splice(index, 1);
				this._storeNodeClosedState(closedNodes);
			}
		},
		
		/**
		 * 로컬 스토리지의 접힘 상태 키 반환
		 */
		_getStoreKey: function() {
			if(this.menuId === null) {
				return;
			}
			
			return GO.session('loginId') + '.board.side.' + this.menuId + '.closedNodes';
		},
		
		_getStoredClosedNodes: function() {
			var stored = GO.util.store.get(this._getStoreKey());
			
			if(!this.getMenuId() || !stored) {
				return [];
			}
			
			if(!_.isArray(stored)) {
				stored = [stored];
			}
			
			return stored;
		},
		
		_storeNodeClosedState: function(closedNodes) {
			var storeKey = this._getStoreKey();
			if(storeKey) {
				GO.util.store.set(storeKey, closedNodes);
			}
		}
	});
	
	return BaseBoardTreeMenuView;
});
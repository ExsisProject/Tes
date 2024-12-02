define('board/components/board_tree/views/base_board_tree', function(require) {
	
	var Backbone = require('backbone');
	var Hogan = require('hogan');
	
	var BoardTreeNode = require('board/models/board_tree_node');
	
	var BaseBoardTreeView = Backbone.View.extend({
		tagName: 'ul', 
		template: '',
		
		initialize: function(options) {
			var opts = options || {};
			this.parentId = opts.parentId; 	// root 노드는 null이다
			// 전체 보드 목록이 항상 전달된다.
			if(opts.nodes instanceof BoardTreeNode.Collection) {
				this.boardTreeNodes = opts.nodes;
			} else {
				this.boardTreeNodes = new BoardTreeNode.Collection(opts.nodes || []);	
			}
		},
		
		render: function() {
			this.$el.addClass('board-tree-nodes');
			
			_.each(this.boardTreeNodes.getNodes(this.parentId), function(node) {
				var boardTreeNode = this.boardTreeNodes.get(node.id);
				var parentId = node.id;
				var $currentNode = this.createNodeElement(boardTreeNode);

				if(boardTreeNode.isFolderNode() && this.boardTreeNodes.hasChildren(parentId)) {
					var childView = this.renderChildView(boardTreeNode);
					
					$currentNode.append(childView.el);
					if(this.isClosedNode(boardTreeNode)) {
						this.foldNode($currentNode);
					}
				}
				
				this.$el.append($currentNode);
			}, this);
			GO.EventEmitter.trigger('common', 'layout:refreshSideScroll');
		},
		
		/**
		 * 개별 노드 렌더링(Override 가능하도록 별도로 구성)
		 */
		renderChildView: function(boardTreeNode) {
			var childView = new this.constructor({"nodes": this.boardTreeNodes, "parentId": boardTreeNode.getNodeId()});
			childView.render();
			return childView
		},
		
		createNodeElement: function(boardTreeNode, options) {
			return $(this._renderTemplate(this.getTemplateVars(boardTreeNode, options)));
		},
		
		/**
		 * 템플릿 변수 반환
		 * 상속받은 객체에서 오버라이드할 수 있도록 구성
		 */
		getTemplateVars: function(boardTreeNode, options) {
			return _.extend({
				"isNew": boardTreeNode.isNew(), 
				"nodeId": boardTreeNode.getNodeId(),
				"nodeType": boardTreeNode.getNodeType(), 
				"nodeValue": boardTreeNode.getNodeValue(), 
				"parentId": boardTreeNode.getParentId(),
				"linkUrl": GO.config('root') + this.getLinkUrl(boardTreeNode), 
				"iconType": this.getIconType(boardTreeNode), 
				"isFolderNode": boardTreeNode.isFolderNode(), 
				"isBoardNode": boardTreeNode.isBoardNode(),
				"isSeperatorNode": boardTreeNode.isSeperatorNode(),
				"isCompanyShareNode" : boardTreeNode.isCompanyShareNode(),
				"shareCompanyName" : boardTreeNode.getCompanyNameByCompanyShares(),
				"isPrivateBoard": boardTreeNode.isPrivateBoard(),
				"isSharedBoard": boardTreeNode.isSharedBoard(),
				"isShared" : boardTreeNode.isSharedBoard() || boardTreeNode.isCompanyShareNode(),
				"hasBoardNewPost": boardTreeNode.hasBoardNewPost(), 
				"managable": boardTreeNode.isManagable(), 
				"hasChildren": this.boardTreeNodes.hasChildren(boardTreeNode.get('id')), 
				"isClosedNode": this.isClosedNode(boardTreeNode), 
				"boardId": boardTreeNode.getBoardId()
			}, options || {});
		}, 
		
		/**
		 * 아이콘 타입 결정
		 */
		getIconType: function(boardTreeNode) {
			var nodeType = boardTreeNode.get('nodeType');
			var result = "";
			
			if(boardTreeNode.isFolderNode()) {
				result = 'folder';
			} else if(boardTreeNode.isBoardNode()) {
				result = boardTreeNode.getBoardModel().getIconType();
				
				/**
				 * 공유된 게시판인지 여부는 BoardModel에서는 판단할 수 없다.
				 * 이 모델을 상속받은 객체에서 구현된 getSharedFlag의 결과에 따라 판단된다.
				 */
				if(boardTreeNode.isSharedBoard()) {
					result += '_share';
				}
				if(boardTreeNode.isAnonymBoard()) {
					result += '_anonym';
				}
			} else if(boardTreeNode.isSeperatorNode()) {
				result = 'delimiter';
			} else if(boardTreeNode.isCompanyShareNode()){
				result = boardTreeNode.getBoardModel().getIconType();
				result += '_share';
			}
			
			return result;
		},
		
		/**
		 * 링크 URL 생성(필요하면 Override)
		 */
		getLinkUrl: function(boardTreeNode) {
			var url = '#';
			if(boardTreeNode.isBoardNode()) {
				url = 'board/' + boardTreeNode.getBoardId();
			}
			
			return url;
		}, 
		
		/**
		 * 노드가 닫힌 상태인지 여부 반환
		 */
		isClosedNode: function(boardTreeNode) {
			return false;
		}, 
		
		/**
		 * 노드 접기(하위 노드를 
		 */
		foldNode: function($node) {
			// 하위 뷰에서 구현
		}, 
		
		/**
		 * 노드 열기
		 */
		unfoldNode: function($node) {
			// 하위 뷰에서 구현
		},
		
		/**
		 * 부모의 아이디를 반환
		 */
		getParentId: function() {
			return this.parentId || null;
		},
		
		/**
		 * 루트 노드인지를 반환
		 */
		isRootNode: function() {
			return this.getParentId() === null;
		},
		
		_renderTemplate: function() {
			var compiled = Hogan.compile(_.result(this, 'template'));
			return compiled.render.apply(compiled, arguments);
		}
	});
		
	return BaseBoardTreeView;
	
});
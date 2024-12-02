define('asset/components/asset_tree/views/base_asset_tree', function(require) {
	
	var Backbone = require('backbone');
	var Hogan = require('hogan');
	
	var TreeNode = require('board/models/board_tree_node');

	var BaseAssetTreeView = Backbone.View.extend({
		tagName: 'ul', 
		template: '',
		
		initialize: function(options) {
			var opts = options || {};
			this.parentId = opts.parentId; 	// root 노드는 null이다
			// 전체 보드 목록이 항상 전달된다.
			if(opts.nodes instanceof TreeNode.Collection) {
				this.assetTreeNodes = opts.nodes;
			} else {
				this.assetTreeNodes = new TreeNode.Collection(opts.nodes || []);
			}
		},
		
		render: function() {
			this.$el.addClass('board-tree-nodes');

			_.each(this.assetTreeNodes.getNodes(this.parentId), function(node) {
				var boardTreeNode = node;
				var $currentNode = this.createNodeElement(boardTreeNode);
				this.$el.append($currentNode);
			}, this);
		},
		
		/**
		 * 개별 노드 렌더링(Override 가능하도록 별도로 구성)
		 */
		renderChildView: function(boardTreeNode) {
			var childView = new this.constructor({"nodes": this.assetTreeNodes, "parentId": boardTreeNode.getNodeId()});
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

			var node = boardTreeNode.toJSON();
			return _.extend({
				"nodeId": node.id,
				"nodeValue": node.nodeValue,
				"parentId": node.parentId,
				//"iconType": this.getIconType(boardTreeNode),
				"useRental": node.useRental,
				"managable": node.managable,
				"hasChildren": node.hasChildren,
				"isCompanyShared" : !!node.isCompanyShared,
				"isClosedNode": true
			}, options || {});
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
		
	return BaseAssetTreeView;
	
});
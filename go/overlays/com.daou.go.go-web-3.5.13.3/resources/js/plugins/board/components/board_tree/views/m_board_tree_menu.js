define('board/components/board_tree/views/m_board_tree_menu', function(require) {
	var GO = require('app');
	var BoardTreeNode = require('board/models/board_tree_node');
	
	var BaseBoardTreeMenuView = require('board/components/board_tree/views/base_board_tree_menu');
	var boardNodeTpl = require('text!board/components/board_tree/templates/m_board_tree_menu.html');
	
	var MobileBoardTreeMenuView = BaseBoardTreeMenuView.extend({
		template: boardNodeTpl,
		
		events: {
			"vclick a.node-value": "_clickAnchorNodeValueHandler", 
		}, 
		
		/**
		 * @Override
		 * 템플릿 변수 반환
		 */
		getTemplateVars: function(boardTreeNode, options) {
			var tplVars = BaseBoardTreeMenuView.prototype.getTemplateVars.apply(this, arguments);
			
			// 게시판 일때는 nodeId로 게시판 ID를 넣어준다.
			if(boardTreeNode.isBoardNode() || boardTreeNode.isCompanyShareNode()) {
				tplVars.nodeId = boardTreeNode.getBoardId();
			}
			
			return tplVars
		}, 
		
		getLinkUrl: function(boardTreeNode) {
			var url = '#';
			if(boardTreeNode.isBoardNode() || boardTreeNode.isCompanyShareNode()) {
				url = 'board/' + boardTreeNode.getBoardId();
			}
			
			return url;
		}, 
		
		_clickAnchorNodeValueHandler: function(e) {
			
			var $target = $(e.currentTarget);
			var $node = $target.closest('li');
			var nodeType = $node.data('type');
			var url = $target.attr('href').replace(GO.config('root'), "");
			
			e.preventDefault();
			e.stopImmediatePropagation();
			
			switch(nodeType) {
			case BoardTreeNode.NODETYPE_COMPANY_SHARE:
			case BoardTreeNode.NODETYPE_BOARD:		// 게시판 노드일 경우
				GO.router.navigate(url, {trigger: true, pushState: true});
				break;
			case BoardTreeNode.NODETYPE_FOLDER:		// 폴더 노드일 경우
				this.toggleNode($node);
				// 스크롤 갱신
				GO.EventEmitter.trigger('common', 'layout:refreshSideScroll');
				break;
			case BoardTreeNode.NODETYPE_SEPERATOR:	// 구분선일 경우
			default:
				// 아무런 액션도 하지 않는다.
				break;
			}
			
			return false;
		}
	});
	
	return MobileBoardTreeMenuView;
});
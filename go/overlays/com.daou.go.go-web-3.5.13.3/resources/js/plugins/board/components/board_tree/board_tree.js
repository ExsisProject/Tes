/**
 * 게시판 트리형 팩토리 객체
 * 
 * 게시판의 트리형 표현과 관계되는 모든 서비스를 제공하는 인터페이스 역할 수행한다.
 */
define('board/components/board_tree/board_tree', function(require) {
	
	var BaseBoardTreeView = require('board/components/board_tree/views/base_board_tree');
	var BoardTreeSimpleView = require('board/components/board_tree/views/board_tree_simple');
	var BoardTreeMenuView = require('board/components/board_tree/views/board_tree_menu');
	var MobileBoardTreeMenuView = require('board/components/board_tree/views/m_board_tree_menu');
	var BoardTreeConfigView = require('board/components/board_tree/views/board_tree_config');
	var renderBoardTreeMenuTpl = require('hgn!board/components/board_tree/templates/board_tree_menu');
	
	return {
		BaseBoardTreeView: BaseBoardTreeView,
		BoardTreeSimpleView : BoardTreeSimpleView,
		BoardTreeMenuView: BoardTreeMenuView,
		BoardTreeConfigView: BoardTreeConfigView, 
		MobileBoardTreeMenuView: MobileBoardTreeMenuView,
		
		/**
		 * 게시판 트리의 노드 템플릿 렌더링
		 */
		renderBoardTreeMenuNode: function() {
			return renderBoardTreeMenuTpl.apply(undefined, arguments);
		}
	};
	
});
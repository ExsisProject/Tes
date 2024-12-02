define(function(require) {
	
	var GO = require('app');
	var BoardTree = require('board/models/board_tree');
	var CompanyBoardTreeNode = require('board/models/company_board_tree_node');
	
	/**
	 * DeptBoardTreeModel 모델
	 */
	var CompanyBoardTreeModel = BoardTree.Model.extend({
		/**
		 * @Override
		 */
		getBoardTreeNodes: function() {
			return new CompanyBoardTreeNode.Collection(this.getBoards());
		},
		
		getCompanyId: function() {
			return this.get('companyId');
		},
		
		getCompanyName: function() {
			return this.get('companyName');
		}
	});
	
	var CompanyBoardTreeList = BoardTree.Collection.extend({
		model: CompanyBoardTreeModel,
		url: function() {
			// 전사게시판 메뉴 목록
			// company_board_tree_node.js의 컬렉션 URL과 헷갈리지 말것.
			return GO.config('contextRoot') + 'api/board/company/boardsWithIp';
		}
	});
	
	return {
		Model: CompanyBoardTreeModel, 
		Collection: CompanyBoardTreeList
	};
	
});
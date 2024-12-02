define(function(require) {
	
	var GO = require('app');
	var BoardTree = require('board/models/board_tree');
	var DeptBoardTreeNode = require('board/models/dept_board_tree_node');
	
	/**
	 * DeptBoardTreeModel 모델
	 */
	var DeptBoardTreeModel = BoardTree.Model.extend({
		/**
		 * @Override
		 */
		getBoardTreeNodes: function() {
			return new DeptBoardTreeNode.Collection(this.getBoards());
		},
		
		getDeptId: function() {
			return this.get('deptId');
		},
		
		getDeptName: function() {
			return this.get('deptName');
		}, 
		
		isDeleted: function() {
			return this.get('deleted') || false;
		},
		
		isManagable: function() {
			return this.get('managable') || false;
		}, 
		
		/**
		 * 하위부서 게시판을 조회할 수 있는가?
		 */
		isAccessibleSubDeptBoards: function() {
			return !!this.get('containsLowRank');
		}
	});
	
	var DeptBoardTreeList = BoardTree.Collection.extend({
		model: DeptBoardTreeModel,
		
		url: function() {
			return GO.config('contextRoot') + 'api/department/boards';
		},
		
		/**
		 * 하위부서 게시판을 조회할 수 있는지 여부 반환
		 * - 조직도를 사용할 수 없으면 불가
		 * - 접근가능한 부서들 중 하나라도 관리가능하면 하위게시판을 조회할 수 있으면 가능.
		 */
		isAccessableSubDeptBoards: function() {
			var result = false;
			
			// 조직도를 사용할 수 없으면 조회불가
			if(!GO.session('useOrg')) {
				return result;
			}
			
			this.each(function(model) {
				if(model.isManagable() && model.isAccessibleSubDeptBoards()) {
					result = true;
				}
			});
			
			return result;
		}
	});
	
	return {		
		Model: DeptBoardTreeModel, 
		Collection: DeptBoardTreeList
	};
	
});
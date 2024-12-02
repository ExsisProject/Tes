define(function(require) {
	
	var Backbone = require('backbone');
	var GO = require('app');
	var BoardTreeNode = require('board/models/board_tree_node');
	
	/**
	 * BoardTreeModel 모델
	 */
	var BoardTreeModel = Backbone.Model.extend({
		
		getBoards: function() {
			 return this.get('boards') || [];
		},
		
		getBoardTreeNodes: function() {
			return new BoardTreeNode.Collection(this.getBoards());
		},
		
		/**
		 * 게시판이 있는가?
		 */
		hasBoards: function() {
			return this.getBoards().length > 0;
		},
		
		/**
		 * 글쓰기 가능한 보드 반환
		 */
		getWritableBoards: function() {
			return _.filter(this.getBoards(), function(boardTreeNode) {
				return boardTreeNode.actions && boardTreeNode.actions.writable === true;
			}) || [];
		},
		
		/**
		 * 글쓰기 가능한 게시판이 있는가?
		 */
		hasWritableBoards: function() {
			return this.getWritableBoards().length > 0;
		}, 
		
		/**
		 * 중지된 게시판이 있는가?
		 */
		hasClosedBoards: function() {
			// TODO: 구현 예정
			return this.get('hasClosedBoard') === true;
		}
	});
	
	var BoardTreeList = Backbone.Collection.extend({
		
		/**
		 * 부서에 게시판이 존재하는가?
		 */
		hasBoards: function() {
			var result = false;
			
			this.each(function(model) {
				if(model.hasBoards()) {
					result = true;
				}
			});
			
			return result;
		},
		
		/**
		 * 부서에 글쓰기 가능한 게시판이 존재하는가?
		 */
		hasWritableBoards: function() {
			var result = false;
			
			this.each(function(model) {
				if(model.hasWritableBoards()) {
					result = true;
				}
			});
			
			return result;
		},
		
		/**
		 * 부서들 중 중지된 게시판이 있는지 여부 반환
		 */
		hasClosedBoards: function() {
			var result = false;
			
			this.each(function(model) {
				if(model.hasClosedBoards()) {
					result = true;
				}
			});
			
			return result;
		}
	});
	
	return {
		Model: BoardTreeModel, 
		Collection: BoardTreeList
	};
	
});
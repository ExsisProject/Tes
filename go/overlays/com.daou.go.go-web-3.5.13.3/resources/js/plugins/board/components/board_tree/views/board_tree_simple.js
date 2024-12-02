define('board/components/board_tree/views/board_tree_simple', function(require) {
	
	var when = require('when');
	var GO = require('app');
	var BaseBoardTreeView = require('board/components/board_tree/views/base_board_tree');
	var BoardTreeNode = require('board/models/board_tree_node');
	var Constants = require('board/constants');
	
	var commonLang = require('i18n!nls/commons'); 
	var boardLang = require('i18n!board/nls/board');
    var worksLang = require("i18n!works/nls/works");
	var Tpl = require('text!board/components/board_tree/templates/board_tree_simple.html');
	
	function renderEmptyMessage() {
		var emptyMsgBuff = [];
		
		emptyMsgBuff.push('<li class="empty-message">');
		emptyMsgBuff.push('<p class="data_null">');
		emptyMsgBuff.push('<span class="ic_data_type ic_no_contents"></span>');
		emptyMsgBuff.push('<span class="txt">');
		emptyMsgBuff.push(worksLang['데이터가 없습니다']);
		emptyMsgBuff.push('</span>');
		emptyMsgBuff.push('<br />');
		emptyMsgBuff.push('</p>');
		emptyMsgBuff.push('</li>');
		
		return emptyMsgBuff.join('');
	}

	
	var BoardTreeSimpleView = BaseBoardTreeView.extend({
		template: Tpl,
		events: {
			"click .btnToggleNode": "_onClickToggleNode",
			"click .board_name" : "_onClickBoardNode"
		},
		initialize: function(options) {
			if(_.isFunction(options.onClickBoardNodeCallBack)){ //외부주입
				this.onClickBoardNodeCallBack = options.onClickBoardNodeCallBack;
			}
			BaseBoardTreeView.prototype.initialize.apply(this, arguments);
		},
		
		render: function() {
			BaseBoardTreeView.prototype.render.apply(this, arguments);
			if(this.isRootNode()) {
				this._renderEmptyMessageIfNoData();
			}
		},
		
		/**
		 * 개별 노드 렌더링(Override 가능하도록 별도로 구성)
		 */
		renderChildView: function(boardTreeNode) {
			var childView = new this.constructor({"nodes": this.boardTreeNodes, "parentId": boardTreeNode.getNodeId(), "onClickBoardNodeCallBack" : this.onClickBoardNodeCallBack});
			childView.render();
			return childView;
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
		
		_onClickBoardNode : function(e){
			console.debug('[board] BoardTreeSimpleView: _onClickBoardNode call');
			// tree 구조이므로 이벤트가 위 노드로 전파될 수 있음에 주의
			e.stopImmediatePropagation();
			var $target = $(e.currentTarget);
			var boardId = $target.data('board-id');
			var $node = $target.closest('li');
			var nodeType = $node.data('type');
			if(nodeType !== Constants.NODETYPE_BOARD){
				return;
			}
			this.onClickBoardNodeCallBack(this, e, boardId);
		},
		
		onClickBoardNodeCallBack : function(){
			console.log('지정된 callback 없음');
		},
		
		/**
		 * @Override
		 * 노드 접기
		 */
		foldNode: function($node) {
			console.debug('[board] BoardTreeSimpleView: foldNode call');
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
			console.debug('[board] BoardTreeSimpleView: unfoldNode call');
			
			// 주의: 트리 구조이므로 반드시 첫번째 자식을 찾아야 한다.
			$node.find('.board-tree-nodes:first').show();
			$node.find('.btnToggleNode:first').removeClass('ic_stair_open').addClass('ic_stair_close');
			this._removeClosedNode(parseInt($node.data('id')));
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
		 * @Override
		 */
		getIconType: function(boardTreeNode) {
			var nodeType = boardTreeNode.get('nodeType');
			var result;
			
			if(boardTreeNode.isFolderNode()) {
				result = 'folder';
			} else if(boardTreeNode.isBoardNode()) {
				result = 'board';
			} else if(boardTreeNode.isSeperatorNode()) {
				result = 'delimiter';
			}
			
			return result;
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
		 * 등록된 노드 없음 메시지 삭제
		 */
		_removeEmptyMessage: function() {
			if(!this.isRootNode()) {
				return;
			}
			
			this._getEmptyMessageEl().remove();
		},
		
		/**
		 * 등록된 노드 없음 메시지 엘리먼트 반환
		 */
		_getEmptyMessageEl: function() {
			return this.$el.find('.empty-message');
		}
	});
		
	return BoardTreeSimpleView;
	
});
define('board/components/board_tree/views/board_tree_menu', function(require) {
	var GO = require('app');
	var BoardTreeNode = require('board/models/board_tree_node');
	
	var BaseBoardTreeMenuView = require('board/components/board_tree/views/base_board_tree_menu');
	var boardNodeTpl = require('text!board/components/board_tree/templates/board_tree_menu.html');
	
	var commonLang = require('i18n!nls/commons');
	var boardLang = require('i18n!board/nls/board');
	
	require('jquery.go-popup');
	
	var STORE_KEY = GO.session('loginId') + '.board.side.closedNodes';
	var lang = {
		"confirm" : commonLang['확인'],
		"input_placeholder" : boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.'], 
		"alert_check_editor" : boardLang['현재 작성중인 내용이 있습니다.<br>화면 이동 시 작성 중인 내용은 사라집니다.<br>이동하시겠습니까?'],
		"cancel" : commonLang['취소']
	};
	
	var BoardTreeMenuView = BaseBoardTreeMenuView.extend({
		template: boardNodeTpl,
		
		events: {
			"click .btnToggleNode": "_onClickToggleNode", 
			"click a.node-value": "_clickAnchorNodeValueHandler", 
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
		
		
		/**
		 * 노드 접기/펼치기 버튼 클릭 이벤트 핸들러
		 */
		_onClickToggleNode: function(e) {
			var $target = $(e.currentTarget);
			var $node = $target.closest('li');
			
			// tree 구조이므로 이벤트가 위 노드로 전파될 수 있음에 주의
			e.stopImmediatePropagation();
			
			this.toggleNode($node);
		},
		
		/**
		 * 각 노드의 값(nodeValue, 혹은 출력 문자 부분) 영역을 클릭했을 경우 핸들러
		 * 
		 * board의 side에 있는 소스를 copy하여 수정(리팩토링 필요하나 우선 이렇게 처리)
		 */
		_clickAnchorNodeValueHandler: function(e) {
			var $target = $(e.currentTarget);
			var $node = $target.closest('li');
			var $section = $target.closest('section.lnb');
			var nodeType = $node.data('type');
			var url = $target.attr('href').replace(GO.config('root'), "");
			
			e.preventDefault();
			e.stopImmediatePropagation();
			switch(nodeType) {
			case BoardTreeNode.NODETYPE_FOLDER:		// 폴더 노드일 경우
				this.toggleNode($node);
				break;
			case BoardTreeNode.NODETYPE_COMPANY_SHARE:
			case BoardTreeNode.NODETYPE_BOARD:		// 게시판 노드일 경우
				if(GO.util.hasActiveEditor()) {
					GO.util.editorConfirm(function() {
						GO.router.navigate(url, {trigger: true, pushState: true});
					});
				} else if($('#feedContent').val() && $('#feedContent').val() != lang.input_placeholder) {
					$.goPopup({
						title : '',
						message : lang.alert_check_editor,
						modal : true,
						buttons : [{
							"btext" : lang.confirm,
							"btype" : 'confirm',
							"callback" : function() {
								GO.router.navigate(url, {trigger: true, pushState: true});
							}
						}, {
							"btext" : lang.cancel,
							"btype" : 'normal'
						}]
					});
				} else {
					GO.router.navigate(url, {trigger: true, pushState: true});
				}
				break;
			case BoardTreeNode.NODETYPE_SEPERATOR:	// 구분선일 경우
			default:
				// 아무런 액션도 하지 않는다.
				break;
			}
			
			return false;
		}
		
	});
	
	return BoardTreeMenuView;
});
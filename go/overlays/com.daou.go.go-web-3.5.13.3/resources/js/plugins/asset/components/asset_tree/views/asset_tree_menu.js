define('asset/components/asset_tree/views/asset_tree_menu', function(require) {
	var GO = require('app');

	var BaseAssetTreeMenuView = require('asset/components/asset_tree/views/base_asset_tree_menu');
	var assetNodeTpl = require('text!asset/components/asset_tree/templates/asset_tree_menu.html');
	
	require('jquery.go-popup');
	
	var AssetTreeMenuView = BaseAssetTreeMenuView.extend({
		template: assetNodeTpl,
		
		events: {
			"click .btnToggleNode": "_onClickToggleNode", 
			"click a.go_boards": "_clickAnchorNodeValueHandler",
			"click span.btn-setting": "_clickedSettingNode"
		}, 

		/**
		 * @Override
		 * 템플릿 변수 반환
		 */
		getTemplateVars: function(boardTreeNode, options) {
			var tplVars = BaseAssetTreeMenuView.prototype.getTemplateVars.apply(this, arguments);
			return tplVars
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

			var isOpened = $target.hasClass("close") ? true : false;
			var nodeId = $node.attr("data-id");
			this.$el.trigger("toggle", [$node, isOpened, nodeId]);
		},
		
		/**
		 * 각 노드의 값(nodeValue, 혹은 출력 문자 부분) 영역을 클릭했을 경우 핸들러
		 * 
		 * board의 side에 있는 소스를 copy하여 수정(리팩토링 필요하나 우선 이렇게 처리)
		 */
		_clickAnchorNodeValueHandler: function(e) {

			var $target = $(e.currentTarget);
			var $node = $target.closest('li');

			e.preventDefault();
			e.stopImmediatePropagation();

			var parentId = $target.attr("data-parent");
			var nodeId = $target.attr("data-id");
			this.$el.trigger("itemClicked", [$node, parentId, nodeId]);
			
			return false;
		},

		_clickedSettingNode: function(e) {

			var $target = $(e.currentTarget);
			var nodeId = $target.attr("data-id");

			this.$el.trigger("configClicked", [nodeId]);
		},

		open: function(index) {

			if (index < 0) {
				return;
			}
			var $target = $(this.$el.children()[index]);
			var nodeId = $target.attr("data-id");
			this.$el.trigger("toggle", [$target, true, nodeId]);
			$target.find('.btnToggleNode:first').removeClass('open').addClass('close');
		}
	});
	
	return AssetTreeMenuView;
});
define('asset/components/asset_tree/asset_tree', function(require) {

	var BaseAssetTreeView = require('asset/components/asset_tree/views/base_asset_tree');
	var AssetTreeMenuView = require('asset/components/asset_tree/views/asset_tree_menu');

	return {
		BaseAssetTreeView: BaseAssetTreeView,
		AssetTreeMenuView: AssetTreeMenuView
	};
	
});
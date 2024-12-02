(function() {
	
	define([
	        "asset/views/layouts/defaults"
    ], 
    
    function(
    		DefaultLayout
    ) {
		var AssetController = (function() { 
			var Controller = function() {
				
			};

			Controller.prototype = {
			
				render: function() {
					require(["asset/views/home_list"], function(AssetAppView) {
						var layout = DefaultLayout.create();
						layout.initSide();
						layout.render().done(function(layout) {
							var content = layout.getContentElement();
                            content.addClass('go_asset');
							var view = new AssetAppView();
							content.html(view.el);
							view.render();
						});
					});
				},
				renderByIdAssetAdmin : function(assetId,type) {
					require(["asset/views/asset_admin_wrap"], function(AssetAdmin) {
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							AssetAdmin.render({
								assetId : assetId,
								type : type
							});
							content.append(AssetAdmin.el);
						});
					});
				},
				renderByIdAssetItemCreate : function(assetId){
					require(["asset/views/asset_item_create"], function(AssetCreate) {
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							AssetCreate.render({
								assetId : assetId
							});
							content.append(AssetCreate.el);
						});
					});
				},
				renderByIdAssetItemList : function(assetId,type){
					require(["asset/views/asset_item_list"], function(AssetList) {
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
                            content.addClass('go_asset');
							var view = new AssetList({
								assetId : assetId,
								type : type
							});
							content.html(view.el);
							view.render();
						});
					});
				},
				renderByIdAssetItemModify : function(assetId,itemId){
					require(["asset/views/asset_item_create"], function(AssetCreate) {
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							AssetCreate.render({
								assetId : assetId,
								itemId : itemId
							});
							content.append(AssetCreate.el);
						});
					});
				},
				renderByIdAssetWeekly : function(assetId,itemId,type,fromDate){
					require(["asset/views/asset_weekly"], function(AssetWeekly) {
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							var view = new AssetWeekly({
								assetId : assetId,
								itemId : itemId,
								type : type,
								fromDate : fromDate
							});
							content.html(view.el);
							view.render();
						});
					});
				},
				renderItemRental : function(assetId,itemId,type){
					require(["asset/views/rental_reserv_create"], function(itemCreate) {
						DefaultLayout.render().done(function(layout) {
							var view = new itemCreate({
								assetId : assetId,
								itemId : itemId,
								type : type,						
								status : 'create'
							});
							view.render();
						});
					});
				},
				renderItemReserv : function(assetId,itemId,type,selectDate,selectTime,endTime){
					require(["asset/views/rental_reserv_create"], function(itemCreate) {
						DefaultLayout.render().done(function(layout) {
							var view = new itemCreate({
								el: $('#content'),
								assetId : assetId,
								itemId : itemId,
								type : type,
								selectDate : selectDate,
								selectTime : selectTime,
								endTime : endTime,
								status : 'create'
							});
							view.render();							
						});
					});
				},
				renderItemRentalStatus : function(assetId,itemId,type){
					require(["asset/views/rental_reserv_create"], function(itemCreate) {
						DefaultLayout.render().done(function(layout) {
							var view = new itemCreate({
								el: $('#content'),
								assetId : assetId,
								itemId : itemId,
								type : type,
								status : 'modify'
							});
							view.render();
						});
					});
				},
				renderItemReservationStatus : function(assetId,itemId,type,reservationId){
					require(["asset/views/rental_reserv_create"], function(itemCreate) {
						DefaultLayout.render().done(function(layout) {
							var view = new itemCreate({
								el: $('#content'),
								assetId : assetId,
								itemId : itemId,
								type : type,
								status : 'modify',
								reservationId : reservationId
							});
							view.render();	
						});
					});
				}
			};
			
			return Controller;
		})();
		
		return new AssetController();
	});
	
}).call(this);
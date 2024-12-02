(function() {
	
	define([
	        "views/layouts/mobile_default",
	        "i18n!nls/commons",
	        "asset/views/mobile/m_side"
    ], 
    function(
    		MobileLayout,
    		commonLang,
    		SideView
    ) {
		var BoardController = (function() {
			var appName = 'asset';
			var LayoutView = MobileLayout.create();
			var SideMenuView = SideView.create(appName);
			
			
			
			var Controller = function() {
			};
			
			Controller.prototype = {
				renderSideMenu : function() {
					if($('body').data('sideApp') != appName) {
						SideMenuView.render().done(function(sideMenu) {
							var sideEl = LayoutView.getSideContentElement().append(sideMenu.el);
							GO.EventEmitter.trigger('common', 'layout:initSideScroll', this);
							sideEl.parent().hide();
						});
					} else {
						return;
					}
				},
				render: function() {
					require(["asset/views/mobile/m_home_list"], function(HomeListView) {
						LayoutView.render(appName, false).done(function(layout) {
							HomeListView.render();
							
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderByIdAssetItemList : function(assetId,type){
					require(["asset/views/mobile/m_asset_item_list"], function(assetListView) {
						LayoutView.render(appName, false).done(function(layout) {
							assetListView.render({
								assetId : assetId,
								type : type
							});
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderByCalAssetItemList : function(assetId,startTime,endTime,queryString){
					require(["asset/views/mobile/m_asset_item_list"], function(assetListView) {
						LayoutView.render(appName, false).done(function(layout) {
							assetListView.render({
								assetId : assetId,
								type : 'calendar',
								startTime : startTime,
								endTime : endTime,
								queryString : queryString
							});
						});
					});
				},
				renderItemRental : function(assetId,itemId,type,reqType){
					require(["asset/views/mobile/m_rental_reservation"], function(itemCreate) {
						LayoutView.render(appName, false).done(function(layout) {
							var view = new itemCreate({
								assetId : assetId,
								itemId : itemId,
								type : type,
								reqType : reqType,
								status : 'create'
							});
							LayoutView.getContentElement().html(view.el);
							view.render();
							
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderItemReserv : function(assetId,itemId,type,selectDate,reqType){
					require(["asset/views/mobile/m_rental_reservation"], function(itemCreate) {
						LayoutView.render(appName, false).done(function(layout) {
							var view = new itemCreate({
								assetId : assetId,
								itemId : itemId,
								type : type,
								reqType : reqType,
								selectDate : selectDate,
								status : 'create'
							});
							LayoutView.getContentElement().html(view.el);
							view.render();
							
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderItemCalReserv : function(assetId,itemId,startTime,endTime,reqType,queryString){
					require(["asset/views/mobile/m_rental_reservation"], function(itemCreate) {
						LayoutView.render(appName, false).done(function(layout) {
							var view = new itemCreate({
								assetId : assetId,
								itemId : itemId,
								type : 'reservation',								
								status : 'create',
								startTime : startTime,
								endTime : endTime,
								reqType : reqType,
								queryString : queryString
							});
							LayoutView.getContentElement().html(view.el);
							view.render();
						});
					});
				},
				renderItemRentalStatus : function(assetId,itemId,type){
					require(["asset/views/mobile/m_rental_reservation"], function(itemCreate) {
						LayoutView.render(appName, false).done(function(layout) {
							var view = new itemCreate({
								assetId : assetId,
								itemId : itemId,
								type : type,
								status : 'modify'
							});
							LayoutView.getContentElement().html(view.el);
							view.render();
							
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderItemReservationStatus : function(assetId,itemId,type,reservationId){
					require(["asset/views/mobile/m_rental_reservation"], function(itemCreate) {
						LayoutView.render(appName, false).done(function(layout) {
							var view = new itemCreate({
								assetId : assetId,
								itemId : itemId,
								type : type,
								reservationId : reservationId,
								status : 'modify'
							});
							LayoutView.getContentElement().html(view.el);
							view.render();
							
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderMonthByitemId : function(assetId,itemId,name,selectDate){
					require(["asset/views/mobile/m_monthly_item"], function(itemCreate) {
						LayoutView.render(appName, false).done(function(layout) {
							itemCreate.render({
								assetId : assetId,
								itemId : itemId,
								name : name,
								selectDate : selectDate
							});
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderSearchResult : function(){
					require(["asset/views/mobile/m_search_result"], function(searchResult) {
						LayoutView.render(appName, false).done(function(layout) {
							searchResult.render();
							Controller.prototype.renderSideMenu();
						});
					});
				}
			};
			
			return Controller;
		})();
		
		return new BoardController();
	});
	
}).call(this);
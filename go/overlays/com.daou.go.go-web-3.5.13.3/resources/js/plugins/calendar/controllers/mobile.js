(function() {
	
	define([
            "views/layouts/mobile_default",
	        "i18n!nls/commons",
	        "calendar/views/mobile/m_side"
    ], 
    function(
    		MobileLayout,
    		commonLang,
    		SideView
    ) {
		var BoardController = (function() {
			var appName = 'calendar';
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
					require(["calendar/views/mobile/m_monthly_list"], function(MonthlyListView) {
						LayoutView.render(appName).done(function(layout) {
							Controller.prototype.renderSideMenu();
							MonthlyListView.render({});
						});
					});
				},
				renderByCalendarId: function(selectDate) {
					require(["calendar/views/mobile/m_daily_list"], function(DailyListView) {
						LayoutView.render(appName).done(function(layout) {
							Controller.prototype.renderSideMenu();
							DailyListView.render({selectDate:selectDate});
						});
					});
				},
				renderMonthByCalendarId : function(selectDate) {
					require(["calendar/views/mobile/m_monthly_list"], function(MonthlyListView) {
						LayoutView.render(appName).done(function(layout) {
							Controller.prototype.renderSideMenu();
							MonthlyListView.render({selectDate:selectDate});
						});
					});
				},
				renderSearchResult : function(){
					require(["calendar/views/mobile/m_search_result"], function(searchResult) {
						LayoutView.render(appName).done(function(layout) {
							var content = layout.getContentElement();
							searchResult.render();
							content.append(searchResult.el);
						});
					});
				},
				renderWrite : function(eventDate){
					require(["calendar/views/mobile/m_calendar_write"], function(WriteView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new WriteView({eventDate : eventDate});
							LayoutView.getContentElement().html(view.el);
							view.render();
						});
					});
				},
				renderCopiedWrite : function(calendarId, eventId) {
					require(["calendar/views/mobile/m_calendar_write"], function(WriteView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new WriteView({calendarId : calendarId, eventId : eventId, isCopied : true});
							LayoutView.getContentElement().html(view.el);
							view.render();
						});
					});
				},
				renderAssetWrite : function(startTime,endTime,queryString){
					require(["calendar/views/mobile/m_calendar_write"], function(WriteView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new WriteView({
								startTime : startTime,
								endTime : endTime,
								queryString : queryString
							});
							LayoutView.getContentElement().html(view.el);
							view.render();
						});
					});
				},
				renderWriteModify : function(calendarId,eventId){
					require(["calendar/views/mobile/m_calendar_write"], function(WriteView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new WriteView({
								calendarId : calendarId,
								eventId : eventId,
								type : 'edit'
							});
							LayoutView.getContentElement().html(view.el);
							view.render();
						});
					});
				},
				renderView : function(calendarId,eventId,calName){
					require(["calendar/views/mobile/m_calendar_view"], function(EventView) {
						LayoutView.render().done(function(layout) {
							var view = new EventView({
								calendarId : calendarId,
								eventId : eventId
							});
							LayoutView.getContentElement().html(view.el);
							view.render();
							layout.getSearchWrapElement().hide();
						});
					});
				},
				commentList : function(calendarId,eventId){
					require(["calendar/views/mobile/m_calendar_comment"], function(EventView) {
						LayoutView.render().done(function(layout) {
							var view = new EventView({
								calendarId : calendarId,
								eventId : eventId
							});
							LayoutView.getContentElement().html(view.el);
							view.fetch().done(function() {
								view.render();
							});
						});
					});
				},
				followView : function(calendarId,followLinkId){
					require(["calendar/views/mobile/m_calendar_follows"], function(FollowsView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new FollowsView({
								calendarId : calendarId,
								followLinkId : followLinkId
							});
							LayoutView.getContentElement().html(view.el);
							view.fetch().done(function() {
								view.render();
							});
						});
					});
                }
			};
			
			return Controller;
		})();
		
		return new BoardController();
	});
	
}).call(this);
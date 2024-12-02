(function() {
	
	define([
	        "views/layouts/mobile_default",
	        "i18n!nls/commons",
	        "report/views/mobile/m_side"
    ], 
    function(
    		MobileLayout,
    		commonLang,
    		SideView
    ) {
		var BoardController = (function() {
			var appName = 'report';
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
					require(["report/views/mobile/m_home_list"], function(HomeListView) {
						LayoutView.render(appName).done(function(layout) {
							(new HomeListView()).render();
							Controller.prototype.renderSideMenu();
						});
					});
				},
				
				renderReports: function(folderId) {
				    require(["report/views/mobile/m_reports"], function(ReportsView) {
				        LayoutView.render(appName).done(function(layout) {
				            var reportView = new ReportsView({folderId : folderId});
							reportView.render();
				            Controller.prototype.renderSideMenu();

				        });
				    });
				},
				
				renderReportDetail: function(folderId, reportId) {
				    require(["report/views/mobile/m_report_detail"], function(ReportDetailView) {
				        LayoutView.render(appName).done(function(layout) {
				            var reportView = new ReportDetailView({reportId : reportId});
				            reportView.render();
							layout.getSearchWrapElement().hide();
				            Controller.prototype.renderSideMenu();
				        });
				    });
				},
				
				renderReportComments: function(folderId, reportId) {
				    require(["report/views/mobile/m_report_comments"], function(ReportCommentsView) {
				        LayoutView.render(appName).done(function(layout) {
				            var reportCommentsView = new ReportCommentsView({reportId : reportId});
				            reportCommentsView.render();
				            Controller.prototype.renderSideMenu();
				        });
				    });
				},
				
				renderSeries : function(seriesId){
                    require(["report/views/mobile/m_series"], function(SeriesView) {
                        LayoutView.render(appName).done(function(layout) {
                            var seriesView = new SeriesView({seriesId : seriesId});
                            seriesView.render();
                            Controller.prototype.renderSideMenu();
                        });
                    });
				},
				
				renderSeriesComments : function(seriesId){
				    require(["report/views/mobile/m_series_comments"], function(SeriesCommentsView) {
				        LayoutView.render(appName).done(function(layout) {
				            var seriesCommentsView = new SeriesCommentsView({seriesId : seriesId});
				            seriesCommentsView.render();
				            Controller.prototype.renderSideMenu();
				        });
				    });
				},
				
				renderSeriesReport : function(seriesId, reportId){
                    require(["report/views/mobile/m_report_detail"], function(ReportDetailView) {
                        LayoutView.render(appName).done(function(layout) {
                            var reportView = new ReportDetailView({reportId : reportId});
                            reportView.render();
							layout.getSearchWrapElement().hide();
                            Controller.prototype.renderSideMenu();
                        });
                    });
				},
				
				renderSeriesReportComments : function(seriesId, reportId){
                    require(["report/views/mobile/m_report_comments"], function(ReportCommentsView) {
                        LayoutView.render(appName).done(function(layout) {
                            var reportCommentsView = new ReportCommentsView({reportId : reportId});
                            reportCommentsView.render();
                            Controller.prototype.renderSideMenu();
                        });
                    });
				},
				
				renderReportWrite : function(folderId){
				    require(["report/views/mobile/m_report_form"], function(ReportFormView) {
				        LayoutView.render(appName).done(function(layout) {
				            var reportFormView = new ReportFormView({folderId : folderId});
				            reportFormView.render();
				            Controller.prototype.renderSideMenu();
				        });
				    });
				},
				
				renderReportEdit : function(folderId, reportId){
				    require(["report/views/mobile/m_report_form"], function(ReportFormView) {
				        LayoutView.render(appName).done(function(layout) {
				            var reportFormView = new ReportFormView({folderId : folderId, reportId : reportId});
				            reportFormView.render();
				            Controller.prototype.renderSideMenu();
				        });
				    });
				},
				
				renderSeriesReportWrite : function(seriesId, reportId){
				    require(["report/views/mobile/m_series_report_form"], function(SeriesReportFormView) {
				        LayoutView.render(appName).done(function(layout) {
				            var seriesReportFormView = new SeriesReportFormView({reportId : reportId});
				            seriesReportFormView.render();
				            Controller.prototype.renderSideMenu();
				        });
				    });
				},
                
				renderSearch : function(){
                    require(["report/views/mobile/m_report_result"], function(ReportResultView) {
                        LayoutView.render(appName).done(function(layout) {
                            var reportResultView = new ReportResultView();
                            reportResultView.render();
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
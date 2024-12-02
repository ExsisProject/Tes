(function() {
	define([
	        "report/views/layouts/defaults",
	        "i18n!nls/commons"
    ], 
    function(
    		DefaultLayout,
    		CommonLang
    ) {
		var ReportController = (function() {
			
			var Controller = function() {
			};
			
			Controller.prototype = {
					
				render: function() {
					require(["report/views/app"], function(ReportAppView) {
						var layout = DefaultLayout.create();
						layout.sideInit();
						layout.render().done(function(layout) {
							var content = layout.getContentElement();
							ReportAppView.render();
							content.append(ReportAppView.el);
						});
					});
				},
				
				renderSearch : function(){
                    require(["report/views/search"], function(SearchView) {
                        DefaultLayout.render().done(function(layout) {
                            var content = layout.getContentElement();
                            searchView = new SearchView();
                            content.append(searchView.render({}).el);
                        });
                    });				    
				},
				
				renderDeptActiveFolders : function(id){
				    require(["report/views/dept_active_folders"], function(DeptActiveFoldersView) {
				        DefaultLayout.render().done(function(layout) {
				            var content = layout.getContentElement();
                            deptActiveFoldersView = new DeptActiveFoldersView({deptId : id});
				            content.append(deptActiveFoldersView.render().el);
				        });
				    });
				},
				
				renderDeptCloseFolders : function(){
				    require(["report/views/dept_close_folders"], function(DeptCloseFoldersView) {
				        DefaultLayout.render().done(function(layout) {
				            var content = layout.getContentElement();
				            deptCloseFoldersView = new DeptCloseFoldersView();
				            content.append(deptCloseFoldersView.render().el);
				        });
				    });
				},
				
				renderDeptDescendant : function(id){
				    require(["report/views/dept_descendant"], function(DeptDescendantView) {
				        DefaultLayout.render().done(function(layout) {
				            var content = layout.getContentElement();
				            deptDescendantView = new DeptDescendantView({deptId : id});
				            content.append(deptDescendantView.render().el);
				        });
				    });
				},
				
				renderFolderCreate : function(){
                    require(["report/views/folder_create"], function(ReportFolderCreateView) {
                        DefaultLayout.render().done(function(layout) {
                            var content = layout.getContentElement();
                            reportFolderCreateView = new ReportFolderCreateView();
                            content.append(reportFolderCreateView.el);
                            reportFolderCreateView.render();
                        });
                    });
				},
				
				renderFolderModify : function(id){
					require(["report/views/folder_create"], function(ReportFolderCreateView) {
						 DefaultLayout.render().done(function(layout) {
	                            var content = layout.getContentElement();
	                            reportFolderCreateView = new ReportFolderCreateView({ id : id });
	                            content.append(reportFolderCreateView.el);
	                            reportFolderCreateView.render();
	                        });
					});
				},
				
				renderReportSeries: function(id, reportId) {
					require(["report/views/series_report"], function(ReportSeriesView) {
						DefaultLayout.render().done(function(layout) {
							var content = layout.getContentElement();
							(new ReportSeriesView({id:id, reportId : reportId})).render()
							content.append(ReportSeriesView.el);
						});
					});
				},
				
				renderReportWrite: function(id) {
				    require(["report/views/report_form"], function(ReportWriteView) {
				        DefaultLayout.render().done(function(layout) {
				            var content = layout.getContentElement();
				            (new ReportWriteView({folderId:id})).render();
				            content.append(ReportWriteView.el);
				        });
				    });
				},
				
				renderReportUpdate: function(folderId, reportId) {
				    require(["report/views/report_form"], function(ReportWriteView) {
				        DefaultLayout.render().done(function(layout) {
				            var content = layout.getContentElement();
				            (new ReportWriteView({folderId:folderId, reportId : reportId})).render();
				            content.append(ReportWriteView.el);
				        });
				    });
				},
				
				renderReports: function(id) {
				    require(["report/views/reports"], function(ReportsView) {
				        DefaultLayout.render().done(function(layout) {
				            var content = layout.getContentElement(),
				                view = null;
				            view = new ReportsView({id : id});
				            view.render();
				            content.append(ReportsView.el);
				        });
				    });
				},
				
				renderReport: function(folderId, reportId) {
				    require(["report/views/report_detail"], function(ReportsView) {
				        DefaultLayout.render().done(function(layout) {
				            var content = layout.getContentElement(),
				            view = new ReportsView({id : reportId, folderId : folderId});
				            view.render();
				            content.append(ReportsView.el);
				        });
				    });
				},
				
				renderSeriesReportPopup: function(reportId, isPrint) {
                    require([
                             "report/views/series_report",
                             "print"
                             ], function(
                                     ReportSeriesView,
                                     PrintView
                             		) {
                        
                        var reportSeriesView = new ReportSeriesView({id : reportId}),
                            content = reportSeriesView.getReportDetail({reportId : reportId, isPrintMode : true}),
                            printView = new PrintView({
                            	addClass : "report_type report_spot_type"
                            });
                        
                        printView.setContent(content);
                        printView.render();
                        
                        printView.$el.find("h1").text(CommonLang["팝업보기"]);
                        $('body').html(printView.$el);
                        $('.btn_layer_wrap').remove();
                        $('body').addClass("print");
                        
                        if (isPrint) {
                        	$(document).ready(function() {
								setTimeout(function() {
									window.print();
								}, 1000);
							});
                        }
                    });
				},
				
				popupAllReport: function(seriesId, isPrint) {
					require([
					         "report/views/series_report",
					         "print"
					         ], function(
					        		 ReportSeriesView,
					        		 PrintView) {
						
						var reportSeriesView = new ReportSeriesView({id : seriesId}),
						content = reportSeriesView.getReportDetails({seriesId : seriesId, isPrintMode : true, isAll : true}),
						printView = new PrintView({
							isAll : true,
							addClass : "report_type report_spot_type"
						});
						
						printView.setContent(content);
						printView.render();
						printView.$el.find("h1").text(CommonLang["팝업보기"]);
						$('body').html(printView.$el);
						$('.btn_layer_wrap').remove();
						$('body').addClass("print");
						
						if (isPrint) {
                        	$(document).ready(function() {
								setTimeout(function() {
									window.print();
								}, 1000);
							});
                        }
					});
				},
				
				renderReportPopup: function(reportId) {
                    require([
                             "report/views/report_detail",
                             "print"
                             ], function(
                                     ReportDetailView,
                                     PrintView,
                                     AttachFilesView
                             ) {
                        var reportDetailView = new ReportDetailView({id : reportId}),
                            content = reportDetailView.getDetailContent({isPrintMode : true}),
                            printView = new PrintView({
                            	setting : {
                            		printMode:'popup',
                            	},
                            	addClass : "report_type report_spot_type",
                            	mode : "preview"
                            });
                        
                        printView.setContent(content);
                        printView.render();
                        
                        printView.$el.find("h1:first").text(CommonLang["팝업보기"]);
                        printView.$el.find("#actions").remove();
                        
                        $('body').html(printView.$el);
                        $('body').addClass("print");
                    });
				},
				
				renderReportPrint: function(reportId) {
				    require([
				             "report/views/report_detail",
                             "print"
				             ], function(
				                     ReportDetailView,
				                     PrintView,
				                     AttachFilesView
				             ) {
				        var reportDetailView = new ReportDetailView({id : reportId}),
				            content = reportDetailView.getDetailContent({isPrintMode : true}).html();
				            
                        var printView = new PrintView({
                        	setting : {
                        		printMode:'popup',
                        	},
                        	addClass : "report_type report_spot_type"
                        });
                        
                        printView.setContent(content);
                        
                        $('body').html(printView.render().$el);
                        $('body').addClass("print");
				    });
				}
			};
			
			return Controller;
			
		})();
		
		return new ReportController();
	});
}).call(this);
;(function() {
	define([ 
		"jquery", 
		"backbone", 
		"app",
		"i18n!report/nls/report", 
		"hgn!report/templates/mobile/m_home_undone_item",
		"hgn!report/templates/mobile/m_home_recent_item",
	    "views/mobile/header_toolbar",
	    "report/collections/report_todos",
	    "report/collections/report_recent_list",
	    "GO.util"
	],
	function(
		$, 
		Backbone, 
		GO, 
		reportLang,
		ReportUndoneItemTmpl,
		ReportRecentItemTmpl,
		HeaderToolbarView,
		ReportTodoCollection,
		ReportRecentCollection
	) {
		var lang = {
		        home : reportLang["보고서 홈"],
		        todo_reports : reportLang["작성할 보고"],
		        recent_reports : reportLang['최근 작성된 보고'],
		        recent_empty_msg : reportLang["최근 작성된 보고가 없습니다."],
		        undone_empty_msg : reportLang["작성할 보고가 없습니다."]
			};
		
		var HomeListView = Backbone.View.extend({
		    el : '#content',
		    
		    events : {
		        "vclick #home_tap ul li" : "changeTap",
		        "vclick li.recent a[data-report-id]" : "reportDetail",
		        "vclick li.undone a[data-report-id]" : "seriesDetail",
		        "vclick li.undone a.btn_report_write" : "write"
		    },
			initialize : function() {
			    GO.util.appLoading(true);
			    
			    this.$el.off();
			    this.undoneReports = null;
			},
			render : function() {
	             GO.util.pageDone();
			    
			    var self = this,
			        home_list_template = ["<div class='tab_wrap' id='home_tap'>",
			                                  "<ul class='tab'>",
    			                                  "<li class='undone'><a href='javascript:;'>" + lang.todo_reports + "</a></li>",
    			                                  "<li class='recent on'><a href='javascript:;'>" + lang.recent_reports + "</a></li>",
			                                  "</ul>",
			                              "</div>",
						                  "<div class='content'>",
		                                  	"<ul class='list_box list_box_report' id='home_list'>",
		                                  	"</ul>",
						                  "</div>",
			                              ];

				this.headerToolbarView = HeaderToolbarView;
				this.headerToolbarView.render({
					title : reportLang['보고'],
					isList : true,
					isSideMenu: true,
					isHome: true,
					isSearch : true
				});
			    
			    this.$el.html(home_list_template.join(""));
			    
                var reportRecentCollection = new ReportRecentCollection(),
                options = {
                    offset : 10,
                    page : 0,
                    property : "submittedAt",
                    direction : "desc"
                };
                
                GO.util.appLoading(true);
                reportRecentCollection.conditions = options;
                reportRecentCollection.fetch(
                    {
                        async : true, 
                        success : function(data){
                            self.recentReports = data;
                            self.renderRecentList();
                            GO.util.appLoading(false);
                        }
                    });
                
			},
			
			reload : function(){
			    GO.util.appLoading(true);
			    var currentTapEl = this.$el.find("#home_tap li.on");
			    
			    if(currentTapEl.hasClass("undone")){
                     this.undoneReports.fetch();
                     this.renderTodoList();
			    }else{
	                this.recentReports.fetch();
	                this.renderRecentList();
			    }
	             GO.util.appLoading(false);
			},
			changeTap : function(e){
			    GO.util.appLoading(true);
			    var targetEl = $(e.currentTarget);
			    
			    if(targetEl.hasClass("undone")){
			        this.undoneReports = ReportTodoCollection.fetch();
			        this.renderTodoList();
			    }else{
			        var options = {
			            offset : 10,
			            page : 0,
			            property : "submittedAt",
			            direction : "desc"
			        };
			        
			        var reportRecentCollection = new ReportRecentCollection();
			        reportRecentCollection.conditions = options;
			        reportRecentCollection.fetch({async : false});
			        this.recentReports = reportRecentCollection;
			        this.renderRecentList();
			    }
			    
			    $.each(targetEl.siblings(), function(){
			        $(this).removeClass("on");
			    });
			    
			    targetEl.addClass("on");
			    GO.util.appLoading(false);
			},
			reportDetail : function(e){
			    var targetEl = $(e.currentTarget),
			        type = targetEl.attr("data-type"),
			        reportId = targetEl.attr("data-report-id"),
			        seriesId = targetEl.attr("data-series-id"),
			        folderId = targetEl.attr("data-folder-id");
			    
                if(type == "PERIODIC"){
                    url = "report/series/" + seriesId + "/report/" + reportId;
                }else{
                    url = "report/folder/" + folderId +"/report/" + reportId;
                }
                
                GO.router.navigate(url, {trigger: true});
			},
			
			seriesDetail : function(e){
                var targetEl = $(e.currentTarget),
                    seriesId = targetEl.attr("data-series-id"),
                    url = "report/series/" + seriesId;
                
                GO.router.navigate(url, {trigger: true});
			},
			
			write : function(e){
                var targetEl = $(e.currentTarget),
                    parentEl = targetEl.parents("li.undone").find("a[data-report-id]"),
                    reportId = parentEl.attr("data-report-id"),
                    seriesId = parentEl.attr("data-series-id"),
                    url = "report/series/" + seriesId + "/report/" + reportId +"/form";
                GO.router.navigate(url, {trigger: true});
			},
			
			renderTodoList : function(){
                var undoneCard = [],
                    emptyHtml = "";
                
                if(this.undoneReports.length == 0){
                    emptyHtml = "<li class='creat data_null'><span class='txt_ellipsis'>"+lang.undone_empty_msg+"</span></li>";
                    undoneCard.push(emptyHtml);
                }else{
                    this.undoneReports.each(function(model, i){
                        var sessionUser = GO.session(),
                            reportItemHtml = ReportUndoneItemTmpl({
                                data : $.extend({}, model.toJSON(), {
                                    seriesId : model.get("id"),
                                    reportId : model.findReporterByUserId(sessionUser.id, "undones").user.reportId,
                                    closedAtBasicDate : GO.util.basicDate2(model.get("closedAt")),
                                    seriesText : model.getSeriesStr(),
                                    donesText : GO.i18n(reportLang['보고자 {{arg1}}명'], {"arg1": model.get("dones").length}),
                                    undonesText : GO.i18n(reportLang['미보고자 {{arg1}}명'], {"arg1": model.get("undones").length}),
                                    isCommentCountZero : function(){
                                        return model.get("commentCount") == 0 ? true : false ;
                                    },
                                    actions : {
                                        writable : true
                                    }
                                }),
                                lang : lang,
                            });
                        
                        undoneCard.push(reportItemHtml);
                    });
                }
                this.$el.find("#home_list").html(undoneCard.join(""));
			},
			renderRecentList : function(){
                var recentCard = [],
                    emptyHtml = "",
                    self = this;
            
                if(this.recentReports.length == 0){
                    emptyHtml = "<li class='creat data_null'><span class='txt_ellipsis'>"+ lang.recent_empty_msg +"</span></li>";
                    recentCard.push(emptyHtml);
                }else{
                    this.recentReports.each(function(model, i){
                        var reportItemHtml = ReportRecentItemTmpl({
                            data : $.extend({}, model.toJSON(), {
                                title : self._makeRecentTitle(model),
                                createdAtBasicDate : GO.util.basicDate(model.get("submittedAt")),
                                isCommentCountZero : function(){
                                    return model.get("commentCount") == 0 ? true : false ;
                                },
                                deptName : model.get("folder").name,
                                isReadable : model.get("actions").readable
                            }),
                            lang : lang,
                        })
                        recentCard.push(reportItemHtml);
                    });
                }
                this.$el.find("#home_list").html(recentCard.join(""));
			},
			_makeRecentTitle : function(model){
                if(model.get("folder").type == "PERIODIC"){
                    var seriesStr = GO.util.parseOrdinaryNumber(model.get("series").series, GO.config("locale"));
                    
                    return model.get("folder").name + " (" + GO.i18n(reportLang["제 {{arg1}}회차"],{arg1 : seriesStr}) + ")";
                }else{
                    return model.get("name");
                }
			}
		}, {
            __instance__: null, 
            create: function(packageName) {
                this.__instance__ = new this.prototype.constructor({'packageName':packageName}); 
                return this.__instance__;
            }
        });
		
		return HomeListView;
	});
}).call(this);
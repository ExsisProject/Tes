;(function() {
	define([ 
		"jquery", 
		"backbone", 
		"app",
        "hogan",
		"i18n!report/nls/report", 
		"i18n!nls/commons",
	    "views/mobile/header_toolbar",
	    "hgn!report/templates/mobile/m_series",
	    "text!report/templates/mobile/m_series_card.html",
	    "report/models/series_report",
	    "report/models/report_folder",
	    "GO.util",
	    "GO.m.util"
	],
	function(
		$, 
		Backbone, 
		GO, 
		Hogan,
		ReportLang,
		CommonLang,
		HeaderToolbarView,
		ReportSeriesTmpl,
		ReportSeriesCardTmpl,
		SeriesModel,
		ReportFolderModel
	) {
				
		var lang = {
		        list : CommonLang["목록"],
		        series_comment : ReportLang["회차 댓글"],
		        exclude_reporters : ReportLang["제외된 보고자"],
		        undone : ReportLang["미보고"],
		        done : ReportLang["보고"],
		        write : ReportLang["보고 작성"]
			};
		
		var ReportSeriesView = Backbone.View.extend({
		    el : '#content',
		    
		    events : {
		        "vclick div.tool_bar a.list" : "list",
		        "vclick div.tool_bar a.comment" : "comment",
		        "vclick div.dones section.clickable" : "show",
		        "vclick section a.btn_report_write_s" : "write"
		    },
		    
			initialize : function(options) {
				this.options = options || {};
			    var seriesId = this.options.seriesId;
			    
			    this.model = SeriesModel.get(seriesId);
			    this.folder = (new ReportFolderModel()).set(this.model.get("folder"));
			    this.$el.off();
			    this.headerBindEvent();
			},

			headerBindEvent : function(){
				GO.EventEmitter.off("trigger-action");
				GO.EventEmitter.on('trigger-action','series-comment', this.comment, this);
			},
			render : function() {
				var self = this;
				var sessionUser = GO.session();
				var options = {
					title : this.folder.get("name"),
					isPrev : true,
					actionMenu : [{
						id: 'series-comment',
						text: ReportLang["회차 댓글"],
						cls : "btn_comments",
						triggerFunc : 'series-comment',
						commentsCount : this.model.toJSON().commentCount
					}]
				};
				if(this.model.isUndoneReporter(sessionUser.id)){
					options.isWriteBtn = true;
					options.writeBtnCallback = function() {
						self.write();
					}
				}
				HeaderToolbarView.render(options);
			    this.$el.addClass("report");
			    this.makeContent();
			    
			    return this.$el;
			},
			makeContent : function(){
                this.$el.html(ReportSeriesTmpl(
                        {
                            data : $.extend({}, this.model.toJSON() , {
                                createdAtBasicDate : GO.util.basicDate(this.model.get("createdAt")),
                                excludeReporters : this.model.excludeReportsStr(),
                                isCommentCountZero : function(){
                                    return this.commentCount == 0 ? true : false ;
                                }
                            }),
                            lang : lang
                        },
                        {
                            seriesReporterCard : ReportSeriesCardTmpl
                        }
                    ));
			},
			reload : function(){
			    this.model.fetch();
			    this.folder = (new ReportFolderModel()).set(this.model.get("folder"));
			    this.makeContent();
			},
			makeTitleOption : function(){
			    var self = this,
			        options = 
			            {
		                    name : this.folder.get("name"), 
		                    isIscroll : false,
		                    isPrev : true,
		                    refreshButton : {
		                        callback : $.proxy(self.reload, self)
		                    }
		                },
		            self = this,
		            sessionUser = GO.session();
			    
			    if(this.model.isUndoneReporter(sessionUser.id)){
    			    options.rightButton = 
                        {
                            text : lang.write,
                            callback : $.proxy(self.write, self)
                            
                        }
			    }
			    return options;
			},
			list : function(){
			    var url = "report/folder/" +this.folder.get("id")+"/reports";
			    
                GO.router.navigate(url, true);
                
                return false;
			},
			
			comment : function(){
                var url = "/report/series/" +this.model.get("id")+"/comments";
                
                GO.router.navigate(url, {trigger: true});
			},
			
			show : function(e){
                var reportId = $(e.currentTarget).attr("data-id"),
                    url = "/report/series/" +this.model.get("id")+"/report/" + reportId;
                
                GO.router.navigate(url, {trigger: true});
			},
			
			write : function(){
			    var reportData = this.model.findReporterByUserId(GO.session().id);
			    var url = "report/series/" + this.model.get("id") + "/report/" + reportData.user.reportId +"/form";
			    GO.router.navigate(url, {trigger: true});
			}
		}, {
            __instance__: null, 
            create: function(packageName) {
                this.__instance__ = new this.prototype.constructor({'packageName':packageName}); 
                return this.__instance__;
            }
        });
		
		return ReportSeriesView;
	});
}).call(this);
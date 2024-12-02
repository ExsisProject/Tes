;(function() {
	define([ 
		"jquery", 
		"backbone", 
		"app",
        "hogan",
		"i18n!report/nls/report", 
		"i18n!nls/commons",
	    "views/mobile/header_toolbar",
	    "hgn!report/templates/mobile/m_report_comments",
	    "report/models/report",
	    "report/models/report_folder",
	    "m_comment",
	    "attach_file", 
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
		ReportCommentsTmpl,
		ReportModel,
		ReportFolderModel,
		CommentsView,
		AttachFilesView
	) {
				
		var lang = {
		        list : CommonLang["목록"],
		        commentCount : ReportLang["이 보고의 댓글"],
		        modify : CommonLang["수정"],
		        remove : CommonLang["삭제"],
		        removeDesc : ReportLang["해당 보고서를 삭제 하시겠습니까?"]
			};
		
		var ReportDetailView = Backbone.View.extend({
		    el : '#content',
		    
		    events : {
		        "vclick div.tool_bar a.list" : "list",
		        "vclick div.tool_bar a.comment" : "comment",
		        "vclick div.tool_bar a.modify" : "modify",
		        "vclick div.tool_bar a.remove" : "remove",
		    },
		    
			initialize : function(options) {				
			    var reportId = this.options.reportId,
			        self = this;
			    
			    this.$el.off();
			    this.model = ReportModel.get(reportId);
			    this.folder = (new ReportFolderModel()).set(this.model.get("folder"));
			    
			    GO.EventEmitter.off("change:comment");
	            GO.EventEmitter.on("common", "change:comment", _.bind(function(count) {
	                this.$el.find("header span.count").text("( " +count + " )");
	            }, this));
			},
			
			render : function() {
				HeaderToolbarView.render({
					title : this.makeViewTitle(),
					isClose : true
				});
			    this.$el.addClass("report");
			    this.makeContent();
			    return this.$el;
			},
			makeViewTitle : function() {
				var title = "";

				if(this.folder.isPeriodic()){
					title = this.model.getSeriesStr();
				}else{
					title = this.folder.get("name");
				}
				return title;
			},
			reload : function(){
			    this.model.fetch({async: false});
			    this.folder = (new ReportFolderModel()).set(this.model.get("folder"));
			    this.makeContent();
			},
			makeContent : function(){
			    var self = this;
			    
			    this.$el.html(ReportCommentsTmpl({
                    data : $.extend({}, this.model.toJSON() , {
                        createdAtBasicDate : GO.util.basicDate(this.model.get("createdAt")),
                        isPeriodic : self.folder.isPeriodic()
                    }),
                    lang : lang
                }));
                
                
                var commentView = CommentsView.create({
                    el : "#comment_list",
                    type : "report",
                    typeId : this.model.get("id")
                });
                
                this.commentCount = commentView.collection.length;
			},
			
			list : function(){
			    var url = "" ;
			        
			    
                if(this.folder.isPeriodic()){
                    url = "/report/series/" + this.model.series("id");
                }else{
                    url = "/report/folder/" +this.folder.get("id")+"/reports";
                }
			    
                GO.router.navigate(url, {trigger: true});
			},
			
			remove : function(){
			    
                if(confirm(lang['removeDesc'])) {
                    if(this.folder.isPeriodic()){
                        
                    }else{
                        this.model.destroy({
                            success : function(){
                                var url = "report/folder/" + self.options.folderId + "/reports";
                                
                                GO.router.navigate(url, {trigger: true});
                            }
                        });
                    }
                }
			},
			
			makeTitle : function(){
			    var title = "";
			    
			    if(this.folder.isPeriodic()){
			        title = this.folder.get("name") + " > " + this.model.getSeriesStr();
			    }else{
			        title = this.folder.get("name") + " > " + this.model.get("name");
			    }
			    return title
			}
		}, {
            __instance__: null, 
            create: function(packageName) {
                this.__instance__ = new this.prototype.constructor({'packageName':packageName}); 
                return this.__instance__;
            }
        });
		
		return ReportDetailView;
	});
}).call(this);
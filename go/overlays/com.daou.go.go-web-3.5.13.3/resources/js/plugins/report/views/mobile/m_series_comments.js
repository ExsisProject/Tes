;(function() {
	define([ 
		"jquery", 
		"backbone", 
		"app",
        "hogan",
		"i18n!report/nls/report", 
		"i18n!nls/commons",
	    "views/mobile/header_toolbar",
	    "hgn!report/templates/mobile/m_series_comments",
	    "report/models/series_report",
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
		ReportSeriesTmpl,
		SeriesModel,
		ReportFolderModel,
		CommentsView,
		AttachFilesView
	) {
				
		var lang = {
		        list : CommonLang["목록"],
		        commentCount : ReportLang["이 보고서의 댓글"],
		        modify : CommonLang["수정"],
		        remove : CommonLang["삭제"],
		        removeDesc : ReportLang["해당 보고서를 삭제 하시겠습니까?"]
			};
		
		var ReportDetailView = Backbone.View.extend({
		    el : '#content',
		    
		    events : {
		        "vclick div.tool_bar a.list" : "list"
		    },
		    
			initialize : function(options) {
				this.options = options || {};
			    var seriesId = this.options.seriesId,
			        self = this;
			    
			    this.$el.off();
			    this.model = SeriesModel.get(seriesId);
			    this.folder = (new ReportFolderModel()).set(this.model.get("folder"));
			    
			    GO.EventEmitter.off("change:comment");
	            GO.EventEmitter.on("common", "change:comment", _.bind(function(count) {
	                this.$el.find("header span.count").text("( " +count + " )");
                }, this));
			},
			
			render : function() {
				HeaderToolbarView.render({
					title : this.folder.get("name"),
					isClose : true
				});
			    this.$el.addClass("report");
			    this.makeContent();
			    return this.$el;
			},
			reload : function(){
			    this.model.fetch({async : false});
			    this.folder = (new ReportFolderModel()).set(this.model.get("folder"));
			    this.makeContent();
			},
			makeContent : function(){
			    this.$el.html(ReportSeriesTmpl({
                    data : $.extend({}, this.model.toJSON() , {
                        name : this.model.getSeriesStr()
                    }),
                    lang : lang
                }));
                
                var commentView = CommentsView.create({
                    el : "#comment_list",
                    type : "report/series",
                    typeId : this.model.get("id")
                });
                
                this.commentCount = commentView.collection.length;
			},
			
			list : function(){
			    var url = "/report/series/" +this.model.get("id");
                GO.router.navigate(url, {trigger: true});
			},
			
			makeTitle : function(){
			    var title = this.folder.get("name") + " > " + this.model.getSeriesStr();
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
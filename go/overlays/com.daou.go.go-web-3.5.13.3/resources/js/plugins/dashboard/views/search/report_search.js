;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			"hgn!dashboard/templates/search/report_search",
			"collections/paginated_collection",
			"dashboard/views/search/search_form",
			"dashboard/views/search/no_search_result",
			"i18n!nls/commons",
			"GO.util",
			"jquery.dotdotdot"
	], 
	function(
			Backbone,
			Hogan,
			App,
			ReportSeachTmpl,
			PaginatedCollection,
			SearchForm,
			NosearchResult,
			commonLang
			
	) {
		var lang = {
				empty_search_results : commonLang["검색결과없음"],
				more : commonLang['더보기'],
				report : commonLang['보고']
		};
		
		var SearchList = PaginatedCollection.extend({
			url: function() {
				var uri = '/api/search/report';
				
				var searchParam = $.param({
											stype: this.stype,
											keyword : this.keyword,
											fromDate: this.fromDate,
											toDate: this.toDate,
											page: this.pageNo, 
											offset: this.pageSize,
											properties : this.properties
										});
				if (this.stype == "detail") {
					searchParam =  $.param({
						stype: this.stype,
						keyword : this.keyword,
						fromDate: this.fromDate,
						toDate: this.toDate,
						title: this.title,
						content : this.content,
						comments : this.comments,
						reporterName : this.reporterName,
						attachFileNames: this.attachFileNames,
						attachFileContents: this.attachFileContents,
						page: this.pageNo, 
						offset: this.pageSize,
						properties : this.properties
					});
				}
				return uri + "?" + searchParam;
			},
			setListParam: function() {
				var searchParams = GO.router.getSearch();
				this.stype = searchParams.stype;
				this.keyword = searchParams.keyword ? searchParams.keyword.replace(/\+/gi, " ") : '' ;
				this.title = this.keyword;
				this.attachFileNames = this.keyword;
				this.attachFileContents = searchParams.searchAttachContents == "true" ? this.keyword : "";
				this.fromDate = searchParams.fromDate;
				this.toDate = searchParams.toDate;
				this.content = this.keyword;
				this.comments = this.keyword;
				this.reporterName = this.keyword;
				this.pageNo = searchParams.page ? searchParams.page : 0;
				this.pageSize = searchParams.offset ? searchParams.offset : 20;
				this.properties = "submittedAt";
				sessionStorage.clear();
			}
		});
		
		var ReportSerach = SearchForm.extend({
			
			events : {
				"click #btn_more" : "showMore",
				"click #reportTitle" : "moveReportDetail"
			},
			
			initialize : function() {
				this.$el.off();
				this.param = GO.router.getSearch(); 
				if(this.param.stype != "simple"){
					this.param = {
							stype : this.param.stype,
							title : this.param.keyword,
							content : this.param.keyword,
							comments : this.param.keyword,
							attachFileNames : this.param.keyword,
							attachFileContents : this.param.searchAttachContents == "true" ? this.param.keyword : "",
							reporterName : this.param.keyword,
							fromDate : this.param.fromDate,
							toDate : this.param.toDate,
							page : this.param.page || 0,
							offset : this.param.offset || 5,
							appName : this.param.appName
					};
				}
				this.collection = new SearchList();
				this.collection.setListParam();
				this.collection.bind('reset', this.resetList, this);
				this.temp = this.collection.fetch({
					statusCode: {
	                    403: function() { GO.util.error('403'); }, 
	                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
	                    500: function() { GO.util.error('500'); }
	                }
				});
			},
			
			render : function() {
				if(this.param.appName != undefined){
					var searchList = '<div class="cs_report_wrap">'+	
								'</div>'+
								'<div class="tool_bar tool_absolute">'+
								'<div class="dataTables_length"></div>'+
							'</div>';
					this.$el.append(searchList);
				}
				return this;
			},
			moveReportDetail : function(e) {
				var seriesId = $(e.currentTarget).attr("data-seriesId");
				var reportId = $(e.currentTarget).attr("data-reportId");
				var folderId = $(e.currentTarget).attr("data-folderId");
				
				if(seriesId == 0){
					window.open("/app/report/folder/"+folderId+"/report/"+reportId,"_blank","scrollbars=yes,resizable=yes,width=1280,height=760");
					return;
				}
				
				window.open("/app/report/series/"+seriesId+"/report/"+reportId,"_blank","scrollbars=yes,resizable=yes,width=1280,height=760");
			},
			showMore : function(e) {
				this.param.appName = "report";
				this.showAppSearchMore(this.param);
			},
			getSearchTotalCount : function(){
				return 0;//this.collection.page.total;
			},
			resetList: function(doclist) {
				if(this.param.appName != undefined){
					if(this.collection.pageInfo().total == 0){
						var nosearchResult = new NosearchResult({appName : commonLang["보고"]});
						this.$el.find("div.cs_report_wrap").html(nosearchResult.render().el);
						return;
					}
					this.$el.find('div.cs_report_wrap').html(ReportSeachTmpl({
						lang : lang,
						dataset : this.collection.toJSON(),
						convertSubmittedAt : function() {
							return this.submittedAt == null ? "" : GO.util.snsDate(this.submittedAt);
						}
					}));
					this.renderPages();
				}else{
					if(this.collection.pageInfo().total == 0){
						$('#reportEmptyMessage').show();
						return;
					}
					this.$el.html(ReportSeachTmpl({
						lang : lang,
						dataset : this.collection.toJSON(),
						convertSubmittedAt : function() {
							return this.submittedAt == null ? "" : GO.util.snsDate(this.submittedAt);
						}
					}));
				}
				this.removeMoreBtn();
				this.$el.find('.dot').dotdotdot({
					watch: "window"
				});
			},
			
		});
		return ReportSerach;
	});
}).call(this);
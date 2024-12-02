;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			"hgn!dashboard/templates/search/task_search",
			"collections/paginated_collection",
			"dashboard/views/search/search_form",
			"dashboard/views/search/no_search_result",
			"i18n!nls/commons",
			"i18n!task/nls/task",
			"GO.util"
	], 
	function(
			Backbone,
			Hogan,
			App,
			TaskSeachTmpl,
			PaginatedCollection,
			SearchForm,
			NosearchResult,
			commonLang,
			taskLang
	) {
		var lang = {
				empty_search_results : commonLang["검색결과없음"],
				more : commonLang['더보기'],
				task : commonLang['업무'],
				dueDate : taskLang['기한일']
		};
		
		var SearchList = PaginatedCollection.extend({
			//model: DocListItemModel,
			url: function() {
				var uri = '/api/search/task';
				
				var searchParam = $.param({
											stype: this.stype,
											keyword : this.keyword,
											fromDate: this.fromDate,
											toDate: this.toDate,
											page: this.pageNo, 
											offset: this.pageSize
										});
				if (this.stype == "detail") {
					searchParam =  $.param({
						stype: this.stype,
						keyword : this.keyword,
						fromDate: this.fromDate,
						toDate: this.toDate,
						attachFileNames: this.attachFileNames,
						attachFileContents: this.attachFileContents,
						name : this.keyword,
						content : this.keyword,
						activityContents : this.keyword,
						comments : this.keyword,
						assignees : this.keyword,
						creator : this.keyword,
						page: this.pageNo, 
						offset: this.pageSize
					});
				}
				return uri + "?" + searchParam;
			},
			setListParam: function() {
				var searchParams = GO.router.getSearch();
				this.stype = searchParams.stype;
				this.keyword = searchParams.keyword ? searchParams.keyword.replace(/\+/gi, " ") : '' ;
				this.attachFileNames = searchParams.keyword;
				this.attachFileContents = searchParams.searchAttachContents == "true" ? this.keyword : "";
				this.fromDate = searchParams.fromDate;
				this.toDate = searchParams.toDate;
				this.name = this.keyword;
				this.content = this.keyword;
				this.activityContents = this.keyword;
				this.comments = this.keyword;
				this.assignees = this.keyword;
				this.creator = this.keyword;
				this.pageNo = searchParams.page ? searchParams.page : 0;
				this.pageSize = searchParams.offset ? searchParams.offset : 20;
				sessionStorage.clear();
			}
		});
		
		var TaskSerach = SearchForm.extend({
			
			events : {
				"click #btn_more" : "showMore",
				"click #taskName" : "moveTaskDetail"
			},
			
			initialize : function() {
				this.$el.off();
				this.param = GO.router.getSearch();
				if(this.param.stype != "simple"){
					this.param = {
							stype : this.param.stype,
							name : this.param.keyword,
							content : this.param.keyword,
							activityContents : this.param.keyword,
							comments : this.param.keyword,
							assignees : this.param.keyword,
							creator : this.param.keyword,
							attachFileNames : this.param.keyword,
							attachFileContents : this.param.searchAttachContents == "true" ? this.param.keyword : "",
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
				this.collection.fetch({
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
			moveTaskDetail : function(e) {
				var taskId = $(e.currentTarget).attr("data-taskId");
				
				window.open("/app/task/"+taskId+"/detail","_blank","scrollbars=yes,resizable=yes,width=1280,height=760");
			},
			showMore : function(e) {
				this.param.appName = "task";
				this.showAppSearchMore(this.param);
			},
			getSearchTotalCount : function(){
				return 0;//this.collection.page.total;
			},
			resetList: function(doclist) {
				if(this.param.appName != undefined){
					if(this.collection.pageInfo().total == 0){
						var nosearchResult = new NosearchResult({appName : commonLang["업무"]});
						this.$el.find("div.cs_report_wrap").html(nosearchResult.render().el);
						return;
					}
					this.$el.find('div.cs_report_wrap').html(TaskSeachTmpl({
						lang : lang,
						dataset : this.collection.toJSON(),
						convertDuedate : function(){
							return this.dueDate == null ? "-" : GO.util.shortDate2(this.dueDate);
						}
					}));
					this.renderPages();
				}else{
					if(this.collection.pageInfo().total == 0){
						$('#taskEmptyMessage').show();
						return;
					}
					this.$el.html(TaskSeachTmpl({
						lang : lang,
						dataset : this.collection.toJSON(),
						convertDuedate : function(){
							return this.dueDate == null ? "-" : GO.util.shortDate2(this.dueDate);
						}
					}));
				}
				this.removeMoreBtn();
			},
		});
		return TaskSerach;
	});
}).call(this);
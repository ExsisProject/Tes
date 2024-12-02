;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			"hgn!dashboard/templates/search/board_search",
			"collections/paginated_collection",
			"dashboard/views/search/search_form",
			"dashboard/views/search/no_search_result",
			"i18n!nls/commons",
			"jquery.go-grid",
			"GO.util",
			"jquery.dotdotdot"
	], 
	function(
			Backbone,
			Hogan,
			App,
			BoardSeachTmpl,
			PaginatedCollection,
			SearchForm,
			NosearchResult,
			commonLang
	) {
		var lang = {
				empty_search_results : commonLang["검색결과없음"],
				more : commonLang['더보기'],
				board : commonLang['게시판']
		};
		
		var SearchList = PaginatedCollection.extend({
			url: function() {
				var uri = '/api/search/board';
				
				var searchParam = $.param({
											stype: this.stype,
											type: this.type,
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
						userName : this.userName,
						comments : this.comments,
						content : this.content,
						name : this.name,
						activityContents : this.activityContents,
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
				this.attachFileNames = this.keyword;
				this.attachFileContents = searchParams.searchAttachContents == "true" ? this.keyword : "";
				this.fromDate = searchParams.fromDate;
				this.toDate = searchParams.toDate;
				this.userName = this.keyword;
				this.comments = this.keyword;
				this.content = this.keyword;
				this.name = this.keyword;
				this.activityContents = this.keyword;
				this.pageNo = searchParams.page ? searchParams.page : 0;
				this.pageSize = searchParams.offset ? searchParams.offset : 20;
				sessionStorage.clear();
			}
		});
		
		var BoardSerach = SearchForm.extend({
			
			events : {
				"click #btn_more" : "showMore",
				"click #postTitle" : "movePostDetail"
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
							attachFileNames : this.param.keyword,
							attachFileContents : this.param.searchAttachContents == "true" ? this.param.keyword : "",
							userName : this.param.keyword,
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
					var searchList = '<div class="cs_board_wrap">'+	
								'</div>'+
								'<div class="tool_bar tool_absolute">'+
								'<div class="dataTables_length"></div>'+
							'</div>';
					this.$el.append(searchList);
				}
				
				return this;
			},
			movePostDetail : function(e) {
				var boardId = $(e.currentTarget).attr("data-boardId");
				var postId = $(e.currentTarget).attr("data-postId");
				var boardType = $(e.currentTarget).attr("data-boardType");
				var routerApi = "/app/board/"+boardId+"/post/"+postId;
				
				if(boardType == "STREAM") {
					routerApi = routerApi + "/stream";
				}
				
				window.open(routerApi,"_blank","scrollbars=yes,resizable=yes,width=1280,height=760");
			},
			showMore : function(e) {
				this.param.appName = "board";
				this.showAppSearchMore(this.param);
			},
			getSearchTotalCount : function(){
				//$('#boardTotalCnt').html('('+ this.collection.pageInfo().total +')');
				//this.$el.find('h1').append('('+ this.collection.pageInfo().total +')');
			},
			resetList: function(doclist) {
				if(this.param.appName != undefined){
					if(this.collection.pageInfo().total == 0){
						var nosearchResult = new NosearchResult({appName : commonLang["게시판"]});
						this.$el.find("div.cs_board_wrap").html(nosearchResult.render().el);
						return;
					}
					this.$el.find('div.cs_board_wrap').html(BoardSeachTmpl({
						lang : lang,
						dataset : this.collection.toJSON(),
						convertCreatedAt : function(){
							return GO.util.snsDate(this.createdAt, GO.lang);
						}
					}));
					this.renderPages();
				}else{
					if(this.collection.pageInfo().total == 0){
						$('#boardEmptyMessage').show();
						return;
					}
					this.$el.html(BoardSeachTmpl({
						lang : lang,
						dataset : this.collection.toJSON(),
						convertCreatedAt : function(){
							return GO.util.snsDate(this.createdAt, GO.lang);
						}
					}));
				}
				this.removeMoreBtn();
				//this.getSearchTotalCount();
				this.$el.find('.dot').dotdotdot({
					watch: "window"
				});
			},
		});
		return BoardSerach;
	});
}).call(this);
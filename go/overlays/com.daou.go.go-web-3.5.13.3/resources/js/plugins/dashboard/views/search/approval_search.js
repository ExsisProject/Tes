;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			"hgn!dashboard/templates/search/approval_search",
			"collections/paginated_collection",
			"dashboard/views/search/search_form",
			"dashboard/views/search/no_search_result",
			"i18n!nls/commons",
			"i18n!approval/nls/approval",
			"GO.util"
	], 
	function(
			Backbone,
			Hogan,
			App,
			ApprovalSearchTmpl,
			PaginatedCollection,
			SearchForm,
			NosearchResult,
			commonLang,
			approvalLang
	) {
		var lang = {
				empty_search_results : commonLang["검색결과없음"],
				more : commonLang['더보기'],
				approval : commonLang['전자결재'],
				createAt : approvalLang['기안일'],
				creator: approvalLang['기안자'],
				apprStatus : approvalLang['결재상태'],
				done : approvalLang['완료'],
				docNum : approvalLang['문서번호'],
				approvationDate : approvalLang['결재일']
		};
		
		var SearchList = PaginatedCollection.extend({
			url: function() {
				var uri = '/api/search/approval';
				
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
						type: this.type,
						keyword : this.keyword,
						fromDate: this.fromDate,
						toDate: this.toDate,
						title: this.title,
						attachFileNames: this.attachFileNames,
						attachFileContents: this.attachFileContents,
						formName: this.formName,
						searchTerm: this.searchTerm,
						dateType: this.dateType,
						page: this.pageNo, 
						offset: this.pageSize,
						docBody : this.keyword,
						drafterName : this.keyword,
						docNum : this.docNum
					});
				}
				return uri + "?" + searchParam;
			},
			setListParam: function() {
				var searchParams = GO.router.getSearch();
				this.stype = searchParams.stype;
				this.searchTerm = searchParams.searchTerm;
				this.keyword = searchParams.keyword ? searchParams.keyword.replace(/\+/gi, " ") : '' ;
				this.title = searchParams.keyword;
				this.attachFileNames = searchParams.keyword;
				this.attachFileContents = searchParams.searchAttachContents == "true" ? this.keyword : "";
				this.fromDate = searchParams.fromDate;
				this.toDate = searchParams.toDate;
				this.type = "approval";
				this.dateType = searchParams.dateType;
				this.pageNo = searchParams.page ? searchParams.page : 0;
				this.pageSize = searchParams.offset ? searchParams.offset : 5;
				this.docBody = searchParams.keyword,
				this.drafterName = this.keyword,
				this.formName = this.keyword,
				this.docNum = this.docNum
				sessionStorage.clear();
			}
		});
		
		var ApprovalSerach = SearchForm.extend({
			
			events : {
				"click #btn_more" : "showMore",
				"click #apprTitle" : "moveApprDetail"
			},
			
			initialize : function() {
				this.$el.off();
				this.param = GO.router.getSearch(); 
				if(this.param.stype != "simple"){
					this.param = {
							stype : this.param.stype,
							title : this.param.keyword,
							docBody : this.param.keyword,
							attachFileNames : this.param.keyword,
							attachFileContents : this.param.searchAttachContents == "true" ? this.param.keyword : "",
							formName : this.param.keyword,
							docNum : this.param.docNum,
							drafterName : this.param.keyword,
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
					var searchList = '<div class="cs_eapproval_wrap">'+	
								'</div>'+
								'<div class="tool_bar tool_absolute">'+
								'<div class="dataTables_length"></div>'+
							'</div>';
					this.$el.append(searchList);
				}
				return this;
			},
			moveApprDetail : function(e) {
				var id = $(e.currentTarget).attr("data-id");
				window.open("/app/approval/document/"+id,"_blank","scrollbars=yes,resizable=yes,width=1280,height=760");
			},
			showMore : function(e) {
				this.param.appName = "approval";
				this.showAppSearchMore(this.param);
			},
			getSearchTotalCount : function(){
				return 0;//this.collection.page.total;
			},
			resetList: function(doclist) {
				if(this.param.appName != undefined){
					if(this.collection.pageInfo().total == 0){
						var nosearchResult = new NosearchResult({appName : commonLang["전자결재"]});
						this.$el.find("div.cs_eapproval_wrap").html(nosearchResult.render().el);
						return;
					}
					this.$el.find('div.cs_eapproval_wrap').html(ApprovalSearchTmpl({
						lang : lang,
						dataset : this.collection.toJSON(),
						docStaus : function() {
							var docStatus = this.docStatus;
							if (docStatus == "INPROGRESS") {
								return approvalLang['진행'];
							} else if (docStatus == "COMPLETE") {
								return approvalLang['완료'];
							} else if (docStatus == "RETURN") {
								return approvalLang['반려'];
							} else if (docStatus == "TEMPSAVE") {
								return approvalLang['임시저장'];
							}
						},
						covertDraftedAt : function() {
							return this.draftedAt == null ? "" : GO.util.shortDate(this.draftedAt);
						},
						convertCompletedAt : function() {
							return this.completedAt == null ? "" : GO.util.shortDate(this.completedAt);
						}
					}));
					this.renderPages();
				}else{
					if(this.collection.pageInfo().total == 0){
						$('#approvalEmptyMessage').show();
						return;
					}
					this.$el.html(ApprovalSearchTmpl({
						lang : lang,
						dataset : this.collection.toJSON(),
						docStaus : function() {
							var docStatus = this.docStatus;
							if (docStatus == "INPROGRESS") {
								return approvalLang['진행'];
							} else if (docStatus == "COMPLETE") {
								return approvalLang['완료'];
							} else if (docStatus == "RETURN") {
								return approvalLang['반려'];
							} else if (docStatus == "TEMPSAVE") {
								return approvalLang['임시저장'];
							}
						},
						covertDraftedAt : function() {
							return this.draftedAt == null ? "" : GO.util.shortDate(this.draftedAt);
						},
						convertCompletedAt : function() {
							return this.completedAt == null ? "" : GO.util.shortDate(this.completedAt);
						}
					}));
				}
				this.removeMoreBtn();
			},
			
		});
		return ApprovalSerach;
	});
}).call(this);
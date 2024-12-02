;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			"hgn!dashboard/templates/search/webfolder_search",
			"views/pagination",
			"dashboard/views/search/search_form",
			"dashboard/views/search/no_search_result",
			"i18n!nls/commons",
			"jquery.go-sdk"
	], 
	function(
			Backbone,
			Hogan,
			App,
			FileSeachTmpl,
			PaginationView,
			SearchForm,
			NosearchResult,
			commonLang
	) {
		var lang = {
				empty_search_results : commonLang["검색결과없음"],
				more : commonLang['더보기'],
				file : commonLang['자료실']
		};
		
		
		var FileSerach = SearchForm.extend({
			
			events : {
				"click #btn_more" : "showMore",
				"click #downFiles" : "downloadFile",
				"click #moveFile" : "moveFileDetail"
			},
			
			initialize : function() {
				this.$el.off();
				this.fileResources = null;
				this.param = GO.router.getSearch();
				_.extend(this.param, {
					keyWord : this.param.keyword,
					fullPath : "/",
					offset : this.param.offset || 5,
					currentPage : parseInt(this.param.page) + 1 || 0,
					sortby : "date"
				})
			},
			
			render : function() {

				this.fileResources = this.getFileResources(this.param);
				if(this.param.appName != undefined){
					var searchList = '<div class="cs_reference_wrap">'+	
								'</div>'+
								'<div class="tool_bar tool_absolute">'+
								'<div class="dataTables_length"></div>'+
							'</div>';
					this.$el.append(searchList);
				}
				this.resetList(this.fileResources);
				return this;
			},
			getFileResources : function(param){
				var url = "/api/webfolder/folder/list";
				var data = "";
				
				$.go(url, param, {
					qryType : 'GET',
					async : false,
					responseFn : function(response) {
						data = response.data;
					},
					error: function(response){
					}
				});
				return data;
			},
			moveFileDetail : function(e) {
				window.open("/app/webfolder?searchFolder=user","_blank","scrollbars=yes,resizable=yes,width=1280,height=760");
			},
			showMore : function(e) {
				this.param.appName = "file";
				this.showAppSearchMore(this.param);
			},
			removeMoreBtn : function() {
				if(this.param.appName != undefined){
					return;
				}
				if(this.fileResources.currentPage >= this.fileResources.pageCount){
					return;
				}
				this.$el.find('#btn_more').css('display','');
			},
			downloadFile : function(e){
				var dwuids = $(e.currentTarget).attr('data-id');
				var type = $(e.currentTarget).attr('data-type');
				var path = $(e.currentTarget).attr('data-path');
				var sroot = $(e.currentTarget).attr('data-sroot');
				var userseq = $(e.currentTarget).attr('data-userseq');
				window.location.href = "/api/webfolder/file/download?uids="+dwuids+"&type="+type +"&path="+path+"&sroot="+sroot+"&sharedUserSeq="+userseq;
			},
			getSearchTotalCount : function(){
				//$('#fileTotalCnt').html('('+ this.fileResources.total +')');
				//this.$el.find('h1').html('('+ this.fileResources.total +')');
			},
			pageInfo: function() {
				var info = {
					total: this.fileResources.total,
					pageNo: this.fileResources.currentPage - 1,
					pageSize: this.param.offset,
					lastPageNo: Math.ceil(this.fileResources.total / this.param.offset),
					pages: [],
					prev: false,
					next: false
			    };
				
				var minPage = (Math.floor(info.pageNo / 10) * 10);
				var maxPage = (Math.ceil((info.pageNo+1) / 10) * 10);
				if (minPage == info.lastPageNo && info.lastPageNo == 0) {
					info.pages.push(0);
				}
				
				for (var i = minPage; i < maxPage; i++) {
					if (i >= info.lastPageNo) {
						break;
					}
					info.pages.push(i);
				}
				
				if (this.fileResources.currentPage - 1 > 0) {
					info.prev = true;
			    };
			    
			    if (this.fileResources.currentPage < info.lastPageNo) {
			    	info.next = true;
			    };
			    
			    return info;
			},
			resetList: function(list) {
				if(this.param.appName != undefined){
					if(this.pageInfo().total == 0){
						var nosearchResult = new NosearchResult({appName : commonLang["자료실"]});
						this.$el.find("div.cs_reference_wrap").html(nosearchResult.render().el);
						return;
					}
					this.$el.find('div.cs_reference_wrap').html(FileSeachTmpl({
						lang : lang,
						dataset : list.messages,
						ext : function(){
							var ext = ["xlsx", "pptx", "docx"];
							var webFolderFileExt = this.webFolderFileExt;
							if($.inArray(webFolderFileExt, ext) > 0){
								return webFolderFileExt.slice(0,-1);
							}else{
								return webFolderFileExt;
							}
						},
						createAt : function(){
							return GO.util.snsDate(this.webFolderFileUtcDate, GO.lang);
						}
					}));
					this.renderPages();
				}else{
					if(this.pageInfo().total == 0){
						return;
					}
					this.$el.html(FileSeachTmpl({
						lang : lang,
						dataset : list.messages,
						ext : function(){
							var ext = ["xlsx", "pptx", "docx"];
							var webFolderFileExt = this.webFolderFileExt;
							if($.inArray(webFolderFileExt, ext) > 0){
								return webFolderFileExt.slice(0,-1);
							}else{
								return webFolderFileExt;
							}
						},
						createAt : function(){
							return GO.util.snsDate(this.webFolderFileUtcDate, GO.lang);
						}
					}));
				}
				this.removeMoreBtn();
			},
			emptyMessage : function() {
				if(this.pageInfo().total == 0){
					return (" "+commonLang["자료실"]);
				}
			},
			renderPages: function() {
				this.pageView = new PaginationView({pageInfo: this.pageInfo()});
				this.pageView.bind('paging', this.selectPage, this);
				this.$el.find('div.tool_absolute > div.dataTables_paginate').remove();
				this.$el.find('div.tool_absolute').append(this.pageView.render().el);
			},
			selectPage: function(pageNo) {
				this.param.page = pageNo;
				App.router.navigate("unified/app/search?" + this.serializeObj(this.param), true);
			}
		});
		return FileSerach;
	});
}).call(this);
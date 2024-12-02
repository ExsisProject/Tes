;(function() {
	define([
	        "jquery",
			"backbone",
			"hogan",
			"app",
			"hgn!dashboard/templates/search/mail_search",
			"views/pagination",
			"dashboard/views/search/search_form",
			"dashboard/views/search/no_search_result",
			"i18n!nls/commons",
			"jquery.go-sdk"
	], 
	function(
			$,
			Backbone,
			Hogan,
			App,
			MailSeachTmpl,
			PaginationView,
			SearchForm,
			NosearchResult,
			commonLang
	) {
		var lang = {
				empty_search_results : commonLang["검색결과없음"],
				more : commonLang['더보기'],
				mail : commonLang['메일']
		};
		
		
		var MailSerach = SearchForm.extend({
			
			events : {
				"click #btn_more" : "showMore",
				"click #mailTitle" : "showMailReadPopup"
			},
			
			initialize : function() {
				this.$el.off();
				this.mailResources = null;
				this.param = GO.router.getSearch(); 
				_.extend(this.param, {	
										folder : "all",
										keyWord : this.param.keyword,
										fromaddr : this.param.keyword,
										toaddr : this.param.keyword,
										operation : "or",
										sharedFlag : "user",
										sharedUserSeq : 0,
										sharedFolderName : "",
										page : parseInt(this.param.page) + 1 || 1,
										offset : this.param.offset,
										category : this.param.searchAttachContents == "true" ? "sbafab" : "sbaf",
										sdate : (this.param.fromDate) ? moment(this.convertTime(this.param.fromDate) + "-00-00-00", "YYYY-MM-DD-HH-mm-ss").utc().format() : "",
										edate : (this.param.toDate) ? moment(this.convertTime(this.param.toDate) + "-23-59-59", "YYYY-MM-DD-HH-mm-ss").utc().format() : "",
										adv : "on"
									});
			},
			
			render : function() {
				this.mailResources = this.getMailResources(this.param);
				if(this.param.appName != undefined){
					var searchList = '<div class="cs_mail_wrap">'+	
								'</div>'+
								'<div class="tool_bar tool_absolute">'+
								'<div class="dataTables_length"></div>'+
							'</div>';
					this.$el.append(searchList);
				}
				this.resetList(this.mailResources);
				return this;
			},
			
			getMailResources : function(param){
				var url = GO.contextRoot + "api/mail/message/list";
				var data = "";
				
				$.go(url, JSON.stringify(param), {
					qryType : 'POST',
					contentType : 'application/json',
					async : false,
					responseFn : function(response) {
						data = response.data;
					},
					error: function(response){
					}
				});
				
				return data;
			},
			showMailReadPopup : function(e){
				var folder = $(e.currentTarget).attr('data-folder');
				var uid = $(e.currentTarget).attr('data-id');
				var param = {};
				param.folderType = "all";
				param.folder = folder;
				param.uid = uid;
				param.keyWord = this.param.keyWord;
				param.page = this.param.page;
				param.adv = this.param.adv;
				param.category = this.param.category;
				if (this.param.fromDate && this.param.fromDate != "") {
					param.sdate = this.param.sdate;
				}
				if (this.param.toDate && this.param.toDate != "") {
					param.edate = this.param.edate;
				}
			    param.action = "read";
			    POPUPDATA = param;
			    var wname = "popupRead"+(Math.floor(Math.random() * 1000000) + 1);
			    POPUPDATA.wname = wname;
			    
			    window.open(GO.contextRoot + "app/mail/popup",wname,"scrollbars=yes,resizable=yes,width=800,height=640");
			},
			showMore : function(e) {
				this.param.appName = "mail";
				this.param.page = 0;
				this.showAppSearchMore(this.param);
			},
			removeMoreBtn : function() {
				if(this.param.appName != undefined){
					return;
				}
				if(this.mailResources.pageInfo.nextPage <= this.mailResources.pageInfo.page){
					return;
				}
				
				this.$el.find('#btn_more').css('display','');
			},
			getSearchTotalCount : function(){
				return this.pageInfo().total;
			},
			renderPages: function() {
				this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
				this.pageView.bind('paging', this.selectPage, this);
				this.$el.find('div.tool_absolute > div.dataTables_paginate').remove();
				this.$el.find('div.tool_absolute').append(this.pageView.render().el);
			},
			selectPage: function(pageNo) {
				this.collection.setPageNo(pageNo);
				this.collection.fetch();
			},
			pageInfo: function() {
				if (!this.mailResources) return {
					total: 0
				};
				var info = {
					total: this.mailResources.pageInfo.total,
					pageNo: this.mailResources.pageInfo.page - 1,
					pageSize: this.param.offset,
					lastPageNo: Math.ceil(this.mailResources.pageInfo.total / this.param.offset),
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
				
				if (this.param.page - 1 > 0) {
					info.prev = true;
			    };
			    
			    if (this.param.page < info.lastPageNo) {
			    	info.next = true;
			    };
			    
			    return info;
			},
			resetList: function(doclist) {
				if(this.param.appName != undefined){
					if(this.pageInfo().total == 0){
						var nosearchResult = new NosearchResult({appName : commonLang["메일"]});
						this.$el.find("div.cs_mail_wrap").html(nosearchResult.render().el);
						return;
					}
					this.$el.find('div.cs_mail_wrap').html(MailSeachTmpl({
						lang : lang,
						dataset : doclist.messageList,
						createAt : function(){
							return GO.util.snsDate(this.dateUtc, GO.lang);
						}
					}));
					this.renderPages();
				}else{
					if(this.pageInfo().total == 0){
						return;
					}
					this.$el.html(MailSeachTmpl({
						lang : lang,
						dataset : doclist.messageList,
						createAt : function(){
							return GO.util.snsDate(this.dateUtc, GO.lang);
						}
					}));
				}
				this.removeMoreBtn();
			},
			emptyMessage : function(){
				if(this.pageInfo().total == 0){
					return (" "+commonLang["메일"]);
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
			},
			convertTime : function(time){
				if(time == null || time == "" || time == undefined){
					return "";
				}
				var date = time.split('T');
				return date[0];
			}
		});
		return MailSerach;
	});
}).call(this);
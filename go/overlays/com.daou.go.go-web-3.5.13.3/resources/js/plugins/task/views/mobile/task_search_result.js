;(function() {
	define([
			"backbone",
			"app",
			
			"i18n!nls/commons",
			"i18n!task/nls/task",
			"task/collections/task_search_results",
			"views/mobile/header_toolbar"
	], 
	function(
			Backbone,
			App,
			
			commonLang,
			taskLang,
			SearchResults,
			HeaderToolbarView
	) {
		var lang = {
			total : taskLang["총"],
			count : taskLang["건"],
			empty : commonLang["해당 검색 결과가 존재하지 않습니다."],
			keyword : commonLang["검색어"],
			context : commonLang["위치"],
			status : taskLang["상태"],
			title : commonLang["제목"],
			detail : taskLang["상세내용"],
			activity : taskLang["활동기록"],
			comment : commonLang["댓글"],
			assignee : taskLang["담당자"],
			register : taskLang["등록자"],
			term : taskLang["기한"],
			more : commonLang["더보기"],
			attachName : commonLang['첨부파일 명'],
			attachContent : commonLang['첨부파일 내용']
		};
		
		
		var SearchResultTpl = Hogan.compile(
			'<div class="content_page">' +
				'<div class="content report">' +
					
					'<header class="article_header">' +
						'<h2 class="search_title">' + commonLang["검색어"] + ' : <strong>{{param.keyword}}</strong></h2>' +
					'</header>' +

					'<ul class="list_normal list_search list_task"></ul>' +
					'<div class="paging">' +
						'<a class="btn_type4" data-value="-1" data-type="prev" id="prev" href="javascript:;" {{^page.isPossiblePrev}}style="display:none;"{{/page.isPossiblePrev}}>' + 
							'<span class="ic ic_arrow3_l"></span>' + 
							'<span class="txt">' + commonLang["이전"] + '</span>' +
						'</a>' + 
						'<span class="page">' + 
							'<span class="current_page" id="listCurrent">{{page.firstIndex}}</span>' + 
							'<span class="txt_bar">-</span>' + 
							'<span class="total_page" id="listMax">{{page.lastIndex}}</span>' + 
						'</span>' +
						'<a class="btn_type4" data-value="1" data-type="next" id="next" href="javascript:;" {{^page.isPossibleNext}}style="display:none;"{{/page.isPossibleNext}}>' + 
							'<span class="txt">' + commonLang["다음"] + '</span>' + 
							'<span class="ic ic_arrow3_r"></span>' + 
						'</a>' + 
					'</div>' +
				'</div>' +
			'</div>'
		);		
		
		var SearchItemTpl = Hogan.compile(
				'<a class="tit">' +
					'<span class="state etc">{{data.status.name}}</span>' +
					'<span class="subject">' +
						'<span class="title">{{{data.name}}}</span>' +								
					'</span>' +
					'<span class="info">' +
						'<span class="reporter txt_ellipsis">' + 
							taskLang["담당자"] + ' : {{{data.assignees}}}' + 
						'</span>' +
						'<span class="part">|</span>' +
						'<span class="name txt_ellipsis">' + 
							taskLang["등록자"] + ' : {{{data.creator}}}' + 
						'</span>' +
						'{{#hasDueDate}}' +
						'<span class="part">|</span>' +
						'<span class="date">{{dueDate}}</span>' +
						'{{/hasDueDate}}' +
					'</span>' +								
				'</a>'
				); 
		
		
		var SearchItemView = Backbone.View.extend({
			tagName : "li",
			
			events : {
				"vclick a" : "moveDetail"
			},
			
			
			initialize : function() {},
			
			
			render : function() {
				var dueDate = this.model.get("dueDate");
				
				this.$el.html(SearchItemTpl.render({
					data : this.model.toJSON(),
					dueDate : dueDate ? GO.util.basicDate2(this.model.get("dueDate")) : "",
					hasDueDate : dueDate ? true : false
				}));
			},
			
			
			moveDetail : function() {
				App.router.navigate("task/" + this.model.id + "/detail", true);
			}
		});
		
		
		var SearchResultView = Backbone.View.extend({
			events : {
				"vclick a[data-value]" : "paging"
			},
			
			
			initialize : function() {
				this.param = GO.router.getSearch(); 
				this.results = new SearchResults({
					param : this.param
				});
				
				console.log(this.param);
			},
			
			
			dataFetch : function() {
				return this.results.fetch();
			},
			
			
			render : function() {

				HeaderToolbarView.render({
					isClose : true,
					title : commonLang["검색결과"],
					isWriteBtn : true,
					writeBtnCallback : function(){
						App.router.navigate("task/create", {trigger: true, pushState: true});
					}
				});
                
                this.$el.html(SearchResultTpl.render({
					lang : lang,
					param : this.param,
					isSimple : _.has(this.param, "keyword"),
					folderNames : this.param.folderNames || commonLang["전체"],
					statusName : this.param.statusName || commonLang["전체"],
					term : this.getTermLabel(),
					page : this.results.getPageInfo()
				}));
                
				return this;
			},
			
			
			renderResult : function() {
				this.$("ul").find("li").remove();
				
				if (this.results.page.total == 0) {
					this.renderEmptyContent();
					return;
				}
				
				_.each(this.results.models, function(result) {
					var searchItem = new SearchItemView({
						model : result
					});
					this.$("ul").append(searchItem.el);
					searchItem.render();
				}, this);
				
				var pageInfo = this.results.getPageInfo();
				pageInfo.isPossiblePrev ? this.$("#prev").show() : this.$("#prev").hide();
				pageInfo.isPossibleNext ? this.$("#next").show() : this.$("#next").hide();
			},
			
			
			renderEmptyContent : function() {
				var html = [
					'<li class="creat data_null">' +
						'<span class="txt">{{lang.empty}}</span>' +
					'</li>'
				];
				
				this.$("ul").append(Hogan.compile(html.join("")).render({
					lang : lang
				}));
				this.$("#moreButton").hide();
			},
			
			
			showMore : function() {
				var self = this;
				
				this.results.setNextPage();
				this.results.fetch({
					success : function() {
						self.renderResult();
					}
				});
			},
			
			
			getTermLabel : function() {
				var termLabel = "";
				
				if (this.param.termName == taskLang["직접선택"]) {
					var fromDate = GO.util.shortDate(this.param.fromDate);
					var toDate = GO.util.shortDate(this.param.toDate);
					termLabel = fromDate + " ~ " + toDate;
				} else {
					termLabel = this.param.termName;
				}
				
				return termLabel;
			},
			
			
			paging : function(e) {
				var target = $(e.currentTarget);
				var type = target.attr("data-type"); 
				var pageInfo = this.results.getPageInfo();
				if (type == "prev" && !pageInfo.isPossiblePrev) return;
				if (type == "next" && !pageInfo.isPossibleNext) return;
				
				var self = this;
				var value = target.attr("data-value");
				this.results.setPage(this.results.page.page + parseInt(value));
				this.results.fetch({
					success : function() {
						self.renderResult();
						self.setCurrentPage();
						GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
					}
				});
			},
			
			
			setCurrentPage : function() {
				var pageInfo = this.results.getPageInfo();
				this.$("#listCurrent").text(pageInfo.firstIndex);
				this.$("#listMax").text(pageInfo.lastIndex);
			}
		});
		
		return SearchResultView;
	});
}).call(this);
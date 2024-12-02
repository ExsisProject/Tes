;(function() {
	define([
			"backbone",
			"app",
			
			"i18n!nls/commons",
			"i18n!task/nls/task",
			"hgn!task/templates/task_search_result",
			"task/views/task_title",
			"task/views/task_search_item",
			"task/collections/task_search_results"
	], 
	function(
			Backbone,
			App,
			
			commonLang,
			taskLang,
			SearchResultTpl,
			TaskTitleView,
			SearchItemView,
			SearchResults
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
			creator : taskLang["등록자"],
			term : taskLang["기한"],
			more : commonLang["더보기"],
			attachName : commonLang['첨부파일 명'],
			attachContent : commonLang['첨부파일 내용']
		};
		
		
		var SearchResultView = Backbone.View.extend({
			events : {
                "click #searchMoreButton": "showMore"
			},
			
			
			initialize : function() {
				this.param = GO.router.getSearch();
				this.results = new SearchResults({
					param : this.param
				});
				
			},
			
			
			dataFetch : function() {
				return this.results.fetch();
			},
			
			
			render : function() {
				this.$el.html(SearchResultTpl({
					lang : lang,
					param : this.param,
					isSimple : _.has(this.param, "keyword"),
					folderNames : this.param.folderNames || commonLang["전체"],
					statusName : this.param.statusName || commonLang["전체"],
					term : this.getTermLabel() 
				}));
				
				var taskTitleView = new TaskTitleView({
					title : commonLang["검색결과"],
					count : this.results.page.total
				});
				this.$el.find(".content_top").html(taskTitleView.el);
				taskTitleView.render();

                this._renderMoreButton();
                this._bindScrollEvent();
				return this;
			},

            _bindScrollEvent: function() {
                var self = this;
                $(window).bind('scroll.task', function (ev) {
                    var d_height = $(document).height();
                    var w_height = $(window).height();
                    var s_height = d_height - w_height;
                    var d_top = $(document).scrollTop();
                    if ((s_height - d_top) < 2) {
                        if(self.$el.find('div.bottom_action').is(':visible')){
                            self.showMore();
                        }
                    }
                });
            },

			renderResult : function() {
				if (this.results.page.total == 0) {
					this.renderEmptyContent();
					return;
				}
				
				_.each(this.results.models, function(result) {
					var searchItem = new SearchItemView({
						model : result
					});
					this.$("tbody").append(searchItem.el);
					searchItem.render();
				}, this);
			},
			
			
			renderEmptyContent : function() {
				var html = [
					'<tr>' +
						'<td colspan="6">' +
							'<p class="data_null">' +
							'<span class="ic_classic ic_no_result"></span>' +
							'<span class="txt">{{lang.empty}}</span>' +
							'</p>' +
						'</td>' +
					'</tr>'
				];
				
				this.$("tbody").append(Hogan.compile(html.join("")).render({
					lang : lang
				}));
				this.$("#moreButton").hide();
			},
			
			
			showMore : function() {
				var self = this;
                this.$('#searchMoreButton').hide();
                this.results.setPage(this.results.page.page + 1);
				this.results.fetch({
					success : function() {
						self.renderResult();
                        self._renderMoreButton();
					}
				});
			},

            _renderMoreButton: function() {
                if (!this.results.page.lastPage) {
                    this.$('#searchMoreButton').show();
                } else {
                    this.$('#searchMoreButton').hide();
                }
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
			}
		});
		return SearchResultView;
	});
}).call(this);
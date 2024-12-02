;(function() {
	define([
			"backbone",
			"app",
			
			"i18n!nls/commons",
			"i18n!task/nls/task",
			"hgn!task/templates/task_title",
			"task/views/task_search_popup",
			"dashboard/views/search/detail_search_popup"
	], 
	function(
			Backbone,
			App,
			
			commonLang,
			taskLang,
			taskTitleTpl,
	        SearchView,
	        totalSearchView
	) {
		var lang = {
			"searchDetail" : commonLang["상세검색"],
			"search" : commonLang["검색"],
			"total" : taskLang["총"],
			"count" : taskLang["건"],	
			'app_search' : commonLang["앱검색"],
			'unified_search' : commonLang["통합검색"],
			'task' : commonLang['업무'],
			'detail' : commonLang["상세"]
		};
		
		
		var TaskTitleView = Backbone.View.extend({
			events : {
				"click #searchDetail" : "detailPopup",
				"click #searchSimple" : "searchSimple",
				"keypress #keyword" : "searchAction"
			},
			
			
			initialize : function(options) {
				this.title = options.title;
				this.subTitle = options.subTitle;
				this.isPrivate = options.isPrivate;
				this.count = options.count;
				this.hasFavorite = options.hasFavorite;
				this.isFavorite = options.isFavorite;
			},
			
			
			render : function() {
				this.$el.html(taskTitleTpl({
					lang : lang,
					title : this.title,
					subTitle : this.subTitle,
					isPrivate : this.isPrivate,
					count : this.count,
					hasFavorite : this.hasFavorite,
					isFavorite : this.isFavorite
				}));
				this.$el.find('input[placeholder]').placeholder();
				return this;
			},
			
			
			detailPopup : function(e) {
				var searchType = $('#searchType').val();
				if(searchType != "appSearch"){
					this.detailTotalSearchPopup(e);
					return;
				}
				
				var self = this;
				var searchView = new SearchView();
				var targetOffset = $(e.currentTarget).offset();
				
				this.searchPopup = $.goSearch({
                    modal : true,
                    header : commonLang["상세검색"],
                    offset : {
						top : parseInt(targetOffset.top + 30, 10),
						right : 7
					},
					callback : function() {
						if (searchView.validate()) 
							self.search(searchView.getSearchParam());
					}
                });
				
				this.searchPopup.find(".content").html(searchView.el);
				searchView.dataFetch().done(function() {
					searchView.render();
				});
			},
			
			
			search : function(param) {
				var searchType = $('#searchType').val();
				if(searchType == "appSearch"){
					App.router.navigate("task/search?" + this.serializeObj(param), true);
				}else{
					param.offset = 5;
					App.router.navigate('unified/search?'+this.serializeObj(param), true);
				}
			},
			
			
			searchSimple : function() {
				var keyword = this.$("#keyword").val();
				keyword = $.trim(keyword);
				if($('input#keyword').attr('placeholder') === keyword){
					keyword = '';
				}
				if (!keyword) {
					$.goSlideMessage(commonLang["검색어를 입력하세요."], "caution");
					return;
				}
				
				if (keyword.length < 2 || keyword.length > 64) {
					$.goMessage(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1 : 2, arg2 : 64}));
					return;
				}
				
				if($.goValidation.isInValidEmailChar(keyword)){
					$.goMessage(commonLang['메일 사용 불가 문자']);
					return;
				}
				
				var param = {
					stype : "simple",
					keyword : keyword
				};
				
				this.search(param);
			},
			
			
			searchAction : function(e) {
				if (e.which == 13) this.searchSimple();
			},
			
			
			/* 공백 문제가 있어 $.param 사용하지 않음 */
			serializeObj : function(obj) {
				var str = [];
				for(var p in obj) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
				return str.join("&");
			},
			
			detailTotalSearchPopup : function(e) {
				var self = this;
				var detailSearchPopupView = new totalSearchView();
				var targetOffset = $(e.currentTarget).offset();
				
				this.searchPopup = $.goSearch({
                    modal : true,
                    header : commonLang["상세검색"],
                    offset : {
						top : parseInt(targetOffset.top + 30, 10),
						right : 7
					},
					callback : function() {
						if (detailSearchPopupView.validate()) 
							self.search(detailSearchPopupView.getSearchParam());
					}
                });
				
				this.searchPopup.find(".content").html(detailSearchPopupView.el);
				detailSearchPopupView.render();
			},
		});
		return TaskTitleView;
	});
}).call(this);
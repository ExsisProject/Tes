;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			"board/collections/post_search",
			"hgn!dashboard/templates/search/community_search",
			"views/pagination",
			"i18n!nls/commons"
	], 
	function(
			Backbone,
			Hogan,
			App,
			SearchCollection,
			CommunitySeachTmpl,
			PaginationView,
			commonLang
	) {
		var lang = {
				empty_search_results : commonLang["검색결과없음"],
				more : commonLang['더보기']
		};
		
		
		var SearchForm = Backbone.View.extend({
			
			events : {
			},
			
			initialize : function() {
				this.$el.off();
			},
			
			serializeObj : function(obj) {
				var str = [];
				for(var p in obj) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
				return str.join("&");
			},
			
			showAppSearchMore : function(param) {
				param.offset = 10;
				App.router.navigate("unified/app/search?" + this.serializeObj(param), true);
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
			
			removeMoreBtn : function() {
				var pageInfo = this.collection.pageInfo();
				if(this.param.appName != undefined){
					return;
				}
				if(parseInt(pageInfo.pageSize) * (parseInt(pageInfo.pageNo)+1) >= parseInt(pageInfo.total)){
					return;
				}
				this.$el.find('#btn_more').show();
			},
		});
		return SearchForm;
	});
}).call(this);
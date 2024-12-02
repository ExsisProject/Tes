;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			"hgn!dashboard/templates/search/no_search_result",
			"i18n!nls/commons",
			"i18n!dashboard/nls/dashboard"
	], 
	function(
			Backbone,
			Hogan,
			App,
			NoSearchResultTmpl,
			commonLang,
			dashboardLang
	) {
		var lang = {
				empty_search_results : commonLang["검색결과없음"],
				more : commonLang['더보기'],
				empty_search_msg_1 : dashboardLang['- 더 많은 검색결과를 원하신다면?'],
				empty_search_msg_2 : dashboardLang['- 단어의 철자가 정확한지 확인해 보세요.'],
				empty_search_msg_3 : dashboardLang['- 검색어의 단어 수를 줄이거나, 다른 단어로 검색해 보세요.'],
				empty_search_msg_4 : dashboardLang['- 두단어 이상인 경우, 띄어쓰기를 확인해 보세요'],
				return_search_results : dashboardLang['통합검색 결과보기']
		};
		
		
		var TodoSerach = Backbone.View.extend({
			
			events : {
				"click #returnUnifiedSearch" : "returnUnifiedSearch"
			},
			
			initialize : function(option) {
				this.$el.off();
				this.param = GO.router.getSearch();
				this.option = option || {};
				this.useIntegrateSearch = _.isBoolean(this.option.useIntegrateSearch) ? this.option.useIntegrateSearch : true
			},
			
			render : function() {
				this.$el.html(NoSearchResultTmpl({
					lang : lang,
					appName : this.option.appName,
					useIntegrateSearch : this.useIntegrateSearch,
					noKeywordSearch : App.i18n(dashboardLang["'검색어' 에 대한 검색결과가 없습니다."],{"arg1": this.param.keyword ? this.param.keyword : commonLang['검색어']})
				}));
				return this;
			},
			returnUnifiedSearch : function(){
				delete this.param.appName;
				this.param.offset = 5;
				App.router.navigate("unified/search?" + this.serializeObj(this.param), true);
			},
			serializeObj : function(obj) {
				var str = [];
				for(var p in obj) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
				return str.join("&");
			},
		});
		return TodoSerach;
	});
}).call(this);
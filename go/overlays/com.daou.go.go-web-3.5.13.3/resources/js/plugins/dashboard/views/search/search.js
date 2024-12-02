	define([
			"backbone",
			"hogan",
			"app",
			"dashboard/views/search/detail_search_popup",
			"hgn!dashboard/templates/search/search",
			"i18n!nls/commons",
			"jquery.go-validation"
	], 
	function(
			Backbone,
			Hogan,
			App,
			DetailSearchPopupView,
			SearchTpml,
			commonLang
	) {
		var lang = {
			advanced_search : commonLang["상세검색"],
			unified_search : commonLang["통합검색"],
			search : commonLang["검색"],
			detail : commonLang['상세']
		};
		
		return Backbone.View.extend({
			
			events : {
				'click #btn-search' : 'searchAll',
				'click #btn_DetailSearch' : 'detailPopup',
				'keydown #search-keyword' : 'searchKeyEvent'
			},
			
			initialize : function() {
				this.$el.off();
			},
			
			render : function() {
				this.$el.html(SearchTpml({
					lang : lang
				}));
				
				return this;
			},

			searchAll : function(){
				var $keyword = this.$("#search-keyword");
				var keyword = $keyword.val();
				keyword = $.trim(keyword);
				if(keyword == ''){
					$.goError(commonLang['검색어를 입력하세요.']);
					$keyword.focus();
					return;
				}
				
				if(!$.goValidation.isCheckLength(2,64,keyword)){
					$.goMessage(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"64"}));
					return;
				}
				
				if($.goValidation.isInValidEmailChar(keyword)){
					$.goMessage(commonLang['메일 사용 불가 문자']);
					return;
				}
				
				var param = {
						stype : "simple",
						keyword : keyword,
						offset : 5,
						page : 0,
						fromDate : GO.util.toISO8601('1970/01/01'),
						toDate : GO.util.toISO8601(new Date()),
						searchTerm : "all"
					};
				this.search(param);
			},

			search : function(param){
				App.router.navigate("unified/search?" + this.serializeObj(param), true);
			},

			serializeObj : function(obj) {
				var str = [];
				for(var p in obj) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
				return str.join("&");
			},

			detailPopup : function(e) {
				var self = this;
				var detailSearchPopupView = new DetailSearchPopupView();
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

			searchKeyEvent : function(e){
				var self = this;
				this.clearTimeOut = setTimeout(function(){
					if(e.keyCode == 13){
						self.searchAll();
					}
				}, 200);
			}
			
		});
	});
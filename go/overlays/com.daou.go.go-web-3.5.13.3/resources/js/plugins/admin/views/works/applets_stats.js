;(function() {
	define([
			"backbone",			
			"i18n!nls/commons",
			"i18n!admin/nls/admin",
			"i18n!works/nls/works",	
			"hgn!admin/templates/works/applets_stats",
			"admin/models/applets_stats",	
			"collections/paginated_collection",
			"grid"
	], 
	function(
			Backbone,		
			commonLang,
			adminLang,
			worksLang,
			AppletsStatsTpl,
			AppletsStats,
			PaginatedCollection,
			GridView
	) {
		var lang = {
			"count" : commonLang["개"],
			"title" : commonLang["제목"],
			"운영자" : adminLang["운영자"],
			"생성일" : adminLang["생성일"],
			"데이터 등록 수" : worksLang["데이터 등록 수"],
			"생성자" : worksLang["생성자"],
			"앱명" : worksLang["앱명"],
			"총 앱 개수" : worksLang["총 앱 개수"],
			"총 데이터 수" : worksLang["총 데이터 수"]
		};
		
		var AppletsStatsCollection = PaginatedCollection.extend({ 
			
			url : function() {
	    		return GO.contextRoot + "ad/api/works/applets?" + this.makeParam();
	    	},
	    	
	    	csvUrl : function() {
	    		return GO.contextRoot + "ad/api/works/applets/download?" + this.makeParam();
	    	},
		});
		
		var AppletsStatsView = Backbone.View.extend({		

			events : {
				"click #search" : "search",
				"click #download" : "download",
                "click .wrap_action" : "onClickedWrapAction"
			},
			
			initialize : function(options) {
				this.stats = new AppletsStats();
				this.stats.fetch({async : false});				
				this.collection = new AppletsStatsCollection();
			},
			
			render : function() {
				this.$el.html(AppletsStatsTpl({
					lang : lang,
					stats : this.stats.toJSON(),
					totalAppletCount : GO.util.numberWithCommas(this.stats.totalAppletCount()),
					totalDocCount : GO.util.numberWithCommas(this.stats.totalDocCount())
				}));
				
				this.renderList();
				this.renderButton();
				
				return this;
			},

			renderList : function() {
				this.listView = new GridView({
					tableClass : "chart size",
					useToolbar: true,
					checkbox: false,
					collection: this.collection,
	    			isAdmin : true,
					columns : [{
						name : "name",
	    				className : "sorting title",
	    				label : worksLang["앱명"],
	    				sortable : true,
	    				render : function(model) {
	    					return '<a><span data-id="' + model.get("id") + '">' + model.get("appletName") + '</span></a>';
	    				} 
					}, {
						name : "docCount",
	    				className : "sorting_disable part",
	    				label : worksLang["데이터 등록 수"],
	    				sortable : false,
	    				render : function(model) {
	    					return GO.util.numberWithCommas(model.get("docCount"));
	    				} 
					}, {
						name : "createdBy",
	    				className : "sorting state",
	    				label : worksLang["생성자"],
	    				sortable : true,
	    				render : function(model) {
							if( !!model.get("createdBy")) {
								return model.get("createdBy").name + " " + model.get("createdBy").position;
							}else{
								return "-";
							}
	    				} 
					}, {
						name : "admins",
	    				className : "sorting_disable state",
	    				label : adminLang["운영자"],
	    				sortable : false,
	    				render : function(model) {
	    					return model.get('adminInfo');
	    				} 
					}, {
						name : "createdAt",
	    				className : "sorting last date",
	    				label : adminLang["생성일"],
	    				sortable : true,
	    				render : function(model) {
	    					return GO.util.shortDate(model.get("createdAt"));
	    				} 
					}],
					searchOptions : [{
						value : "name",
						label : worksLang["앱명"]
					}, {
						value : "createdBy",
						label : worksLang["생성자"]
					}, {
						value : "admins",
						label : adminLang["운영자"]
					}]
				});
				this.$('#appletList').html(this.listView.render().el);
				this.collection.fetch();
				
				this.listView.$el.on("navigate:grid", $.proxy(function(event, appletId) {
					GO.router.navigate("works/applets/" + appletId, true);
				}, this));
			},
			
			renderButton : function() {
				this.$("div.tool_bar").first().removeClass("toolbar").addClass("toolbar_top header_tb");
				this.$("div.custom_header").append('<span class="btn_tool" id="download">' + adminLang["목록 다운로드"] + '</span>');
			},
			
			enterEventHandler : function(e) {
				if (e.which == 13) this.search();
			},
			
			search : function() {
	    		var keyword = this.$("#searchKeyword").val();
	    		if (!keyword) {
	    			$.goMessage(commonLang["검색어를 입력해주세요."]);
	    			return;
	    		}
	    		this.listOption["keywordType"] = this.$("#searchType").val();
	    		this.listOption["keyword"] = this.$("#searchKeyword").val();
	    		this.dataTable.tables.fnSettings().sAjaxSource = this.getSearchUrl();
	    		this.dataTable.tables.fnClearTable();
	    	},
	    	
	    	getSearchUrl : function() {
	    		return GO.contextRoot + "ad/api/works/applets?" + $.param(this.listOption);
	    	},
	    	
	    	download : function() {
	    		console.log("download");
				window.location.href = this.collection.csvUrl();
	    	},
            onClickedWrapAction : function() {
                this.$el.find('.wrap_action').toggle();
                this.$el.find('.info_summary li').not('.first').toggle();
            },
		});
		
		return AppletsStatsView;
	});
}).call(this);
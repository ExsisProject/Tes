;(function() {
define([
		"jquery",
		"backbone", 	
		"app",
		"views/mobile/header_toolbar",
		'report/collections/report_search',
		"hgn!report/templates/mobile/m_report_result",
		"hgn!report/templates/mobile/m_report_result_item",
		"i18n!nls/commons",
	    "i18n!report/nls/report",
		"jquery.go-sdk",
		"GO.util"
	], 
	function(
		$,
	    Backbone, 	
	    GO,
		HeaderToolbarView,
	    SearchCollection,
	    ReportResultTmpl,
	    ReportResultItemTmpl,
	    CommonLang,
	    ReportLang
	) {		    
		var lang = {
			search_result : CommonLang['검색결과'],
			search_empty : CommonLang["검색결과없음"]
		};
		
		var ReportResultView = Backbone.View.extend({
		    el : "#content",
		    events : {
		        "vclick a[data-btn='paging']" : "goPaging",
		        "vclick #result_list li.search_result" : "moveReport",
		    },
			initialize: function() {
				this.collection = null;
				
				this.offset = GO.config('mobileListOffset') || 20;
				this.$listEl = null;
			},
			goPaging : function(e) {
				GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
				e.stopPropagation();
				
				var direction = $(e.currentTarget).attr('data-direction'),
					cPage = this.collection.page.page || 0;
				
				if(direction == 'prev' && cPage > 0) cPage--;
				else if(direction == 'next') cPage++;

				$(e.currentTarget).parents('.paging').remove();
				
				var data = {
						"page" : cPage,
						"offset" : this.offset,
						"stype" : this.stype,
						"keyword" : this.keyword,
						"fromDate" : this.fromDate,
						"toDate" : this.toDate
				};
				this.collection.fetch({async:false, data : data,reset:true});
				
				this.$el.find("#result_list").html(this.makeResultItems());
				//모바일 페이징 추가
                var pagingTpl = GO.util.mPaging(this.collection);
                this.$el.find("#result_list").append(pagingTpl);
                GO.util.appLoading(false);
			},
			render: function() {
                var _this = this;
                
				GO.util.appLoading(true);
				
				HeaderToolbarView.render({
					isClose : true,
					title : lang.search_result
				});

				var searchParams = GO.router.getSearch();;
				var opt =  {
							stype : searchParams.stype,
							keyword : searchParams.keyword,
							fromDate : searchParams.fromDate,
							toDate : searchParams.toDate,
							page : GO.router.getSearch('page') || 0,
							offset : this.offset,
							properties : searchParams.properties
				};

				this.collection = SearchCollection.searchCollection(opt,searchParams.isCommunity, true);
				
                this.$el.html(
                    ReportResultTmpl(
                        {
                            keyword : searchParams.keyword,
                            data : this.collection.toJSON(),
                            resultItems : this.makeResultItems(),
                            lang : lang
                        }
                ));
				
                this.$el.addClass("report");
                
				//모바일 페이징 추가
				var pagingTpl = GO.util.mPaging(this.collection);
				this.$el.find("#result_list").append(pagingTpl);
				GO.util.appLoading(false);
			},
			makeResultItems : function(){
			    var resultItems = [];
			    if(this.collection.length == 0){
			        resultItems.push("<li class='creat data_null'>");
			        resultItems.push("<span class='txt'>" +lang.search_empty+ "</span>");
			        resultItems.push("</li>");
			    }else{
			        this.collection.each(function(model, index){
			            var reportResultItem = ReportResultItemTmpl({
			                data : $.extend({}, model.toJSON(), {
								submittedAt : GO.util.basicDate3(model.get("submittedAt"))
			                }),
			                makeTitle : function(){
			                    if(this.folderType == "PERIODIC"){
			                        var series = GO.util.parseOrdinaryNumber(this.seriesNo, GO.config("locale"));
			                        return this.folderDeptName + " " +GO.i18n(ReportLang['제 {{arg1}}회차'], {"arg1": series});
			                    }else{
			                        return this.title;
			                    }
			                }
			            });
			            
			            resultItems.push(reportResultItem);
			        });
			    }
			    return resultItems.join("");
			},
            moveReport : function(e){
                var targetEl = $(e.target),
                    patentEl = targetEl.parents("li.search_result"),
                    reportId = patentEl.attr("data-report-id"),
                    seriesId = patentEl.attr("data-series-id"),
                    folderId = patentEl.attr("data-folder-id"),
                    type = patentEl.attr("data-report-type"),
                    url = "";
                    
                if(type == "PERIODIC"){
                    url = "report/series/"+seriesId+"/report/"+reportId;
                }else{
                    url = "report/folder/"+folderId+"/report/"+reportId;
                }
                
                GO.router.navigate(url, {trigger: true});
            }
		});
		
		return ReportResultView;
	});
}).call(this);
(function() {
	define([
        "jquery", 
        "backbone", 
        "app", 
        "hogan",
        "i18n!report/nls/report", 
        "views/profile_card", 
        "report/views/report_title", 
        "report/collections/report_search", 
        "hgn!report/templates/search_result", 
        "hgn!report/templates/search_result_item",
        "i18n!nls/commons",
        "jquery.go-sdk"
    ], 
    
    function(
        $, 
        Backbone, 
        GO, 
        Hogan,
        ReportLang, 
        ProfileView, 
        ReportTitleView, 
        SearchCollection, 
        ReportSearchResultTmpl, 
        ReportSearchResultItemTmpl,
        CommonLang 
    ) {	
		var lang = {
			'search_result' : CommonLang['검색결과'],
			'all' : CommonLang['전체'],
			'location' : CommonLang['위치'],
			'content' : CommonLang['본문 내용'],
			'comment' : CommonLang['댓글 내용'],
			'attach_name' : CommonLang['첨부파일 명'],
			'attach_content' : CommonLang['첨부파일 내용'],
			'writer' : CommonLang['작성자'],
			'term' : CommonLang['기간'],
			'search' : CommonLang['검색어'],
			'no_search_result' : CommonLang['해당 검색 결과가 존재하지 않습니다.'],
			'more' : CommonLang["더보기"],
			"detail_show" : CommonLang["자세히 보기"],
			"all_term" : CommonLang['전체'] + CommonLang['기간']
		};
		
		var ReportResult = Backbone.View.extend({
		    el : "#content",
		    events : {
		        "click ul.article_list li.classic" : "moveReport",
		        "click ul.article_list li.classic span.photo" : "viewProfileCard",
		        "click ul.article_list li.classic div.info a.name" : "viewProfileCard",
		        "click #searchMoreButton" : "listMore"
		    },
			initialize: function() {
				this.$el.off();
				this.searchParams = "";
			},
	         render: function() {
                GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
                
                var _this = this;
                
                this.searchParams = GO.router.getSearch();

                $(window).unbind('scroll.report');
                $(window).bind('scroll.report', function (ev) {
                     d_height = $(document).height(); 
                     w_height = $(window).height();  
                     s_height = d_height - w_height;
                     d_top = $(document).scrollTop(); 
                     if ((s_height - d_top) < 2) {
                         if(_this.$el.find('div.bottom_action').is(':visible')){
                             _this.listMore();                      
                         }
                     }
                });
                
                this.searchParams.page = '0';
                this.searchParamsoffset = '15';
                
                this.collection = SearchCollection.searchCollection(this.searchParams);
                
                this.$el.html(ReportSearchResultTmpl(
                        {
                            searchParam : $.extend({},this.searchParams, {
                                isDetail : this.searchParams.stype == "detail" ? true : false,
                                keyword : this.searchParams.keyword == undefined ? lang.all : this.searchParams.keyword,
                                folder : this.searchParams.folderNames == undefined ? lang.all : this.searchParams.folderNames.split("%2c").join(",&nbsp&nbsp"),
                                content : this.searchParams.content == "" ? lang.all : this.searchParams.content,
                                comment : this.searchParams.comment == "" ? lang.all : this.searchParams.comment,        
                                attachFileNames : this.searchParams.attachFileNames == "" ? lang.all : this.searchParams.attachFileNames,
                        		attachFileContents : this.searchParams.attachFileContents == "" ? lang.all : this.searchParams.attachFileContents,
                                reporter : this.searchParams.reporterName  == "" ? lang.all : this.searchParams.reporterName ,
                                fromDate : GO.util.shortDate(this.searchParams.fromDate),
                                toDate : GO.util.shortDate(this.searchParams.toDate),
                                isAllTerm : GO.util.shortDate(this.searchParams.fromDate) == "1970-01-01"
                            }),
                            data : this.collection.toJSON(),
                            isEmpty : this.collection.length == 0 ? true : false,
                            lang : lang
                        }
                ));
                
                this.listRender();
                
                ReportTitleView.create({
                    text : lang.search_result,
                    num_section : GO.i18n(CommonLang["총건수"], {num : this.collection.page ? this.collection.page.total : 0})
                });
                
                $.goPopup.close();
                this.moreBtnHide();
                return this;
            },
            listRender : function(){
                var resultItems = [];
                this.collection.each(function(model, index){
                    var reportResultItem = ReportSearchResultItemTmpl({
                        data : $.extend({}, model.toJSON(), {
                            submittedAt : GO.util.basicDate3(model.get("submittedAt"))
                        }),
                        lang : lang
                    });

                    resultItems.push(reportResultItem);
                });
                $("#reportResult").append(resultItems);
            },
            listMore : function(){
                this.searchParams.page = this.collection.page.page + 1;
                this.collection = SearchCollection.searchCollection(this.searchParams);
                this.listRender();
                this.moreBtnHide();
            },
            viewProfileCard : function(e){
                var targetEl = $(e.currentTarget),
                    patentEl = targetEl.parents("li.classic"),
                    userId = patentEl.data("user-id");
                
                ProfileView.render(userId, e.currentTarget);
                e.stopPropagation();
            },
            moveReport : function(e){
                var targetEl = $(e.target),
                    patentEl = targetEl.parents("li.classic"),
                    reportId = parseInt(patentEl.attr("data-report-id")),
                    seriesId = parseInt(patentEl.attr("data-series-id")),
                    folderId = parseInt(patentEl.attr("data-folder-id")),
                    folderType = parseInt(patentEl.attr("data-folder-type")),
                    url = "";
                
                if(folderType == "PERIODIC"){
                    url = "report/series/"+seriesId +"/report/"+reportId;
                }else{
                    url = "report/folder/"+folderId +"/report/"+reportId;
                }
                
                GO.router.navigate(url, {trigger: true});
            },
			
			showProfileCard :function(e){
				var userId = $(e.currentTarget).attr('data-userid');
				ProfileView.render(userId, e.currentTarget);
				e.stopPropagation();
			},
			moreBtnHide : function(){
				if(this.collection.length == 0){
					$('#searchMoreButton').hide();
					return;
				}
				
				var islastpage = this.collection.page.lastPage;			
				if(islastpage){
					$('#searchMoreButton').hide();
				}else{
					$('#searchMoreButton').show();
				}
			}
		});
		
		return ReportResult;
	});
}).call(this);
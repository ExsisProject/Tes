(function() {
	define([
        "jquery", 
        "backbone", 
        "app", 
        "i18n!board/nls/board", 
        "views/profile_card", 
        "board/views/board_title", 
        "board/collections/post_search", 
        "hgn!board/templates/post_result", 
        "hgn!board/templates/post_result_more", 
        "i18n!nls/commons", 
        "jquery.go-sdk"
    ], 
    
    function(
        $, 
        Backbone, 
        App, 
        boardLang, 
        ProfileView, 
        BoardTitleView, 
        SearchCollection, 
        TplPostResult, 
        TplPostResultMore, 
        commonLang 
    ) {	
		var lang = {
			'search_result' : commonLang['검색결과'],
			'all' : commonLang['전체'],
			'board' : boardLang['위치'],
			'content' : boardLang['본문 내용'],
			'comment' : boardLang['댓글 내용'],
			'attachName' : boardLang['첨부파일 명'],
			'attachContent' : commonLang['첨부파일 내용'],
			'writer' : boardLang['작성자'],
			'term' : boardLang['기간'],
			'search' : commonLang['검색어'],
			'no_search_result' : commonLang['해당 검색 결과가 존재하지 않습니다.'],
			'detail' : commonLang['자세히 보기'],
			'more' : boardLang['더 보기']
		};
		var PostResult = Backbone.View.extend({
			initialize: function(opt) {
				this.isCommunity = opt.isCommunity;
			},
			
			unbindEvent: function() {
				this.$el.off("click", ".post_result [evt-profile]");
				this.$el.off("click", "ul.article_list li");
				this.$el.off("click", "#searchMoreButton");
			}, 
			
			bindEvent: function() {
				this.$el.on("click", ".post_result [evt-profile]", $.proxy(this.showProfileCard, this));
				this.$el.on("click", "ul.article_list li", $.proxy(this.viewDetailLi, this));
				this.$el.on("click", "#searchMoreButton", $.proxy(this.listMore, this));
			}, 
			
			viewDetailLi : function(e){
				var targetEl = $(e.currentTarget);
				this.moveBoardAction(targetEl);	
			},
			
			moveBoardAction : function(targetEl){
				if(targetEl.attr('data-hidden') == 'true'){
					$.goSlideMessage(boardLang['열람권한이 없는 게시물입니다.']);
					return;
				}else{
					var boardType = targetEl.attr('data-boardType');
					var boardId = targetEl.attr('data-boardId');
					var postId = targetEl.attr('data-postId');
					
					$.go(GO.contextRoot+"api/board/"+boardId+"/master", '', {
						qryType : 'GET',					
						contentType : 'application/json',
						responseFn : function(response) {
							var communityId = 0;
							if(response.data.ownerType == "Community") {
								communityId = response.data.ownerId;
							}
							var routerApi = "board/"+boardId+"/post/"+ postId;
							if(communityId) {
								routerApi = "community/"+communityId+"/"+routerApi;
							}
							if(boardType == "STREAM") {
								routerApi = routerApi + "/stream";
							}
							
							App.router.navigate(routerApi, true);
						}
					});
				}
			},
			
			showProfileCard :function(e){
				var userId = $(e.currentTarget).attr('data-userid');
				if(userId != ""){
					ProfileView.render(userId, e.currentTarget);
				}
				e.stopPropagation();
			},
			moreBtnHide : function(collection){
				// 더보기 버튼 유무
				if(collection.length == 0){
					$('#searchMoreButton').hide();
					return;
				}
				
				var islastpage = collection.page.lastPage;			
				if(islastpage){
					$('#searchMoreButton').hide();
				}else{
					$('#searchMoreButton').show();
				}
			},
			listMore : function(){
				var page = parseInt(this.collection.page.page) +1;
			
				var opt = { "page":page , "offset":"15" };
				
		
				if(this.stype == "simple"){
					opt.stype = this.stype;
					opt.keyword = this.keyword;
					opt.fromDate = this.fromDate;
					opt.toDate = this.toDate;
				}else{
					opt.stype = this.stype;
					opt.title = this.title;
					opt.content = this.content;
					opt.comments = this.comments;
					opt.attachFileNames = this.attachFileNames;
					opt.attachFileContents = this.attachFileContents;
					opt.userName = this.userName;
					opt.boardIds = this.boardIds;
					opt.fromDate = this.fromDate;
					opt.toDate = this.toDate;
				}
				this.collection = SearchCollection.searchCollection(opt,this.isCommunity);
				
				var searchlistTpl = this.makeTemplete({
					data : this.collection,
					type : 'more'
				});
				this.$el.find('ul.article_list').append(searchlistTpl);
				this.moreBtnHide(this.collection);
			},
			makeTemplete : function(opt){
				
				var data = opt.data;
				var searchData = opt.searchData;
				var boardName = opt.boardName;
				var searchType = opt.searchType;
				var type = opt.type;
				
				var dateParse = function(date){
					return GO.util.snsDate(this.createdAt);
				};
				
				var checkFileType = function(){
					
					var fileType = "def";
					if(GO.util.fileExtentionCheck(this.fileExt)){
						fileType = this.fileExt;
					}
					return fileType;
					
				};
				
				var isDetaiSearch = function(){
					if(searchType == "detail"){
						return true;
					}
					return false;
				};
				
				var resultContentParse = function(){
					if(this.hiddenPost){
						return boardLang['열람권한이 없는 게시물입니다.'];
					}
					var content = this.content; 
					content = content.replace(/<br \/>/gi, "");					
					return content;
				};
				
				var isStream = function(){
					var boardType = this.boardType;
					if(boardType == "STREAM"){
						return false;
					}
					return true;
				};
				
				var parseDate = function(){
					if(searchData.allSearch == "true"){
						return lang.all + lang.term;
					}else{
						return GO.util.shortDate(searchData.fromDate) + " ~ " + GO.util.shortDate(searchData.toDate);
					}
				};
				
				var tplPostResult;
				if(type){
					tplPostResult = TplPostResultMore({
						dataset:data.toJSON(),
						dateParse:dateParse,
						checkFileType:checkFileType,
						boardName:boardName,
						resultContentParse:resultContentParse,
						isStream:isStream,
						lang:lang
					});
				}else{
					tplPostResult = TplPostResult({
						dataset:data.toJSON(),
						dateParse:dateParse,
						checkFileType:checkFileType,
						searchData:searchData,
						boardName:boardName,
						parseFromDate:GO.util.shortDate(searchData.fromDate),
						parseToDate:GO.util.shortDate(searchData.toDate),
						isDetaiSearch:isDetaiSearch,
						resultContentParse:resultContentParse,
						isStream:isStream,
						lang:lang,
						parseDate : parseDate
					});
				}
				
				return tplPostResult;
			},
			render: function() {
				
				GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
				
				this.unbindEvent();
				this.bindEvent();
				
				var _this = this,
					searchParams = App.router.getSearch();

				$(window).unbind('scroll.board');
				$(window).bind('scroll.board', function (ev) {
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
				var opt = null;
				if(searchParams.stype == 'simple'){
					opt = {
							stype : searchParams.stype,
							keyword : searchParams.keyword,
							fromDate : searchParams.fromDate,
							toDate : searchParams.toDate,
							page : '0',
							offset : '15'
					};
				}else if(searchParams.stype == 'detail'){
					opt = {
							stype : searchParams.stype,
							title : searchParams.title,
							content : searchParams.content,
							comments : searchParams.comments,
							attachFileNames : searchParams.attachFileNames,
							attachFileContents : searchParams.attachFileContents,
							userName : searchParams.userName,
							boardIds : searchParams.boardIds,
							fromDate : searchParams.fromDate,
							toDate : searchParams.toDate,
							page : '0',
							offset : '15',
							allSearch : searchParams.allSearch
					};
				}
				
				this.collection = SearchCollection.searchCollection(opt,searchParams.isCommunity);
				
				var data = this.collection;
				var page = data.page || {};
				var searchData = opt;
				var boardName = searchParams.boardName;
				var searchType = searchParams.searchType;
				var isCommunity = searchParams.isCommunity == 'true' ? true : false;
				this.stype = searchParams.stype;
				this.title = searchParams.title || '';
				this.content = searchParams.content || '';
				this.comments = searchParams.comments || '';
				this.attachFileNames = searchParams.attachFileNames || '';
				this.attachFileContents = searchParams.attachFileContents || '';
				this.userName = searchParams.userName || '';
				this.boardIds = searchParams.boardIds || '';
				this.keyword = searchParams.keyword || '';
				this.fromDate = searchParams.fromDate;
				this.toDate = searchParams.toDate;		

				searchData.content = this.content || lang['all'];
				searchData.comments = this.comments || lang['all'];
				searchData.attachFileNames = this.attachFileNames || lang['all'];
				searchData.attachFileContents = this.attachFileContents || lang['all'];
				searchData.userName = this.userName || lang['all'];
				
				var searchlistTpl = this.makeTemplete({
					data : data,
					searchData : searchData,
					boardName : boardName || lang['all'],
					searchType : searchType
				});
				
				
				this.$el.html(searchlistTpl);	
				
				BoardTitleView.render({
					el : '.content_top',
					dataset : {
						name : lang['search_result'],
						postCount : page.total || ''
					},
					isCommunity:isCommunity
				});
				
				$.goPopup.close();		
				this.moreBtnHide(data);
				
			},
		});
		
		return {
			render: function(opt) {
				var postResult = new PostResult({
						el: '#content',
						isCommunity: opt && opt.isCommunity ? opt.isCommunity : false
					});
				return postResult.render();				
				
			}
		};
	});
}).call(this);
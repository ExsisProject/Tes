(function() {
	define([
	        "app",
	        "community/models/info",
	        "community/collections/posts",
	        "hgn!community/templates/home",
	        "hgn!community/templates/home_more",
	        "i18n!nls/commons",
	        "board/views/board_title",
		    "i18n!board/nls/board",
		    "i18n!community/nls/community",
	        "GO.util"
	        ], 
	        function(
	        		App,
	        		CommunityModel,
	        		CommunityPostCollection,
	        		tplCommunityHome,
	        		tplCommunityHomeMore,
	        		commonLang,
	        		BoardTitleView,
	        		boardLang,
	        		communityLang
	        ) {
		var instance = null,
			lang = {
				'board' : commonLang['게시판'],
				'community' : communityLang['커뮤니티 글'],
				'detail_search' : commonLang['상세검색'],
				'detail_view' : commonLang['자세히 보기'],
				'more_view' : boardLang['더 보기'],
				'search' : commonLang['검색'],
				'search_result' : commonLang['검색결과'],
				'total' : boardLang['총'],
				'count' : boardLang['건'],
				'not_list' : boardLang['의 커뮤니티 등록이 완료되었습니다. \n게시판을 생성하여, 글을 등록 할 수 있습니다.'],
				'new_board' : boardLang['게시판 만들기'], 
				'new_post' : boardLang['새 글 작성하기'],
				'new_post_desc' : boardLang['아직 등록된 글이 없습니다. 아래 버튼을 클릭하여, 글을 등록해 주세요.'],
				'no_auth' : boardLang['열람권한이 없는 게시물입니다.'],
				'new_post_null' : communityLang['커뮤니티에 게시물이 존재하지 않습니다.']
		};
		
		var CommunityHome = Backbone.View.extend({
			el : '#content',
			manage : false,
			
			events : {
			    "click #homeListCreateBoardBtn" : "createBoard",
			    "click #homeListCreatePostBtn" : "createPost",
			    "click ul.home_list li" : "moveDetail",
			    "click .board_link" : "moveBoard",
			    "click span.photo a, a.name" : "showProfileCard"
			},
			
			initialize: function(options) {
			    this.$el.off();
				this.options = options || {};
				this.communityId = this.options.communityId;
			},
			
			createBoard : function(){				
				App.router.navigate("community/"+this.communityId+'/board/create',true);
			},
			
			createPost : function(){				
				App.router.navigate("community/"+this.communityId+'/board/post/write',true);
			},
			
			moveDetail : function(e){
				var targetEl = $(e.currentTarget),
    				boardType = targetEl.attr('data-boardType'),
    				boardId = targetEl.attr('data-boardId'),
    				postId = targetEl.attr('data-postId'),
					isHiddenPost = targetEl.attr('data-hidden'),
    				communityId = targetEl.attr('data-communityId');

				if (isHiddenPost == 'true') {
                    alert(boardLang['게시글 열람불가 메세지']);
                    return;
				}

				if(boardType == "CLASSIC"){
					App.router.navigate("community/"+communityId+"/board/"+boardId+"/post/"+postId, true);
				} else if(boardType == 'STREAM'){					
					App.router.navigate("community/"+communityId+"/board/"+boardId+"/post/"+postId+"/stream", true);
				} else {
					App.router.navigate("community/"+communityId+"/board/"+boardId, true);
				}		
			},
			
			moveBoard : function(e){
			    var targetEl = $(e.currentTarget).parents("li:first"),
			        communityId = targetEl.attr('data-communityid'),
			        boardId = targetEl.attr('data-boardid');
			    
                App.router.navigate("community/" + communityId + "/board/"+boardId, true);
                e.stopPropagation();
			},
			
			render : function(opt) {
				var _this = this;	
				
				$(window).unbind('scroll.community');
				$(window).bind('scroll.community', function (ev) {
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
				
				this.collection = CommunityPostCollection.getCollection({communityId:this.communityId,"page":0,"offset":"15"});
				
				var homelistTpl = _this.makeTemplete({
					dataSet:this.collection.toJSON(),
				});
				
				this.$el.html(homelistTpl);
				
				BoardTitleView.render({
					el : '.content_top',
					dataset : {
						name : lang.community,
					},
					isCommunity : true
				});
				
				this.moreBtnHide(this.collection);
			},
			
	         moreBtnHide : function(){
                // 더보기 버튼 유무
                if(this.collection.length == 0){
                    $('#moreButton').hide();
                    return;
                }
                
                var islastpage = this.collection.page.lastPage;         
                if(islastpage){
                    $('#moreButton').hide();
                }else{
                    $('#moreButton').show();
                }
            },
			
			listMore : function(){
				var _this = this;
				var page = parseInt(this.collection.page.page) +1;
				this.collection = CommunityPostCollection.getCollection({communityId:this.communityId,"page":page,"offset":"15"});
				var homelistTpl = _this.makeTemplete({
					dataSet:this.collection.toJSON(),
					type : 'more'
				});
				
				this.$el.find('ul.article_list').append(homelistTpl);
				this.moreBtnHide(this.collection);
			},
			
			makeTemplete : function(opt){
				
				var communityInfo = CommunityModel.read({communityId:this.communityId});
				var type = opt.type;
				var homelistTpl;

                var boardType = function(){
                    if(this.type == "CLASSIC"){
                        return "classic";
                    }
                    return "feed";
                };

				var isZero = function(){
					if(parseInt(this.recommendCount) == 0){
						return 'zero';				
					}
					return '';
				};
				
				var dateParse = function(date){
					return GO.util.snsDate(this.createdAt);
				};
				
				var isClassic = function(){
					var type = this.type;
					if(type == "CLASSIC"){
						return true;
					}
					return false;
				};
				
				var contentParse = function(){				
					return  GO.util.textToHtml($.goValidation.charEllipsis(GO.util.convertMSWordTag(this.summary),40));
				};
				
				var isPostHidden = function() {
					return this.hiddenPost;
				};

				var isTitleHidden  = function() {
					return this.summary == " $$#HIDDEN_POST#$$ ";
				};
				
				var isCommunityMember = function() {
					if(communityInfo.toJSON().memberStatus == "ONLINE") {
						return true;
					} else {
						return false;
					}
				};
				
				if(type){
					homelistTpl = tplCommunityHomeMore({
						dataSet:this.collection.toJSON(),
						isZero:isZero,
						contentParse:contentParse,
						dateParse:dateParse,
						isClassic:isClassic,
						lang:lang,
						isPostHidden:isPostHidden,
						isTitleHidden:isTitleHidden,
						community : communityInfo.toJSON(),
						isCommunityMember : isCommunityMember,
                        boardType : boardType
					});
				}else{
					homelistTpl = tplCommunityHome({
						dataSet:this.collection.toJSON(),
						isZero:isZero,
						contentParse:contentParse,
						dateParse:dateParse,
						isClassic:isClassic,
						lang:lang,
						isPostHidden:isPostHidden,
                        isTitleHidden:isTitleHidden,
						community : communityInfo.toJSON(),
						isCommunityMember : isCommunityMember,
						hasBoard : communityInfo.get('boardCount') > 0,
                        boardType : boardType
					});
				}
				
				return homelistTpl;
			},
		});

		return {
			render: function(communityId) {
				instance = new CommunityHome({ communityId : communityId, page:0, offset:30 });
				return instance.render();				
			}
		};
	});

}).call(this);
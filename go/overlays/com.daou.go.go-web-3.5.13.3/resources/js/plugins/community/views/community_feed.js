//게시판 글 목록 HOME
(function() {
	define([
	        "jquery",
	        "backbone", 	
	        "app",
	        "community/collections/myfeeds",
	        "hgn!community/templates/community_feed",
	        "hgn!community/templates/feed_list_more",
	        "hgn!community/templates/community_user_null",
	        "i18n!nls/commons",
	        "i18n!community/nls/community",
	        "i18n!board/nls/board",
	        "jquery.go-grid",
	        "jquery.go-preloader"
	        ], 
	        function(
	        		$,
	        		Backbone,
	        		App,
	        		communityMyfeedsCollection,
	        		tplCommunityByFeed,
	        		LayoutTplMore,
	        		tplCommunityNull,
	        		commonLang,
	        		communityLang,
	        		boardLang
	        ) {
		
		var tplVar = {
				'joincommunity': communityLang['가입 커뮤니티'],
				'community_name': communityLang['커뮤니티 명'],
				'search': commonLang['검색'],
				'community': commonLang['커뮤니티'],            
				'all_post': communityLang['전체 글'],
	            'community_member' : communityLang['회원'],
	            'new_post' : communityLang['새 글 등록'],
	            'thumnail' : communityLang['초상화'],
	            'post_null' : communityLang['아직 작성 된 글이 없습니다.'],
	            'total' : communityLang['총'],
	            'count' : boardLang['개'],
	            'not_community' : communityLang['가입된 커뮤니티가 없습니다.'],
	            'join_community' : communityLang['가입하기'],
	            'no_auth' : boardLang['열람권한이 없는 게시물입니다.'],
	            'no_posts' : boardLang['등록된 글이 없습니다.'],
	            'more_view' : boardLang['더 보기'],
	            'new_post' : commonLang['새글']
	        };
		
		var Communities = Backbone.View.extend({
			rankEl : null,
			el : '.tab_contents',
			
			events:function(){
				
			},
			
			initialize: function() {			
				this.unbindEvent();
				this.bindEvent();
				this.collection = communityMyfeedsCollection.create();
				this.hasCommunity = (this.options.hasCommunity != undefined) ? this.options.hasCommunity : true;
			},
			
			bindEvent: function() {
				this.$el.on("click", "ul.home_list li", $.proxy(this.viewDetailLi, this));
				this.$el.on("click", "#moreButton", $.proxy(this.listMore, this));
				this.$el.on("click", "span.photo a, a.name", $.proxy(this.showProfileCard, this));
				this.$el.on("click", ".boardName", $.proxy(this.moveBoardLink, this));
				this.$el.on("click", ".category_link", $.proxy(this.moveCommunityLink, this));
			},
			
			unbindEvent: function() {
				this.$el.off("click", "ul.home_list li");
				this.$el.off("click", "#moreButton");
    			this.$el.off("click", "span.photo a");
    			this.$el.off("click", ".boardName");
    			this.$el.off("click", ".category_link");
			},
			
			render: function() {	
				var self = this;
				$(window).unbind('scroll.community');
    			$(window).bind('scroll.community', function (ev) {
    				 d_height = $(document).height(); 
    				 w_height = $(window).height();  
    				 s_height = d_height - w_height;
    				 d_top = $(document).scrollTop(); 
    				 if ((s_height - d_top) < 2) {
    					 if(self.$el.find('div.bottom_action').is(':visible')){
    						 self.listMore();						
    					 }
    				 }
    			});
				
                var preloader = $.goPreloader();
                preloader.render();
    			
    	        this.collection.fetch({
                    data: {
                        "page": 0,
                        "offset": 15},
                    async : false,
                    statusCode: {
                        403: function() { GO.util.error('403', { "msgCode": "400-board"}) }, 
                        404: function() { GO.util.error('404', { "msgCode": "400-board"}) }, 
                        500: function() { GO.util.error('500'); }
                    },
                    success : function(collection){
                        var communityFeedListTpl = self.makeTemplete({
                            collection : collection
                        });
                        self.$el.html(communityFeedListTpl);
                        
                        if(!self.hasCommunity) {
                            $('li[data-id="noCommunity"]').show();
                            $('li[data-id="noCommunity"]').css('display','');
                        }else if(collection.size() <= 0){
                            $('li[data-id="noPost"]').show();
                            $('li[data-id="noPost"]').css('display','');
                        }
                            
                        self.moreBtnHide(collection);
                    }
                }).done(function(){
                    preloader.release();
                });
			},
			
			showProfileCard : function(e){
    			ProfileView = require("views/profile_card");
    			var userId = $(e.currentTarget).attr('data-userid');
    			if(userId != ""){
    				ProfileView.render(userId, e.currentTarget);
    			}
    			e.stopPropagation();
    		},
    		
    		moveBoardLink : function(e){
    			var targetEl = $(e.currentTarget).parents('li').first();
    			var communityId = targetEl.attr('data-communityid');
    			var boardId = targetEl.attr('data-boardid');
    			App.router.navigate("community/"+communityId + "/board/" + boardId, true);
    			e.stopPropagation();
    		},
    		
    		moveCommunityLink : function(e){
    			var targetEl = $(e.currentTarget).parents('li').first();
    			var communityId = targetEl.attr('data-communityid');
    			App.router.navigate("community/"+communityId, true);
    			e.stopPropagation();
    		},
    		
			listMore : function(){
    			var _this = this;
    			var page = parseInt(this.collection.page.page) +1;
    			var data = { "page":page , "offset":"15"};
    			this.collection = communityMyfeedsCollection.getCollection(data);
    			var communityFeedListTpl = _this.makeTemplete({
    				collection : this.collection,
    				type : 'more'
    			});
    			this.$el.find('ul.article_list').append(communityFeedListTpl);
    			this.moreBtnHide(this.collection);
    		},
    		
    		moreBtnHide : function(collection){
    			// 더보기 버튼 유무
    			if(collection.length == 0){
    				$('#moreButton').hide();
    				return;
    			}
    			
    			var islastpage = collection.page.lastPage;	
    			if(islastpage){
    				$('#moreButton').hide();
    			}else{
    				$('#moreButton').show();
    			}
    		},
    		
    		makeTemplete : function(opt){
    			var collection = opt.collection,
    				dataSet = collection.toJSON(),
    				type = opt.type,
    				communityFeedListTpl;
    			
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
    				return GO.util.textToHtml(GO.util.convertMSWordTag(this.summary));
    			};
    			
    			var titleParse = function() {
    				return GO.util.textToHtml(this.title);
    			};
    			
    			var isTitleHidden = function() {
        			return this.summary == " $$#HIDDEN_POST#$$ ";
    			};

    			var isPostHidden = function() {
					return this.hiddenPost;
				};
    			
    			if(type){
    				communityFeedListTpl = LayoutTplMore({
    					dataSet:dataSet,
    					isZero:isZero,
    					titleParse : titleParse,
    					contentParse:contentParse,
    					dateParse:dateParse,
    					isClassic:isClassic,
    					lang:tplVar,
    					isPostHidden:isPostHidden,
						isTitleHidden:isTitleHidden,
                        boardType : boardType
    				});
    			}else{
    				communityFeedListTpl = tplCommunityByFeed({
    					dataSet:collection.toJSON(),
    					isZero:isZero,
    					titleParse : titleParse,
    					contentParse:contentParse,
    					dateParse:dateParse,
    					isClassic:isClassic,
    					lang:tplVar,
    					isPostHidden:isPostHidden,
                        isTitleHidden:isTitleHidden,
    					boardType : boardType
    				});
    			}
    			
    			return communityFeedListTpl;
    			
    		},
			
			viewDetailLi : function(e){
    			var targetEl = $(e.currentTarget);
				if(targetEl.attr('data-id') == 'noCommunity'){
					return;
				}
    			this.moveCommunityAction(targetEl);	
    			e.stopPropagation();
    		},
			
    		moveCommunityAction : function(targetEl){
    			var communityId = targetEl.attr('data-communityid'),
    				boardType = targetEl.attr('data-boardType'),
    				boardId = targetEl.attr('data-boardId'),
    				postId = targetEl.attr('data-postId'),
    				isPrivate = targetEl.attr('class'),
					isHiddenPost = targetEl.attr('data-hidden')
    				isNoCommunityOrNoPost = targetEl.attr('data-id');

                if (isHiddenPost == 'true') {
                    $.goMessage(boardLang['게시글 열람불가 메세지']);
                    return;
                }

    			if(isNoCommunityOrNoPost == "noCommunity" || isNoCommunityOrNoPost == "noPost") {
    				return false;
    			}else if(boardType == "CLASSIC"){
    				App.router.navigate("community/"+communityId+"/board/"+boardId+"/post/"+postId, true);
    			}else if (boardType == 'STREAM'){
    				App.router.navigate("community/"+communityId+"/board/"+boardId+"/post/"+postId+"/stream", true);
    			}else {
    				App.router.navigate("community/"+communityId+"/board/"+boardId, true);
    			}
    		}
		});

		return {
			render: function(opts) {
				var communities = new Communities(opts);
				return communities.render();				
			}
		};
	});

}).call(this);
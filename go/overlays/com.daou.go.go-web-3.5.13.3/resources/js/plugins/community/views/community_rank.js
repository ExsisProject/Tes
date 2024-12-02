(function() {
	define([
	        "jquery",
	        "backbone", 	
	        "app",
	        "community/collections/community_rank",
	        "hgn!community/templates/community_rank",
	        "hgn!community/templates/community_rank_item",
	        "hgn!community/templates/community_detail",
	        "community/models/community_popup_info",
	        "i18n!nls/commons",
	        "i18n!community/nls/community",
	        "i18n!board/nls/board",
	        "jquery.go-grid"
	        ], 
	        function(
	        		$,
	        		Backbone,
	        		App,
	        		communityRankCollection,
	        		tplCommunityByRank,
	        		tplCommunityByRankItem,
	        		tplcommunityDetail,
	        		CommunityModel,
	        		commonLang,
	        		communityLang,
	        		boardLang
	        ) {
		
		var tplVar = {
				'all_post': communityLang['전체 글'],
	            'community_member' : communityLang['회원'],
	            'master' : communityLang['마스터'],
	            'moderator' : communityLang['부마스터'],
	            'description' : communityLang['소개'],
	            'create_at' : communityLang['개설일'],
	            'all_communities_info' : communityLang['전체 커뮤니티 정보'],
	            'most_members' : communityLang['가장 회원이 많은 커뮤니티'],
	            'most_posts' : communityLang['가장 글이 많은 커뮤니티'],
	            'most_created_at' : communityLang['가장 최근에 개설된 커뮤니티'],
	            'private' : commonLang['비공개'],
	            'date_of_opening' : communityLang['개설일자'],
	            'cnt_person' : communityLang['명'],
	            'cnt_posts' : communityLang['개'],
	            'non_member' : communityLang['비멤버'],
	            'go_to_community' : communityLang['커뮤니티 입장하기'],
	            'join_community' : communityLang['커뮤니티 가입하기']
	        };
		
		var CommunitiesRank = Backbone.View.extend({
			el : '.comm_side',
			events:function(){
				
			},
			
			initialize: function() {			
				this.unbindEvent();
				this.bindEvent();
				this.communityRankcollection = null;
			},
			
			bindEvent: function() {
				this.$el.on("click", "li[data-id='memberCount']", $.proxy(this.changeRank, this));
				this.$el.on("click", "li[data-id='postCount']", $.proxy(this.changeRank, this));
				this.$el.on("click", "li[data-id='createdAt']", $.proxy(this.changeRank, this));
			},
			
			unbindEvent: function() {
				this.$el.off("click", "li[data-id='memberCount']");
				this.$el.off("click", "li[data-id='postCount']");
				this.$el.off("click", "li[data-id='createdAt']");
			},
			moveCommunityAction : function(targetEl){
    			var communityId = targetEl.attr('data-communityid');
    			var boardType = targetEl.attr('data-boardType');
    			var boardId = targetEl.attr('data-boardId');
    			var postId = targetEl.attr('data-postId');
    			var isPrivate = targetEl.attr('class');
    			
    			if(boardType == "CLASSIC"){
    				App.router.navigate("community/"+communityId+"/board/"+boardId+"/post/"+postId, true);
    			}else if (boardType == 'STREAM'){
    				App.router.navigate("community/"+communityId+"/board/"+boardId+"/post/"+postId+"/stream", true);
    			}else if(isPrivate == "private") {
    				return;
    			}else {
    				App.router.navigate("community/"+communityId+"/board/"+boardId, true);
    			}
    		},
			render: function(selectedSideOption) { 
				var i = 1,
				    basicDate = function(date){
    				    return GO.util.basicDate2(this.createdAt);
    			    },
    			    cnt = function(){
    			        if(this.id != null)
    			            return i++;
    			    },
    			    self = this;
    			    
    			var showSelectedOption = function() {
    				if(selectedSideOption == "postCount"){
						return communityLang['가장 글이 많은 커뮤니티'];
					}else if(selectedSideOption == "createdAt"){
						return communityLang['가장 최근에 개설된 커뮤니티'];
					}else{
						return communityLang['가장 회원이 많은 커뮤니티'];
					}
				};
				if(selectedSideOption == undefined || selectedSideOption == null){
					selectedSideOption = "memberCount";
				}
				
				this.communityRankcollection = communityRankCollection.create();
    			
				self.$el.html(tplCommunityByRank({
                    lang : tplVar,
                    showSelectedOption : showSelectedOption,
                    selectedSideOption : selectedSideOption,
                }));
				
				this.communityRankcollection.fetch({
                    "data" : {
                        "page": 0,
                        "offset": 10,
                        "property": selectedSideOption
                    },
                    statusCode: {
                        403: function() { GO.util.error('403', { "msgCode": "400-board"}) }, 
                        404: function() { GO.util.error('404', { "msgCode": "400-board"}) }, 
                        500: function() { GO.util.error('500'); }
                    },
				    async : true,
				    success : function(collection){
				        self.$el.find("#rank_list").html(tplCommunityByRankItem({
		                    communityRankData: collection.toJSON(),
		                    lang : tplVar,
		                    basicDate : basicDate,
		                    cnt : cnt
		                }));
				    }
				});
			},
    		changeRank : function(e){
    			var selectedOption = $(e.currentTarget).attr('data-id');
				this.render(selectedOption);
			}
		});

		return {
			render: function(selectedSideOption) {
				var communitiesRank = new CommunitiesRank();
				return communitiesRank.render(selectedSideOption);				
			}
		};
	});

}).call(this);
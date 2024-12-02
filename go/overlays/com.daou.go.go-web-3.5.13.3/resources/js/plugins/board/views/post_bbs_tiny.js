// 클래식형 게시판 글목록
(function() {
	define([
	    "jquery",
	    "backbone", 	
	    "app",	    
	    "hgn!board/templates/post_bbs_tiny",
	    "i18n!board/nls/board",
	    'i18n!nls/commons', 
	    "jquery.go-popup",
	    "GO.util"
	], 
	function(
		$,
		Backbone,
		App,
		PostListTpl,
		boardLang,
		commonLang
	) {
		var instance = null,
			lang = {
				'num' : boardLang['번호'],
				'title' : commonLang['제목'],
				'writer' : boardLang['작성자'],
				'created_at' : boardLang['작성일'],
				'read_count' : boardLang['조회'],
				'recommend_count' : boardLang['좋아요'],
				'post_reply' : boardLang['답글'],
				'prev' : commonLang['위'],
				'next' : commonLang['아래'],
				'new_post' : boardLang['새글'],
				'post_status_close' : commonLang['비공개'],
				'post_hidden_msg' : boardLang['열람권한이 없는 게시물입니다.'],
				'post_orphan_msg' : boardLang['원글이 삭제된 답글'],
				'post_last_msg' : boardLang['마지막 게시물입니다.'],
				'post_move_impossible' : boardLang['이동하실 수 없습니다.']
			};		
		var PostBbsList = Backbone.View.extend({
			el : '#content #postBbsList',
			manage : false,
			initialize: function(options) {
				this.options = options || {};
				this.boardId = this.options.boardId;
				this.postId = this.options.postId;
				this.listParams = this.options.listParams;
				this.masterOwner = this.options.masterOwner;
				this.data = this.getData();
				this.stickable = this.options.stickable != false ? true : false;
			},
			events : {
				'click a.boardTitle' : 'showPostDetail'
			},
			render: function() {
				var self = this;
				if(this.data && this.data.length) {
					this.$el.html(PostListTpl({ 
						lang : lang,
						dataset : this.data, 
						boardId : this.boardId, 
						postId : this.postId,
						postTitle : function() {
							return GO.util.textToHtml(this.title);
						},
						renderCreatedAt : function() {
							return GO.util.boardDate(this.createdAt);
						},
						isReply : function() {
							return !!this.depth;
						},
						isClose : function() {
							return this.status === 'CLOSE';
						},
						isHiddenPost : function() {
							return this.hiddenPost;
						},
						isHiddenTitle : function() {
                            return this.summary == " $$#HIDDEN_POST#$$ ";
						},
						isActive : function() {
							return this.id == self.postId;
						}
					}));
					
					if(!this.stickable){
						$('.bbs_detail_tool', '#postContents').prepend(this.$el.find('.tiny_tool').show());
					}
					$('.tiny_tool a','.bbs_detail_tool').click(function(e) {
						if(self.$el.find('a[data-current=true]').length) {
							var currentPostId = self.$el.find('a[data-current=true]').attr('data-id'),
								currentPostKey = null,
								movePostKey = null,
								movePostData = null,
								dataKeys = $(self.data).map(function(k,v) {
									return v.id;
								}).get();
							
							for(var key in dataKeys) {
								if(dataKeys[key] == currentPostId) {
									currentPostKey =  key;
									break;
								}
							}
							movePostKey = $(e.currentTarget).hasClass('prev') ? --currentPostKey : ++currentPostKey;
							movePostData = self.data[movePostKey];
							if(movePostData == undefined) {
								$.goAlert(lang['post_last_msg'], lang['post_move_impossible']);
								return false;
							} else {
								if(movePostData['status'] == 'CLOSE' && movePostData['summary'] == " $$#HIDDEN_POST#$$ ") {
									$.goAlert(lang['post_hidden_msg'], lang['post_move_impossible']);
									return false;
								} else {
									self.showPostDetail({ currentTarget : self.$el.find('a.boardTitle[data-id="'+movePostData['id']+'"]') });
								}
							}
						}
					});
				}
			},
			getData : function() {
				if(this.listParams) {
					var data = [],
						listParams = $.extend(this.listParams, {}),
						sortkey = listParams['sortkey'] || 'createdAt',
						sortdir = listParams['sortdir'] || 'desc';
					
					listParams['sorts'] = 'sortCriteria desc,threadRootCode desc,threadCode asc';

					$.go(GO.contextRoot + 'api/board/'+this.boardId+'/posts/'+ this.postId +'/classic/tiny', listParams , {							
						qryType : 'GET',
						async : false,
						contentType : 'application/json',
						responseFn : function(rs) {
							if(rs.code == 200) {
								data = rs.data;
							} else {
								data = false;
							}
						}
					});
					return data;
				} 
				return;
			},
			_serializeObj : function(obj) {
				var str = [];
				for(var p in obj) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
				return str.join("&");
			},
			_isCommunity : function() {
				if(this.masterOwner && this.masterOwner.ownerType == 'Community') return true;
				return false;
			},
			showPostDetail : function(e) {
				var url = '',
					eventTarget = $(e.currentTarget),
					postId = eventTarget.attr('data-id')
					// tinyPage = eventTarget.attr('data-tinypage'),
					search = App.router.getSearch();
				
				// search['page'] = parseInt(tinyPage,10);
				if($(e.currentTarget).data('hidden')) {
					$.goMessage(boardLang['게시글 열람불가 메세지']);
					return;
				}

				if(this._isCommunity()) {
					url += 'community/' + this.masterOwner.ownerId + '/board/'+this.boardId+'/post/'+postId;
				} else {
					url += 'board/'+this.boardId +'/post/'+postId;
				}
				url += '/?'+this._serializeObj(search);
				App.router.navigate(url, { trigger : true });
			}
		});
		return {
			render: function(opt) {
				var postBbsList = new PostBbsList(opt);
				return postBbsList.render();
			}
		};
	});
}).call(this);
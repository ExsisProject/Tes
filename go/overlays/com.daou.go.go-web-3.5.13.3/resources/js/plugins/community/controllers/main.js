(function() {
	define([
	        "community/views/layouts/defaults"
	        ], 

	        function(
	        		DefaultLayout
	        ) {
		var CommunityController = (function() {
			var Controller = function() {

			};
			Controller.prototype = {
					render: function() {
						require(["community/views/app"], function(CommunityAppView) {
							DefaultLayout.create().setSideType('list').render().done(function(layout) {
								var appView = new CommunityAppView();
								layout.setContent(appView);
								appView.render();
							});
						});
					},
					renderCommunityCreate: function() {
						require(["community/views/create"], function(CommunityCreate) {
							DefaultLayout.create().setSideType('list').render().done(function(layout) {
								var createView = new CommunityCreate();
								layout.setContent(createView);
								createView.render();
							});
						});
					},
					
					renderCommunityHome : function(communityId) {
						require(["community/views/home"], function(CommunityHomeView) {
							var layout = DefaultLayout.create();
							layout.setCommunityId(communityId);
							layout.setSideType('home');
							layout.render().done(function(layout) {
								var content = layout.getContentElement();
								CommunityHomeView.render(communityId);
								content.append(CommunityHomeView.el);
							});
						});
					},
					
					renderCommunityInviteHome : function(communityId) {
						require(["community/views/add_member"], function(CommunityInviteHomeView) {
							var layout = DefaultLayout.create();
							layout.setCommunityId(communityId);
							layout.setSideType('home');
							layout.render().done(function(layout) {
								var content = layout.getContentElement();
								CommunityInviteHomeView.render(communityId);
								content.append(CommunityInviteHomeView.el);
							});
						});
					},
					
					renderCommunityMemberHome : function(communityId) {
						require(["community/views/members"], function(CommunityMemberHomeView) {
							var layout = DefaultLayout.create();
							layout.setCommunityId(communityId);
							layout.setSideType('home');
							layout.render().done(function(layout) {
								var content = layout.getContentElement();
								CommunityMemberHomeView.render(communityId);
								content.append(CommunityMemberHomeView.el);
							});
						});
					},
					
					renderCommunityAdminHome : function(communityId, type, subType) {
						require(["community/views/master_home"], function(CommunityMasterHomeView) {
							var layout = DefaultLayout.create();
							layout.setCommunityId(communityId);
							layout.setSideType('home');
							layout.render().done(function(layout) {
								var content = layout.getContentElement();
								CommunityMasterHomeView.render(communityId, type, subType);
								content.append(CommunityMasterHomeView.el);
							});
						});
					},
					renderBoards : function(communityId, status) {
						require(["community/views/boards"], function(BoardsView) {
							var layout = DefaultLayout.create();
							layout.setCommunityId(communityId);
							layout.setStatus(status);
							layout.setSideType('home');
							layout.render().done(function(layout) {
								var content = layout.getContentElement();
								BoardsView.render(communityId, status);
								content.append(BoardsView.el);
							});									
						});
					},					
					renderCreateBoard : function(communityId, boardId) {
						require(["community/views/board_create"], function(CreateBoardView) {
							var layout = DefaultLayout.create();
							layout.setCommunityId(communityId);
							layout.setBoardId(boardId);
							layout.setSideType('home');
							layout.render().done(function(layout) {
								var content = layout.getContentElement();
								var view = new CreateBoardView({communityId:communityId, boardId:boardId});
								content.html(view.el);
								view.render();
							});
						});
					},
					renderClosedBoard : function(communityId){
						require(["community/views/board_closed"], function(ClosedBoardView) {
							var layout = DefaultLayout.create();
							layout.setCommunityId(communityId);
							layout.setSideType('home');
							layout.render().done(function(layout) {
								var content = layout.getContentElement();
								var closeBoardView = new ClosedBoardView({communityId:communityId});
								content.append(closeBoardView.el);
								closeBoardView.render();
							});
						});
					},
					renderByBoardId: function(communityId, boardId, page) {
						require(["board/views/post_home"], function(PostHomeView) {
							var layout = DefaultLayout.create();
							layout.setCommunityId(communityId);
							layout.setBoardId(boardId);
							layout.setSideType('home');
							layout.render().done(function(layout) {
								var content = layout.getContentElement();
								var postHomeView = new PostHomeView({
									communityId : communityId,
									boardId : boardId,
									page : page
								});
								content.html(postHomeView.el);
								postHomeView.render();
							});
						});
					},
					renderByPostId : function(communityId, boardId, postId) {
						require(["board/views/post_home"], function(PostHomeView) {
							var layout = DefaultLayout.create();
							layout.setCommunityId(communityId);
							layout.setBoardId(boardId);
							layout.setSideType('home');
							layout.render().done(function(layout) {
								var content = layout.getContentElement();
								var postHomeView = new PostHomeView({
									communityId : communityId,
									boardId : boardId,
									postId : postId
								});
								content.html(postHomeView.el);
								postHomeView.render();
							});
						});
					},
					renderPostWrite : function(communityId, boardId) {	
						require(["board/views/post_write"], function(PostWrite) {
							DefaultLayout.render().done(function(layout) {	
								var opt = {communityId:communityId,boardId:boardId,postId:''};	// TODO: PostWrite 뷰 리팩토링 후 삭제
								
								layout.setCommunityId(communityId);
								layout.setBoardId(boardId);
								layout.setSideType('home');
								
								var postWriteView = new PostWrite(opt);
								layout.setContent(postWriteView);
								postWriteView.render(opt);
							});
						});
					},
					
					renderStreamByPostId : function(communityId, boardId, postId) {
						require(["board/views/post_stream_detail"], function(PostView) {
							var layout = DefaultLayout.create();
							layout.setCommunityId(communityId);
							layout.setBoardId(boardId);
							layout.setSideType('home');
							layout.render().done(function(layout) {
								var content = layout.getContentElement();
								PostView.render({communityId:communityId, boardId : boardId, postId : postId});
								content.append(PostView.el);
							});
						});
					},
					
					renderPostWriteReply : function(communityId, boardId, postId) {		
						require(["board/views/post_write"], function(PostWrite) {
							var layout = DefaultLayout.create();
							layout.setCommunityId(communityId);
							layout.setBoardId(boardId);
							layout.setSideType('home');
							layout.render().done(function(layout) {
								var content = layout.getContentElement();
								PostWrite.render({communityId:communityId,boardId:boardId,postId:postId,type:'reply'});
								content.append(PostWrite.el);
							});
						});
					},
					renderEditWriteParam : function(communityId,boardId,postId){
						require(["board/views/post_write"], function(PostWrite) {
							DefaultLayout.render().done(function(layout) {
								var content = layout.getContentElement();
								PostWrite.render({communityId:communityId,boardId:boardId,postId:postId,type:'edit'});
								content.append(PostWrite.el);
							});
						});
					},
					renderPostResult : function(){
						require(["board/views/post_result"], function(PostResult) {
							DefaultLayout.render().done(function(layout) {
								var content = layout.getContentElement();
								PostResult.render({
									isCommunity : true
								});
								content.append(PostResult.el);
							});
						});
					}
			};
			return Controller;
		})();

		return new CommunityController();
	});

}).call(this);
(function() {
	
	define([
	        "views/layouts/mobile_default",
	        "i18n!nls/commons",
	        "board/views/mobile/m_side"
    ], 
    function(
    		MobileLayout,
    		commonLang,
    		SideView
    ) {
		var BoardController = (function() {
			var appName = 'board';
			var LayoutView = MobileLayout.create();
			var SideMenuView = SideView.create(appName);
			
			
			
			var Controller = function() {
			};
			
			Controller.prototype = {
				renderSideMenu : function() {
					if($('body').data('sideApp') != appName) {
						SideMenuView.render().then(function(sideMenu) {
							var sideEl = LayoutView.getSideContentElement().append(sideMenu.el);
							GO.EventEmitter.trigger('common', 'layout:initSideScroll', this);
							sideEl.parent().hide();
						});
					} else {
						return;
					}
				},
				render: function() {
					require(["board/views/mobile/m_home_list"], function(HomeListView) {
						LayoutView.render(appName).done(function(layout) {
							HomeListView.render();
							
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderById: function(boardId, page) {
					require(["board/views/mobile/m_post_home"], function(PostHomeView) {
						LayoutView.render(appName).done(function(layout) {
							if(boardId && boardId.indexOf("?") != -1){
								boardId = boardId.split("?")[0];
				            }
							PostHomeView.render({ boardId : boardId});
							
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderByPostId : function(boardId, postId) {
					require(["board/views/mobile/m_post_home"], function(PostHomeView) {
						LayoutView.render(appName).done(function(layout) {
							if(postId && postId.indexOf("?") != -1){
								postId = postId.split("?")[0];
				            }
							PostHomeView.render({ boardId : boardId, postId: postId});
							layout.getSearchWrapElement().hide();
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderByPostIdRecommends : function(boardId, postId) {
					require(["board/views/mobile/m_post_recommends"], function(RecommendsView) {
						LayoutView.render(appName).done(function(layout) {
							RecommendsView.render({ boardId : boardId, postId: postId});
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderByPostIdComments : function(boardId, postId) {
					require(["board/views/mobile/m_post_comments"], function(CommentsView) {
						LayoutView.render(appName).done(function(layout) {
							
							CommentsView.render({ boardId : boardId, postId: postId});
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderPostWrite : function() {
					require(["board/views/mobile/m_post_write"], function(writeView) {
						LayoutView.render(appName, false).done(function(layout) {
							writeView.render({deptId:'',boardId:'',postId:''});
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderPostWriteParam : function(deptId,boardId,postId){
					require(["board/views/mobile/m_post_write"], function(PostWrite) {
						LayoutView.render(appName).done(function(layout) {
							var opt = {
								deptId:deptId,
								boardId:boardId,
								postId:postId
							};
							if(postId && postId != ''){
								opt.type = 'reply';
							}
							PostWrite.render(opt);
							Controller.prototype.renderSideMenu();
						});
					});
				},
				renderEditWriteParam : function(deptId,boardId,postId){
					require(["board/views/mobile/m_post_write"], function(PostWrite) {
						LayoutView.render(appName).done(function(layout) {
							PostWrite.render({deptId:deptId,boardId:boardId,postId:postId,type:'edit'});
							Controller.prototype.renderSideMenu();
						});
					});				
					
				},
				renderPostResult : function(){
					require(["board/views/mobile/m_post_result"], function(PostResult) {
						LayoutView.render(appName).done(function(layout) {
							var content = layout.getContentElement();
							PostResult.render();
							content.append(PostResult.el);
						});
					});
				}
			};
			
			return Controller;
		})();
		
		return new BoardController();
	});
	
}).call(this);
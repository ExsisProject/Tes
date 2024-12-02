define("board/controllers/main", function(require) {
	var CommonLang = require("i18n!nls/commons");
	var DefaultLayout = require("board/views/layouts/defaults");
	var BoardAppView = require("board/views/app");
	var r = {};
	
	/**
	 * 게시판 홈
	 */
	r.render = function() {
		DefaultLayout.render().done(function(layout) {
			var boardAppView = new BoardAppView();
			layout.setContent(boardAppView);
			boardAppView.render();
		});
	};
	
	/**
	 * 게시판 추가
	 */
	r.renderCreateBoard = function(deptId) {
		require(["board/views/layouts/defaults", "board/views/board_create"], function(DefaultLayout, BoardCreate) {
			DefaultLayout.render().done(function(layout) {
				var boardCreateView = new BoardCreate({deptId : deptId});
				layout.setContent(boardCreateView);
				boardCreateView.render();
			});
		});
	};
	
	/**
	 * 게시판 글쓰기
	 */
	r.renderPostWrite = function() {
		require(["board/views/layouts/defaults", "board/views/post_write"], function(DefaultLayout, PostWrite) {
			DefaultLayout.render().done(function(layout) {	
				var opt = {deptId:'',boardId:'',postId:''};	// TODO: PostWrite 뷰 리팩토링 후 삭제
				var postWriteView = new PostWrite(opt);
				layout.setContent(postWriteView);
				postWriteView.render(opt);
			});
		});
	};
	
	/**
	 * 부서게시판 관리 목록
	 */
	r.renderDeptBoard = function(deptId, status) {
		require(["board/views/layouts/defaults", "board/views/dept_board"], function(DefaultLayout, DeptBoardAdmin) {
			DefaultLayout.render().done(function(layout) {
				var deptBoardAdminView = new DeptBoardAdmin({ deptId : deptId, status: status });
				layout.setContent(deptBoardAdminView);
				deptBoardAdminView.render();
			});
		});
	};
	
	r.renderById = function(boardId, page) {
		require(["board/views/layouts/defaults", "board/views/post_home"], function(DefaultLayout, PostHomeView) {
			DefaultLayout.render().done(function(layout) {
				var content = layout.getContentElement();
				var postHomeView = new PostHomeView({
					boardId : boardId,
					page : page
				});
				content.html(postHomeView.el);
				postHomeView.render();
			});
		});
	};
	
	r.renderByIdFavorite = function(boardId, isFavorite) {
		require(["board/views/layouts/defaults", "board/views/post_home"], function(DefaultLayout, PostHomeView) {
			DefaultLayout.render().done(function(layout) {
				var content = layout.getContentElement();
				var postHomeView = new PostHomeView({
					boardId : boardId
				});
				content.html(postHomeView.el);
				postHomeView.render({ boardId : boardId });
			});
		});
	};
	
	r.renderByPostId = function(boardId, postId) {
		require(["board/views/layouts/defaults", "board/views/post_home"], function(DefaultLayout, PostHomeView) {
			DefaultLayout.render().done(function(layout) {
				var content = layout.getContentElement();
				var postHomeView = new PostHomeView({
					boardId : boardId,
					postId : postId
				});
				content.html(postHomeView.el);
				postHomeView.render();
			});
		});
	};

	r.renderPopupByPostId = function(boardId, postId){
		require([
			"board/views/layouts/defaults",
			"components/print/views/popup_print",
			"board/views/post_home"
		], function(DefaultLayout, PopupPrintView, PostHomeView) {


			var layout = DefaultLayout.getInstance({
				isPopup : true
			});
			layout.initPrintPopMarkup();
			layout.contentView = new PopupPrintView({
			});
			layout.contentView.render();

			var postHomeView = new PostHomeView({
				boardId : boardId,
				postId : postId
			});

			var postHomeViewBody = postHomeView.popupRender();
			layout.contentView.setPrintContents(postHomeViewBody);

		});

	};
	
	r.renderStreamByPostId = function(boardId, postId) {
		require(["board/views/layouts/defaults", "board/views/post_stream_detail"], function(DefaultLayout, PostView) {
			DefaultLayout.render().done(function(layout) {
				var content = layout.getContentElement();
				PostView.render({ boardId : boardId, postId : postId});
				content.append(PostView.el);
			});
		});
	};
	
	r.renderModifyBoard = function(boardId) {
		require(["board/views/layouts/defaults", "board/views/board_create"], function(DefaultLayout, BoardCreate) {
			DefaultLayout.render().done(function(layout) {
				var content = layout.getContentElement();
				var view = new BoardCreate({boardId : boardId})
				content.html(view.el);
				view.render();
			});
		});
	};
	
	r.renderCloseDeptBoard = function() {
	    require(["board/views/layouts/defaults", "board/views/close_dept_board"], function(DefaultLayout, ClosedDeptBoard) {
	        DefaultLayout.render().done(function(layout) {
	            var content = layout.getContentElement(),
	                closedDeptBoard = new ClosedDeptBoard();
	            
	            content.append(closedDeptBoard.render().el);
	        });
	    });
	};
	
	r.renderCloseCompanyBoard = function() {
	    require(["board/views/layouts/defaults", "board/views/close_company_board"], function(DefaultLayout, ClosedCompanyBoard) {
	        DefaultLayout.render().done(function(layout) {
	            var content = layout.getContentElement(),
	            closedCompanyBoard = new ClosedCompanyBoard();
	            
	            content.append(closedCompanyBoard.render().el);
	        });
	    });
	};
	
	r.renderDeptLowRank = function() {
		require(["board/views/layouts/defaults", "board/views/dept_lowrank"], function(DefaultLayout, DeptLowRank) {
			DefaultLayout.render().done(function(layout) {
				var content = layout.getContentElement();
				DeptLowRank.render();
				content.append(DeptLowRank.el);
			});
		});
	};
	
	/**
	 * 게시판 글쓰기(게시판 ID, 보드 ID, 글 ID가 포함될 경우 처리)
	 */
	r.renderPostWriteParam = function(deptId,boardId,postId){
		require(["board/views/layouts/defaults", "board/views/post_write"], function(DefaultLayout, PostWrite) {
			DefaultLayout.render().done(function(layout) {
				var opt = {deptId:deptId,boardId:boardId,postId:postId};	// TODO: PostWrite 뷰 리팩토링 후 삭제
				var postWriteView;
				if(postId){
					opt.type = 'reply';
				}
				
				postWriteView = new PostWrite(opt);
				layout.setContent(postWriteView);
				postWriteView.render(opt);
			});
		});
	};
	
	/**
	 * 게시판 글수정
	 */
	r.renderEditWriteParam = function(deptId,boardId,postId){
		require(["board/views/layouts/defaults", "board/views/post_write"], function(DefaultLayout, PostWrite) {
			DefaultLayout.render().done(function(layout) {
				var opt = {deptId:deptId,boardId:boardId,postId:postId,type:'edit'};
				var postWriteView = new PostWrite(opt);
				layout.setContent(postWriteView);
				postWriteView.render(opt);
			});
		});
	};
	
	r.renderPostResult = function(){
		require(["board/views/layouts/defaults", "board/views/post_result"], function(DefaultLayout, PostResult) {
			DefaultLayout.render().done(function(layout) {
				var content = layout.getContentElement();
				PostResult.render({
					isCommunity : false
				});
				content.append(PostResult.el);
			});
		});
	};
	
	return r;
});
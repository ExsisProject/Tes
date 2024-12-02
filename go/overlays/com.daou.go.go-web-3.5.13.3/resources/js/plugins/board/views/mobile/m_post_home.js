// 게시판 글 목록 HOME
;(function() {
	define([
	    // libraries...
	    "jquery",
	    "backbone",
	    "app",
	    "board/models/board_config",
	    "views/mobile/header_toolbar",
	    "board/views/mobile/m_post_detail",
		"board/views/mobile/m_post_stream",
		"board/views/mobile/m_post_bbs",
	    "i18n!board/nls/board",
	    "i18n!nls/commons",
	    "GO.util"
	],
	function(
		$,
		Backbone,
		GO,
		BoardConfig,
		HeaderToolbarView,
		PostBbsDetail,
		PostStream,
		PostBbs,
		boardLang,
		commonLang
	) {

		var instance = null,
			lang = {
				'post_write' : boardLang['글쓰기']
			};

		var PostHome = Backbone.View.extend({
			el : '#content',
			initialize: function(options) {
				this.options = options || {};
				this.headerToolbarView = HeaderToolbarView;
				this.boardId = this.options.boardId;
				this.postId = this.options.postId;
				this.model = BoardConfig.get(this.boardId);
			},
			render: function() {

				this.actions = this.model.get('actions');
				this.masterOwner = this._getMasterOwner();

				//this.renderBoardTitle();
				this.renderContents();
				return this.el;
			},
			renderBoardTitle : function() {
				var self = this;
				var	boardData = this.model.toJSON();
				var rightButton = this.model.isWritable() ? {
    				text : lang['post_write'],
    				callback : function() {
    					GO.util.appLoading(true);
    					var url = self._isCommunity() ? 'community' : 'board';
    					url += '/post/write/'+ self.masterOwner.ownerId+'/'+self.boardId;
    					GO.router.navigate(url, { trigger : true });
    				}
				} : false;

				var opt = {
					isPrev : this.postId > 0 ? true : false,
					isIscroll  :this.postId > 0 ? false : true,
					name : boardData.name,
					rightButton : rightButton
				};

				if(!this.postId){
					opt.refreshButton = {
						callback : function(){
							self.renderList();
						}
					};
				}

				this.titleToolbarView.render(opt);
			},
			_isCommunity : function() {
				return instance.masterOwner && instance.masterOwner.ownerType == 'Community';
			},
			_getMasterOwner : function() {
				var self = this,
					masterOwner = null;
				$.each(this.model.get('owners'), function(k,v) {
					if(v.ownerShip == 'MASTER') masterOwner = v;
				});
				return masterOwner;
			},
			renderList : function(isCommunity){
				if(this.model.isStreamType()) {
					// 스트림 타입 추가
					PostStream.render({
						boardId : this.boardId,
						writable : this.model.isWritable(),
						owner : this.masterOwner,
						isCommunity : isCommunity,
						boardModel : this.model.toJSON()
					});
				} else {
					PostBbs.render({
						writable : this.model.isWritable(),
						manageable : this.actions.managable,
						boardId : this.boardId,
						status : this.model.get('status'),
						owner : this.masterOwner,
						isCommunity : isCommunity,
						communityId : this.options.communityId,
						boardModel : this.model.toJSON()
					});
				}
			},
			renderContents: function() {
				var isCommunity = this._isCommunity();/*,
					PostBbsDetail = null,
					PostBbs = null,
					PostStream = null;*/

				if(this.postId) {
					PostBbsDetail.render({
						boardId : this.boardId,
						postId : this.postId,
						owner : this.masterOwner ,
						isCommunity : isCommunity,
						boardType : this.model.get('type'),
						commentFlag : this.model.get('commentFlag'),
						actions : this.actions
					});
				} else {
					this.renderList(isCommunity);
				}
			}
		});

		return {
			render: function(opt) {
				if(!instance) {
					instance = new PostHome({boardId: opt.boardId, postId : opt.postId});
				} else {
					instance.boardId = opt.boardId;
					instance.postId = opt.postId;
					if(instance.model.get('id') != instance.boardId) instance.model = BoardConfig.get(instance.boardId);
				}
				return instance.render();
			}
		};
	});

}).call(this);
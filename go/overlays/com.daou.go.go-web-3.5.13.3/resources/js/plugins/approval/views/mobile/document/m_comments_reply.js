// 클래식형 게시판 글목록
(function() {
	define([
	    "jquery",
	    "backbone", 	
	    "app",	    
	    "approval/models/comment_reply",
	    "hgn!approval/templates/mobile/document/m_comment_reply",
	    "hgn!approval/templates/mobile/document/m_comment_unit",
	    "i18n!board/nls/board",
	    "i18n!nls/commons"
	], 
	function(
		$,
		Backbone,
		App,
		CommentReplyModel,
		tplCommentReply,
		tplCommentUnit,
		boardLang,
		commonLang
	) {
		var instance = null;
		var PostCommentReply = Backbone.View.extend({
			initialize: function(options) {
				this.options = options || {};
				var self = this;
				this.el = this.options.el;
				this.docId = this.options.docId;
				this.commentId = this.options.commentId;
				this.thread = this.options.thread;
				this.collection = this.options.collection; // Comment List (post_bbs_comment.js) 
				this.model = CommentReplyModel.get({ docId : this.docId, commentId : this.commentId, thread : this.thread  });
			},
			unbindEvent : function() {
				this.$el.off('vclick', '.comment_reply_save');
				this.$el.off('vclick', '.comment_reply_cancel');
				this.$el.off('keyup', 'div.ipt_wrap textarea');
			},
			bindEvent : function() {
				this.$el.on('vclick', '.comment_reply_save', $.proxy(this.saveReply, this));
				this.$el.on('vclick', '.comment_reply_cancel', $.proxy(this.cancelReply, this));
				this.$el.on('keyup', 'div.ipt_wrap textarea', $.proxy(this.expandTextarea, this));
			},
			expandTextarea : function(e){
				GO.util.textAreaExpand(e);
			},
			render: function() {
				var writer = GO.session();
				
				this.$el.html(tplCommentReply({
					'writer' : writer,
					'comment_save' : boardLang['댓글 작성'],
					'comment_cancel' : commonLang['취소'],
					'comment_placeholder' : boardLang['댓글을 입력해주세요.']
				})).find('textarea').focus();
				
				this.unbindEvent();
				this.bindEvent();
			},
			saveReply : function() {
				var self = this,
					messageEl = this.$el.find('textarea');
				if(messageEl.val()) {
					this.$el.hide();
					this.model.save({message : messageEl.val()}, {
						success : function(model, rs) {
							var focusEl = null;
							self.collection.fetch({ data:{offset : '1000'}, async : false ,reset:true});
							focusEl = $('li[data-id="'+model.id+'"]');
							if(focusEl.length) {
								focusEl.fadeOut(100, function() {
									focusEl.fadeIn(500);
								});
							}
						}
					});
				} else {
					messageEl.focus();
				}
			},
			cancelReply : function(e) {
				this.$el.remove();
				e.preventDefault();
				return false;
			}
		});
		
		return {
			render: function(opt) {
				instance = new PostCommentReply(opt);
				return instance.render();
			},
			close : function(el) {
				return instance.cancelReply();
			}
		};
	});
}).call(this);
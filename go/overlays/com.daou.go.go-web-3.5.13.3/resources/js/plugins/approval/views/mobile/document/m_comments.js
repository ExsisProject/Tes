// 모바일 - 댓글 목록
;(function() {
	define([
	    'jquery', 
	    'backbone', 
	    'app',	    
   //     "approval/views/mobile/document/m_comment_item", TODO 이거 지울지 말지 고민
	    'approval/collections/comments',
	    "approval/models/comment",
        "approval/views/mobile/document/m_attach_file",
	    "approval/views/mobile/document/m_comments_reply",
        'hgn!approval/templates/mobile/document/m_comment_create',
	    "hgn!approval/templates/mobile/document/m_comment_modify",
        'hgn!approval/templates/mobile/document/m_comment_reply_item',
    	"i18n!nls/commons",
	    'i18n!board/nls/board',
        "i18n!approval/nls/approval", 
        'GO.util',
        "jquery.go-validation"
	], 
	function(
		$,
		Backbone,
		GO,
     //   CommontItemView,
        CommentCollection,
        CommentModel,
    	AttachFileView,
		CommentReplyView,
        CommentsTpl,
		CommentsModify,
        CommentReplyItemTmpl,
        commonLang,
		boardLang,
        approvalLang
	) {
        var lang = {
    			'reply' : boardLang['댓글'],
    			'save' : commonLang['저장'],
    			'cancel' : commonLang['취소'],
    			'modify' : commonLang['수정'],
    			'delete' : commonLang['삭제'],
    			'comment_delete_msg' : boardLang['댓글을 삭제 하시겠습니까?'],
    			'comment_has_reply' : boardLang['댓글이 등록된 글은 삭제할 수 없습니다.'],
    			'alert_length' : boardLang['0자이상 0이하 입력해야합니다.'],
    			'comment_save' : boardLang['댓글 작성'],
    			'comment_focus' : boardLang['댓글 쓰기'],
    			'comment_modify' : boardLang['댓글 수정'],
    			'comment_placeholder' : boardLang['댓글을 입력해주세요.']
            };
		
		var PostComments = Backbone.View.extend({
			initialize: function(options) {
				this.options = options || {};
				var self = this;
				this.docId = this.options.docId;
				this.options = {
						docId : this.docId
				};
				this.commentModel = new CommentModel(); //수정&삭제
				
				this.CommentCollection = CommentCollection.getCollection(this.options); //댓글 목록
				this.CommentCollection.on("reset", function() {
					self.dataset = self.CommentCollection.toJSON();
					self.render();
				}, this);

				this.dataset = this.CommentCollection.toJSON();

			},
			unbindEvent : function() {
				this.$el.off('vclick', 'a.comment_delete');
				this.$el.off('vclick', 'a#btnPostComment');
				this.$el.off('vclick', 'a.comment_modify');
				this.$el.off('vclick', 'a.comment_reply');
				this.$el.off('vclick', 'a.comment_modify_cancel');
				this.$el.off('vclick', 'a.comment_modify_save');
				this.$el.off('keydown', '#formPostComment');
				this.$el.off('keydown', 'span.textarea_edit textarea');
			},
			bindEvent : function() {
				this.$el.on('vclick', 'a.comment_delete', $.proxy(this.actionDeleteComment, this));
				this.$el.on('vclick', 'a#btnPostComment', $.proxy(this.actionPostComment, this));
				this.$el.on('vclick', 'a.comment_modify', $.proxy(this.addModifyForm, this));
				this.$el.on('vclick', 'a.comment_reply', $.proxy(this.addCommentReplyForm, this));
				this.$el.on('vclick', 'a.comment_modify_cancel', $.proxy(this.removeModifyForm, this));
				this.$el.on('vclick', 'a.comment_modify_save', $.proxy(this.actionModifyComment, this));
				this.$el.on('keydown', '#formPostComment', $.proxy(this.expandTextarea, this));
				this.$el.on('keydown', 'span.textarea_edit textarea', $.proxy(this.expandTextarea, this));
			},
			setShowReplayButton : function(sizeParam){
			    var LIMIT_REPLAY_SIZE = 5,
			        replayButton = $("#writeReplay");
			        size = sizeParam || $("section.article_reply li:not(.creat)").length
			    
                if(size >= LIMIT_REPLAY_SIZE){
                    replayButton.parents('div.optional').show();
                }else if(size < LIMIT_REPLAY_SIZE){
                    replayButton.parents('div.optional').hide();
                }
			},
			render: function() {
				var self = this;
				var commentsTpl = CommentsTpl({
					lang : lang,
					dataset : this.dataset,
					depth : function() {
						return this.id == this.thread ? 1 : 2;
					},
					commentReply : function() {
						return this.id == this.thread ? true : false; // TODO 이게 뭔지 false ? true?
					},
					dateformat : function() {
						return GO.util.basicDate(this.createdAt);
					},
					// 댓글 수정, 삭제 권한
					isWritable : function(){
						return this.writer.id === GO.session("id") ? true : false
					},
					
					parseMessage : function(){
						return GO.util.escapeHtml(this.message);
					},
					postAttachFiles : function() {
						if(this.attaches){
							return AttachFileView.render({
								docId : this.docId,
								attaches : this.attaches
							});
						}
					}
				});
				this.$el.html(commentsTpl);
				
				this.unbindEvent();
				this.bindEvent();
				this.setShowReplayButton();
				this.renderCommentCount();
				AttachFileView.initImageView(this.$el);
			},
			expandTextarea : function(e){
				GO.util.textAreaExpand(e);
			},

			renderCommentCount : function() {
				this.trigger('renderCommentCount');
				
			},
			addModifyForm : function(e) {
				var self = this;
				var commentEl = $(e.currentTarget).parents('li');
				var model = this.CommentCollection.get(commentEl.attr('data-id'));
				
				if(e) {
					e.preventDefault();
					e.stopPropagation();
				}
				
				commentEl.find('div.btn_wrap').hide();
				commentEl.find('p.subject').hide().after(CommentsModify({
/*					isAttaches : model.get('attaches').length ? true : false,
					hasFiles : files.length ? true : false,
					hasImages : images.length ? true : false,
					contextRoot : GO.contextRoot, 
					files : files,
					writer : model.get('writer'),
					images : images,		*/
					docId : this.docId,
					commentId : model.get('thread'),
					id : model.get('id'),
					message : GO.util.unescapeHtml(model.get('message')),
					lang : lang
				}));
				commentEl.find('textarea').focus();

				return false;
			},
			removeModifyForm : function(e, commentId) {
				var commentEl = {};
				if(commentId) {
					commentEl = $('li[data-id="'+commentId+'"]');
				} else {
					commentEl = $(e.currentTarget).parents('li');
				}
				commentEl.find('p.edit_mode, div.btn_wrap.edit, div.ipt_wrap').remove();
				commentEl.find('div.btn_wrap, p.subject').attr('style', '');
				return false;
			},
			addCommentReplyForm : function(e) {
				var commentEl = $(e.currentTarget).parents('li'),
					commentReplyId =  ['reply', this.docId, commentEl.attr('data-id')].join('_'),
					commentLastEl = this.$el.find('li[data-thread="'+commentEl.attr('data-id')+'"]:last'),
					hasReplyForm = this.$el.has('#'+commentReplyId).length;
				
				if(!hasReplyForm) {
					//댓글에 댓글 폼 추가					
					commentLastEl.after('<li id="' + commentReplyId + '" class="depth2" />');
					CommentReplyView.render({ 
						docId : this.docId, 
						commentId : commentEl.attr('data-id'), 
						thread : commentEl.attr('data-id'), 
						el : '#'+commentReplyId, 
						lang : lang,
						collection : this.CommentCollection 
					});
				
				} else {
					this.$el.find('#'+commentReplyId + ' textarea').focus();
				}
				return false;
			},
			actionModifyComment : function(e) {
				var self = this,
					commentEl = $(e.currentTarget).parents('li'),
					messageForm = commentEl.find('textarea'),
					messageVal = messageForm.val();
					docId = $(e.currentTarget).attr("data-docid"),
					commentId = $(e.currentTarget).attr("data-commentid"),
					thread = commentEl.attr("data-thread"),
					data = {};
				
				if(!messageVal) {
					messageForm.focus();
					return false;
				}
				
				data = {
					message: messageVal
				};
				
				
				var attaches = [];
				var attachOpt;
				var attachPart = commentEl.find('li');
				attachPart.each(function(){
					attachOpt = {};
					if($(this).attr("data-tmpname")){
						attachOpt.path = $(this).attr("data-tmpname"); 
					}
					if($(this).attr("data-name")){
						attachOpt.name = $(this).attr("data-name");
					}
					if($(this).attr("data-id")){
						attachOpt.id = $(this).attr("data-id");
					}
					if($(this).attr("data-hostid")){
						attachOpt.hostId = $(this).attr("data-hostid");
					}
					attaches.push(attachOpt);					
				});

				if(attaches.length > 0){
					data.attaches = attaches;
				}
				
				this.commentModel.clear();
				this.commentModel.set({ docId : this.docId , id : commentEl.attr('data-id'), thread : thread}, { silent : true });
				this.commentModel.save(data, {
					success : function(model, rs) {
						commentEl.find('.ipt_wrap').remove();
						self.CommentCollection.get(model.id).set('message', model.get('message'));
						commentEl.find('p.subject span.txt').html(GO.util.escapeHtml(model.get('message'))).fadeOut(500, function() {
							$(this).fadeIn(500);
						});
						self.removeModifyForm('', model.id);
						GO.util.iscrollRefresh();
					} 
				});
				return false;
			},
			actionDeleteComment : function(e) {
				var self = this,
					commentEl = $(e.currentTarget).parents('li'),
					commentId = commentEl.attr('data-id'),
					commentData = this.CommentCollection.get(commentId).toJSON();
				
				if(!commentId) return false;
				if(commentData.replyCount > 0) {
					alert(lang['comment_has_reply']);
				} else {
					if(confirm(lang['comment_delete_msg'])) {
						console.log(self.CommentCollection.length)
						this.commentModel.set({ docId : this.docId , commentId : commentId }, { silent : true });
						this.commentModel.save({}, {
							type : 'DELETE',
							success : function(model, rs) {
								if(rs.code == 200) {
									self.$el.find('li[data-id="'+commentId+'"]').fadeOut(500, function() {
										$(this).remove();
										self.CommentCollection.removeById(commentId);
										self.renderCommentCount();
										self.setShowReplayButton();
										GO.util.iscrollRefresh();
									});
								}
							}
						});
					}
				}
				return false;
			},
			actionPostComment : function(e) {
				var self = this, 
					messageForm = this.$el.find('#formPostComment'),
					messageFormValue = messageForm.val();

				
				if(!$.goValidation.isCheckLength(2,1000,$.trim(messageFormValue)) || messageFormValue == lang.comment_placeholder){
					alert(GO.i18n(lang['alert_length'], {"arg1":"2","arg2":"1000"}));
					return;
				}
				
				
				$(e.currentTarget).hide();
				this.commentModel.clear();
				this.commentModel.set({docId : this.docId}, {silent : true});
				this.commentModel.save({message : messageFormValue/*, attaches : attaches*/}, {
					success : function(model, rs) {
						self.CommentCollection.fetch({ data:{offset : '1000'}, async : false ,reset:true});
						self.setShowReplayButton();
						GO.util.iscrollRefresh();
					}
				});
				e.stopPropagation();
			},
		},{
	        __instance__: null,
	        create: function() {
	        	this.__instance__ = new this.prototype.constructor({el: $('#content')});// if(this.__instance__ === null) 
	        	return this.__instance__;
	        },
	        render: function() {
	            var instance = this.create(),
	                args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];
	                
	            return this.prototype.render.apply(instance, args);
	        }            
		});	
		
		return PostComments;
	});
}).call(this);
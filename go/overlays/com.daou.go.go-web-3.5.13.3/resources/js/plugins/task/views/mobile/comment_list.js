;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        "hgn!task/templates/mobile/comment_list",
	        "task/models/task_activity",
	        "m_comment",
	        "views/mobile/title_toolbar"
	], 
	function(
			Backbone,
			Hogan,
			App,
			
			commonLang,
			taskLang,
			CommentListTpl,
			TaskActivity,
			CommentView,
			TitleToolbarView
	) {
		var lang = {
			"report" : taskLang["보고"],
			"edit" : taskLang["수정"],
			"delete" : taskLang["삭제"],
			"attach" : taskLang["파일 첨부"],
			"save" : taskLang["저장"],
			"cancel" : taskLang["취소"],
			"count" : taskLang["개"],
			"comment" : taskLang["댓글"],
			"showAll" : taskLang["모두 보기"] 
		};

		
		var CommentList = Backbone.View.extend({
			el : "#content",
			
			
			initialize : function() {
				this.activity = new TaskActivity(this.options);
			},
			
			
			dataFetch : function() {
				return this.activity.fetch();
			},
			
			
			render : function() {
				TitleToolbarView.render({
			        name : commonLang["댓글"], 
			        isIscroll : false,
			        isPrev : true
			    });
				
				this.$el.html(CommentListTpl({
					lang : lang,
					activity : this.activity.toJSON(),
					createdAt : this.activity.createdAt(),
					content : this.activity.mobileContent(),
					hasMobileContent : this.activity.hasMobileContent()
				}));
				
	            CommentView.create({
	                el : "#comment_list",
	                type : "task/activity",
	                typeId : this.activity.id,
	                isReply : false
	            });
				
				GO.EventEmitter.on("common", "change:comment", function(count) {
					this.$("#commentCount").text("(" + count + ")");
				}, this);
				
				return this;
			}
		});
		return CommentList;
	});
}).call(this);
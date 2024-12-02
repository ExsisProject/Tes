;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        "hgn!task/templates/mobile/task_activity_item",
	        "views/mobile/m_font_resize",
	        "attach_file", 
	], 
	function(
			Backbone,
			Hogan,
			App,
			
			commonLang,
			taskLang,
			TaskActivityItemTmpl,
			FontResize,
			AttachFilesView
	) {
		var lang = {
			"report" : taskLang["보고"],
			"edit" : commonLang["수정"],
			"delete" : commonLang["삭제"],
			"attach" : commonLang["파일 첨부"],
			"save" : commonLang["저장"],
			"cancel" : commonLang["취소"],
			"count" : taskLang["개"],
			"comment" : commonLang["댓글"],
			"showAll" : taskLang["모두 보기"] 
		};

		
		var TaskActivityItem = Backbone.View.extend({

			events : {
				"swipeleft #activityItemWrapper" : "seeNext",
				"swiperight #activityItemWrapper" : "seePrevious",
				"vclick #deleteActivityBtn" : "destroyConfirm",
				"vclick #editActivityBtn" : "editActivity",
				"vclick #goCommentList" : "goCommentList"
			},

			initialize : function(data) {
				this.activity = data.model;
				this.taskId = data.taskId;
				this.originalScale = 1;
				this.editorId = "activityEditor" + this.activity.get("id");
			},

			render : function() {
				this.$el.html(TaskActivityItemTmpl({
					content: GO.util.escapeXssFromHtml(this.activity.get('content')),
					lang : lang,
					data : this.activity.toJSON(),
					snsDate : GO.util.snsDate(this.activity.get("updatedAt") ? this.activity.get("updatedAt") : this.activity.get("createdAt")),
					commentPresent : this.activity.commentPresent()
				}));
				$("#content").css('visibility', 'hidden');
				$("#doc_header").css('visibility', 'visible');
				this.renderAttachView();
				this.resizeContent();
				return this;
			},

			renderAttachView : function() {
				var self = this;
				this.attachView = AttachFilesView.create('#attachArea' + this.activity.id, this.activity.get("attaches"), function(item) {
                    return GO.config("contextRoot") + "api/task/activity/" + self.activity.id + "/download/" + item.id;
                });
			},

			resizeContent : function(){
				var self = this;
				setTimeout(function(){
					self.iscroll = GO.util.initDetailiScroll("activityItemWrapper","iScrollContentWrap","activityContentWrapper");
					self.originalScale = self.iscroll.options.zoomMin;
					self.fontResizeLayerAdd();
				},500);
			},

			fontResizeLayerAdd : function() {
				FontResize.render({
					el : "#fontResizeWrap",
					targetContentEl : "#activityContent"
				});
			},

			editActivity : function() {
				if (/<.*>.*<\/.*>/.test(this.model.get('content'))) {
					alert(taskLang["PC에서 등록한 업무는 모바일에서 수정할 수 없습니다."]);
					return;
				}
				App.router.navigate("task/" + this.taskId + "/activity/" + this.activity.id, true);
			},

			destroyConfirm : function() {
				if (confirm(commonLang["삭제하시겠습니까?"])) this.destroyActivity();
			},
			
			destroyActivity : function() {
				var self = this;
				this.activity.destroy({
					success : function(e) {
						alert(commonLang["삭제되었습니다."]);
						App.router.navigate("task/" + self.taskId + "/activities" , true);
					},
					error : function() {
						console.log("error");
					}
				});
			},

			isPageMovable: function() {
				var transformStr = $("#iScrollContentWrap").css('transform');
				var currentScale = transformStr.replace("matrix(",'').split(',')[0];
				return Number(currentScale).toFixed(6) == this.originalScale.toFixed(6);
			},

			seeNext: function(e) {
				if($("#rightBtn").length > 0 && this.isPageMovable()) {
					$("#rightBtn").trigger('click');
				}
			},

			seePrevious: function(e) {
				if($("#leftBtn").length > 0 && this.isPageMovable()) {
					$("#leftBtn").trigger('click');
				}
			},

			goCommentList : function() {
				App.router.navigate("task/" + this.taskId + "/activity/" + this.activity.id + "/comment", true);
			}
		});
		return TaskActivityItem;
	});
}).call(this);
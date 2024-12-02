;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        "hgn!task/templates/task_activity_item",
	        "comment",
	        "views/profile_card",
	        "attach_file",
	        
	        "file_upload",
	        "content_viewer",
	        "go-webeditor/jquery.go-webeditor",
	        'go-fancybox'
	], 
	function(
			Backbone,
			Hogan,
			App,
			
			commonLang,
			taskLang,
			TaskActivityItemTmpl,
			CommentView,
			ProfileView,
			AttachView,
			
			FileUpload,
			ContentViewer
	) {
		var lang = {
			"commentWrite" : taskLang["댓글쓰기"],
			"edit" : commonLang["수정"],
			"attach" : commonLang["파일 첨부"],
			"save" : commonLang["저장"],
			"cancel" : commonLang["취소"],
			"count" : taskLang["개"],
			"comment" : commonLang["댓글"],
			"showAll" : taskLang["모두 보기"],
			"fold" : commonLang["접기"]
		};
		
		
		var TaskActivityItem = Backbone.View.extend({
			tagName : "li",
			
			
			events : {
				"click span.ic_del" : "attachDelete",
				"click #editActivity" : "showEditForm",
				"click #closeEditorBnt" : "closeEditForm",
				"click #deleteActivity" : "confirmDelete",
				"click #editActivityBtn" : "submitActivity",
				"click #showAllComment" : "showAllComment",
				"click #foldComment" : "foldComment",
				//"click #toggleComment" : "toggleComment",
				"click a[data-tag=profile]" : "showProfileCard",
				"click span[data-tag=profile]" : "showProfileCard"
			},
			
			
			initialize : function(data) {
				this.activity = data.model;
				this.taskId = data.taskId;
				this.dept = data.dept;
				this.isPrint = data.isPrint;
				this.editorId = "activityEditor" + this.activity.get("id");
			},
			
			
			render : function() {
				this.$el.html(TaskActivityItemTmpl({
					lang : lang,
					data : this.activity.toJSON(),
					snsDate : {
						date : GO.util.snsDate(this.activity.modifyTime()),
						modifyFlag : this.activity.isModify()
					},
					dept : this.dept,
					commentCount : this.activity.get("commentCount"),
					commentPresent : this.activity.commentPresent(),
					isDisplayComment : !this.isPrint || this.activity.commentPresent(),
					hasMoreComment : !this.isPrint && this.activity.hasMoreComment(),
					isPrint : this.isPrint,
					content : this.activity.get("content")
				}));
				
				if (!this.isPrint) {
					this.renderContentViewer();
				} else {
					this.contentEl = this.$el.find("#activityContent").find("span");
					this.contentEl.html(this.activity.get("content"));
				}
				
				this.renderAttaches(true);
				
				this.commentView = CommentView.init({
					el : this.$el.find("#taskReply"),
					typeUrl : "task/activity",
					typeId :  this.activity.get("id"),
					isPrintMode : this.isPrint,
					rootId : this.typeId,
					rootUrl : "task/activity",
					isReply : false,
					isWritable : !this.dept.deletedDept
				});
				this.commentView.render();
				this.commentView.setComments(this.model.get("comments"));
				this.commentView.renderList();
				
				if (this.isPrint) this.commentView.fetchComments();
				
				var self = this;
				this.$el.on("comment:change", function(e, type, count){
					var hasFoldComment = count > 3;
					self.$("#foldComment").toggle(hasFoldComment);
					self.$("#showAllComment").hide();
					self.$("span.num").text(count);
                });
				
				this.$("#activityContent").css("overflow-x", "auto");
				
				return this;
			},
			
			
			renderContentViewer : function() {
				this.contentViewer = ContentViewer.init({
					$el : this.$("#activityContent"),
					content : this.activity.get("content")
				});
			},
			
			
			showAllComment : function() {
				if (this.commentView.isAll) {
					this.$("#taskReply").find("li").show();
					this.$("#foldComment").show();
					this.$("#showAllComment").hide();
				} else {
					var self = this;
					this.commentView.fetchComments(true).done(function(collection) {
						if (collection.data.length > 3) self.$("#foldComment").show();
						self.$el.find("#showAllComment").hide();
						self.commentView.isAll = true;
					});
				}
			},
			
			
			foldComment : function() {
				var count = this.commentView.collection.length - 3;
				this.$("#taskReply").find("li:lt(" + count + ")").hide();
				this.$("#foldComment").hide();
				this.$("#showAllComment").show();
			},
			
			
			attachExtetionFilter : function(extention) {
				return GO.util.fileExtentionCheck(extention) ? extention : "def";
			},
			
			
			attachDelete : function(e) {
				$(e.target).parents("li[data-name]").hide();
			},
			
			
			renderAttaches : function(isViewMode) {
				var self = this;
				var elId = (isViewMode ? "viewModeAttachArea" : "editModeAttachArea") + this.activity.id;
				var attachView = null;
				
				if (isViewMode) {
					attachView = AttachView.create(elId, this.activity.get("attaches"), function(attach) {
						return GO.contextRoot + "api/task/activity/" + self.activity.id + "/download/" + attach.id;
					});
				} else {
					attachView = AttachView.create(elId, this.activity.get("attaches"), null, "edit");
				}
				
				attachView.done(function(view) {
					self.$("#" + elId).replaceWith(view.el);
					
					view.$el.addClass(isViewMode ? "feed origin" : "");
					view.$el.attr({
						id : elId,
						"data-type" : isViewMode ? "view" : ""
					});
				});
			},
			
			
			showEditForm : function() {
				var content = this.contentViewer.getContent();
				
				if (!this.editor) {
					this.initSmartEditor(content);
					this.initFileUpload();
				} else {
					this.editor.getInstance(this.editorId).setContent(content);
				}
				
				this.$el.find("div[data-type=edit]").show();
				this.$el.find("div[data-type=view]").hide();
				this.renderAttaches(false);
				this.contentViewer.hide();
			},
			
			
			closeEditForm : function() {
				this.$el.find("div[data-type=edit]").hide();
				this.$el.find("div[data-type=view]").show();
				this.$el.find("div.tool_bar").css("display", "");
				this.contentViewer.show();
				this.editor.getInstance(this.editorId).setContent(" ");
				this.$el.find("#editModeFileWrap").find("li:hidden").show();
				this.renderAttaches(true);
			},
			
			
			submitActivity : function() {
				if (!GO.Editor.getInstance(this.editorId).validate()) {
            		$.goError(commonLang['마임 사이즈 초과']);
            		return false;
            	}
				
				var self = this;
				var attachCount = this.activity.get("attaches").length;
				var content = this.getContent();
				this.activity.set({
					content : content,
					attaches : this.getAttaches()
				});
				this.activity.setTaskId(this.taskId);
				this.activity.save({}, {
					success : function(model) {
						self.$el.trigger("change:log");
						self.trigger("change:attach", model.get("attaches").length - attachCount);
						self.contentViewer.setContent(model.get("content"));
						self.contentViewer.render();
						self.closeEditForm();
						self.renderAttaches(true);
					},
	    			error : function(model, resp) {
            			$.goError(resp.responseJSON.message);
            		}
				});
			},
			
			
			getContent : function() {
				var content = this.editor.getInstance(this.editorId).getContent();
				return (content == "" || $.trim(content) == "<br>") ? "" : content;
			},
			
			
			getAttaches : function() {
				var attaches = [];
				_.each(this.$el.find("#editModeAttachArea" +  + this.activity.id).find("li:not(.attachError)"), function(attach) {
					if ($(attach).is(":hidden")) {
						$(attach).remove();
						return;
					}
					attaches.push({
						id : $(attach).attr("data-id") || null,
						path : $(attach).attr("data-path"),
						name : $(attach).attr("data-name"),
						hostId : $(attach).attr("data-hostId")
					});
				}, this);
				return attaches;
			},
			
			
			confirmDelete : function() {
	    		var self = this;
	    		$.goPopup({
					title : taskLang["활동기록 삭제"],
					message : taskLang["활동기록 삭제 설명"],
					buttons : [{
						btype : "confirm",
						btext : commonLang["확인"],
						callback : function() {
							self.destroyActivity();
						}
					}, {
						btext : commonLang["취소"],
						callback : function() {
						}
					}]
				});
	    	},
			
			
			destroyActivity : function() {
				var self = this;
				var attachCount = this.activity.get("attaches").length;
				this.activity.destroy({
					success : function() {
						self.$el.trigger("change:log");
						self.trigger("change:attach", 0 - attachCount);
						self.trigger("change:activity", true);
						self.$el.remove();
					},
					error : function(model, resp) {
            			$.goError(resp.responseJSON.message);
            		}
				});
			},
			
			
			showProfileCard : function(e) {
				var userId = $(e.currentTarget).attr("data-userid");
				ProfileView.render(userId, e.currentTarget);
			},
			
			
			initSmartEditor : function(content){
				$("#" + this.editorId).goWebEditor({
					contextRoot : GO.config("contextRoot"),
					lang:GO.session('locale'),
					editorValue : content
				});
			
				this.editor = GO.Editor;
			},
			
			
			initFileUpload : function(options){
                var self = this,
                    options = {
                        el : "#file-control-activity-" + this.activity.id,
                        context_root : GO.contextRoot ,
                        button_text : "<span class='buttonText'>"+lang.attach+"</span>",
                        url : "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie')
                };
                
                (new FileUpload(options))
                .queue(function(e, data){
                    
                })
                .start(function(e, data){
                	if(!GO.config('attachFileUpload')){
                		$.goAlert(commonLang['파일첨부용량초과']);
                		return false;
                	}
                    if(GO.config('excludeExtension') != ""){
                        var test = $.inArray(data.type.substr(1).toLowerCase(),GO.config('excludeExtension').split(','));
                        if(test >= 0){
                            $.goMessage(App.i18n(commonLang['확장자가 땡땡인 것들은 첨부 할 수 없습니다.'], "arg1", GO.config('excludeExtension')));
                            return false;
                        }
                    }
                    
                    if(GO.config('attachSizeLimit')){
                        var size = data.size / 1024 / 1024;  //(MB)
                        var maxAttachSize = GO.config('maxAttachSize');
                        if(maxAttachSize < size){
                            $.goMessage(App.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                            return false;
                        }
                    }
                    
                    if(GO.config('attachNumberLimit')){
                        var currentAttachCnt = $('#editModeFileWrap').children().size();
                        var limitAttachCnt = GO.config('maxAttachNumber');
                        if(limitAttachCnt <= currentAttachCnt){     
                            $.goMessage(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", limitAttachCnt));
                            return false;
                        }
                    }
                })
                .progress(function(e, data){
                    
                })
                .success(function(e, resp, fileItemEl){
                	var isImage = GO.util.isImage(resp.data.fileExt);
                	var attachEl = self.$("#editModeAttachArea" + self.activity.id);
                	var area = isImage ? "ul.img_wrap" : "ul.file_wrap";
                	
                	if(GO.util.fileUploadErrorCheck(resp)){
                		fileItemEl.find(".item_file").append("<strong class='caution'>" + GO.util.serverMessage(resp) + "</strong>");
                		fileItemEl.addClass("attachError");
                	} else {
                        if(GO.util.isFileSizeZero(resp)) {
                        	$.goAlert(GO.util.serverMessage(resp));
                        	return false;
                        }
                	}
                	
                	fileItemEl.attr("data-hostId", resp.data.hostId);
                	
            		attachEl.find(area).show().append(fileItemEl);
                })
                .complete(function(e, data){
                    console.info(data);
                })
                .error(function(e, data){
                    console.info(data);
                });
            }
		});
		return TaskActivityItem;
	});
}).call(this);
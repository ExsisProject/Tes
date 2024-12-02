;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        "hgn!task/templates/task_activity",
	        "task/views/task_activity_item",
	        "task/collections/task_activities",
	        "task/models/task_activity",
	        
	        "file_upload",
	        "go-webeditor/jquery.go-webeditor",
	        "jquery.go-preloader",
            "go-fancybox"
	], 
	function(
			Backbone,
			Hogan,
			App,
			
			commonLang,
			taskLang,
			TaskActivityTmpl,
			TaskActivityItemView,
			TaskActivities,
			TaskActivity,
			
			FileUpload
	) {
		var lang = {
			"activity" : taskLang["활동기록"],
			"attach" : commonLang["첨부파일"],
			"writeActivity" : taskLang["활동기록 쓰기"],
			"addAttach" : commonLang["파일 첨부"],
			"regist" : commonLang["등록"],
			"cancel" : commonLang["취소"],
			"save" : commonLang["다운로드"],
			"preview" : commonLang["미리보기"]
		};
		
		
		var AttachItemTpl = Hogan.compile(
			'<li data-name="{{name}}" data-id="{{id}}">' +
				'<span class="item_file">' +
					'<span class="ic_file {{style}}"></span>' +
					'<span class="name">' + 
						'<a href="{{downloadPath}}">{{file.name}}</a>' +
					'</span>' +
					'<span class="size">({{fileSize}})</span>' +
					'{{#isPreviewable}}' +
					'{{#isImage}}' + 
					'<a href="{{downloadPath}}" class="fancybox-thumbs fancybox-button" data-fancybox-group="{{imageGroupId}}" data-bypass="" title="{{file.name}}">' +
						'<span class="btn_fn4">' + 
							'<span class="txt">{{lang.preview}}</span>' +
						'</span>' +
					'</a>' +
					'{{/isImage}}' + 
					'{{^isImage}}' +
					'<a class="btn-preview btn_fn4" data-id="{{file.encrypt}}" data-bypass="">' +
						'<span class="btn-text txt">{{lang.preview}}</span>' +
					'</a>' +
					'{{/isImage}}' + 
					'{{/isPreviewable}}' +
					'<a href="{{downloadPath}}">' +
					'<span class="btn_fn4">' +
					'<span class="txt">{{lang.save}}</span>' +
					'</span>' +
					'</a>' +
				'</span>' +
			'</li>'
		);
		
		
		var TaskActivityView = Backbone.View.extend({
			events : {
				"click #fileWrap span.ic_del" : "attachDelete",
				"click #writeActivity" : "writeActivity",
				"click #editorToggle" : "editorToggleListener",
				"click #closeEditor" : "editorToggleListener",
				"click li[data-tag=activityTab]" : "activityTabToggleAction",
				"click #attachArea a.btn-preview" : "preview"
			},
			
			
			initialize : function(data) {
				this.taskId = data.taskId;
				this.activities = new TaskActivities({taskId : this.taskId});
				this.dept = data.dept;
				this.isPrint = data.isPrint;
				this.isChangeAttach = true;
				
				var self = this;
				this.$el.on("change:attach", function(e, param) {
					self.isChangeAttach = true;
					self.changeAttachCount(param);
				});
			},
			
			
			dataFetch : function() {
				var deferred = $.Deferred();
				
				var fetchActivity = this.activities.fetch();

				$.when(fetchActivity).done(function() {
					deferred.resolve(this);
				}); 
				
				return deferred;
			},

			render : function() {
				this.$el.addClass("activity_type");
				this.$el.html(TaskActivityTmpl({
					lang : lang,
					fileCount : this.getAttachCount(this.activities.models),
					activityCount : this.activities.models.length,
					activityPresent : this.activities.models.length > 0,
					dept : this.dept,
					isPrint : this.isPrint
				}));
				
				if (this.activities.models.length == 0) {
 					this.initSmartEditor();
 				} else {
 					this.$("div[data-area=editor]").hide();
 				}
				this.initFileUpload();
				this.renderActivities();
				this.renderAttach();
//				this.bindAttachCount();
				
				this.allowAction = true;
				
				return this;
			},

            getAttachCount: function (collection) {
                var totalAttachCount = 0;
                _.each(collection, function (model) {
                    totalAttachCount += model.get("attaches").length;
                    var comments = model.get("comments");
                    _.each(comments, function (comment) {
                        totalAttachCount += comment.attaches.length;
                    });
                });
                return totalAttachCount;
            },

            fetchActivities : function() {
				var self = this;
				this.activities.fetch({
					success : function() {
						var activityCount = parseInt(self.$("#activityCount").text()) - 1;
						self.$("#activityCount").text(activityCount);
						if (!activityCount) {
							self.$("#activityCount").hide();
							self.toggleEditor(true);
						}
					}
				});
			},
			
			
			attachDelete : function(e) {;
				$(e.target).parents("li").remove();
			},
			
			
			getContent : function() {
				var content = GO.Editor.getInstance("editor").getContent();
				return (content == "" || $.trim(content) == "<br>") ? "" : content;
			},
			
			
			writeActivity : function() {
				if (!GO.Editor.getInstance("editor").validate()) {
            		$.goError(commonLang['마임 사이즈 초과']);
            		return false;
            	}
				
				var self = this;
				if (!this.allowAction) {
					return;
				}
				this.allowAction = false;
				
				var content = this.getContent();
				if (content == "") {
					this.allowAction = true;
					return; 
				}
				var taskActivity = new TaskActivity({taskId : this.taskId});
				taskActivity.set({
					content : content,
					attaches : this.getActivityAttaches(),
					writer : _.pick(GO.session(), "id", "name", "email", "position", "thumbnail")
				});
				taskActivity.save({}, {
					success : function(activity) {
						self.activities.fetch({
							success : function() {
								self.isChangeAttach = true;
								self.$el.trigger("change:log");
								self.renderActivity(activity);
							}
						});
						self.allowAction = true;
					},
	    			error : function(model, resp) {
            			$.goError(resp.responseJSON.message);
            			self.allowAction = true;
            		}
				});
			},
			
			
			renderActivity : function(activity) {
				var taskActivityItem = this.initActivityItem(activity); 
				var count = this.activities.length || 0;
				
				$("#activityList").prepend(taskActivityItem.el);
				taskActivityItem.render();
				
				$("#activityCount").show().text(count);
				$("#attachCount").text(parseInt($("#attachCount").text()) + activity.get("attaches").length);
				
				GO.Editor.getInstance("editor").setContent(" ");
				$("#fileWrap").find("li").remove();
				this.toggleEditor(false);
			},
			
			
			initActivityItem : function(activity) {
				var taskActivityItem =  new TaskActivityItemView({
					model : activity,
					taskId : this.taskId,
					dept : this.dept,
					isPrint : this.isPrint
				});

				var self = this;
				taskActivityItem.on("change:activity", function() {
					self.fetchActivities();
				});
				taskActivityItem.on("change:attach", function(param) {
					self.isChangeAttach = true;
					self.changeAttachCount(param);
				});
				
				return taskActivityItem;
			},
			
			
			editorToggleListener : function(param) {
				var display = typeof(param) == "object" ? GO.util.toBoolean($(param.currentTarget).attr("data-display")) : param;
				this.toggleEditor(display);
			},
			
			
			toggleEditor : function(display) {
				var editorArea = $("div[data-area=editor]");
				var editorToggleBtn = $("#editorToggle");
				
				if (!this.editor) this.initSmartEditor();
				if (display) {
					editorToggleBtn.hide();
					editorArea.show();
					var activityTab = $("li[data-type=activity]");
					this.toggleActivityTab(activityTab);
				} else {
					editorToggleBtn.show();
					editorArea.hide();
				}
			},
			
			
			activityTabToggleAction : function(e) {
				var target = $(e.currentTarget);
				this.toggleActivityTab(target);
			},
			
			
			toggleActivityTab : function(target) {
				var self = this;
				var type = target.attr("data-type");
				if (this.activityTab == type) return;
				this.activityTab = type;
				
				$("li[data-tag=activityTab]").removeClass("active");
				target.addClass("active");
				
				if (type == "activity") {
					if (!this.activities.length) {
						$("div[data-area=editor]").show();
						$("#editorToggle").hide();
					}
					$("#activityArea").show();
					$("#attachArea").hide();
				} else {
					$("div[data-area=editor]").hide();
					$("#editorToggle").show();
					$("#activityArea").hide();
					$("#attachArea").show();
					if (this.isChangeAttach) {
                        this.activities.fetch().done(function() {
							self.renderAttach();
						});
					} else {
						this.renderAttach();
					}
				}
			},

			renderAttach : function() {
                var attachElementList = [];
				this.$("#attachList").find("li").remove();

                _.each(this.activities.models, function (activity) {
                    this.addAttachElement(activity.attributes, attachElementList);
                    _.each(activity.get("comments"), function (comment) {
                        this.addAttachElement(comment, attachElementList);
                    }, this);
                }, this);

                this.sortCreatedAtDesc(attachElementList);

                _.each(attachElementList, function (attach) {
                    this.$("#attachList").append(AttachItemTpl.render(attach));
                }, this);

                $.proxy($('.fancybox-thumbs').goFancybox(), this);
			},

            addAttachElement: function(item, attachElementList) {
                var downloadUrl = item.commentCount >= 0 ? item.id : item.ownerId + '/comment/' + item.id;
                _.each(item.attaches, function (file) {
                    attachElementList.push({
                        lang: lang,
                        file: file,
                        fileSize: GO.util.getHumanizedFileSize(file.size),
                        style: GO.util.getFileIconStyle(file),
                        downloadPath: GO.contextRoot + "api/task/activity/" + downloadUrl + "/download/" + file.id,
                        imageGroupId: this.cid,
                        isPreviewable: file.preview && file.encrypt,
                        isImage: GO.util.isImage(file.extention)
                    });
                }, this);
            },

            sortCreatedAtDesc: function (attachElementList) {
                attachElementList.sort(function(attach, targetAttach){
                    return new Date(attach.file.createdAt) >= new Date(targetAttach.file.createdAt) ? -1 : 1;
                });
            },

			preview : function(e) {
				GO.util.preview($(e.currentTarget).attr("data-id"));
			},

			renderActivities : function() {
				_.each(this.activities.models, function(activity) {
					var taskActivityItem =  this.initActivityItem(activity);
					
					$("#activityList").append(taskActivityItem.el);
					taskActivityItem.render();
				}, this);
				return this;
			},
			
			
			getActivityAttaches : function() {
				var attaches = [];
				_.each($("#fileWrap").find("li:not(.attachError)"), function(attach) {
					attaches.push({
						path : $(attach).attr("data-path"),
						name : $(attach).attr("data-name"),
						hostId : $(attach).attr("data-hostId")
					});
				});
				return attaches;
			},
			

			changeAttachCount : function(count) {
				var attachArea = this.$el.find("#attachCount");
				var attacCount = parseInt(attachArea.text());
				attachArea.text(attacCount + count);
			},


			initSmartEditor : function(){
				if (this.isPrint) return;
				if (this.dept.deletedDept) return;
				
				this.$("#editor").goWebEditor({
					contextRoot: GO.config('contextRoot'),
					lang: GO.session('locale'),
					height: '300px'
				});
				this.editor = GO.Editor;
			},
			
			
			initFileUpload : function(options){
				if (this.dept.deletedDept) return;
				
                var self = this,
                    options = {
                        el : "#file-control",
                        context_root : GO.contextRoot ,
                        button_text : "<span class='buttonText'>"+lang.addAttach+"</span>",
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
                        var currentAttachCnt = $('#fileWrap').find("li").size();
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
                	var attachEl = self.$("#fileWrap");
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
		return TaskActivityView;
	});
}).call(this);